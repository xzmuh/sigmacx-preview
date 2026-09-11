import { useCallback, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Icon } from "./ui";
import "./flowAnalytics.css";

/**
 * A leitura de um fluxo em producao: os mesmos blocos do builder, agora com o
 * volume que passou por cada caminho. Substitui o `Fluxo.gif`, um GIF nao
 * responde ao cursor, e o argumento da secao ("monitore respostas e interacoes
 * em tempo real") pede justamente que o visitante siga um caminho com o olho.
 *
 * Maquete: os percentuais sao ilustrativos e nao vem de operacao nenhuma.
 *
 * Cada ligacao e uma FAIXA, nao um traco: a espessura e proporcional ao volume,
 * que e o que faz o desenho contar alguma coisa. Caminhos sem volume entram
 * apagados, como no produto.
 */

const CANVAS_W = 820;
const CANVAS_H = 430;
const NODE_W = 118;
/* Alturas no plano logico. Precisam ser >= o que o conteudo mede de fato,
   senao o `overflow: hidden` do bloco come o cabecalho, foi o que aconteceu
   com os Menus: 22 + 4x19 nao cobria cabecalho + quatro opcoes + respiro. */
const HEAD_H = 30;
const OPTION_H = 25;

export type FlowKind = "message" | "menu" | "transaction" | "end";

const KIND_ICON: Record<FlowKind, string> = {
  message: "chat",
  menu: "list",
  transaction: "wallet",
  end: "check",
};

type Node = {
  id: string;
  kind: FlowKind;
  x: number;
  y: number;
  /** Blocos sem volume aparecem apagados, como caminhos que ninguem seguiu. */
  muted?: boolean;
  /** So o primeiro bloco mostra o corpo da mensagem, como na referencia. */
  body?: boolean;
  options?: number;
};

type Link = { from: string; to: string; share: number; label?: string; muted?: boolean };

const NODES: Node[] = [
  { id: "m1", kind: "message", x: 8, y: 16, body: true },
  { id: "menu1", kind: "menu", x: 168, y: 10, options: 4 },
  { id: "menu2", kind: "menu", x: 348, y: 6, options: 4, muted: true },
  { id: "menu3", kind: "menu", x: 348, y: 176, options: 4 },
  { id: "m2", kind: "message", x: 348, y: 330, muted: true },
  { id: "m3", kind: "message", x: 348, y: 380, muted: true },
  { id: "end1", kind: "end", x: 528, y: 8, muted: true },
  { id: "tx1", kind: "transaction", x: 528, y: 54, muted: true },
  { id: "m4", kind: "message", x: 528, y: 108 },
  { id: "m5", kind: "message", x: 528, y: 152 },
  { id: "menu4", kind: "menu", x: 528, y: 202, options: 4 },
  { id: "end2", kind: "end", x: 700, y: 226 },
  { id: "m6", kind: "message", x: 700, y: 274 },
];

const LINKS: Link[] = [
  { from: "m1", to: "menu1", share: 1, label: "100%" },
  { from: "menu1", to: "menu2", share: 0.17, label: "17%", muted: true },
  { from: "menu1", to: "menu3", share: 0.55 },
  { from: "menu1", to: "m2", share: 0.14, muted: true },
  { from: "menu1", to: "m3", share: 0.14, muted: true },
  { from: "menu2", to: "end1", share: 0.08, muted: true },
  { from: "menu2", to: "tx1", share: 0.09, muted: true },
  { from: "menu3", to: "m4", share: 0.2 },
  { from: "menu3", to: "m5", share: 0.15 },
  { from: "menu3", to: "menu4", share: 0.4, label: "40%" },
  { from: "menu4", to: "end2", share: 0.33, label: "33%" },
  { from: "menu4", to: "m6", share: 0.28 },
];

function nodeHeight(n: Node) {
  if (n.body) return 86;
  if (n.kind === "menu") return HEAD_H + (n.options ?? 0) * OPTION_H + 8;
  return HEAD_H;
}

export type FlowAnalyticsCopy = {
  palette: Record<FlowKind, string>;
  option: string;
  messageBody: string;
  canvasLabel: string;
  hint: string;
  zoomIn: string;
  zoomOut: string;
  fit: string;
};

