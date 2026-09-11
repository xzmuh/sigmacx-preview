import { Fragment, useState } from "react";
import { PageShell, useReveal } from "../site/PageShell";
import { Carousel, Icon, Watermark, SplitText, SuiteGlow, SuiteGradient, TechLines } from "../site/ui";
import { DEMO_URL, VIMEO } from "../site/site-data";
import ChannelAutomationScene from "../components/ChannelAutomationScene";
import ModuleVideoSection from "../components/ModuleVideoSection";
import { pick, rich, useLang } from "../lib/i18n";
import pt from "../../content/pages/sigma-channel.pt.json";
import en from "../../content/pages/sigma-channel.en.json";
import es from "../../content/pages/sigma-channel.es.json";

const tabImages = ["Dashboard-2.webp", "Criar-Fluxo-1.webp", "Sigma-Campaigns.webp"];
const stepIcons = ["list", "chat", "send", "heart", "sliders"];
const benefitIcons = ["users", "layers", "search"];
const actionImages = ["sigmaaa-01.webp", "Sigmaaaaaaaa-02.webp", "sigma-cxxx-03.webp", "sigma-cxxx-04.webp", "sigma-cxxx-05.webp", "sigma-cxxx-06.webp"];

/* Icones de traco dos canais, na cor da marca (sem as cores de cada rede). */
const CHANNEL_ICONS = [
  <svg key="whatsapp" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M12 3.4a8.6 8.6 0 0 0-7.4 13l-1.1 4.2 4.3-1.1A8.6 8.6 0 1 0 12 3.4Z" /><path d="M9.1 8.3h.8l1 2.2-.8.9a5.6 5.6 0 0 0 2.6 2.6l.9-.8 2.2 1v.8c0 .6-.6 1.2-1.4 1.1a6.6 6.6 0 0 1-6.4-6.4c0-.8.5-1.4 1.1-1.4Z" fill="currentColor" stroke="none" /></svg>,
  <svg key="instagram" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.9" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>,
  <svg key="facebook" viewBox="0 0 24 24" fill="currentColor"><path d="M13.6 21v-7.3h2.5l.4-2.9h-2.9V9c0-.8.3-1.4 1.5-1.4h1.5V5a19 19 0 0 0-2.2-.1c-2.2 0-3.7 1.3-3.7 3.8v2.1H8.2v2.9h2.5V21Z" /></svg>,
  <svg key="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M4.2 4h4.4l11.2 16h-4.4Z" /><path d="M19.4 4 13 11.3M4.6 20l6.4-7.3" strokeLinecap="round" /></svg>,
  <svg key="email" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2.6" /><path d="m4.4 7.4 7.6 5.6 7.6-5.6" strokeLinecap="round" /></svg>,
  <svg key="phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M6.7 3.8h2.5l1.3 4-1.8 1.3a11 11 0 0 0 6.2 6.2l1.3-1.8 4 1.3v2.5a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.7 6a2 2 0 0 1 2-2.2Z" /></svg>,
];

