import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageShell, useReveal } from "../site/PageShell";
import { SplitText } from "../site/ui";
import { SectionTransition } from "../site/SectionTransition";
import {
  CATEGORIES,
  POSTS,
  categoryCounts,
  excerptOf,
  formatDate,
  getPost,
  readArticle,
  type Author,
  type CategorySlug,
  type PostIndexEntry,
} from "../lib/blog";
import { href, pick, useLang, type Lang } from "../lib/i18n";
import ui from "../../content/ui.json";
import { PostCard } from "./Blog";
import NaoEncontrado from "./NaoEncontrado";

const dict = ui as Record<Lang, typeof ui.pt>;
type BlogDict = typeof ui.pt.blog;

const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategorySlug[];
const BODY_ID = "bl-article-body";

/**
 * Fio de 2px que enche conforme o artigo passa.
 *
 * Mede o *artigo*, nao a pagina: chega a 100% quando o texto acaba, nao quando
 * o rodape acaba — responde "quanto falta para ler", que e a pergunta do leitor.
 */
function useReadingProgress(targetId: string): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const update = () => {
      const box = target.getBoundingClientRect();
      const total = box.height - window.innerHeight * 0.5;
      const next =
        total <= 0
          ? box.bottom < window.innerHeight
            ? 1
            : 0
          : Math.min(1, Math.max(0, -box.top / total));
      setProgress(next);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  return progress;
}

