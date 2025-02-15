import React, { useState, useRef } from "react";
import "./ChatBot.css"; // Ensure this file exists for styling
import Input from "./Input"; // Import Input component
import Message from "./Message"; // Import Message component
import { sendMessageToAI } from "../api"; // Import API function
import { Model, KaldiRecognizer } from "vosk-browser";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const audioRef = useRef(new Audio()); // For playing TTS response

  // Initialize Speech Recognition (STT)

  const modelUrl = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip";
  let model = null;

  const loadModel = async () => {
    model = new Model(modelUrl);
    await model.load();
  };

  const startListening = async () => {
    if (!model) {
      alert("Loading speech model... Please wait.");
      await loadModel();
    }

    const recognizer = new KaldiRecognizer(model, 16000);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = async (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      const result = recognizer.acceptWaveform(inputData);
      if (result) {
        sendMessage(result.text);
      }
    };
  };

  const sendMessage = async (input) => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const botResponse = await sendMessageToAI(input);
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

        // If audio response exists, play it
        if (botResponse.audioUrl) {
          audioRef.current.src = botResponse.audioUrl;
          audioRef.current.play();
        }
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
          🎤
        </button>
      </div>
    </div>
  );
};

export default ChatBot;