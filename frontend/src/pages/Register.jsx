import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { registerTeacherAccount } from "../data/teacherAccounts"

const Register = () => {
  const navigate = useNavigate()
  const { teacher } = useAuth()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    school: "",
    language: "Spanish",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setError("")
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError("")

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.")
      return
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.")
      return
    }

    if (!formData.password) {
      setError("Please create a password.")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.")
      return
    }

    const result = registerTeacherAccount({
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      school: formData.school.trim(),
      language: formData.language,
    })

    if (!result.success) {
      setError(result.error)
      return
    }

    setSuccess(true)

    setTimeout(() => {
      navigate("/login")
    }, 1600)
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
            Teach languages.
            <span>Build connections.</span>
          </h1>

          <p className="auth-brand-description">
            Create your HomeRootly teacher account and manage
            language-learning experiences for your students.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature">
              <span>✓</span>
              <p>Manage students and classes</p>
            </div>

            <div className="auth-feature">
              <span>✓</span>
              <p>Create and track language assignments</p>
            </div>

            <div className="auth-feature">
              <span>✓</span>
              <p>
                Support speaking, listening, reading, and writing
              </p>
            </div>

            <div className="auth-feature">
              <span>✓</span>
              <p>Share language and cultural learning materials</p>
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

            <h2>Create your account</h2>

            <p className="auth-subtitle">
              Register to manage your HomeRootly language classes.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">
                Full name
              </label>

              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  ●
                </span>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-email">
                Email address
              </label>

              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  ✉
                </span>

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-password">
                Password
              </label>

              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  ◆
                </span>

                <input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength="6"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="school">
                School or organization
                <span> (optional)</span>
              </label>

              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  ▣
                </span>

                <input
                  id="school"
                  name="school"
                  type="text"
                  placeholder="Enter school or organization"
                  value={formData.school}
                  onChange={handleChange}
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="language">
                Teaching language
              </label>

              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  A
                </span>

                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                >
                  <option value="Spanish">Spanish</option>
                  <option value="Nepali">Nepali</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="auth-success" role="status">
                Registration successful. Redirecting to login...
              </div>
            )}

            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={success}
            >
              {success
                ? "Account created"
                : "Create teacher account"}

              {!success && <span>→</span>}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>

          <p className="auth-demo-note">
            Sprint 2 demo · Registration is simulated locally.
            No real authentication or backend connection is used.
          </p>
        </div>
      </section>
    </main>
  )
}

export default Register