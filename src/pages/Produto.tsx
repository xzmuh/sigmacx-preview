import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, useReveal } from "../site/PageShell";
import { SectionTransition } from "../site/SectionTransition";
import { Video, Vimeo, Watermark, SplitText, SuiteGlow, SuiteGradient } from "../site/ui";
import { CASE_TECBAN_PDF, DEMO_URL, VIDEO, VIMEO } from "../site/site-data";
import { href, pick, rich, useLang } from "../lib/i18n";
import pt from "../../content/pages/produto.pt.json";
import en from "../../content/pages/produto.en.json";
import es from "../../content/pages/produto.es.json";

const clientLogos = ["clientes-menor-08.png", "logo-footer-04.png", "clientes-menor-05.png", "logo-footer-03.png", "logo-footer-02.png", "logo-footer-01.png"];
const intelligenceImages = ["1.webp", "2.webp", "3.webp"];

export default function Produto() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);
  const [activeCase, setActiveCase] = useState(0);
  const [activeSuite, setActiveSuite] = useState(0);
  const cases = [
    { name: "Grupo Fractalia", logo: "unnamed.png", lead: t.cases.fractaliaLead, results: t.cases.fractaliaResults, quote: t.cases.fractaliaQuote },
    { name: "Tecban", logo: "compartilhe-tecban.webp", lead: t.cases.tecbanLead, results: t.cases.tecbanResults, quote: t.cases.tecbanQuote },
  ];
  const selectedCase = cases[activeCase];

  return (
    <PageShell title={t.meta.title} description={t.meta.description} theme="suite">
      {/* 1. Hero: titulo, apoio, CTA e logos de clientes (o video vem logo abaixo) */}
      <section className="sx-hero sx-hero--ecosystem sx-dark">
        <div className="sx-hero__aura" aria-hidden="true" />
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
                  <img src={`/media/site/${item.logo}`} alt={item.name} />
                  <i aria-hidden="true">→</i>
                </button>
              ))}
            </div>
            <div className="sx-case-switcher__stage sx-dark" key={activeCase} role="tabpanel"
              id={`case-panel-${activeCase}`} aria-labelledby={`case-tab-${activeCase}`}>
              <div className="sx-block__overlay" aria-hidden="true" />
              <div className="sx-case-switcher__intro">
                <img src={`/media/site/${selectedCase.logo}`} alt={selectedCase.name} />
                <p>{rich(selectedCase.lead)}</p>
              </div>
              <div className="sx-case-results">
                {selectedCase.results.map((item, index) => (
                  <article className="sx-case-result" key={item.title}>
                    <span>0{index + 1}</span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
              <div className="sx-case-switcher__footer">
                <p><SuiteGradient onDark>{selectedCase.quote}</SuiteGradient></p>
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
                  ? <Vimeo id={VIMEO.produtoBrain} className="sx-video--dark" title="Sigma Brain" />
                  : <Video src={VIDEO.animacao} className="sx-video--bare" sound />}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionTransition to="light" />

      {/* 8. Inteligencia estrategica: colunas planas (imagem, titulo, texto), sem card dentro de card */}
      <section className="sx-section sx-section--atmosphere" data-reveal>
        <div className="sx-shell sx-stack">
          <div className="sx-center">
            <h2 className="sx-h2"><SplitText text={t.intelligence.title} /></h2>
            <p className="sx-lead">{t.intelligence.lead}</p>
          </div>
          <div className="sx-grid sx-grid--3 sx-flat-grid">
            {t.intelligence.items.map((item, i) => (
              <article className="sx-flat-item" key={item.title}>
                <div className="sx-flat-item__media"><img src={`/media/site/${intelligenceImages[i]}`} alt="" loading="lazy" /></div>
                <h3 className="sx-h3">{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <p className="sx-center" style={{ margin: 0 }}>
            <a className="sx-cta sx-cta--outline" href={DEMO_URL} target="_blank" rel="noreferrer">{t.intelligence.cta} <span aria-hidden="true">→</span></a>
          </p>
        </div>
      </section>

      {/* 9. Citacao */}
      <section className="sx-section" data-reveal>
        <div className="sx-shell sx-quote" style={{ maxWidth: 820 }}>
          <p><SuiteGradient>{rich(t.intelligence.quote)}</SuiteGradient></p>
          <cite>{t.intelligence.source}</cite>
        </div>
      </section>
    </PageShell>
  );
}