export function FlowAnalytics({ copy }: { copy: FlowAnalyticsCopy }) {
  const [nodes, setNodes] = useState<Node[]>(NODES);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const scene = useRef<HTMLDivElement>(null);
  const grab = useRef({ dx: 0, dy: 0 });
  const [moving, setMoving] = useState<string | null>(null);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  /* A caixa da cena ja carrega zoom e deslocamento, entao medir por ela
     converte pixels do ponteiro em unidades logicas sem refazer a conta. */
  const toLogical = useCallback((clientX: number, clientY: number) => {
    const box = scene.current!.getBoundingClientRect();
    return {
      x: ((clientX - box.left) / box.width) * CANVAS_W,
      y: ((clientY - box.top) / box.height) * CANVAS_H,
    };
  }, []);

  const clamp = (n: Node): Node => ({
    ...n,
    x: Math.max(2, Math.min(CANVAS_W - NODE_W - 2, n.x)),
    y: Math.max(2, Math.min(CANVAS_H - nodeHeight(n) - 2, n.y)),
  });

  const onNodeDown = (e: ReactPointerEvent<HTMLDivElement>, n: Node) => {
    if (e.button !== 0) return;
    // Sem isto o `pointerdown` subia para a prancheta e comecava a mover a
    // cena inteira junto com o bloco.
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toLogical(e.clientX, e.clientY);
    grab.current = { dx: p.x - n.x, dy: p.y - n.y };
    setActive(n.id);
    setMoving(n.id);
  };
  const onNodeMove = (e: ReactPointerEvent<HTMLDivElement>, id: string) => {
    if (moving !== id) return;
    const p = toLogical(e.clientX, e.clientY);
    setNodes((prev) => prev.map((n) => (n.id === id ? clamp({ ...n, x: p.x - grab.current.dx, y: p.y - grab.current.dy }) : n)));
  };
  const onNodeUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setMoving(null);
  };

  /** Uma ligacao acende quando o bloco de origem ou de destino esta em foco. */
  const isLit = useCallback(
    (l: Link) => active === null || l.from === active || l.to === active,
    [active],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Os controles de zoom vivem dentro da prancheta: sem esta saida, o
    // `setPointerCapture` abaixo desviava o ponteiro para ela e o clique nunca
    // chegava ao botao, o zoom simplesmente nao respondia.
    if ((e.target as HTMLElement).closest(".fa__zoom")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setPan({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) });
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current = null;
    setDragging(false);
  };

  const step = (delta: number) => setZoom((z) => Math.min(1.8, Math.max(0.62, +(z + delta).toFixed(2))));
  const fit = () => { setNodes(NODES); setZoom(1); setPan({ x: 0, y: 0 }); setActive(null); };

  return (
    <div className="fa">
      <div
        className={`fa__surface${dragging ? " is-dragging" : ""}`}
        role="group"
        aria-label={copy.canvasLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="fa__scene" ref={scene} style={{ scale: String(zoom), translate: `${pan.x}px ${pan.y}px` }}>
          <svg className="fa__ribbons" viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} aria-hidden="true">
            {LINKS.map((l) => {
              const a = byId.get(l.from)!, b = byId.get(l.to)!;
              const x1 = a.x + NODE_W, y1 = a.y + nodeHeight(a) / 2;
              const x2 = b.x, y2 = b.y + nodeHeight(b) / 2;
              // Espessura proporcional ao volume: e o que separa uma faixa de um traco.
              const w = Math.max(4, l.share * 46);
              const c = (x2 - x1) * 0.5;
              const d = [
                `M${x1} ${y1 - w / 2}`,
                `C${x1 + c} ${y1 - w / 2}, ${x2 - c} ${y2 - w / 2}, ${x2} ${y2 - w / 2}`,
                `L${x2} ${y2 + w / 2}`,
                `C${x2 - c} ${y2 + w / 2}, ${x1 + c} ${y1 + w / 2}, ${x1} ${y1 + w / 2}`,
                "Z",
              ].join(" ");
              const cls = `fa__ribbon${l.muted ? " fa__ribbon--muted" : ""}${isLit(l) ? "" : " is-dim"}`;
              return <path key={`${l.from}-${l.to}`} className={cls} d={d} />;
            })}
          </svg>

          {/* Os percentuais ficam sobre a faixa, no meio do caminho. */}
          {LINKS.filter((l) => l.label).map((l) => {
            const a = byId.get(l.from)!, b = byId.get(l.to)!;
            const x = (a.x + NODE_W + b.x) / 2;
            const y = (a.y + nodeHeight(a) / 2 + b.y + nodeHeight(b) / 2) / 2;
            return (
              <span
                key={`t-${l.from}-${l.to}`}
                className={`fa__share${l.muted ? " fa__share--muted" : ""}${isLit(l) ? "" : " is-dim"}`}
                style={{ left: `${(x / CANVAS_W) * 100}%`, top: `${(y / CANVAS_H) * 100}%` }}
              >
                {l.label}
              </span>
            );
          })}

          {nodes.map((n) => {
            const h = nodeHeight(n);
            const lit = active === null || active === n.id
              || LINKS.some((l) => (l.from === active && l.to === n.id) || (l.to === active && l.from === n.id));
            return (
              <div
                key={n.id}
                className={`fa__node fa__node--${n.kind}${n.muted ? " is-muted" : ""}${lit ? "" : " is-dim"}${moving === n.id ? " is-moving" : ""}`}
                style={{
                  left: `${(n.x / CANVAS_W) * 100}%`,
                  top: `${(n.y / CANVAS_H) * 100}%`,
                  width: `${(NODE_W / CANVAS_W) * 100}%`,
                  height: `${(h / CANVAS_H) * 100}%`,
                }}
                tabIndex={0}
                role="button"
                aria-label={copy.palette[n.kind]}
                onPointerEnter={() => setActive(n.id)}
                onPointerLeave={() => { if (!moving) setActive(null); }}
                onPointerDown={(e) => onNodeDown(e, n)}
                onPointerMove={(e) => onNodeMove(e, n.id)}
                onPointerUp={onNodeUp}
                onPointerCancel={onNodeUp}
                onFocus={() => setActive(n.id)}
                onBlur={() => setActive(null)}
              >
                <span className="fa__node-head">
                  <Icon name={KIND_ICON[n.kind]} />
                  {copy.palette[n.kind]}
                  <i className="fa__node-more" aria-hidden="true" />
                </span>
                {n.body ? <span className="fa__node-body">{copy.messageBody}</span> : null}
                {n.kind === "menu" ? (
                  <span className="fa__node-list">
                    {Array.from({ length: n.options ?? 0 }, (_, i) => (
                      <i key={i}>{copy.option} {i + 1}</i>
                    ))}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="fa__zoom">
          <button type="button" onClick={fit} aria-label={copy.fit}><Icon name="target" /></button>
          <button type="button" onClick={() => step(0.18)} aria-label={copy.zoomIn}>+</button>
          <button type="button" onClick={() => step(-0.18)} aria-label={copy.zoomOut}>&minus;</button>
        </div>
      </div>
      <p className="fa__hint">{copy.hint}</p>
    </div>
  );
}
