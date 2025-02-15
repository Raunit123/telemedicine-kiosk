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

const doctors = [
  { name: "Dr. Ayesha Khan", specialization: "Cardiologist", time: "10:00 AM - 12:00 PM", meet: "https://meet.google.com/new", img: doctor1 },
  { name: "Dr. Rohan Mehta", specialization: "Neurologist", time: "1:00 PM - 3:00 PM", meet: "https://meet.google.com/new", img: doctor2 },
  { name: "Dr. Priya Sharma", specialization: "Dermatologist", time: "3:30 PM - 5:30 PM", meet: "https://meet.google.com/new", img: doctor3 },
  { name: "Dr. Arjun Patel", specialization: "Orthopedic Surgeon", time: "6:00 PM - 8:00 PM", meet: "https://meet.google.com/new", img: doctor4 },
  { name: "Dr. Nisha Verma", specialization: "Pediatrician", time: "9:00 AM - 11:00 AM", meet: "https://meet.google.com/new", img: doctor5 },
  { name: "Dr. Raj Malhotra", specialization: "General Physician", time: "2:00 PM - 4:00 PM", meet: "https://meet.google.com/new", img: doctor6 },
  { name: "Dr. Simran Kaur", specialization: "Gynecologist", time: "5:00 PM - 7:00 PM", meet: "https://meet.google.com/new", img: doctor7 },
  { name: "Dr. Karthik Iyer", specialization: "ENT Specialist", time: "8:30 PM - 10:30 PM", meet: "https://meet.google.com/new", img: doctor8 },
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
              <a 
                href={doctor.meet} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="meet-button active"
                aria-label={`Join meet with ${doctor.name}`}
              >
                Join Meet
              </a>
            ) : (
              <button className="meet-button disabled" disabled>
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