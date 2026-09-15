import { useState } from "react"
import { AuthContext } from "./AuthContext"
import { findTeacherAccount } from "../data/teacherAccounts"

const STORAGE_KEY = "hr_teacher_session"

const getStoredTeacher = () => {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

const AuthProvider = ({ children }) => {
  const [teacher, setTeacher] = useState(getStoredTeacher)

  const login = (email, password) => {
    const account = findTeacherAccount(email, password)

    if (!account) {
      return {
        success: false,
        error: "Invalid email or password.",
      }
    }

    const session = {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      school: account.school,
      language: account.language,
    }

    setTeacher(session)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(session),
    )

    return { success: true }
  }

  const logout = () => {
    setTeacher(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        teacher,
        loading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider