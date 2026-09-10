import { useState } from "react";
import { PageShell, useReveal } from "../site/PageShell";
import { FlowBuilder } from "../site/FlowBuilder";
import { FeatureAccordion, Video, SplitText, SuiteGradient, TechLines } from "../site/ui";
import { BOT_VS_AGENT_URL, DEMO_URL, VIDEO, VIMEO } from "../site/site-data";
import ModuleVideoSection from "../components/ModuleVideoSection";
import { pick, useLang } from "../lib/i18n";
import pt from "../../content/pages/sigma-brain.pt.json";
import en from "../../content/pages/sigma-brain.en.json";
import es from "../../content/pages/sigma-brain.es.json";
import "../site/brainLaser.css";

const pillarIcons = ["bolt", "translate", "smile"];
const tabImages = ["omni.webp", "Bot-BR.webp", "Flutuacao-BR.png"];
function BenefitDiagram({ index }: { index: number }) {
  return <svg className="sx-brain-benefit__diagram" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {index === 0 ? <>
      <rect x="21" y="21" width="38" height="38" rx="9" fill="currentColor" fillOpacity=".05" />
      <path d="M31 13v8m18-8v8M31 59v8m18-8v8M13 31h8m-8 18h8m38-18h8m-8 18h8" strokeOpacity=".5" />
      <path d="m43 29-12 14h10l-4 9 13-15H40l3-8Z" fill="currentColor" fillOpacity=".12" />
    </> : index === 1 ? <>
      <path d="M23 26 32 34m17 0 9-8M40 51v10" strokeOpacity=".5" />
      <path d="M10 13h18v13H17l-7 5V13Zm42 0h18v18l-7-5H52V13Z" fill="currentColor" fillOpacity=".05" />
      <circle cx="40" cy="43" r="15" fill="white" />
      <circle cx="40" cy="39" r="4" /><path d="M32 50c1-7 15-7 16 0" />
      <rect x="31" y="64" width="18" height="6" rx="3" fill="currentColor" fillOpacity=".1" />
    </> : index === 2 ? <>
      <path d="M31 17h-8a4 4 0 0 0-4 4v42a4 4 0 0 0 4 4h29a4 4 0 0 0 4-4v-9M45 17h7a4 4 0 0 1 4 4v11" />
      <rect x="30" y="12" width="16" height="10" rx="3" fill="currentColor" fillOpacity=".08" />
      <path d="M28 33h13M28 42h8M28 51h8" strokeOpacity=".4" />
      <circle cx="55" cy="44" r="13" fill="currentColor" fillOpacity=".06" /><path d="m49 44 4 4 8-9" />
    </> : <>
      <path d="M40 19c-3-10-17-9-20 1-8 0-12 9-8 16-7 6-5 18 3 21-1 10 13 16 20 10 3-2 5-5 5-9V19Zm0 0c3-10 17-9 20 1 8 0 12 9 8 16 7 6 5 18-3 21 1 10-13 16-20 10-3-2-5-5-5-9V19Z" fill="currentColor" fillOpacity=".05" />
      <path d="M21 21c-1 7 3 10 9 10m-17 6c5-3 10-1 12 3m-9 17c7 2 12-2 12-8m31-28c1 7-3 10-9 10m17 6c-5-3-10-1-12 3m9 17c-7 2-12-2-12-8" strokeOpacity=".65" />
      <path d="m29 32 11 9 11-9M28 49l12-8 12 8" strokeOpacity=".4" />
      {[[29, 32], [51, 32], [40, 41], [28, 49], [52, 49]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.5" fill="currentColor" stroke="none" />)}
    </>}
  </svg>;
}

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
          <div className="sx-product-hero-brand"><img src="/media/brand/sigma-brain-white.png" alt="Sigma Brain" /></div>
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

      {/* Benefícios em uma composição editorial com diagramas por capacidade. */}
      <section className="sx-section sx-brain-benefits" data-reveal>
        <div className="sx-shell sx-brain-benefits__layout">
          <header className="sx-brain-benefits__head">
            <p className="sx-eyebrow">Sigma Brain</p>
            <h2 className="sx-h2">{t.benefits.title}</h2>
            <p className="sx-lead">{t.benefits.lead}</p>
            <div className="sx-brain-benefits__cta">
              <a className="sx-cta sx-cta--outline" href={DEMO_URL} target="_blank" rel="noreferrer">{t.benefits.cta} <span aria-hidden="true">→</span></a>
            </div>
          </header>
          <div className="sx-brain-benefits__list">
            {t.benefits.items.map((item, index) => (
              <article className="sx-brain-benefit" key={item.title}>
                <span className="sx-brain-benefit__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div className="sx-brain-benefit__copy">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                </div>
                <BenefitDiagram index={index} />
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
