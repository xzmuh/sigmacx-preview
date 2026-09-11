import { Fragment, useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../site/PageShell";
import { useInvestorsMotion } from "../site/investorsMotion";
import { INVESTORS_MAIL } from "../site/site-data";
import { href, pick, useLang } from "../lib/i18n";
import pt from "../../content/pages/investidores.pt.json";
import en from "../../content/pages/investidores.en.json";
import es from "../../content/pages/investidores.es.json";
import "../site/investidores.css";

/* Paleta e tipografia da home, com formas continuas no lugar de particulas. */
function Grad({ children, speed = 7 }: { children: ReactNode; speed?: number }) {
  return (
    <span className="inv-gradient" style={{ "--gradient-duration": `${speed}s` } as CSSProperties}>
      {children}
    </span>
  );
}

/**
 * Marcacao leve dos JSON de conteudo: `**trecho**` sai em degrade da home
 * (`gradient`) ou em negrito claro, quando o destaque nao pode roubar a cena —
 * o lado "as outras plataformas" do bloco de contraste, por exemplo.
 */
function rich(text: string, gradient = true): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (!part.startsWith("**") || !part.endsWith("**")) return part;
    const body = part.slice(2, -2);
    return gradient ? <Grad key={index}>{body}</Grad> : <b key={index}>{body}</b>;
  });
}

/** Linha do titulo dentro de uma mascara: sobe ao abrir, como o hero da home. */
function Rise({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className="inv-rise">
      <span style={{ ["--d" as string]: `${delay}ms` }}>{children}</span>
    </span>
  );
}

/**
 * Numero da faixa de credenciais correndo ate o valor final quando entra na
 * tela. Ano (4 digitos) nao corre: viraria odometro, e ali o dado e uma data.
 */
function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const element = ref.current;
    const match = value.match(/^(\d{1,3})(\D*)$/);
    if (!element || !match || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = Number(match[1]);
    const suffix = match[2];
    let frame = 0;
    let start = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const step = (now: number) => {
        if (!start) start = now;
        const progress = Math.min(1, (now - start) / 1100);
        setShown(`${Math.round(target * (1 - (1 - progress) ** 3))}${suffix}`);
        if (progress < 1) frame = window.requestAnimationFrame(step);
      };
      setShown(`0${suffix}`);
      frame = window.requestAnimationFrame(step);
    }, { threshold: 0.5 });
    observer.observe(element);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={ref}>{shown}</span>;
}

/**
 * O texto e o mesmo, palavra por palavra: o que muda e o ritmo. A primeira
 * frase sai clara e um ponto maior — e o que o leitor pega de relance — e o
 * resto desce menor, para quem for ler o detalhe.
 */
