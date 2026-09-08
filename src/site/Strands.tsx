import { useEffect, useRef } from "react";
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";

/**
 * Campo de fios de luz do hero do Dialogi (React Bits, `ogl`), portado de
 * dialogi.ia/src/components/Strands.jsx.
 *
 * O shader e o mesmo, uniforme por uniforme. O que ficou de fora e o caminho
 * `glass` (a esfera de vidro com refracao e dispersao): a home nao o liga, e
 * ele carregava um segundo programa mais um RenderTarget por quadro.
 *
 * Custo controlado dentro do componente, como no original: DPR interno de
 * 0,55, teto de 20fps, pausa quando a aba esta oculta e quando o campo sai da
 * tela (IntersectionObserver). Quem decide se ele existe e o hero, que nao o
 * monta sob `prefers-reduced-motion`.
 */

const MAX_STRANDS = 12;
const MAX_COLORS = 8;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[${MAX_COLORS}];
uniform int uColorCount;
uniform int uStrandCount;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaviness;
uniform float uThickness;
uniform float uGlow;
uniform float uTaper;
uniform float uSpread;
uniform float uHueShift;
uniform float uIntensity;
uniform float uOpacity;
uniform float uScale;
uniform float uSaturation;
uniform float uRightLift;

out vec4 fragColor;

const float PI = 3.14159265;

vec3 spectrum(float t) {
  return 0.5 + 0.5 * cos(2.0 * PI * (t + vec3(0.00, 0.33, 0.67)));
}

vec3 samplePalette(float t) {
  t = fract(t);
  float scaled = t * float(uColorCount);
  int idx = int(floor(scaled));
  float blend = fract(scaled);
  int nextIdx = idx + 1;
  if (nextIdx >= uColorCount) nextIdx = 0;
  return mix(uColors[idx], uColors[nextIdx], blend);
}

vec3 strandColor(float t) {
  if (uColorCount > 0) return samplePalette(t);
  return spectrum(t);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  uv /= max(uScale, 0.0001);

  float e = 0.06 + uIntensity * 0.94;
  float env = pow(max(cos(uv.x * PI * 1.3), 0.0), uTaper);

  vec3 col = vec3(0.0);

  for (int i = 0; i < ${MAX_STRANDS}; i++) {
    if (i >= uStrandCount) break;

    float fi = float(i);
    float ph = fi * 1.7 * uSpread;
    float freq = (2.0 + fi * 0.35) * uWaviness;
    float spd = 1.4 + fi * 1.2;

    float tt = uTime * uSpeed;
    float w = sin(uv.x * freq + tt * spd + ph) * 0.60
            + sin(uv.x * freq * 1.1 - tt * spd * 0.7 + ph * 1.7) * 0.40;

    float amp = (0.1 + 0.02 * e) * env * uAmplitude;
    float rightLift = smoothstep(-0.34, 0.18, uv.x) * uRightLift;
    float y = w * amp + rightLift;

    float d = abs(uv.y - y);
    float thick = (0.001 + 0.05 * e) * (0.35 + env) * uThickness;
    float g = thick / (d + thick * 0.45);
    g = g * g;

    float h = fi / float(uStrandCount) + uv.x * 0.30 + uTime * 0.04 + uHueShift;
    col += strandColor(h) * g * env;
  }

  col *= 0.45 + 0.7 * e;
  col = 1.0 - exp(-col * uGlow);

  // O esmaecimento acontece dentro do proprio WebGL para que nenhuma borda da
  // tela possa aparecer, mesmo em navegadores que compoem mascaras CSS de
  // outro jeito sobre uma camada WebGL.
  vec2 edgePosition = gl_FragCoord.xy / uResolution;
  float edgeFade = smoothstep(0.0, 0.08, edgePosition.x)
                 * smoothstep(0.0, 0.08, 1.0 - edgePosition.x)
                 * smoothstep(0.0, 0.18, edgePosition.y)
                 * smoothstep(0.0, 0.18, 1.0 - edgePosition.y);
  col *= edgeFade;

  float gray = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = max(mix(vec3(gray), col, uSaturation), 0.0);

  float lum = max(max(col.r, col.g), col.b);
  float alpha = clamp(lum, 0.0, 1.0) * uOpacity;

  fragColor = vec4(col * uOpacity, alpha);
}
`;

function buildPalette(colors: string[]) {
  const filled = colors.length ? colors : ["#ffffff"];
  const padded: [number, number, number][] = [];
  for (let i = 0; i < MAX_COLORS; i++) {
    const c = new Color(filled[i] ?? filled[filled.length - 1]);
    padded.push([c.r, c.g, c.b]);
  }
  return padded;
}

export type StrandsProps = {
  colors?: string[];
  count?: number;
  speed?: number;
  amplitude?: number;
  waviness?: number;
  thickness?: number;
  glow?: number;
  taper?: number;
  spread?: number;
  hueShift?: number;
  intensity?: number;
  saturation?: number;
  opacity?: number;
  scale?: number;
  rightLift?: number;
};

export default function Strands({
  colors = ["#FF4242", "#7C3AED", "#06B6D4", "#EAB308"],
  count = 3,
  speed = 0.5,
  amplitude = 1,
  waviness = 1,
  thickness = 0.7,
  glow = 2.6,
  taper = 3,
  spread = 1,
  hueShift = 0,
  intensity = 0.6,
  saturation = 1.5,
  opacity = 1,
  scale = 1.5,
  rightLift = 0,
}: StrandsProps) {
  const ctnDom = useRef<HTMLDivElement>(null);
  /* Como no original: os valores sao lidos uma vez na montagem. O efeito nao
     depende deles, entao trocar uma prop nao recria o contexto WebGL. */
  const props = useRef({ colors, count, speed, amplitude, waviness, thickness, glow, taper, spread, hueShift, intensity, saturation, opacity, scale, rightLift });
  props.current = { colors, count, speed, amplitude, waviness, thickness, glow, taper, spread, hueShift, intensity, saturation, opacity, scale, rightLift };

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;
    const p = props.current;

    const renderer = new Renderer({ dpr: 0.55, alpha: true, premultipliedAlpha: true, antialias: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = "transparent";

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uColors: { value: buildPalette(p.colors) },
        uColorCount: { value: Math.min(p.colors.length, MAX_COLORS) },
        uStrandCount: { value: Math.min(p.count, MAX_STRANDS) },
        uSpeed: { value: p.speed },
        uAmplitude: { value: p.amplitude },
        uWaviness: { value: p.waviness },
        uThickness: { value: p.thickness },
        uGlow: { value: p.glow },
        uTaper: { value: p.taper },
        uSpread: { value: p.spread },
        uHueShift: { value: p.hueShift },
        uIntensity: { value: p.intensity },
        uOpacity: { value: p.opacity },
        uScale: { value: p.scale },
        uSaturation: { value: p.saturation },
        uRightLift: { value: p.rightLift },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctn.appendChild(gl.canvas);

    const resize = () => {
      renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    window.addEventListener("resize", resize);
    resize();

    let animateId = 0;
    let lastRender = 0;
    let visible = true;
    const update = (t: number) => {
      animateId = requestAnimationFrame(update);
      // Teto de 20fps: e um fundo, nao uma animacao que alguem acompanha.
      if (!visible || document.hidden || t - lastRender < 50) return;
      lastRender = t;
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "5%" });
    observer.observe(ctn);
    animateId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animateId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      if (gl.canvas.parentNode === ctn) ctn.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={ctnDom} className="strands-container" />;
}
