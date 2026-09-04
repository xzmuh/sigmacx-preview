import { useState } from "react";
import { PageShell, useReveal } from "../site/PageShell";
import { SectionTransition } from "../site/SectionTransition";
import { FeatureAccordion, Icon, Video, Vimeo, Watermark, SplitText, SuiteGlow, SuiteGradient, TechLines } from "../site/ui";
import { BOT_VS_AGENT_URL, DEMO_URL, VIDEO, VIMEO } from "../site/site-data";
import { pick, rich, useLang } from "../lib/i18n";
import pt from "../../content/pages/sigma-brain.pt.json";
import en from "../../content/pages/sigma-brain.en.json";
import es from "../../content/pages/sigma-brain.es.json";

const pillarIcons = ["bolt", "translate", "smile"];
const tabImages = ["omni.webp", "Bot-BR.webp", "Flutuacao-BR.png"];
const configIcons = ["spark", "layers"];
const benefitIcons = ["search", "layers", "check", "target"];

export default function SigmaBrain() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);
  const [active, setActive] = useState(0);
  const [activePillar, setActivePillar] = useState(0);
  const mainBenefits = t.benefits.items.slice(0, 3);
  const lastBenefit = t.benefits.items[3];

  return (
    <PageShell title={t.meta.title} description={t.meta.description} theme="suite">
      {/* 1. Hero */}
      <section className="sx-hero sx-hero--brain sx-dark sx-hero--live">
        <div className="sx-hero__aura" aria-hidden="true" />
        <TechLines variant="brain" />
        <div className="sx-shell sx-hero__inner sx-hero__inner--left">
          <p className="sx-eyebrow">{t.hero.badge}</p>
          <div>
            <h1 className="sx-h1"><SplitText text={t.intro.title} /></h1>
            <p className="sx-lead">{t.intro.body}</p>
          </div>
          <div className="sx-hero__actions">
            <a className="sx-cta sx-cta--outline sx-cta--lg" href={DEMO_URL} target="_blank" rel="noreferrer">{t.hero.cta} <span aria-hidden="true">→</span></a>
            <a className="sx-cta sx-cta--ghost sx-cta--lg" href={BOT_VS_AGENT_URL} target="_blank" rel="noreferrer">{t.intro.cta}</a>
          </div>
        </div>
      </section>

      <SectionTransition to="light" />

      {/* 2. Video de apresentacao */}
      <section className="sx-section sx-section--tight sx-section--tint" data-reveal>
        <div className="sx-shell">
          <div className="sx-video-head"><p className="sx-eyebrow">{t.video.eyebrow}</p><h2 className="sx-h2"><SplitText text={t.video.title} /></h2></div>
          <SuiteGlow className="sx-glow--wide" animated><Vimeo id={VIMEO.brainHero} className="sx-video--dark" title="Sigma Brain" /></SuiteGlow>
        </div>
      </section>

      <SectionTransition to="dark" />

      {/* 3. Pilares: cena azul de tela inteira (cor do fundo do video), midia
          dissolvida no fundo e accordion ao lado, como a Sigma Suite no Produto */}
      <section className="sx-section sx-section--story sx-story-immersive sx-dark" data-reveal>
        <div className="sx-shell sx-story-layout">
          <div className="sx-story-media">
            <div className="sx-story-media__stage">
              <Video src={VIDEO.brain} className="sx-video--dark sx-video--bare sx-video--story" />
            </div>
            <div className="sx-story-media__meta" aria-live="polite">
              <span>0{activePillar + 1}</span>
              <p key={activePillar}>{t.pillars.items[activePillar].eyebrow}</p>
            </div>
          </div>
          <div className="sx-story-content">
            <p className="sx-eyebrow">Sigma Brain</p>
            <h2 className="sx-h2"><SplitText text={t.pillars.title} /></h2>
            <FeatureAccordion
              items={t.pillars.items}
              icons={pillarIcons}
              active={activePillar}
              onChange={setActivePillar}
              label={t.pillars.title.replace(/\*\*/g, "")}
            />
          </div>
        </div>
      </section>

      <SectionTransition to="dark" />

      {/* 4. Faixa escura: abas */}
      <section className="sx-band sx-dark sx-tech-scene" data-reveal>
        <TechLines variant="brain" />
        <div className="sx-shell sx-tabs">
          <div className="sx-tabs__buttons" role="tablist" aria-label="Sigma Brain">
            {t.tabs.map((item, index) => (
              <button key={item.label} type="button" role="tab" id={`brain-tab-${index}`} aria-selected={active === index}
                aria-controls={`brain-panel-${index}`} className={`sx-tabs__button${active === index ? " is-active" : ""}`}
                onClick={() => setActive(index)}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="sx-tabs__panel" key={active} role="tabpanel" id={`brain-panel-${active}`} aria-labelledby={`brain-tab-${active}`}>
            <h3 className="sx-h2"><SuiteGradient onDark>{t.tabs[active].body}</SuiteGradient></h3>
            <SuiteGlow radius={22} animated><img src={`/media/site/${tabImages[active]}`} alt={t.tabs[active].label} loading="lazy" /></SuiteGlow>
          </div>
        </div>
      </section>

      <SectionTransition to="light" />

      {/* 5. Autonomo e configuravel: editor de fluxo desenhado em codigo,
          seguindo o mockup de referencia (nos, conexoes teal, canais, donut) */}
      <section className="sx-section sx-section--tint sx-builder-scene" data-reveal>
        <div className="sx-shell sx-builder">
          <div className="sx-builder__copy">
            <p className="sx-eyebrow">{t.configurable.adjust}</p>
            <h2 className="sx-h2"><SplitText text={t.configurable.title} /></h2>
            <div className="sx-builder__items">
              {t.configurable.items.map((item, i) => (
                <div className="sx-builder__item" key={item.title}>
                  <span className="sx-builder__badge"><Icon name={configIcons[i]} /></span>
                  <div><h3>{item.title}</h3><p>{item.body}</p></div>
                </div>
              ))}
            </div>
            <p className="sx-builder__action">
              <a className="sx-cta sx-cta--solid" href={DEMO_URL} target="_blank" rel="noreferrer">{t.configurable.cta} <span aria-hidden="true">→</span></a>
            </p>
          </div>

          <div className="sx-builder__stage" aria-hidden="true">
            <img src="/media/site/G2-BR.webp" alt="" loading="lazy" />
          </div>
        </div>
      </section>

      {/* 6. Construa jornadas flexiveis: imagem a esquerda, texto a direita, sem moldura */}
      <section className="sx-section sx-section--atmosphere" data-reveal>
        <div className="sx-shell sx-feature sx-feature--flip">
          <div>
            <h2 className="sx-h2"><SplitText text={t.journeys.title} /></h2>
            <p className="sx-body">{t.journeys.body}</p>
          </div>
          <div className="sx-figure"><img src="/media/site/G1-BR.webp" alt="" loading="lazy" /></div>
        </div>
      </section>

      <SectionTransition to="dark" />

      {/* 7. Faixa escura: no-code */}
      <section className="sx-band sx-dark" data-reveal>
        <div className="sx-shell sx-feature">
          <div>
            <h2 className="sx-h2"><SplitText text={t.nocode.title} /></h2>
            <p className="sx-body">{t.nocode.body}</p>
            <p style={{ marginTop: 26 }}>
              <a className="sx-cta sx-cta--outline" href={DEMO_URL} target="_blank" rel="noreferrer">{t.nocode.cta} <span aria-hidden="true">→</span></a>
            </p>
          </div>
          <div className="sx-feature__media"><img src="/media/site/Sigma-Bot.webp" alt="Sigma Brain" loading="lazy" /></div>
        </div>
      </section>

      <SectionTransition to="light" />

      {/* 8. Principais beneficios */}
      <section className="sx-section sx-section--wm" data-reveal>
        <Watermark side="left" />
        <div className="sx-shell">
          <h2 className="sx-h2" style={{ marginBottom: 30 }}><SplitText text={t.benefits.title} /></h2>
          <div className="sx-grid sx-grid--3">
            {mainBenefits.map((item, i) => (
              <article className="sx-card sx-card--icon" key={item.title}>
                <h3 className="sx-h3">{item.title}</h3>
                <Icon name={benefitIcons[i]} />
                <p>{item.body}</p>
              </article>
            ))}
            {lastBenefit ? (
              <article className="sx-card sx-card--icon sx-card--wide">
                <h3 className="sx-h3">{lastBenefit.title}</h3>
                <Icon name={benefitIcons[3]} />
                <p>{lastBenefit.body}</p>
                <p style={{ marginTop: 16 }}>
                  <a className="sx-cta sx-cta--outline sx-cta--sm" href={DEMO_URL} target="_blank" rel="noreferrer">{t.benefits.cta} <span aria-hidden="true">→</span></a>
                </p>
              </article>
            ) : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