const SENTENCE = /(?<=[.!?])\s+(?=[A-ZÀ-ÜÑ“"])/;

function Lead({ text, className = "" }: { text: string; className?: string }) {
  const [first, ...rest] = text.split(SENTENCE);
  return (
    <div className={`inv-lead ${className}`.trim()}>
      <p className="inv-lead__lede">{rich(first, false)}</p>
      {rest.length ? <p className="inv-lead__rest">{rich(rest.join(" "), false)}</p> : null}
    </div>
  );
}

/**
 * Select proprio. O nativo abre a lista do sistema operacional, que ignora a
 * pagina inteira; este e um combobox de selecao unica com a lista na tinta da
 * pagina e o teclado do padrao: setas, Home/End, Enter, Esc.
 */
function Select({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const id = useId().replace(/:/g, "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.indexOf(value)));
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  const choose = (index: number) => {
    onChange(options[index]);
    setActive(index);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActive(
        event.key === "Home" ? 0
          : event.key === "End" ? last
          : event.key === "ArrowDown" ? Math.min(last, active + 1)
          : Math.max(0, active - 1),
      );
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(active);
      else setOpen(true);
    }
  };

  return (
    <div className="inv-field inv-select" ref={box}>
      <span id={`${id}-label`}>{label}</span>
      <button
        type="button"
        className={open ? "inv-select__button is-open" : "inv-select__button"}
        role="combobox"
        aria-controls={`${id}-list`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={onKeyDown}
      >
        <span id={`${id}-value`}>{value}</span>
        <i aria-hidden="true" />
      </button>
      <ul className="inv-select__list" id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} hidden={!open}>
        {options.map((option, index) => (
          <li
            key={option}
            id={`${id}-opt-${index}`}
            role="option"
            aria-selected={option === value}
            className={index === active ? "is-active" : undefined}
            /* `pointerdown` em vez de `click`: o listener de fora fecha a lista
               antes de o clique chegar ao item. */
            onPointerDown={(event) => { event.preventDefault(); choose(index); }}
            onPointerEnter={() => setActive(index)}
          >
            {option}
            <i aria-hidden="true" />
          </li>
        ))}
      </ul>
    </div>
  );
}

const EMPTY_FORM = { name: "", email: "", company: "", role: "", profile: "", message: "", consent: false };

function Sculpture() {
  return (
    <div className="inv-sculpture" aria-hidden="true">
      <div className="inv-sculpture__light" />
      <svg viewBox="0 0 700 800" fill="none">
        <defs>
          <linearGradient id="inv-ribbon" x1="100" y1="700" x2="550" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5da6ff" stopOpacity="0.04" />
            <stop offset=".4" stopColor="#5da6ff" stopOpacity=".65" />
            <stop offset=".72" stopColor="#b9ff9b" />
            <stop offset="1" stopColor="#e5ffeb" stopOpacity=".16" />
          </linearGradient>
        </defs>
        <g className="inv-sculpture__ribbons">
          {Array.from({ length: 13 }, (_, i) => (
            <path key={i} d={`M ${105 + i * 11} 820 C ${-165 + i * 19} 515, ${110 + i * 10} ${28 + i * 9}, ${383 + i * 9} ${108 + i * 11} C ${780 - i * 3} ${224 + i * 7}, ${215 + i * 16} ${548 - i * 4}, ${640 + i * 10} 810`}
              stroke="url(#inv-ribbon)" strokeWidth={i % 4 === 0 ? 3 : 1} />
          ))}
        </g>
      </svg>
    </div>
  );
}

function ForceArt({ index }: { index: number }) {
  return (
    <div className={`inv-force-art inv-force-art--${index}`} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => <span key={i} style={{ "--i": i } as CSSProperties} />)}
    </div>
  );
}

/**
 * Login da area do investidor: janela nativa (`<dialog>`), que ja fecha no Esc e
 * prende o foco. O site nao tem autenticacao: ate existir um endpoint, o envio
 * so orienta quem ja assinou o NDA a falar com a caixa de investidores. Trocar
 * o trecho marcado em `submit` pela chamada real quando houver backend.
 */
type LoginText = (typeof pt)["login"];

function InvestorLogin({ t, open, onClose }: { t: LoginText; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "pending">("idle");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/.+@.+\..+/.test(email) || !password) {
      setStatus("error");
      return;
    }
    // Sem backend de login ainda: aqui entra a autenticacao real.
    setStatus("pending");
  };

  return (
    <dialog
      ref={ref}
      className="inv-login"
      aria-labelledby="inv-login-title"
      data-lenis-prevent
      onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <form className="inv-form" onSubmit={submit} noValidate>
        <div className="inv-login__head">
          <h3 id="inv-login-title">{t.title}</h3>
          <button type="button" className="inv-login__close" aria-label={t.close} onClick={onClose}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        <p className="inv-small">{t.lead}</p>
        <label className="inv-field">
          <span>{t.email}</span>
          <input type="email" value={email} placeholder={t.emailPlaceholder} autoComplete="username"
            onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="inv-field">
          <span>{t.password}</span>
          <input type="password" value={password} placeholder={t.passwordPlaceholder} autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)} />
        </label>
        <p className="inv-form__error" role="alert">{status === "error" ? t.required : ""}</p>
        {status === "pending" && (
          <p className="inv-login__pending" role="status">
            {t.pending} <a href={`mailto:${INVESTORS_MAIL}`}>{INVESTORS_MAIL}</a>.
          </p>
        )}
        <button className="pill pill--primary" type="submit">
          {t.submit} <span aria-hidden="true">→</span>
        </button>
        <div className="inv-login__links">
          <a href={`mailto:${INVESTORS_MAIL}?subject=${encodeURIComponent(t.forgot)}`}>{t.forgot}</a>
          <span>
            {t.noAccess} <a href="#material" onClick={onClose}>{t.request}</a>
          </span>
        </div>
      </form>
    </dialog>
  );
}

