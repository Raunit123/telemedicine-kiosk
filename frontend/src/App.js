import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'; // Moved Navbar to components folder
import Signup from './pages/Signup';
import Login from './pages/Login';
import BookAppointment from './pages/BookAppointment';
import AssistantPage from './pages/AssistantPage'; // AI Assistant Page
import PrescriptionPage from "./pages/PrescriptionPage";
import Doctors from './pages/Doctors';
function App() {
  return (
    <Router>
      <Navbar /> {/* Navbar remains global for navigation */}

      <div className="App">
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} /> {/* Default redirect */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ai-assistant" element={<AssistantPage />} /> {/* AI Assistant Page */}
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/prescription" element={<PrescriptionPage />} />
            <Route path="/doctors" element={<Doctors/>}/>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;