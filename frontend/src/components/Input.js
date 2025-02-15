import React, { useState } from "react";
import "./Input.css"; // Ensure this file exists for styling

const Input = ({ onSendMessage, loading }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim() || loading) return;
    onSendMessage(message);
    setMessage(""); // Clear input after sending
  };

  return (
    <div className="input-container">
      <input
        type="text"
        placeholder={loading ? "AI is thinking..." : "Type a message..."}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={loading} // Disable input while AI is processing
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? "..." : "Send"}
      </button>
    </div>
  );
};

export default Input;