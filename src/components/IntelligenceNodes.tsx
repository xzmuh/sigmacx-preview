import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Link } from "react-router-dom";
import { href, type Lang } from "../lib/i18n";
import { startDialogiJourney, startProductJourney } from "../site/ProductJourney";
import "./intelligenceNodes.css";

function ModulePreview({ path }: { path: string }) {
  const illustrations = {
    "/sigma-brain": <>
      <path className="module-preview__muted" d="M33 19 83 36 43 57M83 36l35-22 49 10M83 36l37 22 66-8M118 14l2 44M167 24l19 26" />
      <path d="m83 36 25-15 25 15-25 15Z" />
      <path className="module-preview__muted" d="m96 36 12-7 12 7-12 7Z" />
      {[[33,19],[43,57],[118,14],[120,58],[167,24],[186,50]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />)}
      <circle className="module-preview__solid" cx="108" cy="36" r="3" />
    </>,
    "/sigma-channel": <>
      <path className="module-preview__muted" d="M53 15h35q12 0 12 12v9M53 36h61M53 57h35q12 0 12-12v-9M147 36h22" />
      {[6,27,48].map(y => <rect key={y} x="29" y={y} width="24" height="18" rx="5" />)}
      <path d="M36 12h10v5h-5l-3 3v-3h-2ZM37 33l8 7m-8 0 8-7M36 54h10m-10 4h6" />
      <rect className="module-preview__tint" x="114" y="21" width="33" height="30" rx="9" />
      <path d="m124 36 5 5 9-10" />
      <circle cx="177" cy="36" r="8" />
    </>,
    "/sigma-insights": <>
      <path className="module-preview__muted" d="M24 19h168M24 38h168M24 58h168" />
      {[14,23,19,33,39,47].map((height,index) => <rect className="module-preview__tint" key={index} x={32+index*27} y={58-height} width="12" height={height} rx="3" />)}
      <path d="m38 39 27-9 27 4 27-15 27 3 27-13" />
      <circle className="module-preview__solid" cx="173" cy="9" r="3" />
    </>,
    "/dialogi": <>
      <path className="module-preview__muted" d="M32 10h83a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H55l-13 8v-8H32a8 8 0 0 1-8-8V18a8 8 0 0 1 8-8Z" />
      <path d="M40 20h53m-53 8h34" />
      <path className="module-preview__tint" d="M106 34h77a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8h-7v6l-11-6h-59a8 8 0 0 1-8-8V42a8 8 0 0 1 8-8Z" />
      {[4,10,17,9,22,14,6,12,4].map((height,index) => <path key={index} d={`M${116+index*7} ${48-height/2}v${height}`} />)}
    </>,
    "/produto": <>
      <path className="module-preview__muted" strokeDasharray="3 4" d="M55 21h23q10 0 10 10v5h37M55 53h23q10 0 10-10v-7M149 36h15" />
      <rect x="27" y="10" width="28" height="22" rx="5" />
      <rect x="27" y="42" width="28" height="22" rx="5" />
      <path d="m38 16-4 5 4 5m6-10 4 5-4 5M35 49h12v8H35Z" />
      <path className="module-preview__tint" d="M112 24h13v-5h9v5h15v24h-15v5h-9v-5h-17V34h4Z" />
      <rect x="164" y="25" width="25" height="22" rx="5" />
      <path d="m171 36 4 4 7-8" />
    </>,
  };
  return <svg className="module-preview" viewBox="0 0 216 72" fill="none" aria-hidden="true">
    {illustrations[path as keyof typeof illustrations]}
  </svg>;
}

export const intelligenceNodes = [
  { title: "Sigma Brain", tag: "IA", position: [0, .94, .4], color: "#a6aeff", path: "/sigma-brain", body: "Entende intenções, preserva o contexto e executa ações para resolver demandas de ponta a ponta." },
  { title: "Sigma Channel", tag: "Canais", position: [-.86, .44, .48], color: "#b9ff9b", path: "/sigma-channel", body: "Conecta WhatsApp, voz e canais digitais em uma jornada contínua, com o histórico sempre por perto." },
  { title: "Sigma Insights", tag: "Dados", position: [.85, .38, .52], color: "#79bdff", path: "/sigma-insights", body: "Transforma conversas em análises de sentimento, qualidade e oportunidades para a sua operação." },
  { title: "Dialogi AI", tag: "Conversas", position: [-.7, -.62, .58], color: "#6ce0cf", path: "/dialogi", body: "Atendimento por texto e voz com leitura de intenção e emoção, aproximando marcas e pessoas." },
  { title: "Integrações", tag: "Conexões", position: [.74, -.57, .6], color: "#bee69e", path: "/produto", body: "Une canais, dados e processos para que a informação acompanhe cada etapa do relacionamento." },
];

export default function IntelligenceNodes({ anchors, lang }: { anchors: MutableRefObject<(HTMLDivElement | null)[]>; lang: Lang }) {
  const [active, setActive] = useState<number | null>(null);
  const [settledAtTop, setSettledAtTop] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  const open = (index: number) => { cancelClose(); setActive(index); };
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  useEffect(() => {
    let revealTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(revealTimer);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setSettledAtTop(false);
      setActive(null);
      if (window.scrollY <= 80) {
        revealTimer = setTimeout(() => setSettledAtTop(window.scrollY <= 80), 350);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(revealTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return <div className={`intelligence-nodes${settledAtTop ? " is-settled" : ""}`} inert={!settledAtTop} role="group" aria-label="Explore os módulos SigmaCX">
    {intelligenceNodes.map((node, index) => <div key={node.title}
      ref={(element) => { anchors.current[index] = element; }}
      className={`intelligence-node${active === index ? " is-open" : ""}${index > 2 ? " is-lower" : ""}`}
      style={{ ["--node-color" as string]: node.color }}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") open(index); }}
      onPointerLeave={() => { cancelClose(); closeTimer.current = setTimeout(() => setActive(null), 200); }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { cancelClose(); setActive(null); } }}
      onKeyDown={(event) => { if (event.key === "Escape") { cancelClose(); setActive(null); event.stopPropagation(); } }}>
      <button className="intelligence-node__trigger" type="button" aria-label={`Explorar ${node.title}`} aria-expanded={active === index} aria-controls={`intelligence-card-${index}`}
        onFocus={() => open(index)} onClick={(event) => { cancelClose(); if (event.detail === 0) open(index); else setActive(index); }}>
        <span className="intelligence-node__dot" aria-hidden="true" /><span className="intelligence-node__tag">{node.title}</span>
      </button>
      {active === index ? <div className="intelligence-node__card" id={`intelligence-card-${index}`}>
        <div className="intelligence-node__heading"><span className="intelligence-node__badge" aria-hidden="true">{node.tag}</span><button type="button" aria-label="Fechar detalhes" onClick={() => { cancelClose(); setActive(null); }}>×</button></div>
        <h2>{node.title}</h2>
        <ModulePreview path={node.path} />
        <p>{node.body}</p>
        <Link to={href(node.path, lang)} onClick={(event) => {
          if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          cancelClose();
          if (node.path === "/dialogi") startDialogiJourney(href(node.path, lang), lang);
          else startProductJourney(href(node.path, lang), lang, node.path === "/produto" ? undefined : node.title);
        }}>Conheça {node.title}<span aria-hidden="true">→</span></Link>
      </div> : null}
    </div>)}
  </div>;
}
