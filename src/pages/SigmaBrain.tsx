import { useEffect, useRef, useState } from "react";
import { PageShell, useReveal } from "../site/PageShell";
import { FlowBuilder } from "../site/FlowBuilder";
import { FlowAnalytics } from "../site/FlowAnalytics";
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
  const brainFlowChapters = useRef<Array<HTMLElement | null>>([]);
  const mainBenefits = t.benefits.items.slice(0, 3);
  const lastBenefit = t.benefits.items[3];

  useEffect(() => {
    let frame = 0;

    const updateActiveChapter = () => {
      frame = 0;
      const chapters = brainFlowChapters.current.filter((chapter): chapter is HTMLElement => Boolean(chapter));
      if (!chapters.length) return;

      const readingLine = window.innerHeight * 0.48;
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      chapters.forEach((chapter, index) => {
        const bounds = chapter.getBoundingClientRect();
        const distance = Math.abs(bounds.top + bounds.height / 2 - readingLine);
        if (distance < nearestDistance) {
          nearest = index;
          nearestDistance = distance;
        }
      });

      setActive((current) => current === nearest ? current : nearest);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveChapter);
    };

    updateActiveChapter();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

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
              {/* Sem o rotulo, nao renderiza o paragrafo: um `<p>` vazio ainda
                  ocupa uma linha e desalinharia a legenda do video. */}
              {t.pillars.items[activePillar].eyebrow
                ? <p key={activePillar}>{t.pillars.items[activePillar].eyebrow}</p>
                : null}
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

      <SectionTransition to="light" />

      {/* 4. Historia guiada pelo scroll: os tres beneficios deixam de ser abas
          isoladas e passam a formar uma unica sequencia. A composicao visual
          fica em cena enquanto o texto avanca, sem capturar ou travar o scroll. */}
      <section className="sx-brain-flow" data-active={active}>
        <div className="sx-shell sx-brain-flow__layout">
          <div className="sx-brain-flow__chapters">
            {t.tabs.map((item, index) => (
              <article
                key={item.label}
                ref={(chapter) => { brainFlowChapters.current[index] = chapter; }}
                className={`sx-brain-flow__chapter${active === index ? " is-active" : ""}`}
                data-step={`0${index + 1}`}
                aria-current={active === index ? "step" : undefined}
              >
                <p className="sx-brain-flow__kicker"><span>0{index + 1}</span>{item.label}</p>
                <h2 className="sx-h2"><SuiteGradient>{item.body}</SuiteGradient></h2>
                <div className={`sx-brain-flow__mobile-media sx-brain-flow__mobile-media--${index}`}>
                  <img src={`/media/site/${tabImages[index]}`} alt="" loading="lazy" />
                </div>
              </article>
            ))}
          </div>

          <div className="sx-brain-flow__visual" aria-live="polite">
            <div className="sx-brain-flow__stage">
              <span className="sx-brain-flow__orbit sx-brain-flow__orbit--outer" aria-hidden="true" />
              <span className="sx-brain-flow__orbit sx-brain-flow__orbit--inner" aria-hidden="true" />
              {t.tabs.map((item, index) => (
                <figure
                  key={item.label}
                  className={`sx-brain-flow__media sx-brain-flow__media--${index}${active === index ? " is-active" : ""}`}
                  aria-hidden={active !== index}
                >
                  <img src={`/media/site/${tabImages[index]}`} alt={active === index ? item.label : ""} loading="lazy" />
                </figure>
              ))}
            </div>

            <div className="sx-brain-flow__progress" aria-hidden="true">
              <span>01</span>
              <div><i style={{ transform: `scaleX(${(active + 1) / t.tabs.length})` }} /></div>
              <span>0{t.tabs.length}</span>
            </div>
          </div>
        </div>
      </section>

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

          {/* A leitura jogavel entra no lugar de `G2-BR.webp`, que era o print
              desta mesma tela: a secao fala em configurar e acompanhar, e um
              print nao deixa o visitante seguir um caminho com o cursor. */}
          <div className="sx-builder__stage sx-builder__stage--live">
            <FlowAnalytics copy={t.configurable.canvas} />
          </div>
        </div>
      </section>


      <SectionTransition to="dark" />

      {/* 7. Faixa escura: no-code */}
      <section className="sx-band sx-dark sx-nocode" data-reveal>
        {/* Mesmo efeito do hero, na variante azul escura: a metade esquerda
            estava vazia atras do texto. */}
        <TechLines variant="nocode" />
        <div className="sx-shell sx-feature">
          <div>
            <p className="sx-eyebrow">Sigma Brain</p>
            <h2 className="sx-h2"><SplitText text={t.nocode.title} /></h2>
            <p className="sx-body">{t.nocode.body}</p>
            <p style={{ marginTop: 26 }}>
              <a className="sx-cta sx-cta--outline" href={DEMO_URL} target="_blank" rel="noreferrer">{t.nocode.cta} <span aria-hidden="true">→</span></a>
            </p>
          </div>
          {/* A tela jogavel entra no lugar do print do builder: a secao diz
              "configure de forma visual, sem codigo", e um print pede que o
              visitante acredite nisso em vez de experimentar. */}
          <div className="sx-feature__media sx-feature__media--flow"><FlowBuilder copy={t.nocode.builder} /></div>
        </div>
      </section>

      <SectionTransition to="light" />

      {/* 8. Principais beneficios */}
      <section className="sx-section sx-section--wm" data-reveal>
        <Watermark side="left" />
        <div className="sx-shell">
          <h2 className="sx-h2" style={{ marginBottom: 30 }}><SplitText text={t.benefits.title} /></h2>
          <div className="sx-grid sx-grid--3">
            {/* A moldura acende na borda conforme o cursor se aproxima — o
                mesmo BorderGlow dos botoes, aqui reagindo ao mouse de verdade
                (sem `alwaysOn`), que e como o componente original funciona. */}
            {mainBenefits.map((item, i) => (
              <SuiteGlow radius={20} className="sx-glow--card" key={item.title}>
                <article className="sx-card sx-card--icon sx-card--bare">
                  <h3 className="sx-h3">{item.title}</h3>
                  <Icon name={benefitIcons[i]} />
                  <p>{item.body}</p>
                </article>
              </SuiteGlow>
            ))}
            {lastBenefit ? (
              <SuiteGlow radius={20} className="sx-glow--card sx-glow--wide-card">
              <article className="sx-card sx-card--icon sx-card--bare">
                <h3 className="sx-h3">{lastBenefit.title}</h3>
                <Icon name={benefitIcons[3]} />
                <p>{lastBenefit.body}</p>
                <p style={{ marginTop: 16 }}>
                  <a className="sx-cta sx-cta--outline sx-cta--sm" href={DEMO_URL} target="_blank" rel="noreferrer">{t.benefits.cta} <span aria-hidden="true">→</span></a>
                </p>
              </article>
              </SuiteGlow>
            ) : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
