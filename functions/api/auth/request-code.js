/**
 * POST /api/auth/request-code, passo 1 do login.
 *
 * Recebe { email, lang }. Se o e-mail estiver em AUTH_ALLOWED_EMAILS, gera um
 * codigo de 8 caracteres, manda por e-mail e devolve um "desafio": token
 * assinado com o e-mail e o HASH do codigo (nunca o codigo). O navegador
 * reenvia o desafio no passo 2.
 *
 * Fora da lista, devolve { allowed: false } e a tela avisa na hora. Isso
 * revela se um e-mail esta na lista; e a mesma escolha do hub: clareza para
 * o investidor vale mais do que esconder uma lista curta e nominal.
 */

import { sign, hashCode, generateCode, isAllowed, devLogAllowed, NO_STORE } from '../../_lib/auth.js';
import { sendMail } from '../../_lib/mail.js';

const CODE_TTL_SEC = 10 * 60;

async function sendCodeEmail(env, to, code, lang, expiresAt, devLog) {
  /* So para testar local (.dev.vars + localhost): mostra o codigo no
     terminal do wrangler. Ver devLogAllowed em _lib/auth.js. */
  if (devLog) console.log(`[login investidor] codigo de ${to}: ${code}`);
  await sendMail(env, 'send_login_code', { to, code, expiresAt, lang }, devLog);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const secret = env.AUTH_SESSION_SECRET;
  if (!secret) return Response.json({ error: 'config' }, { status: 500, headers: NO_STORE });

  let body;
  try { body = await request.json(); } catch { body = {}; }
  const email = String(body?.email || '').trim().toLowerCase();
  const lang = ['pt', 'en', 'es'].includes(body?.lang) ? body.lang : 'pt';

  const looksLikeEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (!looksLikeEmail || !(await isAllowed(env, email))) {
    return Response.json({ allowed: false }, { headers: NO_STORE });
  }

  const code = generateCode();
  const exp = Math.floor(Date.now() / 1000) + CODE_TTL_SEC;
  const challenge = await sign({ email, codeHash: await hashCode(code, secret), exp }, secret, 'challenge');

  /* Envio em segundo plano: a tela avanca para o codigo sem esperar o
     Apps Script, que leva 1 a 2 segundos. */
  context.waitUntil(sendCodeEmail(env, email, code, lang, exp, devLogAllowed(request, env)));

  return Response.json({ allowed: true, challenge }, { headers: NO_STORE });
}
