import React, { useState, useRef } from "react";
import "./ChatBot.css";
import Input from "./Input";
import Message from "./Message";
import { sendMessageToAI } from "../api";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);
  const audioRef = useRef(new Audio()); // For playing TTS response

  // Initialize Speech Recognition (STT)
  const startListening = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false; // Stop after one phrase
    recognitionRef.current.interimResults = false; // Get final text
    recognitionRef.current.lang = "en-US"; // Set language

    recognitionRef.current.onstart = () => {
      setListening(true);
      console.log("🎤 Listening...");
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("✅ Recognized Text:", transcript);
      sendMessage(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("STT Error:", event.error);
      setListening(false);
    };

    recognitionRef.current.onend = () => {
      setListening(false);
    };

    recognitionRef.current.start();
  };

  const sendMessage = async (input) => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const botResponse = await sendMessageToAI(input);
<<<<<<< HEAD
      if (botResponse.error) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: botResponse.error },
        ]);
      } else {
        
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: botResponse.response },
        ]);
=======
      const botMessage = botResponse.error
        ? { sender: "bot", text: botResponse.error }
        : { sender: "bot", text: botResponse.response };
>>>>>>> c20188a (update video function)

      setMessages((prev) => [...prev, botMessage]);

      // Play audio if response contains an audio URL
      if (botResponse.audioUrl) {
        audioRef.current.src = botResponse.audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Something went wrong. Please try again." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <Message key={index} sender={msg.sender} text={msg.text} />
        ))}
        {loading && <Message sender="bot" text="Thinking..." />}
      </div>

      <div className="input-container">
        
        <Input onSendMessage={sendMessage} loading={loading} />
        <button
          className={`mic-button ${listening ? "listening" : ""}`}
          onClick={startListening}
        >
          {listening ? "🛑 Stop" : "🎤 Speak"}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
