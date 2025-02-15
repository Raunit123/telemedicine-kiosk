import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "./BookAppointment.css"; // Import CSS

function BookAppointment() {
  const [selectedSlot, setSelectedSlot] = useState("");
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const availableSlots = [
    "9:00 AM - 11:00 AM", "10:00 AM - 12:00 PM", "1:00 PM - 3:00 PM", 
    "2:00 PM - 4:00 PM", "3:30 PM - 5:30 PM", "5:00 PM - 7:00 PM",
    "6:00 PM - 8:00 PM", "8:30 PM - 10:30 PM"
  ];

  const handleSlotChange = (event) => {
    setSelectedSlot(event.target.value);
  };

  const bookAppointment = async () => {
    if (!selectedSlot) {
      setMessage("Please select a time slot.");
      return;
    }

    setIsLoading(true);
    try {
      localStorage.setItem("selectedSlot", selectedSlot); // Store slot
      navigate("/doctors"); // Redirect to doctors page
    } catch (error) {
      console.error(error);
      setMessage('Error booking appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="appointment-page">
      <div className="appointment-card">
        <h2 className="card-title">Book Your Appointment</h2>
        
        {/* Time Slot Selection */}
        <label className="slot-label">Select a Time Slot:</label>
        <select className="slot-dropdown" value={selectedSlot} onChange={handleSlotChange}>
          <option value="">-- Select a Slot --</option>
          {availableSlots.map((slot, index) => (
            <option key={index} value={slot}>{slot}</option>
          ))}
        </select>

        <button className="book-button" onClick={bookAppointment} disabled={isLoading}>
          {isLoading ? 'Booking...' : 'Book Appointment'}
        </button>
        {message && <p className="appointment-message">{message}</p>}
      </div>
    </div>
  );
}

export default BookAppointment;