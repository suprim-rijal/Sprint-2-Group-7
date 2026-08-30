import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const [scrollState, setScrollState] = useState({
    visible: true,
    scrolled: false,
  });
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if at the top
      const isScrolled = currentScrollY > 20;

      // Determine visibility direction (hide on scroll-down, show on scroll-up)
      let isVisible = true;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        isVisible = false; // scrolling down
      } else {
        isVisible = true; // scrolling up or at the top
      }

      setScrollState({
        visible: isVisible,
        scrolled: isScrolled,
      });
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Don't show regular navigation if inside dashboard to keep focus
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <nav
      className={`main-nav ${scrollState.scrolled ? "scrolled" : ""} ${!scrollState.visible ? "nav-hidden" : ""}`}
    >
      <Link to="/" className="logo">
        <svg className="mark" viewBox="0 0 40 40" fill="none">
          <path
            d="M20 4c-7 0-11 5-11 11 0 5 3 8 7 9.5-1 3-4 4.5-7 4.2v3.3c6 .6 11-2.3 12.5-7.5 3.7-1 6.5-4.4 6.5-9C28 9 24.5 4 20 4z"
            fill="#E2A130"
          />
          <circle cx="24" cy="12" r="2.4" fill="#241A12" />
        </svg>
        <span>RootBridge</span>
      </Link>

      {!isDashboard && (
        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={location.pathname === "/about" ? "active" : ""}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={location.pathname === "/contact" ? "active" : ""}
            >
              Contact
            </Link>
          </li>
        </ul>
      )}

      <div className="nav-actions">
        {user ? (
          <>
            <Link to="/dashboard" className="btn btn-dark btn-sm">
              Dashboard
            </Link>
            <button onClick={onLogout} className="link-btn">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="btn btn-dark btn-sm">
              Start Learning
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
