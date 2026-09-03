import { createElement, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

export type Lang = "pt" | "en" | "es";
export const LANGS: Lang[] = ["pt", "en", "es"];

/** Idioma a partir do prefixo da rota: /en/... , /es/... ; sem prefixo = pt. */
export function langFromPath(pathname: string): Lang {
  const seg = pathname.split("/")[1];
  return seg === "en" || seg === "es" ? seg : "pt";
}

export function useLang(): Lang {
  return langFromPath(useLocation().pathname);
}

/** Prefixa um caminho interno com o idioma (pt nao tem prefixo). */
export function href(path: string, lang: Lang): string {
  if (lang === "pt") return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** Caminho sem o prefixo de idioma, para trocar de idioma mantendo a pagina. */
export function stripLang(pathname: string): string {
  const m = pathname.match(/^\/(en|es)(\/.*)?$/);
  return m ? m[2] || "/" : pathname;
}

/** Escolhe a variante do idioma num dicionario {pt,en,es}. */
export function pick<T>(dict: Record<Lang, T>, lang: Lang): T {
  return dict[lang] ?? dict.pt;
}

export const HTML_LANG: Record<Lang, string> = { pt: "pt-BR", en: "en", es: "es" };

/**
 * Texto com marcacao leve vindo dos JSON de conteudo: **negrito** e *italico*.
 * Devolve nos React (sem HTML cru).
 */
export function rich(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(m[1] !== undefined ? createElement("strong", { key: i++ }, m[1]) : createElement("em", { key: i++ }, m[2]));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
