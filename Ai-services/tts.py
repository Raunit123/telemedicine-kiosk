from elevenlabs.client import ElevenLabs
from elevenlabs import stream

# Initialize the ElevenLabs client
client = ElevenLabs(api_key="your-elevenlabs-api-key")  # Replace with your actual API key

def speak(client, text_input):
    audio_stream = client.text_to_speech.convert_as_stream(
        text=text_input,
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        model_id="eleven_multilingual_v2"
    )
    # Play the streamed audio locally
    stream(audio_stream)