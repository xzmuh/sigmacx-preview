import { useState } from "react";
import { PageShell, useReveal } from "../site/PageShell";
import { FlowBuilder } from "../site/FlowBuilder";
import { FeatureAccordion, Icon, Video, SplitText, SuiteGradient, TechLines } from "../site/ui";
import { BOT_VS_AGENT_URL, DEMO_URL, VIDEO, VIMEO } from "../site/site-data";
import ModuleVideoSection from "../components/ModuleVideoSection";
import { pick, useLang } from "../lib/i18n";
import pt from "../../content/pages/sigma-brain.pt.json";
import en from "../../content/pages/sigma-brain.en.json";
import es from "../../content/pages/sigma-brain.es.json";
import "../site/brainLaser.css";

const pillarIcons = ["bolt", "translate", "smile"];
const tabImages = ["omni.webp", "Bot-BR.webp", "Flutuacao-BR.png"];
const benefitIcons = ["bolt", "layers", "check", "target"];

export default function SigmaBrain() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);
  const [activePillar, setActivePillar] = useState(0);

  return (
    <PageShell title={t.meta.title} description={t.meta.description} theme="suite" variant="panels">
      {/* 1. Hero */}
      <section className="sx-hero sx-hero--brain sx-dark sx-hero--live sx-subproduct-hero">
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

      {/* Pausa editorial clara entre o hero e o palco funcional. O conteúdo
          já existia na cena seguinte; apenas muda de lugar. */}
      <section className="sx-section sx-subproduct-bridge" data-reveal>
        <div className="sx-shell sx-subproduct-bridge__layout">
          <div>
            <p className="sx-eyebrow">{t.hero.badge}</p>
            <h2 className="sx-h2"><SplitText text={t.pillars.title} /></h2>
          </div>
          <div className="sx-subproduct-bridge__copy">
            <p className="sx-lead">{t.pillars.lead}</p>
          </div>
        </div>
      </section>

      {/* 2. Pilares: cena azul de tela inteira (cor do fundo do video), midia
          dissolvida no fundo e accordion ao lado, como a Sigma Suite no Produto */}
      <section className="sx-section sx-section--story sx-story-immersive sx-dark sx-subproduct-stage" data-reveal>
        <div className="sx-shell sx-story-layout">
          <div className="sx-story-media">
            <div className="sx-story-media__stage">
              <Video src={VIDEO.brain} className="sx-video--dark sx-video--bare sx-video--story" />
            </div>
          </div>
          <div className="sx-story-content">
            <p className="sx-eyebrow">Sigma Brain</p>
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

      {/* 4. Laser central conduz tres cenas com texto e imagem alternados. */}
      <section className="sx-brain-laser">
        <div className="sx-shell sx-brain-laser__journey">
          <div className="sx-brain-laser__rail" aria-hidden="true">
            <span className="sx-brain-laser__fill" />
            <span className="sx-brain-laser__tip" />
          </div>
            {t.tabs.map((item, index) => (
              <article key={item.label} className="sx-brain-laser__scene">
                <span className="sx-brain-laser__node" aria-hidden="true" />
                <div className="sx-brain-laser__copy">
                  <p className="sx-brain-flow__kicker"><span>0{index + 1}</span>{item.label}</p>
                  <h2 className="sx-h2"><SuiteGradient>{item.headline}</SuiteGradient></h2>
                  <p className="sx-lead">{item.body}</p>
                </div>
                <figure className={`sx-brain-laser__media sx-brain-laser__media--${index}`}>
                  <img src={`/media/site/${tabImages[index]}`} alt={item.label} loading="lazy" />
                </figure>
              </article>
            ))}
        </div>
      </section>

      {/* 5. No-code: única seção dedicada à criação e escala das jornadas. */}
      <section className="sx-band sx-dark sx-nocode sx-nocode--featured sx-subproduct-stage sx-subproduct-stage--secondary" data-reveal>
        {/* Mesmo efeito do hero, na variante azul escura: a metade esquerda
            estava vazia atras do texto. */}
        <TechLines variant="nocode" />
        <div className="sx-shell sx-feature">
          <div className="sx-nocode__copy">
            <p className="sx-eyebrow">Sigma Brain</p>
            <h2 className="sx-h2"><SplitText text={t.nocode.title} /></h2>
            <p className="sx-lead">{t.nocode.lead}</p>
            <p className="sx-body">{t.nocode.body}</p>
            <p style={{ marginTop: 26 }}>
              <a className="sx-cta sx-cta--outline" href={DEMO_URL} target="_blank" rel="noreferrer">{t.nocode.cta} <span aria-hidden="true">→</span></a>
            </p>
          </div>
          {/* A tela jogavel entra no lugar do print do builder: a secao diz
              "configure de forma visual, sem codigo", e um print pede que o
              visitante acredite nisso em vez de experimentar. */}
          <div className="sx-feature__media sx-feature__media--flow sx-nocode__builder"><FlowBuilder copy={t.nocode.builder} /></div>
        </div>
      </section>

      <ModuleVideoSection
        eyebrow={t.video.eyebrow}
        title={t.video.title}
        lead={t.intro.body}
        vimeoId={VIMEO.brainHero}
        videoTitle="Sigma Brain"
      />

      {/* 6. Beneficios com a mesma hierarquia para os quatro itens. */}
      <section className="sx-section sx-brain-benefits" data-reveal>
        <div className="sx-shell">
          <header className="sx-brain-benefits__head">
            <p className="sx-eyebrow">Sigma Brain</p>
            <h2 className="sx-h2">{t.benefits.title}</h2>
            <p className="sx-lead">{t.benefits.lead}</p>
          </header>
          <div className="sx-brain-benefits__list">
            {t.benefits.items.map((item, index) => (
              <article className="sx-brain-benefit" key={item.title}>
                <div className="sx-brain-benefit__heading">
                  <Icon name={benefitIcons[index]} />
                  <h3>{item.title}</h3>
                </div>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <div className="sx-brain-benefits__cta">
            <a className="sx-cta sx-cta--outline" href={DEMO_URL} target="_blank" rel="noreferrer">{t.benefits.cta} <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
