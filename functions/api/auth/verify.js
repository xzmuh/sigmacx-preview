/**
 * POST /api/auth/verify, passo 2 do login.
 *
 * Recebe { challenge, code }. Revalida o desafio (assinatura e validade),
 * confere o codigo contra o hash guardado nele e, se bater, grava o cookie
 * de sessao (assinado, HttpOnly, 7 dias).
 *
 * A lista e conferida de novo: se o e-mail saiu dela nesse meio tempo, nao
 * entra, mesmo com um desafio valido.
 */

import {
  verify, hashCode, normalizeCode, timingSafeEqual, sign, sessionCookie, isAllowed, NO_STORE,
} from '../../_lib/auth.js';

const SESSION_TTL_SEC = 7 * 24 * 60 * 60;

export async function onRequestPost(context) {
  const { request, env } = context;

  const secret = env.AUTH_SESSION_SECRET;
  if (!secret) return Response.json({ error: 'config' }, { status: 500, headers: NO_STORE });

  let body;
  try { body = await request.json(); } catch { body = {}; }
  const now = Math.floor(Date.now() / 1000);
  const data = await verify(String(body?.challenge || ''), secret, now, 'challenge');

  const fail = () => Response.json({ ok: false }, { status: 401, headers: NO_STORE });
  if (!data || !data.email || !data.codeHash) return fail();
  if (!(await isAllowed(env, data.email))) return fail();

  const attempt = await hashCode(normalizeCode(body?.code), secret);
  if (!timingSafeEqual(attempt, data.codeHash)) return fail();

  const exp = now + SESSION_TTL_SEC;
  const token = await sign({ email: data.email, exp }, secret, 'session');

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': sessionCookie(token, SESSION_TTL_SEC),
      ...NO_STORE,
    },
  });
}
