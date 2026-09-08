import { useCallback, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Icon } from "./ui";
import "./flowBuilder.css";

/**
 * A tela do builder no-code, jogavel.
 *
 * Antes esta secao era um print (`Sigma-Bot.webp`) de um construtor de fluxo.
 * O argumento da secao e "configure de forma visual e intuitiva, sem codigo",
 * e um print pede que o visitante acredite nisso; aqui ele arrasta um bloco e
 * ve a linha acompanhar. E uma maquete: nao fala com o produto, nao persiste
 * nada e nao promete que a tela real seja identica a esta.
 *
 * Coordenadas vivem num plano logico de CANVAS_W x CANVAS_H e sao convertidas
 * para porcentagem na renderizacao, entao o mesmo layout serve em qualquer
 * largura sem recalcular nada no resize.
 */

const CANVAS_W = 660;
const CANVAS_H = 300;
const NODE_W = 152;

export type FlowKind = "message" | "menu" | "transfer" | "condition" | "transaction" | "end";

const KIND_ICON: Record<FlowKind, string> = {
  message: "chat",
  menu: "list",
  transfer: "users",
  condition: "sliders",
  transaction: "wallet",
  end: "check",
};

/** Altura de cada bloco no plano logico — as linhas precisam dela para achar
    o centro vertical de cada lado, entao ela vive aqui e nao so no CSS. */
function nodeHeight(kind: FlowKind, optionCount: number) {
  if (kind === "message") return 82;
  if (kind === "menu") return 36 + optionCount * 25 + 10;
  return 34;
}

type FlowNode = { id: string; kind: FlowKind; x: number; y: number };
type Edge = { from: string; to: string };

export type FlowBuilderCopy = {
  windowTitle: string;
  preview: string;
  save: string;
  hint: string;
  reset: string;
  palette: Record<FlowKind, string>;
  messageBody: string;
  option: string;
  canvasLabel: string;
  nodeHint: string;
  added: string;
  removed: string;
};

const SEED_NODES: FlowNode[] = [
  { id: "n1", kind: "message", x: 28, y: 40 },
  { id: "n2", kind: "menu", x: 246, y: 34 },
  { id: "n3", kind: "end", x: 466, y: 30 },
  { id: "n4", kind: "transaction", x: 466, y: 96 },
  { id: "n5", kind: "message", x: 466, y: 162 },
];
const SEED_EDGES: Edge[] = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n3" },
  { from: "n2", to: "n4" },
  { from: "n2", to: "n5" },
];
const MENU_OPTIONS = 4;

