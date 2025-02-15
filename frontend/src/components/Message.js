import React from "react";
import "./Message.css"; // Ensure this file exists for styling

const Message = ({ sender, text }) => {
  return (
    <div className={`message ${sender}`}>
      <div className="message-bubble">
        <p className="message-text">{text}</p>
      </div>
    </div>
  );
};

export default Message;