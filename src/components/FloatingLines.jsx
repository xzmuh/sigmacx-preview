import { useEffect, useRef } from 'react';

import './FloatingLines.css';

/*
 * Linhas ambientais da marca em WebGL2 puro. Antes usava o three.js inteiro
 * (~220 KB comprimido e ~1,2 s de script no celular) so para desenhar um
 * shader de tela cheia. O shader de fragmento e o mesmo, em GLSL ES 3.00
 * como o three gerava; o triangulo de tela cheia cobre os mesmos pixels que
 * o plano 2x2 com camera ortografica, entao cada quadro sai igual.
 */

const vertexShader = `#version 300 es
in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;
precision highp int;

out vec4 fragOut;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;
uniform vec3 backgroundColor;
uniform bool lightMode;

const vec3 BLACK = vec3(0.0);
const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);

  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;

  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }

  vec3 gradientColor;
  
  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);

    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];
    
    gradientColor = mix(c1, c2, f);
  }
  
  return gradientColor * 0.5;
}

  float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;

  float x_offset   = offset;
  float x_movement = time * 0.1;
  float amp        = sin(offset + time * 0.2) * 0.3;
  float y          = sin(uv.x + x_offset + x_movement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius); // radial falloff around cursor
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;
  
  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = vec3(0.0);

  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }
  
  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.2;
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi,
        baseUv,
        mouseUv,
        interactive
      );
    }
  }

  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.1;
    }
  }

if (lightMode) {
  vec3 energy = max(col, vec3(0.0));
  float peak = max(energy.r, max(energy.g, energy.b));
  float coverage = smoothstep(0.018, 0.5, peak);
  vec3 chroma = clamp(energy / max(peak, 0.0001), 0.0, 1.0);
  chroma = pow(chroma, vec3(1.35));
  float chromaPeak = max(chroma.r, max(chroma.g, chroma.b));
  chroma /= max(chromaPeak, 0.0001);
  vec3 ink = mix(chroma, clamp(chroma * 0.82, 0.0, 1.0), smoothstep(0.5, 1.0, coverage));
  fragColor = vec4(mix(vec3(1.0), ink, coverage * 0.94), 1.0);
} else {
    fragColor = vec4(col, 1.0);
  }
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  fragOut = color;
}
`;

const MAX_GRADIENT_STOPS = 8;

function hexToVec3(hex) {
  let value = hex.trim();

  if (value.startsWith('#')) {
    value = value.slice(1);
  }

  let r = 255;
  let g = 255;
  let b = 255;

  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }

  return [r / 255, g / 255, b / 255];
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`FloatingLines: shader nao compilou: ${log}`);
  }
  return shader;
}

