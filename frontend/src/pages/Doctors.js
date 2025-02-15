import React, { useEffect, useState } from "react";
import "./Doctors.css";
import doctor1 from "./images/AyeshaKhan.avif";
import doctor2 from "./images/RohanMehta.jpg";
import doctor3 from "./images/PriyaSharma.avif";
import doctor4 from "./images/ArjunPatel.jpg";
import doctor5 from "./images/NishaVerma.jpeg";
import doctor6 from "./images/RajMalhotra.jpg";
import doctor7 from "./images/SimranKaur.webp";
import doctor8 from "./images/KarthikIyer.webp";

  const handleJoinMeet = async (doctor) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/generate-and-start-recording");
      const data = await response.json();

      if (data.meet_link) {
        // Open Google Meet in a new tab
        const meetWindow = window.open(data.meet_link, "_blank");

        // Store transcript file path for later use
        localStorage.setItem("transcriptFile", data.transcript_file);

        alert(`Meeting started for ${doctor.name}. Transcript will be saved in ai-services.`);

        // Check every 5 seconds if the Meet tab is closed, then stop recording
        const checkMeetClosed = setInterval(async () => {
          if (meetWindow.closed) {
            clearInterval(checkMeetClosed); // Stop checking
            
            // Stop the recording
            try {
              const stopResponse = await fetch("http://127.0.0.1:5000/stop-recording");
              const stopData = await stopResponse.json();
              alert("Meeting ended. Transcription saved in ai-services.");
              console.log("Transcription file:", stopData.transcript_file);
            } catch (error) {
              console.error("Error stopping the recording:", error);
            }
          }
        }, 5000); // Check every 5 seconds
      }
    } catch (error) {
      console.error("Error starting the meeting:", error);
    }
  };

const doctors = [
  { name: "Dr. Ayesha Khan", specialization: "Cardiologist", time: "10:00 AM - 12:00 PM", img: doctor1 },
  { name: "Dr. Rohan Mehta", specialization: "Neurologist", time: "1:00 PM - 3:00 PM", img: doctor2 },
  { name: "Dr. Priya Sharma", specialization: "Dermatologist", time: "3:30 PM - 5:30 PM", img: doctor3 },
  { name: "Dr. Arjun Patel", specialization: "Orthopedic Surgeon", time: "6:00 PM - 8:00 PM", img: doctor4 },
  { name: "Dr. Nisha Verma", specialization: "Pediatrician", time: "9:00 AM - 11:00 AM", img: doctor5 },
  { name: "Dr. Raj Malhotra", specialization: "General Physician", time: "2:00 PM - 4:00 PM", img: doctor6 },
  { name: "Dr. Simran Kaur", specialization: "Gynecologist", time: "5:00 PM - 7:00 PM", img: doctor7 },
  { name: "Dr. Karthik Iyer", specialization: "ENT Specialist", time: "8:30 PM - 10:30 PM", img: doctor8 },
];

const Doctors = () => {
  const [selectedSlot, setSelectedSlot] = useState("");

  useEffect(() => {
    const slot = localStorage.getItem("selectedSlot");
    if (slot) {
      setSelectedSlot(slot);
    }
  }, []);

  return (
    <div className="doctors-container">
      <h2>Available Doctors</h2>
      <div className="doctors-grid">
        {doctors.map((doctor, index) => (
          <div key={index} className="doctor-card">
            <img src={doctor.img} alt={doctor.name} className="doctor-image" />
            <h3 className="doctor-name">{doctor.name}</h3>
            <p className="doctor-specialization">{doctor.specialization}</p>
            <p className="doctor-time">Available: {doctor.time}</p>
            
            {/* Check if selected slot matches doctor's time */}
            {selectedSlot === doctor.time ? (
              <button 
                onClick={() => handleJoinMeet(doctor)}
                className="meet-button active"
                aria-label={`Join meet with ${doctor.name}`}
              >
                Join Meet
              </button>
            ) : (
              <button className="meet-button disabled" disabled style={{ backgroundColor: "gray", color: "white" }}>
                Unavailable
              </button>

            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctors;