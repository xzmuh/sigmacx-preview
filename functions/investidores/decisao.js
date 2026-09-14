/**
 * /investidores/decisao?t=<token>&acao=sim|nao: aprovar ou recusar um pedido.
 *
 * GET mostra os dados do pedido e um botao de confirmacao. So o POST decide.
 * Isso importa: Outlook, Gmail e antivirus abrem sozinhos os links de um
 * e-mail para checar se sao seguros. Se o GET aprovasse, alguem seria
 * aprovado sem ninguem clicar.
 *
 * O token (finalidade "decision") so aponta para o pedido. Cada pedido e
 * decidido uma vez: depois disso o link mostra o que foi decidido.
 *
 * Aprovado: grava "allow:<email>" no KV (o login ja aceita na hora), cria o
 * card no Trello e manda o e-mail de aprovacao para a pessoa. Recusado: so
 * registra; a pessoa nao recebe e-mail (env SEND_REJECTION_EMAIL=1 liga).
 */

import { verify, devLogAllowed } from '../_lib/auth.js';
import { sendMail } from '../_lib/mail.js';
import { createApprovedCard } from '../_lib/trello.js';

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex, nofollow',
  /* O token esta na URL: nao vaza por Referer nem pode ir para dentro de iframe. */
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'DENY',
  'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
};

