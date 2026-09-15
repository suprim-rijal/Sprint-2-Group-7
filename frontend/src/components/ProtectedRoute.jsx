import { Navigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

const ProtectedRoute = ({ children }) => {
  const { teacher, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!teacher) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute