/**
 * GET /api/auth/logout?lang=pt|en|es: encerra a sessao.
 *
 * Zera o cookie e volta para a pagina publica de investidores no idioma de
 * quem saiu. Sair nao depende de estar logado.
 */

import { clearedSessionCookie, langPrefix, NO_STORE } from '../../_lib/auth.js';

export async function onRequestGet(context) {
  const lang = new URL(context.request.url).searchParams.get('lang');
  return new Response(null, {
    status: 302,
    headers: {
      location: `${langPrefix(lang)}/investidores`,
      'set-cookie': clearedSessionCookie(),
      ...NO_STORE,
    },
  });
}
