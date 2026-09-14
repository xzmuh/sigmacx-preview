/**
 * GET /api/auth/me: quem esta logado.
 *
 * O cookie e HttpOnly, entao a pagina descobre a sessao por aqui. Devolve o
 * e-mail e o fim da sessao (epoch em segundos), que a faixa "Confidencial"
 * da area mostra como "acesso ate".
 */

import { readSession, NO_STORE } from '../../_lib/auth.js';

export async function onRequestGet(context) {
  const session = await readSession(context.request, context.env);
  if (!session) return Response.json({ error: 'unauthenticated' }, { status: 401, headers: NO_STORE });
  return Response.json({ email: session.email, exp: session.exp }, { headers: NO_STORE });
}
