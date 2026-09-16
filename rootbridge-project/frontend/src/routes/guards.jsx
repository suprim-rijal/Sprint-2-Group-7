// =====================================================================
// Route guards: decide who may open which page.
// ---------------------------------------------------------------------
// Each guard renders <Outlet /> (the child routes) when access is OK,
// otherwise it redirects with <Navigate replace /> so the Back button
// does not bounce between pages.
//
//   RequireAuth      logged in
//   WelcomeStep      the welcome animation (only before it was seen)
//   RequireWelcomed  welcome animation finished
//   RequireRole      one of the listed roles
//   RequireView      Child/Parent accounts: the right view (child/parent)
//   PublicOnly       login, signup, forgot password (logged out only)
// =====================================================================

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { nextStepFor, useAuth } from "../context/AuthContext.jsx";
import { homeFor } from "../config/roles.js";

export function RequireAuth() {
  const { user, signedOut } = useAuth();
  const location = useLocation();
  if (!user && signedOut) return <Navigate to="/" replace />; // just logged out
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function WelcomeStep() {
  const { user } = useAuth();
  if (user.details.onboarding.completed) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}

export function RequireWelcomed() {
  const { user } = useAuth();
  if (!user.details.onboarding.completed) return <Navigate to="/welcome" replace />;
  return <Outlet />;
}

// <Route element={<RequireRole roles={[ROLES.TEACHER]} />}>
export function RequireRole({ roles }) {
  const { user, activeView } = useAuth();
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role, activeView)} replace />;
  return <Outlet />;
}

// Only affects Child/Parent accounts; other roles pass through.
export function RequireView({ view }) {
  const { user, isFamily, activeView } = useAuth();
  if (isFamily && activeView !== view) return <Navigate to={homeFor(user.role, activeView)} replace />;
  return <Outlet />;
}

export function PublicOnly() {
  const { user, activeView } = useAuth();
  const location = useLocation();
  if (!user) return <Outlet />;
  const next = nextStepFor(user, activeView);
  // After login, go back to the page they first asked for (if welcomed).
  const from = location.state?.from;
  return <Navigate to={next !== "/welcome" && from ? from : next} replace />;
}
