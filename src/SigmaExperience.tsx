import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { useLazyVideo } from "./site/useLazyVideo";
import {
  Fragment,
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SiteHeader } from "./site/SiteHeader";
import { Link } from "react-router-dom";
import { startDialogiJourney } from "./site/ProductJourney";
import { HTML_LANG, href, pick, rich, useLang, type Lang } from "./lib/i18n";
import ui from "../content/ui.json";
import homePt from "../content/pages/home.pt.json";
import homeEn from "../content/pages/home.en.json";
import homeEs from "../content/pages/home.es.json";
import GradientText from "./components/GradientText";
import IntelligenceNodes from "./components/IntelligenceNodes";
import IntelligenceCore from "./components/IntelligenceCore";
import InvestorTeaser from "./components/InvestorTeaser";

const DEMO_URL =
  "https://api.whatsapp.com/send/?phone=551142008282&text=Ol%C3%A1%2C+gostaria+de+saber+mais+sobre+a+SigmaCX&type=phone_number&app_absent=0";

const HOME_GRADIENT = ["#b9ff9b", "#5da6ff", "#00a9a9", "#b9ff9b"];

const clientLogos = [
  "/media/client-01.png",
  "/media/client-02.png",
  "/media/client-03.png",
  "/media/client-04.png",
];

const clientLogoLoop = [...clientLogos, ...clientLogos];

type ExperienceProps = {
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
  nodeAnchors: MutableRefObject<(HTMLDivElement | null)[]>;
};

function SignalField({ progress, reducedMotion }: ExperienceProps) {
  const points = useRef<THREE.Points>(null);
  const count = reducedMotion ? 360 : 860;
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const white = new THREE.Color("#f7fcff");
    const blue = new THREE.Color("#9ed7ff");
    const green = new THREE.Color("#b9ff9b");

    for (let index = 0; index < count; index += 1) {
      const radius = 2.3 + Math.random() * 4.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.62;
      positions[index * 3 + 2] = radius * Math.cos(phi);
      const color = index % 13 === 0 ? green : white.clone().lerp(blue, Math.random());
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }

    const next = new THREE.BufferGeometry();
    next.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    next.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return next;
  }, [count]);

  const particleTexture = useMemo(() => {
    const size = 32;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = (x + 0.5) / size - 0.5;
        const dy = (y + 0.5) / size - 0.5;
        const distance = Math.sqrt(dx * dx + dy * dy) / 0.5;
        const glow = Math.max(0, 1 - distance);
        const alpha = Math.pow(glow, 1.65);
        const offset = (y * size + x) * 4;
        data[offset] = 255;
        data[offset + 1] = 255;
        data[offset + 2] = 255;
        data[offset + 3] = Math.round(alpha * 255);
      }
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }, []);

  useFrame((state, delta) => {
    if (!points.current || reducedMotion) return;
    points.current.rotation.y += delta * (0.12 + progress.current * 0.16);
    points.current.rotation.x = state.pointer.y * 0.14 + progress.current * 0.22;
    points.current.position.x = THREE.MathUtils.lerp(
      points.current.position.x,
      state.pointer.x * 0.32,
      0.055,
    );
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.056}
        map={particleTexture}
        alphaTest={0.015}
        transparent
        opacity={0.54}
        vertexColors
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CanvasReady({ onReady }: { onReady: () => void }) {
  const reported = useRef(false);

  useFrame(() => {
    if (reported.current) return;
    reported.current = true;
    window.requestAnimationFrame(onReady);
  });

  return null;
}

function ExperienceCanvas(props: ExperienceProps & { onReady: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 40 }}
      dpr={[1, 1.45]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
    >
      <CanvasReady onReady={props.onReady} />
      <SignalField {...props} />
      <IntelligenceCore {...props} />
    </Canvas>
  );
}

/** Video da home: o src so entra a 600px da tela (woman 1.8 MB, brain 2.6 MB). */
/* O holograma e so particulas: comprimido demais vira borrao. O arquivo de desktop
   (1080p, ~12 Mbps) so compensa em tela larga; no celular vai o 720p, mais leve. */
const BRAIN_VIDEO = typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches
  ? "/media/brain-mobile.mp4"
  : "/media/brain.mp4";

