import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Link } from "react-router-dom";
import { href, type Lang } from "../lib/i18n";
import "./intelligenceNodes.css";

export const intelligenceNodes = [
  { title: "Sigma Brain", tag: "IA", position: [0, .94, .4], color: "#a6aeff", path: "/sigma-brain", body: "Entende intenções, preserva o contexto e executa ações para resolver demandas de ponta a ponta." },
  { title: "Sigma Channel", tag: "Canais", position: [-.86, .44, .48], color: "#b9ff9b", path: "/sigma-channel", body: "Conecta WhatsApp, voz e canais digitais em uma jornada contínua, com o histórico sempre por perto." },
  { title: "Sigma Insights", tag: "Dados", position: [.85, .38, .52], color: "#79bdff", path: "/sigma-insights", body: "Transforma conversas em análises de sentimento, qualidade e oportunidades para a sua operação." },
  { title: "Dialogi AI", tag: "Conversas", position: [-.7, -.62, .58], color: "#6ce0cf", path: "/dialogi", body: "Atendimento por texto e voz com leitura de intenção e emoção, aproximando marcas e pessoas." },
  { title: "Integrações", tag: "Conexões", position: [.74, -.57, .6], color: "#bee69e", path: "/produto", body: "Une canais, dados e processos para que a informação acompanhe cada etapa do relacionamento." },
];

export default function IntelligenceNodes({ anchors, lang }: { anchors: MutableRefObject<(HTMLDivElement | null)[]>; lang: Lang }) {
  const [active, setActive] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  const open = (index: number) => { cancelClose(); setActive(index); };
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  return <div className="intelligence-nodes" role="group" aria-label="Explore os módulos SigmaCX">
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
        <svg className="intelligence-node__signal" viewBox="0 0 210 36" fill="none" aria-hidden="true"><path d="M20 18h170" stroke="currentColor" strokeOpacity=".25" /><circle cx="35" cy="18" r="5" /><circle cx="105" cy="18" r="9" /><circle cx="175" cy="18" r="5" /></svg>
        <p>{node.body}</p>
        <Link to={href(node.path, lang)}>Conheça {node.title}<span aria-hidden="true">→</span></Link>
      </div> : null}
    </div>)}
  </div>;
}
