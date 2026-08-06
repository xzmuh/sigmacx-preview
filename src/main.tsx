import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SigmaExperience } from "./SigmaExperience";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SigmaExperience />
  </StrictMode>,
);
