import { useState } from "react"
import { useAuth } from "../context/useAuth"
import { teacherDataByLanguage } from "../data/teacherData"

const Classes = () => {
  const { teacher } = useAuth()

  const data = teacherDataByLanguage[teacher?.language]
  const storageKey = `hr_classes_${teacher?.language}`

  const getStoredClasses = () => {
    const stored = localStorage.getItem(storageKey)

    if (!stored) {
      return data?.classes || []
    }

    try {
      const parsedClasses = JSON.parse(stored)

      if (!Array.isArray(parsedClasses)) {
        return data?.classes || []
      }

      return parsedClasses
    } catch {
      localStorage.removeItem(storageKey)
      return data?.classes || []
    }
  }

  const [classes, setClasses] = useState(getStoredClasses)
  const [selectedClass, setSelectedClass] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [classToDelete, setClassToDelete] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "Beginner",
    schedule: "",
  })

  const [formError, setFormError] = useState("")

  const saveClasses = (updatedClasses) => {
    setClasses(updatedClasses)

    localStorage.setItem(
      storageKey,
      JSON.stringify(updatedClasses),
    )
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setFormError("")
  }

  const handleCreateClass = (event) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      setFormError("Please enter a class name.")
      return
    }

    if (!formData.description.trim()) {
      setFormError("Please enter a class description.")
      return
    }

    if (!formData.schedule.trim()) {
      setFormError("Please enter a class schedule.")
      return
    }

    const newClass = {
      id: Date.now(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      students: 0,
      level: formData.level,
      schedule: formData.schedule.trim(),
      progress: 0,
    }

    saveClasses([
      ...classes,
      newClass,
    ])

    setFormData({
      name: "",
      description: "",
      level: "Beginner",
      schedule: "",
    })

    setFormError("")
    setShowCreateForm(false)
  }

  const handleDeleteClass = () => {
    if (!classToDelete) {
      return
    }

    const updatedClasses = classes.filter(
      (classItem) =>
        classItem.id !== classToDelete.id,
    )

    saveClasses(updatedClasses)
    setSelectedClass(null)
    setClassToDelete(null)
  }

  const closeCreateForm = () => {
    setShowCreateForm(false)
    setFormError("")

    setFormData({
      name: "",
      description: "",
      level: "Beginner",
      schedule: "",
    })
  }

  const openCreateForm = () => {
    setSelectedClass(null)
    setClassToDelete(null)
    setFormError("")
    setShowCreateForm(true)
  }

  const openDeleteConfirmation = (classItem) => {
    setSelectedClass(null)
    setClassToDelete(classItem)
  }

  return (
    <main className="teacher-main">
      <header className="page-header">
        <div>
          <p className="dashboard-label">
            {teacher?.language} Teacher Portal
          </p>

          <h1>Classes</h1>

          <p>
            Manage your {teacher?.language} classes and learning
            activities.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openCreateForm}
        >
          + Create class
        </button>
      </header>

      <section className="student-summary-grid">
        <div className="stat-card">
          <p>Active Classes</p>
          <h2>{classes.length}</h2>
        </div>

        <div className="stat-card">
          <p>Total Learners</p>
          <h2>{data?.stats?.totalStudents || 0}</h2>
        </div>

        <div className="stat-card">
          <p>Active Assignments</p>
          <h2>{data?.stats?.activeAssignments || 0}</h2>
        </div>
      </section>

      <section className="classes-card">
        <div className="students-toolbar">
          <div>
            <h2>Your classes</h2>
          </div>

          <span className="dashboard-label">
            {classes.length} active
          </span>
        </div>

        <div className="classes-grid">
          {classes.length > 0 ? (
            classes.map((classItem) => (
              <article
                className="class-card"
                key={classItem.id}
              >
                <div className="class-card-top">
                  <div className="class-language">
                    {teacher?.language === "Spanish"
                      ? "ES"
                      : teacher?.language === "Nepali"
                        ? "NP"
                        : "DE"}
                  </div>

                  <span className="class-status">
                    Active
                  </span>
                </div>

                <h2>{classItem.name}</h2>

                <p>{classItem.description}</p>

                <div className="class-details">
                  <div className="class-detail">
                    <span>Students</span>
                    <strong>{classItem.students}</strong>
                  </div>

                  <div className="class-detail">
                    <span>Level</span>
                    <strong>{classItem.level}</strong>
                  </div>

                  <div className="class-detail">
                    <span>Schedule</span>
                    <strong>{classItem.schedule}</strong>
                  </div>

                  <div className="class-detail">
                    <span>Language</span>
                    <strong>{teacher?.language}</strong>
                  </div>
                </div>

                <div className="class-progress">
                  <div className="class-progress-header">
                    <span>Class progress</span>
                    <strong>{classItem.progress}%</strong>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${classItem.progress}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="class-card-actions">
                  <button
                    type="button"
                    className="primary-button class-action"
                    onClick={() =>
                      setSelectedClass(classItem)
                    }
                  >
                    Open class
                  </button>

                  <button
                    type="button"
                    className="delete-class-button"
                    onClick={() =>
                      openDeleteConfirmation(classItem)
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-classes">
              <h2>No classes yet</h2>

              <p>
                Create your first {teacher?.language} class to get
                started.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={openCreateForm}
              >
                + Create class
              </button>
            </div>
          )}
        </div>
      </section>

      {showCreateForm && (
        <div
          className="class-modal-overlay"
          onClick={closeCreateForm}
        >
          <div
            className="class-modal create-class-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="class-modal-header">
              <div>
                <span className="dashboard-label">
                  New class
                </span>

                <h2>Create a class</h2>
              </div>

              <button
                type="button"
                className="class-modal-close"
                onClick={closeCreateForm}
                aria-label="Close create class form"
              >
                ×
              </button>
            </div>

            <form
              className="auth-form"
              onSubmit={handleCreateClass}
            >
              <div className="form-group">
                <label htmlFor="class-name">
                  Class name
                </label>

                <input
                  id="class-name"
                  name="name"
                  type="text"
                  placeholder={`Example: ${teacher?.language} A1`}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="class-description">
                  Description
                </label>

                <textarea
                  id="class-description"
                  name="description"
                  placeholder="Describe what students will learn in this class."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="class-level">
                  Level
                </label>

                <select
                  id="class-level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                >
                  <option value="Beginner">
                    Beginner
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Advanced">
                    Advanced
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="class-schedule">
                  Schedule
                </label>

                <input
                  id="class-schedule"
                  name="schedule"
                  type="text"
                  placeholder="Example: Mon & Wed · 16:00"
                  value={formData.schedule}
                  onChange={handleChange}
                />
              </div>

              {formError && (
                <div className="auth-error" role="alert">
                  <span>!</span>
                  <p>{formError}</p>
                </div>
              )}

              <div className="class-form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeCreateForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Create class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedClass && (
        <div
          className="class-modal-overlay"
          onClick={() => setSelectedClass(null)}
        >
          <div
            className="class-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="class-modal-header">
              <div>
                <span className="dashboard-label">
                  Class overview
                </span>

                <h2>{selectedClass.name}</h2>
              </div>

              <button
                type="button"
                className="class-modal-close"
                onClick={() => setSelectedClass(null)}
                aria-label="Close class overview"
              >
                ×
              </button>
            </div>

            <p className="class-modal-description">
              {selectedClass.description}
            </p>

            <div className="class-modal-details">
              <div className="class-detail">
                <span>Students</span>
                <strong>{selectedClass.students}</strong>
              </div>

              <div className="class-detail">
                <span>Level</span>
                <strong>{selectedClass.level}</strong>
              </div>

              <div className="class-detail">
                <span>Schedule</span>
                <strong>{selectedClass.schedule}</strong>
              </div>

              <div className="class-detail">
                <span>Progress</span>
                <strong>{selectedClass.progress}%</strong>
              </div>
            </div>

            <div className="class-progress">
              <div className="class-progress-header">
                <span>Class progress</span>
                <strong>{selectedClass.progress}%</strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${selectedClass.progress}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="class-modal-actions">
              <button
                type="button"
                className="delete-class-button"
                onClick={() =>
                  openDeleteConfirmation(selectedClass)
                }
              >
                Delete class
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() => setSelectedClass(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {classToDelete && (
        <div
          className="class-modal-overlay"
          onClick={() => setClassToDelete(null)}
        >
          <div
            className="class-modal delete-confirmation-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="delete-confirmation-icon">
              !
            </div>

            <div className="delete-confirmation-content">
              <span className="dashboard-label">
                Delete class
              </span>

              <h2>
                Delete {classToDelete.name}?
              </h2>

              <p>
                This will remove the class from your teacher portal.
                This action cannot be undone in this session.
              </p>
            </div>

            <div className="class-modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setClassToDelete(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-button"
                onClick={handleDeleteClass}
              >
                Delete class
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Classes