export function FlowBuilder({ copy }: { copy: FlowBuilderCopy }) {
  const [nodes, setNodes] = useState<FlowNode[]>(SEED_NODES);
  const [edges, setEdges] = useState<Edge[]>(SEED_EDGES);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const surface = useRef<HTMLDivElement>(null);
  const grab = useRef({ dx: 0, dy: 0 });
  const seq = useRef(0);
  const gradId = useId().replace(/:/g, "");

  const clamp = (n: FlowNode): FlowNode => ({
    ...n,
    x: Math.max(6, Math.min(CANVAS_W - NODE_W - 6, n.x)),
    y: Math.max(6, Math.min(CANVAS_H - nodeHeight(n.kind, MENU_OPTIONS) - 6, n.y)),
  });

  /** Converte pixels do ponteiro para unidades do plano logico. */
  const toLogical = useCallback((clientX: number, clientY: number) => {
    const box = surface.current!.getBoundingClientRect();
    return {
      x: ((clientX - box.left) / box.width) * CANVAS_W,
      y: ((clientY - box.top) / box.height) * CANVAS_H,
    };
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>, node: FlowNode) => {
    // So o botao principal arrasta; o resto segue com o comportamento nativo.
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const p = toLogical(event.clientX, event.clientY);
    grab.current = { dx: p.x - node.x, dy: p.y - node.y };
    setSelected(node.id);
    setDragging(node.id);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
    if (dragging !== id) return;
    const p = toLogical(event.clientX, event.clientY);
    setNodes((prev) => prev.map((n) => (n.id === id ? clamp({ ...n, x: p.x - grab.current.dx, y: p.y - grab.current.dy }) : n)));
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(null);
  };

  /** Teclado: o bloco selecionado anda de 12 em 12 unidades; Delete remove. */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, node: FlowNode) => {
    const step = event.shiftKey ? 32 : 12;
    const move = (dx: number, dy: number) => {
      event.preventDefault();
      setNodes((prev) => prev.map((n) => (n.id === node.id ? clamp({ ...n, x: n.x + dx, y: n.y + dy }) : n)));
    };
    if (event.key === "ArrowLeft") move(-step, 0);
    else if (event.key === "ArrowRight") move(step, 0);
    else if (event.key === "ArrowUp") move(0, -step);
    else if (event.key === "ArrowDown") move(0, step);
    else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      removeNode(node.id);
    }
  };

  const removeNode = (id: string) => {
    if (nodes.length <= 1) return;
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    setSelected(null);
    setStatus(copy.removed);
  };

  /** A paleta adiciona um bloco ja ligado ao selecionado (ou ao ultimo). */
  const addNode = (kind: FlowKind) => {
    const parent = nodes.find((n) => n.id === selected) ?? nodes[nodes.length - 1];
    const id = `a${seq.current++}`;
    const next = clamp({
      id,
      kind,
      x: (parent?.x ?? 40) + NODE_W + 60,
      y: (parent?.y ?? 40) + 54,
    });
    setNodes((prev) => [...prev, next]);
    if (parent) setEdges((prev) => [...prev, { from: parent.id, to: id }]);
    setSelected(id);
    setStatus(`${copy.palette[kind]} ${copy.added}`);
  };

  const reset = () => {
    setNodes(SEED_NODES);
    setEdges(SEED_EDGES);
    setSelected(null);
    setStatus("");
  };

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <div className="fb">
      {/* Moldura do navegador, como no print que esta tela substitui. */}
      <div className="fb__chrome">
        <span className="fb__dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="fb__url" aria-hidden="true">sigmacx.ai/builder</span>
      </div>

      <div className="fb__app">
        <div className="fb__rail" aria-hidden="true">
          {["bars", "chat", "send", "list", "sliders", "layers"].map((n) => (
            <span key={n}><Icon name={n} /></span>
          ))}
        </div>

        <div className="fb__main">
          <div className="fb__bar">
            <span className="fb__crumb">{copy.windowTitle}</span>
            <span className="fb__actions" aria-hidden="true">
              <b className="fb__ghost">{copy.preview}</b>
              <b className="fb__solid">{copy.save}</b>
            </span>
          </div>

          <div className="fb__palette">
            {(Object.keys(KIND_ICON) as FlowKind[]).map((kind) => (
              <button key={kind} type="button" className="fb__chip" onClick={() => addNode(kind)}>
                <Icon name={KIND_ICON[kind]} />
                {copy.palette[kind]}
              </button>
            ))}
            <button type="button" className="fb__chip fb__chip--reset" onClick={reset}>{copy.reset}</button>
          </div>

          {/* Envelope rolavel: em telas estreitas a prancheta guarda uma largura
              minima util em vez de espremer os blocos ate o texto transbordar.
              O `touch-action: none` mora no bloco, nao na prancheta, entao o
              dedo no fundo ainda rola a pagina e so o bloco e arrastado. */}
          <div className="fb__canvas">
          <div className="fb__surface" ref={surface} role="group" aria-label={copy.canvasLabel}>
            <svg className="fb__wires" viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} aria-hidden="true">
              <defs>
                <linearGradient id={`fb-${gradId}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00a9a9" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#5da6ff" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              {edges.map((e) => {
                const a = byId.get(e.from), b = byId.get(e.to);
                if (!a || !b) return null;
                const x1 = a.x + NODE_W, y1 = a.y + nodeHeight(a.kind, MENU_OPTIONS) / 2;
                const x2 = b.x, y2 = b.y + nodeHeight(b.kind, MENU_OPTIONS) / 2;
                const bend = Math.max(28, Math.abs(x2 - x1) * 0.45);
                return (
                  <g key={`${e.from}-${e.to}`}>
                    <path d={`M${x1} ${y1} C${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`}
                      fill="none" stroke={`url(#fb-${gradId})`} strokeWidth="1.6" />
                    <circle cx={x2} cy={y2} r="3" fill="#00a9a9" />
                  </g>
                );
              })}
            </svg>

            {nodes.map((node) => {
              const h = nodeHeight(node.kind, MENU_OPTIONS);
              return (
                <div
                  key={node.id}
                  className={`fb__node fb__node--${node.kind}${selected === node.id ? " is-selected" : ""}${dragging === node.id ? " is-dragging" : ""}`}
                  style={{
                    left: `${(node.x / CANVAS_W) * 100}%`,
                    top: `${(node.y / CANVAS_H) * 100}%`,
                    width: `${(NODE_W / CANVAS_W) * 100}%`,
                    height: `${(h / CANVAS_H) * 100}%`,
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${copy.palette[node.kind]}. ${copy.nodeHint}`}
                  onPointerDown={(e) => onPointerDown(e, node)}
                  onPointerMove={(e) => onPointerMove(e, node.id)}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onFocus={() => setSelected(node.id)}
                  onKeyDown={(e) => onKeyDown(e, node)}
                >
                  <span className="fb__node-head">
                    <Icon name={KIND_ICON[node.kind]} />
                    {copy.palette[node.kind]}
                  </span>
                  {node.kind === "message" ? <span className="fb__node-body">{copy.messageBody}</span> : null}
                  {node.kind === "menu" ? (
                    <span className="fb__node-list">
                      {Array.from({ length: MENU_OPTIONS }, (_, i) => (
                        <i key={i}>{copy.option} {i + 1}</i>
                      ))}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
          </div>

          <p className="fb__hint">{copy.hint}</p>
          <span className="fb__status" role="status" aria-live="polite">{status}</span>
        </div>
      </div>
    </div>
  );
}
