import { PageShell, useReveal } from "../site/PageShell";
import { Vimeo } from "../site/ui";
import { LINKEDIN_URL, VIMEO } from "../site/site-data";
import { pick, useLang } from "../lib/i18n";
import pt from "../../content/pages/sobre.pt.json";
import en from "../../content/pages/sobre.en.json";
import es from "../../content/pages/sobre.es.json";
import "../site/sobre.css";

const timelineLogos = ["SigmaChannel-Default.png", "SigmaInsights-Default.png", "DIALOGI-08.png", "SigmaBrain-Default.png"];
const team = [
  { photo: "1566506294844.webp", href: "https://www.linkedin.com/in/murillomelo/" },
  { photo: "Design-sem-nome.webp", href: LINKEDIN_URL },
];

const labels = {
  pt: { title: ["SOBRE", "NÓS"], about: "Sobre a SigmaCX", philosophy: "Nossa filosofia", leaders: ["CONHEÇA A", "LIDERANÇA"], leadership: "Liderança", beliefs: "No que acreditamos", history: "Nossa história", watch: "Assista à nossa história", linkedin: "SigmaCX no LinkedIn", heroAlt: "Pessoa interagindo com tecnologia", peopleAlt: "Pessoas conectadas" },
  en: { title: ["ABOUT", "US"], about: "About SigmaCX", philosophy: "Our philosophy", leaders: ["MEET OUR", "LEADERS"], leadership: "Leadership", beliefs: "What we believe", history: "Our history", watch: "Watch our story", linkedin: "SigmaCX on LinkedIn", heroAlt: "Person interacting with technology", peopleAlt: "Connected people" },
  es: { title: ["SOBRE", "NOSOTROS"], about: "Sobre SigmaCX", philosophy: "Nuestra filosofía", leaders: ["CONOZCA EL", "LIDERAZGO"], leadership: "Liderazgo", beliefs: "En qué creemos", history: "Nuestra historia", watch: "Vea nuestra historia", linkedin: "SigmaCX en LinkedIn", heroAlt: "Persona interactuando con tecnología", peopleAlt: "Personas conectadas" },
};

export default function Sobre() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);
  const l = pick(labels, lang);
  const beliefs = [...t.beliefs.items, ...t.beliefs.plain];

  return (
    <PageShell title={t.meta.title} description={t.meta.description}>
      <div className="ab-page">
        <section className="ab-hero">
          <img className="ab-hero__mark" src="/media/site/SigmaIcone-Normal2x.png" alt="" aria-hidden="true" />
          <div className="sx-shell ab-hero__layout">
            <header className="ab-hero__title">
              <h1><span>{l.title[0]}</span><span>{l.title[1]}</span></h1>
              <p className="ab-label">{l.about}</p>
              <p className="ab-hero__intro">{t.hero.title}</p>
            </header>

            <figure className="ab-hero__image ab-image">
              <img src="/media/site/2151561973.webp" alt={l.peopleAlt} fetchPriority="high" decoding="async" />
            </figure>

            <aside className="ab-hero__philosophy">
              <figure className="ab-image"><img src="/media/site/sobre-hero.webp" alt={l.heroAlt} /></figure>
              <h2>{l.philosophy}</h2>
              <p>{t.manifesto}</p>
            </aside>
          </div>
        </section>

        <section id="lideranca" className="ab-leadership" data-reveal>
          <div className="sx-shell">
            <div className="ab-leadership__panel">
              <article className="ab-leader ab-leader--first">
                <a href={team[0].href} target="_blank" rel="noreferrer"><img src={`/media/site/${team[0].photo}`} alt={t.team.members[0].name} /></a>
              </article>

              <div className="ab-leadership__center">
                <h2><span>{l.leaders[0]}</span><span>{l.leaders[1]}</span></h2>
                <p>{t.history.continues}</p>
              </div>

              <article className="ab-leader ab-leader--second">
                <a href={team[1].href} target="_blank" rel="noreferrer"><img src={`/media/site/${team[1].photo}`} alt={t.team.members[1].name} /></a>
              </article>
            </div>

            <div className="ab-leadership__names">
              <div>
                <h3>{t.team.members[0].name}</h3><p>{t.team.members[0].role}</p>
              </div>
              <div>
                <h3>{t.team.members[1].name}</h3><p>{t.team.members[1].role}</p>
              </div>
            </div>

            <div className="ab-leadership__bios">
              {t.team.members.map((person, index) => (
                <article key={person.name}>
                  <p>{person.bio}</p>
                  <a href={team[index].href} target="_blank" rel="noreferrer">{person.cta} <span aria-hidden="true">↗</span></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ab-beliefs" data-reveal>
          <div className="sx-shell ab-beliefs__layout">
            <div className="ab-beliefs__intro">
              <p className="ab-label">SigmaCX</p>
              <h2>{l.beliefs}</h2>
              <p>{t.beliefs.items[0].body}</p>
              <figure className="ab-image"><img src="/media/site/126854.webp" alt="" loading="lazy" /></figure>
            </div>

            <div className="ab-beliefs__list">
              {beliefs.map((item, index) => (
                <article className="ab-belief" key={item.title}>
                  <span>0{index + 1}</span>
                  <div><h3>{item.title}</h3><p>{item.body}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ab-history" data-reveal>
          <div className="sx-shell">
            <header className="ab-history__head">
              <div><p className="ab-label">2020 — 2024</p><h2>{l.history}</h2></div>
              <p>{t.history.intro}</p>
            </header>

            <div className="ab-history__origin">
              <strong>2020</strong><p>{t.history.band2020}</p>
            </div>

            <div className="ab-history__timeline">
              {t.history.timeline.map((item, index) => (
                <article key={`${item.year}-${index}`}>
                  <div><span>{item.year}</span><img src={`/media/site/${timelineLogos[index]}`} alt="" loading="lazy" /></div>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>

            <div className="ab-history__video">
              <p className="ab-label">{l.watch}</p>
              <Vimeo id={VIMEO.sobreHistoria} className="sx-video--dark" title="História da SigmaCX" />
            </div>

            <a className="ab-link" href={LINKEDIN_URL} target="_blank" rel="noreferrer">{l.linkedin} <span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
