import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, useReveal } from "../site/PageShell";
import { SectionTransition } from "../site/SectionTransition";
import { Icon, TechLines, Video, Vimeo, Watermark, SplitText, SuiteGlow, SuiteGradient } from "../site/ui";
import { CASE_TECBAN_PDF, DEMO_URL, VIDEO, VIMEO } from "../site/site-data";
import { href, pick, rich, useLang } from "../lib/i18n";
import pt from "../../content/pages/produto.pt.json";
import en from "../../content/pages/produto.en.json";
import es from "../../content/pages/produto.es.json";

const clientLogos = ["clientes-menor-08.png", "logo-footer-04.png", "clientes-menor-05.png", "logo-footer-03.png", "logo-footer-02.png", "logo-footer-01.png"];
const caseResultIcons = [
  ["shield", "smile", "bolt", "translate"],
  ["heart", "target", "bolt", "check"],
];

export default function Produto() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);
  const [activeCase, setActiveCase] = useState(0);
  const [activeSuite, setActiveSuite] = useState(0);
  const cases = [
    { name: "Fractalia", logo: "unnamed.png", lead: t.cases.fractaliaLead, results: t.cases.fractaliaResults, quote: t.cases.fractaliaQuote },
    { name: "Tecban", logo: "compartilhe-tecban.webp", lead: t.cases.tecbanLead, results: t.cases.tecbanResults, quote: t.cases.tecbanQuote },
  ];
  const selectedCase = cases[activeCase];

  return (
    <PageShell title={t.meta.title} description={t.meta.description} theme="suite">
      {/* 1. Hero: titulo, apoio, CTA e logos de clientes (o video vem logo abaixo) */}
      <section className="sx-hero sx-hero--ecosystem sx-dark sx-hero--live">
        <div className="sx-hero__aura" aria-hidden="true" />
        <TechLines variant="suite" />
        <div className="sx-shell sx-hero__inner">
          <p className="sx-eyebrow">Sigma Suite</p>
          <div className="sx-center">
            <h1 className="sx-h1"><SplitText text={t.hero.title} /></h1>
            <p className="sx-lead">{t.hero.lead}</p>
          </div>
          <a className="sx-cta sx-cta--outline sx-cta--lg" href={DEMO_URL} target="_blank" rel="noreferrer">
            {t.hero.cta} <span aria-hidden="true">→</span>
          </a>
          <div className="sx-logos">
            {clientLogos.map((logo) => <img key={logo} src={`/media/site/${logo}`} alt="Cliente SigmaCX" loading="lazy" />)}
          </div>
        </div>
      </section>

      <SectionTransition to="light" />

      {/* 2. Video de apresentacao */}
      <section className="sx-section sx-section--tight sx-section--tint" data-reveal>
        <div className="sx-shell">
          <div className="sx-video-head"><p className="sx-eyebrow">{t.video.eyebrow}</p><h2 className="sx-h2"><SplitText text={t.video.title} /></h2></div>
          <SuiteGlow className="sx-glow--wide" animated><Vimeo id={VIMEO.produtoHero} className="sx-video--dark" title="SigmaCX — Sigma Suite" /></SuiteGlow>
        </div>
      </section>

      {/* Cases navegáveis: duas histórias sem repetir a mesma composição. */}
      <section className="sx-section sx-section--wm" data-reveal>
        <Watermark side="right" />
        <div className="sx-shell">
          <div className="sx-editorial-head">
            <p className="sx-eyebrow">SigmaCX</p>
            <h2 className="sx-h2"><SplitText text={t.cases.title} /></h2>
          </div>
          <div className="sx-case-switcher">
            <div className="sx-case-switcher__tabs" role="tablist" aria-label={t.cases.title}>
              {cases.map((item, index) => (
                <button key={item.name} type="button" role="tab" id={`case-tab-${index}`}
                  aria-selected={activeCase === index} aria-controls={`case-panel-${index}`}
                  className={activeCase === index ? "is-active" : ""} onClick={() => setActiveCase(index)}>
                  <span>0{index + 1}</span>
                  <em>{item.name}</em>
                  <i aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="sx-case-switcher__stage" key={activeCase} role="tabpanel"
              id={`case-panel-${activeCase}`} aria-labelledby={`case-tab-${activeCase}`}>
              <div className="sx-case-switcher__intro">
                <div className="sx-case-switcher__client">
                  <span className="sx-eyebrow">{t.cases.highlight}</span>
                  <img src={`/media/site/${selectedCase.logo}`} alt={selectedCase.name} />
                </div>
                <p>{rich(selectedCase.lead)}</p>
                <img className="sx-case-switcher__art" src="/media/site/SigmaIcone-Normal2x.png" alt="" aria-hidden="true" />
              </div>
              <div className="sx-case-results">
                {selectedCase.results.map((item, index) => (
                  <article className="sx-case-result" key={item.title}>
                    <Icon name={caseResultIcons[activeCase][index]} fill />
                    <strong>{item.value}</strong>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
              <div className="sx-case-switcher__footer">
                <p><SuiteGradient>{selectedCase.quote}</SuiteGradient></p>
                <a className="sx-cta sx-cta--outline" href={CASE_TECBAN_PDF} target="_blank" rel="noreferrer">
                  {t.cases.caseCta} <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionTransition to="dark" />

      {/* Os módulos dividem uma cena azul; a mídia se dissolve no próprio fundo. */}
      <section className="sx-suite-immersive sx-dark">
        <div className="sx-immersive-marks" aria-hidden="true">
          <img className="sx-immersive-mark sx-immersive-mark--left" src="/media/site/SigmaIcone-Normal2x.png" alt="" />
          <img className="sx-immersive-mark sx-immersive-mark--right" src="/media/site/SigmaIcone-Normal2x.png" alt="" />
        </div>
        <div className="sx-shell" data-reveal>
          <div className="sx-suite-stage sx-dark">
            <div className="sx-suite-stage__nav" role="tablist" aria-label="Sigma Suite">
              {["Sigma Brain", "Sigma Channel"].map((label, index) => (
                <button key={label} type="button" role="tab" id={`suite-tab-${index}`}
                  aria-selected={activeSuite === index} aria-controls={`suite-panel-${index}`}
                  className={activeSuite === index ? "is-active" : ""} onClick={() => setActiveSuite(index)}>
                  <span>0{index + 1}</span>{label}
                </button>
              ))}
            </div>
            <div className="sx-suite-stage__panel" key={activeSuite} role="tabpanel"
              id={`suite-panel-${activeSuite}`} aria-labelledby={`suite-tab-${activeSuite}`}>
              <div>
                <p className="sx-eyebrow">Sigma Suite</p>
                <h2 className="sx-h2"><SplitText text={activeSuite === 0 ? t.brain.title : t.channel.title} /></h2>
                <p className="sx-body">{activeSuite === 0 ? t.brain.body : t.channel.body}</p>
                <p className="sx-suite-stage__action">
                  <Link className="sx-cta sx-cta--outline" to={href(activeSuite === 0 ? "/sigma-brain" : "/sigma-channel", lang)}>
                    {activeSuite === 0 ? t.brain.cta : t.channel.cta} <span aria-hidden="true">→</span>
                  </Link>
                </p>
              </div>
              <div className="sx-suite-immersive__media">
                {activeSuite === 0
                  ? <Vimeo id={VIMEO.produtoBrain} className="sx-video--dark" title="Sigma Brain" preloadMargin={2200} />
                  : <Video src={VIDEO.animacao} className="sx-video--bare" sound />}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionTransition to="light" />

      {/* 8. Inteligencia estrategica: fluxo vertical com linha teal, nos com
          icone e mini-cards de dados, seguindo o mockup de referencia. */}
      <section className="sx-section sx-section--atmosphere sx-intel" data-reveal>
        <div className="sx-shell">
          <div className="sx-intel__head">
            <h2 className="sx-h2"><SplitText text={t.intelligence.title} /></h2>
            <p className="sx-lead">{t.intelligence.lead}</p>
          </div>
          <div className="sx-intel__flow">
            <svg className="sx-intel__path" viewBox="0 0 64 900" preserveAspectRatio="none" aria-hidden="true">
              <path d="M32 0 C 64 140, 4 240, 32 400 C 58 540, 6 650, 32 900" />
            </svg>
            {t.intelligence.items.map((item, i) => (
              <article className="sx-intel-row" key={item.title}>
                <span className="sx-intel-row__node"><Icon name={["chat", "bars", "gear"][i]} /></span>
                <div className="sx-intel-row__copy">
                  <h3 className="sx-h3">{item.title}</h3>
                  <p>{item.body}</p>
                </div>
                <div className="sx-intel-row__viz" aria-hidden="true">
                  {i === 0 && (
                    <div className="sx-viz sx-viz--bars">
                      <div className="sx-viz__barhead">
                        <span>{t.intelligence.viz.messages}</span>
                        <span className="sx-viz__legend"><i /><i /></span>
                      </div>
                      <div className="sx-viz__bars">
                        {[36, 58, 42, 72, 52, 100].map((height, index) => (
                          <i key={index} style={{ height: `${height}%` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {i === 1 && (
                    <div className="sx-viz sx-viz--time">
                      <div className="sx-viz__timehead">
                        <span>{t.intelligence.viz.timeTotal}</span>
                        <em>{t.intelligence.viz.yearAll} <b>⌄</b></em>
                      </div>
                      <div className="sx-viz__tbars">
                        {[46, 30, 58, 88, 72, 96].map((height, index) => (
                          <i key={index} className={index === 0 ? "is-dim" : ""} style={{ height: `${height}%` }} />
                        ))}
                      </div>
                      <div className="sx-viz__months">
                        {["Fev", "Mar", "Abr", "Mai", "Jun", "Jul"].map((month) => <span key={month}>{month}</span>)}
                      </div>
                    </div>
                  )}
                  {i === 2 && (
                    <div className="sx-viz sx-viz--steps">
                      {[72, 88, 96].map((percent, index) => (
                        <div className="sx-viz__step" key={percent}>
                          <b>✓</b>
                          <span>{t.intelligence.viz.step} {index + 1}</span>
                          <i><u style={{ width: `${percent}%` }} /></i>
                          <em>{percent}%</em>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
          <p className="sx-intel__action">
            <a className="sx-cta sx-cta--ghost" href={DEMO_URL} target="_blank" rel="noreferrer">{t.intelligence.cta} <span aria-hidden="true">→</span></a>
          </p>
        </div>
      </section>

      {/* 9. Estatistica em destaque: numeros grandes, como o 81% da home */}
      <section className="sx-section" data-reveal>
        <div className="sx-shell sx-stat-banner">
          <div className="sx-stat-banner__copy">
            <p>{rich(t.intelligence.statLead)}</p>
            <cite>{t.intelligence.source}</cite>
          </div>
          <div className="sx-stat-banner__grid">
            {t.intelligence.stats.map((stat) => (
              <div className="sx-stat" key={stat.label}>
                <strong><SuiteGradient>{stat.value}</SuiteGradient></strong>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
