import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem("rootbridge_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error loading saved user session:", e);
        localStorage.removeItem("rootbridge_user");
      }
    }
  }, []);

  const handleAuth = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("rootbridge_user", JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("rootbridge_user");
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("rootbridge_user", JSON.stringify(updatedUser));
  };

  return (
    <Router>
      <div id="app">
        <Navbar user={user} onLogout={handleLogout} />

        {/* Adds padding to prevent content overlapping with fixed navbar */}
        <div className="navbar-spacer"></div>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/signup"
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Signup onAuth={handleAuth} />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                user ? (
                  <Dashboard user={user} onUpdateUser={handleUpdateUser} />
                ) : (
                  <Navigate to="/signup" replace />
                )
              }
            />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
