import { NavLink } from "react-router-dom"
import { useAuth } from "../context/useAuth"

const TeacherSidebar = () => {
  const { teacher, logout } = useAuth()

  const teacherName = teacher?.fullName || "Teacher"
  const initials = teacherName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="teacher-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">H</div>

        <div>
          <h2>HomeRootly</h2>
          <span>Teacher Portal</span>
        </div>
      </div>

      <div className="teacher-account">
        <div className="account-avatar">{initials}</div>

        <div className="account-info">
          <strong>{teacherName}</strong>
          <span>{teacher?.language} Teacher</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-label">Workspace</p>

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <span>▦</span>
          Dashboard
        </NavLink>

        <NavLink
          to="/students"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <span>♙</span>
          Students
        </NavLink>

        <NavLink
          to="/classes"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <span>▤</span>
          Classes
        </NavLink>

        <NavLink
          to="/assignments"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <span>✓</span>
          Assignments
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-language">
          <span className="language-dot"></span>

          <div>
            <strong>{teacher?.language}</strong>
            <small>Teaching language</small>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          <span>↪</span>
          Log out
        </button>
      </div>
    </aside>
  )
}

export default TeacherSidebar