export default function BlogPost() {
  const { slug = "" } = useParams();
  const lang = useLang();
  const t = pick(dict, lang).blog;
  const entry = POSTS.find((post) => post.slug === slug);
  const doc = entry ? getPost(slug, lang) || getPost(slug, "pt") : null;
  const progress = useReadingProgress(BODY_ID);
  useReveal();

  if (!entry || !doc) return <NaoEncontrado />;

  const { blocks, author } = readArticle(doc);
  const category = CATEGORIES[entry.category];
  const counts = categoryCounts();

  const pool = POSTS.filter((post) => post.slug !== slug);
  const recent = pool.slice(0, 3);
  const shown = new Set(recent.map((post) => post.slug));
  // Mesma categoria primeiro; os recentes da barra lateral saem da lista, a nao
  // ser que isso deixasse a faixa vazia (o acervo ainda e pequeno).
  const preferred = [
    ...pool.filter((post) => post.category === entry.category),
    ...pool.filter((post) => post.category !== entry.category),
  ];
  const fresh = preferred.filter((post) => !shown.has(post.slug));
  const related = (fresh.length ? fresh : preferred).slice(0, 3);

  return (
    <PageShell title={`${doc.title} - Sigma CX`} description={excerptOf(doc, 155) || doc.title}>
      <div className="bl-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      {/* Sem imagem de capa aqui, e de proposito: a capa do WordPress e uma
          prancheta montada em volta da mesma foto que abre o artigo, entao um
          hero mostraria a mesma imagem duas vezes antes do primeiro paragrafo.
          A capa continua valendo nos cartoes do indice e na barra lateral. */}
      <section className="sx-hero sx-dark">
        <div className="sx-hero__aura" aria-hidden="true" />
        <div className="sx-shell sx-hero__inner sx-hero__inner--left bl-head">
          <Link className="bl-back" to={href("/blog", lang)}>
            <span aria-hidden="true">←</span> {t.back}
          </Link>
          <div className="bl-head__meta">
            <Link className="bl-tag" to={href(`/category/${category.wp}`, lang)}>
              {t.categories[entry.category]}
            </Link>
            {doc.date ? <time dateTime={doc.date}>{formatDate(doc.date, lang)}</time> : null}
          </div>
          <h1 className="sx-h1 bl-head__title"><SplitText text={doc.title} /></h1>
        </div>
      </section>

      <SectionTransition to="light" />

      <section className="sx-section sx-section--tight">
        <div className="sx-shell bl-layout">
          <article className="bl-main">
            <div className="bl-prose" id={BODY_ID}>
              {blocks.map((block, index) => {
                if (block.t === "h") {
                  const Tag = `h${Math.min(Math.max(block.lvl, 2), 4)}` as "h2" | "h3" | "h4";
                  return <Tag key={index}>{block.text}</Tag>;
                }
                if (block.t === "img") {
                  return <img key={index} src={block.src} alt={block.alt ?? ""} loading="lazy" decoding="async" />;
                }
                if (block.t === "video") {
                  return /vimeo|youtu/.test(block.src) ? (
                    <div className="sx-video" key={index}>
                      <iframe src={block.src} title="Video" allow="autoplay; fullscreen" loading="lazy" />
                    </div>
                  ) : (
                    <div className="sx-video" key={index}>
                      <video src={block.src} controls playsInline />
                    </div>
                  );
                }
                // html vem do WordPress da propria empresa, ja sanitizado na importacao
                return <div key={index} dangerouslySetInnerHTML={{ __html: block.html }} />;
              })}
            </div>

            {author ? <AuthorCard author={author} label={t.author} /> : null}

            <ShareRow title={doc.title} t={t} />
          </article>

          <Sidebar lang={lang} t={t} recent={recent} counts={counts} active={entry.category} />
        </div>
      </section>

      {related.length ? (
        <section className="sx-section sx-section--tight">
          <div className="sx-shell" data-reveal>
            <h2 className="sx-h2 bl-related__title"><SplitText text={t.moreTitle} /></h2>
            <div className="bl-grid">
              {related.map((post) => (
                <PostCard key={post.slug} post={post} lang={lang} t={t} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}

/* ------------------------------------------------------------------ pecas */

/**
 * Cartao do autor, aberto pelo divisor "costurado" da referencia.
 *
 * O divisor e uma onda quadrada em SVG repetido, e nao uma borda: precisa
 * aguentar qualquer largura sobre o fundo claro, e um repeating-linear-gradient
 * so desenha listras.
 */
function AuthorCard({ author, label }: { author: Author; label: string }) {
  return (
    <div className="bl-author" data-reveal>
      <div className="bl-author__stitch" aria-hidden="true" />
      <div className="bl-author__row">
        {author.photo ? (
          <div className="bl-author__photo">
            <img src={author.photo} alt={author.name} width={72} height={72} loading="lazy" decoding="async" />
          </div>
        ) : null}
        <div className="bl-author__id">
          <p className="bl-author__name">{author.name}</p>
          {author.role ? <p className="bl-author__role">{author.role}</p> : null}
          <p className="bl-author__label">{label}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Barra de compartilhamento. A URL e lida na montagem em vez de montada a
 * partir de uma constante, para um deploy de preview compartilhar o proprio
 * link. `navigator.clipboard` nao existe em origem insegura, entao ha o
 * caminho antigo por tras — senao o botao nao faz nada e ninguem descobre.
 */
function ShareRow({ title, t }: { title: string; t: BlogDict }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setUrl(window.location.href), []);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        setCopied(document.execCommand("copy"));
      } finally {
        document.body.removeChild(field);
      }
    }
  };

  const links = [
    { key: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { key: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
  ];

  return (
    <div className="bl-share">
      <span className="bl-share__label">{t.share}</span>
      {links.map((link) => (
        <a
          key={link.key}
          className="bl-share__link"
          href={url ? link.url : undefined}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.key}
        </a>
      ))}
      <button type="button" className="bl-share__copy" onClick={copy}>
        {copied ? t.copied : t.copyLink}
      </button>
    </div>
  );
}

/**
 * Coluna lateral, grudada a partir de 1024px.
 *
 * `sticky` precisa de `align-self: start`, senao a grade estica a coluna ate a
 * altura da linha e nao sobra nada para ela percorrer (ver blog.css).
 */
function Sidebar({
  lang,
  t,
  recent,
  counts,
  active,
}: {
  lang: Lang;
  t: BlogDict;
  recent: PostIndexEntry[];
  counts: Record<CategorySlug, number>;
  active: CategorySlug;
}) {
  return (
    <aside className="bl-side">
      <h2 className="bl-side__title">{t.aboutTitle}</h2>
      <p className="bl-side__text">{t.aboutBody}</p>

      <Link className="bl-promo" to={href("/produto", lang)}>
        <span className="bl-promo__glow" aria-hidden="true" />
        <span className="bl-promo__inner">
          <span className="bl-promo__title">{t.discoverTitle}</span>
          <span className="bl-promo__cta">
            {t.discoverCta}
            <span aria-hidden="true">→</span>
          </span>
        </span>
      </Link>

      {recent.length ? (
        <div className="bl-side__block">
          <h2 className="bl-side__title">{t.recentTitle}</h2>
          <ul className="bl-recent">
            {recent.map((post) => (
              <li key={post.slug}>
                <Link className="bl-recent__item" to={href(`/blog/${post.slug}`, lang)}>
                  <span className="bl-recent__thumb">
                    {post.cover ? (
                      <img
                        src={post.cover}
                        alt={post.titles[lang] || post.titles.pt}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                  </span>
                  <span className="bl-recent__title">{post.titles[lang] || post.titles.pt}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="bl-side__block">
        <h2 className="bl-side__title">{t.categoriesTitle}</h2>
        <ul className="bl-cats">
          {CATEGORY_KEYS.map((key) => (
            <li key={key}>
              <Link
                className={`bl-cats__item${key === active ? " is-active" : ""}`}
                to={href(`/category/${CATEGORIES[key].wp}`, lang)}
              >
                <span>{t.categories[key]}</span>
                <span className="bl-cats__count">({counts[key]})</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
