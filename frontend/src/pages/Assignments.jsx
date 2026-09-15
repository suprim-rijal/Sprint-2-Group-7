import { useMemo, useState } from "react"
import { useAuth } from "../context/useAuth"
import { teacherDataByLanguage } from "../data/teacherData"

const Assignments = () => {
  const { teacher } = useAuth()

  const data = teacherDataByLanguage[teacher?.language]

  const storageKey = `hr_assignments_${teacher?.language}`

  const getStoredAssignments = () => {
    const stored = localStorage.getItem(storageKey)

    if (!stored) {
      return data?.assignments || []
    }

    try {
      const parsedAssignments = JSON.parse(stored)

      if (!Array.isArray(parsedAssignments)) {
        return data?.assignments || []
      }

      return parsedAssignments
    } catch {
      localStorage.removeItem(storageKey)
      return data?.assignments || []
    }
  }

  const [assignments, setAssignments] = useState(
    getStoredAssignments,
  )

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState(null)
  const [formError, setFormError] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    className: data?.classes?.[0]?.name || "",
    type: "Vocabulary",
    dueDate: "",
  })

  const filteredAssignments = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return assignments.filter((assignment) => {
      const matchesSearch =
        !searchValue ||
        assignment.title.toLowerCase().includes(searchValue) ||
        assignment.className.toLowerCase().includes(searchValue)

      const matchesStatus =
        statusFilter === "All" ||
        assignment.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [assignments, search, statusFilter])

  const totalAssignments = assignments.length

  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === "Active",
  ).length

  const pendingAssignments = assignments.filter(
    (assignment) => assignment.status === "Pending",
  ).length

  const saveAssignments = (updatedAssignments) => {
    setAssignments(updatedAssignments)
    localStorage.setItem(
      storageKey,
      JSON.stringify(updatedAssignments),
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

  const handleCreateAssignment = (event) => {
    event.preventDefault()

    if (!formData.title.trim()) {
      setFormError("Please enter an assignment title.")
      return
    }

    if (!formData.className) {
      setFormError("Please select a class.")
      return
    }

    if (!formData.dueDate) {
      setFormError("Please select a due date.")
      return
    }

    const newAssignment = {
      id: Date.now(),
      title: formData.title.trim(),
      className: formData.className,
      type: formData.type,
      dueDate: formData.dueDate,
      status: "Active",
    }

    saveAssignments([
      newAssignment,
      ...assignments,
    ])

    setFormData({
      title: "",
      className: data?.classes?.[0]?.name || "",
      type: "Vocabulary",
      dueDate: "",
    })

    setFormError("")
    setShowCreateForm(false)
  }

  const closeCreateForm = () => {
    setShowCreateForm(false)
    setFormError("")

    setFormData({
      title: "",
      className: data?.classes?.[0]?.name || "",
      type: "Vocabulary",
      dueDate: "",
    })
  }

  const openCreateForm = () => {
    setAssignmentToDelete(null)
    setFormError("")
    setShowCreateForm(true)
  }

  const handleDeleteAssignment = () => {
    if (!assignmentToDelete) {
      return
    }

    const updatedAssignments = assignments.filter(
      (assignment) =>
        assignment.id !== assignmentToDelete.id,
    )

    saveAssignments(updatedAssignments)
    setAssignmentToDelete(null)
  }

  return (
    <main className="teacher-main">
      <header className="page-header">
        <div>
          <p className="dashboard-label">
            {teacher?.language} Teacher Portal
          </p>

          <h1>Assignments</h1>

          <p>
            Create, manage, and track learning activities for your
            students.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openCreateForm}
        >
          + Create assignment
        </button>
      </header>

      <section className="assignment-summary">
        <div className="stat-card">
          <p>Total Assignments</p>
          <h2>{totalAssignments}</h2>
        </div>

        <div className="stat-card">
          <p>Active</p>
          <h2>{activeAssignments}</h2>
        </div>

        <div className="stat-card">
          <p>Pending</p>
          <h2>{pendingAssignments}</h2>
        </div>
      </section>

      <section className="assignments-card">
        <div className="students-toolbar">
          <div>
            <h2>Assignment list</h2>
          </div>

          <div className="students-toolbar-controls">
            <input
              type="search"
              className="search-input"
              placeholder="Search assignments"
              aria-label="Search assignments"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <select
              className="filter-select"
              aria-label="Filter assignments by status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="assignment-list">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => (
              <article
                className="assignment-item"
                key={assignment.id}
              >
                <div className="assignment-item-content">
                  <div className="assignment-type-badge">
                    {assignment.type || "Activity"}
                  </div>

                  <div>
                    <h3>{assignment.title}</h3>

                    <p>
                      {assignment.className} · Due{" "}
                      {assignment.dueDate}
                    </p>
                  </div>
                </div>

                <div className="assignment-item-actions">
                  <span
                    className={`assignment-status ${assignment.status.toLowerCase()}`}
                  >
                    {assignment.status}
                  </span>

                  <button
                    type="button"
                    className="delete-assignment-button"
                    onClick={() =>
                      setAssignmentToDelete(assignment)
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-assignments">
              <h3>No assignments found</h3>

              <p>
                Create an assignment or change your search filters.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={openCreateForm}
              >
                + Create assignment
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
            className="class-modal create-assignment-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="class-modal-header">
              <div>
                <span className="dashboard-label">
                  New assignment
                </span>

                <h2>Create an assignment</h2>
              </div>

              <button
                type="button"
                className="class-modal-close"
                onClick={closeCreateForm}
                aria-label="Close create assignment form"
              >
                ×
              </button>
            </div>

            <form
              className="auth-form"
              onSubmit={handleCreateAssignment}
            >
              <div className="form-group">
                <label htmlFor="assignment-title">
                  Assignment title
                </label>

                <input
                  id="assignment-title"
                  name="title"
                  type="text"
                  placeholder="Example: Basic Spanish vocabulary"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="assignment-class">
                  Class
                </label>

                <select
                  id="assignment-class"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                >
                  {data?.classes?.map((classItem) => (
                    <option
                      value={classItem.name}
                      key={classItem.id}
                    >
                      {classItem.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="assignment-type">
                  Activity type
                </label>

                <select
                  id="assignment-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="Vocabulary">
                    Vocabulary
                  </option>
                  <option value="Speaking">
                    Speaking
                  </option>
                  <option value="Listening">
                    Listening
                  </option>
                  <option value="Reading">
                    Reading
                  </option>
                  <option value="Writing">
                    Writing
                  </option>
                  <option value="Culture">
                    Culture
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="assignment-due-date">
                  Due date
                </label>

                <input
                  id="assignment-due-date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
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
                  Create assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignmentToDelete && (
        <div
          className="class-modal-overlay"
          onClick={() =>
            setAssignmentToDelete(null)
          }
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
                Delete assignment
              </span>

              <h2>
                Delete {assignmentToDelete.title}?
              </h2>

              <p>
                This will remove the assignment from your teacher
                portal. This action cannot be undone in this session.
              </p>
            </div>

            <div className="class-modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setAssignmentToDelete(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-button"
                onClick={handleDeleteAssignment}
              >
                Delete assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Assignments