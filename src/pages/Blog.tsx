import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageShell, useReveal } from "../site/PageShell";
import { SplitText } from "../site/ui";
import { SectionTransition } from "../site/SectionTransition";
import {
  CATEGORIES,
  POSTS,
  categoryCounts,
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
  useEffect(() => setFilter(initial), [initial]);

  const counts = categoryCounts();
  const visible = filter === "todos" ? POSTS : POSTS.filter((post) => post.category === filter);
  const [lead, ...rest] = visible;
  const label = filter === "todos" ? t.title : t.categories[filter];

  return (
    <PageShell title={`${label} - Sigma CX`} description={t.description}>
      <section className="sx-hero sx-dark">
        <div className="sx-hero__aura" aria-hidden="true" />
        <div className="sx-shell sx-hero__inner sx-hero__inner--left bl-hero">
          <p className="bl-eyebrow">{t.eyebrow}</p>
          <h1 className="sx-h1 bl-hero__title"><SplitText text={t.title} /></h1>
          <p className="sx-lead bl-hero__lead">{t.subtitle}</p>
        </div>
      </section>

      <SectionTransition to="light" />

      <section className="sx-section sx-section--tight">
        <div className="sx-shell" data-reveal>
          <div className="bl-chips" role="group" aria-label={t.filter}>
            <button
              type="button"
              aria-pressed={filter === "todos"}
              className={`bl-chip${filter === "todos" ? " is-active" : ""}`}
              onClick={() => setFilter("todos")}
            >
              {t.all}
              <span className="bl-chip__count">{POSTS.length}</span>
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
                <span className="bl-chip__count">{counts[key]}</span>
              </button>
            ))}
          </div>

          {lead ? (
            <>
              <div className="bl-lead">
                <PostCard post={lead} lang={lang} t={t} wide />
              </div>
              {rest.length ? (
                <div className="bl-grid">
                  {rest.map((post) => (
                    <PostCard key={post.slug} post={post} lang={lang} t={t} />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className="bl-empty">{t.empty}</p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
