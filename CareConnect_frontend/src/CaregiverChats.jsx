import React, { useState, useEffect, useRef } from "react";
import api from "./api";
import MessagesPage from "./MessagesPage";

const CaregiverChats = () => {
  const [chats, setChats] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const loggedInUserId = parseInt(localStorage.getItem("userId"), 10);
  const API_BASE_URL = "https://careconnect-2-j2tv.onrender.com";
  // const API_BASE_URL = "http://localhost:8000";

  const wsRef = useRef(null);

  const fetchChats = async () => {
    try {
      const res = await api.get(`${API_BASE_URL}/api/messages/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      const allMessages = res.data.all_messages || [];

      const grouped = {};
      const userIds = new Set();

      allMessages.forEach((msg) => {
        const otherUserId = msg.sender === loggedInUserId ? msg.receiver : msg.sender;
        userIds.add(otherUserId);

        if (!grouped[otherUserId]) grouped[otherUserId] = [];
        grouped[otherUserId].push(msg);
      });

      for (const id in grouped) {
        grouped[id].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      const sortedChats = Object.entries(grouped)
        .map(([userId, conversation]) => ({
          userId,
          latestMessage: conversation[0],
          unreadCount: conversation.filter(m => !m.read && m.sender !== loggedInUserId).length,
        }))
        .sort((a, b) => new Date(b.latestMessage.timestamp) - new Date(a.latestMessage.timestamp));

      setChats(sortedChats);
      fetchUsernames([...userIds]);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  const fetchUsernames = async (userIds) => {
    try {
      const responses = await Promise.all(
        userIds.map((id) =>
          api.get(`${API_BASE_URL}/api/users/${id}/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }).catch(() => null)
        )
      );
      const map = {};
      responses.forEach((res) => {
        if (res?.data) map[res.data.id] = res.data.username;
      });
      setUsernames(map);
    } catch (err) {
      console.error("Error fetching usernames:", err);
    }
  };

  // Handle messages read
  const handleMessagesRead = (userId) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.userId === userId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  };

  // -------------------
  // WebSocket setup
  // -------------------
  useEffect(() => {
    fetchChats();

    // Connect to WebSocket
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    wsRef.current = new WebSocket(`${wsProtocol}://localhost:8000/ws/messages/${loggedInUserId}/`);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "new_message") {
        const msg = data.message;

        setChats(prevChats => {
          const otherUserId = msg.sender === loggedInUserId ? msg.receiver : msg.sender;

          // Find if chat exists
          const existingChat = prevChats.find(c => c.userId === otherUserId);
          let updatedChats;

          if (existingChat) {
            // Update latest message & unread count
            updatedChats = prevChats.map(c =>
              c.userId === otherUserId
                ? {
                    ...c,
                    latestMessage: msg,
                    unreadCount: c.unreadCount + (msg.sender !== loggedInUserId ? 1 : 0),
                  }
                : c
            );
          } else {
            // New chat
            updatedChats = [
              ...prevChats,
              {
                userId: otherUserId,
                latestMessage: msg,
                unreadCount: msg.sender !== loggedInUserId ? 1 : 0,
              },
            ];
            // Fetch username for new user
            fetchUsernames([otherUserId]);
          }

          // Sort by latest message timestamp
          return updatedChats.sort(
            (a, b) => new Date(b.latestMessage.timestamp) - new Date(a.latestMessage.timestamp)
          );
        });
      }
    };

    wsRef.current.onclose = () => console.log("WebSocket disconnected");

    return () => wsRef.current.close();
  }, []);

  return (
    <div className="w-full h-screen flex bg-gray-50">
      {/* Left: Chat list */}
      <div className="w-1/3 border-r border-gray-300 overflow-y-auto">
        <h2 className="text-2xl font-bold p-4 text-center border-b border-gray-300">
          Your Chats
        </h2>
        <div className="space-y-2 p-2">
          {chats.length > 0 ? (
            chats.map(({ userId, latestMessage, unreadCount }) => (
              <div
                key={userId}
                onClick={() => setSelectedUserId(userId)}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 
                  ${selectedUserId === userId ? "bg-emeraldDark/20" : "bg-white hover:bg-gray-100"}`}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-lg">
                    {usernames[userId]?.charAt(0) || userId}
                  </div>
                </div>
                <div className="flex-1 ml-4 overflow-hidden">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {usernames[userId] || `User ${userId}`}
                  </h3>
                  <p className="text-gray-600 truncate max-w-full mt-1">
                    {latestMessage?.content || "No messages yet"}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <span className="ml-3 bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 mt-6 text-lg">
              No chats available.
            </p>
          )}
        </div>
      </div>

      {/* Right: Selected conversation */}
      <div className="w-2/3">
        {selectedUserId ? (
          <MessagesPage
            sender={selectedUserId}
            onMessagesRead={handleMessagesRead}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xl">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default CaregiverChats;
