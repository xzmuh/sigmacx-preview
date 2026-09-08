import { Fragment, Suspense, lazy, useEffect, useId, useRef, useState } from "react";
import { PageShell, useReveal } from "../site/PageShell";
import { DIALOGI_SITE } from "../site/site-data";
import { pick, rich, useLang } from "../lib/i18n";
import BorderGlow from "../components/BorderGlow";
import pt from "../../content/pages/dialogi.pt.json";
import en from "../../content/pages/dialogi.en.json";
import es from "../../content/pages/dialogi.es.json";
import "../site/dialogi.css";

/* O campo WebGL fica no proprio chunk: `ogl` so baixa se o hero for desenhar. */
const Strands = lazy(() => import("../site/Strands"));

/** O campo de luz e desmontado sob movimento reduzido, como na home. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/* O envelope tem VALE no centro: a onda afina onde o microfone esta e engorda
   a meio caminho das pontas, voltando a afinar nas bordas. Antes era o inverso
   — o pico caia justamente atras do microfone e a onda parecia inchada ali.
   O expoente 1.6 alarga o vale, para o afinamento cobrir o disco inteiro e nao
   so o ponto central. A textura e escalada pela propria forma, senao o ruido
   reengordava as barras do meio. Deterministico, para o build nao variar. */
const WAVE = Array.from({ length: 30 }, (_, i) => {
  const distance = Math.abs(i - 14.5) / 14.5;
  const shape = Math.sin(distance * Math.PI) ** 1.6;
  const texture = ((((i * 17) % 23) - 11) / 11) * 9 * shape;
  return {
    delay: `${(-i * 0.055).toFixed(3)}s`,
    peak: `${Math.max(9, Math.round(13 + shape * 69 + texture))}%`,
  };
});

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8.5" y="3" width="7" height="12" rx="3.5" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" />
    </svg>
  );
}

function VoiceTagIcon({ index }: { index: number }) {
  if (index === 0) {
    return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path d="M8 13.2S2.5 10.3 2.5 6.1A2.8 2.8 0 0 1 8 5.3a2.8 2.8 0 0 1 5.5.8C13.5 10.3 8 13.2 8 13.2Z" /></svg>;
  }
  if (index === 1) {
    return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.35} aria-hidden="true"><path d="M4 2.5h5l3 3v8H4zM9 2.5v3h3M6 8h4M6 10.5h3" /></svg>;
  }
  if (index === 2) {
    return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.35} strokeLinecap="round" aria-hidden="true"><circle cx="8" cy="8" r="5.5" /><path d="M2.8 8h10.4M8 2.5c1.5 1.5 2.2 3.3 2.2 5.5S9.5 12 8 13.5C6.5 12 5.8 10.2 5.8 8S6.5 4 8 2.5Z" /></svg>;
  }
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" aria-hidden="true"><path d="M3 12.5V9m3 3.5V6.8m3 5.7V4m3 8.5V7" /></svg>;
}

/* Superficies exatas dos dois lados de cada onda, escritas aqui — ao lado da
   ordem das secoes — porque e o unico lugar onde os dois lados de uma emenda
   sao visiveis de uma vez. Uma onda cujas cores fogem das vizinhas pinta uma
   faixa da cor errada, que grita mais alto que o corte reto que ela substitui. */
const HERO = "#050b1d";
const FEATURES = "#081329";
const PAGE = "#fff";

/** Seta dos botoes do Dialogi (ui/Icon), que desliza no hover. */
function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/**
 * A onda entre secoes (ui/Primitives → SectionBreak). E o que da a leveza da
 * home: em vez de um corte reto, a superficie de cima desce numa curva e uma
 * faixa de luz brand→mint respira por baixo dela.
 *
 * Um unico caminho continuo alcanca as duas bordas — caixas arredondadas
 * sobrepostas expunham uma tira reta na ponta.
 *
 * Entre dois escuros nao ha onda: e uma entrega rapida de tinta, porque
 * desenhar uma borda entre dois azuis quase iguais e um detalhe fussy em volta
 * de uma diferenca que ninguem ia notar.
 */
