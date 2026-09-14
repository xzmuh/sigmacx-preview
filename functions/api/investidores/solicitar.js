/**
 * POST /api/investidores/solicitar: pedido de acesso do formulario do site.
 *
 * Guarda o pedido no KV e manda ao aprovador (env APPROVER_EMAIL) um e-mail
 * com "Sim" e "Nao". Os botoes levam um token assinado (finalidade
 * "decision") que aponta para o pedido; a decisao acontece em
 * /investidores/decisao, com confirmacao.
 *
 * Contra spam: campo isca ("website", invisivel para pessoas), limite de
 * pedidos por IP e um pedido por e-mail a cada 15 minutos. Nesses casos a
 * resposta e a mesma de sucesso, para o robo nao aprender o que foi barrado.
 */

import { sign, isAllowed, devLogAllowed, NO_STORE } from '../../_lib/auth.js';
import { sendMail } from '../../_lib/mail.js';

const REQUEST_TTL_SEC = 30 * 24 * 60 * 60;
const DECISION_TTL_SEC = 14 * 24 * 60 * 60;
const IP_LIMIT_PER_HOUR = 5;

const LIMITS = { name: 120, email: 254, company: 160, role: 120, profile: 80, message: 2000 };

function clean(value, max) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
}

function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const ok = () => Response.json({ ok: true }, { headers: NO_STORE });

export async function onRequestPost(context) {
  const { request, env } = context;
  const secret = env.AUTH_SESSION_SECRET;
  if (!secret || !env.INVESTIDORES || !env.APPROVER_EMAIL) {
    return Response.json({ error: 'config' }, { status: 500, headers: NO_STORE });
  }

  let body;
  try { body = await request.json(); } catch { body = {}; }

  if (clean(body?.website, 200)) return ok(); // isca preenchida: robo

  const person = {
    name: clean(body?.name, LIMITS.name),
    email: clean(body?.email, LIMITS.email).toLowerCase(),
    company: clean(body?.company, LIMITS.company),
    role: clean(body?.role, LIMITS.role),
    profile: clean(body?.profile, LIMITS.profile),
    message: clean(body?.message, LIMITS.message),
  };
  const lang = ['pt', 'en', 'es'].includes(body?.lang) ? body.lang : 'pt';

  if (!person.name || !person.company || body?.consent !== true || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(person.email)) {
    return Response.json({ error: 'invalid' }, { status: 400, headers: NO_STORE });
  }

  const kv = env.INVESTIDORES;
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const hour = Math.floor(Date.now() / 3600000);
  const ipKey = `rl:ip:${ip}:${hour}`;
  const ipCount = Number((await kv.get(ipKey)) || 0);
  if (ipCount >= IP_LIMIT_PER_HOUR) return ok();
  await kv.put(ipKey, String(ipCount + 1), { expirationTtl: 3600 * 2 });

  const mailKey = `rl:mail:${person.email}`;
  if (await kv.get(mailKey)) return ok();
  await kv.put(mailKey, '1', { expirationTtl: 15 * 60 });

  /* Quem ja tem acesso nao gera outro pedido para o aprovador. */
  if (await isAllowed(env, person.email)) return ok();

  const now = Date.now();
  const id = randomId();
  await kv.put(`req:${id}`, JSON.stringify({ id, person, lang, status: 'pending', createdAt: now }), { expirationTtl: REQUEST_TTL_SEC });

  const token = await sign({ id, exp: Math.floor(now / 1000) + DECISION_TTL_SEC }, secret, 'decision');
  const origin = new URL(request.url).origin;
  const link = (acao) => `${origin}/investidores/decisao?t=${encodeURIComponent(token)}&acao=${acao}`;

  const devLog = devLogAllowed(request, env);
  if (devLog) console.log(`[pedido] ${person.email} aprovar: ${link('sim')}`);
  context.waitUntil(sendMail(env, 'request_approval', {
    to: env.APPROVER_EMAIL,
    person,
    approveUrl: link('sim'),
    rejectUrl: link('nao'),
  }, devLog));

  return ok();
}
