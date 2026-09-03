import { Link } from "react-router-dom";
import { PageShell } from "../site/PageShell";
import { SplitText } from "../site/ui";
import { SectionTransition } from "../site/SectionTransition";
import { href, pick, useLang, type Lang } from "../lib/i18n";
import ui from "../../content/ui.json";

export default function NaoEncontrado() {
  const lang = useLang();
  const t = pick(ui as Record<Lang, typeof ui.pt>, lang).notFound;

  return (
    <PageShell title={`${t.title} - Sigma CX`}>
      <section className="sx-hero sx-dark">
        <div className="sx-hero__aura" aria-hidden="true" />
        <div className="sx-shell sx-hero__inner">
          <p className="sx-eyebrow">{t.eyebrow}</p>
          <h1 className="sx-h1"><SplitText text={t.title} /></h1>
          <p className="sx-lead sx-center" style={{ margin: 0 }}>{t.body}</p>
          <div className="sx-hero__actions">
            <a className="sx-cta" href={href("/", lang)}>{t.home} <span aria-hidden="true">→</span></a>
            <Link className="sx-cta sx-cta--outline" to={href("/produto", lang)}>{t.suite}</Link>
          </div>
        </div>
      </section>
      <SectionTransition to="light" />
      <section className="sx-section" aria-hidden="true" />
    </PageShell>
  );
}
