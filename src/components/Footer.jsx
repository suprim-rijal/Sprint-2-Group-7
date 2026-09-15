import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo black-theme">
            <svg className="mark" viewBox="0 0 40 40" fill="none">
              <path
                d="M20 4c-7 0-11 5-11 11 0 5 3 8 7 9.5-1 3-4 4.5-7 4.2v3.3c6 .6 11-2.3 12.5-7.5 3.7-1 6.5-4.4 6.5-9C28 9 24.5 4 20 4z"
                fill="#E2A130"
              />
            </svg>
            <span style={{ color: "#fff" }}>RootBridge</span>
          </Link>
          <p>
            Connecting kids to their heritage languages, culture, and stories.
            Cultivating confidence and connection across borders.
          </p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/learn">Nepali Course</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact Support</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Learning Paths</h4>
          <ul>
            <li>🇬🇭 Twi (Ghana)</li>
            <li>🇳🇬 Yoruba (Nigeria)</li>
            <li>🇳🇵 Nepali (Nepal)</li>
            <li>🇧🇩 Bengali (Coming)</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Stay Updated</h4>
          <p
            style={{ fontSize: "13.5px", color: "#b7ace0", margin: "0 0 12px" }}
          >
            Receive cultural activities and platform updates.
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="email"
              placeholder="Your email"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                flex: 1,
                outline: "none",
              }}
            />
            <button
              className="btn btn-primary btn-sm"
              style={{ padding: "0 16px", borderRadius: "10px" }}
              onClick={() => alert("Thank you for subscribing!")}
            >
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} RootBridge. All rights reserved.</div>
        <div style={{ display: "flex", gap: "20px" }}>
          <span>Privacy Policy</span>
          <span>Terms of Use</span>
        </div>
      </div>
    </footer>
  );
}
