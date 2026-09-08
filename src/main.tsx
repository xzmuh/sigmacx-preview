import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./globals.css";
import "./site/site.css";
import "./site/suite.css";
import "./site/blog.css";
import "./site/productJourney.css";
import "./site/scale.css";

/* O Firefox nao implementa `-webkit-user-drag`, entao o bloqueio de verdade e
   este: um unico listener no documento, em vez de `draggable={false}` espalhado
   por cada `<img>` do site. Nao interfere no arrasto por ponteiro das telas
   jogaveis, que nao usa a API de drag-and-drop do HTML. */
document.addEventListener("dragstart", (event) => {
  const target = event.target as HTMLElement | null;
  if (target?.closest("img, picture, svg, video")) event.preventDefault();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
