from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from llm import LLMModule
import re
from datetime import datetime

llm_module = LLMModule()

def parse_transcript_to_prescription_data(transcript_text):
    """
    Parses a formatted transcript into a structured dictionary with prescription data.
    """
    prescription_data = {}

    # Regex patterns to extract data from the transcript
    doctor_name_pattern = r"Doctor's Name:\s*(.*)"
    patient_name_pattern = r"Patient Name:\s*(.*)"
    age_pattern = r"Age:\s*(\d+)"
    gender_pattern = r"Gender:\s*(\w+)"
    symptoms_pattern = r"Symptoms:\s*(.*)"
    diagnosis_pattern = r"Diagnosis:\s*(.*)"
    medications_pattern = r"Prescribed Medications:\s*([\s\S]+?)\nAdditional Advice"
    advice_pattern = r"Additional Advice:\s*([\s\S]+?)\nFollow Up"
    follow_up_pattern = r"Follow Up:\s*(.*)"

    # Extract values using regex
    doctor_name = re.search(doctor_name_pattern, transcript_text)
    patient_name = re.search(patient_name_pattern, transcript_text)
    age = re.search(age_pattern, transcript_text)
    gender = re.search(gender_pattern, transcript_text)
    symptoms = re.search(symptoms_pattern, transcript_text)
    diagnosis = re.search(diagnosis_pattern, transcript_text)
    medications = re.search(medications_pattern, transcript_text)
    advice = re.search(advice_pattern, transcript_text)
    follow_up = re.search(follow_up_pattern, transcript_text)

    # Fill in the prescription data if found
    prescription_data["doctor_name"] = doctor_name.group(1) if doctor_name else "Unknown"
    prescription_data["patient_name"] = patient_name.group(1) if patient_name else "Unknown"
    prescription_data["age"] = int(age.group(1)) if age else 0
    prescription_data["gender"] = gender.group(1) if gender else "Unknown"
    prescription_data["date"] = datetime.now().strftime("%Y-%m-%d %H:%M %p")
    prescription_data["symptoms"] = symptoms.group(1) if symptoms else "Not Provided"
    prescription_data["diagnosis"] = diagnosis.group(1) if diagnosis else "Not Provided"
    
    # Parsing medications (assuming each medication is on a new line)
    if medications:
        med_lines = medications.group(1).strip().split('\n')
        medication_list = []
        for line in med_lines:
            med_match = re.match(r"(\S+.*)\s*-\s*(\S+)\s*-\s*(\S+)", line)
            if med_match:
                medication_list.append([med_match.group(1), med_match.group(2), med_match.group(3)])
        prescription_data["medications"] = medication_list
    else:
        prescription_data["medications"] = []

    # Parsing advice
    if advice:
        prescription_data["advice"] = [line.strip() for line in advice.group(1).strip().split('\n')]
    else:
        prescription_data["advice"] = []

    # Follow-up date
    prescription_data["follow_up"] = follow_up.group(1) if follow_up else "Not Provided"

    return prescription_data

def generate_prescription(chat_history, llm_module):
    """
    Extracts details from chat history, generates a structured prescription using LLM, and saves it as a PDF.
    """
    # Extract conversation text
    conversation_text = "\n".join([msg[1] for msg in chat_history if msg[0] == "user"])

    # LLM prompt for generating a structured prescription
    prompt = f"""
    You are an AI-powered doctor assistant. Based on the following doctor-patient conversation, generate a structured prescription.

    Conversation:
    {conversation_text}

    Format:
    Doctor's Name: Dr. John Doe  
    Patient Name: [Extracted Name]  
    Age: [Extracted Age]  
    Gender: [Extracted Gender]  
    Date: {datetime.now().strftime("%Y-%m-%d %H:%M %p")}  
    Symptoms: [Extracted Symptoms]  
    Diagnosis: [Generated Diagnosis]  
    Prescribed Medications:  
    1. [Medicine Name] - [Dosage] - [Frequency]  
    2. [Medicine Name] - [Dosage] - [Frequency]  
    Additional Advice: [AI-generated suggestions]  
    Follow Up: [Extracted Follow-Up Date]  

    Follow this format exactly and return only the structured prescription and nothing else only format.
    """

    # Generate prescription using LLM
    prescription = llm_module.generate_response([("user", prompt)])

    if not prescription:
        return "⚠️ Failed to generate prescription."

    # Save as Text File
    txt_filename = "prescription.txt"
    with open(txt_filename, "w") as f:
        f.write(prescription)
    
    print(f"✅ Prescription saved as '{txt_filename}'")

    # Convert to PDF
    pdf_filename = "prescription.pdf"
    save_prescription_as_pdf(prescription, pdf_filename)
    
    print(f"📄 PDF Prescription saved as '{pdf_filename}'")

    return prescription

def save_prescription_as_pdf(text, filename, llm_module):
    """
    Converts extracted prescription details into a structured PDF format.
    """
    prescription_text = generate_prescription(text, llm_module)
    prescription_data = parse_transcript_to_prescription_data(prescription_text)
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4

    # Doctor & Clinic Information
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 50, prescription_data["doctor_name"])
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 65, "M.B.B.S., M.D., Reg No: 123456")
    c.drawString(50, height - 80, "Mobile: +91 9876543210")

    c.setFont("Helvetica-Bold", 12)
    c.drawString(350, height - 50, "Care Clinic")
    c.setFont("Helvetica", 10)
    c.drawString(350, height - 65, "Near Axis Bank, City, Pincode")
    c.drawString(350, height - 80, "Ph: 01234 567890, Timing: 09:00 AM - 02:00 PM")

    # Date
    c.setFont("Helvetica-Bold", 10)
    c.drawString(450, height - 100, f"Date: {prescription_data['date']}")

    # Patient Information
    y_position = height - 130
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, y_position, f"Patient Name: {prescription_data['patient_name']}")
    y_position -= 15
    c.drawString(50, y_position, f"Age: {prescription_data['age']}   Gender: {prescription_data['gender']}")
    y_position -= 20
    c.drawString(50, y_position, f"Symptoms: {prescription_data['symptoms']}")
    y_position -= 20
    c.drawString(50, y_position, f"Diagnosis: {prescription_data['diagnosis']}")

    # Medicine Table
    y_position -= 40
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, y_position, "Prescribed Medications:")

    medicines = [["Medicine Name", "Dosage", "Duration"]] + prescription_data["medications"]

    table = Table(medicines, colWidths=[200, 150, 100])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    table.wrapOn(c, width, height)
    table.drawOn(c, 50, y_position - 40)

    # Advice Section
    y_position -= 120
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, y_position, "Additional Advice:")
    y_position -= 15
    c.setFont("Helvetica", 10)
    for advice in prescription_data["advice"]:
        c.drawString(50, y_position, f"- {advice}")
        y_position -= 15

    # Follow-up Section
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, y_position - 20, f"Follow Up: {prescription_data['follow_up']}")

    # Doctor's Signature
    c.setFont("Helvetica", 10)
    c.drawString(400, height - 650, "Signature:")
    c.setFont("Helvetica-Bold", 10)
    c.drawString(400, height - 670, prescription_data["doctor_name"])
    c.setFont("Helvetica", 9)
    c.drawString(400, height - 685, "M.B.B.S., M.D.")

    # Save PDF
    c.save()

if __name__=="__main__":
    file = open("/Users/raunitsingh/Desktop/telemedicine-kiosk/ai-services/transcripts/live_transcription_1739642077.txt","r")
    text = file.read()
    save_prescription_as_pdf(text,"lakshya.pdf",llm_module=llm_module)