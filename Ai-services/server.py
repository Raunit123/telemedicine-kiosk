import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from llm import LLMModule
from chat_reference import preprocess_text, store_in_vector_db, retrieve_relevant_context, generate_prompt
from tts import speak

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize ElevenLabs API Client
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
if not ELEVENLABS_API_KEY:
    raise ValueError("Missing ELEVENLABS_API_KEY in .env file")
client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# Initialize LLM module
llm_module = LLMModule()

# Ensure required files exist and load prompt template
file_path = "sample_dialogue.txt"
if not os.path.exists(file_path):
    raise FileNotFoundError("sample_dialogue.txt not found")

prompt_template_file = "prompt_template.txt"
if not os.path.exists(prompt_template_file):
    raise FileNotFoundError("prompt_template.txt not found")

with open(prompt_template_file, "r", encoding="utf-8") as file:
    text_content = file.read()

# Global conversation context (you may want to adjust this if you need session-based contexts)
messages = [("system", text_content)]

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Message is required"}), 400

    user_input = data["message"]

    # Retrieve relevant context and generate prompt
    context = retrieve_relevant_context(user_input)
    prompt = generate_prompt(user_input, context)
    messages.append(("user", user_input + prompt))

    # Generate AI response using your LLM module
    ai_response = llm_module.generate_response(messages)
    if ai_response:
        messages.append(("ai", ai_response))

        # Generate TTS response
        try:
            audio_url = speak(client, ai_response)  # Generates speech and returns URL
        except Exception as e:
            audio_url = None
            print(f"⚠️ TTS Error: {e}")

        return jsonify({"response": ai_response, "audio_url": audio_url})
    else:
        return jsonify({"error": "Failed to generate response"}), 500

@app.route('/tts', methods=['POST'])
def tts():
    """Generate speech from text input"""
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Text input is required"}), 400

    text_input = data["text"]

    try:
        audio_url = speak(client, text_input)  # Generates speech and returns URL
        return jsonify({"audio_url": audio_url})
    except Exception as e:
        return jsonify({"error": f"TTS generation failed: {e}"}), 500

if __name__ == '__main__':
    # Run the Flask server persistently on port 5001 (or choose an available port)
    app.run(host="0.0.0.0", port=5001, debug=True)