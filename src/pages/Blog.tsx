import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageShell, useReveal } from "../site/PageShell";
import { SplitText } from "../site/ui";
import { SectionTransition } from "../site/SectionTransition";
import {
  CATEGORIES,
  POSTS,
  categoryFromWpSlug,
  excerptOf,
  formatDate,
  getPost,
  type CategorySlug,
  type PostIndexEntry,
} from "../lib/blog";
import { href, pick, useLang, type Lang } from "../lib/i18n";
import ui from "../../content/ui.json";

const dict = ui as Record<Lang, typeof ui.pt>;
type BlogDict = typeof ui.pt.blog;
type Filter = "todos" | CategorySlug;

const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategorySlug[];
const heroCopy = {
  pt: { featured: "Artigo mais recente", search: "Busque por conteúdos", subtitle: "Insights sobre IA, dados e experiência do cliente.", empty: "Nenhum conteúdo encontrado.", results: "Resultados da busca" },
  en: { featured: "Latest article", search: "Search articles", subtitle: "Insights on AI, data and customer experience.", empty: "No articles found.", results: "Search results" },
  es: { featured: "Artículo más reciente", search: "Busca contenidos", subtitle: "Insights sobre IA, datos y experiencia del cliente.", empty: "No se encontraron contenidos.", results: "Resultados de búsqueda" },
};
const normalizeSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const detailsCopy = {
  pt: { featured: "Artigo em destaque", benefits: ["Conteúdo prático", "Por especialistas", "Sempre atualizado"], insight: "Ideias para transformar", ai: "IA que entende" },
  en: { featured: "Featured article", benefits: ["Practical content", "By experts", "Always up to date"], insight: "Ideas to transform", ai: "AI that understands" },
  es: { featured: "Artículo destacado", benefits: ["Contenido práctico", "Por especialistas", "Siempre actualizado"], insight: "Ideas para transformar", ai: "IA que entiende" },
};

function BlogIcon({ kind }: { kind: "book" | "people" | "bulb" | "chart" | "spark" }) {
  const paths = {
    book: "M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15",
    people: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    bulb: "M9 18h6m-5 3h4m-5-6c0-3-3-3-3-7a6 6 0 0 1 12 0c0 4-3 4-3 7v1H9Z",
    chart: "M4 20v-7h3v7Zm7 0V4h3v16Zm7 0V9h3v11Z",
    spark: "m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7ZM20 2v4m-2-2h4",
  };
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[kind]} /></svg>;
}

/**
 * Cartao do indice (mesma peca do "Leia tambem" do artigo).
 *
 * `wide` e o post mais recente: a imagem vai para a esquerda e sobra espaco
 * para o resumo. Um indice em que todos os cartoes tem o mesmo tamanho obriga
 * o leitor a escolher; a razao de existir do indice e apontar o mais novo.
 */
