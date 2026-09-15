import Signup from "./Signup.jsx";

// /login uses the same Elearn auth screen as /signup, opened in "log in" mode.
export default function Login({ onAuth }) {
  return <Signup onAuth={onAuth} mode="login" />;
}