export default function Investidores() {
  const lang = useLang();
  const root = useRef<HTMLDivElement>(null);
  useInvestorsMotion(root, lang);
  const t = pick({ pt, en, es }, lang);
  const f = t.gate.form;
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(false);
  const [sent, setSent] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const set = (field: keyof typeof EMPTY_FORM, value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  /* Sem endpoint de formulario no site: a solicitacao e montada como e-mail e
     entregue ao programa do visitante. Trocar por um POST quando existir um
     destino (INVESTORS_MAIL segue sendo a caixa que recebe). */
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const valid = form.name.trim() && /.+@.+\..+/.test(form.email) && form.company.trim() && form.consent;
    if (!valid) {
      setError(true);
      return;
    }
    setError(false);
    const body = [
      `${f.name}: ${form.name}`,
      `${f.email}: ${form.email}`,
      `${f.company}: ${form.company}`,
      `${f.role}: ${form.role}`,
      `${f.profile}: ${form.profile || f.profiles[0]}`,
      `${f.message}: ${form.message}`,
    ].join("\n");
    window.location.href =
      `mailto:${INVESTORS_MAIL}?subject=${encodeURIComponent(f.subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <PageShell title={t.meta.title} description={t.meta.description} endsLight={false} finalCta={false}>
      <div className="inv" ref={root}>
        <div className="inv-progress" aria-hidden="true" />

        {/* 1. Hero — a atmosfera da home por tras do texto de abertura. */}
        <header className="inv-hero">
          <div className="inv-atmos" aria-hidden="true">
            <Sculpture />
          </div>

          <div className="inv-x inv-hero__inner">
            <span className="section-index">{t.hero.eyebrow}</span>
            <h1 className="inv-h1">
              <Rise delay={80}>{t.hero.title}</Rise>
              <Rise delay={240}><Grad speed={6}>{t.hero.accent}</Grad></Rise>
            </h1>
            <Lead text={t.hero.lead} className="inv-hero__lead" />
            <div className="inv-hero__actions">
              <a className="pill pill--primary" href="#material">
                {t.hero.cta} <span aria-hidden="true">↓</span>
              </a>
              <button className="pill pill--outline" type="button" onClick={() => setLoginOpen(true)}>
                {t.hero.login}
                <svg className="inv-lock" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="7" width="10" height="7" rx="1.6" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
                </svg>
              </button>
            </div>
          </div>

          <div className="inv-x">
            <div className="inv-creds">
              {t.hero.creds.map((cred) => (
                <div className="inv-cred" key={cred.value + cred.label}>
                  <strong><Counter value={cred.value} /></strong>
                  <span>{cred.label}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <nav className="inv-chapters" aria-label={t.hero.eyebrow}>
          <div className="inv-x inv-chapters__inner">
            {[t.diagnosis, t.now, t.why, t.gate].map((chapter, index) => (
              <a key={chapter.index} href={`#${["diagnostico", "agora", "sigma", "material"][index]}`}>
                <span>{chapter.index}</span>{chapter.eyebrow}<span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </nav>

        {/* 2. Diagnostico — a leitura em tres tempos, no trilho de sinal. */}
        <section className="inv-section inv-diagnosis inv-x" id="diagnostico">
          <div className="inv-editorial" data-reveal>
            <span className="section-index"><i>{t.diagnosis.index}</i> / {t.diagnosis.eyebrow}</span>
            <h2 className="inv-h2">{t.diagnosis.title}</h2>
            <Lead text={t.diagnosis.lead} />
          </div>

          <div className="inv-flow" data-reveal>
            <div className="inv-flow__rail" aria-hidden="true">
              <span className="inv-flow__fill" />
            </div>
            {t.diagnosis.flow.map((step, index) => (
              <article className={index === 1 ? "inv-flow__step is-key" : "inv-flow__step"} key={step.title}>
                <span className="inv-flow__k">{`0${index + 1}`}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 3. Por que agora — as quatro forcas. */}
        <section className="inv-section inv-now inv-x" id="agora">
          <div className="inv-now__intro" data-reveal>
            <span className="section-index"><i>{t.now.index}</i> / {t.now.eyebrow}</span>
            <h2 className="inv-h2">{t.now.title}</h2>
            <Lead text={t.now.lead} />
          </div>
          <div className="inv-cards inv-forces" data-reveal>
            {t.now.cards.map((card, index) => (
              <article className="inv-card" key={card.title}>
                <ForceArt index={index} />
                <span className="inv-card__k">{card.k}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 4. O principio — a faixa de destaque com a frase que separa as duas
            leituras do mesmo dado. */}
        <section className="inv-band">
          <div className="inv-band__arcs" aria-hidden="true"><span /><span /><span /></div>
          <div className="inv-x">
            <div className="inv-quote" data-reveal>
              <span className="section-index">{t.principle.kicker}</span>
              <p className="inv-quote__big">{rich(t.principle.quote)}</p>
              <ul className="inv-signals">
                {t.principle.signals.map((signal) => <li key={signal}>{signal}</li>)}
              </ul>
            </div>

            <div className="inv-contrast" data-reveal>
              <div className="inv-contrast__side">
                <span className="inv-contrast__who">{t.principle.contrast.themWho}</span>
                <p>{rich(t.principle.contrast.them, false)}</p>
              </div>
              <div className="inv-contrast__side inv-contrast__side--us">
                <span className="inv-contrast__who">{t.principle.contrast.usWho}</span>
                <p>{rich(t.principle.contrast.us)}</p>
              </div>
            </div>

            <p className="inv-closer" data-reveal>
              {t.principle.closer}
              <em>{t.principle.closerNote}</em>
            </p>
          </div>
        </section>

        {/* 5. Por que a SigmaCX — a camada que ja roda e a que esta em obra. */}
        <section className="inv-section inv-why inv-x" id="sigma">
          <div className="inv-editorial" data-reveal>
            <span className="section-index"><i>{t.why.index}</i> / {t.why.eyebrow}</span>
            <h2 className="inv-h2">{t.why.title}</h2>
            <Lead text={t.why.lead} />
          </div>

          <div className="inv-cards inv-cards--2" data-reveal>
            {t.why.cards.map((card, index) => (
              <article className="inv-card inv-card--layer" key={card.title}>
                <div className={`inv-layer-art inv-layer-art--${index}`} aria-hidden="true"><span /><span /><span /></div>
                <span className="inv-card__k">{card.k}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>

          {/* Validacao e conformidade no componente de seguranca da home: a
              orbita com o cadeado a esquerda, o texto, o fluxo de protecao e
              as certificacoes a direita (classes de globals.css). */}
          <div className="inv-trust security-frame" data-reveal>
            <div className="security-orbit" aria-hidden="true">
              <div className="security-core">
                <span className="security-core__lock"><i /></span>
                <strong>LGPD</strong>
                <small>DATA / SECURE</small>
              </div>
            </div>
            <div className="security-copy">
              <span className="section-index">{t.why.validationLabel} / {t.why.complianceLabel}</span>
              <p>{rich(t.why.validation, false)}</p>
              <p>{t.why.tech}</p>
              <div className="security-flow" aria-label={t.why.techLabel}>
                {t.why.flow.map((step, index) => (
                  <Fragment key={step}>
                    {index ? <i aria-hidden="true" /> : null}
                    <span><small>0{index + 1}</small>{step}</span>
                  </Fragment>
                ))}
              </div>
              <div className="cert-row">
                {t.why.compliance.map((mark) => <span key={mark}>{mark}</span>)}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Material completo — o sumario do que existe atras do NDA e o
            pedido de acesso. */}
        <section className="inv-gate" id="material">
          <div className="inv-x inv-gate__grid">
            <div data-reveal>
              <span className="section-index"><i>{t.gate.index}</i> / {t.gate.eyebrow}</span>
              <h2 className="inv-h2">{t.gate.title}</h2>
              <Lead text={t.gate.lead} />
              <div className="inv-toc">
                <span className="inv-toc__head">{t.gate.tocTitle}</span>
                <ol>
                  {t.gate.toc.map((item) => <li key={item}>{item}</li>)}
                </ol>
              </div>
            </div>

            <div data-reveal>
              {sent ? (
                <div className="inv-sent">
                  <h3>{f.sentTitle}</h3>
                  <p>
                    {f.sentBody} <a href={`mailto:${INVESTORS_MAIL}`}>{INVESTORS_MAIL}</a>.
                  </p>
                </div>
              ) : (
                <form className="inv-form" onSubmit={submit} noValidate>
                  <div className="inv-form__row">
                    <label className="inv-field">
                      <span>{f.name}</span>
                      <input type="text" value={form.name} placeholder={f.namePlaceholder}
                        autoComplete="name" onChange={(event) => set("name", event.target.value)} />
                    </label>
                    <label className="inv-field">
                      <span>{f.email}</span>
                      <input type="email" value={form.email} placeholder={f.emailPlaceholder}
                        autoComplete="email" onChange={(event) => set("email", event.target.value)} />
                    </label>
                  </div>
                  <div className="inv-form__row">
                    <label className="inv-field">
                      <span>{f.company}</span>
                      <input type="text" value={form.company} placeholder={f.companyPlaceholder}
                        autoComplete="organization" onChange={(event) => set("company", event.target.value)} />
                    </label>
                    <label className="inv-field">
                      <span>{f.role}</span>
                      <input type="text" value={form.role} placeholder={f.rolePlaceholder}
                        autoComplete="organization-title" onChange={(event) => set("role", event.target.value)} />
                    </label>
                  </div>
                  <Select
                    label={f.profile}
                    value={form.profile || f.profiles[0]}
                    options={f.profiles}
                    onChange={(profile) => set("profile", profile)}
                  />
                  <label className="inv-field">
                    <span>{f.message}</span>
                    <textarea rows={3} value={form.message} placeholder={f.messagePlaceholder}
                      onChange={(event) => set("message", event.target.value)} />
                  </label>
                  <label className="inv-consent">
                    <input type="checkbox" checked={form.consent}
                      onChange={(event) => set("consent", event.target.checked)} />
                    <span className="inv-consent__box" aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4"
                        strokeLinecap="round" strokeLinejoin="round"><path d="M3.4 8.4l3 3 6.2-6.6" /></svg>
                    </span>
                    <span className="inv-consent__text">
                      {f.consent}{" "}
                      <Link to={href("/politica-de-privacidade", lang)}>{f.consentLink}</Link>
                      {f.consentEnd}
                    </span>
                  </label>
                  <p className="inv-form__error" role="alert">{error ? f.required : ""}</p>
                  <button className="pill pill--primary" type="submit">
                    {f.submit} <span aria-hidden="true">→</span>
                  </button>
                  <p className="inv-small">{f.note}</p>
                </form>
              )}
            </div>
          </div>
        </section>

        <InvestorLogin t={t.login} open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    </PageShell>
  );
}
