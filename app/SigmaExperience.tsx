"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
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

const clientLogoLoop = [...clientLogos, ...clientLogos];

type ExperienceProps = {
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
};

const CORE_VERTEX_SHADER = `
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = cameraPosition - worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const CORE_FRAGMENT_SHADER = `
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    float facing = max(dot(normalize(vWorldNormal), normalize(vViewDirection)), 0.0);
    float fresnel = pow(1.0 - facing, 2.15);
    float verticalMix = clamp(vWorldNormal.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 color = mix(vec3(0.36, 0.65, 1.0), vec3(0.73, 1.0, 0.61), verticalMix);
    gl_FragColor = vec4(color, fresnel * 0.68);
  }
`;

function SignalField({ progress, reducedMotion }: ExperienceProps) {
  const points = useRef<THREE.Points>(null);
  const count = reducedMotion ? 420 : 1150;
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
        size={0.072}
        map={particleTexture}
        alphaTest={0.015}
        transparent
        opacity={0.76}
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
  const shell = useRef<THREE.Group>(null);
  const nodePositions = useMemo(() => {
    const total = 24;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: total }, (_, index) => {
      const y = 1 - (index / (total - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = goldenAngle * index;
      return [Math.cos(angle) * radius * 1.08, y * 1.08, Math.sin(angle) * radius * 1.08] as const;
    });
  }, []);

  useFrame((state, delta) => {
    if (!group.current || !shell.current) return;
    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      state.size.width < 980 ? 0 : 1.72,
      0.05,
    );
    if (reducedMotion) return;
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, state.pointer.y * 0.08, 0.04);
    shell.current.rotation.y += delta * 0.1;
    shell.current.rotation.x += delta * 0.025;
    shell.current.scale.setScalar(1 + progress.current * 0.04);
  });

  return (
    <Float speed={reducedMotion ? 0 : 1.45} rotationIntensity={0.24} floatIntensity={0.38}>
      <group ref={group} position={[0, 0.05, 0]}>
        <mesh position={[0, 0, -1.12]} scale={2.8}>
          <circleGeometry args={[1, 96]} />
          <meshBasicMaterial
            color="#2f75c8"
            transparent
            opacity={0.055}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <group ref={shell}>
          <mesh>
            <sphereGeometry args={[1, 96, 96]} />
            <meshPhysicalMaterial
              color="#07172d"
              emissive="#12395d"
              emissiveIntensity={0.42}
              roughness={0.16}
              metalness={0.44}
              clearcoat={0.88}
              clearcoatRoughness={0.1}
              transparent
              opacity={0.88}
            />
          </mesh>
          <mesh scale={0.72}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshBasicMaterial
              color="#6caeff"
              transparent
              opacity={0.075}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh scale={1.018}>
            <icosahedronGeometry args={[1, 4]} />
            <meshBasicMaterial
              color="#72b6ff"
              transparent
              opacity={0.56}
              wireframe
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh scale={1.075}>
            <sphereGeometry args={[1, 96, 96]} />
            <shaderMaterial
              vertexShader={CORE_VERTEX_SHADER}
              fragmentShader={CORE_FRAGMENT_SHADER}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {nodePositions.map((position, index) => (
            <mesh key={index} position={position}>
              <sphereGeometry args={[index % 5 === 0 ? 0.035 : 0.022, 12, 12]} />
              <meshBasicMaterial
                color={index % 5 === 0 ? "#b9ff9b" : "#74b8ff"}
                transparent
                opacity={index % 5 === 0 ? 0.92 : 0.62}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
          {[1.18, 1.3].map((radius, index) => (
            <mesh key={radius} rotation={[Math.PI / (2.7 + index), index * 0.9, index * 0.45]}>
              <torusGeometry args={[radius, 0.006, 10, 160]} />
              <meshBasicMaterial
                color={index === 0 ? "#5da6ff" : "#b9ff9b"}
                transparent
                opacity={index === 0 ? 0.3 : 0.2}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
        </group>
        {[1.68, 2.02, 2.38].map((radius, index) => (
          <mesh
            key={radius}
            rotation={[
              Math.PI / (2.4 + index * 0.35),
              index * 0.76,
              index * 0.33,
            ]}
          >
            <torusGeometry args={[radius, 0.012 + index * 0.002, 16, 180]} />
            <meshBasicMaterial
              color={index === 1 ? "#5da6ff" : "#b9ff9b"}
              transparent
              opacity={0.38 - index * 0.065}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
        {[
          [1.36, 0.94, 0.18],
          [-1.58, -0.34, 0.3],
          [0.42, -1.72, 0.1],
        ].map((position, index) => (
          <mesh key={index} position={position as [number, number, number]}>
            <sphereGeometry args={[index === 0 ? 0.055 : 0.038, 14, 14]} />
            <meshBasicMaterial
              color={index === 1 ? "#5da6ff" : "#b9ff9b"}
              transparent
              opacity={0.86}
              depthWrite={false}
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
      camera={{ position: [0, 0, 7], fov: 40 }}
      dpr={[1, 1.45]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
    >
      <ambientLight intensity={0.42} />
      <pointLight position={[3, 3, 4]} intensity={18} color="#b9ff9b" />
      <pointLight position={[-4, -2, 3]} intensity={13} color="#5da6ff" />
      <SignalField {...props} />
      <IntelligenceCore {...props} />
    </Canvas>
  );
}

function Header({
  menuOpen,
  setMenuOpen,
  motionEnabled,
  setMotionEnabled,
  compact,
}: {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  motionEnabled: boolean;
  setMotionEnabled: (enabled: boolean) => void;
  compact: boolean;
}) {
  return (
    <header className={compact ? "site-header site-header--compact" : "site-header"}>
      <a className="brand" href="#top" aria-label="SigmaCX — início">
        <img src="/media/logo-white.png" alt="SigmaCX" />
      </a>
      <nav className={menuOpen ? "nav nav--open" : "nav"} aria-label="Navegação principal">
        <a data-index="01" href="#experience" onClick={() => setMenuOpen(false)}>Experiência</a>
        <a data-index="02" href="#platform" onClick={() => setMenuOpen(false)}>Sigma Suite</a>
        <a data-index="03" href="#proof" onClick={() => setMenuOpen(false)}>Resultados</a>
        <a data-index="04" href="#security" onClick={() => setMenuOpen(false)}>Segurança</a>
      </nav>
      <div className="header-actions">
        <button
          className="motion-toggle"
          type="button"
          onClick={() => setMotionEnabled(!motionEnabled)}
          aria-pressed={motionEnabled}
          aria-label={motionEnabled ? "Pausar animações" : "Ativar animações"}
        >
          <i /> MOTION {motionEnabled ? "ON" : "OFF"}
        </button>
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
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [headerCompact, setHeaderCompact] = useState(false);
  const reducedMotion = !motionEnabled;

  useEffect(() => {
    const saved = window.localStorage.getItem("sigmacx-motion");
    if (saved === "off") setMotionEnabled(false);
    window.matchMedia("(prefers-reduced-motion: reduce)");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sigmacx-motion", motionEnabled ? "on" : "off");
  }, [motionEnabled]);

  useEffect(() => {
    let frame = 0;
    const updateHeader = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setHeaderCompact(window.scrollY > 72));
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateHeader);
    };
  }, []);

  useLayoutEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);

    let cleanupMotion = () => {};
    const context = gsap.context(() => {
      if (!reducedMotion) {
        const lenis = new Lenis({
          duration: 1.35,
          easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
          smoothWheel: true,
          wheelMultiplier: 0.82,
          touchMultiplier: 1.1,
          syncTouch: false,
          anchors: { offset: -88, duration: 1.25 },
        });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .to(".intro-curtain", { scaleY: 0, duration: 1.05, ease: "power4.inOut", transformOrigin: "top" })
          .from(".site-header", { y: -24, opacity: 0, duration: 0.9 }, "-=0.45")
          .from(".hero-kicker", { y: 26, opacity: 0, duration: 0.75 }, "-=0.45")
          .from(".hero-title .line", {
            yPercent: 108,
            duration: 1.05,
            stagger: 0.11,
            onComplete: () => gsap.set(".hero-title .line-wrap", { overflow: "visible" }),
          }, "-=0.45")
          .from(".hero-copy, .hero-actions, .hero-meta", { y: 24, opacity: 0, duration: 0.75, stagger: 0.09 }, "-=0.65");

        gsap.to(".hero-stage", {
          yPercent: 24,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.7 },
        });

        gsap.to(".client-rail__track", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });

        gsap.to(".insight-visual span", {
          scaleY: 0.28,
          transformOrigin: "bottom",
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

        cleanupMotion = () => {
          window.removeEventListener("pointermove", move);
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      }
    }, root);

    return () => {
      cleanupMotion();
      context.revert();
    };
  }, [reducedMotion]);

  return (
    <div ref={root} id="top" className={motionEnabled ? "site-shell motion-on" : "site-shell motion-off"}>
      <a className="skip-link" href="#main">Pular para o conteúdo</a>
      <div className="intro-curtain" aria-hidden="true"><span>SIGMA / SIGNAL ONLINE</span></div>
      <div className="cursor-glow" aria-hidden="true" />
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        motionEnabled={motionEnabled}
        setMotionEnabled={setMotionEnabled}
        compact={headerCompact}
      />

      <div className="experience-layer" aria-hidden="true">
        <div className="experience-fallback" />
        <div className="tech-hud">
          <div className="tech-hud__grid" />
          <div className="tech-hud__orb" />
          <div className="tech-hud__scan" />
        </div>
        <ExperienceCanvas progress={progress} reducedMotion={reducedMotion} />
        <div className="experience-vignette" />
      </div>

      <main id="main">
        <section className="hero section-dark" aria-labelledby="hero-title">
          <div className="hero-stage">
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
          </div>
          <div className="hero-meta" aria-label="Capacidades da plataforma">
            <span>Voz</span><span>Texto</span><span>Dados</span><span>IA</span>
          </div>
          <div className="scroll-cue" aria-hidden="true"><span /> Role para conectar os sinais</div>
        </section>

        <section className="manifesto section-dark" aria-labelledby="manifesto-title">
          <div className="manifesto-signal" aria-hidden="true">
            <span>CH</span><span>WA</span><span>VOZ</span><span>IA</span>
          </div>
          <div className="manifesto-copy" data-reveal>
            <span className="section-index">01 / Por que existimos</span>
            <p>Em um mundo com tantos canais, mensagens e demandas, o atendimento virou uma tarefa trabalhosa. A relação entre marcas e clientes se tornou automática demais.</p>
            <h2 id="manifesto-title">O SigmaCX nasceu<br /><strong>para mudar isso.</strong></h2>
          </div>
        </section>

        <section id="experience" ref={story} className="signal-story section-dark" aria-labelledby="story-title">
          <div className="story-intro" data-reveal>
            <span className="section-index">02 / A inteligência</span>
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

        <div className="section-transition section-transition--dark-light" aria-hidden="true">
          <span /><span /><span />
        </div>

        <section id="proof" className="proof section-light" aria-labelledby="proof-title">
          <div className="section-heading" data-reveal>
            <span className="section-index">03 / Confiança</span>
            <h2 id="proof-title">Empresas que confiam<br /><strong>na tecnologia.</strong></h2>
            <p>Marcas que confiam na tecnologia para transformar o relacionamento com seus clientes e, assim como nós, acreditam na excelência da experiência e no poder do atendimento inteligente.</p>
          </div>
          <div className="client-rail" data-reveal aria-label="Empresas clientes">
            <div className="client-rail__track">
              {[0, 1].map((group) => (
                <div className="client-rail__group" key={group} aria-hidden={group === 1}>
                  {clientLogoLoop.map((logo, index) => (
                    <img
                      key={`${group}-${logo}-${index}`}
                      src={logo}
                      alt={group === 0 && index < clientLogos.length ? "Empresa cliente SigmaCX" : ""}
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

        <div className="section-transition section-transition--light-dark" aria-hidden="true">
          <span /><span /><span />
        </div>

        <section className="solution-compare section-dark" aria-labelledby="solutions-title">
          <div className="solution-compare__heading" data-reveal>
            <span className="section-index">04 / Soluções conectadas</span>
            <h2 id="solutions-title">Duas plataformas.<br /><strong>Uma experiência contínua.</strong></h2>
          </div>
          <div className="solution-compare__grid">
            <article className="solution-card" data-reveal>
              <span className="solution-card__code">SIGMA / CX OPERATING SYSTEM</span>
              <h3>Inteligência para decisões de CX</h3>
              <p>O Sigma é uma plataforma completa para gestão da experiência do cliente, que integra canais, automatiza interações e gera insights em tempo real.</p>
              <p><strong>Cada módulo do Sigma trabalha de forma integrada para proporcionar uma jornada contínua, inteligente e centrada no cliente.</strong></p>
              <div className="solution-card__brand solution-card__brand--sigma">
                <img src="/media/sigma-mark.png" alt="" /><span>Sigma</span>
              </div>
              <a className="solution-card__link" href="#platform">Conheça o Sigma <span aria-hidden="true">→</span></a>
            </article>

            <article className="solution-card solution-card--dialogi" data-reveal>
              <span className="solution-card__code">DIALOGI / HUMAN CONVERSATIONS</span>
              <h3>Conexão entre marcas e pessoas</h3>
              <p>O Dialogi é uma plataforma de inteligência artificial voltada para criar conversas digitais mais humanas, fluidas e eficientes.</p>
              <p><strong>Integrando WhatsApp, chat, redes sociais e voz, o Dialogi conecta marcas e clientes com velocidade, empatia e automação inteligente.</strong></p>
              <div className="solution-card__brand">
                <img src="/media/dialogi.png" alt="Dialogi AI" />
              </div>
              <a className="solution-card__link" href="https://dialogiai.com/pt/home-4/" target="_blank" rel="noreferrer">Conheça o Dialogi AI <span aria-hidden="true">↗</span></a>
            </article>
          </div>
        </section>

        <section className="connection section-dark" aria-labelledby="connection-title">
          <div className="connection-media" data-reveal>
            <video src="/media/woman.mp4" autoPlay muted loop playsInline preload="metadata" aria-label="Pessoa em uma experiência de atendimento conectada" />
            <div className="video-data"><span>CONNECTION / 01</span><span>LIVE SIGNAL</span></div>
          </div>
          <div className="connection-copy" data-reveal>
            <img className="dialogi-logo" src="/media/dialogi.png" alt="Dialogi" />
            <span className="section-index">05 / Conexão entre marcas e pessoas</span>
            <h2 id="connection-title">Conversas digitais mais humanas.</h2>
            <p>O Dialogi é uma plataforma de inteligência artificial voltada para criar conversas digitais mais humanas, fluidas e eficientes.</p>
            <p><strong>Integrando WhatsApp, chat, redes sociais e voz, o Dialogi conecta marcas e clientes com velocidade, empatia e automação inteligente.</strong></p>
            <a className="pill pill--outline" href="#platform">Conheça a plataforma <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <section id="platform" className="platform section-dark" aria-labelledby="platform-title">
          <div className="section-heading section-heading--dark" data-reveal>
            <span className="section-index">06 / Sigma Suite</span>
            <h2 id="platform-title">Inteligência para<br />decisões de CX.</h2>
            <p>O Sigma é uma plataforma completa para gestão da experiência do cliente: integra canais, automatiza interações e gera insights em tempo real.</p>
            <p><strong>Cada módulo trabalha de forma integrada para proporcionar uma jornada contínua, inteligente e orientada a resultados.</strong></p>
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
          <aside className="trust-metric" data-reveal>
            <span>81%</span>
            <p>dos clientes dizem que a <strong>confiança em uma marca</strong> é um fator decisivo para a compra.</p>
            <small>TRUST / CUSTOMER EXPERIENCE</small>
          </aside>
        </section>

        <div className="section-transition section-transition--navy-deep" aria-hidden="true">
          <span /><span /><span />
        </div>

        <section id="security" className="security section-dark" aria-labelledby="security-title">
          <div className="security-orbit" aria-hidden="true">
            <div className="security-core">
              <span className="security-core__code">PRIVACY CORE</span>
              <span className="security-core__lock"><i /></span>
              <strong>LGPD</strong>
              <small>DATA / SECURE</small>
            </div>
          </div>
          <div className="security-copy" data-reveal>
            <span className="section-index">07 / Confiança por design</span>
            <h2 id="security-title">Dados sensíveis.<br /><span>Proteção inegociável.</span></h2>
            <p>Criptografia, protocolos globais e monitoramento contínuo do primeiro “olá” ao fim do atendimento.</p>
            <div className="cert-row">
              <span>LGPD</span><span>GDPR</span><span>PCI</span><span>ISO 27001</span>
            </div>
          </div>
        </section>

        <section className="final-cta section-dark" aria-labelledby="final-title">
          <p className="eyebrow" data-reveal>Vamos conversar?</p>
          <h2 id="final-title" data-reveal>Veja o que a SigmaCX<br />pode fazer por você.</h2>
          <a className="pill pill--primary pill--large" href={DEMO_URL} target="_blank" rel="noreferrer" data-reveal>
            Agende uma demonstração <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>

      <div className="footer-bridge" aria-hidden="true" />
      <footer className="footer">
        <div className="footer-atmosphere" aria-hidden="true">
          <span className="footer-orbit footer-orbit--outer" />
          <span className="footer-orbit footer-orbit--inner" />
          <span className="footer-scan" />
        </div>

        <div className="footer-top">
          <div className="footer-manifesto">
            <div className="footer-identity">
              <img src="/media/logo-white.png" alt="SigmaCX" />
              <span><i /> SISTEMA ONLINE</span>
            </div>
            <h2>Tecnologia para entender.<br /><em>Inteligência para transformar.</em></h2>
            <p>O hub que conecta canais, interpreta cada conversa e transforma sinais em decisões para negócios que não param de evoluir.</p>
            <a className="footer-contact" href="mailto:canais@nuveto.com.br">
              <span className="footer-contact__icon" aria-hidden="true">@</span>
              <span><small>CANAL DIRETO</small><strong>canais@nuveto.com.br</strong></span>
              <b aria-hidden="true">↗</b>
            </a>
          </div>

          <nav className="footer-links" aria-label="Navegação do rodapé">
            <div>
              <span>PLATAFORMA</span>
              <a href="#platform">Sigma Suite</a>
              <a href="#experience">Experiência</a>
              <a href="#proof">Resultados</a>
              <a href="#security">Segurança</a>
            </div>
            <div>
              <span>CONEXÕES</span>
              <a href={DEMO_URL} target="_blank" rel="noreferrer">Agende uma demo</a>
              <a href="mailto:canais@nuveto.com.br">Seja parceiro</a>
              <a href="https://sigmacx.ai/" target="_blank" rel="noreferrer">Site institucional ↗</a>
            </div>
          </nav>

          <a className="footer-launch" href={DEMO_URL} target="_blank" rel="noreferrer">
            <span className="footer-launch__label">INICIAR CONEXÃO</span>
            <strong>Leve inteligência<br />para cada<br />conversa.</strong>
            <span className="footer-launch__copy">Uma demonstração rápida, guiada pela realidade da sua operação.</span>
            <span className="footer-launch__button">Agendar demonstração <b>↗</b></span>
          </a>
        </div>

        <div className="footer-wordmark" aria-hidden="true">
          <span>SigmaCX</span>
          <small>CONVERSATION INTELLIGENCE / 2026</small>
        </div>

        <div className="footer-bottom">
          <span>São Paulo / Brasil <i>UTC −03:00</i></span>
          <span>© 2026 SigmaCX. Todos os direitos reservados.</span>
          <span>Humano no propósito. <b>Tech por natureza.</b></span>
        </div>
      </footer>
    </div>
  );
}
