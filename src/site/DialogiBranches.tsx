import { useEffect, useId, useRef, useState } from "react";
import type { Lang } from "../lib/i18n";
import "./dialogiBranches.css";

export const dialogiIntro = {
  pt: { kicker: "IA que aproxima", title: "Tecnologia que", accent: "entende pessoas.", body: "Automação, voz, análise e multicanais em uma plataforma com IA que transforma atendimento em relacionamento.", demo: "Agende uma demo", discover: "Conheça o Dialogi", labels: ["Atende", "Entende", "Analisa", "Evolui"], result: "Conversas que geram resultados." },
  en: { kicker: "AI that brings us closer", title: "Technology that", accent: "understands people.", body: "Automation, voice, analytics and multiple channels in an AI platform that turns customer service into relationships.", demo: "Book a demo", discover: "Discover Dialogi", labels: ["Assists", "Understands", "Analyzes", "Evolves"], result: "Conversations that deliver results." },
  es: { kicker: "IA que acerca", title: "Tecnología que", accent: "entiende a las personas.", body: "Automatización, voz, análisis y múltiples canales en una plataforma con IA que transforma la atención en relaciones.", demo: "Agenda una demo", discover: "Conoce Dialogi", labels: ["Atiende", "Entiende", "Analiza", "Evoluciona"], result: "Conversaciones que generan resultados." },
};

const branches = [
  { color: "#8973e8", x: 100, y: 30, shape: "M470 150C357 145 328 11 175 11L150 11V48H175C322 48 351 151 470 154Z", line: "M470 152C350 148 325 30 166 30", icon: "M9 4a3 3 0 0 1 6 0v8a3 3 0 0 1-6 0ZM6 10v2a6 6 0 0 0 12 0v-2M12 18v4M9 22h6" },
  { color: "#35badb", x: 35, y: 110, shape: "M470 150C354 145 267 73 110 91L85 94V130L110 128C263 109 349 154 470 154Z", line: "M470 152C350 150 265 93 101 110", icon: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3ZM21 2v4m-2-2h4" },
  { color: "#30d999", x: 100, y: 190, shape: "M470 150C354 155 298 170 170 173L150 173V211L170 211C304 208 359 157 470 154Z", line: "M470 152C354 156 300 191 164 192", icon: "M4 20v-7h3v7ZM11 20V8h3v12ZM18 20V3h3v17Z" },
  { color: "#619cec", x: 60, y: 270, shape: "M470 150C350 163 305 244 130 251L110 251V289L130 289C318 282 350 169 470 154Z", line: "M470 152C350 166 308 263 123 270", icon: "m10 2-1 3-3 1-3-1-2 4 2 2v3l-2 2 2 4 3-1 3 1 1 3h4l1-3 3-1 3 1 2-4-2-2v-3l2-2-2-4-3 1-3-1-1-3ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0" },
];

export function DialogiBranches({ lang }: { lang: Lang }) {
  const copy = dialogiIntro[lang];
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <figure ref={ref} className={`dlg-branches${visible ? " is-visible" : ""}`} aria-label={`Dialogi AI: ${copy.labels.join(", ")}. ${copy.result}`}>
      <svg viewBox="0 0 760 310" aria-hidden="true">
        <defs>
          <radialGradient id={`${id}-disc`} cx="35%" cy="25%" r="85%"><stop stopColor="#fff" /><stop offset="1" stopColor="#e8edff" /></radialGradient>
          {branches.map((branch, i) => <linearGradient key={i} id={`${id}-${i}`} x1="0" y1="0" x2="1" y2="0"><stop stopColor={branch.color} stopOpacity="0.13" /><stop offset="0.5" stopColor={branch.color} stopOpacity="0.57" /><stop offset="1" stopColor={branch.color} stopOpacity="0.85" /></linearGradient>)}
          {branches.map((branch, i) => (
            <mask key={i} id={`${id}-reveal-${i}`} maskUnits="userSpaceOnUse" x="0" y="-30" width="530" height="370">
              <path className="dlg-branches__reveal" style={{ ["--branch-delay" as string]: `${i * 90}ms` }} d={branch.line} pathLength="100" fill="none" stroke="white" strokeWidth="80" strokeLinecap="butt" strokeDasharray="100 200" strokeDashoffset="100" />
            </mask>
          ))}
        </defs>
        {branches.map((branch, i) => (
          <g key={i} style={{ ["--branch-delay" as string]: `${i * 90}ms`, color: branch.color }}>
            <g className="dlg-branches__ribbon" mask={`url(#${id}-reveal-${i})`}>
              <path d={branch.shape} fill={`url(#${id}-${i})`} />
              <path className="dlg-branches__pulse" d={branch.line} pathLength="100" fill="none" stroke={branch.color} strokeWidth="2" />
            </g>
            <g className="dlg-branches__label" opacity="0">
              <rect x={branch.x - 62} y={branch.y - 25} width="154" height="50" rx="25" fill="white" stroke="#edf1f8" />
              <circle cx={branch.x - 34} cy={branch.y} r="18" fill={branch.color} opacity="0.13" />
              <svg x={branch.x - 45} y={branch.y - 11} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={branch.icon} /></svg>
              <text x={branch.x - 6} y={branch.y + 5} fill="#142344" fontSize="13" fontWeight="600">{copy.labels[i]}</text>
            </g>
          </g>
        ))}
        <path className="dlg-branches__connector" d="M554 152H622" stroke="#cdd7eb" strokeWidth="1" />
        <g className="dlg-branches__core">
          <circle cx="477" cy="152" r="87" fill={`url(#${id}-disc)`} stroke="#f9fbff" strokeWidth="2" />
          <image href="/media/dialogi-color.png" x="405" y="137" width="144" height="30" preserveAspectRatio="xMidYMid meet" />
        </g>
      </svg>
      <figcaption>{copy.result}</figcaption>
    </figure>
  );
}
