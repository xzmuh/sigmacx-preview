import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Movimento das paginas de produto (tema suite). Tudo e progressivo: sem
 * pointer fino nao ha tilt/magnetismo/cursor; com reduced-motion so fica a
 * entrada da marca. Nada aqui altera texto, ordem ou layout, e todo estado
 * volta ao original no cleanup (gsap.context + restauro dos textos).
 *
 * O que se move:
 * - marca S em fatias: entra do centro, flutua, segue o mouse e gira no scroll;
 * - midias (imagens/videos) com parallax dentro das molduras;
 * - cards e molduras com tilt 3D e brilho que acompanha o cursor;
 * - botoes magneticos;
 * - numeros (20%, 87%...) contam ao entrar na tela;
 * - glow teal seguindo o cursor;
 * - faixas das emendas diagonais deslizam com o scroll.
 */
export function useSuiteMotion(enabled: boolean) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!enabled) return;
    const root = document.querySelector<HTMLElement>(".sx-page--suite");
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      /* ---------------------------------------------------------- marca S */
      root.querySelectorAll<SVGSVGElement>(".sx-suite-mark").forEach((svg) => {
        const slices = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
        gsap.from(slices, {
          opacity: 0,
          scale: 0.7,
          transformOrigin: "50% 50%",
          duration: 1.1,
          ease: "power3.out",
          stagger: { each: 0.07, from: "center" },
        });
        if (reduced) return;
        slices.forEach((slice, i) => {
          gsap.to(slice, {
            y: (i % 2 ? -1 : 1) * (7 + i * 2),
            duration: 3.4 + i * 0.4,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });
        });
        gsap.to(svg, {
          yPercent: -16,
          rotate: 5,
          ease: "none",
          scrollTrigger: { trigger: svg.parentElement ?? svg, start: "top bottom", end: "bottom top", scrub: true },
        });
        if (fine) {
          const depth = [0.45, 0.8, 1.15];
          const movers = slices.map((slice, i) => ({
            x: gsap.quickTo(slice, "x", { duration: 0.7, ease: "power2.out" }),
            y: gsap.quickTo(slice, "y", { duration: 0.7, ease: "power2.out" }),
            f: depth[i % 3],
          }));
          const onMove = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            movers.forEach((m) => { m.x(nx * 34 * m.f); m.y(ny * 26 * m.f); });
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          cleanups.push(() => window.removeEventListener("pointermove", onMove));
        }
      });

      if (reduced) return;

      /* O titulo entra como um bloco, no mesmo ritmo editorial do restante da
         pagina. Evita que letras soltas disputem atencao com a mensagem. */
      const heroTitle = root.querySelector<HTMLElement>(".sx-hero .sx-h1");
      if (heroTitle) {
        gsap.fromTo(
          heroTitle,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.82, delay: 0.08, ease: "power3.out" },
        );
      }

      /* ------------------------------------------------- hero: recua ao rolar */
      const hero = root.querySelector<HTMLElement>(".sx-hero");
      const heroInner = root.querySelector<HTMLElement>(".sx-hero__inner");
      if (hero && heroInner) {
        gsap.to(heroInner, {
          yPercent: 14,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
        });
      }

      /* --------------------------------------- parallax das midias emolduradas */
      root
        .querySelectorAll<HTMLElement>(
          ".sx-figure img, .sx-feature__media img, .sx-card__media img, .sx-tabs__panel img, .sx-emotion-stage__visual > img, .sx-video iframe, .sx-video video",
        )
        .forEach((media) => {
          gsap.fromTo(
            media,
            { yPercent: -5, scale: 1.1 },
            { yPercent: 5, scale: 1.1, ease: "none", scrollTrigger: { trigger: media.parentElement ?? media, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });

      /* ---------------------------------- emendas: movimento quase imperceptivel */
      root.querySelectorAll<HTMLElement>(".section-transition").forEach((seam) => {
        const bands = seam.querySelectorAll<HTMLElement>("span:nth-child(n + 2)");
        gsap.fromTo(
          bands,
          { xPercent: -2.25 },
          { xPercent: 2.25, ease: "none", stagger: 0.06, scrollTrigger: { trigger: seam, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });

      /* -------------------------------------------- numeros que contam (20%...) */
      // Sem ScrollTrigger aqui: o refresh() dele re-renderiza os tweens no
      // estado inicial e deixava "0%" no texto. IntersectionObserver dispara
      // uma vez e o texto so muda depois que a contagem comeca (onStart).
      const numberNodes: Array<{ node: Text; original: string }> = [];
      const walker = document.createTreeWalker(root.querySelector("main") ?? root, NodeFilter.SHOW_TEXT);
      const re = /(\d{1,3})(%|x)/;
      const pending = new Map<Element, Array<() => void>>();
      let current: Node | null;
      while ((current = walker.nextNode())) {
        const node = current as Text;
        const text = node.nodeValue ?? "";
        const m = re.exec(text);
        if (!m) continue;
        const parent = node.parentElement;
        if (!parent || parent.closest("script, style, .site-header, .footer, .sx-word")) continue;
        numberNodes.push({ node, original: text });
        const target = Number(m[1]);
        const play = () => {
          const counter = { v: 0 };
          gsap.to(counter, {
            v: target,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => { node.nodeValue = text.replace(re, `${Math.round(counter.v)}$2`); },
            onComplete: () => { node.nodeValue = text; },
          });
        };
        const list = pending.get(parent) ?? [];
        list.push(play);
        pending.set(parent, list);
      }
      if (pending.size) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            pending.get(entry.target)?.forEach((fn) => fn());
            pending.delete(entry.target);
            io.unobserve(entry.target);
          });
        }, { threshold: 0.2 });
        pending.forEach((_, el) => io.observe(el));
        cleanups.push(() => io.disconnect());
      }
      cleanups.push(() => numberNodes.forEach(({ node, original }) => { node.nodeValue = original; }));

      if (!fine) return;

      /* ---------------------------------------------------- tilt 3D com brilho */
      const tiltables = root.querySelectorAll<HTMLElement>(
        ".sx-card, .sx-benefits-bento__item, .sx-benefits-bento__statement, .sx-suite-stage__media, .sx-insights-split__media, .sx-figure, .sx-case-switcher__tabs button, .sx-story-media",
      );
      tiltables.forEach((el) => {
        el.classList.add("sx-tilt");
        const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power2.out" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power2.out" });
        const onMove = (e: PointerEvent) => {
          const b = el.getBoundingClientRect();
          const px = (e.clientX - b.left) / b.width;
          const py = (e.clientY - b.top) / b.height;
          el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
          el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
          const amp = Math.min(7, 900 / Math.max(b.width, 200));
          rx(-(py - 0.5) * amp * 2);
          ry((px - 0.5) * amp * 2);
        };
        const onLeave = () => {
          gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.7, ease: "power3.out", onComplete: () => gsap.set(el, { clearProps: "transform" }) });
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          el.classList.remove("sx-tilt");
        });
      });

      /* ------------------------------------------------------- botoes magneticos */
      root.querySelectorAll<HTMLElement>(".sx-cta").forEach((btn) => {
        const x = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power2.out" });
        const y = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power2.out" });
        const onMove = (e: PointerEvent) => {
          const b = btn.getBoundingClientRect();
          x((e.clientX - (b.left + b.width / 2)) * 0.22);
          y((e.clientY - (b.top + b.height / 2)) * 0.32);
        };
        const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.45)" });
        btn.addEventListener("pointermove", onMove);
        btn.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          btn.removeEventListener("pointermove", onMove);
          btn.removeEventListener("pointerleave", onLeave);
        });
      });

      // Glow que seguia o cursor (.sx-cursor) removido a pedido (2026-09-03).
    }, root);

    // O reveal por IntersectionObserver e as imagens lazy mudam alturas depois
    // do primeiro layout; recalcula os gatilhos quando a pagina assentar.
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 600);

    return () => {
      window.clearTimeout(refresh);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [enabled, pathname]);
}