function Break({ tone, from, to }: { tone: "dark-light" | "light-dark" | "dark-dark"; from: string; to: string }) {
  const id = `dlg-break-${useId().replace(/:/g, "")}`;

  if (tone === "dark-dark") {
    return (
      <div
        className="dlg-break dlg-break--dd"
        aria-hidden="true"
        style={{
          ["--from" as string]: from,
          ["--to" as string]: to,
          background: [
            "radial-gradient(ellipse at 72% 28%, rgb(44 64 245 / 0.12), transparent 54%)",
            `linear-gradient(180deg, ${from} 0%, #071228 48%, ${to} 100%)`,
          ].join(","),
        }}
      />
    );
  }

  return (
    <div className="dlg-break" aria-hidden="true" style={{ background: to }}>
      <svg viewBox="0 0 1440 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(44 64 245)" stopOpacity="0.72" />
            <stop offset="52%" stopColor="rgb(111 120 251)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(21 239 109)" stopOpacity="0.38" />
          </linearGradient>
        </defs>
        <path d="M-40-20H1480V31C1130 112 350 129-40 36Z" fill={from} />
        <path className="dlg-break__band" d="M-48 43C340 139 1105 132 1488 37" fill="none"
          stroke={`url(#${id})`} strokeWidth="25" strokeLinecap="round" />
        <path d="M-40-20H1480V25C1110 94 350 111-40 30Z" fill={from} />
      </svg>
    </div>
  );
}

/**
 * Titulo revelado palavra a palavra, cada palavra na sua mascara — o lettering
 * do site do Dialogi (motion/SplitText). O disparo vem do `.is-visible` que o
 * useReveal poe no bloco que envolve o titulo.
 */
function Split({ text }: { text: string }) {
  // `**trecho**` vira a faixa em degrade que corre por dentro dos glifos —
  // o mesmo recurso do titulo "Transformamos cada interacao em **inteligencia
  // estrategica**" do /produto, aqui na paleta do Dialogi.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  let i = 0;
  return (
    <span className="dlg-split">
      {parts.map((part, p) => {
        if (!part) return null;
        const grad = part.startsWith("**") && part.endsWith("**");
        const body = grad ? part.slice(2, -2) : part;
        // O espaco e um no de texto entre as mascaras, e nao o ultimo caractere
        // dentro delas: `.dlg-split__w` e inline-block com overflow hidden, e
        // ali o espaco final e descartado no processamento de white-space — as
        // palavras saiam coladas ("Oqueaplataformafaz").
        const nodes = grad ? null : body.split(/(\s+)/).map((token, t) => {
          if (!token) return null;
          if (/^\s+$/.test(token)) return <Fragment key={t}> </Fragment>;
          return (
            <span className="dlg-split__w" key={t}>
              <span style={{ ["--i" as string]: i++ }}>{token}</span>
            </span>
          );
        });
        // O trecho em degrade NAO se divide em palavras. `background-clip: text`
        // para de achar os glifos assim que um descendente abre o proprio
        // contexto de formatacao, e cada mascara de palavra e um inline-block
        // com overflow hidden — a frase inteira pintava transparente e sumia.
        // E a mesma regra que o projeto do Dialogi segue nos titulos compostos.
        return grad
          ? <span className="dlg-split__grad" key={p}>{body}</span>
          : <Fragment key={p}>{nodes}</Fragment>;
      })}
    </span>
  );
}

/**
 * Pagina do Dialogi AI dentro do site da SigmaCX.
 *
 * O desenho e o da home do Dialogi: o campo de luz da primeira tela, o deck
 * que responde "o que e o Dialogi", as ondas entre as secoes e a alternancia
 * de fundo — escuro quando o produto fala, claro quando o leitor pensa. Sem a
 * camada gamificada. O header e o rodape continuam sendo os do site, e a
 * jornada termina no site proprio do produto.
 */
