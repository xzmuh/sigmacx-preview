import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import IntelligenceCore from "./IntelligenceCore";

/*
 * Cena 3D da home (particulas + nucleo do logo). Fica num chunk proprio,
 * carregado depois que a home aparece (SigmaExperience): o three e o r3f
 * custavam ~1,5 s de processamento no celular antes de qualquer texto.
 * A cena e a mesma de antes, so mudou de arquivo.
 */
export type ExperienceProps = {
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

export default function ExperienceCanvas(props: ExperienceProps & { onReady: () => void }) {
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
