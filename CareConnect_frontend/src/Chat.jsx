import React, { useState, useEffect } from "react";
const Chat = ({ customerId, caregiverId }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isSocketOpen, setIsSocketOpen] = useState(false);  
  const [socketError, setSocketError] = useState(null);  

  useEffect(() => {
    if (caregiverId && customerId) {
      let ws;
      const connectWebSocket = () => {
        ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${customerId}/${caregiverId}/`);

        ws.onopen = () => {
          console.log("WebSocket connected");
          setIsSocketOpen(true);
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setMessages((prev) => {
            const isDuplicate = prev.some((msg) => msg.content === data.content && msg.timestamp === data.timestamp);
            if (isDuplicate) {
              return prev; 
            }
            return [...prev, data]; 
          });
        };
        

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setSocketError("Connection error, please try again later.");
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected");
          setIsSocketOpen(false);
          setTimeout(connectWebSocket, 5000);  
        };

        setSocket(ws);
      };

      connectWebSocket();

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    }
  }, [customerId, caregiverId]);

  const sendMessage = () => {
    if (socket && message.trim() !== "" && socket.readyState === WebSocket.OPEN) {
      const msgData = {
        message,
        sender: customerId,
        receiver: caregiverId,
      };
      socket.send(JSON.stringify(msgData));  
      console.log('customerId:', customerId);
console.log('msgData.sender:', msgData.sender);

setMessages((prev) => {
  console.log('Previous messages:', prev); 
  return [
    ...prev,
    {
      ...msgData,
      sender: msgData.sender === customerId ? "You" : "Caregiver",  
    }
  ];
});      setMessage(""); 
    } else {
      console.error("WebSocket is not open or message is empty");
    }
  };
  
  
  return (
    <div>
      <h3>Chat with Caregiver</h3>
      {socketError && <p style={{ color: 'red' }}>{socketError}</p>}
      <div
        style={{ border: "1px solid gray", padding: "10px", height: "300px", overflowY: "auto" }}
      >
        {messages.map((msg, index) => (
  <p
    key={index}
    style={{
      textAlign: msg.sender === "You" ? "right" : "left",  
      backgroundColor: msg.sender === "You" ? "#2D6A4F" : "#FFFFFF",
      padding: "8px",
      color: "white",

      borderRadius: "10px",
      margin: "5px 0",
    }}
  >
    <strong>{msg.sender === "You" ? "You" : "Caregiver"}:</strong> {msg.message}
  </p>
))}

      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="mt-2 p-4 mr-4"
      />
      <button className="bg-coral text-white mt-2 mx-auto hover:bg-emerald-800" onClick={sendMessage} disabled={!isSocketOpen}>Send</button>
    </div>
  );
};

export default Chat;
