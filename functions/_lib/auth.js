/**
 * Nucleo de criptografia do login por codigo da area do investidor.
 * Mesma receita do hub-de-mkt e do treinamento-sigmacx
 * (treinamento-sigmacx/docs/login-por-codigo-reutilizavel.md).
 *
 * Roda nas Cloudflare Pages Functions, que expoem a Web Crypto API padrao.
 * E SEM ESTADO: nada fica guardado no servidor. O que precisa sobreviver
 * entre requisicoes viaja num token assinado com HMAC-SHA256 e um segredo
 * que so o servidor conhece (env AUTH_SESSION_SECRET). O segredo faz o
 * papel do banco.
 *
 * Pastas com "_" sao ignoradas pelo roteador das Pages Functions: isto e
 * biblioteca compartilhada, nao rota.
 */

const enc = new TextEncoder();

/* base64url (sem '+', '/', '='): cabe em cookie e em JSON sem escape. */
function b64urlFromBytes(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlToBytes(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '==='.slice((b64.length + 3) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function b64urlFromString(str) { return b64urlFromBytes(enc.encode(str)); }
function b64urlToString(str) { return new TextDecoder().decode(b64urlToBytes(str)); }

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return b64urlFromBytes(new Uint8Array(sig));
}

/* Comparacao em tempo constante: um "===" vaza, pelo tempo de resposta,
   quantos caracteres iniciais o atacante acertou. */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* SHA-256(codigo + segredo). O desafio guarda ISTO, nunca o codigo: ele
   pode ir ao navegador sem entregar o codigo, e o servidor ainda confere. */
async function hashCode(code, secret) {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(`${code}.${secret}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/*
 * Todo token tem uma FINALIDADE ("challenge" ou "session"), que entra no
 * HMAC e vai gravada no proprio token. Sem isso, o desafio do passo 1, que
 * qualquer um recebe so digitando um e-mail da lista, tem e-mail e validade
 * assinados com o mesmo segredo e passaria como cookie de sessao sem codigo
 * nenhum. Com a finalidade no HMAC, um tipo de token nunca valida como o
 * outro, mesmo que alguem troque o campo `typ` no payload.
 */
/* "decision" e o link de aprovar/recusar que vai ao e-mail do aprovador. */
const PURPOSES = new Set(['challenge', 'session', 'decision']);

/** Assina um objeto para uma finalidade: "<payload base64url>.<hmac>". */
async function sign(obj, secret, purpose) {
  if (!PURPOSES.has(purpose)) throw new Error(`finalidade de token invalida: ${purpose}`);
  const payload = b64urlFromString(JSON.stringify({ ...obj, typ: purpose }));
  return `${payload}.${await hmac(secret, `${purpose}.${payload}`)}`;
}

/**
 * Devolve o objeto assinado, ou null se a assinatura nao bate para ESTA
 * finalidade, se o `typ` nao confere ou se `exp` falta ou ja passou.
 */
async function verify(token, secret, nowSec, purpose) {
  if (!PURPOSES.has(purpose)) return null;
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [payload, sig] = parts;
  if (!timingSafeEqual(sig, await hmac(secret, `${purpose}.${payload}`))) return null;

  let obj;
  try { obj = JSON.parse(b64urlToString(payload)); } catch { return null; }
  if (!obj || obj.typ !== purpose) return null;
  if (typeof obj.exp !== 'number' || nowSec > obj.exp) return null;
  return obj;
}

/* Codigo de 8 caracteres, e nao 6 digitos: o verify e sem estado e nao
   conta tentativas, entao quem segura a forca bruta e a entropia.
   32^8 = ~1,1 trilhao de combinacoes. Alfabeto de 32 simbolos sem os
   ambiguos I, O, 0 e 1; como 256 e multiplo de 32, "byte & 31" sorteia
   sem vies. Mesmo alfabeto do hub e do treinamento. */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

function generateCode(length = CODE_LENGTH) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += CODE_ALPHABET[b & 31];
  return out;
}

/* Caixa alta e so letras e numeros: o que a pessoa digita chega com
   minuscula, espaco colado ou hifen. Vale nos dois lados. */
function normalizeCode(input) {
  return String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/* Lista nominal de quem entra (env AUTH_ALLOWED_EMAILS, por virgula).
   Match exato de e-mail, sem liberar dominio inteiro: o material e sob NDA. */
function parseAllowlist(raw) {
  return new Set(
    String(raw || '')
      .split(/[,\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

/* Cookie proprio da area do investidor, para nao se misturar com outro
   login que um dia divida o dominio. */
const SESSION_COOKIE = 'sigmacx_investor';

/* HttpOnly (o JS nao le, protege de XSS), Secure, SameSite=Lax. */
function sessionCookie(token, maxAgeSec) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

function clearedSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

/*
 * Quem pode entrar: a lista fixa (env AUTH_ALLOWED_EMAILS) OU quem foi
 * aprovado pelo fluxo do formulario, gravado no KV como "allow:<email>".
 * O KV e o que deixa a aprovacao valer na hora, sem redeploy.
 */
async function isAllowed(env, email) {
  const address = String(email || '').trim().toLowerCase();
  if (!address) return false;
  if (parseAllowlist(env.AUTH_ALLOWED_EMAILS).has(address)) return true;
  if (!env.INVESTIDORES) return false;
  return (await env.INVESTIDORES.get(`allow:${address}`)) !== null;
}

/** Sessao valida do pedido, ou null. */
async function readSession(request, env) {
  const secret = env.AUTH_SESSION_SECRET;
  if (!secret) return null;
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const session = await verify(token, secret, Math.floor(Date.now() / 1000), 'session');
  if (!session || !session.email) return null;
  /* Quem saiu da lista perde o acesso na hora, sem esperar a sessao vencer. */
  if (!(await isAllowed(env, session.email))) return null;
  return session;
}

/* Log do codigo no terminal, so para testar local. Exige a variavel E um
   pedido vindo do proprio computador: se alguem esquecer AUTH_DEV_LOG_CODE
   ligada em producao, o codigo continua fora dos logs da Cloudflare. */
function devLogAllowed(request, env) {
  if (env.AUTH_DEV_LOG_CODE !== '1') return false;
  const host = new URL(request.url).hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

/* Idioma do pedido: o site usa /, /en e /es. */
function langPrefix(lang) {
  return lang === 'en' || lang === 'es' ? `/${lang}` : '';
}

const NO_STORE = { 'cache-control': 'no-store' };

export {
  sign, verify, hashCode, generateCode, normalizeCode, timingSafeEqual,
  parseAllowlist, isAllowed, sessionCookie, clearedSessionCookie, readCookie, readSession,
  langPrefix, devLogAllowed, SESSION_COOKIE, CODE_LENGTH, NO_STORE,
};
