import { useEffect, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { DEMO_URL, DIALOGI_URL } from "./site-data";
import { LANGS, href, langFromPath, pick, stripLang, type Lang } from "../lib/i18n";
import ui from "../../content/ui.json";
import { startHomeJourney, startProductJourney } from "./ProductJourney";

/**
 * Header unico do site (o da home): mesmas classes .site-header / .nav / .pill
 * de globals.css. Produtos agrupados no dropdown; rotulos por idioma.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const location = useLocation();
  const lang = langFromPath(location.pathname);
  const dict = pick(ui as Record<Lang, typeof ui.pt>, lang);
  const t = dict.nav;
  const base = stripLang(location.pathname);
  // Dropdown de produtos so dentro da area de produtos; na home e demais paginas, link simples.
  const showDrop = base.startsWith("/produto") || base.startsWith("/sigma-");

  const products = [
    { to: "/produto", label: t.platforms, note: t.productNotes.suite },
    { to: "/sigma-channel", label: "Sigma Channel", note: t.productNotes.channel },
    { to: "/sigma-brain", label: "Sigma Brain", note: t.productNotes.brain },
    { to: "/sigma-insights", label: "Sigma Insights", note: t.productNotes.insights },
  ];
  const productRoutes = ["/produto", "/sigma-channel", "/sigma-brain", "/sigma-insights"];

  useEffect(() => {
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setCompact(window.scrollY > 72));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
    setCompanyOpen(false);
  }, [location.pathname]);

  const setHoverOrigin = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const origin = event.clientX - bounds.left <= bounds.width / 2 ? "left" : "right";
    event.currentTarget.style.setProperty("--hover-origin", origin);
  };
  const hover = { onPointerEnter: setHoverOrigin, onPointerMove: setHoverOrigin, onPointerLeave: setHoverOrigin };
  const close = () => { setMenuOpen(false); setDropOpen(false); setCompanyOpen(false); };
  const openProducts = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    close();
    // Nova aba, atalhos do navegador e navegacoes fora da home continuam nativos.
    if (base !== "/" || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    startProductJourney(href("/produto", lang), lang);
  };
  const openHome = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    close();
    if (!productRoutes.includes(base) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    startHomeJourney(href("/", lang), lang);
  };

  return (
    <header className={compact ? "site-header site-header--compact" : "site-header"}>
      <a className="brand" href={href("/", lang)} aria-label="SigmaCX — início">
        <img src="/media/logo-white.png" alt="SigmaCX" />
      </a>
      <nav className={menuOpen ? "nav nav--open" : "nav"} aria-label="Navegação principal">
        <Link data-index="01" to={href("/", lang)} {...hover} onClick={openHome}>Home</Link>
        {showDrop ? (<div
          className={dropOpen ? "nav-drop nav-drop--open" : "nav-drop"}
          onMouseEnter={() => setDropOpen(true)}
          onMouseLeave={() => setDropOpen(false)}
        >
          <Link data-index="02" to={href("/produto", lang)} {...hover} onClick={openProducts} aria-haspopup="true" aria-expanded={dropOpen}
            onFocus={() => setDropOpen(true)}>
            {t.products} <i className="nav-drop__caret" aria-hidden="true" />
          </Link>
          <div className="nav-drop__panel" role="group" aria-label={t.products}>
            {products.map((item) => (
              <Link key={item.to} to={href(item.to, lang)} onClick={close}>
                <strong>{item.label}</strong>
                <small>{item.note}</small>
              </Link>
            ))}
          </div>
        </div>
        ) : (
          <Link data-index="02" to={href("/produto", lang)} {...hover} onClick={openProducts}>{t.products}</Link>
        )}
        <a data-index="03" href={DIALOGI_URL} target="_blank" rel="noreferrer" {...hover} onClick={close}>{t.dialogi}</a>
        <div
          className={companyOpen ? "nav-drop nav-drop--open" : "nav-drop"}
          onMouseEnter={() => setCompanyOpen(true)}
          onMouseLeave={() => setCompanyOpen(false)}
        >
          <Link data-index="04" to={href("/sobre", lang)} {...hover} onClick={close} aria-haspopup="true" aria-expanded={companyOpen}
            onFocus={() => setCompanyOpen(true)}>
            {t.company} <i className="nav-drop__caret" aria-hidden="true" />
          </Link>
          <div className="nav-drop__panel" role="group" aria-label={t.company}>
            <Link to={href("/sobre", lang)} onClick={close}>
              <strong>{t.about}</strong>
              <small>{t.aboutNote}</small>
            </Link>
          </div>
        </div>
        <Link data-index="05" to={href("/blog", lang)} {...hover} onClick={close}>{t.blog}</Link>
      </nav>
      <div className="header-actions">
        <span className="language lang-switch" aria-label="Idioma">
          {LANGS.map((l) => (
            l === lang
              ? <b key={l} aria-current="true">{l.toUpperCase()}</b>
              : <Link key={l} to={href(base, l)} hrefLang={l}>{l.toUpperCase()}</Link>
          ))}
        </span>
        <a className="pill pill--small" href={DEMO_URL} target="_blank" rel="noreferrer">
          {t.demo} <span aria-hidden="true">↗</span>
        </a>
        <button
          className={menuOpen ? "menu-toggle menu-toggle--open" : "menu-toggle"}
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? t.menuClose : t.menuOpen}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
