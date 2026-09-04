import { Component, lazy, Suspense, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useLazyVideo } from "./useLazyVideo";
import { useLang, type Lang } from "../lib/i18n";
import BorderGlow from "../components/BorderGlow";
import GradientText from "../components/GradientText";
// O registry solicitado entrega esta variante em JSX; o wrapper abaixo fixa
// os parametros de marca, remove toda interacao de ponteiro e carrega o WebGL
// apenas quando uma pagina que realmente usa o efeito for aberta.
// @ts-expect-error componente JSX do registry React Bits sem declaracao TS
const FloatingLines = lazy(() => import("../components/FloatingLines.jsx"));

const TECH_LINES = {
  suite: {
    colors: ["#00a9a9", "#5da6ff", "#b9ff9b"],
    waves: ["top", "middle", "bottom"],
    count: [3, 5, 3],
    distance: [13, 9, 13],
  },
  brain: {
    colors: ["#185a7d", "#00a9a9", "#9ff0ea"],
    waves: ["middle", "bottom"],
    count: [5, 3],
    distance: [10, 15],
  },
  channel: {
    colors: ["#5da6ff", "#136d87", "#7fe7e3"],
    waves: ["top", "middle"],
    count: [3, 5],
    distance: [15, 10],
  },
} as const;

/** Efeito decorativo: se o WebGL ou o chunk falharem, some em silencio em
 *  vez de derrubar a pagina inteira (React desmonta tudo num erro sem boundary). */
class SilentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err: unknown) { console.warn("Efeito decorativo desligado:", err); }
  render() { return this.state.failed ? null : this.props.children; }
}

/** Linhas ambientais da marca: lentas, sem cursor, sem parallax. */
export function TechLines({ variant = "suite" }: { variant?: keyof typeof TECH_LINES }) {
  const config = TECH_LINES[variant];
  return (
    <div className={`sx-tech-lines sx-tech-lines--${variant}`} aria-hidden="true">
      <SilentBoundary>
      <Suspense fallback={null}>
        <FloatingLines
          linesGradient={config.colors}
          enabledWaves={config.waves}
          lineCount={config.count}
          lineDistance={config.distance}
          animationSpeed={0.34}
          interactive={false}
          parallax={false}
          mixBlendMode="screen"
          backgroundColor="#061123"
        />
      </Suspense>
      </SilentBoundary>
    </div>
  );
}

const SOUND_LABEL: Record<Lang, { on: string; off: string }> = {
  pt: { on: "Ativar som", off: "Silenciar" },
  en: { on: "Unmute", off: "Mute" },
  es: { on: "Activar sonido", off: "Silenciar" },
};

/** Botao mudo/som no canto do video. Os videos abrem mudos (autoplay exige)
 *  e o clique libera o audio. */
function SoundButton({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  const lang = useLang();
  const label = muted ? SOUND_LABEL[lang].on : SOUND_LABEL[lang].off;
  return (
    <button type="button" className="sx-video__sound" onClick={onToggle} aria-label={label} title={label} aria-pressed={!muted}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 10v4h3l4 4V6L7 10H4z" />
        {muted ? <path d="M16 9l5 6M21 9l-5 6" /> : <><path d="M15.5 9.5a3.5 3.5 0 010 5" /><path d="M18 7a7 7 0 010 10" /></>}
      </svg>
    </button>
  );
}

/** Vimeo em modo background (autoplay, mudo, loop), como na referencia.
 *  O player (320 KB de JS + segmentos) so e montado depois do load da pagina
 *  e quando o quadro esta a menos de 600px da tela, para nao disputar rede e
 *  CPU com o texto/LCP; o quadro ja reserva o espaco (sem salto de layout). */
export function Vimeo({ id, className = "", title = "Vídeo", preloadMargin = 600 }: { id: string; className?: string; title?: string; preloadMargin?: number }) {
  const src = `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1&playsinline=1&title=0&byline=0&portrait=0`;
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const send = (method: string, value: unknown) =>
    frame.current?.contentWindow?.postMessage({ method, value }, "https://player.vimeo.com");
  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    send("setMuted", next);
    send("setVolume", next ? 0 : 1);
  };
  useEffect(() => {
    const el = box.current;
    if (!el || ready) return;
    let io: IntersectionObserver | undefined;
    let idle = 0;
    const arm = () => {
      if (!("IntersectionObserver" in window)) { setReady(true); return; }
      io = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io?.disconnect();
        setReady(true);
      }, { rootMargin: `${preloadMargin}px 0px` });
      io.observe(el);
    };
    const afterLoad = () => { idle = window.setTimeout(arm, 250); };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    return () => { window.removeEventListener("load", afterLoad); window.clearTimeout(idle); io?.disconnect(); };
  }, [ready]);
  return (
    <div ref={box} className={`sx-video ${className}`}>
      {ready ? <iframe ref={frame} src={src} title={title} allow="autoplay; fullscreen; picture-in-picture" /> : null}
      {ready ? <SoundButton muted={muted} onToggle={toggleSound} /> : null}
    </div>
  );
}