export default function FloatingLines({
  linesGradient,
  enabledWaves = ['top', 'middle', 'bottom'],
  lineCount = [6],
  lineDistance = [5],
  topWavePosition,
  middleWavePosition,
  bottomWavePosition = { x: 2.0, y: -0.7, rotate: -1 },
  animationSpeed = 1,
  interactive = true,
  bendRadius = 5.0,
  bendStrength = -0.5,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  mixBlendMode = 'screen',
  backgroundColor = '#000000',
  lightMode = false
}) {
  const containerRef = useRef(null);
  const targetMouseRef = useRef([-1000, -1000]);
  const currentMouseRef = useRef([-1000, -1000]);
  const targetInfluenceRef = useRef(0);
  const currentInfluenceRef = useRef(0);
  const targetParallaxRef = useRef([0, 0]);
  const currentParallaxRef = useRef([0, 0]);

  const getLineCount = waveType => {
    if (typeof lineCount === 'number') return lineCount;
    if (!enabledWaves.includes(waveType)) return 0;
    const index = enabledWaves.indexOf(waveType);
    return lineCount[index] ?? 6;
  };

  const getLineDistance = waveType => {
    if (typeof lineDistance === 'number') return lineDistance;
    if (!enabledWaves.includes(waveType)) return 0.1;
    const index = enabledWaves.indexOf(waveType);
    return lineDistance[index] ?? 0.1;
  };

  const topLineCount = enabledWaves.includes('top') ? getLineCount('top') : 0;
  const middleLineCount = enabledWaves.includes('middle') ? getLineCount('middle') : 0;
  const bottomLineCount = enabledWaves.includes('bottom') ? getLineCount('bottom') : 0;

  const topLineDistance = enabledWaves.includes('top') ? getLineDistance('top') * 0.01 : 0.01;
  const middleLineDistance = enabledWaves.includes('middle') ? getLineDistance('middle') * 0.01 : 0.01;
  const bottomLineDistance = enabledWaves.includes('bottom') ? getLineDistance('bottom') * 0.01 : 0.01;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let active = true;

    const canvas = document.createElement('canvas');
    // Mesmo contexto que o three pedia: WebGL2, antialias, sem alfa.
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'default' });
    if (!gl) {
      // Sem WebGL2 o fundo fica so com a cor da secao; nada mais quebra.
      console.warn('FloatingLines: WebGL2 indisponivel, efeito desligado.');
      return undefined;
    }

    let program;
    let vertexObject;
    let buffer;
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, vertexShader);
      const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
      program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`FloatingLines: programa nao ligou: ${gl.getProgramInfoLog(program)}`);
      }
    } catch (err) {
      console.warn(err);
      return undefined;
    }

    // Shader de tela cheia: custo proporcional aos pixels. 1.5x ja fica liso
    // em telas retina e corta ~44% do trabalho por quadro frente a 2x.
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    gl.useProgram(program);

    // Triangulo que cobre a tela inteira (tres vertices, sem indice).
    vertexObject = gl.createVertexArray();
    gl.bindVertexArray(vertexObject);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const loc = name => gl.getUniformLocation(program, name);
    const u = {
      iTime: loc('iTime'),
      iResolution: loc('iResolution'),
      iMouse: loc('iMouse'),
      bendInfluence: loc('bendInfluence'),
      parallaxOffset: loc('parallaxOffset')
    };

    const setVec3 = (name, [x, y, z]) => gl.uniform3f(loc(name), x, y, z);

    gl.uniform1f(loc('animationSpeed'), animationSpeed);
    gl.uniform1i(loc('enableTop'), enabledWaves.includes('top') ? 1 : 0);
    gl.uniform1i(loc('enableMiddle'), enabledWaves.includes('middle') ? 1 : 0);
    gl.uniform1i(loc('enableBottom'), enabledWaves.includes('bottom') ? 1 : 0);
    gl.uniform1i(loc('topLineCount'), topLineCount);
    gl.uniform1i(loc('middleLineCount'), middleLineCount);
    gl.uniform1i(loc('bottomLineCount'), bottomLineCount);
    gl.uniform1f(loc('topLineDistance'), topLineDistance);
    gl.uniform1f(loc('middleLineDistance'), middleLineDistance);
    gl.uniform1f(loc('bottomLineDistance'), bottomLineDistance);
    setVec3('topWavePosition', [topWavePosition?.x ?? 10.0, topWavePosition?.y ?? 0.5, topWavePosition?.rotate ?? -0.4]);
    setVec3('middleWavePosition', [middleWavePosition?.x ?? 5.0, middleWavePosition?.y ?? 0.0, middleWavePosition?.rotate ?? 0.2]);
    setVec3('bottomWavePosition', [bottomWavePosition?.x ?? 2.0, bottomWavePosition?.y ?? -0.7, bottomWavePosition?.rotate ?? 0.4]);
    gl.uniform2f(u.iMouse, -1000, -1000);
    gl.uniform1i(loc('interactive'), interactive ? 1 : 0);
    gl.uniform1f(loc('bendRadius'), bendRadius);
    gl.uniform1f(loc('bendStrength'), bendStrength);
    gl.uniform1f(u.bendInfluence, 0);
    gl.uniform1i(loc('parallax'), parallax ? 1 : 0);
    gl.uniform1f(loc('parallaxStrength'), parallaxStrength);
    gl.uniform2f(u.parallaxOffset, 0, 0);
    setVec3('backgroundColor', hexToVec3(backgroundColor));
    gl.uniform1i(loc('lightMode'), lightMode ? 1 : 0);

    const gradient = new Float32Array(MAX_GRADIENT_STOPS * 3).fill(1);
    let gradientCount = 0;
    if (linesGradient && linesGradient.length > 0) {
      const stops = linesGradient.slice(0, MAX_GRADIENT_STOPS);
      gradientCount = stops.length;
      stops.forEach((hex, i) => gradient.set(hexToVec3(hex), i * 3));
    }
    gl.uniform3fv(loc('lineGradient[0]') ?? loc('lineGradient'), gradient);
    gl.uniform1i(loc('lineGradientCount'), gradientCount);

    // Relogio que comeca no primeiro quadro, como o Clock do three.
    let clockStart = null;
    const elapsed = () => {
      const now = performance.now();
      if (clockStart === null) clockStart = now;
      return (now - clockStart) / 1000;
    };

    const setSize = () => {
      if (!active) return;
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform3f(u.iResolution, canvas.width, canvas.height, 1);
    };

    const draw = () => {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    setSize();

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (!active) return;
            setSize();
            if (!running) draw();
          })
        : null;

    if (ro) ro.observe(container);

    const handlePointerMove = event => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      targetMouseRef.current = [x * pixelRatio, (rect.height - y) * pixelRatio];
      targetInfluenceRef.current = 1.0;

      if (parallax) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = (x - centerX) / rect.width;
        const offsetY = -(y - centerY) / rect.height;
        targetParallaxRef.current = [offsetX * parallaxStrength, offsetY * parallaxStrength];
      }
    };

    const handlePointerLeave = () => {
      targetInfluenceRef.current = 0.0;
    };

    if (interactive) {
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerleave', handlePointerLeave);
    }

    const lerp = (current, target) => [
      current[0] + (target[0] - current[0]) * mouseDamping,
      current[1] + (target[1] - current[1]) * mouseDamping
    ];

    let raf = 0;
    let running = false;
    const renderLoop = () => {
      if (!active || !running) return;

      gl.uniform1f(u.iTime, elapsed());

      if (interactive) {
        currentMouseRef.current = lerp(currentMouseRef.current, targetMouseRef.current);
        gl.uniform2f(u.iMouse, currentMouseRef.current[0], currentMouseRef.current[1]);

        currentInfluenceRef.current += (targetInfluenceRef.current - currentInfluenceRef.current) * mouseDamping;
        gl.uniform1f(u.bendInfluence, currentInfluenceRef.current);
      }

      if (parallax) {
        currentParallaxRef.current = lerp(currentParallaxRef.current, targetParallaxRef.current);
        gl.uniform2f(u.parallaxOffset, currentParallaxRef.current[0], currentParallaxRef.current[1]);
      }

      draw();
      raf = requestAnimationFrame(renderLoop);
    };

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // O loop so roda enquanto a secao esta na tela e a aba visivel: fora
    // disso o WebGL parava de aparecer mas seguia queimando CPU/bateria a
    // cada quadro (e derrubava a nota de performance mobile).
    let inView = false;
    const start = () => {
      if (running || !active) return;
      running = true;
      raf = requestAnimationFrame(renderLoop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (inView && document.visibilityState === 'visible') start();
      else stop();
    };
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            entries => {
              inView = entries.some(e => e.isIntersecting);
              sync();
            },
            { rootMargin: '120px 0px' }
          )
        : null;

    if (prefersReducedMotion) {
      gl.uniform1f(u.iTime, 0.8);
      draw();
    } else if (io) {
      io.observe(container);
      document.addEventListener('visibilitychange', sync);
    } else {
      inView = true;
      start();
    }

    return () => {
      active = false;
      running = false;

      cancelAnimationFrame(raf);

      if (ro) ro.disconnect();
      if (io) io.disconnect();
      document.removeEventListener('visibilitychange', sync);

      if (interactive) {
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerleave', handlePointerLeave);
      }

      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vertexObject);
      gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    linesGradient,
    enabledWaves,
    lineCount,
    lineDistance,
    topWavePosition,
    middleWavePosition,
    bottomWavePosition,
    animationSpeed,
    interactive,
    bendRadius,
    bendStrength,
    mouseDamping,
    parallax,
    parallaxStrength,
    backgroundColor,
    lightMode
  ]);

  return (
    <div
      ref={containerRef}
      className="floating-lines-container"
      style={{
        mixBlendMode: lightMode ? 'normal' : mixBlendMode
      }}
    />
  );
}
