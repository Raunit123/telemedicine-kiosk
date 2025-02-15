/* Signup.js */
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./Signup.css";

function Signup() {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    village: "",
    age: "",
    gender: "male"
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleNetworkChange = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);
    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isOnline) {
      setError("No internet connection. Form will submit when online.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const formattedPhoneNumber = formData.phone?.replace(/\D/g, "").slice(-10) || "";
    if (formattedPhoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/auth/signup", {
        username: formattedPhoneNumber,
        password: formData.password,
        fullName: formData.fullName,
        phone: formattedPhoneNumber,
        village: formData.village,
        age: Number(formData.age),
        gender: formData.gender
      });
      localStorage.setItem("token", response.data.token);
      navigate("/book-appointment", { state: { newUser: true } });
      setFormData({ phone: "", password: "", confirmPassword: "", fullName: "", village: "", age: "", gender: "male" });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="rural-signup-container">
      <h2>Telemedicine Kiosk Registration</h2>
      {!isOnline && <div className="offline-warning">⚠️ Working offline - Data will be saved locally</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name:</label>
          <input type="text" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mobile Number:</label>
          <PhoneInput international defaultCountry="IN" value={formData.phone} onChange={(value) => handleChange("phone", value)} required />
        </div>
        
        <div className="form-group">
          <label>Village Name:</label>
          <input type="text" value={formData.village} onChange={(e) => handleChange("village", e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Age:</label>
          <input type="number" min="1" value={formData.age} onChange={(e) => handleChange("age", e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Gender:</label>
          <select value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} minLength="6" required />
        </div>
        <div className="form-group">
          <label>Confirm Password:</label>
          <input type="password" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} required />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={isLoading} className="submit-button">{isLoading ? "Registering..." : "Create Account"}</button>
        <div className="login-prompt">
        Already registered?  <Link to="/login" > Login</Link>
        </div>

      </form>
    </div>
  );
}

export default Signup;