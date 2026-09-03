import { PageShell, useReveal } from "../site/PageShell";
import { SplitText } from "../site/ui";
import { SectionTransition } from "../site/SectionTransition";
import { pick, useLang } from "../lib/i18n";
import pt from "../../content/pages/privacidade.pt.json";
import en from "../../content/pages/privacidade.en.json";
import es from "../../content/pages/privacidade.es.json";

export default function Privacidade() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);

  return (
    <PageShell title={t.meta.title} description={t.meta.description}>
      <section className="sx-hero sx-dark" style={{ paddingBottom: "clamp(40px, 5vw, 64px)" }}>
        <div className="sx-hero__aura" aria-hidden="true" />
        <div className="sx-shell sx-hero__inner">
          <h1 className="sx-h1" style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.4rem)" }}><SplitText text={t.title} /></h1>
        </div>
      </section>

      <SectionTransition to="light" />

      <section className="sx-section" data-reveal>
        <div className="sx-shell sx-prose">
          <p>{t.intro}</p>
          {t.sections.map((section) => (
            <div key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              {"list" in section && section.list ? (
                <ul>{section.list.map((li, i) => <li key={i}>{li}</li>)}</ul>
              ) : null}
              {"after" in section && section.after ? section.after.map((p, i) => <p key={`a${i}`}>{p}</p>) : null}
            </div>
          ))}
          <p><strong>{t.dpo.name}</strong></p>
          <ul>
            <li><a href={`mailto:${t.dpo.email}`}>{t.dpo.email}</a></li>
            <li><a href={`tel:${t.dpo.phone.replace(/[^+\d]/g, "")}`}>{t.dpo.phone}</a></li>
          </ul>
          <p className="sx-prose__meta">{t.updated}</p>
        </div>
      </section>
    </PageShell>
  );
}
