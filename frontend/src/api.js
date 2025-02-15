import axios from "axios";

const API_URL = "http://127.0.0.1:3000"; // Your Node.js backend URL

export const sendMessageToAI = async (message) => {
    try {
        const response = await axios.post(`${API_URL}/api/ai-assistant`, { message });

        return {
            response: response.data.response,  // AI text response
            audioUrl: response.data.audio_url || null,  // TTS audio response (if available)
        };
    } catch (error) {
        console.error("Error sending message:", error);
        return { error: "Failed to get response from AI" };
    }
};