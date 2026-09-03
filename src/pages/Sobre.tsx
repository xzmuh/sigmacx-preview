import { PageShell, useReveal } from "../site/PageShell";
import { SectionTransition } from "../site/SectionTransition";
import {BandVideo, Carousel, Icon, Vimeo, SplitText } from "../site/ui";
import { BG, LINKEDIN_URL, VIDEO, VIMEO } from "../site/site-data";
import { pick, rich, useLang } from "../lib/i18n";
import pt from "../../content/pages/sobre.pt.json";
import en from "../../content/pages/sobre.en.json";
import es from "../../content/pages/sobre.es.json";

const beliefImages = ["2151561973.webp", "126854.webp", null];
const plainIcons = ["target", "users"];
const timelineLogos = ["SigmaChannel-Default.png", "SigmaInsights-Default.png", "DIALOGI-08.png", "SigmaBrain-Default.png"];
const team = [
  { photo: "1566506294844.webp", href: "https://www.linkedin.com/in/murillomelo/" },
  // O site de origem nao traz link para o Evaristo; usa o LinkedIn da empresa ate termos o perfil.
  { photo: "Design-sem-nome.webp", href: LINKEDIN_URL },
];

export default function Sobre() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);

  return (
    <PageShell title={t.meta.title} description={t.meta.description}>
      {/* 1. Hero com foto */}
      <section className="sx-hero sx-hero--photo sx-dark">
        <img className="sx-hero__bg" src={BG.sobreHero} alt="" aria-hidden="true" style={{ opacity: 1 }} fetchPriority="high" decoding="async" width={1536} height={1024} />
        <div className="sx-hero__aura" aria-hidden="true" />
        <div className="sx-shell sx-hero__inner sx-hero__inner--left">
          <h1 className="sx-h1" style={{ maxWidth: "24ch", fontSize: "clamp(1.8rem, 3.4vw, 2.6rem)" }}><SplitText text={t.hero.title} /></h1>
        </div>
      </section>

      <SectionTransition to="light" />

      {/* 2. No que acreditamos */}
      <section className="sx-section" data-reveal>
        <div className="sx-shell sx-stack">
          <h2 className="sx-h2" style={{ fontWeight: 600 }}><SplitText text={t.beliefs.title} /></h2>
          <div className="sx-grid sx-grid--3">
            {t.beliefs.items.map((item, i) => (
              <article className={`sx-card ${beliefImages[i] ? "sx-card--photo" : "sx-card--navy sx-card--photo"}`} key={item.title}>
                {beliefImages[i] ? <img src={`/media/site/${beliefImages[i]}`} alt="" loading="lazy" /> : null}
                <div className="sx-card__body"><h3 className="sx-h3">{item.title}</h3><p>{item.body}</p></div>
              </article>
            ))}
          </div>
          <div className="sx-grid sx-grid--2">
            {t.beliefs.plain.map((item, i) => (
              <div className="sx-item" key={item.title}>
                <Icon name={plainIcons[i]} />
                <div><h3>{item.title}</h3><p>{item.body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Bloco com video de fundo: principios */}
      <section className="sx-section sx-section--flush" data-reveal>
        <div className="sx-shell">
          <div className="sx-block sx-dark sx-band" style={{ padding: "clamp(32px, 4vw, 56px)" }}>
            <img className="sx-band__bg" src="/media/site/home-1.webp" alt="" aria-hidden="true" />
            <BandVideo src={VIDEO.people} opacity={0.35} />
            <div className="sx-grid sx-grid--3" style={{ position: "relative" }}>
              {t.principles.map((item) => (
                <article className="sx-card sx-card--glass" key={item.title}><h3 className="sx-h3">{item.title}</h3><p>{item.body}</p></article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Manifesto */}
      <section className="sx-section sx-section--tight" data-reveal>
        <div className="sx-shell sx-quote" style={{ maxWidth: 900 }}><p>{t.manifesto}</p></div>
      </section>

      {/* 5. Video da historia */}
      <section className="sx-section sx-section--tight" data-reveal>
        <div className="sx-shell"><Vimeo id={VIMEO.sobreHistoria} className="sx-video--dark" title="SigmaCX" /></div>
      </section>

      {/* 6. Timeline */}
      <section className="sx-section" data-reveal>
        <div className="sx-shell sx-stack">
          <p className="sx-lead" style={{ margin: 0, maxWidth: "none" }}>{t.history.intro}</p>
          <div className="sx-timeline">
            <Carousel label="Timeline">
              {t.history.timeline.map((item, index) => (
                <article className="sx-card sx-timeline__item" key={index}>
                  <span className="sx-timeline__year">{item.year}</span>
                  <img className="sx-timeline__logo" src={`/media/site/${timelineLogos[index]}`} alt="" loading="lazy" />
                  <p>{item.body}</p>
                </article>
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      <SectionTransition to="dark" />

      {/* 7. Faixa 2020 */}
      <section className="sx-band sx-dark sx-band-2020" data-reveal>
        <div className="sx-shell sx-feature" style={{ alignItems: "start" }}>
          <p className="sx-year-big">2020</p>
          <article className="sx-card"><p>{t.history.band2020}</p></article>
        </div>
      </section>

      <SectionTransition to="light" />

      {/* 8. Equipe */}
      <section className="sx-section" data-reveal>
        <div className="sx-shell sx-stack">
          <p className="sx-lead" style={{ margin: 0, maxWidth: "none" }}>{t.history.continues}</p>
          <h2 className="sx-h2" style={{ fontWeight: 600 }}><SplitText text={t.team.title} /></h2>
          <div className="sx-grid sx-grid--2">
            {t.team.members.map((person, i) => (
              <article className="sx-card sx-person" key={person.name}>
                <img className="sx-person__photo" src={`/media/site/${team[i].photo}`} alt={person.name} loading="lazy" />
                <div>
                  <h3 className="sx-h3">{person.name}</h3>
                  <p className="sx-person__role">{person.role}</p>
                  <p>{person.bio}</p>
                  <p style={{ marginTop: 16 }}>
                    <a className="sx-cta sx-cta--outline sx-cta--sm" href={team[i].href} target="_blank" rel="noreferrer">{person.cta} <span aria-hidden="true">→</span></a>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
