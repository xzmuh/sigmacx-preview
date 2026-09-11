import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { intelligenceNodes } from "./IntelligenceNodes";
import logoSamples from "./sigmaLogoPoints.json";

const LOGO_HOLD_END = 1.7;
const OPENING_END = 3.5;

type ExperienceProps = {
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
  nodeAnchors: MutableRefObject<(HTMLDivElement | null)[]>;
};

export default function IntelligenceCore({ progress, reducedMotion, nodeAnchors }: ExperienceProps) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const motionTime = useRef(0);
  const openingTime = useRef(0);
  const projection = useMemo(() => new THREE.Vector3(), []);
  const nodePositions = useMemo(() => intelligenceNodes.map((node) => new THREE.Vector3(...node.position)), []);
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

    const logoPositions = new Float32Array(totalCount * 3);
    for (let index = 0; index < totalCount; index++) {
      const sample = logoSamples[index];
      logoPositions.set([sample[0], sample[1], 0], index * 3);
    }
    return {
      positions,
      colors,
      sizes,
      phases,
      basePositions: positions.slice(),
      spherePositions: positions.slice(),
      logoPositions,
    };
  }, [surfaceCount, totalCount, trailCount]);
  const velocities = useMemo(() => new Float32Array(totalCount * 3), [totalCount]);
  const dotUniforms = useMemo(() => ({
    uOpacity: { value: 1 },
    uTime: { value: 0 },
  }), []);

  useLayoutEffect(() => {
    openingTime.current = 0;
    motionTime.current = 0;
    velocities.fill(0);
    cloud.positions.set(cloud.basePositions);
    cloud.spherePositions.set(cloud.basePositions);
    if (points.current) {
      points.current.rotation.set(0, 0, 0);
      points.current.geometry.getAttribute("position").needsUpdate = true;
    }
  }, [cloud, velocities, reducedMotion]);

  useFrame((state, delta) => {
    if (!group.current || !points.current) return;
    if (!reducedMotion && document.visibilityState === "visible") openingTime.current += Math.min(delta, .1);
    const opening = reducedMotion ? 8 : openingTime.current;
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
    group.current.updateWorldMatrix(true, false);
    intelligenceNodes.forEach((node, index) => {
      const anchor = nodeAnchors.current[index];
      if (!anchor) return;
      const reveal = THREE.MathUtils.smoothstep(opening, OPENING_END - .8 + index * .08, OPENING_END + index * .08);
      anchor.style.opacity = String(reveal);
      anchor.style.pointerEvents = reveal > .8 ? "auto" : "none";
      anchor.inert = reveal <= .8;
      if (isCompact) return;
      const phase = index * 1.4;
      const driftX = reducedMotion ? 0 : Math.sin(opening * .45 + phase) * .055;
      const driftY = reducedMotion ? 0 : Math.cos(opening * .38 + phase) * .045;
      const driftZ = reducedMotion ? 0 : Math.sin(opening * .3 + phase) * .02;
      const nodePosition = nodePositions[index];
      // Keep the target steady while its details are being read or clicked.
      if (!anchor.classList.contains("is-open")) {
        projection.set(node.position[0] + driftX, node.position[1] + driftY, node.position[2] + driftZ);
        nodePosition.lerp(projection, reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, .1) * 2.5));
      }
      projection.copy(nodePosition);
      group.current!.localToWorld(projection);
      projection.project(state.camera);
      anchor.style.transform = `translate3d(${(projection.x * .5 + .5) * state.size.width}px, ${(-projection.y * .5 + .5) * state.size.height}px, 0)`;
      anchor.style.visibility = "visible";
    });
    if (reducedMotion) return;

    // Simulate the living sphere throughout the intro, even while the S is visible.
    const safeDelta = document.visibilityState === "visible" ? Math.min(delta, 1 / 30) : 0;
    motionTime.current += safeDelta * 0.78;
    const animatedTime = motionTime.current;
    dotUniforms.uTime.value = animatedTime;
    const positionAttribute = points.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const positions = cloud.spherePositions;
    const damping = Math.pow(0.87, safeDelta * 60);
    const spread = THREE.MathUtils.smootherstep(opening, LOGO_HOLD_END, OPENING_END);

    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, THREE.MathUtils.lerp(.05, state.pointer.y * .04, spread), 0.04);
    points.current.rotation.z += safeDelta * 0.032 * spread;
    points.current.rotation.y += safeDelta * 0.016 * spread;
    points.current.rotation.x = (-0.1 + Math.sin(animatedTime * 0.42) * 0.052) * spread;

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

    const renderedPositions = positionAttribute.array as Float32Array;
    if (opening < OPENING_END) {
      for (let index = 0; index < totalCount; index++) {
        const offset = index * 3;
        const assemble = THREE.MathUtils.smootherstep(opening, (index % 11) * .015, .85 + (index % 11) * .015);
        for (let axis = 0; axis < 3; axis++) {
          const logo = THREE.MathUtils.lerp(cloud.basePositions[offset + axis], cloud.logoPositions[offset + axis], assemble);
          const breath = Math.sin(opening * .85 + axis * 1.8) * .006;
          renderedPositions[offset + axis] = THREE.MathUtils.lerp(logo, positions[offset + axis], spread)
            + breath * assemble * (1 - spread)
            + Math.sin(Math.PI * spread) * Math.sin(index * .7 + axis) * .09;
        }
      }
    } else {
      renderedPositions.set(positions);
    }
    positionAttribute.needsUpdate = true;
  });

  return (
    <group ref={group} position={[0, 0.05, 0]}>
      <points ref={points} frustumCulled={false}>
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
