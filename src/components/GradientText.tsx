import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import './GradientText.css';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  pauseOnHover?: boolean;
  yoyo?: boolean;
}

/*
 * Mesmo calculo do componente original do React Bits, sem a biblioteca
 * `motion` (~43 KB comprimido carregados em todas as paginas so para mover o
 * fundo do texto). A posicao e escrita direto no estilo a cada quadro, e o
 * relogio para quando o texto sai da tela ou a aba fica oculta: fora de vista
 * nada muda para quem olha, e o processador descansa.
 */
export default function GradientText({
  children,
  className = '',
  colors = ['#5da6ff', '#b9ff9b', '#00a9a9'],
  animationSpeed = 8,
  showBorder = false,
  direction = 'horizontal',
  pauseOnHover = false,
  yoyo = true
}: GradientTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const hoverPausedRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const animationDuration = animationSpeed * 1000;
    const toPosition = (p: number) => (direction === 'vertical' ? `50% ${p}%` : `${p}% 50%`);
    const apply = (p: number) => {
      const value = toPosition(p);
      if (textRef.current) textRef.current.style.backgroundPosition = value;
      if (overlayRef.current) overlayRef.current.style.backgroundPosition = value;
    };

    let elapsed = 0;
    let last: number | null = null;
    let frame = 0;
    let running = false;
    let inView = true;

    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      if (hoverPausedRef.current) {
        last = null;
        return;
      }
      if (last === null) {
        last = time;
        return;
      }
      elapsed += time - last;
      last = time;

      if (yoyo) {
        const cycleTime = elapsed % (animationDuration * 2);
        apply(cycleTime < animationDuration
          ? (cycleTime / animationDuration) * 100
          : 100 - ((cycleTime - animationDuration) / animationDuration) * 100);
      } else {
        // Continua crescendo para o loop sem emenda.
        apply((elapsed / animationDuration) * 100);
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      last = null;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    const sync = () => (inView && document.visibilityState === 'visible' ? start() : stop());

    apply(0);
    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(entries => {
          inView = entries.some(entry => entry.isIntersecting);
          sync();
        }, { rootMargin: '80px 0px' })
      : null;
    if (io) io.observe(root);
    document.addEventListener('visibilitychange', sync);
    sync();

    return () => {
      stop();
      io?.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [animationSpeed, yoyo, direction]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) hoverPausedRef.current = true;
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) hoverPausedRef.current = false;
  }, [pauseOnHover]);

  const gradientAngle =
    direction === 'horizontal' ? 'to right' : direction === 'vertical' ? 'to bottom' : 'to bottom right';
  // Primeira cor repetida no fim para o loop sem emenda.
  const gradientColors = [...colors, colors[0]].join(',');

  const gradientStyle = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundSize: direction === 'horizontal' ? '300% 100%' : direction === 'vertical' ? '100% 300%' : '300%',
    backgroundRepeat: 'repeat'
    // Sem backgroundPosition aqui: o efeito escreve a posicao direto no
    // elemento, e um re-render do React nao pode devolve-la ao inicio.
  };

  return (
    <span
      ref={rootRef}
      className={`animated-gradient-text ${showBorder ? 'with-border' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showBorder && <span ref={overlayRef} className="gradient-overlay" style={gradientStyle} />}
      <span ref={textRef} className="text-content" style={gradientStyle}>
        {children}
      </span>
    </span>
  );
}
