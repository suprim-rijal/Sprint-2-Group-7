// =====================================================================
// User roles
// ---------------------------------------------------------------------
// Chosen from the role menu on the login and signup pages.
//   CHILD_PARENT  one family account: child view (learning + Cultural
//                 Passport) and parent view (administrative)
//   NORMAL        independent learner: learning + standard profile
//   TEACHER       teacher workspace (placeholder in Sprint 2)
//   ADMIN         admin console (placeholder in Sprint 2)
// Values match backend/config/roles.js.
// =====================================================================

export const ROLES = Object.freeze({
  CHILD_PARENT: "CombinedChildParent",
  NORMAL: "NormalUser",
  TEACHER: "Teacher",
  ADMIN: "Admin",
});

// Order and wording of the role menu.
export const ROLE_OPTIONS = Object.freeze([
  { value: ROLES.CHILD_PARENT, label: "Child/Parent" },
  { value: ROLES.NORMAL, label: "Normal" },
  { value: ROLES.TEACHER, label: "Teacher" },
  { value: ROLES.ADMIN, label: "Admin" },
]);

export const ROLE_LABELS = Object.freeze(Object.fromEntries(ROLE_OPTIONS.map((o) => [o.value, o.label])));

// Roles that use the dashboard and the learning paths.
export const LEARNER_ROLES = Object.freeze([ROLES.CHILD_PARENT, ROLES.NORMAL]);

// The two views inside a Child/Parent account.
export const VIEWS = Object.freeze({ CHILD: "child", PARENT: "parent" });

// Home page for a role (and, for families, for the current view).
export function homeFor(role, view = VIEWS.CHILD) {
  if (role === ROLES.CHILD_PARENT) return view === VIEWS.PARENT ? "/parent" : "/dashboard";
  if (role === ROLES.NORMAL) return "/dashboard";
  if (role === ROLES.TEACHER) return "/teacher";
  if (role === ROLES.ADMIN) return "/admin";
  return "/";
}

export const isKnownRole = (role) => Object.values(ROLES).includes(role);
