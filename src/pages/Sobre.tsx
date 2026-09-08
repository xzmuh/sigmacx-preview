import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PageShell, useReveal } from "../site/PageShell";
import { SectionTransition } from "../site/SectionTransition";
import { Vimeo } from "../site/ui";
import BorderGlow from "../components/BorderGlow";
import GradientText from "../components/GradientText";
import { LINKEDIN_URL, VIMEO } from "../site/site-data";
import { pick, useLang } from "../lib/i18n";
import pt from "../../content/pages/sobre.pt.json";
import en from "../../content/pages/sobre.en.json";
import es from "../../content/pages/sobre.es.json";
import "../site/sobre.css";

const HOME_GRADIENT = ["#b9ff9b", "#5da6ff", "#00a9a9", "#b9ff9b"];
const timelineLogos = [
  "SigmaIcone-Normal2x.png",
  "SigmaChannel-Default.png",
  "SigmaInsights-Default.png",
  "DIALOGI-08.png",
  "SigmaBrain-Default.png",
];
const team = [
  { photo: "1566506294844.webp", href: "https://www.linkedin.com/in/murillomelo/" },
  { photo: "Design-sem-nome.webp", href: LINKEDIN_URL },
];

const labels = {
  pt: {
    title: ["SOBRE", "NÓS"], about: "Sobre a SigmaCX", philosophy: "Nossa filosofia",
    leaders: "Quem transforma visão em movimento", leadership: "Liderança",
    beliefs: "O que nos move", beliefsLead: "Cinco princípios conectam tudo o que pensamos, criamos e entregamos.",
    history: "Uma história em constante movimento", watch: "Assista à nossa história",
    linkedin: "Acompanhe a SigmaCX no LinkedIn", since: "Nossa origem", ecosystem: "Produtos conectados",
    purpose: "Um propósito", purposeValue: "aproximar", manifestoTitle: "Tecnologia só importa quando aproxima.",
    timelineLabel: "Linha do tempo da SigmaCX",
    peopleAlt: "Pessoas conectadas",
  },
  en: {
    title: ["ABOUT", "US"], about: "About SigmaCX", philosophy: "Our philosophy",
    leaders: "The people turning vision into motion", leadership: "Leadership",
    beliefs: "What moves us", beliefsLead: "Five principles connect everything we think, create and deliver.",
    history: "A story in constant motion", watch: "Watch our story",
    linkedin: "Follow SigmaCX on LinkedIn", since: "Our origin", ecosystem: "Connected products",
    purpose: "One purpose", purposeValue: "bring closer", manifestoTitle: "Technology only matters when it brings people closer.",
    timelineLabel: "SigmaCX timeline",
    peopleAlt: "Connected people",
  },
  es: {
    title: ["SOBRE", "NOSOTROS"], about: "Sobre SigmaCX", philosophy: "Nuestra filosofía",
    leaders: "Quienes convierten visión en movimiento", leadership: "Liderazgo",
    beliefs: "Lo que nos mueve", beliefsLead: "Cinco principios conectan todo lo que pensamos, creamos y entregamos.",
    history: "Una historia en constante movimiento", watch: "Vea nuestra historia",
    linkedin: "Siga a SigmaCX en LinkedIn", since: "Nuestro origen", ecosystem: "Productos conectados",
    purpose: "Un propósito", purposeValue: "acercar", manifestoTitle: "La tecnología solo importa cuando acerca a las personas.",
    timelineLabel: "Línea de tiempo de SigmaCX",
    peopleAlt: "Personas conectadas",
  },
};

