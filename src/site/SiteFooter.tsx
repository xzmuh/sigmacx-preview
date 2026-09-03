import { Link } from "react-router-dom";
import { DEMO_URL, LINKEDIN_URL, PARTNER_MAIL } from "./site-data";
import { href, pick, useLang, type Lang } from "../lib/i18n";
import ui from "../../content/ui.json";

const dict = ui as Record<Lang, typeof ui.pt>;

/** CTA final escuro com o texto da referencia (fica entre a emenda e o footer). */
export function FinalCta() {
  const t = pick(dict, useLang()).cta;
  return (
    <section className="sx-final">
      <div className="sx-final__glow" aria-hidden="true" />
      <div className="sx-shell sx-final__inner">
        <h2>{t.title}</h2>
        <a className="sx-cta sx-cta--outline sx-cta--lg" href={DEMO_URL} target="_blank" rel="noreferrer">
          {t.button} <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}

/**
 * O footer da home, identico (mesmo markup e classes .footer* de globals.css),
 * incluindo a ponte .footer-bridge que faz a transicao suave ate ele.
 * Links adaptados para as rotas do site e rotulos por idioma.
 */
export function SiteFooter() {
  const lang = useLang();
  const t = pick(dict, lang).footer;
  return (
    <>
      <div className="footer-bridge" aria-hidden="true" />
      <footer className="footer">
        <div className="footer-atmosphere" aria-hidden="true">
          <span className="footer-orbit footer-orbit--outer" />
          <span className="footer-orbit footer-orbit--inner" />
          <span className="footer-scan" />
        </div>

        <div className="footer-top">
          <div className="footer-manifesto">
            <div className="footer-identity">
              <img src="/media/logo-white.png" alt="SigmaCX" />
            </div>
            <h2>{t.headline1}<br /><em>{t.headline2}</em></h2>
            <p>{t.manifesto}</p>
            <a className="footer-contact" href={PARTNER_MAIL}>
              <span className="footer-contact__icon" aria-hidden="true">@</span>
              <span><small>{t.channel}</small><strong>canais@nuveto.com.br</strong></span>
              <b aria-hidden="true">↗</b>
            </a>
          </div>

          <nav className="footer-links" aria-label="Navegação do rodapé">
            <div>
              <span>{t.platform}</span>
              <Link to={href("/produto", lang)}>Sigma Suite</Link>
              <Link to={href("/sigma-channel", lang)}>Sigma Channel</Link>
              <Link to={href("/sigma-brain", lang)}>Sigma Brain</Link>
              <Link to={href("/sigma-insights", lang)}>Sigma Insights</Link>
            </div>
            <div>
              <span>{t.connections}</span>
              <a href={DEMO_URL} target="_blank" rel="noreferrer">{t.demo}</a>
              <a href={PARTNER_MAIL}>{t.partner}</a>
              <Link to={href("/sobre", lang)}>{t.about}</Link>
              <Link to={href("/blog", lang)}>{t.blog}</Link>
              <Link to={href("/politica-de-privacidade", lang)}>{t.privacy}</Link>
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">{t.linkedin}</a>
            </div>
          </nav>

          <a className="footer-launch" href={DEMO_URL} target="_blank" rel="noreferrer">
            <span className="footer-launch__label">{t.launchLabel}</span>
            <strong>{t.launch1}<br />{t.launch2}<br />{t.launch3}</strong>
            <span className="footer-launch__copy">{t.launchCopy}</span>
            <span className="footer-launch__button">{t.launchButton} <b>↗</b></span>
          </a>
        </div>

        <div className="footer-wordmark" aria-hidden="true">
          <span>SigmaCX</span>
          <small>{t.wordmark}</small>
        </div>

        <div className="footer-bottom">
          <span>{t.place} <i>UTC −03:00</i></span>
          <span>{t.rights}</span>
          <span>{t.tagline1} <b>{t.tagline2}</b></span>
        </div>
      </footer>
    </>
  );
}
