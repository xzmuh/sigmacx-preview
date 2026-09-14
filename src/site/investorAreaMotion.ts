import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Movimento da area logada: o mesmo ritmo de /investidores, sem a escultura. */
export function useInvestorAreaMotion(root: RefObject<HTMLDivElement | null>, lang: string) {
  useLayoutEffect(() => {
    if (!root.current) return;
    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(".inv-progress", { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true },
        });
        gsap.from(".inv-area__bar, .inv-area__toc", { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 });
        gsap.utils.toArray<HTMLElement>(".inv-area [data-reveal]").forEach((block) => {
          gsap.from(block, {
            y: 38, opacity: 0, duration: 0.95, ease: "power3.out",
            scrollTrigger: { trigger: block, start: "top 92%", once: true },
          });
        });
        // Os paineis claros abrem ao entrar, como "O diagnostico" da pagina publica.
        gsap.utils.toArray<HTMLElement>(".inv-slide--light").forEach((panel) => {
          gsap.fromTo(panel, { "--inv-panel-grow": "0px", "--inv-panel-radius": "86px" }, {
            "--inv-panel-grow": "28px", "--inv-panel-radius": "48px", ease: "none",
            scrollTrigger: { trigger: panel, start: "top 85%", end: "top 25%", scrub: 0.8 },
          });
        });
        // As barras da projecao crescem da base quando o grafico entra na tela.
        gsap.utils.toArray<HTMLElement>(".inv-bars").forEach((chart) => {
          gsap.from(chart.querySelectorAll("i"), {
            scaleY: 0, transformOrigin: "50% 100%", duration: 1.2, ease: "power3.out", stagger: 0.12,
            scrollTrigger: { trigger: chart, start: "top 85%", once: true },
          });
        });
      }, root);

      // Sumario marca a secao em leitura, com ou sem movimento.
      gsap.utils.toArray<HTMLAnchorElement>(".inv-area__toc a").forEach((link) => {
        const section = root.current?.querySelector(link.hash);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section, start: "top 45%", end: "bottom 45%",
          onToggle: ({ isActive }) => {
            link.classList.toggle("is-active", isActive);
            if (isActive) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          },
        });
      });
    }, root);
    let disposed = false;
    void document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => {
      disposed = true;
      media.revert();
      ctx.revert();
    };
  }, [root, lang]);
}
