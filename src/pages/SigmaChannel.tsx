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
      <section className="sx-hero sx-hero--channel sx-dark sx-hero--live">
        <div className="sx-hero__aura" aria-hidden="true" />
        <TechLines variant="channel" />
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

      {/* 5. Fluxos personalizaveis: passos com a linha viva (como a secao
          "Transformamos" do Produto) e a animacao solta no fundo, sem card */}
      <section className="sx-section sx-section--wm sx-flows" data-reveal>
        <Watermark side="left" />
        <div className="sx-shell">
          <h2 className="sx-h2"><SplitText text={t.flows.title} /></h2>
          <p className="sx-body">{t.flows.body}</p>
          <div className="sx-flows__grid">
            <div className="sx-flows__steps">
              <svg className="sx-flows__path" viewBox="0 0 64 900" preserveAspectRatio="none" aria-hidden="true">
                <path d="M32 0 C 58 120, 8 220, 32 360 C 54 480, 10 600, 32 740 C 50 830, 20 870, 32 900" />
              </svg>
              <ol>
                {t.flows.steps.map((step, i) => (
                  <li key={step.title}>
                    <span className="sx-flows__node"><Icon name={stepIcons[i]} /></span>
                    <div><h3>{step.title}</h3><p>{step.body}</p></div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="sx-flows__media" aria-hidden="true">
              <img src="/media/site/Fluxo.gif" alt="" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Automatize o dia a dia: badge, CTA solido e o video cercado de
          cards flutuantes de notificacao, como na referencia */}
      <section className="sx-section sx-section--atmosphere sx-automate" data-reveal>
        <div className="sx-shell sx-automate__grid">
          <div className="sx-automate__copy">
            <p className="sx-automate__badge"><Icon name="bell" /> {t.automate.badge}</p>
            <h2 className="sx-h2"><SplitText text={t.automate.title} /></h2>
            <p className="sx-body">{t.automate.body}</p>
            <p style={{ marginTop: 26 }}>
              <a className="sx-cta sx-cta--grad" href={DEMO_URL} target="_blank" rel="noreferrer">{t.automate.cta} <span aria-hidden="true">→</span></a>
            </p>
          </div>
          <div className="sx-automate__stage">
            <Video src={VIDEO.msgBR} className="sx-video--bare" sound />
          </div>
        </div>
      </section>

      {/* 7. Mais eficiencia e controle: cards conectados por linha com nos */}
      <section className="sx-section sx-results" data-reveal>
        <div className="sx-shell">
          <p className="sx-eyebrow sx-center sx-results__eyebrow">✦ {t.benefits.eyebrow}</p>
          <h2 className="sx-h2 sx-center" style={{ marginBottom: 40 }}><SplitText text={t.benefits.title} /></h2>
          <div className="sx-results__grid">
            {t.benefits.items.map((item, i) => (
              <article className="sx-result-card" key={item.title}>
                <span className="sx-result-card__blob"><Icon name={benefitIcons[i]} /></span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <i className="sx-result-card__dash" aria-hidden="true" />
                </div>
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
