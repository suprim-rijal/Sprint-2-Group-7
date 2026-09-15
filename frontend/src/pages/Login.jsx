import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

const demoAccounts = [
  {
    language: "Spanish",
    email: "spanish@homerootly.com",
    password: "teach123",
  },
  {
    language: "Nepali",
    email: "nepali@homerootly.com",
    password: "teach123",
  },
  {
    language: "German",
    email: "german@homerootly.com",
    password: "teach123",
  },
]

const Login = () => {
  const navigate = useNavigate()
  const { teacher, login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.")
      return
    }

    setIsSubmitting(true)

    const result = login(email.trim(), password)

    if (!result.success) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    navigate("/", { replace: true })
  }

  const handleDemoLogin = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setError("")
  }

  if (teacher) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="auth-brand-mark">H</div>

          <p className="auth-brand-kicker">
            HomeRootly Teacher
          </p>

          <h1>
            Make every language lesson
            <span> meaningful.</span>
          </h1>

          <p className="auth-brand-description">
            Plan lessons, support your students, review their progress,
            and create better language-learning experiences from one
            simple workspace.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature">
              <span>✓</span>
              <p>Manage students and classes</p>
            </div>

            <div className="auth-feature">
              <span>✓</span>
              <p>Assign language-learning activities</p>
            </div>

            <div className="auth-feature">
              <span>✓</span>
              <p>Track student progress</p>
            </div>

            <div className="auth-feature">
              <span>✓</span>
              <p>Support language and cultural learning</p>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          <span>HomeRootly</span>
          <span>Language · Culture · Connection</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-mobile-brand">
            <div className="auth-mobile-mark">H</div>
            <strong>HomeRootly</strong>
          </div>

          <div className="auth-heading">
            <span className="auth-overline">
              Teacher Portal
            </span>

            <h2>Welcome back</h2>

            <p className="auth-subtitle">
              Sign in to continue managing your language classes.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

              <div className="auth-input-wrapper">
                <span className="auth-input-icon">✉</span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError("")
                  }}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-button"
                  onClick={() =>
                    setError(
                      "Password recovery is not connected in this Sprint 2 demo.",
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div className="auth-input-wrapper">
                <span className="auth-input-icon">◆</span>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setError("")
                  }}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className="remember-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
              />

              <span>Keep me signed in</span>
            </label>

            {error && (
              <div className="auth-error" role="alert">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Signing in..."
                : "Sign in to Teacher Portal"}

              {!isSubmitting && <span>→</span>}
            </button>
          </form>

          <div className="auth-divider">
            <span>Demo accounts</span>
          </div>

          <div className="demo-account-list">
            {demoAccounts.map((account) => (
              <button
                type="button"
                className="demo-account-button"
                key={account.email}
                onClick={() => handleDemoLogin(account)}
              >
                <span className="demo-language-icon">
                  {account.language === "Spanish"
                    ? "ES"
                    : account.language === "Nepali"
                      ? "NP"
                      : "DE"}
                </span>

                <span className="demo-account-info">
                  <strong>
                    {account.language} Teacher
                  </strong>

                  <small>{account.email}</small>
                </span>

                <span className="demo-arrow">→</span>
              </button>
            ))}
          </div>

          <p className="auth-switch">
            New to HomeRootly?{" "}
            <Link to="/register">
              Create a teacher account
            </Link>
          </p>

          <p className="auth-demo-note">
            Sprint 2 demo · No real authentication or backend
            connection
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login