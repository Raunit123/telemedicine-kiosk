from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle

def extract_prescription_details(text):
    """
    Extracts structured data from the LLM-generated prescription.
    """
    prescription_data = {
        "doctor_name": "Dr. John Doe",
        "patient_name": "Not Available",
        "age": "Not Available",
        "gender": "Not Available",
        "date": datetime.now().strftime("%Y-%m-%d %H:%M %p"),
        "symptoms": "Not Available",
        "diagnosis": "Not Available",
        "medications": [],
        "advice": [],
        "follow_up": "Not Available",
    }

    lines = text.split("\n")

    for line in lines:
        if "Patient Name:" in line:
            prescription_data["patient_name"] = line.split(":")[1].strip()
        elif "Age:" in line:
            prescription_data["age"] = line.split(":")[1].strip()
        elif "Gender:" in line:
            prescription_data["gender"] = line.split(":")[1].strip()
        elif "Symptoms:" in line:
            prescription_data["symptoms"] = line.split(":")[1].strip()
        elif "Diagnosis:" in line:
            prescription_data["diagnosis"] = line.split(":")[1].strip()
        elif "Prescribed Medications:" in line:
            continue  # Skip the header
        elif line.startswith("*"):  # Advice lines
            prescription_data["advice"].append(line.strip("* ").strip())
        elif "Follow Up:" in line:
            prescription_data["follow_up"] = line.split(":")[1].strip()
        elif "-" in line:  # Medicines
            parts = line.split(" - ")
            if len(parts) == 3:
                prescription_data["medications"].append([parts[0].strip(), parts[1].strip(), parts[2].strip()])

    return prescription_data

def save_prescription_as_pdf(text, filename):
    """
    Converts extracted prescription details into a structured PDF format.
    """
    prescription_data = extract_prescription_details(text)
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