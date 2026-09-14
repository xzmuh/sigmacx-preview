import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../site/PageShell";
import { useInvestorAreaMotion } from "../site/investorAreaMotion";
import { href, HTML_LANG, useLang } from "../lib/i18n";
import "../site/investidores.css";
import "../site/investidoresArea.css";

/**
 * Area logada do investidor: o material sob NDA, na mesma linguagem da pagina
 * publica /investidores.
 *
 * O conteudo NAO esta no JavaScript do site. Ele vem de
 * /api/investidores/conteudo, uma Cloudflare Pages Function que so responde
 * com sessao valida (functions/_middleware.js); os JSON ficam em
 * content/private e nunca devem ser importados por uma pagina. Sem sessao, a
 * pessoa volta para /investidores?entrar=1, que abre o login por codigo.
 */
type Metric = { k: string; v: string; d?: string; up?: boolean; small?: boolean };
type Block =
  | { type: "p" | "note" | "legal"; text: string }
  | { type: "metrics"; items: Metric[] }
  | { type: "table"; head: string[]; firstWidth?: string; mutedCol?: number; rows: { cells: string[]; sub?: string }[] }
  | { type: "bars"; items: { value: string; height: number; label: string }[] }
  | { type: "list"; items: string[] };
type Slide = { id: string; index: string; label: string; toc?: string; title: string; light?: boolean; blocks: Block[] };
type AreaContent = {
  meta: { title: string; description: string };
  heading: string;
  bar: { label: string; text: string; who: string; logout: string };
  tocTitle: string;
  slides: Slide[];
};
type Session = { email: string; exp: number };

/* So o titulo da aba enquanto o material carrega: nada confidencial. */
const LOADING_TITLE = { pt: "Área do investidor | SigmaCX", en: "Investor area | SigmaCX", es: "Área del inversor | SigmaCX" };

/** `**trecho**` do JSON sai em negrito claro sobre o texto apagado. */
function bold(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? <b key={index}>{part.slice(2, -2)}</b> : part,
  );
}

function Metrics({ items }: { items: Metric[] }) {
  return (
    <div className={`inv-metrics inv-metrics--${items.length}`}>
      {items.map((item) => (
        <div className="inv-metric" key={item.k + item.v}>
          <span className="inv-metric__k">{item.k}</span>
          <strong className={`inv-metric__v${item.small ? " is-small" : item.v.length > 9 ? " is-long" : ""}`}>
            {item.up ? <span className="inv-gradient">{item.v}</span> : item.v}
          </strong>
          {item.d ? <p className="inv-metric__d">{item.d}</p> : null}
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: Block, key: number) {
  switch (block.type) {
    case "p":
      return <p className="inv-slide__p" key={key}>{bold(block.text)}</p>;
    case "note":
      return <p className="inv-small inv-slide__note" key={key}>{block.text}</p>;
    case "legal":
      return <p className="inv-small inv-slide__legal" key={key}>{block.text}</p>;
    case "metrics":
      return <Metrics items={block.items} key={key} />;
    case "list":
      return (
        <ul className="inv-slide__list" key={key}>
          {block.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      );
    case "bars":
      return (
        <div className="inv-bars" key={key}>
          {block.items.map((bar) => (
            <div className="inv-bar" key={bar.label}>
              <b>{bar.value}</b>
              <i style={{ "--h": `${bar.height}%` } as CSSProperties} />
              <span>{bar.label}</span>
            </div>
          ))}
        </div>
      );
    case "table":
      return (
        <div className="inv-table" key={key}>
          <table>
            <thead>
              <tr>
                {block.head.map((cell, index) => (
                  <th key={cell} scope="col" style={index === 0 && block.firstWidth ? { width: block.firstWidth } : undefined}>
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.cells[0]}>
                  {row.cells.map((cell, index) =>
                    index === 0 ? (
                      <th key={index} scope="row">
                        <b>{cell}</b>
                        {row.sub ? <small>{row.sub}</small> : null}
                      </th>
                    ) : (
                      <td key={index} className={index === block.mutedCol ? "is-muted" : undefined}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default function InvestidoresArea() {
  const lang = useLang();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<{ content: AreaContent; session: Session } | null>(null);
  useInvestorAreaMotion(root, `${lang}:${data ? "ready" : "loading"}`);

  useEffect(() => {
    let cancelled = false;
    const toLogin = () => navigate(`${href("/investidores", lang)}?entrar=1`, { replace: true });
    (async () => {
      try {
        const [me, content] = await Promise.all([
          fetch("/api/auth/me", { credentials: "same-origin" }),
          fetch(`/api/investidores/conteudo?lang=${lang}`, { credentials: "same-origin" }),
        ]);
        if (!me.ok || !content.ok) throw new Error("unauthenticated");
        const next = { session: (await me.json()) as Session, content: (await content.json()) as AreaContent };
        if (!cancelled) setData(next);
      } catch {
        if (!cancelled) toLogin();
      }
    })();
    return () => { cancelled = true; };
  }, [lang, navigate]);

  /* Material sob NDA: fora dos buscadores. */
  useEffect(() => {
    const tag = document.createElement("meta");
    tag.setAttribute("name", "robots");
    tag.setAttribute("content", "noindex, nofollow");
    document.head.appendChild(tag);
    return () => tag.remove();
  }, []);

  const t = data?.content;
  const who = data && t
    ? t.bar.who
      .replace("{email}", data.session.email)
      .replace("{date}", new Date(data.session.exp * 1000).toLocaleDateString(HTML_LANG[lang]))
    : "";

  return (
    <PageShell title={t?.meta.title ?? LOADING_TITLE[lang]} description={t?.meta.description} endsLight={false} finalCta={false}>
      <div className="inv inv-area" ref={root}>
        <div className="inv-progress" aria-hidden="true" />

        {!t ? <div className="inv-area__loading" role="status" aria-label={LOADING_TITLE[lang]} /> : <>
        <header className="inv-area__top">
          <div className="inv-x">
            <h1 className="inv-area__sr">{t.heading}</h1>
            <div className="inv-area__bar" role="note">
              <span className="inv-area__bar-label">{t.bar.label}</span>
              <span className="inv-area__bar-text">{t.bar.text}</span>
              <span className="inv-area__bar-who">{who}</span>
              <a className="inv-area__logout" href={`/api/auth/logout?lang=${lang}`}>{t.bar.logout}</a>
            </div>
          </div>
        </header>

        <div className="inv-x inv-area__grid">
          <nav className="inv-area__toc" aria-label={t.tocTitle}>
            <span className="inv-toc__head">{t.tocTitle}</span>
            <ol>
              {t.slides.map((slide) => (
                <li key={slide.id}>
                  <a href={`#${slide.id}`}>
                    <span>{slide.index}</span>{slide.toc ?? slide.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="inv-area__body">
            {t.slides.map((slide) => (
              <section className={slide.light ? "inv-slide inv-slide--light" : "inv-slide"} id={slide.id} key={slide.id} aria-labelledby={`${slide.id}-title`}>
                <div data-reveal>
                  <span className="section-index"><i>{slide.index}</i> / {slide.label}</span>
                  <h2 className="inv-h2 inv-slide__title" id={`${slide.id}-title`}>{slide.title}</h2>
                </div>
                <div className="inv-slide__blocks" data-reveal>
                  {slide.blocks.map(renderBlock)}
                </div>
              </section>
            ))}
          </div>
        </div>
        </>}
      </div>
    </PageShell>
  );
}
