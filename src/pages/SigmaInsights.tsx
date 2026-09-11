import { useState } from "react";
import { PageShell, useReveal } from "../site/PageShell";
import { FeatureAccordion, TechLines, Video, Watermark, SplitText, SuiteGlow, SuiteGradient } from "../site/ui";
import { CASE_TECBAN_PDF, DEMO_URL, VIDEO, VIMEO } from "../site/site-data";
import { href, pick, rich, useLang } from "../lib/i18n";
import { Link } from "react-router-dom";
import BorderGlow from "../components/BorderGlow";
import ModuleVideoSection from "../components/ModuleVideoSection";
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
    <PageShell title={t.meta.title} description={t.meta.description} theme="suite" variant="panels">
      {/* 1. Hero: titulo, apoio e CTA (o video vem logo abaixo) */}
      <section className="sx-hero sx-hero--insights sx-dark sx-hero--live sx-subproduct-hero">
        <div className="sx-hero__aura" aria-hidden="true" />
        <TechLines variant="suite" />
        <div className="sx-shell sx-hero__inner sx-hero__inner--left">
          <div className="sx-product-hero-brand"><img src="/media/brand/sigma-insights-white.png" alt="Sigma Insights" /></div>
          <div>
            <h1 className="sx-h1" style={{ maxWidth: "22ch" }}><SplitText text={t.hero.title} /></h1>
            <p className="sx-lead">{t.hero.lead}</p>
          </div>
          <div className="sx-hero__actions">
            <a className="sx-cta sx-cta--grad sx-cta--lg" href={DEMO_URL} target="_blank" rel="noreferrer">{t.hero.cta} <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      {/* 2. Console interativo de dashboards */}
      <section className="sx-section sx-section--wm sx-subproduct-story" data-reveal>
        <Watermark side="left" />
        <div className="sx-shell">
          <div className="sx-editorial-head sx-editorial-head--center">
            <h2 className="sx-h2"><SplitText text={t.dashboards.title} /></h2>
          </div>
          <div className="sx-insights-console">
            <div className="sx-insights-console__media">
              <SuiteGlow dark radius={18}><Video src={VIDEO.dashboard} className="sx-video--bare" sound /></SuiteGlow>
            </div>
            <div className="sx-insights-console__controls">
              <FeatureAccordion items={t.dashboards.items} icons={dashboardIcons} active={activeDashboard}
                onChange={setActiveDashboard} label={t.dashboards.title} />
              <Link className="sx-cta sx-cta--outline" to={href("/blog", lang)}>{t.dashboards.cta} <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      <div className="sx-insights-story sx-subproduct-run">
        <img className="sx-insights-story__bg" src="/media/site/insights-lines.svg" alt="" aria-hidden="true" />

      {/* 4. Voz: vídeo e leitura sincronizados */}
      <section className="sx-section sx-dark sx-subproduct-stage" data-reveal>
        <TechLines variant="suite" />
        <div className="sx-shell sx-insights-split">
          <div className="sx-insights-split__media">
            <SuiteGlow radius={22}><Video src={VIDEO.designer} className="sx-video--tall sx-video--bare" /></SuiteGlow>
            <span className="sx-insights-split__marker">0{activeVoice + 1}</span>
          </div>
          <div className="sx-insights-split__content">
            <p className="sx-eyebrow">{t.voice.eyebrow}</p>
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
      <section className="sx-section sx-section--flush sx-emotions-free" data-reveal>
        <div className="sx-shell">
          <div className="sx-emotion-stage sx-subproduct-light-stage">
            <div className="sx-emotion-stage__head">
              <h2 className="sx-h2"><SplitText text={t.emotions.title} /></h2>
            </div>
            <div className="sx-emotion-stage__body">
              <div className="sx-emotion-stage__visual">
                <img src="/media/site/ssss-01.webp" alt="" loading="lazy" />
              </div>
              <div className="sx-emotion-stage__content">
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

      <ModuleVideoSection
        eyebrow={t.video.eyebrow}
        title={t.video.title}
        lead={t.hero.lead}
        vimeoId={VIMEO.insightsHero}
        videoTitle="Sigma Insights"
      />

      {/* 7. Benefícios em composição editorial assimétrica */}
      <section className="sx-section sx-section--atmosphere sx-subproduct-cases" data-reveal>
        <div className="sx-shell">
          <div className="sx-editorial-head">
            <h2 className="sx-h2"><SplitText text={t.benefits.title} /></h2>
          </div>
          <div className="sx-benefits-bento">
            <BorderGlow
              alwaysOn
              className="sx-benefits-bento__statement sx-dark"
              backgroundColor="#061c30"
              borderRadius={32}
              glowRadius={44}
              glowColor="176 100 50"
              glowIntensity={1.15}
              coneSpread={22}
              colors={["#6ee7db", "#00a9a9", "#39bce5"]}
              fillOpacity={0.22}
            >
              <span aria-hidden="true">↗</span>
              <p><SuiteGradient onDark>{t.benefits.quote}</SuiteGradient></p>
              <a className="sx-cta sx-cta--outline" href={DEMO_URL} target="_blank" rel="noreferrer">{t.benefits.cta} <span aria-hidden="true">→</span></a>
            </BorderGlow>
            {/* So os cartoes brancos ganham a moldura reativa; o bloco azul ao
                lado ja tem a dele em `alwaysOn` e fica como esta. */}
            {t.benefits.items.map((item, index) => (
              <SuiteGlow radius={20} className="sx-glow--card sx-glow--bento" key={item.title}>
                <article className="sx-benefits-bento__item sx-card--bare">
                  <span>0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              </SuiteGlow>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