export default function Sobre() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);
  const l = pick(labels, lang);
  const beliefs = [...t.beliefs.items, ...t.beliefs.plain];
  const milestones = [
    { year: "2020", body: t.history.band2020, logo: timelineLogos[0] },
    ...t.history.timeline.map((item, index) => ({ ...item, logo: timelineLogos[index + 1] })),
  ];
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeMilestone, setActiveMilestone] = useState(0);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      if (mobile) {
        timeline.style.setProperty("--ab-shift", "0px");
        timeline.style.setProperty("--ab-progress", "0");
        return;
      }

      const rect = timeline.getBoundingClientRect();
      const pinTop = 66;
      const distance = Math.max(timeline.offsetHeight - window.innerHeight + pinTop, 1);
      const progress = Math.min(1, Math.max(0, (pinTop - rect.top) / distance));
      const viewport = timeline.querySelector<HTMLElement>(".ab-timeline__viewport");
      const track = timeline.querySelector<HTMLElement>(".ab-timeline__items");
      const shift = Math.max(0, (track?.scrollWidth ?? 0) - (viewport?.clientWidth ?? 0));

      timeline.style.setProperty("--ab-progress", progress.toFixed(4));
      timeline.style.setProperty("--ab-shift", `${(-shift * progress).toFixed(2)}px`);
      setActiveMilestone(Math.min(milestones.length - 1, Math.floor(progress * (milestones.length - 1) + .001)));
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const resizeObserver = new ResizeObserver(requestUpdate);
    resizeObserver.observe(timeline);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [milestones.length]);

  return (
    <PageShell title={t.meta.title} description={t.meta.description}>
      <div className="ab-page">
        <section className="ab-hero">
          <div className="ab-hero__media" aria-hidden="true">
            <img src="/media/site/sobre-hero.webp" alt="" fetchPriority="high" />
          </div>
          <div className="ab-hero__field" aria-hidden="true"><i /><i /><i /></div>
          <div className="sx-shell ab-hero__content">
            <p className="ab-kicker">{l.about}</p>
            <h1>
              <span>{l.title[0]}</span>
              <GradientText className="ab-hero__gradient" colors={HOME_GRADIENT} animationSpeed={7}>{l.title[1]}</GradientText>
            </h1>
            <p className="ab-hero__statement">{t.hero.title}</p>
          </div>
          <div className="sx-shell ab-hero__metrics" data-reveal>
            <div><strong>2020</strong><span>{l.since}</span></div>
            <div><strong>04</strong><span>{l.ecosystem}</span></div>
            <div><strong>01</strong><span>{l.purpose}<b>{l.purposeValue}</b></span></div>
          </div>
        </section>

        <div className="ab-seam" aria-hidden="true"><span /><span /></div>

        <section className="ab-beliefs" data-reveal>
          <div className="sx-shell">
            <header className="ab-section-head ab-section-head--center">
              <p className="ab-kicker">SigmaCX / {l.philosophy}</p>
              <h2>{l.beliefs}</h2>
              <p>{l.beliefsLead}</p>
            </header>
            <div className="ab-beliefs__stage">
              <figure className="ab-beliefs__portrait">
                <img src="/media/site/2151561973.webp" alt={l.peopleAlt} loading="lazy" />
                <span className="ab-beliefs__orbit" aria-hidden="true" />
              </figure>
              {beliefs.map((item, index) => (
                <article className={`ab-belief${index === beliefs.length - 1 ? " ab-belief--wide" : ""}`} key={item.title}>
                  <span className="ab-belief__node"><b>{String(index + 1).padStart(2, "0")}</b></span>
                  <div><h3>{item.title}</h3><p>{item.body}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ab-manifesto" data-reveal>
          <div className="sx-shell">
            <BorderGlow
              alwaysOn className="ab-manifesto__glow" backgroundColor="#071329" borderRadius={38}
              glowRadius={32} glowColor="174 88 58" glowIntensity={0.72} coneSpread={16}
              colors={["#b9ff9b", "#00a9a9", "#5da6ff"]} fillOpacity={0.1}
            >
              <div className="ab-manifesto__panel">
                <div className="ab-manifesto__copy">
                  <p className="ab-kicker">{l.philosophy}</p>
                  <h2>{l.manifestoTitle}</h2>
                  <blockquote>{t.manifesto}</blockquote>
                </div>
                <figure className="ab-manifesto__visual">
                  <img src="/media/site/126854.webp" alt="" loading="lazy" />
                  <div className="ab-manifesto__rings" aria-hidden="true"><i /><i /><i /></div>
                </figure>
              </div>
            </BorderGlow>
          </div>
        </section>

        <section id="lideranca" className="ab-leadership" data-reveal>
          <div className="sx-shell">
            <header className="ab-section-head">
              <div><p className="ab-kicker">{l.leadership}</p><h2>{l.leaders}</h2></div>
              <p>{t.history.continues}</p>
            </header>
            <div className="ab-leadership__grid">
              {t.team.members.map((person, index) => (
                <article className={`ab-leader${index === 1 ? " ab-leader--reverse" : ""}`} key={person.name}>
                  <a className="ab-leader__portrait" href={team[index].href} target="_blank" rel="noreferrer">
                    <img src={`/media/site/${team[index].photo}`} alt={person.name} loading="lazy" />
                    <span aria-hidden="true">↗</span>
                  </a>
                  <div className="ab-leader__copy">
                    <span>{person.role}</span>
                    <h3>{person.name}</h3>
                    <p>{person.bio}</p>
                    <a href={team[index].href} target="_blank" rel="noreferrer">{person.cta} <span aria-hidden="true">↗</span></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ab-history">
          <div className="sx-shell">
            <header className="ab-history__head" data-reveal>
              <div><p className="ab-kicker">2020 — 2024</p><h2>{l.history}</h2></div>
              <p>{t.history.intro}</p>
            </header>
          </div>

          <SectionTransition to="dark" />

          <div className="ab-history__timeline-band">
            <div className="sx-shell">
            <div
              ref={timelineRef}
              className="ab-timeline"
              aria-label={l.timelineLabel}
              style={{ "--ab-steps": milestones.length } as CSSProperties}
            >
              <div className="ab-timeline__sticky">
                <div className="ab-timeline__viewport">
                  <div className="ab-timeline__rule" aria-hidden="true">
                    <span className="ab-timeline__fill" />
                    <span className="ab-timeline__nodes">
                      {milestones.map((item, index) => (
                        <b
                          className={`${index <= activeMilestone ? "is-hit" : ""}${index === activeMilestone ? " is-current" : ""}`}
                          style={{ left: `${(index / (milestones.length - 1)) * 100}%` }}
                          key={`${item.year}-node-${index}`}
                        />
                      ))}
                    </span>
                    <i className="ab-timeline__pulse" />
                  </div>
                  <div className="ab-timeline__items">
                    {milestones.map((item, index) => (
                      <article
                        className={`ab-timeline__item${index === activeMilestone ? " is-active" : ""}`}
                        key={`${item.year}-${index}`}
                      >
                        <time>{item.year}</time>
                        <div className="ab-timeline__body">
                          <img src={`/media/site/${item.logo}`} alt="" />
                          <p>{item.body}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          <SectionTransition to="light" />

          <div className="sx-shell ab-history__after">
            <div className="ab-history__video">
              <div><p className="ab-kicker">{l.watch}</p><a className="ab-link" href={LINKEDIN_URL} target="_blank" rel="noreferrer">{l.linkedin} <span aria-hidden="true">↗</span></a></div>
              <Vimeo id={VIMEO.sobreHistoria} className="sx-video--dark" title={l.watch} />
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
