import { useState, useEffect, useRef } from "react";
import api from "./api";


const MessagesPage = ({ sender, onMessagesRead }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [replyToId, setReplyToId] = useState(null); 
  const [senderUsername, setSenderUsername] = useState(""); 
  const loggedInUserId = parseInt(localStorage.getItem("userId"), 10);
  const API_BASE_URL = "https://careconnect-2-j2tv.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`${API_BASE_URL}/api/messages/${sender}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setMessages(res.data.conversation || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Fetch sender username
  useEffect(() => {
    api
      .get(`${API_BASE_URL}/api/users/${sender}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      })
      .then((res) => setSenderUsername(res.data.username))
      .catch((err) => console.error("Error fetching username:", err));
  }, [sender]);

  // Scroll to bottom
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Mark all unread messages as read
const markMessagesAsRead = async () => {
  try {
    await api.post(
      `${API_BASE_URL}/api/messages/${sender}/mark-read/`,
      {}, // no body needed
      { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
    );
    if (onMessagesRead) onMessagesRead(sender); // notify parent
  } catch (err) {
    console.error("Error marking messages as read:", err);
  }
};

  // Fetch messages & mark as read when chat opens
  useEffect(() => {
    fetchMessages();
  }, [sender]);

  useEffect(() => {
    markMessagesAsRead();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const payload = { content: messageText };
    const url = replyToId
      ? `${API_BASE_URL}/api/messages/${replyToId}/replies/`
      : `${API_BASE_URL}/api/messages/`;
    if (!replyToId) payload.receiver = sender;

    api
      .post(url, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      })
      .then(() => {
        setMessageText("");
        setReplyToId(null);
        fetchMessages();
      })
      .catch((err) => console.error("Error sending message:", err));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow">
        <h2 className="text-lg font-bold">{senderUsername || "User"}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-6">No messages yet</p>
        )}

        {messages.map((msg) => {
          const isSender = msg.sender === loggedInUserId;
          return (
            <div
              key={msg.id}
              className={`flex items-end ${isSender ? "justify-end" : "justify-start"} group`}
            >
              {!isSender && (
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-semibold text-sm">
                    {senderUsername?.charAt(0) || "U"}
                  </div>
                </div>
              )}

              <div
                className={`max-w-[70%] p-3 rounded-2xl shadow
                  ${isSender ? "bg-emerald-800 text-white" : "bg-gray-100 text-gray-900 border border-gray-200"} 
                `}
              >
                <p className="break-words">{msg.content}</p>
                <span className="text-xs opacity-60 block mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>

                {msg.replies?.length > 0 && (
                  <div className="mt-2 pl-4 border-l-2 border-gray-300 space-y-2">
                    {msg.replies.map((rep) => {
                      const isRepSender = rep.sender === loggedInUserId;
                      return (
                        <div key={rep.id} className={`p-2 rounded-lg max-w-[85%] 
                          ${isRepSender ? "bg-coral/90 text-white" : "bg-gray-200 text-gray-800"}`}>
                          <p>{rep.content}</p>
                          <span className="text-xs opacity-60 block mt-1">
                            {new Date(rep.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {!isSender && (
                <button
                  className="ml-2 opacity-0 group-hover:opacity-100 transition text-xs px-2 py-0.5 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 hover:shadow-lg hover:border hover:border-gray-400/60"
                  onClick={() => setReplyToId(msg.id)}
                >
                  Reply
                </button>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white shadow flex flex-col sticky bottom-0">
        {replyToId && (
          <div className="mb-2 text-sm text-gray-600">
            Replying to message #{replyToId}{" "}
            <button className="ml-2 text-red-500" onClick={() => setReplyToId(null)}>Cancel</button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            className="flex-1 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows="2"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
          />
          <button
            className="px-4 py-2 bg-emerald-800 text-white rounded-xl hover:bg-emerald-600 transition"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
