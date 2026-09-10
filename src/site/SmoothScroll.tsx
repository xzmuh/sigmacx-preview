import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/** One scroll controller for every route, with the original home settings. */
export function SmoothScroll() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;
    const tick = (time: number) => {
      if (!lenis) return;
      const locked = document.documentElement.classList.contains("product-journey-lock");
      if (locked && !lenis.isStopped) lenis.stop();
      if (!locked && lenis.isStopped) lenis.start();
      lenis.raf(time * 1000);
    };
    const configure = () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = undefined;
      if (reduced.matches) return;
      lenis = new Lenis({
        duration: 1.35,
        easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
        smoothWheel: true,
        wheelMultiplier: 0.82,
        touchMultiplier: 1.1,
        syncTouch: false,
        anchors: { offset: -88, duration: 1.25 },
        allowNestedScroll: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };

    // Discard momentum from the previous route before the next page appears.
    if (!window.location.hash) window.scrollTo(0, 0);
    configure();
    reduced.addEventListener("change", configure);
    return () => {
      reduced.removeEventListener("change", configure);
      gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, [pathname]);

  return null;
}
