/**
 * Portao da area do investidor, na borda da Cloudflare.
 *
 * O site e publico; so a area logada e trancada. Duas coisas passam por aqui:
 *
 * 1. A rota da pagina (/investidores/area, /en/... e /es/...). Sem sessao, a
 *    pessoa volta para /investidores?entrar=1, que abre o login por codigo.
 * 2. O conteudo confidencial (/api/investidores/*, menos /solicitar). Sem sessao, 401. Os
 *    numeros NAO estao no JavaScript publico do site: saem so desta API,
 *    entao nao da para le-los abrindo o codigo da pagina.
 *
 * O resto do site nem chega a rodar esta funcao: public/_routes.json limita
 * as Functions a /api/* e as rotas da area.
 *
 * Falha FECHADA: sem AUTH_SESSION_SECRET no ambiente, ninguem entra.
 */

import { readSession, NO_STORE } from './_lib/auth.js';

const AREA = /^\/(?:(en|es)\/)?investidores\/area\/?$/;

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  const area = url.pathname.match(AREA);
  if (area) {
    if (await readSession(request, env)) {
      const response = await next();
      /* A pagina logada nunca vai para cache compartilhado. */
      const headers = new Headers(response.headers);
      headers.set('cache-control', 'private, no-store');
      headers.set('x-robots-tag', 'noindex, nofollow');
      return new Response(response.body, { status: response.status, headers });
    }
    const prefix = area[1] ? `/${area[1]}` : '';
    return new Response(null, {
      status: 302,
      headers: { location: `${prefix}/investidores?entrar=1`, ...NO_STORE },
    });
  }

  /* O pedido de acesso vem de quem ainda nao tem acesso: e a unica rota
     publica dentro de /api/investidores/. */
  if (url.pathname.startsWith('/api/investidores/') && url.pathname !== '/api/investidores/solicitar') {
    if (!(await readSession(request, env))) {
      return Response.json({ error: 'unauthenticated' }, { status: 401, headers: NO_STORE });
    }
  }

  return next();
}
