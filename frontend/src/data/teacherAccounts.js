const STORAGE_KEY = "hr_teacher_accounts"

const defaultTeacherAccounts = [
  {
    id: "teacher-spanish",
    fullName: "Spanish Teacher",
    email: "spanish@homerootly.com",
    password: "teach123",
    school: "HomeRootly Language School",
    language: "Spanish",
  },
  {
    id: "teacher-nepali",
    fullName: "Nepali Teacher",
    email: "nepali@homerootly.com",
    password: "teach123",
    school: "HomeRootly Language School",
    language: "Nepali",
  },
  {
    id: "teacher-german",
    fullName: "German Teacher",
    email: "german@homerootly.com",
    password: "teach123",
    school: "HomeRootly Language School",
    language: "German",
  },
]

const getStoredAccounts = () => {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return defaultTeacherAccounts
  }

  try {
    const accounts = JSON.parse(stored)

    if (!Array.isArray(accounts)) {
      return defaultTeacherAccounts
    }

    return accounts
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return defaultTeacherAccounts
  }
}

const saveAccounts = (accounts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}

export const findTeacherAccount = (email, password) => {
  const accounts = getStoredAccounts()

  return accounts.find(
    (account) =>
      account.email.toLowerCase() === email.trim().toLowerCase() &&
      account.password === password,
  )
}

export const registerTeacherAccount = ({
  fullName,
  email,
  password,
  school,
  language,
}) => {
  const accounts = getStoredAccounts()
  const normalizedEmail = email.trim().toLowerCase()

  const existingAccount = accounts.find(
    (account) => account.email.toLowerCase() === normalizedEmail,
  )

  if (existingAccount) {
    return {
      success: false,
      error: "An account with this email already exists.",
    }
  }

  const newAccount = {
    id: `teacher-${Date.now()}`,
    fullName,
    email: normalizedEmail,
    password,
    school,
    language,
  }

  const updatedAccounts = [...accounts, newAccount]

  saveAccounts(updatedAccounts)

  return {
    success: true,
    account: newAccount,
  }
}