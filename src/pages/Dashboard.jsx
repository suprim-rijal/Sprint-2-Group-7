import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getContactMessages, updateUser } from "../services/mockApi.js";
import {
  Heart,
  Compass,
  Award,
  MessageSquare,
  ShieldAlert,
  BarChart,
  Map,
  UserPlus,
  Star,
  BookOpen,
  Volume2,
  Mic,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Plus,
  X,
  Globe,
  User,
  Book,
  Settings,
  Shield,
  Activity,
  Layers,
  FileText,
} from "lucide-react";

// App.jsx only renders this page when a user is logged in,
// so "user" is always an object here.
export default function Dashboard({ user, onUpdateUser }) {
  // Roles shortcuts
  const isParent = user.role === "parent";
  // "student" is the role returned by the Sprint 2 mock login
  const isLearner = user.role === "learner" || user.role === "student";
  const isTeacher = user.role === "teacher";
  const isAdmin =
    user.role === "admin" || user.email === "admin@rootbridge.com";

  // Navigation tabs state
  // Roles map to initial active tabs:
  // parent -> 'parent-controls', learner -> 'dashboard', teacher -> 'classroom', admin -> 'analytics'
  const getInitialTab = () => {
    if (isParent) return user.details.childName ? "dashboard" : "onboarding";
    if (isTeacher) return "classroom";
    if (isAdmin) return "analytics";
    return "dashboard"; // learner
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [studentMode, setStudentMode] = useState(
    isParent && user.details.childName ? true : false,
  );

  // Parent onboarding form states
  const [onboardStep, setOnboardStep] = useState(0);
  const [childName, setChildName] = useState(user.details.childName || "");
  const [childAge, setChildAge] = useState(user.details.childAge || 9);
  const [childGender, setChildGender] = useState(
    user.details.childGender || "Female",
  );
  const [avatar, setAvatar] = useState(user.details.avatar || "👧🏾");
  const [learningPaths, setLearningPaths] = useState(
    user.details.learningPaths || [
      { country: "Ghana", flag: "🇬🇭", type: "language", label: "Twi" },
    ],
  );
  const [goals, setGoals] = useState(
    user.details.goals || ["Speak with family"],
  );
  const [level, setLevel] = useState(user.details.level || "Beginner");

  // Parent settings controls state
  const [timeLimit, setTimeLimit] = useState(user.details.timeLimit || 20);
  const [requireQuiz, setRequireQuiz] = useState(
    user.details.requireQuiz !== false,
  );
  const [weeklyGoal, setWeeklyGoal] = useState(user.details.weeklyGoal || 3);
  const [safeSearch, setSafeSearch] = useState(
    user.details.safeSearch !== false,
  );

  // Lesson & quiz card states
  const [lessonIndex, setLessonIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [quizPicked, setQuizPicked] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Matching game local states
  const initialCards = [
    { id: 1, text: "Akwaaba", type: "native", matchId: "welcome" },
    { id: 2, text: "Medaase", type: "native", matchId: "thanks" },
    { id: 3, text: "Agooo", type: "native", matchId: "hello" },
    { id: 4, text: "Welcome", type: "english", matchId: "welcome" },
    { id: 5, text: "Thank you", type: "english", matchId: "thanks" },
    { id: 6, text: "Hello", type: "english", matchId: "hello" },
  ];
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [matchedCardIds, setMatchedCardIds] = useState([]);

  // Kofi chat local states
  const [chatLog, setChatLog] = useState([
    {
      from: "kofi",
      text: `Hello! I'm Kofi, your heritage buddy. 🐦 Ready to explore traditions, vocabulary, or stories?`,
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Teacher custom lesson course planner states
  const [teacherLessons, setTeacherLessons] = useState([
    {
      id: 1,
      title: "Lesson 1: Common Greetings",
      track: "Twi, Ghana 🇬🇭",
      hours: "Intro",
      approved: true,
    },
    {
      id: 2,
      title: "Lesson 2: Family Names & Address",
      track: "Yoruba, Nigeria 🇳🇬",
      hours: "Intermediate",
      approved: false,
    },
    {
      id: 3,
      title: "Lesson 3: Animal Pronunciation",
      track: "Nepali, Nepal 🇳🇵",
      hours: "Basic",
      approved: true,
    },
  ]);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonTrack, setNewLessonTrack] = useState("Twi, Ghana 🇬🇭");
  const [newLessonLevel, setNewLessonLevel] = useState("Beginner");

  // Admin and teacher fetch data states
  const [allUsers, setAllUsers] = useState([
    {
      id: 1,
      name: "Sarah Test",
      email: "sarahtest@example.com",
      role: "parent",
      details: { childName: "Ama", xp: 350 },
    },
    {
      id: 2,
      name: "Adwoa Tutor",
      email: "adwoa@example.com",
      role: "teacher",
      details: {},
    },
    {
      id: 3,
      name: "Rohan Learner",
      email: "rohan@example.com",
      role: "learner",
      details: { xp: 120 },
    },
  ]);
  const [feedbackMessages, setFeedbackMessages] = useState([]);

  // Fetch feedback/messages for teacher and admin
  useEffect(() => {
    if (isAdmin || isTeacher) {
      // Sprint 2: mockApi simulates GET /api/contact/messages
      getContactMessages()
        .then((data) => setFeedbackMessages(data.messages || []))
        .catch((err) => console.error("Error loading inquiries:", err));
    }
  }, [isAdmin, isTeacher]);

  // Toast notifier helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Speaks terms aloud using computer speech synthesis
  const speakText = (text, languageCode = "en-US") => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = languageCode;
      speech.rate = 0.85;
      window.speechSynthesis.speak(speech);
      triggerToast(`🔊 Playing pronunciation for: "${text}"`);
    } else {
      triggerToast("🔊 Audio device not supported by this browser");
    }
  };

  // Profile fields helper updates
  const handleUpdateDetails = async (updatedDetails) => {
    try {
      // Sprint 2: mockApi simulates POST /api/users/update
      const data = await updateUser({ userId: user.id, details: updatedDetails });
      onUpdateUser(data.user);
    } catch (err) {
      console.error("API updates fail:", err);
    }
  };

  // Complete child setup onboarding
  const saveOnboarding = () => {
    const kidDetails = {
      childName,
      childAge,
      childGender,
      avatar,
      learningPaths,
      goals,
      level,
      xp: 200,
      streak: 1,
    };
    handleUpdateDetails(kidDetails);
    setStudentMode(true);
    setActiveTab("dashboard");
  };

  // Toggle path select list
  const handleTogglePath = (country, flag, label) => {
    const isSelected = learningPaths.some((p) => p.label === label);
    const updated = isSelected
      ? learningPaths.filter((p) => p.label !== label)
      : [...learningPaths, { country, flag, label }];
    setLearningPaths(updated);
  };

  // Mock speech recorder analysis
  const toggleRecording = () => {
    if (!recording) {
      setRecording(true);
      triggerToast("🎤 Listening... Speak now!");
      setTimeout(() => {
        setRecording(false);
        triggerToast("✨ Speech matches! Well done! +15 XP");
        handleUpdateDetails({ xp: (user.details.xp || 200) + 15 });
      }, 2000);
    }
  };

  // Card matching game rules
  const handleCardClick = (card) => {
    if (matchedCardIds.includes(card.id)) return;
    if (selectedCard && selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }
    if (!selectedCard) {
      setSelectedCard(card);
    } else {
      if (
        selectedCard.type !== card.type &&
        selectedCard.matchId === card.matchId
      ) {
        const nextMatched = [...matchedCardIds, selectedCard.id, card.id];
        setMatchedCardIds(nextMatched);
        triggerToast("🎉 Match found!");
        setSelectedCard(null);

        if (nextMatched.length === cards.length) {
          triggerToast("🏆 Perfect score! +40 XP");
          handleUpdateDetails({ xp: (user.details.xp || 200) + 40 });
        }
      } else {
        triggerToast("❌ Incorrect match. Try again!");
        setSelectedCard(null);
      }
    }
  };

  // Initialize matching game layout
  useEffect(() => {
    if (activeTab === "minigame") {
      setCards([...initialCards].sort(() => Math.random() - 0.5));
      setSelectedCard(null);
      setMatchedCardIds([]);
    }
  }, [activeTab]);

  // Chat message helper
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { from: "user", text: chatInput };
    setChatLog((prev) => [...prev, userMsg]);
    const term = chatInput.toLowerCase();
    setChatInput("");

    let reply =
      "I love this inquiry! Ask me to define Twi words like 'Akwaaba', or tell me what culture you wish to explore next.";
    if (term.includes("hi") || term.includes("hello")) {
      reply = `Hello! How can I help your language and cultural research journey today?`;
    } else if (term.includes("story") || term.includes("ananse")) {
      reply =
        "Ananse the spider is a famous West African trickster story figure. He teaches wisdom, wit, and humor!";
    } else if (term.includes("nepal")) {
      reply =
        "Swagat Cha means 'Welcome' in Nepali! Nepal is famous for its gorgeous Himalayan culture and mountain traditions. 🏔️";
    } else if (term.includes("akwaaba")) {
      reply =
        "Akwaaba is 'Welcome' in Twi (Ghana). When you receive Akwaaba, you reply with 'Medaase' which translates to 'Thank you'!";
    }
    setTimeout(() => {
      setChatLog((prev) => [...prev, { from: "kofi", text: reply }]);
    }, 900);
  };

  // Add course lesson for Teacher
  const handleCreateLesson = (e) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    const newL = {
      id: Date.now(),
      title: newLessonTitle,
      track: newLessonTrack,
      hours: newLessonLevel,
      approved: false,
    };
    setTeacherLessons([newL, ...teacherLessons]);
    setNewLessonTitle("");
    triggerToast("📝 Lesson outline added and sent for admin review!");
  };

  // Approve lesson toggle for Admin
  const handleToggleApprove = (lessonId) => {
    setTeacherLessons(
      teacherLessons.map((l) =>
        l.id === lessonId ? { ...l, approved: !l.approved } : l,
      ),
    );
    triggerToast("🛡️ Course status updated!");
  };

  // Delete message for Admin/Teacher
  const handleDeleteFeedback = (msgId) => {
    setFeedbackMessages(feedbackMessages.filter((m) => m.id !== msgId));
    triggerToast("🗑️ Support inquiry dismissed.");
  };

  // Helper age tier details
  const getAgeBand = (age) => {
    const parsedAge = Number(age) || 9;
    if (parsedAge <= 8)
      return {
        name: "Little Explorer",
        icon: "🌱",
        text: "Interactive simple sounds and rich image prompts.",
      };
    if (parsedAge <= 12)
      return {
        name: "Cultural Discoverer",
        icon: "🧭",
        text: "Balanced speech recording, word matching, and folklore games.",
      };
    return {
      name: "Global Pathfinder",
      icon: "🗺️",
      text: "Deeper cultural dialogues, advanced phrasing, and independence.",
    };
  };

  // --- RENDER 1: PARENT ONBOARDING ---
  if (isParent && activeTab === "onboarding") {
    const tier = getAgeBand(childAge);
    return (
      <div
        className="onboard-wrap"
        style={{ margin: "40px auto", maxWidth: "1000px" }}
      >
        <div className="onboard-side">
          <div>
            <span style={{ fontSize: "28px" }}>👪</span>
            <h2 className="h-serif">Setup your child's space</h2>
            <p style={{ fontSize: "13px", opacity: 0.85, marginTop: "10px" }}>
              Configure safety, level filters, and goals to build custom
              heritage pathways.
            </p>
          </div>
          <div className="step-list">
            {["Kid Details", "Language paths", "Interests", "Review"].map(
              (step, idx) => (
                <div
                  key={idx}
                  className={`step-item ${onboardStep === idx ? "active" : onboardStep > idx ? "done" : ""}`}
                >
                  <div className="dot">{onboardStep > idx ? "✓" : idx + 1}</div>{" "}
                  {step}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="onboard-main">
          {onboardStep === 0 && (
            <div>
              <div className="kicker">Step 1 of 4</div>
              <h1>Who is learning today?</h1>
              <p className="sub">
                This configures avatars, learning bands, and progress maps.
              </p>
              <div className="field">
                <label>First Name / Nickname</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Ama or Sam"
                  required
                />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Age</label>
                  <input
                    type="number"
                    min="4"
                    max="18"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Gender</label>
                  <select
                    value={childGender}
                    onChange={(e) => setChildGender(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "13px 15px",
                      borderRadius: "12px",
                      border: "1.5px solid var(--line)",
                    }}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Choose Avatar Icon</label>
                <div
                  className="avatar-grid"
                  style={{ display: "flex", gap: "10px" }}
                >
                  {["🦁", "🐼", "🦊", "🦉", "👧🏾", "👦🏽"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`avatar-opt ${avatar === emoji ? "selected" : ""}`}
                      style={{
                        fontSize: "24px",
                        padding: "10px",
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        border:
                          avatar === emoji
                            ? "3px solid var(--indigo)"
                            : "1px solid var(--line)",
                        background:
                          avatar === emoji
                            ? "var(--indigo-soft)"
                            : "transparent",
                      }}
                      onClick={() => setAvatar(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div
                style={{
                  padding: "14px",
                  border: "1px solid var(--line)",
                  borderRadius: "12px",
                  background: "var(--paper)",
                  margin: "16px 0",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "20px" }}>{tier.icon}</span>
                <div>
                  <strong>{tier.name} Tier</strong>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "12px",
                      color: "var(--ink-soft)",
                    }}
                  >
                    {tier.text}
                  </p>
                </div>
              </div>
              <button
                className="btn btn-dark"
                disabled={!childName}
                onClick={() => setOnboardStep(1)}
              >
                Next step <ArrowRight size={16} />
              </button>
            </div>
          )}

          {onboardStep === 1 && (
            <div>
              <div className="kicker">Step 2 of 4</div>
              <h1>Choose active learning paths</h1>
              <p className="sub">
                Select the heritage trails and dialects you would like to
                introduce.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                {[
                  {
                    label: "Twi Language (Ghana)",
                    flag: "🇬🇭",
                    country: "Ghana",
                  },
                  {
                    label: "Yoruba Language (Nigeria)",
                    flag: "🇳🇬",
                    country: "Nigeria",
                  },
                  {
                    label: "Nepali Language (Nepal)",
                    flag: "🇳🇵",
                    country: "Nepal",
                  },
                ].map((item) => {
                  const active = learningPaths.some(
                    (p) => p.label === item.label,
                  );
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={`btn ${active ? "btn-green" : "btn-ghost"}`}
                      style={{ justifyContent: "flex-start", width: "100%" }}
                      onClick={() =>
                        handleTogglePath(item.country, item.flag, item.label)
                      }
                    >
                      <span style={{ marginRight: "10px" }}>{item.flag}</span>{" "}
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setOnboardStep(0)}
                >
                  Back
                </button>
                <button
                  className="btn btn-dark"
                  disabled={learningPaths.length === 0}
                  onClick={() => setOnboardStep(2)}
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {onboardStep === 2 && (
            <div>
              <div className="kicker">Step 3 of 4</div>
              <h1>Select core interests</h1>
              <p className="sub">
                Customize the quizzes and storytelling plots around family
                goals.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                {[
                  "Speak with grandparents",
                  "Explore seasonal festivals",
                  "Learn spelling games",
                  "Heritage travels prep",
                ].map((g) => {
                  const hasG = goals.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      className={`btn ${hasG ? "btn-primary" : "btn-ghost"}`}
                      style={{ justifyContent: "flex-start", width: "100%" }}
                      onClick={() =>
                        setGoals(
                          hasG ? goals.filter((x) => x !== g) : [...goals, g],
                        )
                      }
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setOnboardStep(1)}
                >
                  Back
                </button>
                <button
                  className="btn btn-dark"
                  onClick={() => setOnboardStep(3)}
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {onboardStep === 3 && (
            <div>
              <div className="kicker">Step 4 of 4</div>
              <h1>Ready to begin exploration!</h1>
              <p className="sub">
                Confirm configurations to initialize safe student workspace.
              </p>
              <div
                style={{
                  padding: "20px",
                  border: "1px solid var(--line)",
                  borderRadius: "16px",
                  background: "var(--bg-soft)",
                  marginBottom: "20px",
                }}
              >
                <div style={{ fontSize: "36px" }}>{avatar}</div>
                <h2>
                  {childName} ({childAge} years old)
                </h2>
                <div
                  style={{
                    margin: "10px 0",
                    fontSize: "14px",
                    color: "var(--ink-soft)",
                  }}
                >
                  <strong>Goal:</strong> {goals.join(", ")}
                </div>
                <div>
                  <strong>Primary Path:</strong>{" "}
                  {learningPaths.map((p) => `${p.flag} ${p.label}`).join(", ")}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setOnboardStep(2)}
                >
                  Back
                </button>
                <button className="btn btn-green" onClick={saveOnboarding}>
                  Start Learning Space <CheckCircle size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER 2: PARENT CONTROLS VIEW (If parent switches out of studentMode) ---
  if (isParent && !studentMode) {
    return (
      <div className="dashboard-wrap">
        <div className="dash-sidebar">
          <div className="logo">
            <span style={{ marginRight: "8px" }}>👪</span> Parent Panel
          </div>
          <button
            className={`dash-nav-item ${activeTab === "parent-controls" ? "active" : ""}`}
            onClick={() => setActiveTab("parent-controls")}
          >
            <Settings className="ic" /> Control Board
          </button>
          <button
            className="dash-nav-item"
            style={{
              background: "var(--gold)",
              color: "var(--ink)",
              fontWeight: "bold",
              marginTop: "24px",
            }}
            onClick={() => setStudentMode(true)}
          >
            <User className="ic" /> Enter Kid Mode
          </button>
        </div>

        <div className="dash-main">
          <h1>Parental Control & Safekeep Dashboard</h1>
          <p
            className="sub"
            style={{ color: "var(--ink-soft)", margin: "-10px 0 30px" }}
          >
            Monitor {user.details.childName}'s streak progress and safe language
            permissions.
          </p>

          <div className="dash-grid">
            <div>
              <div className="big-card" style={{ marginBottom: "24px" }}>
                <h3>Screen-time & Quota Controls</h3>

                {/* Quota slider limit */}
                <div
                  style={{
                    borderBottom: "1.5px solid var(--line)",
                    padding: "20px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>Daily Learning Limit</strong>
                    <span
                      style={{ color: "var(--terracotta)", fontWeight: "bold" }}
                    >
                      {timeLimit} minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={timeLimit}
                    onChange={(e) => {
                      setTimeLimit(e.target.value);
                      handleUpdateDetails({ timeLimit: e.target.value });
                    }}
                    style={{ width: "100%" }}
                  />
                </div>

                {/* Safe search filter */}
                <div
                  style={{
                    borderBottom: "1.5px solid var(--line)",
                    padding: "20px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>Kid-Safety Search Mode</strong>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--ink-soft)",
                        marginTop: "2px",
                      }}
                    >
                      Restricts chat interactions to safe educational boundaries
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`switch-btn ${safeSearch ? "green" : ""}`}
                    style={{
                      background: safeSearch ? "var(--green)" : "var(--line)",
                      width: "50px",
                      height: "26px",
                      borderRadius: "13px",
                      border: "none",
                      position: "relative",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSafeSearch(!safeSearch);
                      handleUpdateDetails({ safeSearch: !safeSearch });
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#fff",
                        position: "absolute",
                        top: "4px",
                        left: safeSearch ? "28px" : "4px",
                        transition: "left 0.2s",
                      }}
                    />
                  </button>
                </div>

                {/* Strict Quiz lock */}
                <div
                  style={{
                    padding: "20px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>Require Quizzes for Stamps</strong>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--ink-soft)",
                        marginTop: "2px",
                      }}
                    >
                      Requires full quiz score to grant stamps
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`switch-btn ${requireQuiz ? "green" : ""}`}
                    style={{
                      background: requireQuiz ? "var(--green)" : "var(--line)",
                      width: "50px",
                      height: "26px",
                      borderRadius: "13px",
                      border: "none",
                      position: "relative",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setRequireQuiz(!requireQuiz);
                      handleUpdateDetails({ requireQuiz: !requireQuiz });
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#fff",
                        position: "absolute",
                        top: "4px",
                        left: requireQuiz ? "28px" : "4px",
                        transition: "left 0.2s",
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* Weekly calendar tracker */}
              <div className="big-card">
                <h3>Ama's Activity Calendar</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "10px",
                    marginTop: "16px",
                  }}
                >
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, i) => (
                      <div
                        key={day}
                        style={{
                          textAlign: "center",
                          padding: "10px",
                          background:
                            i <= 2 ? "var(--green-soft)" : "var(--bg-soft)",
                          borderRadius: "10px",
                          color: i <= 2 ? "var(--green)" : "var(--ink-soft)",
                          fontWeight: "bold",
                        }}
                      >
                        {day}
                        <div style={{ fontSize: "10px", marginTop: "4px" }}>
                          {i <= 2 ? "⭐" : "•"}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div>
              {/* Avatar Summary card */}
              <div className="side-card" style={{ background: "var(--paper)" }}>
                <h3>Active Child Account</h3>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    margin: "16px 0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "36px",
                      background: "var(--gold-soft)",
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {avatar}
                  </div>
                  <div>
                    <strong>
                      {childName} ({childAge} y.o)
                    </strong>
                    <div style={{ fontSize: "12px", color: "var(--ink-soft)" }}>
                      Level: {level}
                    </div>
                  </div>
                </div>
                <div>
                  <strong>Selected Learning Paths:</strong>
                  {learningPaths.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <span>{p.flag}</span>
                      <span>{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 3: EXPLORER VIEW (Shared by Child and General Learner) ---
  if (studentMode || isLearner) {
    const activeChildName = isLearner ? user.name : childName;
    const activeAvatar = isLearner ? "🎓" : avatar;

    return (
      <div className="dashboard-wrap">
        <div className="dash-sidebar">
          <div className="logo">
            {isLearner ? "🏆 Learner Portal" : `👧 ${childName}'s Space`}
          </div>
          <button
            className={`dash-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <Compass className="ic" /> Home Track
          </button>
          <Link to="/learn" className="dash-nav-item">
            <Globe className="ic" /> Nepali Course
          </Link>
          <button
            className={`dash-nav-item ${activeTab === "course" ? "active" : ""}`}
            onClick={() => setActiveTab("course")}
          >
            <BookOpen className="ic" /> Lessons List
          </button>
          <button
            className={`dash-nav-item ${activeTab === "passport" ? "active" : ""}`}
            onClick={() => setActiveTab("passport")}
          >
            <Map className="ic" /> Passport Stamps
          </button>
          <button
            className={`dash-nav-item ${activeTab === "kofi" ? "active" : ""}`}
            onClick={() => setActiveTab("kofi")}
          >
            <MessageSquare className="ic" /> Ask Kofi Tutor
          </button>

          {isParent && (
            <div
              style={{
                marginTop: "auto",
                borderTop: "1.5px solid rgba(255,255,255,0.1)",
                paddingTop: "20px",
              }}
            >
              <button
                className="dash-nav-item"
                style={{
                  background: "rgba(226,161,48,0.15)",
                  color: "var(--gold)",
                }}
                onClick={() => {
                  setStudentMode(false);
                  setActiveTab("parent-controls");
                }}
              >
                <Settings className="ic" /> Parent Console
              </button>
            </div>
          )}
        </div>

        <div className="dash-main">
          {toastMessage && (
            <div
              className="praise-toast"
              style={{ bottom: "30px", opacity: 0.95 }}
            >
              {toastMessage}
            </div>
          )}

          {/* User top status header */}
          <div
            className="dash-topbar"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h2>
              {activeAvatar} Welcome, {activeChildName}!
            </h2>
            <div
              className="dash-stats"
              style={{ display: "flex", gap: "10px" }}
            >
              <div
                className="stat-chip"
                style={{
                  background: "var(--gold-soft)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                }}
              >
                🔥 {user.details.streak || 3} Day Streak
              </div>
              <div
                className="stat-chip"
                style={{
                  background: "var(--indigo-soft)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                }}
              >
                ⭐ {user.details.xp || 200} XP
              </div>
            </div>
          </div>

          {/* Tab 1: Dashboard Home */}
          {activeTab === "dashboard" && (
            <div className="dash-grid">
              <div>
                <div
                  className="continue-card"
                  style={{
                    background: "var(--indigo)",
                    color: "#fff",
                    padding: "30px",
                    borderRadius: "24px",
                    position: "relative",
                    overflow: "hidden",
                    marginBottom: "24px",
                  }}
                >
                  <span
                    className="tag"
                    style={{
                      border: "2px solid #8e80d4",
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      background: "rgba(255,255,255,0.1)",
                    }}
                  >
                    NEXT TOPIC
                  </span>
                  <h2 style={{ fontSize: "28px", margin: "12px 0 4px" }}>
                    Greetings: Lesson 1
                  </h2>
                  <p
                    style={{
                      opacity: 0.8,
                      fontSize: "14.5px",
                      marginBottom: "20px",
                    }}
                  >
                    Practice simple greetings and responses in Twi dialect
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setLessonIndex(0);
                      setActiveTab("lesson");
                    }}
                  >
                    Practice Now <ArrowRight size={16} />
                  </button>
                </div>

                <div
                  className="row-cards"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div
                    className="mini-card"
                    style={{
                      background: "#fff",
                      border: "1.5px solid var(--line)",
                      padding: "24px",
                      borderRadius: "20px",
                    }}
                  >
                    <h3>🎮 Match Cards</h3>
                    <p
                      style={{
                        color: "var(--ink-soft)",
                        fontSize: "13.5px",
                        margin: "8px 0 16px",
                      }}
                    >
                      Connect phrases to test vocabulary recall speed.
                    </p>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setActiveTab("minigame")}
                    >
                      Play match tiles
                    </button>
                  </div>
                  <div
                    className="mini-card"
                    style={{
                      background: "#fff",
                      border: "1.5px solid var(--line)",
                      padding: "24px",
                      borderRadius: "20px",
                    }}
                  >
                    <h3>🏆 Spelling Challenge</h3>
                    <p
                      style={{
                        color: "var(--ink-soft)",
                        fontSize: "13.5px",
                        margin: "8px 0 16px",
                      }}
                    >
                      Finish a quick vocabulary quiz to gain stamp rewards.
                    </p>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setActiveTab("quiz")}
                    >
                      Take quiz
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className="side-card"
                  style={{
                    background: "var(--paper)",
                    padding: "20px",
                    borderRadius: "20px",
                    border: "1.5px solid var(--line)",
                    marginBottom: "20px",
                  }}
                >
                  <h3 style={{ margin: "0 0 12px" }}>🌍 Active Pathways</h3>
                  {learningPaths.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom:
                          i < learningPaths.length - 1
                            ? "1px solid var(--line)"
                            : "none",
                      }}
                    >
                      <span style={{ fontSize: "22px" }}>{p.flag}</span>
                      <div>
                        <strong>{p.label}</strong>
                        <div
                          style={{ fontSize: "11px", color: "var(--ink-soft)" }}
                        >
                          Level: {level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="side-card"
                  style={{
                    background: "var(--paper)",
                    padding: "20px",
                    borderRadius: "20px",
                    border: "1.5px solid var(--line)",
                  }}
                >
                  <h3 style={{ margin: "0 0 12px" }}>🤖 Voice Assistant</h3>
                  <p style={{ fontSize: "13px", color: "var(--ink-soft)" }}>
                    Ask Kofi spelling and cultural translation queries.
                  </p>
                  <button
                    className="btn btn-dark btn-sm btn-block"
                    onClick={() => setActiveTab("kofi")}
                  >
                    Chat with helper
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Lessons List */}
          {activeTab === "course" && (
            <div className="big-card">
              <h3>Primary Lessons</h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                {[
                  {
                    id: 1,
                    title: "Lesson 1: Common Greetings",
                    description: "Learn Akwaaba, Medaase, and Agooo.",
                    active: true,
                  },
                  {
                    id: 2,
                    title: "Lesson 2: Family & Kinship",
                    description: "Learn terms for Nana, Agya, and Ena.",
                    active: true,
                  },
                  {
                    id: 3,
                    title: "Lesson 3: Animal Names",
                    description:
                      "Learn vocabulary for lion, elephant, and owl.",
                    active: false,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid var(--line)",
                      padding: "16px 20px",
                      borderRadius: "16px",
                      background: item.active
                        ? "#fff"
                        : "rgba(255,255,255,0.4)",
                      opacity: item.active ? 1 : 0.6,
                    }}
                  >
                    <div>
                      <strong>{item.title}</strong>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "12.5px",
                          color: "var(--ink-soft)",
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                    {item.active ? (
                      <button
                        className="btn btn-dark btn-sm"
                        onClick={() => {
                          setLessonIndex(item.id - 1);
                          setActiveTab("lesson");
                        }}
                      >
                        Practice
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: "12px",
                          background: "var(--bg-soft)",
                          padding: "4px 10px",
                          borderRadius: "20px",
                        }}
                      >
                        🔒 Locked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Cultural Passport */}
          {activeTab === "passport" && (
            <div className="big-card">
              <h3>Heritage Passport Achievements</h3>
              <p className="sub">Complete spelling quizzes to gain stamps.</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "20px",
                  marginTop: "20px",
                }}
              >
                {[
                  { name: "Elmina Castle (Ghana)", flag: "🏰", unlocked: true },
                  {
                    name: "Kathmandu Valley (Nepal)",
                    flag: "🏔️",
                    unlocked: user.details.xp >= 250,
                  },
                  {
                    name: "Yankari Plains (Nigeria)",
                    flag: "🐘",
                    unlocked: user.details.xp >= 350,
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      border: item.unlocked
                        ? "2px solid var(--green)"
                        : "2px dashed var(--line)",
                      background: item.unlocked ? "var(--green-soft)" : "#fff",
                      opacity: item.unlocked ? 1 : 0.5,
                      borderRadius: "16px",
                    }}
                  >
                    <div style={{ fontSize: "36px", margin: "0 auto 10px" }}>
                      {item.flag}
                    </div>
                    <strong>{item.name}</strong>
                    <div
                      style={{
                        color: item.unlocked
                          ? "var(--green)"
                          : "var(--ink-soft)",
                        fontWeight: "bold",
                        fontSize: "11px",
                        marginTop: "8px",
                      }}
                    >
                      {item.unlocked ? "★ STAMP UNLOCKED" : "LOCKED"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Ask Kofi chat */}
          {activeTab === "kofi" && (
            <div
              className="big-card"
              style={{
                height: "500px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  borderBottom: "1.5px solid var(--line)",
                  paddingBottom: "12px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "28px" }}>🐦</span>
                <div>
                  <h4 style={{ margin: "0" }}>Kofi Assistant</h4>
                  <span style={{ fontSize: "11px", color: "var(--green)" }}>
                    🟢 Online Helper
                  </span>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {chatLog.map((chat, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf:
                        chat.from === "user" ? "flex-end" : "flex-start",
                      background:
                        chat.from === "user"
                          ? "var(--indigo)"
                          : "var(--bg-soft)",
                      color: chat.from === "user" ? "#fff" : "var(--ink)",
                      padding: "10px 14px",
                      borderRadius: "16px",
                      maxWidth: "80%",
                      fontSize: "14px",
                    }}
                  >
                    {chat.text}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "10px",
                  overflowX: "auto",
                }}
              >
                {[
                  "Tell me a story about Ananse!",
                  "Explain what 'Akwaaba' means.",
                  "Tell me about Nepal!",
                ].map((q) => (
                  <button
                    key={q}
                    className="btn btn-ghost btn-sm"
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => {
                      setChatInput(q);
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <form
                onSubmit={handleSendChat}
                style={{ display: "flex", gap: "10px" }}
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1.5px solid var(--line)",
                    outline: "none",
                  }}
                />
                <button type="submit" className="btn btn-dark btn-sm">
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Tab 5: Pronunciation details cards */}
          {activeTab === "lesson" && (
            <div
              className="big-card"
              style={{
                textAlign: "center",
                maxWidth: "600px",
                margin: "20px auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <button
                  className="link-btn"
                  onClick={() => setActiveTab("dashboard")}
                >
                  <ArrowLeft size={16} /> Exit Lesson
                </button>
                <strong>Twi Greetings Card</strong>
              </div>

              {lessonIndex === 0 && (
                <div>
                  <span style={{ fontSize: "56px" }}>👋</span>
                  <h1
                    className="h-display"
                    style={{ color: "var(--terracotta)", margin: "16px 0 4px" }}
                  >
                    Akwaaba
                  </h1>
                  <p style={{ color: "var(--ink-soft)", fontSize: "18px" }}>
                    Means: "Welcome"
                  </p>
                  <div
                    style={{
                      padding: "14px",
                      background: "var(--bg-soft)",
                      borderRadius: "10px",
                      margin: "16px 0",
                      fontSize: "14px",
                    }}
                  >
                    Phrase: <em>"Akwaaba fie"</em> (Welcome home)
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => speakText("Akwaaba", "en")}
                  >
                    🔊 Play Audio
                  </button>
                </div>
              )}

              {lessonIndex === 1 && (
                <div>
                  <span style={{ fontSize: "56px" }}>🙏</span>
                  <h1
                    className="h-display"
                    style={{ color: "var(--terracotta)", margin: "16px 0 4px" }}
                  >
                    Medaase
                  </h1>
                  <p style={{ color: "var(--ink-soft)", fontSize: "18px" }}>
                    Means: "Thank you"
                  </p>
                  <div
                    style={{
                      padding: "14px",
                      background: "var(--bg-soft)",
                      borderRadius: "10px",
                      margin: "16px 0",
                      fontSize: "14px",
                    }}
                  >
                    Phrase: <em>"Medaase pii"</em> (Thank you very much)
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => speakText("Medaase", "en")}
                  >
                    🔊 Play Audio
                  </button>
                </div>
              )}

              {lessonIndex === 2 && (
                <div>
                  <span style={{ fontSize: "56px" }}>🚪</span>
                  <h1
                    className="h-display"
                    style={{ color: "var(--terracotta)", margin: "16px 0 4px" }}
                  >
                    Agooo
                  </h1>
                  <p style={{ color: "var(--ink-soft)", fontSize: "18px" }}>
                    Means: "Hello / Knock Knock"
                  </p>
                  <div
                    style={{
                      padding: "14px",
                      background: "var(--bg-soft)",
                      borderRadius: "10px",
                      margin: "16px 0",
                      fontSize: "14px",
                    }}
                  >
                    Phrase: <em>"Agooo meba"</em> (Hello, I'm coming)
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => speakText("Agooo", "en")}
                  >
                    🔊 Play Audio
                  </button>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  marginTop: "30px",
                }}
              >
                <button
                  className={`icon-btn ${recording ? "recording" : ""}`}
                  style={{
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    cursor: "pointer",
                    border: "1.5px solid var(--line)",
                  }}
                  onClick={toggleRecording}
                >
                  <Mic style={{ color: recording ? "red" : "black" }} />
                </button>
                {lessonIndex < 2 ? (
                  <button
                    className="btn btn-dark"
                    onClick={() => setLessonIndex(lessonIndex + 1)}
                  >
                    Next Word <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab("minigame")}
                  >
                    Play Match Game <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 6: Match Tiles Game */}
          {activeTab === "minigame" && (
            <div className="big-card" style={{ textAlign: "center" }}>
              <h3>Matching Tiles Game</h3>
              <p className="sub">
                Match the Twi words to their English meaning.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                  maxWidth: "450px",
                  margin: "20px auto",
                }}
              >
                {cards.map((card) => {
                  const active = selectedCard?.id === card.id;
                  const matched = matchedCardIds.includes(card.id);
                  return (
                    <button
                      key={card.id}
                      disabled={matched}
                      type="button"
                      className={`btn`}
                      style={{
                        padding: "20px",
                        display: "flex",
                        justifyContent: "center",
                        border: matched
                          ? "2px solid var(--green)"
                          : active
                            ? "2px solid var(--indigo)"
                            : "1px solid var(--line)",
                        background: matched
                          ? "var(--green-soft)"
                          : active
                            ? "var(--indigo-soft)"
                            : "#fff",
                        opacity: matched ? 0.5 : 1,
                      }}
                      onClick={() => handleCardClick(card)}
                    >
                      {card.text}
                    </button>
                  );
                })}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                <button
                  className="btn btn-ghost"
                  onClick={() => setActiveTab("lesson")}
                >
                  Back
                </button>
                <button
                  className="btn btn-dark"
                  disabled={matchedCardIds.length < cards.length}
                  onClick={() => setActiveTab("quiz")}
                >
                  Go to Quiz
                </button>
              </div>
            </div>
          )}

          {/* Tab 7: Final Quiz */}
          {activeTab === "quiz" && (
            <div
              className="big-card"
              style={{
                maxWidth: "500px",
                margin: "20px auto",
                textAlign: "center",
              }}
            >
              <span className="kicker">Spelling quiz</span>
              <h2 style={{ margin: "14px 0" }}>
                What is the translation for: "Medaase"?
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  { id: "a", text: "Welcome" },
                  { id: "b", text: "Thank you" },
                  { id: "c", text: "Hello" },
                ].map((opt) => {
                  const picked = quizPicked === opt.id;
                  const showAnswer = quizAnswered;
                  const isCorrect = opt.id === "b";
                  let borderClr = "var(--line)";
                  let bgClr = "#fff";

                  if (showAnswer) {
                    if (isCorrect) {
                      borderClr = "var(--green)";
                      bgClr = "var(--green-soft)";
                    } else if (picked) {
                      borderClr = "var(--terracotta)";
                      bgClr = "var(--terracotta-soft)";
                    }
                  } else if (picked) {
                    borderClr = "var(--indigo)";
                    bgClr = "var(--indigo-soft)";
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className="btn"
                      style={{
                        justifyContent: "flex-start",
                        width: "100%",
                        border: `2px solid ${borderClr}`,
                        background: bgClr,
                      }}
                      onClick={() => {
                        if (quizAnswered) return;
                        setQuizPicked(opt.id);
                        setQuizAnswered(true);
                        if (isCorrect) {
                          triggerToast("🎉 Correct! Stamp unlocked! +50 XP");
                          handleUpdateDetails({
                            xp: (user.details.xp || 200) + 50,
                          });
                        } else {
                          triggerToast("❌ Incorrect translation. Try again!");
                        }
                      }}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
              {quizAnswered && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "20px" }}
                  onClick={() => {
                    setQuizAnswered(false);
                    setQuizPicked(null);
                    setActiveTab("dashboard");
                  }}
                >
                  Finish Quiz
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER 4: TEACHER VIEW ---
  if (isTeacher) {
    return (
      <div className="dashboard-wrap">
        <div className="dash-sidebar">
          <div className="logo">
            <span style={{ marginRight: "8px" }}>🎒</span> Teacher Portal
          </div>
          <button
            className={`dash-nav-item ${activeTab === "classroom" ? "active" : ""}`}
            onClick={() => setActiveTab("classroom")}
          >
            <Compass className="ic" /> Classroom Overview
          </button>
          <button
            className={`dash-nav-item ${activeTab === "planner" ? "active" : ""}`}
            onClick={() => setActiveTab("planner")}
          >
            <BookOpen className="ic" /> Lessons Planner
          </button>
          <button
            className={`dash-nav-item ${activeTab === "inquiries" ? "active" : ""}`}
            onClick={() => setActiveTab("inquiries")}
          >
            <MessageSquare className="ic" /> Parent Inquiries
          </button>
        </div>

        <div className="dash-main">
          {toastMessage && (
            <div className="praise-toast" style={{ bottom: "30px" }}>
              {toastMessage}
            </div>
          )}

          {activeTab === "classroom" && (
            <div>
              <h1>Instructor Workspace: {user.name}</h1>
              <p className="sub">
                Explore student progress lists, classroom schedules, and
                learning materials.
              </p>

              <div className="big-card" style={{ marginBottom: "24px" }}>
                <h3>Active Classroom Registry</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginTop: "16px",
                  }}
                >
                  <div
                    style={{
                      border: "1px solid var(--line)",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "#fff",
                    }}
                  >
                    <strong>Ama Owusu</strong>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--ink-soft)",
                        marginTop: "4px",
                      }}
                    >
                      Track: Twi Language | Progress: 350 XP
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        background: "var(--green-soft)",
                        color: "var(--green)",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        display: "inline-block",
                        marginTop: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      Streak: 3 Days
                    </span>
                  </div>
                  <div
                    style={{
                      border: "1px solid var(--line)",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "#fff",
                    }}
                  >
                    <strong>Sam Peterson</strong>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--ink-soft)",
                        marginTop: "4px",
                      }}
                    >
                      Track: Nepali Language | Progress: 180 XP
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        background: "var(--bg-soft)",
                        color: "var(--ink-soft)",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        display: "inline-block",
                        marginTop: "8px",
                      }}
                    >
                      Streak: 0 Days
                    </span>
                  </div>
                </div>
              </div>

              <div className="big-card">
                <h3>Scheduled Virtual Meetups</h3>
                <p style={{ color: "var(--ink-soft)", fontSize: "13.5px" }}>
                  Setup or join live speaking classes with families.
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1.5px solid var(--line)",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "var(--paper)",
                    marginTop: "10px",
                  }}
                >
                  <div>
                    <strong>Twi Pronunciation Tutoring (Private)</strong>
                    <div style={{ fontSize: "12px", color: "var(--ink-soft)" }}>
                      Ama & Sarah Owusu | Tomorrow, 10:00 AM
                    </div>
                  </div>
                  <button className="btn btn-dark btn-sm">Launch Zoom</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "planner" && (
            <div>
              <h1>Course Materials Planner</h1>
              <p className="sub">
                Construct and add new interactive lessons. Lessons await admin
                approval.
              </p>

              {/* Lesson planner submission form */}
              <div className="big-card" style={{ marginBottom: "24px" }}>
                <h3>Add New Lesson Outline</h3>
                <form
                  onSubmit={handleCreateLesson}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "16px",
                  }}
                >
                  <div className="field">
                    <label>Lesson Title Name</label>
                    <input
                      type="text"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="e.g. Lesson 4: Fruit names and sizes"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label>Target Language Track</label>
                      <select
                        value={newLessonTrack}
                        onChange={(e) => setNewLessonTrack(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "13px 15px",
                          borderRadius: "12px",
                          border: "1.5px solid var(--line)",
                        }}
                      >
                        <option value="Twi, Ghana 🇬🇭">Twi, Ghana 🇬🇭</option>
                        <option value="Yoruba, Nigeria 🇳🇬">
                          Yoruba, Nigeria 🇳🇬
                        </option>
                        <option value="Nepali, Nepal 🇳🇵">
                          Nepali, Nepal 🇳🇵
                        </option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Lesson Difficulty Level</label>
                      <select
                        value={newLessonLevel}
                        onChange={(e) => setNewLessonLevel(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "13px 15px",
                          borderRadius: "12px",
                          border: "1.5px solid var(--line)",
                        }}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ alignSelf: "flex-start", marginTop: "10px" }}
                  >
                    <Plus size={16} /> Publish Lesson
                  </button>
                </form>
              </div>

              {/* Lesson status tracking */}
              <div className="big-card">
                <h3>My Lesson Inventory</h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginTop: "12px",
                  }}
                >
                  {teacherLessons.map((l) => (
                    <div
                      key={l.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid var(--line)",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        background: "#fff",
                      }}
                    >
                      <div>
                        <strong>{l.title}</strong>
                        <div
                          style={{ fontSize: "11px", color: "var(--ink-soft)" }}
                        >
                          Dialect: {l.track} | Difficulty: {l.hours}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          padding: "4px 10px",
                          borderRadius: "15px",
                          fontWeight: "bold",
                          background: l.approved
                            ? "var(--green-soft)"
                            : "var(--gold-soft)",
                          color: l.approved
                            ? "var(--green)"
                            : "var(--gold-deep)",
                        }}
                      >
                        {l.approved ? "✓ Approved" : "⚙ Pending Approval"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "inquiries" && (
            <div className="big-card">
              <h3>Parent Message Drawer</h3>
              <p className="sub">
                Inquiries resolved through contact form feedback.
              </p>
              {feedbackMessages.length === 0 ? (
                <p>No unanswered student messages available.</p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "16px",
                  }}
                >
                  {feedbackMessages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        border: "1.5px solid var(--line)",
                        padding: "16px",
                        borderRadius: "12px",
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <strong>
                          {m.name} ({m.email})
                        </strong>
                        <button
                          className="link-btn"
                          style={{ color: "red", fontSize: "12px" }}
                          onClick={() => handleDeleteFeedback(m.id)}
                        >
                          <X size={14} /> Dismiss
                        </button>
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          margin: "6px 0 0",
                          color: "var(--ink-soft)",
                        }}
                      >
                        "{m.message}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER 5: ADMIN VIEW ---
  if (isAdmin) {
    return (
      <div className="dashboard-wrap">
        <div className="dash-sidebar">
          <div className="logo">
            <span style={{ marginRight: "8px" }}>🛡️</span> Admin Console
          </div>
          <button
            className={`dash-nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <Activity className="ic" /> System Analytics
          </button>
          <button
            className={`dash-nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <UserPlus className="ic" /> User Index
          </button>
          <button
            className={`dash-nav-item ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            <Layers className="ic" /> Course Approvals
          </button>
          <button
            className={`dash-nav-item ${activeTab === "inquiries" ? "active" : ""}`}
            onClick={() => setActiveTab("inquiries")}
          >
            <FileText className="ic" /> Site Mail Inbox
          </button>
        </div>

        <div className="dash-main">
          {toastMessage && (
            <div className="praise-toast" style={{ bottom: "30px" }}>
              {toastMessage}
            </div>
          )}

          {/* System Analytics */}
          {activeTab === "analytics" && (
            <div>
              <h1>RootBridge System Diagnostics</h1>
              <p className="sub">
                Review global metrics, database registries, and server health.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "20px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    background: "var(--indigo)",
                    color: "#fff",
                    padding: "20px",
                    borderRadius: "16px",
                  }}
                >
                  <strong>Total Registered Profiles</strong>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      marginTop: "4px",
                    }}
                  >
                    124 Users
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--terracotta)",
                    color: "#fff",
                    padding: "20px",
                    borderRadius: "16px",
                  }}
                >
                  <strong>Course Submissions</strong>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      marginTop: "4px",
                    }}
                  >
                    4 Active Tracks
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--green)",
                    color: "#fff",
                    padding: "20px",
                    borderRadius: "16px",
                  }}
                >
                  <strong>System Health Index</strong>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      marginTop: "4px",
                    }}
                  >
                    100% OK
                  </div>
                </div>
              </div>

              <div className="big-card">
                <h3>Sprint 1 Verification Guidelines</h3>
                <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
                  This console allows checking the workflow of Scrum Sprint 1
                  elements. Use the "Site Mail Inbox" to monitor contact forms
                  submitted by parents, or the "Course Approvals" tab to review
                  lessons designed by instructors.
                </p>
              </div>
            </div>
          )}

          {/* User Database Index */}
          {activeTab === "users" && (
            <div className="big-card">
              <h3>Registered User Index</h3>
              <p className="sub">
                Accounts stored in live JSON filesystem registry.
              </p>
              <div style={{ overflowX: "auto", marginTop: "16px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2.5px solid var(--line)" }}>
                      <th style={{ padding: "10px" }}>ID</th>
                      <th style={{ padding: "10px" }}>Name / Nickname</th>
                      <th style={{ padding: "10px" }}>Email Address</th>
                      <th style={{ padding: "10px" }}>Active Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr
                        key={u.id}
                        style={{ borderBottom: "1px solid var(--line)" }}
                      >
                        <td style={{ padding: "10px" }}>#{u.id}</td>
                        <td style={{ padding: "10px" }}>
                          <strong>{u.name}</strong>
                        </td>
                        <td style={{ padding: "10px" }}>{u.email}</td>
                        <td style={{ padding: "10px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "bold",
                              background: "var(--indigo-soft)",
                              color: "var(--indigo)",
                              padding: "2px 8px",
                              borderRadius: "10px",
                            }}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Course Approvals */}
          {activeTab === "courses" && (
            <div className="big-card">
              <h3>Teacher Lesson Verification Queue</h3>
              <p className="sub">
                Toggle approval permissions to publish lessons to the student
                directory.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "16px",
                }}
              >
                {teacherLessons.map((l) => (
                  <div
                    key={l.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid var(--line)",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "#fff",
                    }}
                  >
                    <div>
                      <strong>{l.title}</strong>
                      <div
                        style={{ fontSize: "11px", color: "var(--ink-soft)" }}
                      >
                        Lesson track: {l.track} | Level: {l.hours}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`btn ${l.approved ? "btn-green" : "btn-primary"} btn-sm`}
                      onClick={() => handleToggleApprove(l.id)}
                    >
                      {l.approved
                        ? "✓ Approved (Online)"
                        : "🔒 Approve & Publish"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Site Mail Inbox */}
          {activeTab === "inquiries" && (
            <div className="big-card">
              <h3>Parent Inquiries Inbox</h3>
              <p className="sub">
                Requests received from the contact page form.
              </p>
              {feedbackMessages.length === 0 ? (
                <p>No unanswered inquiries in the mailbox.</p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "16px",
                  }}
                >
                  {feedbackMessages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        border: "1.5px solid var(--line)",
                        padding: "16px",
                        borderRadius: "12px",
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <strong>
                          {m.name} ({m.email})
                        </strong>
                        <button
                          className="link-btn"
                          style={{ color: "red", fontSize: "12px" }}
                          onClick={() => handleDeleteFeedback(m.id)}
                        >
                          <X size={14} /> Dismiss
                        </button>
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          margin: "6px 0 0",
                          color: "var(--ink-soft)",
                        }}
                      >
                        "{m.message}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
