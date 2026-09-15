import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { teacherDataByLanguage } from "../data/teacherData"

const TeacherDashboard = () => {
  const { teacher } = useAuth()

  const data = teacherDataByLanguage[teacher?.language]

  const [copied, setCopied] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState("")
  const [recordingNotes, setRecordingNotes] = useState("")
  const [published, setPublished] = useState(false)

  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour < 12) {
      return "Good morning"
    }

    if (hour < 18) {
      return "Good afternoon"
    }

    return "Good evening"
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        data.nextLiveClass.meetingLink,
      )

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  const handlePublishRecording = (event) => {
    event.preventDefault()

    if (!recordingUrl.trim()) {
      return
    }

    setPublished(true)
    setRecordingUrl("")
    setRecordingNotes("")

    setTimeout(() => {
      setPublished(false)
    }, 3000)
  }

  return (
    <main className="teacher-main dashboard-page">
      <header className="dashboard-header dashboard-welcome">
        <div>
          <p className="dashboard-label">
            {teacher?.language} Teacher Portal
          </p>

          <h1>
            {getGreeting()}, Teacher.
          </h1>

          <p>
            Here is what needs your attention before your next class.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Link
            to="/students"
            className="secondary-button dashboard-action-link"
          >
            View students
          </Link>

          <Link
            to="/assignments"
            className="primary-button dashboard-action-link"
          >
            Create assignment
          </Link>
        </div>
      </header>

      <section className="stats-grid dashboard-stats">
        <article className="stat-card dashboard-stat-card">
          <div className="stat-card-heading">
            <span className="stat-card-icon">
              ♙
            </span>

            <span className="stat-card-label">
              Learners
            </span>
          </div>

          <h2>{data.stats.totalStudents}</h2>

          <p className="stat-card-footer">
            Students across your classes
          </p>
        </article>

        <article className="stat-card dashboard-stat-card">
          <div className="stat-card-heading">
            <span className="stat-card-icon">
              ▤
            </span>

            <span className="stat-card-label">
              Classes
            </span>
          </div>

          <h2>{data.stats.activeClasses}</h2>

          <p className="stat-card-footer">
            Active {teacher?.language} classes
          </p>
        </article>

        <article className="stat-card dashboard-stat-card">
          <div className="stat-card-heading">
            <span className="stat-card-icon">
              ✓
            </span>

            <span className="stat-card-label">
              Assignments
            </span>
          </div>

          <h2>{data.stats.activeAssignments}</h2>

          <p className="stat-card-footer">
            Activities currently active
          </p>
        </article>

        <article className="stat-card dashboard-stat-card">
          <div className="stat-card-heading">
            <span className="stat-card-icon">
              ↗
            </span>

            <span className="stat-card-label">
              Progress
            </span>
          </div>

          <h2>{data.stats.averageProgress}%</h2>

          <p className="stat-card-footer">
            Average student progress
          </p>
        </article>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              Do this now
            </span>

            <h2>Today&apos;s priorities</h2>
          </div>

          <span className="dashboard-date-label">
            Teacher workspace
          </span>
        </div>

        <div className="priority-grid">
          <article className="live-class-card">
            <div className="card-top-row">
              <div>
                <span className="card-eyebrow live">
                  ● Next live class
                </span>

                <h2>
                  {data.nextLiveClass.className}
                </h2>

                <p>
                  {data.nextLiveClass.lesson}
                </p>
              </div>

              <div className="countdown-badge">
                {data.nextLiveClass.startsIn}
              </div>
            </div>

            <div className="meeting-details">
              <div>
                <span>Meeting ID</span>
                <strong>
                  {data.nextLiveClass.meetingId}
                </strong>
              </div>

              <div>
                <span>Passcode</span>
                <strong>
                  {data.nextLiveClass.passcode}
                </strong>
              </div>

              <div>
                <span>Start time</span>
                <strong>
                  {data.nextLiveClass.startTime}
                </strong>
              </div>
            </div>

            <div className="live-actions">
              <button
                type="button"
                className="zoom-button"
                onClick={() =>
                  window.open(
                    data.nextLiveClass.meetingLink,
                    "_blank",
                  )
                }
              >
                Launch live session
              </button>

              <button
                type="button"
                className="copy-button"
                onClick={handleCopyLink}
              >
                {copied
                  ? "Link copied"
                  : "Copy student link"}
              </button>
            </div>
          </article>

          <article className="grading-card">
            <div className="card-top-row">
              <div>
                <span className="card-eyebrow warning">
                  ● Needs attention
                </span>

                <h2>Grading inbox</h2>

                <p>
                  Student work waiting for your review.
                </p>
              </div>

              <div className="submission-count">
                <strong>
                  {data.pendingSubmissions.length}
                </strong>

                <span>pending</span>
              </div>
            </div>

            <div className="submission-list">
              {data.pendingSubmissions.map(
                (submission) => (
                  <div
                    className="submission-item"
                    key={submission.id}
                  >
                    <div className="submission-icon">
                      {submission.type === "Audio"
                        ? "♪"
                        : "□"}
                    </div>

                    <div className="submission-info">
                      <strong>
                        {submission.student}
                      </strong>

                      <span>
                        {submission.assignment}
                      </span>

                      <small>
                        {submission.submitted}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="grade-button"
                    >
                      Grade
                    </button>
                  </div>
                ),
              )}
            </div>

            <Link
              to="/assignments"
              className="text-link"
            >
              View assignments →
            </Link>
          </article>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              Class health
            </span>

            <h2>
              How are your students doing?
            </h2>
          </div>

          <Link
            to="/students"
            className="small-link"
          >
            View students
          </Link>
        </div>

        <div className="health-grid">
          <article className="dashboard-card activity-card">
            <div className="card-heading">
              <div>
                <h3>Student activity</h3>

                <p>
                  Recent learning activity from your classes.
                </p>
              </div>
            </div>

            <div className="activity-list">
              {data.studentActivity.map(
                (activity) => (
                  <div
                    className="activity-item"
                    key={activity.id}
                  >
                    <div className="activity-avatar">
                      {activity.student
                        .split(" ")
                        .map((name) => name[0])
                        .join("")}
                    </div>

                    <div className="activity-content">
                      <p>
                        <strong>
                          {activity.student}
                        </strong>{" "}
                        {activity.action}
                      </p>

                      <span>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </article>

          <article className="dashboard-card risk-card">
            <div className="card-heading">
              <div>
                <h3>
                  Students needing attention
                </h3>

                <p>
                  Consider reaching out to these students.
                </p>
              </div>
            </div>

            <div className="risk-list">
              {data.riskStudents.map(
                (student) => (
                  <div
                    className="risk-item"
                    key={student.id}
                  >
                    <div
                      className={`risk-indicator ${student.level}`}
                    ></div>

                    <div className="risk-content">
                      <strong>
                        {student.student}
                      </strong>

                      <span>
                        {student.issue}
                      </span>
                    </div>

                    <Link
                      to="/students"
                      className="small-link"
                    >
                      View
                    </Link>
                  </div>
                ),
              )}
            </div>

            <Link
              to="/students"
              className="text-link"
            >
              View student progress →
            </Link>
          </article>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              Workspace
            </span>

            <h2>Your teaching resources</h2>
          </div>

          <Link
            to="/classes"
            className="small-link"
          >
            Manage classes
          </Link>
        </div>

        <div className="workspace-grid">
          <article className="dashboard-card recording-card">
            <div className="card-heading">
              <div>
                <h3>
                  Publish class recording
                </h3>

                <p>
                  Share a completed live lesson with your students.
                </p>
              </div>

              <span className="workspace-icon">
                ▶
              </span>
            </div>

            <form
              className="recording-form"
              onSubmit={handlePublishRecording}
            >
              <div className="form-group">
                <label htmlFor="recording-url">
                  Recording URL
                </label>

                <input
                  id="recording-url"
                  type="url"
                  placeholder="https://zoom.us/..."
                  value={recordingUrl}
                  onChange={(event) =>
                    setRecordingUrl(event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="recording-notes">
                  Timestamp notes
                </label>

                <textarea
                  id="recording-notes"
                  rows="3"
                  placeholder="Example: 12:40 — pronunciation practice"
                  value={recordingNotes}
                  onChange={(event) =>
                    setRecordingNotes(event.target.value)
                  }
                ></textarea>
              </div>

              <button
                type="submit"
                className="primary-button"
              >
                Publish recording
              </button>

              {published && (
                <p className="success-message">
                  Recording published successfully.
                </p>
              )}
            </form>
          </article>

          <article className="dashboard-card materials-card">
            <div className="card-heading">
              <div>
                <h3>Recent materials</h3>

                <p>
                  Resources recently added to your workspace.
                </p>
              </div>

              <button
                type="button"
                className="small-link"
              >
                View library
              </button>
            </div>

            <div className="materials-list">
              {data.recentMaterials.map(
                (material) => (
                  <button
                    type="button"
                    className="material-item"
                    key={material.id}
                  >
                    <span className="material-icon">
                      {material.type === "PDF"
                        ? "□"
                        : material.type === "Worksheet"
                          ? "▤"
                          : "▥"}
                    </span>

                    <span className="material-info">
                      <strong>
                        {material.name}
                      </strong>

                      <small>
                        {material.type} · Updated{" "}
                        {material.updated}
                      </small>
                    </span>

                    <span className="material-arrow">
                      →
                    </span>
                  </button>
                ),
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

export default TeacherDashboard