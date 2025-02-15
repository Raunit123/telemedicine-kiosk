import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import "./Login.css"; // Import the Login-specific CSS

function Login() {
  const [phone, setPhone] = useState(""); // Using phone for login (username)
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  // Network status monitoring (for rural connectivity)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOnline) {
      setError("No internet connection. Please try later.");
      return;
    }

    setError("");
    setIsLoading(true);

    // Format phone number: remove non-digits and extract last 10 digits
    const formattedPhoneNumber = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    if (!formattedPhoneNumber || formattedPhoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { username: formattedPhoneNumber, password },
        { timeout: 10000 }
      );

      localStorage.setItem("token", response.data.token);
      navigate("/book-appointment", { state: { message: "Login successful!" } });
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        (err.code === "ECONNABORTED" ? "Connection too slow. Try again." : "Invalid phone number or password.");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      
      <div className="login-card">
        <h2 className="local-language-heading">Login</h2>
        {!isOnline && (
          <div className="offline-banner">
            ⚠️ You are offline - data will sync when connected
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Mobile Number:</label>
            <PhoneInput
              international
              defaultCountry="IN"
              value={phone}
              onChange={(value) => setPhone(value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              placeholder="*******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? <Spinner animation="border" size="sm" /> : "Login"}
          </button>

          <div className="signup-prompt">
            New user? <Link to="/signup" className="local-language-link">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
