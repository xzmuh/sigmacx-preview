import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, useReveal } from "../site/PageShell";
import { Panel } from "../site/Panel";
import { Icon, TechLines, Vimeo, Watermark, SplitText, SuiteGlow, SuiteGradient } from "../site/ui";
import { CASE_CONEXION_PDF, CASE_TECBAN_PDF, DEMO_URL, VIMEO } from "../site/site-data";
import ChannelConversation from "../components/ChannelConversation";
import { href, pick, rich, useLang } from "../lib/i18n";
import pt from "../../content/pages/produto.pt.json";
import en from "../../content/pages/produto.en.json";
import es from "../../content/pages/produto.es.json";

const clientLogos = ["clientes-menor-08.png", "logo-footer-04.png", "clientes-menor-05.png", "logo-footer-03.png", "logo-footer-02.png", "logo-footer-01.png"];
/* Telas reais do produto, uma para cada item de `intelligence.items`:
   transcricao/avaliacao, painel de indicadores e fluxo automatizado. */
const intelShots = [
  { file: "Criar-Fluxo-1.webp", alt: "Tela de avaliacao com a transcricao da chamada e as perguntas de qualidade" },
  { file: "Dashboard-2.webp", alt: "Painel com indicadores de atendimento e series historicas" },
  { file: "G2-BR.webp", alt: "Fluxo de atendimento automatizado com o volume de cada caminho" },
];

const caseResultIcons = [
  ["bolt", "users", "bars", "chat"],
  ["heart", "target", "bolt", "check"],
];

/**
 * Sigma Suite na direcao de paineis: as cenas escuras deixam de ser faixas
 * coladas e viram cartoes arredondados sobre o branco, com o aro neon da
 * marca. Sem `SectionTransition`, o respiro branco entre os blocos e a
 * propria transicao, entao nao sobra corte reto em lugar nenhum.
 */
