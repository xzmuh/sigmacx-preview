/**
 * Envio de e-mail pelo Web App do Apps Script "SigmaCX Investidores"
 * (apps-script/investidores.gs). Toda chamada leva o segredo compartilhado;
 * o script recusa qualquer pedido sem ele.
 *
 * Acoes: send_login_code, request_approval, access_approved, access_rejected,
 * trello_card. Devolve a resposta do script ("sent", "unauthorized"...),
 * "skipped" quando o envio nao esta configurado ou "error".
 *
 * O resultado de cada envio fica no KV em "diag:mail:<acao>" por 3 dias, sem
 * endereco e sem segredo: e o jeito de saber por que um e-mail nao chegou.
 * Ler: npx --yes wrangler@3 kv key get --binding INVESTIDORES "diag:mail:request_approval"
 */

async function record(env, action, result) {
  const line = `[e-mail] ${action}: ${JSON.stringify(result)}`;
  console.log(line);
  if (!env.INVESTIDORES) return;
  try {
    await env.INVESTIDORES.put(`diag:mail:${action}`, JSON.stringify({ ...result, at: new Date().toISOString() }), { expirationTtl: 3 * 24 * 60 * 60 });
  } catch { /* diagnostico nunca derruba o envio */ }
}

export async function sendMail(env, action, payload, devLog = false) {
  const url = env.AUTH_MAIL_URL;
  const secret = env.AUTH_MAIL_SECRET;
  if (!url || !secret) {
    if (devLog) console.log(`[e-mail] ${action}: envio nao configurado`);
    return 'skipped';
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, secret, ...payload }),
    });
    const text = (await response.text()).replace(/\s+/g, ' ').trim();
    const reply = text.slice(0, 80);
    await record(env, action, {
      status: response.status,
      redirected: response.redirected,
      finalHost: new URL(response.url || url).host,
      reply: text.slice(0, 300),
    });
    if (devLog) console.log(`[e-mail] ${action} para ${payload.to}: ${reply}`);
    return reply;
  } catch (error) {
    await record(env, action, { error: String(error).slice(0, 300) });
    return 'error';
  }
}
