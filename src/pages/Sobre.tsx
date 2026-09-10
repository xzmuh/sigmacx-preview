import { useEffect, useRef, useState } from "react";
import { PageShell, useReveal } from "../site/PageShell";
import { Vimeo } from "../site/ui";
import BorderGlow from "../components/BorderGlow";
import GradientText from "../components/GradientText";
import { SectionTransition } from "../site/SectionTransition";
import { LINKEDIN_URL, VIMEO } from "../site/site-data";
import { pick, useLang } from "../lib/i18n";
import pt from "../../content/pages/sobre.pt.json";
import en from "../../content/pages/sobre.en.json";
import es from "../../content/pages/sobre.es.json";
import "../site/sobre.css";
import "../site/sobreRefined.css";

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
    leadersLead: "Experiência em tecnologia e operações. Uma visão compartilhada: aproximar empresas e pessoas.",
    scrollHint: "Role para baixo para avançar",
    scrollDetail: "A linha do tempo se move para os lados",
    swipeHint: "Deslize para os lados para explorar",
    scrollEnd: "Continue rolando para ver nossa história em vídeo",
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
    leadersLead: "Experience in technology and operations. A shared vision: bringing businesses and people closer.",
    scrollHint: "Scroll down to move forward",
    scrollDetail: "The timeline moves sideways as you scroll",
    swipeHint: "Swipe sideways to explore",
    scrollEnd: "Keep scrolling to watch our story",
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
    leadersLead: "Experiencia en tecnología y operaciones. Una visión compartida: acercar empresas y personas.",
    scrollHint: "Desplácese hacia abajo para avanzar",
    scrollDetail: "La línea de tiempo se mueve hacia los lados",
    swipeHint: "Deslice hacia los lados para explorar",
    scrollEnd: "Siga bajando para ver nuestra historia en video",
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

    const viewport = timeline.querySelector<HTMLDivElement>(".ab-timeline__viewport")!;
    const sticky = timeline.querySelector<HTMLDivElement>(".ab-timeline__sticky")!;
    const track = timeline.querySelector<HTMLDivElement>(".ab-timeline__items")!;
    const items = Array.from(track.querySelectorAll<HTMLElement>(".ab-timeline__item"));
    const fallback = window.matchMedia("(max-width: 760px), (max-height: 600px), (prefers-reduced-motion: reduce)");
    let frame = 0;
    let distance = 0;
    let offsets: number[] = [];
    const update = () => {
      frame = 0;
      const top = parseFloat(getComputedStyle(sticky).top) || 0;
      const travel = Math.max(1, timeline.offsetHeight - sticky.offsetHeight);
      const progress = fallback.matches
        ? Math.min(1, Math.max(0, viewport.scrollLeft / Math.max(1, distance)))
        : Math.min(1, Math.max(0, (top - timeline.getBoundingClientRect().top) / travel));
      const shift = Math.min(distance, Math.max(0, progress * distance));
      timeline.classList.toggle("has-progress", shift > 12);
      timeline.style.setProperty("--ab-progress", String(progress));
      timeline.style.setProperty("--ab-shift", `${fallback.matches ? 0 : -shift}px`);
      let active = 0;
      offsets.forEach((offset, index) => {
        if (shift >= offset - 1) active = index;
      });
      setActiveMilestone(active);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      offsets = items.map((item) => item.offsetLeft - items[0].offsetLeft);
      distance = offsets.at(-1) || 0;
      if (!fallback.matches) viewport.scrollLeft = 0;
      timeline.style.setProperty("--ab-travel", `${distance}px`);
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    viewport.addEventListener("scroll", schedule, { passive: true });
    fallback.addEventListener("change", measure);
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      viewport.removeEventListener("scroll", schedule);
      fallback.removeEventListener("change", measure);
    };
  }, [milestones.length, lang]);

  return (
    <PageShell title={t.meta.title} description={t.meta.description}>
      <div className="ab-page ab-refined">
        <section className="ab-hero">
          <div className="ab-hero__media" aria-hidden="true">
            <img src="/media/site/sobre-hero.webp" alt="" fetchPriority="high" />
          </div>
          <div className="ab-hero__field" aria-hidden="true"><i /><i /><i /></div>
          <div className="sx-shell ab-hero__content">
            <p className="ab-kicker">{l.about}</p>
            <h1><span>{l.title[0]}</span><GradientText className="ab-hero__gradient" colors={["#5da6ff", "#b9ff9b", "#00a9a9"]} animationSpeed={6}>{l.title[1]}</GradientText></h1>
            <p className="ab-hero__statement">{t.hero.title}</p>
            <a className="pill pill--primary ab-hero__cta" href="#historia">{l.history} <span aria-hidden="true">↓</span></a>
          </div>
          <div className="sx-shell ab-hero__metrics" data-reveal>
            <div><strong>2020</strong><span>{l.since}</span></div>
            <div><strong>04</strong><span>{l.ecosystem}</span></div>
            <div><strong>01</strong><span>{l.purpose} <b>{l.purposeValue}</b></span></div>
          </div>
        </section>

        <SectionTransition to="light" />

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
              <p>{l.leadersLead}</p>
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

        <section className="ab-history" id="historia">
          <div className="ab-history__timeline-band">
            <div className="sx-shell ab-history__intro">
              <header className="ab-history__head" data-reveal>
                <div><p className="ab-kicker">2020 — 2024</p><h2>{l.history}</h2></div>
                <p>{t.history.intro}</p>
              </header>
            </div>
            <div className="sx-shell">
            <div
              ref={timelineRef}
              className="ab-timeline"
              aria-label={l.timelineLabel}
            >
              <div className="ab-timeline__sticky">
                <div className="ab-timeline__status">
                  <div className="ab-timeline__hint">
                    <span className="ab-timeline__hint-icon" aria-hidden="true">
                      <svg viewBox="0 0 28 40" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 8 8 7 8-7" />
                        <path d="m6 17 8 7 8-7" />
                        <path d="m6 26 8 7 8-7" />
                      </svg>
                    </span>
                    <div>
                      <strong className="ab-timeline__hint-desktop">{l.scrollHint}</strong>
                      <small className="ab-timeline__hint-desktop">{l.scrollDetail}</small>
                      <strong className="ab-timeline__hint-touch">{l.swipeHint}</strong>
                    </div>
                  </div>
                  <span>{String(activeMilestone + 1).padStart(2, "0")} / {String(milestones.length).padStart(2, "0")}</span>
                </div>
                <div className="ab-timeline__viewport" tabIndex={0} role="region" aria-label={l.timelineLabel}>
                  <div className="ab-timeline__rule" aria-hidden="true">
                    <span className="ab-timeline__fill" />
                    <div className="ab-timeline__nodes">
                      {milestones.map((item, index) => <b key={`${item.year}-${index}`} className={`${index <= activeMilestone ? "is-hit" : ""}${index === activeMilestone ? " is-current" : ""}`} style={{ left: `${index / (milestones.length - 1) * 100}%` }} />)}
                    </div>
                    <span className="ab-timeline__pulse" />
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

          <div className="sx-shell ab-history__after">
            <div className="ab-history__video">
              <header className="ab-history__video-head">
                <h2>{l.watch}</h2>
                <a className="ab-link" href={LINKEDIN_URL} target="_blank" rel="noreferrer">{l.linkedin} <span aria-hidden="true">↗</span></a>
              </header>
              <Vimeo id={VIMEO.sobreHistoria} className="sx-video--dark" title={l.watch} />
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
