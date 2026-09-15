import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AuthProvider from "./context/AuthProvider"
import ProtectedRoute from "./components/ProtectedRoute"
import TeacherSidebar from "./components/TeacherSidebar"
import TopHeader from "./components/TopHeader"
import Login from "./pages/Login"
import Register from "./pages/Register"
import TeacherDashboard from "./pages/TeacherDashboard"
import Students from "./pages/Students"
import Classes from "./pages/Classes"
import Assignments from "./pages/Assignments"

const TeacherLayout = () => {
  return (
    <div className="teacher-layout">
      <TeacherSidebar />

      <div className="teacher-content">
        <TopHeader />

        <Routes>
          <Route path="/" element={<TeacherDashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/assignments" element={<Assignments />} />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <TeacherLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App