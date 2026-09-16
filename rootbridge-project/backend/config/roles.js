// User roles (same values as frontend/src/config/roles.js).
// Chosen from the role menu on the login and signup pages.
const ROLES = Object.freeze({
  CHILD_PARENT: "CombinedChildParent",
  NORMAL: "NormalUser",
  TEACHER: "Teacher",
  ADMIN: "Admin",
});

const ROLE_LABELS = Object.freeze({
  [ROLES.CHILD_PARENT]: "Child/Parent",
  [ROLES.NORMAL]: "Normal",
  [ROLES.TEACHER]: "Teacher",
  [ROLES.ADMIN]: "Admin",
});

const isKnownRole = (role) => Object.values(ROLES).includes(role);

module.exports = { ROLES, ROLE_LABELS, isKnownRole };
