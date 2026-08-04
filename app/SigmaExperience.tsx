"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";
import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DEMO_URL =
  "https://api.whatsapp.com/send/?phone=551142008282&text=Ol%C3%A1%2C+gostaria+de+saber+mais+sobre+a+SigmaCX&type=phone_number&app_absent=0";

const clientLogos = [
  "/media/client-01.png",
  "/media/client-02.png",
  "/media/client-03.png",
  "/media/client-04.png",
];

type ExperienceProps = {
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
};

function SignalField({ progress, reducedMotion }: ExperienceProps) {
  const points = useRef<THREE.Points>(null);
  const count = reducedMotion ? 340 : 900;
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const green = new THREE.Color("#b9ff9b");
    const blue = new THREE.Color("#5da6ff");

    for (let index = 0; index < count; index += 1) {
      const radius = 2.3 + Math.random() * 4.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.62;
      positions[index * 3 + 2] = radius * Math.cos(phi);
      const color = green.clone().lerp(blue, Math.random());
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }

    const next = new THREE.BufferGeometry();
    next.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    next.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return next;
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current || reducedMotion) return;
    points.current.rotation.y += delta * (0.028 + progress.current * 0.08);
    points.current.rotation.x = state.pointer.y * 0.08 + progress.current * 0.18;
    points.current.position.x = THREE.MathUtils.lerp(
      points.current.position.x,
      state.pointer.x * 0.16,
      0.035,
    );
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.022}
        transparent
        opacity={0.72}
        vertexColors
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function IntelligenceCore({ progress, reducedMotion }: ExperienceProps) {
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!group.current || !shell.current || reducedMotion) return;
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.16 + progress.current * 0.52,
      0.035,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      state.pointer.x * -0.11 + progress.current * 0.22,
      0.035,
    );
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.1) * 0.025;
    shell.current.scale.setScalar(pulse + progress.current * 0.22);
  });

  return (
    <Float speed={reducedMotion ? 0 : 0.75} rotationIntensity={0.12} floatIntensity={0.18}>
      <group ref={group}>
        <mesh ref={shell}>
          <icosahedronGeometry args={[1.28, 3]} />
          <meshPhysicalMaterial
            color="#0d1b38"
            emissive="#214b75"
            emissiveIntensity={0.34}
            roughness={0.24}
            metalness={0.45}
            transparent
            opacity={0.72}
            wireframe
          />
        </mesh>
        <mesh scale={0.58}>
          <icosahedronGeometry args={[1.24, 2]} />
          <meshPhysicalMaterial
            color="#b9ff9b"
            emissive="#b9ff9b"
            emissiveIntensity={1.4}
            transparent
            opacity={0.2}
            roughness={0.12}
          />
        </mesh>
        {[1.68, 2.02, 2.38].map((radius, index) => (
          <mesh
            key={radius}
            rotation={[
              Math.PI / (2.4 + index * 0.35),
              index * 0.76,
              index * 0.33,
            ]}
          >
            <torusGeometry args={[radius, 0.008 + index * 0.002, 10, 140]} />
            <meshBasicMaterial
              color={index === 1 ? "#5da6ff" : "#b9ff9b"}
              transparent
              opacity={0.42 - index * 0.08}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function ExperienceCanvas(props: ExperienceProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 42 }}
      dpr={[1, 1.45]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
    >
      <ambientLight intensity={0.42} />
      <pointLight position={[3, 3, 4]} intensity={12} color="#b9ff9b" />
      <pointLight position={[-4, -2, 3]} intensity={9} color="#5da6ff" />
      <SignalField {...props} />
      <IntelligenceCore {...props} />
      <Environment preset="night" />
    </Canvas>
  );
}

function Header({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (open: boolean) => void }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="SigmaCX — início">
        <img src="/media/logo-white.png" alt="SigmaCX" />
      </a>
      <nav className={menuOpen ? "nav nav--open" : "nav"} aria-label="Navegação principal">
        <a href="#experience" onClick={() => setMenuOpen(false)}>Experiência</a>
        <a href="#platform" onClick={() => setMenuOpen(false)}>Sigma Suite</a>
        <a href="#proof" onClick={() => setMenuOpen(false)}>Resultados</a>
        <a href="#security" onClick={() => setMenuOpen(false)}>Segurança</a>
      </nav>
      <div className="header-actions">
        <span className="language" aria-label="Idioma atual: português">PT</span>
        <a className="pill pill--small" href={DEMO_URL} target="_blank" rel="noreferrer">
          Agende uma demo <span aria-hidden="true">↗</span>
        </a>
        <button
          className={menuOpen ? "menu-toggle menu-toggle--open" : "menu-toggle"}
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export function SigmaExperience() {
  const root = useRef<HTMLDivElement>(null);
  const story = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      if (!reducedMotion) {
        const lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(".site-header", { y: -24, opacity: 0, duration: 0.9 })
          .from(".hero-kicker", { y: 26, opacity: 0, duration: 0.75 }, "-=0.45")
          .from(".hero-title .line", { yPercent: 108, duration: 1.05, stagger: 0.11 }, "-=0.45")
          .from(".hero-copy, .hero-actions, .hero-meta", { y: 24, opacity: 0, duration: 0.75, stagger: 0.09 }, "-=0.65");

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
            { opacity: 0.2 },
            {
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

        const xTo = gsap.quickTo(".cursor-glow", "x", { duration: 0.55, ease: "power3" });
        const yTo = gsap.quickTo(".cursor-glow", "y", { duration: 0.55, ease: "power3" });
        const move = (event: PointerEvent) => {
          xTo(event.clientX);
          yTo(event.clientY);
        };
        window.addEventListener("pointermove", move);

        return () => {
          window.removeEventListener("pointermove", move);
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      }
    }, root);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <div ref={root} id="top" className="site-shell">
      <a className="skip-link" href="#main">Pular para o conteúdo</a>
      <div className="cursor-glow" aria-hidden="true" />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="experience-layer" aria-hidden="true">
        <div className="experience-fallback" />
        <ExperienceCanvas progress={progress} reducedMotion={reducedMotion} />
        <div className="experience-vignette" />
      </div>

      <main id="main">
        <section className="hero section-dark" aria-labelledby="hero-title">
          <div className="hero-kicker">
            <span className="signal-dot" />
            CX inteligente começa com a tecnologia certa
          </div>
          <h1 id="hero-title" className="hero-title">
            <span className="line-wrap"><span className="line">It’s for</span></span>
            <span className="line-wrap"><span className="line line--accent">you.</span></span>
          </h1>
          <p className="hero-copy">
            Soluções que <strong>escutam</strong>, entendem e melhoram cada conversa entre marcas e pessoas.
          </p>
          <div className="hero-actions">
            <a className="pill pill--primary" href="#experience">
              Entre na experiência <span aria-hidden="true">↓</span>
            </a>
            <a className="text-link" href={DEMO_URL} target="_blank" rel="noreferrer">
              Fale com um especialista <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="hero-meta" aria-label="Capacidades da plataforma">
            <span>Voz</span><span>Texto</span><span>Dados</span><span>IA</span>
          </div>
          <div className="scroll-cue" aria-hidden="true"><span /> Role para conectar os sinais</div>
        </section>

        <section id="experience" ref={story} className="signal-story section-dark" aria-labelledby="story-title">
          <div className="story-intro" data-reveal>
            <span className="section-index">01 / A inteligência</span>
            <h2 id="story-title">Toda conversa<br />tem algo a dizer.</h2>
            <p>O SigmaCX transforma milhares de interações em uma visão viva da sua operação.</p>
          </div>
          <div className="story-track">
            <article className="story-step">
              <span className="step-number">01</span>
              <div>
                <p className="eyebrow">Escuta em escala</p>
                <h3>Sinais entram<br />por todos os canais.</h3>
                <p>Voz, chat, WhatsApp e redes sociais convergem sem perder contexto.</p>
              </div>
            </article>
            <article className="story-step story-step--right">
              <span className="step-number">02</span>
              <div>
                <p className="eyebrow">Entende de verdade</p>
                <h3>A IA reconhece<br />o que não foi dito.</h3>
                <p>Intenção, emoção, padrões e oportunidades surgem em tempo real.</p>
              </div>
            </article>
            <article className="story-step">
              <span className="step-number">03</span>
              <div>
                <p className="eyebrow">Transforma em ação</p>
                <h3>Insight deixa de ser<br />relatório. Vira decisão.</h3>
                <p>Cada módulo trabalha junto para fazer a experiência evoluir continuamente.</p>
              </div>
            </article>
          </div>
        </section>

        <section id="proof" className="proof section-light" aria-labelledby="proof-title">
          <div className="section-heading" data-reveal>
            <span className="section-index">02 / Confiança</span>
            <h2 id="proof-title">Soluções que<br />conquistam líderes.</h2>
            <p>Resultados reais, em operações onde cada conversa importa.</p>
          </div>
          <div className="client-rail" data-reveal aria-label="Empresas clientes">
            {[...clientLogos, ...clientLogos].map((logo, index) => (
              <img key={`${logo}-${index}`} src={logo} alt={index < clientLogos.length ? "Empresa cliente SigmaCX" : ""} aria-hidden={index >= clientLogos.length} />
            ))}
          </div>
          <div className="testimonials">
            <article className="quote-card" data-reveal>
              <img src="/media/tecban.webp" alt="Tecban" />
              <blockquote>
                “O Speech Analytics revolucionou o dia a dia da Tecban, tornando-se uma ferramenta indispensável.”
              </blockquote>
              <p>Equipe de Atendimento ao Cliente</p>
            </article>
            <article className="quote-card quote-card--dark" data-reveal>
              <img src="/media/fractalia.png" alt="Grupo Fractalia" />
              <blockquote>
                “A migração foi executada com perfeição. Os resultados demonstram uma melhora substancial na eficiência operacional.”
              </blockquote>
              <p>Equipe de Operações</p>
            </article>
          </div>
        </section>

        <section className="connection section-dark" aria-labelledby="connection-title">
          <div className="connection-media" data-reveal>
            <video src="/media/woman.mp4" autoPlay muted loop playsInline preload="metadata" aria-label="Pessoa em uma experiência de atendimento conectada" />
            <div className="video-data"><span>CONNECTION / 01</span><span>LIVE SIGNAL</span></div>
          </div>
          <div className="connection-copy" data-reveal>
            <span className="section-index">03 / Experiência</span>
            <h2 id="connection-title">Transforme atendimentos em conexões reais.</h2>
            <p>Atendimentos deixam de ser transações e passam a criar vínculos entre marcas e clientes.</p>
            <a className="pill pill--outline" href="#platform">Conheça a plataforma <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <section id="platform" className="platform section-dark" aria-labelledby="platform-title">
          <div className="section-heading section-heading--dark" data-reveal>
            <span className="section-index">04 / Sigma Suite</span>
            <h2 id="platform-title">Uma inteligência.<br />Três forças conectadas.</h2>
          </div>
          <div className="suite-grid">
            <article className="suite-card suite-card--brain" data-reveal>
              <video src="/media/brain.mp4" autoPlay muted loop playsInline preload="metadata" aria-label="Holograma de cérebro representando a inteligência Sigma Brain" />
              <div className="suite-overlay" />
              <div className="suite-card-content">
                <span className="suite-code">01 — GENERATIVE CORE</span>
                <h3>Sigma Brain</h3>
                <p>Agentes de IA autônomos que compreendem intenções e conduzem conversas fluidas, em voz e texto.</p>
                <a href="https://sigmacx.ai/sigma-brain" target="_blank" rel="noreferrer">Explorar produto ↗</a>
              </div>
            </article>
            <article className="suite-card suite-card--channel" data-reveal>
              <div className="channel-visual" aria-hidden="true">
                <span className="channel-node channel-node--one">WA</span>
                <span className="channel-node channel-node--two">VOZ</span>
                <span className="channel-node channel-node--three">CHAT</span>
                <span className="channel-core"><img src="/media/sigma-mark.png" alt="" /></span>
              </div>
              <div className="suite-card-content">
                <span className="suite-code">02 — OMNICHANNEL FLOW</span>
                <h3>Sigma Channel</h3>
                <p>Todos os pontos de contato reunidos numa jornada contínua, segura e inteligente.</p>
              </div>
            </article>
            <article className="suite-card suite-card--insights" data-reveal>
              <div className="insight-visual" aria-hidden="true">
                {[34, 66, 44, 82, 58, 91, 71, 96].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}
              </div>
              <div className="suite-card-content">
                <span className="suite-code">03 — DECISION LAYER</span>
                <h3>Sigma Insights</h3>
                <p>Interações viram métricas, padrões e próximos passos para a operação.</p>
              </div>
            </article>
          </div>
        </section>

        <section id="security" className="security section-dark" aria-labelledby="security-title">
          <div className="security-orbit" aria-hidden="true">
            <img src="/media/security-globe.png" alt="" />
          </div>
          <div className="security-copy" data-reveal>
            <span className="section-index">05 / Confiança por design</span>
            <h2 id="security-title">Dados sensíveis.<br /><span>Proteção inegociável.</span></h2>
            <p>Criptografia, protocolos globais e monitoramento contínuo do primeiro “olá” ao fim do atendimento.</p>
            <div className="cert-row">
              <span>LGPD</span><span>GDPR</span><span>PCI</span><span>ISO 27001</span>
            </div>
          </div>
        </section>

        <section className="final-cta section-dark" aria-labelledby="final-title">
          <p className="eyebrow" data-reveal>O próximo sinal é seu.</p>
          <h2 id="final-title" data-reveal>Veja o que o SigmaCX<br />pode revelar.</h2>
          <a className="pill pill--primary pill--large" href={DEMO_URL} target="_blank" rel="noreferrer" data-reveal>
            Converse com um especialista <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <img src="/media/logo-white.png" alt="SigmaCX" />
          <p>O hub que unifica canais, automatiza interações e gera insights estratégicos.</p>
        </div>
        <div className="footer-links">
          <div><span>Conheça mais</span><a href="#platform">Sigma Suite</a><a href="#experience">Experiência</a><a href="#proof">Cases</a></div>
          <div><span>Contato</span><a href={DEMO_URL} target="_blank" rel="noreferrer">Agende uma demo</a><a href="mailto:canais@nuveto.com.br">Seja parceiro</a></div>
        </div>
        <div className="footer-bottom"><span>São Paulo, Brasil</span><span>© 2026 SigmaCX</span></div>
      </footer>
    </div>
  );
}
