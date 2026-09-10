import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { stripLang, type Lang } from "../lib/i18n";

const PRODUCT_JOURNEY_EVENT = "sigmacx:product-journey";
const ROUTE_READY_EVENT = "sigmacx:route-ready";

/** Mounted inside Suspense: fires only after the destination can commit. */
export function JourneyRouteReady() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.dispatchEvent(new CustomEvent(ROUTE_READY_EVENT, { detail: pathname }));
  }, [pathname]);
  return null;
}

async function preloadDestination(to: string) {
  switch (stripLang(to)) {
    case "/dialogi": await import("../pages/Dialogi"); break;
    case "/produto": await import("../pages/Produto"); break;
    case "/": await import("../SigmaExperience"); break;
  }
}

type JourneyDetail = {
  to: string;
  lang: Lang;
  direction: "forward" | "back" | "dialogi";
};

type BrowserViewTransition = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => BrowserViewTransition;
};

const copy: Record<Lang, Record<JourneyDetail["direction"], string>> = {
  pt: { forward: "Entrando na Sigma Suite", back: "Voltando para a Home", dialogi: "Entrando no Dialogi" },
  en: { forward: "Entering Sigma Suite", back: "Returning Home", dialogi: "Entering Dialogi" },
  es: { forward: "Entrando en Sigma Suite", back: "Volviendo al inicio", dialogi: "Entrando en Dialogi" },
};

export function startProductJourney(to: string, lang: Lang) {
  window.dispatchEvent(new CustomEvent<JourneyDetail>(PRODUCT_JOURNEY_EVENT, {
    detail: { to, lang, direction: "forward" },
  }));
}

export function startHomeJourney(to: string, lang: Lang) {
  window.dispatchEvent(new CustomEvent<JourneyDetail>(PRODUCT_JOURNEY_EVENT, {
    detail: { to, lang, direction: "back" },
  }));
}

export function startDialogiJourney(to: string, lang: Lang) {
  window.dispatchEvent(new CustomEvent<JourneyDetail>(PRODUCT_JOURNEY_EVENT, {
    detail: { to, lang, direction: "dialogi" },
  }));
}

/**
 * A View Transition mantém um snapshot real da home enquanto a nova rota já
 * está renderizada por baixo. A máscara animada fica no CSS dos pseudo-elements
 * ::view-transition-old/new — nenhum fundo ou mock da página é criado aqui.
 */
export function ProductJourney() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  const running = useRef(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    let disposed = false;
    let active: BrowserViewTransition | undefined;
    let cancelWait: (() => void) | undefined;
    let watchdog = 0;
    const classes = ["product-journey-running", "product-journey-lock", "product-journey-forward", "product-journey-back", "product-journey-dialogi"];
    const finish = () => {
      window.clearTimeout(watchdog);
      cancelWait?.();
      cancelWait = undefined;
      active = undefined;
      document.documentElement.classList.remove(...classes);
      running.current = false;
      if (!disposed) setAnnouncement("");
    };

    const onJourney = async (rawEvent: Event) => {
      const { detail } = rawEvent as CustomEvent<JourneyDetail>;
      if (!detail || running.current || window.location.pathname === detail.to) return;
      running.current = true;
      const source = window.location.pathname;
      setAnnouncement(copy[detail.lang][detail.direction]);
      let navigated = false;
      const navigate = () => {
        navigated = true;
        flushSync(() => navigateRef.current(detail.to));
        window.scrollTo(0, 0);
      };
      try {
        // Load the destination JS/CSS while the current page is still usable.
        // The transition itself must not wait for network under a frozen snapshot.
        await preloadDestination(detail.to);
        if (disposed || window.location.pathname !== source) return;
        const viewDocument = document as ViewTransitionDocument;
        if (!viewDocument.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          navigate();
          return;
        }
        document.documentElement.classList.add(
          "product-journey-running", "product-journey-lock",
          detail.direction === "back" ? "product-journey-back" : detail.direction === "dialogi" ? "product-journey-dialogi" : "product-journey-forward",
        );
        active = viewDocument.startViewTransition(() => new Promise<void>((resolve, reject) => {
          const ready = (event: Event) => {
            const path = (event as CustomEvent<string>).detail;
            if (path !== detail.to) {
              reject(new Error("Journey superseded by another route"));
            } else {
              resolve();
            }
            window.removeEventListener(ROUTE_READY_EVENT, ready);
            cancelWait = undefined;
          };
          cancelWait = () => {
            window.removeEventListener(ROUTE_READY_EVENT, ready);
            reject(new Error("Journey cancelled"));
          };
          window.addEventListener(ROUTE_READY_EVENT, ready);
          navigate();
        }));
        // Snapshot failures must not leave input locked or swallow navigation.
        void active.ready.catch(() => undefined);
        void active.finished.catch(() => undefined);
        watchdog = window.setTimeout(() => {
          active?.skipTransition();
          cancelWait?.();
          document.documentElement.classList.remove(...classes);
        }, 5000);
        await active.updateCallbackDone;
        await active.finished;
      } catch (error) {
        active?.skipTransition();
        console.warn("Product transition skipped; continuing navigation", error);
        if (!disposed && !navigated && window.location.pathname === source) navigate();
      } finally {
        if (!disposed) finish();
      }
    };

    window.addEventListener(PRODUCT_JOURNEY_EVENT, onJourney);
    return () => {
      disposed = true;
      window.removeEventListener(PRODUCT_JOURNEY_EVENT, onJourney);
      active?.skipTransition();
      finish();
    };
  }, []);

  return (
    <span className="product-journey-announcer" role="status" aria-live="polite">
      {announcement}
    </span>
  );
}
