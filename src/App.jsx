import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Shared layout (Elearn)
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

// Elearn pages
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// Learning world (converted from storyteller-s-library)
import LearnLayout from "./pages/learning/LearnLayout.jsx";
import KidHome from "./pages/learning/KidHome.jsx";
import TrackSelect from "./pages/learning/TrackSelect.jsx";
import TrackMap from "./pages/learning/TrackMap.jsx";
import ModuleView from "./pages/learning/ModuleView.jsx";
import LessonView from "./pages/learning/LessonView.jsx";
import ModuleQuest from "./pages/learning/ModuleQuest.jsx";

const SESSION_KEY = "rootbridge_user";

// Read the saved mock session once, when the app starts.
function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
    // Make sure "details" always exists, the Dashboard reads from it.
    return saved ? { ...saved, details: saved.details || {} } : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(loadSession);

  // Called after login, signup, and profile updates.
  const saveUser = (nextUser) => {
    const withDetails = { ...nextUser, details: nextUser.details || {} };
    setUser(withDetails);
    localStorage.setItem(SESSION_KEY, JSON.stringify(withDetails));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div id="app">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="navbar-spacer"></div>

        <main className="main-content">
          <Routes>
            {/* Public Elearn pages */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" replace /> : <Login onAuth={saveUser} />}
            />
            <Route
              path="/signup"
              element={user ? <Navigate to="/dashboard" replace /> : <Signup onAuth={saveUser} />}
            />

            {/* Protected: only for logged-in users */}
            <Route
              path="/dashboard"
              element={
                user ? (
                  <Dashboard user={user} onUpdateUser={saveUser} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Learning world: pages inside LearnLayout get the KidNav bar */}
            <Route path="/learn" element={<LearnLayout />}>
              <Route index element={<KidHome user={user} />} />
              <Route path="tracks" element={<TrackSelect />} />
              <Route path="track/:trackId" element={<TrackMap />} />
              <Route path="module/:moduleId" element={<ModuleView />} />
            </Route>

            {/* Focused screens: no KidNav, just an exit button */}
            <Route path="/learn/lesson/:lessonId" element={<LessonView />} />
            <Route path="/learn/module/:moduleId/quest" element={<ModuleQuest />} />

            {/* Anything else goes home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