export default function SigmaChannel() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);
  const [active, setActive] = useState(0);
  const automationButtons = {
    pt: { cancel: "Cancelar", confirm: "Confirmar" },
    en: { cancel: "Cancel", confirm: "Confirm" },
    es: { cancel: "Cancelar", confirm: "Confirmar" },
  }[lang];

  return (
    <PageShell title={t.meta.title} description={t.meta.description} theme="suite" variant="panels">
      {/* 1. Hero: frase de abertura como titulo, CTA (o video vem logo abaixo) */}
      <section className="sx-hero sx-hero--channel sx-dark sx-hero--live sx-subproduct-hero">
        <div className="sx-hero__aura" aria-hidden="true" />
        <TechLines variant="channel" />
        <div className="sx-shell sx-hero__inner sx-hero__inner--left">
          <div className="sx-product-hero-brand"><img src="/media/brand/sigma-channel-white.png" alt="Sigma Channel" /></div>
          <h1 className="sx-h1"><SplitText text={t.hero.title} /></h1>
          <p className="sx-lead">{t.hero.lead}</p>
          <a className="sx-cta sx-cta--grad sx-cta--lg" href={DEMO_URL} target="_blank" rel="noreferrer">
            {t.hero.cta} <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* O texto de abertura deixa de disputar com uma segunda cena azul.
          Ele cria a pausa clara entre o hero e a demonstração do produto. */}
      <section className="sx-section sx-subproduct-bridge sx-channel-bridge" data-reveal>
        <div className="sx-shell sx-subproduct-bridge__layout">
          <div>
            <img className="sx-channel-bridge__logo" src="/media/brand/sigma-channel-default.png" alt={t.intro.eyebrow} />
            <h2 className="sx-h2"><SplitText text={t.intro.title} /></h2>
          </div>
          <div className="sx-subproduct-bridge__copy">
            <p className="sx-lead">{t.intro.body}</p>
            <a className="sx-cta sx-cta--outline" href={DEMO_URL} target="_blank" rel="noreferrer">{t.intro.cta} <span aria-hidden="true">→</span></a>
          </div>
        </div>
        {/* Os seis canais chegando ao Sigma Channel: tres de cada lado, com um
            ponto de luz correndo pela linha ate o centro. */}
        <div className="sx-shell">
          <div className="sx-channel-hub" role="img" aria-label={t.intro.hubLabel}>
            {t.intro.channels.map((name, index) => (
              <Fragment key={name}>
                {index === 3 && (
                  <span className="sx-channel-hub__core" aria-hidden="true">
                    <img src="/media/sigma-mark.png" alt="" />
                  </span>
                )}
                <span className={`sx-channel-hub__item${index < 3 ? " is-in" : " is-out"}`} aria-hidden="true" style={{ ["--d" as string]: `${(index % 3) * 0.45}s` }}>
                  <span className="sx-channel-hub__tile">{CHANNEL_ICONS[index]}</span>
                  <small>{name}</small>
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Demonstração escura, agora isolada entre duas cenas claras. */}
      <section className="sx-band sx-dark sx-subproduct-stage">
        <div className="sx-shell" data-reveal>
          <div className="sx-tabs">
            <div className="sx-tabs__panel" key={active} role="tabpanel" id={`channel-panel-${active}`} aria-labelledby={`channel-tab-${active}`}>
              <h3 className="sx-h2"><SuiteGradient onDark>{t.tabs[active].headline}</SuiteGradient></h3>
              <p className="sx-lead">{t.tabs[active].body}</p>
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

      {/* 5. Fluxos personalizaveis: passos com a linha viva (como a secao
          "Transformamos" do Produto) e a animacao solta no fundo, sem card */}
      <section id="fluxos" className="sx-section sx-section--wm sx-flows sx-subproduct-story" data-reveal>
        <Watermark side="left" />
        <div className="sx-shell">
          <h2 className="sx-h2"><SplitText text={t.flows.title} /></h2>
          <p className="sx-body">{t.flows.body}</p>
          <div className="sx-flows__grid">
            {/* Linha reta com os passos em cartão, como a referência. O caminho
                curvo em SVG saiu: ele serpenteava entre os nós e a leitura de
                sequência ficava por conta da curva, não da ordem. */}
            <div className="sx-flows__steps">
              <ol>
                {t.flows.steps.map((step, i) => (
                  <li key={step.title}>
                    <span className="sx-flows__node"><Icon name={stepIcons[i]} /></span>
                    <div className="sx-flows__card"><h3>{step.title}</h3><p>{step.body}</p></div>
                  </li>
                ))}
              </ol>
            </div>
            {/* O GIF original do sigmacx.ai (544x440, o unico tamanho que
                existe no servidor), no lugar do WebP convertido: pedido do
                usuario em 2026-09-11 para ficar igual ao site antigo. */}
            <div className="sx-flows__media" aria-hidden="true">
              <img src="/media/site/Fluxo.gif" alt="" loading="lazy" width={544} height={440} />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Automatize o dia a dia: a interface e um componente nativo, sem
          player ou video, para manter os cartoes nitidos em qualquer tela. */}
      <section className="sx-section sx-section--atmosphere sx-automate sx-dark sx-subproduct-stage sx-subproduct-stage--secondary" data-reveal>
        <div className="sx-shell sx-automate__grid">
          <div className="sx-automate__copy">
            <p className="sx-eyebrow">{t.automate.badge}</p>
            <h2 className="sx-h2"><SplitText text={t.automate.title} /></h2>
            <p className="sx-lead">{t.automate.lead}</p>
            <p className="sx-body">{t.automate.body}</p>
            <p style={{ marginTop: 26 }}>
              <a className="sx-cta sx-cta--grad" href={DEMO_URL} target="_blank" rel="noreferrer">{t.automate.cta} <span aria-hidden="true">→</span></a>
            </p>
          </div>
          <div className="sx-automate__stage sx-automate__stage--native">
            <span className="sx-automate__stage-orbit" aria-hidden="true" />
            <ChannelAutomationScene
              copy={t.automate.floats}
              cancelLabel={automationButtons.cancel}
              confirmLabel={automationButtons.confirm}
            />
          </div>
        </div>
      </section>

      <ModuleVideoSection
        eyebrow={t.video.eyebrow}
        title={t.video.title}
        lead={t.hero.lead}
        vimeoId={VIMEO.channelHero}
        videoTitle="Sigma Channel"
      />

      <div className="sx-channel-light-run">
        {/* 7. Mais eficiencia e controle: três benefícios equivalentes, sem
            numeração ou conexão que sugira uma sequência. */}
        <section className="sx-section sx-results sx-subproduct-proof" data-reveal>
          <div className="sx-shell">
            <header className="sx-results__intro">
              <div>
                <p className="sx-eyebrow sx-results__eyebrow">{t.benefits.eyebrow}</p>
                <h2 className="sx-h2"><SplitText text={t.benefits.title} /></h2>
              </div>
              <p className="sx-lead">{t.benefits.lead}</p>
            </header>
            <div className="sx-results__simple">
              {t.benefits.items.map((item, i) => (
                <article className="sx-result-card" key={item.title}>
                  <span className="sx-result-card__blob"><Icon name={benefitIcons[i]} /></span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Acoes inteligentes: respiro claro antes do CTA final escuro */}
        <section className="sx-section sx-channel-actions sx-subproduct-cases" data-reveal>
          <div className="sx-shell">
            <div className="sx-center" style={{ marginBottom: 36 }}>
              <h2 className="sx-h2"><SplitText text={t.actions.title} /></h2>
              <p className="sx-lead">{t.actions.lead}</p>
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
      </div>

    </PageShell>
  );
}
