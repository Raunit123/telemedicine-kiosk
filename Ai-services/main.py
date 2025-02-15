import os
import requests
import base64
from dotenv import load_dotenv

# Import necessary modules
from llm import LLMModule
from prescriber import generate_prescription  # NEW IMPORT

# Load environment variables
load_dotenv()

# Initialize LLM module
llm_module = LLMModule()

def main():
    print("Welcome to Telemedicine-Kiosk")

    messages = [("user","Patient: I have a fever, headache, and body pain.Doctor: It seems like a viral infection. I will prescribe Paracetamol 500mg twice a day for 5 days.")]

    while True:
        user_input = input("You: ").strip()

        if user_input.lower() in ["exit", "quit"]:
            print("Exiting the chat. Goodbye!")
            break

        elif "prescription" in user_input.lower():  # Trigger for prescription generation
            print("Generating prescription...")

            # Extract details from conversation
            prescription_text = generate_prescription(messages, llm_module)

            print(f"\n📜 Prescription:\n{prescription_text}\n")

            # Optional: Save as a PDF
            with open("prescription.txt", "w") as f:
                f.write(prescription_text)
            print("✅ Prescription saved as 'prescription.txt'")

            continue  # Go back to chat loop

if __name__ == "__main__":
    main()