/** mp4 hospedado (autoplay, mudo, loop). */
export function Video({ src, className = "", sound = false }: { src: string; className?: string; sound?: boolean }) {
  const ref = useLazyVideo(src);
  const [muted, setMuted] = useState(true);
  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    const el = ref.current;
    if (!el) return;
    el.muted = next;
    el.volume = 1;
    if (!next) el.play().catch(() => undefined);
  };
  return (
    <div className={`sx-video ${className}`}>
      <video ref={ref} autoPlay muted={muted} loop playsInline preload="none" />
      {sound ? <SoundButton muted={muted} onToggle={toggleSound} /> : null}
    </div>
  );
}

/** Video de fundo cobrindo a faixa, com overlay navy. */
export function BandVideo({ src, opacity }: { src: string; opacity: number }) {
  const ref = useLazyVideo(src);
  return (
    <>
      <video ref={ref} className="sx-band__bg" autoPlay muted loop playsInline preload="none" aria-hidden="true" />
      <div className="sx-band__overlay" style={{ opacity }} aria-hidden="true" />
    </>
  );
}

/** Carrossel horizontal com scroll-snap e setas. */
export function Carousel({ children, columns = 2, label }: { children: ReactNode; columns?: 2 | 3; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };
  return (
    <div className="sx-carousel">
      <div className="sx-carousel__nav">
        <button type="button" className="sx-carousel__btn" onClick={() => go(-1)} aria-label={`${label}: anterior`}>←</button>
        <button type="button" className="sx-carousel__btn" onClick={() => go(1)} aria-label={`${label}: próximo`}>→</button>
      </div>
      <div ref={track} className={`sx-carousel__track${columns === 3 ? " sx-carousel__track--3" : ""}`} role="region" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

const PATHS: Record<string, string> = {
  list: "M4 6h16M4 12h16M4 18h10",
  chat: "M4 5h16v11H8l-4 4V5z",
  send: "M3 11l18-8-8 18-2-8-8-2z",
  heart: "M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z",
  sliders: "M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6",
  layers: "M12 3l9 5-9 5-9-5 9-5zm-9 9l9 5 9-5",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zm9 16l-4-4",
  users: "M16 19v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9.5 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM21 19v-2a4 4 0 00-3-3.87M15 4.13a3.5 3.5 0 010 6.74",
  target: "M12 21a9 9 0 100-18 9 9 0 000 18zm0-5a4 4 0 100-8 4 4 0 000 8zm0-3v0",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z",
  translate: "M4 5h8M8 3v2M6 5c0 4 3 7 6 8M10 5c0 4-3 7-6 8M13 21l4-10 4 10M14.5 17h5",
  smile: "M12 21a9 9 0 100-18 9 9 0 000 18zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
  phone: "M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zm3 15h2",
  cart: "M3 4h2l2 12h11l2-8H6M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z",
  truck: "M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 100-4 2 2 0 000 4zm11 0a2 2 0 100-4 2 2 0 000 4z",
  wallet: "M3 7h18v12H3zM3 7l2-3h12l2 3M16 13h2",
  bell: "M6 16V11a6 6 0 1112 0v5l2 2H4l2-2zm4 4a2 2 0 004 0",
  check: "M4 12l5 5L20 7",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z",
  compass: "M12 21a9 9 0 100-18 9 9 0 000 18zm3-12l-2 5-5 2 2-5 5-2z",
  bars: "M5 20v-8M12 20V5M19 20v-11",
  gear: "M12 15a3 3 0 100-6 3 3 0 000 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1",
  globe: "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
};

export function Icon({ name, fill = false }: { name: keyof typeof PATHS | string; fill?: boolean }) {
  return (
    <span className={`sx-icon${fill ? " sx-icon--fill" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d={PATHS[name] ?? PATHS.spark} />
      </svg>
    </span>
  );
}

type AccordionItem = {
  eyebrow?: string;
  title: string;
  body: string;
};

/** Accordion controlado, pensado para listas longas ao lado de mídia. */
export function FeatureAccordion({
  items,
  icons,
  active,
  onChange,
  label,
}: {
  items: AccordionItem[];
  icons: string[];
  active: number;
  onChange: (index: number) => void;
  label: string;
}) {
  return (
    <div className="sx-accordion" aria-label={label}>
      {items.map((item, index) => {
        const isOpen = active === index;
        const panelId = `sx-accordion-panel-${index}`;
        const buttonId = `sx-accordion-button-${index}`;
        return (
          <article className={`sx-accordion__item${isOpen ? " is-open" : ""}`} key={item.title}>
            <button
              className="sx-accordion__trigger"
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => onChange(index)}
            >
              <Icon name={icons[index]} fill />
              <span className="sx-accordion__heading">
                {item.eyebrow ? <span className="sx-item__kicker">{item.eyebrow}</span> : null}
                <strong>{item.title}</strong>
              </span>
              <span className="sx-accordion__plus" aria-hidden="true" />
            </button>
            <div
              className="sx-accordion__panel"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
            >
              <div><p>{item.body}</p></div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ArrowDown() {
  return (
    <svg className="sx-arrow-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 4v16m0 0l-6-6m6 6l6-6" />
    </svg>
  );
}

/** Marca Sigma bem transparente ao fundo de uma secao clara (charme, sem quadriculado). */
export function Watermark({ side = "right" }: { side?: "left" | "right" }) {
  return <img className={`sx-watermark sx-watermark--${side}`} src="/media/sigma-mark.png" alt="" aria-hidden="true" loading="lazy" />;
}

/**
 * Marca S do Sigma em fatias translucidas de cinza (cartao de visita do brand
 * kit). Usa o PNG da marca como mascara de um gradiente, para sair na cor da
 * paleta neutra em qualquer tamanho. So aparece dentro de .sx-page--suite.
 */
export function SuiteMark({ side = "right" }: { side?: "left" | "right" }) {
  const id = useId().replace(/:/g, "");
  // Geometria medida no PNG da marca (canvas 800): espinha superior em x=330,
  // inferior em x=470; cada fatia e uma meia-elipse presa a espinha.
  return (
    <svg className={`sx-suite-mark${side === "left" ? " sx-suite-mark--left" : ""}`} viewBox="160 60 480 680" aria-hidden="true">
      <defs>
        <linearGradient id={`sxsm-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c0c5cd" />
          <stop offset="1" stopColor="#e6e8eb" />
        </linearGradient>
      </defs>
      <g fill={`url(#sxsm-${id})`}>
        <path d="M330 80 A140 165 0 0 1 330 410 Z" />
        <path d="M330 120 A95 125 0 0 0 330 370 Z" />
        <path d="M235 175 A55 70 0 0 0 235 315 Z" />
        <path d="M470 385 A140 165 0 0 0 470 715 Z" />
        <path d="M470 425 A95 125 0 0 1 470 675 Z" />
        <path d="M565 480 A55 70 0 0 1 565 620 Z" />
      </g>
    </svg>
  );
}

/**
 * BorderGlow (react-bits) nas cores da marca: moldura que acende na borda
 * conforme o cursor se aproxima. `animated` faz uma varredura ao montar (bom
 * em paineis que trocam com key). `dark` = superficie ink.
 */
export function SuiteGlow({
  children,
  radius = 22,
  dark = false,
  animated = false,
  className = "",
}: {
  children: ReactNode;
  radius?: number;
  dark?: boolean;
  animated?: boolean;
  className?: string;
}) {
  return (
    <BorderGlow
      className={`sx-glow ${className}`}
      borderRadius={radius}
      glowColor="180 100 45"
      backgroundColor={dark ? "#1f2939" : "#ffffff"}
      colors={["#00a9a9", "#136d87", "#185a7d"]}
      glowIntensity={dark ? 1.2 : 1.1}
      glowRadius={44}
      fillOpacity={dark ? 0.6 : 0.4}
      edgeSensitivity={20}
      animated={animated}
    >
      {children}
    </BorderGlow>
  );
}

/** GradientText (react-bits) para frases grandes de destaque, ink -> petroleo -> teal. */
export function SuiteGradient({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <GradientText
      className="sx-gradient"
      colors={onDark ? ["#ffffff", "#9ff0ea", "#ffffff", "#cfe7ee"] : ["#1f2939", "#136d87", "#00a9a9", "#185a7d"]}
      animationSpeed={6}
    >
      {children}
    </GradientText>
  );
}

/**
 * Titulo com as palavras subindo uma a uma (como as linhas do hero da home).
 * Aceita a marcacao leve dos JSON (**negrito**, *italico*).
 */
export function SplitText({ text }: { text: string }) {
  const segments: { text: string; strong: boolean; em: boolean }[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) segments.push({ text: text.slice(last, m.index), strong: false, em: false });
    segments.push(m[1] !== undefined ? { text: m[1], strong: true, em: false } : { text: m[2], strong: false, em: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), strong: false, em: false });
  let i = 0;
  return (
    <span className="sx-split">
      {segments.map((seg, s) => {
        const words = seg.text.split(/(\s+)/).map((part, p) => {
          if (!part) return null;
          if (/^\s+$/.test(part)) return " ";
          const word = <span style={{ ["--i" as string]: i++ }}>{part}</span>;
          return <span className="sx-word" key={`${s}-${p}`}>{word}</span>;
        });
        if (seg.strong || seg.em) {
          const gradient = (
            <GradientText
              className="sx-gradient sx-title-gradient"
              colors={["#185a7d", "#00a9a9", "#136d87", "#1f2939"]}
              animationSpeed={7}
            >
              {words}
            </GradientText>
          );
          return seg.strong ? <strong key={s}>{gradient}</strong> : <em key={s}>{gradient}</em>;
        }
        return <span key={s}>{words}</span>;
      })}
    </span>
  );
}
