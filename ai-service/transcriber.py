from flask import Flask, jsonify, send_from_directory
import pyaudio
import wave
import os
from flask_cors import CORS
import threading
import time
import subprocess
from prescriber import save_prescription_as_pdf
import speech_recognition as sr  # Google Speech-to-Text API
from llm import LLMModule

llm_module = LLMModule()

app = Flask(__name__)
CORS(app)

# Global variables
is_recording = False
AUDIO_FOLDER = "audio"
TRANSCRIPT_FOLDER = "transcripts/"
MEET_LINK = "https://meet.google.com/new"
CHUNK_DURATION = 10  # Record in chunks of 10 seconds

# Create necessary folders
os.makedirs(AUDIO_FOLDER, exist_ok=True)
os.makedirs(TRANSCRIPT_FOLDER, exist_ok=True)

# Global transcription file
timestamp = int(time.time())
transcript_filename = os.path.join(TRANSCRIPT_FOLDER, f"live_transcription_{timestamp}.txt")

# Function to record and transcribe audio in 10-sec chunks
def record_and_transcribe():
    global is_recording

    chunk_size = 1024
    format = pyaudio.paInt16
    channels = 1  # Google Speech-to-Text requires mono audio
    rate = 16000  # Recommended sample rate for Google Speech API

    p = pyaudio.PyAudio()
    stream = p.open(format=format, channels=channels, rate=rate, input=True, frames_per_buffer=chunk_size)

    print("Recording started in 10-second chunks...")

    while is_recording:
        audio_frames = []
        start_time = time.time()

        while time.time() - start_time < CHUNK_DURATION:
            data = stream.read(chunk_size, exception_on_overflow=False)
            audio_frames.append(data)

        # Save chunk to file
        chunk_filename = os.path.join(AUDIO_FOLDER, f"chunk_{int(time.time())}.wav")
        with wave.open(chunk_filename, 'wb') as wf:
            wf.setnchannels(channels)
            wf.setsampwidth(p.get_sample_size(format))
            wf.setframerate(rate)
            wf.writeframes(b''.join(audio_frames))

        # Transcribe and append text
        transcript = transcribe_audio(chunk_filename)
        save_transcription(transcript)

    print("Recording stopped.")
    stream.stop_stream()
    stream.close()
    p.terminate()

# Function to transcribe audio chunk using Google Speech-to-Text API
def transcribe_audio(filename):
    recognizer = sr.Recognizer()
    
    try:
        with sr.AudioFile(filename) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
            return text
    except sr.UnknownValueError:
        return "[Unrecognized Speech]"
    except sr.RequestError as e:
        return f"[Google Speech API Error: {e}]"

# Function to save transcription to a single file
def save_transcription(text):
    with open(transcript_filename, 'a', encoding="utf-8") as file:
        file.write(text + "\n")
    print(f"Transcription updated: {text}")

# API Endpoint to generate meeting link and start recording
@app.route('/generate-and-start-recording', methods=['GET'])
def generate_and_start_recording():
    print("Endpoint /generate-and-start-recording hit")

    global is_recording
    if is_recording:
        return jsonify({
            "meet_link": MEET_LINK,
            "status": "Recording already in progress",
            "transcript_file": transcript_filename
        })

    is_recording = True
    threading.Thread(target=record_and_transcribe, daemon=True).start()

    return jsonify({
        "meet_link": MEET_LINK,
        "status": "Recording started",
        "transcript_file": transcript_filename
    })

@app.route('/stop-recording', methods=['GET'])
def stop_recording():
    global is_recording
    is_recording = False
    
    try:
        # Get the latest transcript file
        transcript_file = max(
            [os.path.join(TRANSCRIPT_FOLDER, f) for f in os.listdir(TRANSCRIPT_FOLDER) if f.endswith(".txt")],
            key=os.path.getctime
        )

        # Define prescription PDF path
        prescription_pdf = transcript_file.replace(".txt", ".pdf")

        # Read the transcript file and generate the prescription PDF
        with open(transcript_file, 'r', encoding="utf-8") as file:
            transcript_text = file.read()

        # Generate the PDF
        save_prescription_as_pdf(transcript_text, prescription_pdf, llm_module)

        return jsonify({"message": "Recording stopped, prescription generated.", "transcript_file": transcript_file, "prescription_file": prescription_pdf})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/')
def serve_frontend():
    return send_from_directory('frontend', 'index.html')

# Serve static files (CSS, JS)
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('frontend', filename)

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)

