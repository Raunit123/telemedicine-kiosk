import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button, Alert } from "react-bootstrap";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionTimeout, setSessionTimeout] = useState(15); // Minutes remaining

  // Session timeout counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimeout((prev) => (prev > 0 ? prev - 1 : 0));
    }, 60000); // Decrement every minute

    return () => clearInterval(timer);
  }, []);

  // Auto-logout after 15 minutes of inactivity
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleLogout();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearTimeout(timeout);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login", { state: { autoLogout: true } });
  };

  // Don't show navbar on auth pages
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  return (
    <nav className="kiosk-navbar">
      {/* Left Section: Session Timer */}
      <div className="left-section">
        <Alert variant="warning" className="session-timer">
          Session ends in: {sessionTimeout} mins
        </Alert>
      </div>

      {/* Center Section: Navigation Links */}
      <div className="center-section">
        <h2 className="navbar-title">Health kiosk</h2>
        <ul className="nav-links">
          <li>
            <Link to="/ai-assistant">AI Assistant</Link>
          </li>
          <li>
            <Link to="/book-appointment">Book Appointment</Link>
          </li>
          <li>
            <Link to="/prescription">Prescription</Link>
          </li>
        </ul>
      </div>

      {/* Right Section: Logout Button */}
      <div className="right-section">
        <Button
          variant="outline-danger"
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;