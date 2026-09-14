/**
 * GET /api/investidores/conteudo?lang=pt|en|es: o material sob NDA.
 *
 * O middleware so deixa chegar aqui com sessao valida, e esta funcao confere
 * de novo. O material vem CIFRADO (AES-256-GCM) de
 * functions/_content/investidores-area.enc.json, porque o repositorio de
 * preview e publico; a chave INVESTOR_CONTENT_KEY existe so no ambiente.
 * Para editar o texto: content/private (fora do git) e
 * `npm run cifrar:investidores`. Ver docs/LOGIN-INVESTIDORES.md.
 */

import sealed from '../../_content/investidores-area.enc.json';
import { readSession, NO_STORE } from '../../_lib/auth.js';

const LANGS = new Set(['pt', 'en', 'es']);

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* Decifrado uma vez por instancia e por chave: a chave nao muda entre pedidos. */
let cache = { hex: '', content: new Map() };

async function openLang(hex, lang) {
  if (cache.hex !== hex) cache = { hex, content: new Map() };
  if (cache.content.has(lang)) return cache.content.get(lang);

  const raw = new Uint8Array(hex.match(/../g).map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
  const { iv, data } = sealed[lang];
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(iv), additionalData: new TextEncoder().encode(`investidores-area:${lang}`) },
    key, b64ToBytes(data),
  );
  const content = new TextDecoder().decode(plain);
  cache.content.set(lang, content);
  return content;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!(await readSession(request, env))) {
    return Response.json({ error: 'unauthenticated' }, { status: 401, headers: NO_STORE });
  }

  const hex = String(env.INVESTOR_CONTENT_KEY || '');
  if (!/^[0-9a-f]{64}$/i.test(hex)) {
    return Response.json({ error: 'config' }, { status: 500, headers: NO_STORE });
  }

  const requested = new URL(request.url).searchParams.get('lang');
  const lang = LANGS.has(requested) ? requested : 'pt';
  try {
    return new Response(await openLang(hex, lang), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'private, no-store',
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  } catch {
    /* Chave errada ou arquivo corrompido: falha fechada, sem detalhe. */
    return Response.json({ error: 'config' }, { status: 500, headers: NO_STORE });
  }
}
