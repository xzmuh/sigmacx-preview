import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useInvestorsMotion(root: RefObject<HTMLDivElement | null>, lang: string) {
  useLayoutEffect(() => {
    if (!root.current) return;
    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        // A moldura clara abre suavemente, como os paineis da Suite.
        gsap.to(".inv-diagnosis", {
          "--inv-panel-inset": "10px", "--inv-panel-radius": "48px", ease: "none",
          scrollTrigger: { trigger: ".inv-diagnosis", start: "top 85%", end: "top 20%", scrub: 0.8 },
        });
        gsap.from(".inv-sculpture__ribbons", {
          opacity: 0, rotate: -12, scale: 0.88, transformOrigin: "50% 50%",
          duration: 2.2, ease: "power3.out",
        });
        gsap.to(".inv-sculpture svg", {
          y: -110, rotate: 12, ease: "none",
          scrollTrigger: { trigger: ".inv-hero", start: "top top", end: "bottom top", scrub: 1.2 },
        });
        gsap.fromTo(".inv-progress", { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true },
        });
        gsap.utils.toArray<HTMLElement>(".inv [data-reveal]").forEach((block) => {
          gsap.from(block, {
            y: 38, opacity: 0, duration: 0.95, ease: "power3.out",
            scrollTrigger: { trigger: block, start: "top 92%", once: true },
          });
        });
        gsap.from(".inv-flow__fill", {
          scaleX: 0, transformOrigin: "left", ease: "none",
          scrollTrigger: { trigger: ".inv-flow", start: "top 85%", end: "bottom 55%", scrub: 0.6 },
        });
        gsap.utils.toArray<HTMLElement>(".inv-forces .inv-card").forEach((card) => {
          gsap.from(card, {
            y: 45, opacity: 0.25, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 90%", once: true },
          });
        });
        gsap.to(".inv-band__arcs", {
          yPercent: 20, scale: 1.12, ease: "none",
          scrollTrigger: { trigger: ".inv-band", start: "top bottom", end: "bottom top", scrub: 1 },
        });
        gsap.from(".inv-layer-art span", {
          y: 28, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: ".inv-why .inv-cards", start: "top 85%", once: true },
        });
      }, root);
      const links = gsap.utils.toArray<HTMLAnchorElement>(".inv-chapters a");
      links.forEach((link) => {
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
