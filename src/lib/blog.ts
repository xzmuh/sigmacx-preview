/**
 * Indice e conteudo do blog. Os textos vivem em content/blog/<slug>/<lang>.json
 * (importados do WordPress); este modulo so os organiza.
 */
export type Lang = "pt" | "en" | "es";

export type PostBlock =
  | { t: "h"; lvl: number; text: string }
  | { t: "html"; html: string }
  | { t: "img"; src: string; alt?: string }
  | { t: "video"; src: string };

export type PostDoc = {
  title: string;
  lang: Lang;
  date: string;
  description: string;
  cover: string;
  blocks: PostBlock[];
};

export type PostIndexEntry = {
  slug: string;
  category: CategorySlug;
  date: string;
  cover: string;
  titles: Record<Lang, string>;
};

export type CategorySlug = "agentes-de-ia" | "dados-e-insights" | "produtos";

export const CATEGORIES: Record<CategorySlug, { label: string; /** slug usado no WordPress (rota /category/...) */ wp: string }> = {
  "agentes-de-ia": { label: "Agentes de IA", wp: "agentes-de-ia-pt" },
  "dados-e-insights": { label: "Dados e Insights", wp: "dados-e-insights" },
  produtos: { label: "Produtos", wp: "produtos" },
};

export function categoryFromWpSlug(wp: string): CategorySlug | null {
  const hit = (Object.entries(CATEGORIES) as [CategorySlug, { wp: string }][]).find(([, c]) => c.wp === wp);
  return hit ? hit[0] : null;
}

import indexJson from "../../content/blog/index.json";
const docs = import.meta.glob<PostDoc>("../../content/blog/*/*.json", { eager: true, import: "default" });

export const POSTS: PostIndexEntry[] = (indexJson as PostIndexEntry[])
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export function getPost(slug: string, lang: Lang = "pt"): PostDoc | null {
  const key = Object.keys(docs).find((k) => k.endsWith(`/blog/${slug}/${lang}.json`));
  return key ? docs[key] : null;
}

export function formatDate(iso: string, lang: Lang = "pt"): string {
  if (!iso) return "";
  const locale = lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US";
  return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
}

/* ----------------------------------------------------------------- leitura */

export type Author = { photo: string; name: string; role: string };

/** Conteudo do artigo ja limpo: corpo, e o autor quando o import trouxe um. */
export type Article = { blocks: PostBlock[]; author: Author | null };

/** Texto puro de um trecho de HTML (para resumos e para reconhecer padroes). */
function textOf(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlText(block: PostBlock | undefined): string | null {
  return block && block.t === "html" ? textOf(block.html) : null;
}

/**
 * O import do WordPress arrastou o rodape do site junto com o corpo: a partir
 * do titulo "Conheca mais" (e do paragrafo institucional que o antecede) tudo
 * e menu, endereco e copyright. Cortamos ali.
 */
const FOOTER_HEADING = /^(conhe[çc]a mais|conozca m[áa]s|learn more)$/i;
/** O cartao do autor veio como foto + rotulo "Autor" + nome + cargo. */
const AUTHOR_LABEL = /^(autor|author)$/i;

export function readArticle(doc: PostDoc): Article {
  let blocks = doc.blocks.slice();

  const footer = blocks.findIndex((b) => b.t === "h" && FOOTER_HEADING.test(b.text.trim()));
  if (footer > 0) {
    const before = htmlText(blocks[footer - 1]);
    blocks = blocks.slice(0, before && /^SigmaCX\b/i.test(before) ? footer - 1 : footer);
  }

  let author: Author | null = null;
  for (let i = 0; i < blocks.length - 2; i += 1) {
    const photo = blocks[i];
    if (photo.t !== "img") continue;
    const label = htmlText(blocks[i + 1]);
    if (!label || !AUTHOR_LABEL.test(label)) continue;
    const name = htmlText(blocks[i + 2]);
    if (!name) continue;
    // O cargo so entra se o bloco seguinte for mesmo uma linha curta de texto.
    const next = htmlText(blocks[i + 3]);
    const role = next && next.length <= 80 ? next : "";
    author = { photo: photo.src, name, role };
    blocks = [...blocks.slice(0, i), ...blocks.slice(i + (role ? 4 : 3))];
    break;
  }

  return { blocks, author };
}

/** Resumo do post: a descricao quando existe, senao o primeiro paragrafo. */
export function excerptOf(doc: PostDoc | null, max = 190): string {
  if (!doc) return "";
  if (doc.description) return doc.description;
  for (const block of doc.blocks) {
    if (block.t !== "html") continue;
    const text = textOf(block.html);
    if (text.length < 60) continue;
    return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
  }
  return "";
}

/** Quantos posts por categoria (numero ao lado do chip e da lista lateral). */
export function categoryCounts(): Record<CategorySlug, number> {
  const counts = { "agentes-de-ia": 0, "dados-e-insights": 0, produtos: 0 } as Record<CategorySlug, number>;
  POSTS.forEach((post) => {
    counts[post.category] += 1;
  });
  return counts;
}