function page(title, inner, status = 200) {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>${esc(title)} · SigmaCX</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#050b19;color:#eef3f8;
    font-family:"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  .card{width:100%;max-width:560px;background:#0a142c;border:1px solid #1f2c4a;border-radius:20px;overflow:hidden}
  .bar{height:3px;background:linear-gradient(90deg,#b9ff9b,#5da6ff)}
  .in{padding:30px 34px 32px}
  .k{font:600 10px/1 Consolas,Menlo,monospace;letter-spacing:2px;color:#b9ff9b;text-transform:uppercase}
  h1{margin:14px 0 10px;font-size:26px;font-weight:600;letter-spacing:-.5px;line-height:1.2}
  p{margin:0 0 14px;color:#9ea9bd;font-size:15px;line-height:1.6}
  table{width:100%;border-collapse:collapse;margin:18px 0 26px}
  th{width:130px;padding:11px 12px 11px 0;border-top:1px solid #1f2c4a;text-align:left;vertical-align:top;
    font:600 10px/1.6 Consolas,Menlo,monospace;letter-spacing:1.5px;text-transform:uppercase;color:#6f7c8e}
  td{padding:11px 0;border-top:1px solid #1f2c4a;font-size:14px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
  .actions{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
  button{appearance:none;border:1px solid #b9ff9b;background:#b9ff9b;color:#0a142c;border-radius:999px;
    padding:14px 26px;font:700 14px "Segoe UI",Roboto,Arial,sans-serif;cursor:pointer}
  button.no{background:transparent;color:#eef3f8;border-color:#1f2c4a}
  a{color:#9ea9bd;font-size:13px}
  .ok{color:#b9ff9b}.warn{color:#ffad91}
</style></head><body><main class="card"><div class="bar"></div><div class="in">${inner}</div></main></body></html>`;
  return new Response(html, { status, headers: HEADERS });
}

function summary(person) {
  const rows = [
    ['Nome', person.name], ['E-mail', person.email], ['Empresa / fundo', person.company],
    ['Cargo', person.role], ['Perfil', person.profile], ['Interesse', person.message],
  ].filter(([, v]) => String(v || '').trim());
  return `<table>${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>`;
}

const invalid = () => page('Link inválido', `<div class="k">Área do investidor</div>
  <h1>Link inválido ou vencido</h1><p>Este link de decisão não vale mais. Os links valem por 14 dias.</p>`, 400);

async function load(env, token) {
  if (!env.AUTH_SESSION_SECRET || !env.INVESTIDORES) return null;
  const data = await verify(String(token || ''), env.AUTH_SESSION_SECRET, Math.floor(Date.now() / 1000), 'decision');
  if (!data || !data.id) return null;
  const raw = await env.INVESTIDORES.get(`req:${data.id}`);
  return raw ? JSON.parse(raw) : null;
}

function alreadyDecided(req) {
  const when = new Date(req.decidedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const word = req.status === 'approved' ? 'aprovado' : 'recusado';
  return page('Pedido já decidido', `<div class="k">Área do investidor</div>
    <h1>Este pedido já foi ${word}</h1><p>${esc(req.person.name)} (${esc(req.person.email)}) foi ${word} em ${esc(when)}.</p>`);
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const req = await load(env, url.searchParams.get('t'));
  if (!req) return invalid();
  if (req.status !== 'pending') return alreadyDecided(req);

  const approve = url.searchParams.get('acao') !== 'nao';
  const token = esc(url.searchParams.get('t'));
  const other = `?t=${encodeURIComponent(url.searchParams.get('t'))}&acao=${approve ? 'nao' : 'sim'}`;
  return page(approve ? 'Aprovar acesso' : 'Recusar acesso', `<div class="k">${approve ? 'Aprovação' : 'Recusa'}</div>
    <h1>${approve ? 'Aprovar' : 'Recusar'} o acesso de ${esc(req.person.name)}?</h1>
    <p>${approve
      ? 'Confirmando, o e-mail dela é liberado na área do investidor na hora, ela recebe o aviso de aprovação e o card entra no Trello.'
      : 'Confirmando, o pedido é encerrado e o e-mail não ganha acesso.'}</p>
    ${summary(req.person)}
    <form method="post" class="actions">
      <input type="hidden" name="t" value="${token}">
      <input type="hidden" name="acao" value="${approve ? 'sim' : 'nao'}">
      <button type="submit" class="${approve ? '' : 'no'}">${approve ? 'Confirmar aprovação' : 'Confirmar recusa'}</button>
      <a href="${esc(other)}">${approve ? 'Prefiro recusar' : 'Prefiro aprovar'}</a>
    </form>`);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let form;
  try { form = await request.formData(); } catch { return invalid(); }
  const req = await load(env, form.get('t'));
  if (!req) return invalid();
  if (req.status !== 'pending') return alreadyDecided(req);

  const approve = form.get('acao') === 'sim';
  const now = Date.now();
  req.status = approve ? 'approved' : 'rejected';
  req.decidedAt = now;
  await env.INVESTIDORES.put(`req:${req.id}`, JSON.stringify(req), { expirationTtl: 90 * 24 * 60 * 60 });

  const devLog = devLogAllowed(request, env);
  const origin = new URL(request.url).origin;
  const prefix = req.lang === 'en' || req.lang === 'es' ? `/${req.lang}` : '';

  if (!approve) {
    if (env.SEND_REJECTION_EMAIL === '1') {
      context.waitUntil(sendMail(env, 'access_rejected', { to: req.person.email, name: req.person.name, lang: req.lang }, devLog));
    }
    return page('Pedido recusado', `<div class="k">Recusa</div>
      <h1>Pedido recusado</h1><p>${esc(req.person.name)} (${esc(req.person.email)}) não recebeu acesso.</p>`);
  }

  await env.INVESTIDORES.put(`allow:${req.person.email}`, JSON.stringify({
    name: req.person.name, company: req.person.company, requestId: req.id, approvedAt: now,
  }));

  const [mail, trello] = await Promise.all([
    sendMail(env, 'access_approved', {
      to: req.person.email, name: req.person.name, lang: req.lang,
      loginUrl: `${origin}${prefix}/investidores?entrar=1`,
    }, devLog),
    createApprovedCard(env, req.person, now, devLog),
  ]);
  if (devLog) console.log(`[decisao] aprovado ${req.person.email}: e-mail=${mail} trello=${trello}`);

  const status = (value, okText, skipText) => value === 'sent' || value === 'ok'
    ? `<span class="ok">${okText}</span>`
    : value === 'skipped' ? `<span class="warn">${skipText}</span>` : `<span class="warn">falhou (${esc(value)})</span>`;

  return page('Acesso aprovado', `<div class="k">Aprovação</div>
    <h1>Acesso aprovado</h1>
    <p>${esc(req.person.name)} (${esc(req.person.email)}) já pode entrar na área do investidor.</p>
    <p>E-mail de aprovação: ${status(mail, 'enviado', 'envio não configurado')}<br>
    Card no Trello: ${status(trello, 'criado', 'Trello não configurado')}</p>`);
}