export function PostCard({
  post,
  lang,
  t,
  wide = false,
}: {
  post: PostIndexEntry;
  lang: Lang;
  t: BlogDict;
  wide?: boolean;
}) {
  const title = post.titles[lang] || post.titles.pt;
  const excerpt = wide ? excerptOf(getPost(post.slug, lang)) : "";

  return (
    <Link className={`bl-card${wide ? " bl-card--wide" : ""}`} to={href(`/blog/${post.slug}`, lang)}>
      <div className="bl-card__media">
        {post.cover ? <img src={post.cover} alt={title} loading="lazy" decoding="async" /> : null}
        <span className="bl-card__cat">{t.categories[post.category]}</span>
      </div>
      <div className="bl-card__body">
        {post.date ? (
          <time className="bl-card__date" dateTime={post.date}>
            {formatDate(post.date, lang)}
          </time>
        ) : null}
        <h3 className="bl-card__title">{title}</h3>
        {excerpt ? <p className="bl-card__excerpt">{excerpt}</p> : null}
        <span className="bl-card__cta">
          {t.read}
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

/** Lista do blog. Em /category/<slug-wp> abre ja filtrada, como no site original. */
export default function Blog() {
  useReveal();
  const lang = useLang();
  const t = pick(dict, lang).blog;
  const { category } = useParams();
  const initial: Filter = (category && categoryFromWpSlug(category)) || "todos";
  const [filter, setFilter] = useState<Filter>(initial);
  const [query, setQuery] = useState("");
  useEffect(() => setFilter(initial), [initial]);

  const copy = heroCopy[lang];
  const details = detailsCopy[lang];
  const lead = POSTS[0];
  const search = normalizeSearch(query.trim());
  const filtering = filter !== "todos" || Boolean(search);
  const visible = POSTS.filter((post) =>
    (filtering || post.slug !== lead?.slug) &&
    (filter === "todos" || post.category === filter) &&
    (!search || normalizeSearch(`${post.titles[lang] || post.titles.pt} ${excerptOf(getPost(post.slug, lang))}`).includes(search)),
  );
  const label = filter === "todos" ? t.title : t.categories[filter];

  return (
    <PageShell title={`${label} - Sigma CX`} description={t.description}>
      <section className="sx-hero sx-dark bl-hero-section">
        <div className="sx-shell bl-hero">
          <div className="bl-hero__intro">
          <h1 className="sx-h1 bl-hero__title"><SplitText text={t.title} /></h1>
          <p className="sx-lead bl-hero__lead">{copy.subtitle}</p>
          <form className="bl-search" role="search" onSubmit={(event) => {
            event.preventDefault();
            document.getElementById("blog-results")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
            <input type="search" aria-label={copy.search} placeholder={copy.search} value={query} onChange={(event) => setQuery(event.target.value)} aria-controls="blog-results" />
            <button type="submit" aria-label={copy.search}><span aria-hidden="true">→</span></button>
          </form>
          <div className="bl-chips" role="group" aria-label={t.filter}>
            <button
              type="button"
              aria-pressed={filter === "todos"}
              className={`bl-chip${filter === "todos" ? " is-active" : ""}`}
              onClick={() => setFilter("todos")}
            >
              {t.all}
            </button>
            {CATEGORY_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                className={`bl-chip${filter === key ? " is-active" : ""}`}
                onClick={() => setFilter(key)}
              >
                {t.categories[key]}
              </button>
            ))}
          </div>
          <ul className="bl-benefits">
            {(["book", "people", "bulb"] as const).map((kind, index) => (
              <li key={kind}><span className="bl-benefits__icon"><BlogIcon kind={kind} /></span><span>{details.benefits[index]}</span></li>
            ))}
          </ul>
          </div>
          {lead ? (
            <div className="bl-featured">
              <div className="bl-featured__orbit" aria-hidden="true"><i /><i /></div>
              <p className="bl-featured__label"><span aria-hidden="true">★</span>{details.featured}</p>
              <Link className={`bl-featured__card${lead.cover ? "" : " bl-featured__card--no-cover"}`} to={href(`/blog/${lead.slug}`, lang)}>
                {lead.cover ? <img className="bl-featured__image" src={lead.cover} alt="" fetchPriority="high" decoding="async" /> : null}
                <div className="bl-featured__body">
                  {lead.date ? <time dateTime={lead.date}>{formatDate(lead.date, lang)}</time> : null}
                  <h2>{lead.titles[lang] || lead.titles.pt}</h2>
                  <p>{excerptOf(getPost(lead.slug, lang))}</p>
                  <span className="bl-featured__cta">{t.read}<span aria-hidden="true">→</span></span>
                </div>
              </Link>
              <div className="bl-featured__note"><span className="bl-featured__note-icon"><BlogIcon kind="chart" /></span><span><small>{details.insight}</small><strong>{t.categories[lead.category]}</strong></span></div>
              <div className="bl-featured__ai"><BlogIcon kind="spark" /><span>{details.ai}</span></div>
            </div>
          ) : null}
        </div>
      </section>

      <SectionTransition to="light" />

      <section className="sx-section sx-section--tight" id="blog-results" aria-label={search ? copy.results : label}>
        <div className="sx-shell" data-reveal>
          {visible.length ? (
              <div className="bl-grid">
                {visible.map((post) => (
                  <PostCard key={post.slug} post={post} lang={lang} t={t} />
                ))}
              </div>
          ) : (
            <p className="bl-empty" role="status">{search ? copy.empty : t.empty}</p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
