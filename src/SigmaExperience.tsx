import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";
import { useLazyVideo } from "./site/useLazyVideo";
import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SiteHeader } from "./site/SiteHeader";
import GradientText from "./components/GradientText";

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

function IntelligenceCore({ progress, reducedMotion }: ExperienceProps) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const motionTime = useRef(0);
  // Esfera ja nasce na posicao/escala finais: sem deslocamento ate o centro ao abrir.
  const settled = useRef(false);
  const surfaceCount = reducedMotion ? 760 : 1120;
  const trailCount = reducedMotion ? 48 : 84;
  const totalCount = surfaceCount + trailCount;
  const cloud = useMemo(() => {
    const positions = new Float32Array(totalCount * 3);
    const colors = new Float32Array(totalCount * 3);
    const sizes = new Float32Array(totalCount);
    const phases = new Float32Array(totalCount);
    const palette = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#dff4ff"),
      new THREE.Color("#b9ff9b"),
      new THREE.Color("#8fcaff"),
      new THREE.Color("#eef9ff"),
      new THREE.Color("#7ebe70"),
    ];
    const signalGreen = new THREE.Color("#b9ff9b");
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < surfaceCount; index += 1) {
      const pointProgress = index / Math.max(surfaceCount - 1, 1);
      const y = 1 - pointProgress * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const angle = goldenAngle * index;
      const offset = index * 3;
      positions[offset] = Math.cos(angle) * radius * 1.1;
      positions[offset + 1] = y * 1.1;
      positions[offset + 2] = Math.sin(angle) * radius * 1.1;

      const color = index % 61 === 0 ? signalGreen : palette[index % palette.length];
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
      sizes[index] = index % 61 === 0 ? 3.05 : index % 19 === 0 ? 2.08 : index % 7 === 0 ? 1.34 : 0.82;
      phases[index] = (index * 0.754877666) % (Math.PI * 2);
    }

    const trailSegments = trailCount / 3;
    for (let localIndex = 0; localIndex < trailCount; localIndex += 1) {
      const index = surfaceCount + localIndex;
      const trail = localIndex % 3;
      const step = Math.floor(localIndex / 3);
      const trailProgress = step / Math.max(trailSegments - 1, 1);
      const angle = -1.12 + trailProgress * 2.24 + trail * 1.18;
      const radius = 1.42 + trail * 0.24 + Math.sin(trailProgress * Math.PI) * 0.12;
      const offset = index * 3;
      positions[offset] = Math.cos(angle) * radius;
      positions[offset + 1] = (trailProgress - 0.5) * (0.9 - trail * 0.1) + Math.sin(angle * 1.7 + trail) * 0.16;
      positions[offset + 2] = Math.sin(angle) * radius * 0.62 - 0.18 + trail * 0.08;

      const color = localIndex % 11 === 0
        ? signalGreen
        : palette[(localIndex + trail * 2) % palette.length];
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
      sizes[index] = localIndex % 11 === 0 ? 2.4 : localIndex % 5 === 0 ? 1.36 : 0.72;
      phases[index] = (localIndex * 1.173 + trail * 0.8) % (Math.PI * 2);
    }

    return {
      positions,
      colors,
      sizes,
      phases,
      basePositions: positions.slice(),
    };
  }, [surfaceCount, totalCount, trailCount]);
  const velocities = useMemo(() => new Float32Array(totalCount * 3), [totalCount]);
  const dotUniforms = useMemo(() => ({
    uOpacity: { value: 1 },
    uTime: { value: 0 },
  }), []);

  useFrame((state, delta) => {
    if (!group.current || !points.current) return;
    const isCompact = state.size.width < 980;
    const visualWidth = isCompact
      ? Math.min(state.size.width * (state.size.width < 720 ? 1.18 : 0.72), 640)
      : Math.min(state.size.width * 0.5, 780);
    const visualCenterOffset = isCompact
      ? 0
      : state.size.width * 0.42 - visualWidth * 0.5;
    const cameraSpan = 2 * Math.tan(THREE.MathUtils.degToRad(20)) * 7;
    const targetX = visualCenterOffset * cameraSpan / state.size.height;
    const targetScale = THREE.MathUtils.clamp(
      visualWidth * 0.64 * cameraSpan / (2 * state.size.height),
      state.size.width < 720 ? 0.78 : 0.94,
      1.24,
    );
    if (!settled.current) {
      group.current.position.x = targetX;
      group.current.scale.setScalar(targetScale);
      settled.current = true;
    }
    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      targetX,
      0.05,
    );
    group.current.scale.setScalar(
      THREE.MathUtils.lerp(group.current.scale.x, targetScale - progress.current * 0.045, 0.05),
    );
    const visualIntensity = 1 - 0.86 * Math.sqrt(progress.current);
    dotUniforms.uOpacity.value = visualIntensity;
    if (reducedMotion) return;

    const safeDelta = Math.min(delta, 1 / 30);
    motionTime.current += safeDelta * 0.78;
    const animatedTime = motionTime.current;
    dotUniforms.uTime.value = animatedTime;
    const positionAttribute = points.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const positions = positionAttribute.array as Float32Array;
    const damping = Math.pow(0.87, safeDelta * 60);

    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, state.pointer.y * 0.04, 0.04);
    points.current.rotation.z += safeDelta * 0.032;
    points.current.rotation.y += safeDelta * 0.016;
    points.current.rotation.x = -0.1 + Math.sin(animatedTime * 0.42) * 0.052;

    for (let index = 0; index < surfaceCount; index += 1) {
      const offset = index * 3;
      const baseX = cloud.basePositions[offset];
      const baseY = cloud.basePositions[offset + 1];
      const baseZ = cloud.basePositions[offset + 2];
      const currentX = positions[offset];
      const currentY = positions[offset + 1];
      const currentZ = positions[offset + 2];
      const phase = cloud.phases[index];
      const longitude = Math.atan2(baseZ, baseX);
      const latitude = Math.asin(THREE.MathUtils.clamp(baseY / 1.1, -1, 1));

      const travelingWave = Math.sin(animatedTime * 2.15 - latitude * 9.5 + longitude * 2.4);
      const crossWave = Math.sin(animatedTime * 1.45 + longitude * 6.2 + phase);
      const fineRipple = Math.sin(animatedTime * 3.8 + latitude * 15 - phase * 0.6);
      const gelatin = Math.sin(animatedTime * 1.18 + phase + baseY * 3.2) * 0.024;
      const radialScale = 1 + travelingWave * 0.034 + crossWave * 0.022 + fineRipple * 0.008 + gelatin;
      const shearX = Math.sin(animatedTime * 0.82 + baseY * 4.8) * 0.025;
      const shearY = Math.cos(animatedTime * 0.7 + baseX * 4.1) * 0.02;
      const targetX = baseX * radialScale + shearX * baseZ;
      const targetY = baseY * (radialScale + gelatin * 0.45) + shearY * baseX;
      const targetZ = baseZ * radialScale - shearX * baseX;

      velocities[offset] += (targetX - currentX) * 11.5 * safeDelta;
      velocities[offset + 1] += (targetY - currentY) * 11.5 * safeDelta;
      velocities[offset + 2] += (targetZ - currentZ) * 11.5 * safeDelta;
      velocities[offset] *= damping;
      velocities[offset + 1] *= damping;
      velocities[offset + 2] *= damping;
      positions[offset] = currentX + velocities[offset];
      positions[offset + 1] = currentY + velocities[offset + 1];
      positions[offset + 2] = currentZ + velocities[offset + 2];
    }

    for (let index = surfaceCount; index < totalCount; index += 1) {
      const offset = index * 3;
      const phase = cloud.phases[index];
      const currentX = positions[offset];
      const currentY = positions[offset + 1];
      const currentZ = positions[offset + 2];
      const targetX = cloud.basePositions[offset] + Math.sin(animatedTime * 0.58 + phase) * 0.045;
      const targetY = cloud.basePositions[offset + 1] + Math.cos(animatedTime * 0.46 + phase) * 0.035;
      const targetZ = cloud.basePositions[offset + 2] + Math.sin(animatedTime * 0.52 + phase * 0.7) * 0.04;

      velocities[offset] += (targetX - currentX) * 8.5 * safeDelta;
      velocities[offset + 1] += (targetY - currentY) * 8.5 * safeDelta;
      velocities[offset + 2] += (targetZ - currentZ) * 8.5 * safeDelta;
      velocities[offset] *= damping;
      velocities[offset + 1] *= damping;
      velocities[offset + 2] *= damping;
      positions[offset] = currentX + velocities[offset];
      positions[offset + 1] = currentY + velocities[offset + 1];
      positions[offset + 2] = currentZ + velocities[offset + 2];
    }

    positionAttribute.needsUpdate = true;
  });

  return (
    <group ref={group} position={[0, 0.05, 0]}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cloud.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[cloud.colors, 3]} />
          <bufferAttribute attach="attributes-pointSize" args={[cloud.sizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexColors
          blending={THREE.NormalBlending}
          uniforms={dotUniforms}
          vertexShader={`
            attribute float pointSize;
            uniform float uTime;
            varying vec3 vColor;
            varying float vOpacity;
            varying float vSignal;
            void main() {
              vColor = color;
              vOpacity = mix(0.44, 0.98, clamp(pointSize / 3.05, 0.0, 1.0));
              float sweepPosition = sin(uTime * 0.72) * 0.94;
              vSignal = 1.0 - smoothstep(0.045, 0.19, abs(position.y - sweepPosition));
              vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
              gl_Position = projectionMatrix * viewPosition;
              gl_PointSize = pointSize * (5.05 + vSignal * 1.25) * (7.0 / max(1.0, -viewPosition.z));
            }
          `}
          fragmentShader={`
            uniform float uOpacity;
            varying vec3 vColor;
            varying float vOpacity;
            varying float vSignal;
            void main() {
              float distanceToCenter = length(gl_PointCoord - vec2(0.5));
              float core = 1.0 - smoothstep(0.16, 0.34, distanceToCenter);
              float halo = (1.0 - smoothstep(0.24, 0.5, distanceToCenter)) * 0.24;
              float alpha = min(1.0, core + halo);
              if (alpha < 0.02) discard;
              vec3 signalColor = vec3(0.73, 1.0, 0.61);
              vec3 outputColor = mix(vColor, signalColor, vSignal * 0.52);
              gl_FragColor = vec4(outputColor, alpha * vOpacity * uOpacity * (1.0 + vSignal * 0.16));
            }
          `}
        />
      </points>
    </group>
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
function LazyVideo({ src, label }: { src: string; label: string }) {
  const ref = useLazyVideo(src);
  return <video ref={ref} autoPlay muted loop playsInline preload="none" aria-label={label} />;
}

export function SigmaExperience() {
  const root = useRef<HTMLDivElement>(null);
  const story = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [introMinElapsed, setIntroMinElapsed] = useState(false);
  const motionEnabled = true;
  const reducedMotion = !motionEnabled;
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
        cleanupMotion = () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      } else {
        gsap.set(".intro-curtain", { display: "none" });
      }
    }, root);

    return () => {
      cleanupMotion();
      context.revert();
    };
  }, [reducedMotion, visualReady]);

  return (
    <div ref={root} id="top" className={motionEnabled ? "site-shell motion-on" : "site-shell motion-off"}>
      <a className="skip-link" href="#main">Pular para o conteúdo</a>
      <SiteHeader />

      <div className="experience-layer" aria-hidden="true">
        <div className="experience-fallback" />
        <div className="tech-hud">
          <div className="tech-hud__grid" />
          <div className="tech-hud__aura" />
          <div className="tech-hud__frame">
            <span className="tech-hud__rail"><i /><i /><i /><i /><i /><i /></span>
          </div>
        </div>
        <ExperienceCanvas
          progress={progress}
          reducedMotion={reducedMotion}
          onReady={() => setSceneReady(true)}
        />
        <div className="experience-vignette" />
      </div>

      <main id="main">
        <section className="hero section-dark" aria-labelledby="hero-title">
          <div className="hero-stage">
          <div className="hero-kicker">
            CX inteligente começa com a tecnologia certa
          </div>
          <h1 id="hero-title" className="hero-title">
            <span className="line-wrap"><span className="line">It’s for</span></span>
            <span className="line-wrap"><span className="line line--accent"><GradientText className="home-gradient-text" colors={HOME_GRADIENT} animationSpeed={6}>you.</GradientText></span></span>
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
        </section>

        <section className="manifesto section-dark" aria-labelledby="manifesto-title">
          <div className="manifesto-signal" aria-hidden="true">
            <span>CH</span><span>WA</span><span>VOZ</span><span>IA</span>
          </div>
          <div className="manifesto-copy" data-reveal>
            <span className="section-index">01 / Por que existimos</span>
            <p>Em um mundo com tantos canais, mensagens e demandas, o atendimento virou uma tarefa trabalhosa. A relação entre marcas e clientes se tornou automática demais.</p>
            <h2 id="manifesto-title">O SigmaCX nasceu<br /><strong><GradientText className="home-gradient-text" colors={HOME_GRADIENT} animationSpeed={7}>para mudar isso.</GradientText></strong></h2>
          </div>
        </section>

        <section id="experience" ref={story} className="signal-story section-dark" aria-labelledby="story-title">
          <div className="story-intro" data-reveal>
            <span className="section-index">02 / A inteligência</span>
            <h2 id="story-title">Toda conversa<br />tem algo a dizer.</h2>
            <p>O SigmaCX transforma milhares de interações em uma visão viva da sua operação.</p>
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

        <div className="solution-flow">
        <section className="solution-compare section-dark" aria-labelledby="solutions-title">
          <div className="solution-compare__heading" data-reveal>
            <span className="section-index">04 / Soluções conectadas</span>
            <h2 id="solutions-title">Duas plataformas.<br /><strong><GradientText className="home-gradient-text" colors={HOME_GRADIENT} animationSpeed={7}>Uma experiência contínua.</GradientText></strong></h2>
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
            <LazyVideo src="/media/woman.mp4" label="Pessoa em uma experiência de atendimento conectada" />
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
        </div>

        <section id="platform" className="platform section-dark" aria-labelledby="platform-title">
          <div className="section-heading section-heading--dark" data-reveal>
            <span className="section-index">06 / Sigma Suite</span>
            <h2 id="platform-title">Inteligência para<br /><GradientText className="home-gradient-text" colors={HOME_GRADIENT} animationSpeed={7}>decisões de CX.</GradientText></h2>
            <p>O Sigma é uma plataforma completa para gestão da experiência do cliente: integra canais, automatiza interações e gera insights em tempo real.</p>
            <p><strong>Cada módulo trabalha de forma integrada para proporcionar uma jornada contínua, inteligente e orientada a resultados.</strong></p>
          </div>
          <div className="suite-grid">
            <article className="suite-card suite-card--brain" data-reveal>
              <LazyVideo src="/media/brain.mp4" label="Holograma de cérebro representando a inteligência Sigma Brain" />
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

        <div className="section-transition section-transition--dark-light" aria-hidden="true">
          <span /><span /><span />
        </div>

        <section id="trust" className="trust-interlude section-light" aria-label="Confiança do consumidor">
          <aside className="trust-metric" data-reveal>
            <span>81%</span>
            <p>dos clientes dizem que a <strong>confiança em uma marca</strong> é um fator decisivo para a compra.</p>
            <small>TRUST / CUSTOMER EXPERIENCE</small>
          </aside>
        </section>

        <div className="section-transition section-transition--light-dark" aria-hidden="true">
          <span /><span /><span />
        </div>

        <div className="security-final-flow">
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
            <h2 id="security-title">Dados sensíveis.<br /><span><GradientText className="home-gradient-text" colors={HOME_GRADIENT} animationSpeed={7}>Proteção inegociável.</GradientText></span></h2>
            <p>Cada conversa, troca de informação e registro do cliente carrega dados sensíveis que precisam ser tratados com proteção.</p>
            <p>O SigmaCX foi projetado com protocolos de segurança, criptografia de ponta a ponta e conformidade com normas globais. Do momento em que um cliente envia uma mensagem até a finalização do atendimento, tudo permanece protegido e monitorado.</p>
            <div className="security-flow" aria-label="Fluxo contínuo de proteção de dados">
              <span><small>01</small>Conversa</span>
              <i aria-hidden="true" />
              <span><small>02</small>Criptografia</span>
              <i aria-hidden="true" />
              <span><small>03</small>Monitoramento</span>
            </div>
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
        </div>
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
