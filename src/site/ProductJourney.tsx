import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { type Lang } from "../lib/i18n";

const PRODUCT_JOURNEY_EVENT = "sigmacx:product-journey";

type JourneyDetail = {
  to: string;
  lang: Lang;
  direction: "forward" | "back" | "dialogi";
};

type BrowserViewTransition = {
  finished: Promise<void>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => BrowserViewTransition;
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
    const finish = () => {
      document.documentElement.classList.remove(
        "product-journey-running",
        "product-journey-lock",
        "product-journey-forward",
        "product-journey-back",
        "product-journey-dialogi",
      );
      running.current = false;
      setAnnouncement("");
    };

    const onJourney = (rawEvent: Event) => {
      const event = rawEvent as CustomEvent<JourneyDetail>;
      if (!event.detail || running.current) return;

      running.current = true;
      setAnnouncement(copy[event.detail.lang][event.detail.direction]);
      const viewDocument = document as ViewTransitionDocument;

      if (!viewDocument.startViewTransition) {
        navigateRef.current(event.detail.to);
        window.scrollTo(0, 0);
        finish();
        return;
      }

      document.documentElement.classList.add(
        "product-journey-running",
        "product-journey-lock",
        event.detail.direction === "back"
          ? "product-journey-back"
          : event.detail.direction === "dialogi"
            ? "product-journey-dialogi"
            : "product-journey-forward",
      );

      try {
        const transition = viewDocument.startViewTransition(() => {
          flushSync(() => navigateRef.current(event.detail.to));
          window.scrollTo(0, 0);
        });
        void transition.finished.catch(() => undefined).finally(finish);
      } catch {
        navigateRef.current(event.detail.to);
        window.scrollTo(0, 0);
        finish();
      }
    };

    window.addEventListener(PRODUCT_JOURNEY_EVENT, onJourney);
    return () => {
      window.removeEventListener(PRODUCT_JOURNEY_EVENT, onJourney);
      document.documentElement.classList.remove(
        "product-journey-running",
        "product-journey-lock",
        "product-journey-forward",
        "product-journey-back",
        "product-journey-dialogi",
      );
      running.current = false;
    };
  }, []);

  return (
    <span className="product-journey-announcer" role="status" aria-live="polite">
      {announcement}
    </span>
  );
}
