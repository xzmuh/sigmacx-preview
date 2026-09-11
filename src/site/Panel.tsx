import { useEffect, useRef, type ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  /** Quando true, o painel perde margem e raio conforme sobe na tela. */
  expand?: boolean;
  /** Margem lateral máxima, em px, com o painel ainda encaixotado. */
  inset?: number;
  /** Raio máximo, em px, com o painel ainda encaixotado. */
  radius?: number;
  className?: string;
};

/**
 * Cartão escuro arredondado que "fica inteiro" conforme sobe na tela: a margem
 * lateral vai a zero e o raio some, até o painel ocupar a largura toda. É a
 * única animação de scroll da página, no lugar das emendas diagonais, que
 * sempre deixavam um corte reto entre duas faixas.
 *
 * O progresso vem só da posição do topo do painel na janela, sem observer de
 * interseção: precisa ser contínuo, não um gatilho de entrada.
 */
export function Panel({ children, expand = true, inset = 88, radius = 24, className = "" }: PanelProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !expand) return;

    /* Sem movimento: entrega o painel já inteiro, que é o estado de repouso
       mais legível, encaixotado sem nunca abrir pareceria um erro. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--sx-panel-x", "0px");
      el.style.setProperty("--sx-panel-r", "0px");
      return;
    }

    let queued = false;

    const layout = () => {
      queued = false;
      const viewport = window.innerHeight;
      /* Em telas estreitas a margem cheia comeria a largura útil do texto. */
      const maxInset = Math.min(inset, window.innerWidth * 0.06);
      const { top } = el.getBoundingClientRect();
      /* 0 com o topo do painel a 55% da janela, 1 quando alcança o topo dela;
         passando disso continua 1, entao o painel nao volta a encaixotar. */
      const progress = 1 - Math.min(Math.max(top / (viewport * 0.55), 0), 1);
      el.style.setProperty("--sx-panel-x", `${(maxInset * (1 - progress)).toFixed(1)}px`);
      el.style.setProperty("--sx-panel-r", `${(radius * (1 - progress)).toFixed(1)}px`);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(layout);
    };

    layout();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [expand, inset, radius]);

  const style = expand ? undefined : { "--sx-panel-x": `${inset}px`, "--sx-panel-r": `${radius}px` } as React.CSSProperties;

  return (
    <section ref={ref} className={`sx-panel sx-dark ${className}`.trim()} style={style}>
      {children}
    </section>
  );
}
