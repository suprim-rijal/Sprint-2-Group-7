import { Outlet } from "react-router-dom";
import KidNav from "../../components/KidNav.jsx";

// Wraps /learn, /learn/tracks, /learn/track/:id and /learn/module/:id.
// <Outlet /> is where React Router puts the matching child page.
export default function LearnLayout() {
  return (
    <div>
      <KidNav />
      <Outlet />
    </div>
  );
}
