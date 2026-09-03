import { useState } from "react";
import { PageShell, useReveal } from "../site/PageShell";
import { SectionTransition } from "../site/SectionTransition";
import { BandVideo, Carousel, Icon, Video, Vimeo, Watermark, SplitText, SuiteGlow, SuiteGradient, TechLines } from "../site/ui";
import { DEMO_URL, VIDEO, VIMEO } from "../site/site-data";
import { pick, rich, useLang } from "../lib/i18n";
import pt from "../../content/pages/sigma-channel.pt.json";
import en from "../../content/pages/sigma-channel.en.json";
import es from "../../content/pages/sigma-channel.es.json";

const tabImages = ["Dashboard-2.webp", "Criar-Fluxo-1.webp", "Sigma-Campaigns.webp"];
const stepIcons = ["list", "chat", "send", "heart", "sliders"];
const benefitIcons = ["users", "layers", "search"];
const actionImages = ["sigmaaa-01.webp", "Sigmaaaaaaaa-02.webp", "sigma-cxxx-03.webp", "sigma-cxxx-04.webp", "sigma-cxxx-05.webp", "sigma-cxxx-06.webp"];

export default function SigmaChannel() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);
  const [active, setActive] = useState(0);

  return (
    <PageShell title={t.meta.title} description={t.meta.description} theme="suite" endsLight={false}>
      {/* 1. Hero: frase de abertura como titulo, CTA (o video vem logo abaixo) */}
      <section className="sx-hero sx-hero--channel sx-dark">
        <div className="sx-hero__aura" aria-hidden="true" />
        <div className="sx-shell sx-hero__inner sx-hero__inner--left">
          <p className="sx-eyebrow">{t.hero.badge}</p>
          <h1 className="sx-h1"><SplitText text={t.opening} /></h1>
          <a className="sx-cta sx-cta--grad sx-cta--lg" href={DEMO_URL} target="_blank" rel="noreferrer">
            {t.hero.cta} <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <SectionTransition to="light" />

      {/* 2. Video de apresentacao */}
      <section className="sx-section sx-section--tight sx-section--tint" data-reveal>
        <div className="sx-shell">
          <div className="sx-video-head"><p className="sx-eyebrow">{t.video.eyebrow}</p><h2 className="sx-h2"><SplitText text={t.video.title} /></h2></div>
          <SuiteGlow className="sx-glow--wide" animated><Vimeo id={VIMEO.channelHero} className="sx-video--dark" title="Sigma Channel" /></SuiteGlow>
        </div>
      </section>

      <SectionTransition to="dark" />

      {/* 3. Faixa escura com video de fundo + 4. abas */}
      <section className="sx-band sx-dark">
        <BandVideo src={VIDEO.city} opacity={0.78} />
        <div className="sx-shell sx-center" data-reveal>
          <h2 className="sx-h2" style={{ fontWeight: 600 }}><SplitText text={t.intro.title} /></h2>
          <p className="sx-lead" style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.25rem)" }}>{t.intro.body}</p>
          <p style={{ marginTop: 26 }}>
            <a className="sx-cta sx-cta--outline" href={DEMO_URL} target="_blank" rel="noreferrer">{t.intro.cta} <span aria-hidden="true">→</span></a>
          </p>
        </div>

        <div className="sx-shell" style={{ marginTop: "clamp(56px, 7vw, 96px)" }} data-reveal>
          <div className="sx-tabs">
            <div className="sx-tabs__panel" key={active} role="tabpanel" id={`channel-panel-${active}`} aria-labelledby={`channel-tab-${active}`}>
              <h3 className="sx-h2"><SuiteGradient onDark>{t.tabs[active].body}</SuiteGradient></h3>
              <SuiteGlow radius={22} animated><img src={`/media/site/${tabImages[active]}`} alt={t.tabs[active].label} loading="lazy" /></SuiteGlow>
            </div>
            <div className="sx-tabs__buttons" role="tablist" aria-label="Sigma Channel">
              {t.tabs.map((item, index) => (
                <button key={item.label} type="button" role="tab" id={`channel-tab-${index}`} aria-selected={active === index}
                  aria-controls={`channel-panel-${index}`} className={`sx-tabs__button${active === index ? " is-active" : ""}`}
                  onClick={() => setActive(index)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionTransition to="light" />

      {/* 5. Fluxos personalizaveis: passos + gif */}
      <section className="sx-section sx-section--wm" data-reveal>
        <Watermark side="left" />
        <div className="sx-shell">
          <h2 className="sx-h2"><SplitText text={t.flows.title} /></h2>
          <p className="sx-body">{t.flows.body}</p>
          <div className="sx-feature sx-feature--framed" style={{ marginTop: 36 }}>
            <ol className="sx-steps">
              {t.flows.steps.map((step, i) => (
                <li key={step.title}>
                  <Icon name={stepIcons[i]} fill />
                  <div><h3>{step.title}</h3><p>{step.body}</p></div>
                </li>
              ))}
            </ol>
            <div className="sx-feature__media"><img src="/media/site/Fluxo.webp" alt="" loading="lazy" /></div>
          </div>
        </div>
      </section>

      {/* 6. Automatize o dia a dia: texto a esquerda, video a direita, sem moldura */}
      <section className="sx-section sx-section--atmosphere" data-reveal>
        <div className="sx-shell sx-feature">
          <div>
            <h2 className="sx-h2"><SplitText text={t.automate.title} /></h2>
            <p className="sx-body">{t.automate.body}</p>
            <p style={{ marginTop: 26 }}>
              <a className="sx-cta sx-cta--grad" href={DEMO_URL} target="_blank" rel="noreferrer">{t.automate.cta} <span aria-hidden="true">→</span></a>
            </p>
          </div>
          <SuiteGlow radius={22}><Video src={VIDEO.msgBR} className="sx-video--dark" sound /></SuiteGlow>
        </div>
      </section>

      {/* 7. Mais eficiencia e controle: 3 cards com icone */}
      <section className="sx-section" data-reveal>
        <div className="sx-shell">
          <h2 className="sx-h2 sx-center" style={{ marginBottom: 30 }}><SplitText text={t.benefits.title} /></h2>
          <div className="sx-grid sx-grid--3">
            {t.benefits.items.map((item, i) => (
              <article className="sx-card sx-card--icon" key={item.title}>
                <h3 className="sx-h3">{item.title}</h3>
                <Icon name={benefitIcons[i]} />
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionTransition to="dark" />

      {/* 8. Faixa escura: acoes inteligentes (carrossel, 2 por tela) */}
      <section className="sx-band sx-dark sx-tech-scene" data-reveal>
        <TechLines variant="channel" />
        <div className="sx-shell">
          <div className="sx-center" style={{ marginBottom: 36 }}>
            <p className="sx-eyebrow">Sigma Channel</p>
            <h2 className="sx-h2"><SplitText text={t.actions.title} /></h2>
          </div>
          <Carousel label={t.actions.title}>
            {t.actions.items.map((item, i) => (
              <article className="sx-card sx-card--media" key={item.title}>
                <div className="sx-card__media"><img src={`/media/site/${actionImages[i]}`} alt="" loading="lazy" /></div>
                <div className="sx-card__body"><h3 className="sx-h3">{item.title}</h3><p>{item.body}</p></div>
              </article>
            ))}
          </Carousel>
          <p className="sx-center" style={{ marginTop: 40 }}>
            <a className="sx-cta sx-cta--outline" href={DEMO_URL} target="_blank" rel="noreferrer">{t.actions.cta} <span aria-hidden="true">→</span></a>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
