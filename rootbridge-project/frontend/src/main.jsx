import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Elearn base theme (colours, fonts, buttons, navbar, footer)
import "./App.css"; // Learning-world styles built on the same Elearn variables
import "./styles/flow.css"; // Auth, onboarding, dashboards, passport
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
