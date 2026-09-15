import { useAuth } from "../context/useAuth"
import { teacherDataByLanguage } from "../data/teacherData"

const TopHeader = () => {
  const { teacher } = useAuth()

  const data = teacherDataByLanguage[teacher?.language]
  const teacherName = teacher?.fullName || "Teacher"

  const initials = teacherName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date())

  return (
    <header className="top-header">
      <div className="class-context">
        <span className="context-label">
          Managing class
        </span>

        <strong>
          {data?.classes?.[0]?.name ||
            `${teacher?.language} Class`}
        </strong>
      </div>

      <div className="header-right">
        <div className="system-status">
          <span className="status-dot"></span>
          System operational
        </div>

        <div className="header-date">
          {currentDate}
        </div>

        <button
          type="button"
          className="notification-button"
          title="Notifications"
        >
          <span>♢</span>
          <span className="notification-count">3</span>
        </button>

        <div className="teacher-profile">
          <div className="profile-avatar">
            {initials}
          </div>

          <div className="profile-info">
            <strong>{teacherName}</strong>
            <span>{teacher?.language} Teacher</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopHeader