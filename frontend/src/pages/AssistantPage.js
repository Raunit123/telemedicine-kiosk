import React, { useState, useEffect } from "react";
import ChatBot from "../components/ChatBot"; // Import Chat UI component
import "../styles/AssistantPage.css"; // Import CSS for styling
import { useNavigate } from "react-router-dom";

function AssistantPage() {
  const [messages, setMessages] = useState([]); // Stores chat messages
  const [loading, setLoading] = useState(false); // Loading state for AI response
  const navigate = useNavigate();

  // Function to send user message to AI
  const sendMessage = async (text) => {
    if (!text.trim()) return; // Ignore empty messages
    const newMessage = { sender: "user", text };
    setMessages([...messages, newMessage]); // Add user message to chat
    setLoading(true); // Show loading state

    try {
      const response = await fetch("http://localhost:5000/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]); // Add AI response
      } else {
        setMessages((prev) => [...prev, { sender: "ai", text: "Error processing request." }]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { sender: "ai", text: "Could not connect to server." }]);
    }

    setLoading(false);
  };

  // Redirect user to appointment page if AI suggests booking
  useEffect(() => {
    if (messages.some((msg) => msg.text.toLowerCase().includes("book an appointment"))) {
      setTimeout(() => {
        navigate("/book-appointment");
      }, 2000);
    }
  }, [messages, navigate]);

  return (
    <div className="assistant-container">
      <h2>AI Health Assistant</h2>
      <ChatBot messages={messages} sendMessage={sendMessage} loading={loading} />
    </div>
  );
}

export default AssistantPage;