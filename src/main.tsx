import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./globals.css";
import "./site/site.css";
import "./site/suite.css";
import "./site/blog.css";
import "./site/productJourney.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
