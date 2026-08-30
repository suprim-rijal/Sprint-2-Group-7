import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Mail, ChevronRight, ArrowLeft } from "lucide-react";

export default function Signup({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("parent"); // 'parent', 'learner', 'teacher', 'admin'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Role Theme definitions
  const themes = {
    parent: {
      color: "#4F46E5", // Indigo
      softBg: "rgba(79, 70, 229, 0.08)",
      accentLight: "#EEF2FF",
      emoji: "🦉",
      className: "bounce-item",
      title: "Parental Dashboard Hub",
      descriptor: "Manage spelling progress, kid time limits, and safe locks.",
      bulletPoints: [
        "Create restricted student sandbox tracks",
        "Control daily time limits & safety toggles",
        "Assess detailed vocabulary milestones logs",
      ],
    },
    learner: {
      color: "#D97706", // Gold
      softBg: "rgba(217, 119, 6, 0.08)",
      accentLight: "#FEF3C7",
      emoji: "🌍",
      className: "spin-item",
      title: "General Learning Tracks",
      descriptor:
        "Explore cultural trails and collect achievements milestones.",
      bulletPoints: [
        "Unrestricted primary educational paths",
        "Interact with SpeechSynthesis audio drills",
        "Unlock stamps inside heritage passports",
      ],
    },
    teacher: {
      color: "#DC2626", // Terracotta
      softBg: "rgba(220, 38, 38, 0.08)",
      accentLight: "#FEF2F2",
      emoji: "📖",
      className: "flip-item",
      title: "Instructor Portal Console",
      descriptor: "Coordinate lesson plans and view parent queries logs.",
      bulletPoints: [
        "Create custom lesson vocab cards modules",
        "Schedule live tutoring sessions on calendar",
        "Moderates student spelling and query logs",
      ],
    },
    admin: {
      color: "#059669", // Emerald Green
      softBg: "rgba(5, 150, 105, 0.08)",
      accentLight: "#ECFDF5",
      emoji: "🛡️",
      className: "pulse-item",
      title: "Administrator Terminal",
      descriptor: "Oversee server health diagnostics and content clearances.",
      bulletPoints: [
        "Review global telemetry status indices",
        "Moderate list of teacher lesson submissions",
        "Inspect and reply to website mail inbox queries",
      ],
    },
  };

  const activeTheme = themes[role] || themes.parent;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/signup";

    const payload = isLogin
      ? { email, password }
      : { email, password, name, role };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        onAuth(data.user);
        navigate("/dashboard");
      } else {
        setError(
          data.error || "Authentication failed. Please verify credentials.",
        );
      }
    } catch (err) {
      console.error("Auth submit error:", err);
      setError(
        "Connection failure. Check if the server is running on port 5000.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`onboard-wrap ${isLogin ? "login-active-state" : "signup-active-state"}`}
      style={{
        margin: "40px auto",
        maxWidth: "1050px",
        "--theme-color": activeTheme.color,
        "--theme-soft": activeTheme.softBg,
        "--theme-accent-light": activeTheme.accentLight,
      }}
    >
      {/* Sliding Sidebar Display Card */}
      <div className="onboard-side">
        <div style={{ position: "relative", zIndex: 3 }}>
          {/* Logo Title */}
          <div
            className="logo"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              color: "#fff",
            }}
            onClick={() => navigate("/")}
          >
            <svg
              className="mark"
              viewBox="0 0 40 40"
              fill="none"
              style={{ width: "32px", height: "32px" }}
            >
              <path
                d="M20 4c-7 0-11 5-11 11 0 5 3 8 7 9.5-1 3-4 4.5-7 4.2v3.3c6 .6 11-2.3 12.5-7.5 3.7-1 6.5-4.4 6.5-9C28 9 24.5 4 20 4z"
                fill="currentColor"
              />
            </svg>
            <span style={{ fontWeight: 800 }}>RootBridge</span>
          </div>

          {/* Dynamic Theme Content */}
          <div style={{ marginTop: "40px", transition: "all 0.4s ease" }}>
            <div
              className={`theme-visual ${activeTheme.className}`}
              style={{
                fontSize: "64px",
                display: "inline-block",
                marginBottom: "20px",
                lineHeight: 1,
              }}
            >
              {activeTheme.emoji}
            </div>
            <h2
              className="h-serif"
              style={{ color: "#fff", margin: "0 0 10px", fontSize: "28px" }}
            >
              {activeTheme.title}
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.75)",
                lineHeight: "1.5",
                margin: "0 0 30px",
              }}
            >
              {activeTheme.descriptor}
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {activeTheme.bulletPoints.map((point, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  <span style={{ color: "var(--gold)", fontWeight: "bold" }}>
                    ✦
                  </span>{" "}
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dynamic Background Gradient overlay */}
        <div
          className="sidebar-accent-gradient"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${activeTheme.color} 20%, #1e1b4b 100%)`,
            zIndex: 1,
            transition: "background 0.5s ease",
          }}
        />
      </div>

      {/* Auth Main Form Form Container */}
      <div className="onboard-main">
        {error && (
          <div
            className="success-banner"
            style={{
              background: "#FCE8E6",
              color: "#C53929",
              borderColor: "#F5B4AD",
              padding: "12px 16px",
              fontSize: "13.5px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div className="kicker">
          {isLogin ? "Members Check-In" : "Create Passport"}
        </div>
        <h1 className="h-display" style={{ margin: "4px 0 10px" }}>
          {isLogin ? "Welcome back" : "Select your role"}
        </h1>
        <p
          className="sub"
          style={{ margin: "0 0 24px", color: "var(--ink-soft)" }}
        >
          {isLogin
            ? "Log in to check student progress, streaks, and request Kofi's help."
            : "Select one of the 4 pathways below to start heritage exploration:"}
        </p>

        <form onSubmit={handleSubmit}>
          {/* 4-Tier Interactive Selector for signup */}
          {!isLogin && (
            <div className="field">
              <div
                className="role-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                {[
                  {
                    id: "parent",
                    label: "Parent / Child",
                    emoji: "👪",
                    sub: "Kid limits & safety",
                  },
                  {
                    id: "learner",
                    label: "General Learner",
                    emoji: "🎓",
                    sub: "For all ages",
                  },
                  {
                    id: "teacher",
                    label: "Teacher / Tutor",
                    emoji: "🍎",
                    sub: "Curation & classes",
                  },
                  {
                    id: "admin",
                    label: "Admin Board",
                    emoji: "🛡",
                    sub: "Moderation console",
                  },
                ].map((item) => {
                  const selected = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`role-card ${selected ? "selected-themed-card" : ""}`}
                      onClick={() => setRole(item.id)}
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "2px solid",
                        borderColor: selected
                          ? "var(--theme-color)"
                          : "var(--line)",
                        background: selected ? "var(--theme-soft)" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                      }}
                    >
                      <div style={{ fontSize: "22px", marginBottom: "4px" }}>
                        {item.emoji}
                      </div>
                      <b
                        style={{
                          display: "block",
                          fontSize: "14px",
                          color: selected ? "var(--theme-color)" : "inherit",
                        }}
                      >
                        {item.label}
                      </b>
                      <span
                        style={{ fontSize: "11px", color: "var(--ink-soft)" }}
                      >
                        {item.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="field">
              <label>Full name</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    role === "teacher"
                      ? "Adwoa Mensah"
                      : role === "admin"
                        ? "Console Admin"
                        : "Rohan Thapa"
                  }
                  required
                />
              </div>
            </div>
          )}

          <div className="field">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-block submit-themed-btn"
            disabled={loading}
            style={{
              marginTop: "16px",
              background: "var(--theme-color)",
              color: "#fff",
              border: "none",
              padding: "14px",
              borderRadius: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "transform 0.15s ease",
            }}
          >
            {loading ? (
              "Processing request..."
            ) : (
              <>
                {isLogin ? "Log In" : "Register Account"}{" "}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Switcher */}
        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "14px",
            color: "var(--ink-soft)",
          }}
        >
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => setIsLogin(false)}
                style={{
                  padding: 0,
                  fontWeight: "bold",
                  color: "var(--theme-color)",
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => setIsLogin(true)}
                style={{
                  padding: 0,
                  fontWeight: "bold",
                  color: "var(--theme-color)",
                }}
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
