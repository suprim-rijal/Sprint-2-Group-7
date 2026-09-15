import { useMemo, useState } from "react"
import { useAuth } from "../context/useAuth"
import { teacherDataByLanguage } from "../data/teacherData"

const Students = () => {
  const { teacher } = useAuth()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const students =
    teacherDataByLanguage[teacher?.language]?.students || []

  const filteredStudents = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return students.filter((student) => {
      const matchesSearch =
        !searchValue ||
        student.name.toLowerCase().includes(searchValue) ||
        student.email.toLowerCase().includes(searchValue) ||
        student.className.toLowerCase().includes(searchValue)

      const matchesStatus =
        statusFilter === "All" || student.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [students, search, statusFilter])

  const activeStudents = students.filter(
    (student) => student.status === "Active",
  ).length

  const needsAttention = students.filter(
    (student) => student.status === "Needs attention",
  ).length

  return (
    <main className="teacher-main">
      <header className="page-header">
        <div>
          <p className="dashboard-label">
            {teacher?.language} Teacher Portal
          </p>

          <h1>Students</h1>

          <p>
            Monitor student progress and support learners in your classes.
          </p>
        </div>
      </header>

      <section className="student-summary-grid">
        <div className="stat-card">
          <p>Total Students</p>
          <h2>{students.length}</h2>
        </div>

        <div className="stat-card">
          <p>Active Students</p>
          <h2>{activeStudents}</h2>
        </div>

        <div className="stat-card">
          <p>Needs Attention</p>
          <h2>{needsAttention}</h2>
        </div>
      </section>

      <section className="students-card">
        <div className="students-toolbar">
          <div>
            <h2>Student list</h2>
          </div>

          <div className="students-toolbar-controls">
            <input
              type="search"
              className="search-input"
              placeholder="Search students"
              aria-label="Search students"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="filter-select"
              aria-label="Filter students by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All students</option>
              <option value="Active">Active</option>
              <option value="Needs attention">Needs attention</option>
            </select>
          </div>
        </div>

        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Email</th>
                <th scope="col">Class</th>
                <th scope="col">Progress</th>
                <th scope="col">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.name}</strong>
                    </td>

                    <td>{student.email}</td>

                    <td>{student.className}</td>

                    <td>
                      <div className="student-progress">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          aria-label={`${student.name} progress`}
                          aria-valuenow={student.progress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          <div
                            className="progress-fill"
                            style={{
                              width: `${student.progress}%`,
                            }}
                          ></div>
                        </div>

                        <span>{student.progress}%</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          student.status === "Active"
                            ? "student-status-active"
                            : "student-status-attention"
                        }
                      >
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    No students match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default Students