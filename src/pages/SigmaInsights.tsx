import { useState } from "react";
import { PageShell, useReveal } from "../site/PageShell";
import { SectionTransition } from "../site/SectionTransition";
import { FeatureAccordion, Video, Vimeo, Watermark, SplitText, SuiteGlow, SuiteGradient } from "../site/ui";
import { CASE_TECBAN_PDF, DEMO_URL, VIDEO, VIMEO } from "../site/site-data";
import { href, pick, rich, useLang } from "../lib/i18n";
import { Link } from "react-router-dom";
import pt from "../../content/pages/sigma-insights.pt.json";
import en from "../../content/pages/sigma-insights.en.json";
import es from "../../content/pages/sigma-insights.es.json";

const voiceIcons = ["phone", "sliders"];
const patternIcons = ["search", "shield"];
const dashboardIcons = ["search", "target", "sliders"];

export default function SigmaInsights() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);
  const [activeDashboard, setActiveDashboard] = useState(0);
  const [activeVoice, setActiveVoice] = useState(0);
  const [activeEmotion, setActiveEmotion] = useState(0);

  return (
    <PageShell title={t.meta.title} description={t.meta.description} theme="suite">
      {/* 1. Hero: titulo, apoio e CTA (o video vem logo abaixo) */}
      <section className="sx-hero sx-hero--insights sx-dark">
        <div className="sx-hero__aura" aria-hidden="true" />
        <div className="sx-shell sx-hero__inner">
          <p className="sx-eyebrow">{t.hero.badge}</p>
          <div className="sx-center">
            <h1 className="sx-h1" style={{ maxWidth: "22ch", marginInline: "auto" }}><SplitText text={t.hero.title} /></h1>
            <p className="sx-lead">{t.hero.lead}</p>
          </div>
          <a className="sx-cta sx-cta--outline sx-cta--lg" href={DEMO_URL} target="_blank" rel="noreferrer">{t.hero.cta} <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <SectionTransition to="light" />

      {/* 2. Video de apresentacao */}
      <section className="sx-section sx-section--tight sx-section--tint" data-reveal>
        <div className="sx-shell">
          <div className="sx-video-head"><p className="sx-eyebrow">{t.video.eyebrow}</p><h2 className="sx-h2"><SplitText text={t.video.title} /></h2></div>
          <SuiteGlow className="sx-glow--wide" animated><Vimeo id={VIMEO.insightsHero} className="sx-video--dark" title="Sigma Insights" /></SuiteGlow>
        </div>
      </section>

      {/* 3. Console interativo de dashboards */}
      <section className="sx-section sx-section--wm" data-reveal>
        <Watermark side="left" />
        <div className="sx-shell">
          <div className="sx-editorial-head sx-editorial-head--center">
            <p className="sx-eyebrow">Sigma Insights</p>
            <h2 className="sx-h2"><SplitText text={t.dashboards.title} /></h2>
          </div>
          <div className="sx-insights-console">
            <div className="sx-insights-console__media">
              <SuiteGlow dark radius={18}><Video src={VIDEO.dashboard} className="sx-video--bare" sound /></SuiteGlow>
              <div className="sx-insights-console__status" key={activeDashboard}>
                <span aria-hidden="true" />
                <p>{t.dashboards.items[activeDashboard].title}</p>
              </div>
            </div>
            <div className="sx-insights-console__controls">
              <FeatureAccordion items={t.dashboards.items} icons={dashboardIcons} active={activeDashboard}
                onChange={setActiveDashboard} label={t.dashboards.title} />
              <Link className="sx-cta sx-cta--outline" to={href("/blog", lang)}>{t.dashboards.cta} <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      <SectionTransition to="dark" />
      <div className="sx-insights-story sx-dark">
        <img className="sx-insights-story__bg" src="/media/site/insights-lines.svg" alt="" aria-hidden="true" />

      {/* 4. Voz: vídeo e leitura sincronizados */}
      <section className="sx-section" data-reveal>
        <div className="sx-shell sx-insights-split">
          <div className="sx-insights-split__media">
            <SuiteGlow radius={22}><Video src={VIDEO.designer} className="sx-video--tall sx-video--bare" /></SuiteGlow>
            <span className="sx-insights-split__marker">0{activeVoice + 1}</span>
          </div>
          <div className="sx-insights-split__content">
            <p className="sx-eyebrow">Speech analytics</p>
            <h2 className="sx-h2"><SplitText text={t.voice.title} /></h2>
            <FeatureAccordion items={t.voice.items} icons={voiceIcons} active={activeVoice}
              onChange={setActiveVoice} label={t.voice.title} />
            <p className="sx-insights-split__action">
              <a className="sx-cta sx-cta--outline" href={DEMO_URL} target="_blank" rel="noreferrer">{t.voice.cta} <span aria-hidden="true">→</span></a>
            </p>
          </div>
        </div>
      </section>

      {/* 6. Leitura emocional imersiva */}
      <section className="sx-section sx-section--flush" data-reveal>
        <div className="sx-shell">
          <div className="sx-emotion-stage sx-dark">
            <div className="sx-emotion-stage__head">
              <p className="sx-eyebrow">Sigma Insights</p>
              <h2 className="sx-h2"><SplitText text={t.emotions.title} /></h2>
            </div>
            <div className="sx-emotion-stage__body">
              <div className="sx-emotion-stage__visual">
                <img src="/media/site/ssss-01.webp" alt="" loading="lazy" />
                <div className="sx-emotion-stage__pulse" key={activeEmotion}>
                  <span aria-hidden="true" />
                  <p>{t.emotions.items[activeEmotion].title}</p>
                </div>
              </div>
              <div>
                <FeatureAccordion items={t.emotions.items} icons={patternIcons} active={activeEmotion}
                  onChange={setActiveEmotion} label={t.emotions.title} />
                <p className="sx-emotion-stage__action">
                  <a className="sx-cta sx-cta--outline" href={CASE_TECBAN_PDF} target="_blank" rel="noreferrer">{t.emotions.cta} <span aria-hidden="true">→</span></a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      </div>
      <SectionTransition to="light" />

      {/* 7. Benefícios em composição editorial assimétrica */}
      <section className="sx-section sx-section--atmosphere" data-reveal>
        <div className="sx-shell">
          <div className="sx-editorial-head">
            <p className="sx-eyebrow">Sigma Insights</p>
            <h2 className="sx-h2"><SplitText text={t.benefits.title} /></h2>
          </div>
          <div className="sx-benefits-bento">
            <article className="sx-benefits-bento__statement sx-dark">
              <span aria-hidden="true">↗</span>
              <p><SuiteGradient onDark>{t.benefits.quote}</SuiteGradient></p>
              <a className="sx-cta sx-cta--outline" href={DEMO_URL} target="_blank" rel="noreferrer">{t.benefits.cta} <span aria-hidden="true">→</span></a>
            </article>
            {t.benefits.items.map((item, index) => (
              <article className="sx-benefits-bento__item" key={item.title}>
                <span>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