/** Texto do JSON com `\n` como quebra de linha e `**trecho**` em negrito. */
function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <Fragment key={index}>{index > 0 && <br />}{rich(line)}</Fragment>
      ))}
    </>
  );
}

function LazyVideo({ src, label }: { src: string; label: string }) {
  const ref = useLazyVideo(src);
  return <video ref={ref} autoPlay muted loop playsInline preload="none" aria-label={label} />;
}

export function SigmaExperience() {
  const root = useRef<HTMLDivElement>(null);
  const story = useRef<HTMLElement>(null);
  const lang = useLang();
  const t = pick({ pt: homePt, en: homeEn, es: homeEs }, lang);
  const u = pick(ui as Record<Lang, typeof ui.pt>, lang);
  const f = u.footer;

  /* A home nao usa o PageShell: idioma do documento, titulo e descricao aqui. */
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
  }, [lang, t]);
  const openDialogi = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    startDialogiJourney(href("/dialogi", lang), lang);
  };
  const progress = useRef(0);
  const nodeAnchors = useRef<(HTMLDivElement | null)[]>([]);
  const [sceneReady, setSceneReady] = useState(false);
  const [introMinElapsed, setIntroMinElapsed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const motionEnabled = !reducedMotion;
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  // Sem espera minima nem dependencia do canvas: texto e nav aparecem de imediato.
  const visualReady = reducedMotion || introMinElapsed || sceneReady;

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroMinElapsed(true), 0);
    return () => window.clearTimeout(timer);
  }, []);



  useLayoutEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);

    if (!visualReady) {
      const waitingContext = gsap.context(() => {
        gsap.set(".intro-curtain", { animation: "none" });
        gsap.set(".site-header, .hero-kicker, .hero-copy, .hero-actions", { opacity: 0 });
        gsap.set(".hero-title .line", { yPercent: 108 });
      }, root);
      return () => waitingContext.revert();
    }

    const context = gsap.context(() => {
      if (!reducedMotion) {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .set(".intro-curtain", { animation: "none" })
          .set(".site-header", { y: -24, opacity: 0 })
          .set(".hero-kicker", { y: 26, opacity: 0 })
          .set(".hero-title .line", { yPercent: 108 })
          .set(".hero-copy, .hero-actions", { y: 24, opacity: 0 })
          .addLabel("heroReveal", 0)
          .to(".intro-curtain", {
            opacity: 0,
            duration: 0.62,
            ease: "power2.inOut",
            onComplete: () => gsap.set(".intro-curtain", { visibility: "hidden" }),
          }, "heroReveal")
          // Entrada curta e simultanea: nada fica congelado esperando a vez.
          .to(".site-header", { y: 0, opacity: 1, duration: 0.4 }, "heroReveal")
          .to(".hero-kicker", { y: 0, opacity: 1, duration: 0.4 }, "heroReveal")
          .to(".hero-title .line", {
            yPercent: 0,
            duration: 0.5,
            stagger: 0.04,
            onComplete: () => gsap.set(".hero-title .line-wrap", { overflow: "visible" }),
          }, "heroReveal")
          .to(".hero-copy, .hero-actions", {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.03,
          }, "heroReveal+=0.05");

        gsap.to(".hero-stage", {
          yPercent: 24,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.7 },
        });

        gsap.to(".client-rail__track", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });

        gsap.to(".insight-wave rect", {
          scaleY: 0.28,
          transformOrigin: "center",
          duration: 0.75,
          stagger: { each: 0.08, yoyo: true, repeat: -1 },
          ease: "sine.inOut",
        });

        gsap.to(".channel-node", {
          scale: 1.13,
          boxShadow: "0 0 38px rgba(185,255,155,.22)",
          duration: 1.05,
          stagger: { each: 0.22, yoyo: true, repeat: -1 },
          ease: "sine.inOut",
        });

        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => document.documentElement.style.setProperty("--page-progress", String(self.progress)),
        });

        ScrollTrigger.create({
          trigger: story.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
          onUpdate: (self) => {
            progress.current = self.progress;
            document.documentElement.style.setProperty("--story-progress", String(self.progress));
          },
        });

        const signalNodes = gsap.utils.toArray<HTMLElement>(".story-line__node");
        const signalThresholds = [1 / 6, 0.5, 5 / 6];
        let previousSignalProgress: number | null = null;

        ScrollTrigger.create({
          trigger: ".story-track",
          start: "top 68%",
          end: "bottom 38%",
          scrub: 0.65,
          onUpdate: (self) => {
            const nextProgress = self.progress;
            document.documentElement.style.setProperty("--signal-line-progress", String(nextProgress));

            if (previousSignalProgress !== null) {
              signalThresholds.forEach((threshold, index) => {
                const crossed = previousSignalProgress! < threshold && nextProgress >= threshold;
                if (!crossed) return;

                const node = signalNodes[index];
                node?.classList.remove("story-line__node--hit");
                void node?.offsetWidth;
                node?.classList.add("story-line__node--hit");
              });
            }

            previousSignalProgress = nextProgress;
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.from(element, {
            y: 54,
            opacity: 0,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 84%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>(".story-step").forEach((element) => {
          gsap.fromTo(
            element,
            { x: element.classList.contains("story-step--right") ? 56 : -56, opacity: 0.16 },
            {
              x: 0,
              opacity: 1,
              scrollTrigger: {
                trigger: element,
                start: "top 68%",
                end: "bottom 38%",
                scrub: true,
                toggleActions: "play reverse play reverse",
              },
            },
          );
        });

        // Bola que seguia o mouse (.cursor-glow) removida a pedido (2026-09-03).
      } else {
        gsap.set(".intro-curtain", { display: "none" });
      }
    }, root);

    return () => {
      context.revert();
    };
  }, [reducedMotion, visualReady]);

  return (
    <div ref={root} id="top" className={motionEnabled ? "site-shell motion-on" : "site-shell motion-off"}>
      <a className="skip-link" href="#main">{u.nav.skip}</a>
      <SiteHeader />

      <div className="experience-layer" aria-hidden="true">
        <div className="experience-fallback" />
        <div className="tech-hud">
          <div className="tech-hud__grid" />
          <div className="tech-hud__aura" />
          <div className="tech-hud__frame" />
        </div>
        <ExperienceCanvas
          progress={progress}
          nodeAnchors={nodeAnchors}
          reducedMotion={reducedMotion}
          onReady={() => setSceneReady(true)}
        />
        <div className="experience-vignette" />
      </div>

      <main id="main">
        <section className="hero section-dark" aria-labelledby="hero-title">
          <div className="hero-stage">
          <div className="hero-kicker">
            {t.hero.kicker}
          </div>
          <h1 id="hero-title" className="hero-title hero-title--thesis">
            <span className="line-wrap"><span className="line">{t.hero.title}</span></span>
            <span className="line-wrap"><span className="line line--accent"><GradientText className="home-gradient-text" colors={HOME_GRADIENT} animationSpeed={6}>{t.hero.accent}</GradientText></span></span>
          </h1>
          <p className="hero-copy">{t.hero.lead}</p>
          <div className="hero-actions">
            <Link className="pill pill--primary" to={href("/investidores", lang)}>
              {t.hero.cta} <span aria-hidden="true">→</span>
            </Link>
            <a className="text-link" href={DEMO_URL} target="_blank" rel="noreferrer">
              {t.hero.specialist} <span aria-hidden="true">↗</span>
            </a>
          </div>
          </div>
          <IntelligenceNodes anchors={nodeAnchors} lang={lang} />
        </section>

        <InvestorTeaser lang={lang} />

        <section className="manifesto section-dark" aria-labelledby="manifesto-title">
          <div className="manifesto-signal" aria-hidden="true">
            <span>CH</span><span>WA</span><span>{t.voice}</span><span>IA</span>
          </div>
          <div className="manifesto-copy" data-reveal>
            <span className="section-index">{t.manifesto.index}</span>
            <p>{t.manifesto.body}</p>
            <h2 id="manifesto-title">{t.manifesto.title}<br /><strong><GradientText className="home-gradient-text" colors={HOME_GRADIENT} animationSpeed={7}>{t.manifesto.accent}</GradientText></strong></h2>
          </div>
        </section>

        <section id="experience" ref={story} className="signal-story section-dark" aria-labelledby="story-title">
          <div className="story-intro" data-reveal>
            <span className="section-index">{t.story.index}</span>
            <h2 id="story-title"><Lines text={t.story.title} /></h2>
            <p>{t.story.lead}</p>
          </div>
          <div className="story-track">
            <div className="story-line" aria-hidden="true">
              <span className="story-line__track" />
              <span className="story-line__fill" />
              <span className="story-line__pulse" />
              <span className="story-line__node story-line__node--one" />
              <span className="story-line__node story-line__node--two" />
              <span className="story-line__node story-line__node--three" />
            </div>
            <article className="story-step">
              <span className="step-number">01</span>
              <div>
                <p className="eyebrow">{t.story.steps[0].eyebrow}</p>
                <h3><Lines text={t.story.steps[0].title} /></h3>
                <p>{t.story.steps[0].body}</p>
              </div>
            </article>
            <article className="story-step story-step--right">
              <span className="step-number">02</span>
              <div>
                <p className="eyebrow">{t.story.steps[1].eyebrow}</p>
                <h3><Lines text={t.story.steps[1].title} /></h3>
                <p>{t.story.steps[1].body}</p>
              </div>
            </article>
            <article className="story-step">
              <span className="step-number">03</span>
              <div>
                <p className="eyebrow">{t.story.steps[2].eyebrow}</p>
                <h3><Lines text={t.story.steps[2].title} /></h3>
                <p>{t.story.steps[2].body}</p>
              </div>
            </article>
          </div>
        </section>

        <div className="section-transition section-transition--dark-light" aria-hidden="true">
          <span /><span /><span />
        </div>

        <section id="proof" className="proof section-light" aria-labelledby="proof-title">
          <div className="section-heading" data-reveal>
            <span className="section-index">{t.proof.index}</span>
            <h2 id="proof-title"><Lines text={t.proof.title} /></h2>
            <p>{t.proof.lead}</p>
          </div>
          <div className="client-rail" data-reveal aria-label={t.aria.clients}>
            <div className="client-rail__track">
              {[0, 1].map((group) => (
                <div className="client-rail__group" key={group} aria-hidden={group === 1}>
                  {clientLogoLoop.map((logo, index) => (
                    <img
                      key={`${group}-${logo}-${index}`}
                      src={logo}
                      alt={group === 0 && index < clientLogos.length ? t.aria.clientLogo : ""}
                      aria-hidden={group === 1 || index >= clientLogos.length}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="testimonials">
            <article className="quote-card" data-reveal>
              <img src="/media/tecban.webp" alt="Tecban" />
              <blockquote>
                {t.proof.quotes[0].text}
              </blockquote>
              <p>{t.proof.quotes[0].author}</p>
            </article>
            <article className="quote-card quote-card--dark" data-reveal>
              <img src="/media/fractalia.png" alt="Grupo Fractalia" />
              <blockquote>
                {t.proof.quotes[1].text}
              </blockquote>
              <p>{t.proof.quotes[1].author}</p>
            </article>
          </div>
        </section>

        <div className="section-transition section-transition--light-dark" aria-hidden="true">
          <span /><span /><span />
        </div>

        <div className="solution-flow">
        <section className="solution-compare section-dark" aria-labelledby="solutions-title">
          <div className="solution-compare__heading" data-reveal>
            <span className="section-index">{t.solutions.index}</span>
            <h2 id="solutions-title">{t.solutions.title}<br /><strong><GradientText className="home-gradient-text" colors={HOME_GRADIENT} animationSpeed={7}>{t.solutions.accent}</GradientText></strong></h2>
          </div>
          <div className="solution-compare__grid">
            <article className="solution-card" data-reveal>
              <span className="solution-card__code">SIGMA / CX OPERATING SYSTEM</span>
              <h3>{t.solutions.sigma.title}</h3>
              <p>{t.solutions.sigma.body}</p>
              <p><strong>{t.solutions.sigma.strong}</strong></p>
              <div className="solution-card__brand solution-card__brand--sigma">
                <img src="/media/sigma-mark.png" alt="" /><span>Sigma</span>
              </div>
              <a className="solution-card__link" href="#platform">{t.solutions.sigma.link} <span aria-hidden="true">→</span></a>
            </article>

            <article className="solution-card solution-card--dialogi" data-reveal>
              <span className="solution-card__code">DIALOGI / HUMAN CONVERSATIONS</span>
              <h3>{t.solutions.dialogi.title}</h3>
              <p>{t.solutions.dialogi.body}</p>
              <p><strong>{t.solutions.dialogi.strong}</strong></p>
              <div className="solution-card__brand">
                <img src="/media/dialogi.png" alt="Dialogi AI" />
              </div>
              <a className="solution-card__link" href={href("/dialogi", lang)} onClick={openDialogi}>{t.solutions.dialogi.link} <span aria-hidden="true">→</span></a>
            </article>
          </div>
        </section>

        <section className="connection section-dark" aria-labelledby="connection-title">
          <div className="connection-media" data-reveal>
            <LazyVideo src="/media/woman.mp4" label={t.aria.womanVideo} />
            <div className="video-data"><span>CONNECTION / 01</span><span>LIVE SIGNAL</span></div>
          </div>
          <div className="connection-copy" data-reveal>
            <img className="dialogi-logo" src="/media/dialogi.png" alt="Dialogi" />
            <span className="section-index">{t.connection.index}</span>
            <h2 id="connection-title">{t.connection.title}</h2>
            <p>{t.solutions.dialogi.body}</p>
            <p><strong>{t.solutions.dialogi.strong}</strong></p>
            <a className="pill pill--outline" href="#platform">{t.connection.cta} <span aria-hidden="true">→</span></a>
          </div>
        </section>
        </div>

        <section id="platform" className="platform section-dark" aria-labelledby="platform-title">
          <div className="section-heading section-heading--dark" data-reveal>
            <span className="section-index">{t.platform.index}</span>
            <h2 id="platform-title">{t.platform.title}<br /><GradientText className="home-gradient-text" colors={HOME_GRADIENT} animationSpeed={7}>{t.platform.accent}</GradientText></h2>
            <p>{t.platform.body}</p>
            <p><strong>{t.platform.strong}</strong></p>
          </div>
          <div className="suite-grid">
            <article className="suite-card suite-card--brain" data-reveal>
              <LazyVideo src={BRAIN_VIDEO} label={t.aria.brainVideo} />
              <div className="suite-overlay" />
              <div className="suite-card-content">
                <h3>Sigma Brain</h3>
                <p>{t.platform.brain}</p>
                <Link to={href("/sigma-brain", lang)}>{t.platform.brainLink} →</Link>
              </div>
            </article>
            <article className="suite-card suite-card--channel suite-card--module" data-reveal>
              <div className="channel-visual" aria-hidden="true">
                <span className="channel-node channel-node--one">IA</span>
                <span className="channel-node channel-node--two">{t.voice}</span>
                <span className="channel-node channel-node--three">CHAT</span>
                <span className="channel-core"><img src="/media/sigma-mark.png" alt="" /></span>
                <i className="channel-signal channel-signal--one" /><i className="channel-signal channel-signal--two" /><i className="channel-signal channel-signal--three" />
              </div>
              <div className="suite-card-content">
                <h3>Sigma Channel</h3>
                <p>{t.platform.channel}</p>
                <Link className="suite-module-link" to={href("/sigma-channel", lang)} aria-label={t.platform.channelLink}>→</Link>
              </div>
            </article>
            <article className="suite-card suite-card--insights suite-card--module" data-reveal>
              <div className="insight-visual" aria-hidden="true">
                  <svg className="insight-wave" viewBox="0 0 360 90" fill="none">
                    {[4, 7, 12, 12, 20, 38, 24, 26, 50, 86, 70, 34, 20, 42, 56, 34, 22, 12, 12, 14, 10, 6].map((height, index) => (
                      <rect key={index} x={8 + index * 16} y={(90 - height) / 2} width="5" height={height} rx="2.5" fill={index < 11 ? "#5da6ff" : "#b9ff9b"} />
                    ))}
                  </svg>
              </div>
              <div className="suite-card-content">
                <h3>Sigma Insights</h3>
                <p>{t.platform.insights}</p>
                <Link className="suite-module-link" to={href("/sigma-insights", lang)} aria-label={t.platform.insightsLink}>→</Link>
              </div>
            </article>
          </div>
        </section>

        <div className="section-transition section-transition--dark-light" aria-hidden="true">
          <span /><span /><span />
        </div>

        <section id="trust" className="trust-interlude section-light" aria-label={t.trust.aria}>
          <aside className="trust-metric" data-reveal>
            <span>81%</span>
            <p>{rich(t.trust.body)}</p>
            <small>TRUST / CUSTOMER EXPERIENCE</small>
          </aside>
        </section>

        <div className="section-transition section-transition--light-dark" aria-hidden="true">
          <span /><span /><span />
        </div>

        <div className="security-final-flow">
        <section id="security" className="security section-dark" aria-labelledby="security-title">
          <div className="security-frame">
          <div className="security-orbit" aria-hidden="true">
            <div className="security-core">
              <span className="security-core__lock"><i /></span>
              <strong>LGPD</strong>
              <small>DATA / SECURE</small>
            </div>
          </div>
          <div className="security-copy" data-reveal>
            <span className="section-index">{t.security.index}</span>
            <h2 id="security-title">{t.security.title}<br /><span><GradientText className="home-gradient-text" colors={HOME_GRADIENT} animationSpeed={7}>{t.security.accent}</GradientText></span></h2>
            <p>{t.security.body1}</p>
            <p>{t.security.body2}</p>
            <div className="security-flow" aria-label={t.security.flowAria}>
              <span><small>01</small>{t.security.flow[0]}</span>
              <i aria-hidden="true" />
              <span><small>02</small>{t.security.flow[1]}</span>
              <i aria-hidden="true" />
              <span><small>03</small>{t.security.flow[2]}</span>
            </div>
            <div className="cert-row">
              <span>LGPD</span><span>GDPR</span><span>PCI</span><span>ISO 27001</span>
            </div>
          </div>
          </div>
        </section>

        </div>
      </main>

      <div className="home-closing">
        <div className="home-closing__background" aria-hidden="true">
          <div className="footer-atmosphere">
            <span className="footer-orbit footer-orbit--outer" />
            <span className="footer-orbit footer-orbit--inner" />
          </div>
        </div>
        <section className="final-cta section-dark" aria-labelledby="final-title">
          <p className="eyebrow" data-reveal>{t.final.eyebrow}</p>
          <h2 id="final-title" data-reveal><Lines text={t.final.title} /></h2>
          <a className="pill pill--primary pill--large" href={DEMO_URL} target="_blank" rel="noreferrer" data-reveal>
            {t.final.cta} <span aria-hidden="true">↗</span>
          </a>
        </section>
      <footer className="footer">

        <div className="footer-top">
          <div className="footer-manifesto">
            <div className="footer-identity">
              <img src="/media/logo-white.png" alt="SigmaCX" />
            </div>
            <h2>{f.headline1}<br /><em>{f.headline2}</em></h2>
            <p>{f.manifesto}</p>
            <a className="footer-contact" href="mailto:canais@nuveto.com.br">
              <span className="footer-contact__icon" aria-hidden="true">@</span>
              <span><small>{f.channel}</small><strong>canais@nuveto.com.br</strong></span>
              <b aria-hidden="true">↗</b>
            </a>
          </div>

          <nav className="footer-links" aria-label={t.aria.footerNav}>
            <div>
              <span>{f.platform}</span>
              <a href="#platform">{t.footer.suite}</a>
              <a href="#experience">{t.footer.experience}</a>
              <a href="#proof">{t.footer.results}</a>
              <a href="#security">{t.footer.security}</a>
            </div>
            <div>
              <span>{f.connections}</span>
              <a href={DEMO_URL} target="_blank" rel="noreferrer">{f.demo}</a>
              <a href="mailto:canais@nuveto.com.br">{f.partner}</a>
              <a href="https://sigmacx.ai/" target="_blank" rel="noreferrer">{t.footer.institutional}</a>
            </div>
          </nav>

          <a className="footer-launch" href={DEMO_URL} target="_blank" rel="noreferrer">
            <span className="footer-launch__label">{f.launchLabel}</span>
            <strong>{f.launch1}<br />{f.launch2}<br />{f.launch3}</strong>
            <span className="footer-launch__copy">{f.launchCopy}</span>
            <span className="footer-launch__button">{f.launchButton} <b>↗</b></span>
          </a>
        </div>

        <div className="footer-wordmark" aria-hidden="true">
          <span>SigmaCX</span>
        </div>

        <div className="footer-bottom">
          <span>{f.place} <i>UTC −03:00</i></span>
          <span>{f.rights}</span>
        </div>
      </footer>
      </div>
    </div>
  );
}
