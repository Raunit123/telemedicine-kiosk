const express = require("express");
const router = express.Router();
const axios = require("axios");

// Set the URL of your Python AI service.
const AI_SERVICE_URL = "http://127.0.0.1:5001/chat";

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Send user message to Python AI backend
    const response = await axios.post(AI_SERVICE_URL, { message });

    // Extract response data
    const { response: aiResponse, audio_url } = response.data;

    // Prepare JSON response
    const responseData = { response: aiResponse };
    if (audio_url) {
      responseData.audio_url = audio_url; // Include audio URL if available
    }

    res.json(responseData);
  } catch (error) {
    console.error("❌ Error communicating with AI service:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;