export default function Dialogi() {
  useReveal();
  const lang = useLang();
  const t = pick({ pt, en, es }, lang);
  const site = DIALOGI_SITE[lang];
  const reduced = useReducedMotion();
  const featureTrackRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState(2);

  const centerFeatureCard = (card: HTMLElement | undefined, behavior: ScrollBehavior = "smooth") => {
    const track = featureTrackRef.current;
    if (!track || !card) return;
    const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({ left, behavior });
  };

  const moveFeature = (step: number) => {
    const track = featureTrackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-feature-card]"));
    const center = track.scrollLeft + track.clientWidth / 2;
    const nearest = cards.reduce((best, card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    centerFeatureCard(cards[nearest.index + step]);
  };

  useEffect(() => {
    const track = featureTrackRef.current;
    if (!track) return;

    let frame = 0;
    const syncActive = () => {
      frame = 0;
      const center = track.scrollLeft + track.clientWidth / 2;
      const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-feature-card]"));
      let nearest = 0;
      let distance = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const nextDistance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        if (nextDistance < distance) {
          distance = nextDistance;
          nearest = index;
        }
      });
      const nearestCard = cards[nearest];
      const featureIndex = Number(nearestCard?.dataset.featureIndex ?? 0);
      const physicalIndex = Number(nearestCard?.dataset.featureCard ?? 0);
      const count = t.features.items.length;
      const cycleWidth = (cards[count]?.offsetLeft ?? 0) - (cards[0]?.offsetLeft ?? 0);

      setActiveFeature(featureIndex);
      if (cycleWidth > 0 && physicalIndex < count) track.scrollLeft += cycleWidth;
      if (cycleWidth > 0 && physicalIndex >= count * 2) track.scrollLeft -= cycleWidth;
    };
    const requestSync = () => {
      if (!frame) frame = window.requestAnimationFrame(syncActive);
    };
    const resizeObserver = new ResizeObserver(requestSync);

    track.addEventListener("scroll", requestSync, { passive: true });
    resizeObserver.observe(track);
    const initialFrame = window.requestAnimationFrame(() => {
      const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-feature-card]"));
      centerFeatureCard(cards[t.features.items.length + activeFeature], "auto");
    });

    return () => {
      window.cancelAnimationFrame(initialFrame);
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      track.removeEventListener("scroll", requestSync);
    };
  }, []);

  return (
    <PageShell title={t.meta.title} description={t.meta.description}>
      <div className="dlg">
        {/* 1. Hero: o stage sobre o campo de luz, e o deck logo abaixo — as
            duas telas continuam sendo o mesmo hero, entao dividem o fundo. */}
        <header className="dlg-signal">
          <div className="dlg-signal__base" aria-hidden="true" />
          <div className="dlg-signal__bloom" aria-hidden="true" />
          <div className="dlg-signal__shade" aria-hidden="true" />

          {/* Stage: a primeira tela. Uma coluna so — o modulo que ocupava a
              outra na home e a barra de XP, que fica de fora aqui. */}
          <div className="dlg-stage">
            {/* O campo vive dentro do stage porque o que ele precisa acertar e
                a base do stage — a borda de cima do deck, onde o afunilamento
                do arco morre. Nada o recorta ali; o stage so lhe da de onde
                medir. */}
            {!reduced ? (
              <div className="dlg-strands" aria-hidden="true">
                <Suspense fallback={null}>
                  <Strands
                    colors={["#1255ff", "#159dff", "#15ef6d", "#8bffe1"]}
                    count={5} speed={0.16} amplitude={0.35} waviness={0.7} thickness={0.27}
                    glow={1.7} taper={2.65} spread={0.82} intensity={0.38} saturation={1.2}
                    opacity={0.78} scale={3.35} rightLift={0.0115}
                  />
                </Suspense>
              </div>
            ) : null}
            <div className="dlg-x">
              <div className="dlg-stage__copy" data-reveal="left">
              <img className="dlg-logo" src="/media/dialogi.png" alt="dialogi.ai" width={444} height={88} />
              <p className="dlg-stage__from">{rich(t.hero.from)}</p>
              <h1 className="dlg-h1">
                <span>{t.hero.titleLead}</span>
                <span className="dlg-h1__accent">{t.hero.titleHi}</span>
              </h1>
              <p className="dlg-stage__lead">{t.hero.lead}</p>
              <div className="dlg-actions dlg-stage__actions">
                <a className="dlg-btn dlg-btn--light" href={site} target="_blank" rel="noreferrer">
                  {t.hero.ctaPrimary} <ArrowRight />
                </a>
                <a className="dlg-btn dlg-btn--outline" href="#recursos">{t.hero.ctaSecondary}</a>
              </div>
                </div>
            </div>
          </div>

          {/* Deck: o cartao grande que responde por que o Dialogi existe. Ele
              e a segunda tela e continua sendo o hero, entao divide o mesmo
              fundo e carrega o proprio brilho em vez de um background novo. */}
          <div className="dlg-x dlg-deck-wrap">
            {/* Sem `data-reveal`: o deck e a segunda tela do hero e fica
                abaixo da dobra, entao esperar o scroll o deixava invisivel em
                quem chega e ja rola rapido. Ele nasce carregado. */}
            <div className="dlg-deck">
              <div className="dlg-deck__glow" aria-hidden="true" />
              <div className="dlg-deck__bar">
                <span className="dlg-deck__eyebrow">{t.why.kicker}</span>
              </div>
              <div className="dlg-deck__body">
                <div className="dlg-deck__head">
                  <div className="dlg-deck__copy">
                    <h2 className="dlg-deck__title">{t.why.title}</h2>
                    <p className="dlg-deck__lead">{t.why.body}</p>
                  </div>

                  {/* No lugar do key visual do cliente: o unico ponto da pagina
                      em que a superficie real do produto e mostrada, e nao
                      descrita — a chamada de voz com a leitura acontecendo. */}
                  <figure className="dlg-deck__art dlg-voice" aria-label={t.voice.alt}>
                    <div className="dlg-voice__top">
                      <div className="dlg-voice__who">
                        <span className="dlg-voice__av" aria-hidden="true">D</span>
                        <div>
                          <div className="dlg-voice__name">{t.voice.name}</div>
                          <div className="dlg-voice__ch">{t.voice.channel}</div>
                        </div>
                      </div>
                    </div>
                    <div className="dlg-voice__visual" aria-hidden="true">
                      <div className="dlg-voice__rings"><i /><i /><i /></div>
                      <div className="dlg-wave">
                        {WAVE.map(({ delay, peak }, i) => (
                          <span key={i} style={{ animationDelay: delay, ["--peak" as string]: peak }} />
                        ))}
                      </div>
                      <div className="dlg-voice__mic"><MicIcon /></div>
                    </div>
                    <figcaption className="dlg-voice__meta">
                      {t.voice.tags.map((tag, i) => (
                        <span key={tag} className={i === 0 ? "dlg-chip dlg-chip--accent" : "dlg-chip"}>
                          <VoiceTagIcon index={i} />{tag}
                        </span>
                      ))}
                    </figcaption>
                  </figure>
                </div>

                <div className="dlg-deck__grid">
                  {t.why.pillars.map((pillar) => (
                    <article className="dlg-deck__card" key={pillar.title}>
                      <h3>{pillar.title}</h3>
                      <p>{pillar.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <Break tone="dark-dark" from={HERO} to={FEATURES} />

        {/* 2. Recursos: o produto falando, entao fundo escuro. */}
        <section className="dlg-sec dlg-sec--dark dlg-sec--features" id="recursos">
          <div className="dlg-x">
            <div className="dlg-head" data-reveal="up">
              <span className="dlg-eyebrow">{t.features.kicker}</span>
              <h2 className="dlg-h2"><Split text={t.features.title} /></h2>
              <p className="dlg-body">{t.features.body}</p>
            </div>

            <div className="dlg-feature-carousel" data-reveal="up">
              <div className="dlg-feature-carousel__track" ref={featureTrackRef}>
              {[0, 1, 2].flatMap((cycle) => t.features.items.map((item, i) => {
                let distance = (i - activeFeature + t.features.items.length) % t.features.items.length;
                if (distance > t.features.items.length / 2) distance -= t.features.items.length;
                return (
                  <div
                    className={`dlg-feature-slide${distance === 0 ? " is-active" : distance < 0 ? " is-before" : " is-after"}${Math.abs(distance) > 1 ? " is-far" : ""}`}
                    data-feature-card={cycle * t.features.items.length + i}
                    data-feature-index={i}
                    key={`${cycle}-${item.title}`}
                  >
                    <article className="dlg-tile">
                      <span className="dlg-tile__cat">{item.cat}</span>
                      <h3 className="dlg-h3">{item.title}</h3>
                      <p>{item.body}</p>
                    </article>
                  </div>
                );
              }))}
              </div>
              <div className="dlg-feature-carousel__controls">
                <span>{String(activeFeature + 1).padStart(2, "0")} / {String(t.features.items.length).padStart(2, "0")}</span>
                <div>
                  <button type="button" onClick={() => moveFeature(-1)} aria-label="Anterior">←</button>
                  <button type="button" onClick={() => moveFeature(1)} aria-label="Próximo">→</button>
                </div>
              </div>
            </div>

            <p className="dlg-more" data-reveal="up">{rich(t.features.more)}</p>
          </div>
        </section>

        <Break tone="dark-light" from={FEATURES} to={PAGE} />

        {/* 3. Setores: o leitor se perguntando se serve para ele — fundo claro. */}
        <section className="dlg-sec dlg-sec--light">
          <div className="dlg-x">
            <div className="dlg-head" data-reveal="up">
              <span className="dlg-eyebrow">{t.sectors.kicker}</span>
              <h2 className="dlg-h2"><Split text={t.sectors.title} /></h2>
              <p className="dlg-body">{t.sectors.body}</p>
            </div>

            <div className="dlg-cards">
              {t.sectors.items.map((item, i) => (
                <div key={item.title} style={{ ["--i" as string]: i }} data-reveal="up">
                  <article className="dlg-card">
                    <h3 className="dlg-h3">{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                </div>
              ))}
              <div style={{ ["--i" as string]: t.sectors.items.length }} data-reveal="up">
                <article className="dlg-card dlg-card--open">
                  <h3 className="dlg-h3">{t.sectors.open.title}</h3>
                  <p>{t.sectors.open.body}</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Fechamento: a jornada continua no site proprio do Dialogi. */}
        <section className="dlg-sec dlg-sec--light dlg-sec--close">
          <div className="dlg-x">
            <BorderGlow
              alwaysOn
              className="dlg-final-glow"
              backgroundColor="#ffffff"
              borderRadius={40}
              glowRadius={44}
              glowColor="234 100 60"
              glowIntensity={1.15}
              coneSpread={22}
              colors={["#3045ff", "#6c4cff", "#22dca0"]}
              fillOpacity={0.2}
            >
              <div className="dlg-final" data-reveal="up">
                <img className="dlg-final__logo" src="/media/dialogi-color.png" alt="dialogi.ai" width={444} height={88} />
                <h2 className="dlg-h2">
                  {t.final.titleLead}<span className="dlg-grad">{t.final.titleBrand}</span>{t.final.titleTrail}
                </h2>
                <p>{t.final.body}</p>
                <div className="dlg-actions">
                  <a className="dlg-btn dlg-btn--primary" href={site} target="_blank" rel="noreferrer">
                    {t.final.cta} <ArrowRight />
                  </a>
                </div>
                <p className="dlg-final__url">{t.final.url}</p>
              </div>
            </BorderGlow>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
