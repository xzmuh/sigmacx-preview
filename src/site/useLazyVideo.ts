import { useEffect, useRef } from "react";

/** Videos locais so recebem o src quando se aproximam da tela (600px);
 *  senao a pagina abre baixando varios MB de uma vez. */
export function useLazyVideo(src: string) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { el.src = src; return; }
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      el.src = src;
      el.play().catch(() => undefined);
    }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [src]);
  return ref;
}