export default function Produto() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);
  const [activeCase, setActiveCase] = useState(0);
  const [activeSuite, setActiveSuite] = useState(0);
  /* Cases da pasta de marketing (2026-09-10). A marca da Conexion veio da capa
     do PDF, recortada e passada para a tinta escura: o palco e claro e apaga o
     branco com `multiply`. */
  const cases = [
    { name: "Conexión TS", logo: "conexion-logo.png", lead: t.cases.conexionLead, results: t.cases.conexionResults, quote: t.cases.conexionQuote, pdf: CASE_CONEXION_PDF },
    { name: "Tecban", logo: "tecban-logo.webp", lead: t.cases.tecbanLead, results: t.cases.tecbanResults, quote: t.cases.tecbanQuote, pdf: CASE_TECBAN_PDF },
  ];
  const selectedCase = cases[activeCase];

  return (
    <PageShell title={t.meta.title} description={t.meta.description} theme="suite" variant="panels">
      {/* 1. Hero: painel encaixotado, como o da referencia. Nao expande, ele
             ja abre a pagina, entao nao ha scroll antes dele para animar. */}
      <Panel expand={false} inset={16} radius={20} className="sx-panel--hero">
        <TechLines variant="suite" />
        <div className="sx-panel__inner">
          <div className="sx-shell">
            <div className="sx-product-hero-brand sx-product-hero-brand--suite"><img src="/media/brand/sigma-white.png" alt="Sigma" /><span>Suite</span></div>
            <h1 className="sx-h1"><SplitText text={t.hero.title} onDark /></h1>
            <p className="sx-lead">{t.hero.lead}</p>
            <p className="sx-panel__actions">
              <a className="sx-cta sx-cta--grad sx-cta--lg" href={DEMO_URL} target="_blank" rel="noreferrer">
                {t.hero.cta} <span aria-hidden="true">→</span>
              </a>
            </p>
          </div>
        </div>
      </Panel>

      {/* Prova social fora do hero: abre o ritmo claro da pagina. */}
      <section className="sx-platform-trust" aria-label={t.hero.trust}>
        <div className="sx-shell">
          <p>{t.hero.trust}</p>
          <div className="sx-platform-trust__marquee">
            <div className="sx-platform-trust__track">
              {[0, 1].map((copy) => (
                <div className="sx-platform-trust__set" key={copy} aria-hidden={copy === 1 || undefined}>
                  {clientLogos.map((logo) => (
                    <img key={`${copy}-${logo}`} src={`/media/site/${logo}`} alt={copy === 0 ? "Cliente SigmaCX" : ""} loading="lazy" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Contexto da plataforma: mantém o campo claro após o hero e
             prepara a leitura antes de apresentar os módulos. */}
      <section className="sx-section sx-platform-overview">
        <div className="sx-shell">
          <div className="sx-platform-overview__intro" data-reveal>
            <div>
              <h2 className="sx-h2"><SplitText text={t.overview.title} /></h2>
            </div>
            <p className="sx-lead">{t.overview.lead}</p>
          </div>
          <div className="sx-platform-overview__items">
            {t.overview.items.map((item, index) => (
              <article key={item.title} data-reveal>
                <span>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Um unico momento escuro: showcase dos motores da plataforma. */}
      <section className="sx-section sx-platform-products">
        <div className="sx-platform-products__canvas sx-dark">
          <img className="sx-platform-products__mark" src="/media/site/SigmaIcone-Normal2x.png" alt="" aria-hidden="true" />
          <div className="sx-shell" data-reveal>
            <header className="sx-platform-products__head">
              <h2 className="sx-h2"><SplitText text={t.suiteIntro.title} onDark /></h2>
              <p className="sx-lead">{t.suiteIntro.lead}</p>
            </header>

            <div className="sx-platform-products__nav" role="tablist" aria-label="Sigma Suite">
              {["Brain", "Channel"].map((label, index) => (
                <button key={label} type="button" role="tab" id={`suite-tab-${index}`}
                  aria-selected={activeSuite === index} aria-controls={`suite-panel-${index}`}
                  className={activeSuite === index ? "is-active" : ""} onClick={() => setActiveSuite(index)}>
                  <img src={`/media/brand/sigma-${index === 0 ? "brain" : "channel"}-${activeSuite === index ? "default" : "white"}.png`} alt={`Sigma ${label}`} loading="lazy" />
                </button>
              ))}
            </div>

            <div className="sx-platform-products__body" key={activeSuite} role="tabpanel"
              id={`suite-panel-${activeSuite}`} aria-labelledby={`suite-tab-${activeSuite}`}>
              <div className="sx-platform-products__copy">
                <h3 className="sx-h2"><SplitText text={activeSuite === 0 ? t.brain.title : t.channel.title} onDark /></h3>
                <p className="sx-body">{activeSuite === 0 ? t.brain.body : t.channel.body}</p>
                <p>
                  <Link className="sx-cta sx-cta--outline" to={href(activeSuite === 0 ? "/sigma-brain" : "/sigma-channel", lang)}>
                    {activeSuite === 0 ? t.brain.cta : t.channel.cta} <span aria-hidden="true">→</span>
                  </Link>
                </p>
              </div>
              <div className="sx-platform-products__media">
                {activeSuite === 0
                  ? <Vimeo id={VIMEO.produtoBrain} className="sx-video--dark" title="Sigma Brain" preloadMargin={2200} />
                  : <ChannelConversation lang={lang} />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Inteligencia estrategica: tres capitulos visiveis, sem clique. */}
      <section className="sx-section sx-platform-loop">
        <svg className="sx-platform-loop__thread" viewBox="0 0 560 1600" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="sx-platform-thread-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#00a9a9" />
              <stop offset=".52" stopColor="#40d7cb" />
              <stop offset="1" stopColor="#5d8cff" />
            </linearGradient>
            <clipPath id="sx-platform-thread-reveal" clipPathUnits="objectBoundingBox">
              <rect className="sx-scroll-thread__reveal" x="0" y="0" width="1" height="1" />
            </clipPath>
          </defs>
          <g clipPath="url(#sx-platform-thread-reveal)">
          <path className="sx-platform-loop__thread-glow"
            d="M -24 32 C 112 34 174 88 180 218 C 188 386 88 456 118 646 C 146 820 246 858 230 1050 C 216 1222 126 1300 164 1470 C 178 1532 222 1572 294 1600" />
          <path className="sx-platform-loop__thread-line"
            d="M -24 32 C 112 34 174 88 180 218 C 188 386 88 456 118 646 C 146 820 246 858 230 1050 C 216 1222 126 1300 164 1470 C 178 1532 222 1572 294 1600" />
          </g>
        </svg>
        <img className="sx-platform-loop__mark" src="/media/site/SigmaIcone-Normal2x.png" alt="" aria-hidden="true" />
        <div className="sx-shell">
          <header className="sx-platform-loop__head" data-reveal>
            {/* A marca do Sigma Insights no lugar do rotulo "SigmaCX": esta e a
                secao dele (transcricao, analise e paineis). */}
            <p className="sx-eyebrow sx-platform-loop__brand"><img src="/media/site/SigmaInsights-Default.png" alt="Sigma Insights" /></p>
            <h2 className="sx-h2"><SplitText text={t.intelligence.title} /></h2>
            <p className="sx-lead">{t.intelligence.lead}</p>
          </header>

          <div className="sx-platform-loop__track">
            {t.intelligence.items.map((item, i) => (
              <article className="sx-platform-loop__item" key={item.title} data-reveal={i % 2 ? "right" : "left"}>
                <div className="sx-platform-loop__copy">
                  <span>0{i + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
                <figure className="sx-platform-loop__media">
                  <img src={`/media/site/${intelShots[i].file}`} alt={intelShots[i].alt} loading="lazy" />
                </figure>
              </article>
            ))}
          </div>

          <p className="sx-platform-loop__action">
            <a className="sx-cta sx-cta--grad" href={DEMO_URL} target="_blank" rel="noreferrer">{t.intelligence.cta} <span aria-hidden="true">&#8594;</span></a>
          </p>
        </div>
      </section>

      {/* 5. Demo: aparece depois que a pagina explicou o valor da plataforma. */}
      <section className="sx-section sx-platform-video" data-reveal>
        <div className="sx-shell">
          <div className="sx-platform-video__intro">
            <div>
              <p className="sx-eyebrow">{t.video.eyebrow}</p>
              <h2 className="sx-h2"><SplitText text={t.video.title} /></h2>
            </div>
            <div className="sx-platform-video__copy">
              <p className="sx-lead">{t.video.lead}</p>
            </div>
          </div>
          <SuiteGlow className="sx-glow--wide" animated>
            <Vimeo id={VIMEO.produtoHero} className="sx-video--dark" title="SigmaCX | Sigma Suite" />
          </SuiteGlow>
        </div>
      </section>

      {/* 6. Estatística: terceira cena azul, com o mesmo fundo vivo do Channel. */}
      <section className="sx-section sx-section--tight sx-platform-proof" data-reveal>
        <TechLines variant="channel" />
        <div className="sx-shell sx-stat-banner">
          <div className="sx-stat-banner__copy">
            <p>{rich(t.intelligence.statLead)}</p>
            <cite>{t.intelligence.source}</cite>
          </div>
          <div className="sx-stat-banner__grid">
            {t.intelligence.stats.map((stat) => (
              <div className="sx-stat" key={stat.label}>
                <strong><SuiteGradient onDark>{stat.value}</SuiteGradient></strong>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Cases: fecham a pagina, logo antes do CTA final e do rodape. */}
      <section className="sx-section sx-section--wm sx-platform-cases" data-reveal>
        <Watermark side="right" />
        <div className="sx-shell">
          <div className="sx-editorial-head">
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
                {selectedCase.pdf ? (
                  <a className="sx-cta sx-cta--outline" href={selectedCase.pdf} target="_blank" rel="noreferrer">
                    {t.cases.caseCta} <span aria-hidden="true">→</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
