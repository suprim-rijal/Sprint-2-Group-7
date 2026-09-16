import { Link } from "react-router-dom";
import { ClipboardList, Hash, LineChart, Settings, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES } from "../../config/roles.js";

// /teacher and /admin — role home pages.
// Sprint 2 only lays out what each workspace will contain; the tools
// themselves need the real backend (Sprint 3+).

const PLANS = {
  [ROLES.TEACHER]: {
    title: "Teacher workspace",
    intro: "Run classes and follow your students' progress.",
    items: [
      { icon: Hash, title: "Class codes", text: "Create a class and share its 6-digit code with families." },
      { icon: Users, title: "Class roster", text: "See who joined each class." },
      { icon: LineChart, title: "Class progress", text: "Lessons finished and modules mastered per student." },
      { icon: ClipboardList, title: "Assignments", text: "Pick modules for the class to practise this week." },
    ],
  },
  [ROLES.ADMIN]: {
    title: "Admin console",
    intro: "Manage accounts, roles and course content.",
    items: [
      { icon: Users, title: "Users", text: "Find accounts and change their role." },
      { icon: ShieldCheck, title: "Moderation", text: "Review contact messages and reports." },
      { icon: ClipboardList, title: "Content", text: "Publish chapters, modules and culture facts." },
      { icon: Settings, title: "Languages", text: "Switch new heritage languages on when they are ready." },
    ],
  },
};

export default function RoleWorkspace({ role }) {
  const { user } = useAuth();
  const plan = PLANS[role];
  const profilePath = role === ROLES.TEACHER ? "/teacher/profile" : "/admin/profile";

  return (
    <div className="acct workspace">
      <header className="acct-head">
        <p className="pd-eyebrow">Signed in as {user.name}</p>
        <h1>{plan.title}</h1>
        <p className="path-muted">{plan.intro}</p>
      </header>

      <p className="workspace-note">
        These tools arrive once the backend is connected (Sprint 3 and later). This page shows what is planned.
      </p>

      <ul className="workspace-grid">
        {plan.items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="pd-panel">
            <Icon size={20} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{text}</p>
            <span className="pd-tag off">Planned</span>
          </li>
        ))}
      </ul>

      <p className="pd-footnote">
        Manage your photo, name and password in your <Link to={profilePath}>profile</Link>.
      </p>
    </div>
  );
}
