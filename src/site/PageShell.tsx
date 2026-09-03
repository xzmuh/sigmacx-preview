import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { FinalCta, SiteFooter } from "./SiteFooter";
import { SectionTransition } from "./SectionTransition";
import { useSuiteMotion } from "./suiteMotion";
import { HTML_LANG, pick, useLang, type Lang } from "../lib/i18n";
import ui from "../../content/ui.json";

type PageShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
  /** false em paginas que ja terminam escuras (evita emenda dupla). */
  endsLight?: boolean;
  /**
   * "suite": identidade clara da marca Sigma (brand kit 2024) para as paginas
   * de produto. Ver site/suite.css.
   */
  theme?: "default" | "suite";
};

/**
 * Pagina branca com header fixo e bloco final escuro (CTA + rodape).
 * A emenda diagonal animada faz a passagem do branco para o navy.
 */
export function PageShell({ children, title, description, endsLight = true, theme = "default" }: PageShellProps) {
  const { pathname } = useLocation();
  const lang = useLang();
  const skip = pick(ui as Record<Lang, typeof ui.pt>, lang).nav.skip;
  useSuiteMotion(theme === "suite");

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
  }, [lang]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    document.title = title;
    if (!description) return;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", description);
  }, [title, description]);

  return (
    <div className={theme === "suite" ? "sx-page sx-page--suite" : "sx-page"}>
      <a className="sx-skip" href="#conteudo">{skip}</a>
      <SiteHeader />
      <main id="conteudo">{children}</main>
      {endsLight ? <SectionTransition to="dark" /> : null}
      <div className="sx-dark sx-footer-wrap">
        <FinalCta />
      </div>
      <SiteFooter />
    </div>
  );
}

/** Revela blocos [data-reveal] ao entrar na tela; respeita reduced motion. */
export function useReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".sx-page [data-reveal]"));
    if (reduced) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
