/**
 * SigmaCX Investidores: envio dos e-mails da area do investidor.
 *
 * Web App do Google Apps Script chamado pelas Cloudflare Pages Functions do
 * site (functions/api/...). So envia se o segredo bater: nunca vira relay
 * aberto. O segredo NAO fica no codigo: fica em Configuracoes do projeto >
 * Propriedades do script > MAIL_SECRET.
 *
 * Acoes (POST JSON com { action, secret, ... }):
 *   send_login_code    { to, code, expiresAt, lang }
 *   request_approval   { to, person: { name, email, company, role, profile, message }, approveUrl, rejectUrl }
 *   access_approved    { to, name, loginUrl, lang }
 *   access_rejected    { to, name, lang }
 *   trello_card        { to: e-mail do quadro, title, description }
 *
 * Visual: o do site. Fundo navy, cartao navy claro, destaque verde da marca,
 * fonte do sistema (cliente de e-mail nao carrega Plus Jakarta). Tabelas e
 * estilo inline porque o Outlook desenha com o motor do Word.
 *
 * Arquivo gerado por scripts/gerar-apps-script.mjs a partir de
 * apps-script/investidores.template.gs (o logo entra em base64).
 */

var TIMEZONE = 'America/Sao_Paulo';
var SENDER_NAME = 'SigmaCX';
var SITE_URL = 'https://sigmacx.pages.dev';

var C = {
  page: '#050b19',
  card: '#0a142c',
  cardSoft: '#111d38',
  line: '#1f2c4a',
  text: '#eef3f8',
  muted: '#9ea9bd',
  faint: '#6f7c8e',
  green: '#b9ff9b',
  greenInk: '#0a142c',
  blue: '#5da6ff'
};
var FONT = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
var MONO = "Consolas, 'SF Mono', Menlo, monospace";

var LOGO_WHITE_B64 = '__LOGO_B64__';

/* ------------------------------------------------------------------ */
/* Textos por idioma (os e-mails do investidor saem no idioma do site). */

var I18N = {
  pt: {
    codeSubject: 'Seu código de acesso · SigmaCX Investidores',
    codeKicker: 'ÁREA DO INVESTIDOR',
    codeTitle: 'Seu código de acesso',
    codeLead: 'Use o código abaixo para entrar na área do investidor da SigmaCX.',
    codeLabel: 'CÓDIGO',
    codeValid: 'válido até',
    codeTz: 'horário de Brasília',
    codeIgnore: 'Se você não pediu este acesso, ignore este e-mail.',
    approvedSubject: 'Seu acesso à área do investidor foi aprovado',
    approvedTitle: 'Acesso aprovado',
    approvedLead: 'Seu pedido de acesso à área do investidor da SigmaCX foi aprovado.',
    approvedHow: 'Clique no botão, digite este e-mail e você recebe um código de acesso.',
    approvedCta: 'Entrar na área do investidor',
    rejectedSubject: 'Seu pedido de acesso à SigmaCX',
    rejectedTitle: 'Pedido de acesso',
    rejectedLead: 'Recebemos seu pedido de acesso à área do investidor. Neste momento, não conseguimos liberar o material.',
    rejectedHow: 'Se quiser conversar, responda este e-mail.',
    hello: 'Olá',
    footer: 'Material confidencial · SigmaCX'
  },
  en: {
    codeSubject: 'Your access code · SigmaCX Investors',
    codeKicker: 'INVESTOR AREA',
    codeTitle: 'Your access code',
    codeLead: 'Use the code below to sign in to the SigmaCX investor area.',
    codeLabel: 'CODE',
    codeValid: 'valid until',
    codeTz: 'Brasília time',
    codeIgnore: 'If you did not request this access, ignore this email.',
    approvedSubject: 'Your access to the investor area was approved',
    approvedTitle: 'Access approved',
    approvedLead: 'Your request to access the SigmaCX investor area was approved.',
    approvedHow: 'Click the button, enter this email and you will receive an access code.',
    approvedCta: 'Go to the investor area',
    rejectedSubject: 'Your SigmaCX access request',
    rejectedTitle: 'Access request',
    rejectedLead: 'We received your request to access the investor area. At this time, we are unable to share the material.',
    rejectedHow: 'If you would like to talk, reply to this email.',
    hello: 'Hello',
    footer: 'Confidential material · SigmaCX'
  },
  es: {
    codeSubject: 'Tu código de acceso · SigmaCX Inversores',
    codeKicker: 'ÁREA DEL INVERSOR',
    codeTitle: 'Tu código de acceso',
    codeLead: 'Usa el código de abajo para ingresar al área del inversor de SigmaCX.',
    codeLabel: 'CÓDIGO',
    codeValid: 'válido hasta las',
    codeTz: 'hora de Brasilia',
    codeIgnore: 'Si no pediste este acceso, ignora este e-mail.',
    approvedSubject: 'Tu acceso al área del inversor fue aprobado',
    approvedTitle: 'Acceso aprobado',
    approvedLead: 'Tu solicitud de acceso al área del inversor de SigmaCX fue aprobada.',
    approvedHow: 'Haz clic en el botón, escribe este e-mail y recibirás un código de acceso.',
    approvedCta: 'Ir al área del inversor',
    rejectedSubject: 'Tu solicitud de acceso a SigmaCX',
    rejectedTitle: 'Solicitud de acceso',
    rejectedLead: 'Recibimos tu solicitud de acceso al área del inversor. En este momento no podemos compartir el material.',
    rejectedHow: 'Si quieres conversar, responde este e-mail.',
    hello: 'Hola',
    footer: 'Material confidencial · SigmaCX'
  }
};

function t(lang) {
  return I18N[lang] || I18N.pt;
}

/* ------------------------------------------------------------------ */
/* Pecas do layout. */

/* Tudo que vem do formulario do site passa por aqui: sem isso, alguem
   colocaria HTML ou links falsos dentro do e-mail do aprovador. */
function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function safeUrl(url) {
  var value = String(url || '');
  return /^https:\/\/[^\s"'<>]+$/.test(value) ? value : SITE_URL;
}

function button(label, url, primary) {
  var bg = primary ? C.green : C.card;
  var fg = primary ? C.greenInk : C.text;
  var border = primary ? C.green : C.line;
  return '' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate">' +
      '<tr><td bgcolor="' + bg + '" style="background:' + bg + ';border:1px solid ' + border + ';border-radius:999px">' +
        '<a href="' + esc(safeUrl(url)) + '" target="_blank" style="display:inline-block;padding:14px 28px;font-family:' + FONT + ';font-size:14px;font-weight:700;color:' + fg + ';text-decoration:none;border-radius:999px">' + esc(label) + '&nbsp;&nbsp;&rarr;</a>' +
      '</td></tr>' +
    '</table>';
}

function layout(options) {
  var preheader = options.preheader || '';
  return '' +
  '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"></head>' +
  '<body style="margin:0;padding:0;background:' + C.page + '">' +
  '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:' + C.page + '">' + esc(preheader) + '</div>' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="' + C.page + '" style="background:' + C.page + '">' +
    '<tr><td align="center" style="padding:32px 16px">' +
      '<table role="presentation" width="560" cellpadding="0" cellspacing="0" bgcolor="' + C.card + '" style="width:560px;max-width:100%;background:' + C.card + ';border:1px solid ' + C.line + ';border-radius:20px">' +

        /* fio da marca no topo: verde para azul */
        '<tr><td style="padding:0;border-radius:20px 20px 0 0;overflow:hidden">' +
          '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
            '<td height="3" bgcolor="' + C.green + '" style="height:3px;background:' + C.green + ';font-size:0;line-height:0;border-radius:20px 0 0 0">&nbsp;</td>' +
            '<td height="3" bgcolor="' + C.blue + '" style="height:3px;background:' + C.blue + ';font-size:0;line-height:0;border-radius:0 20px 0 0">&nbsp;</td>' +
          '</tr></table>' +
        '</td></tr>' +

        '<tr><td style="padding:28px 36px 8px">' +
          '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
            '<td align="left" valign="middle"><img src="cid:logo" alt="SigmaCX" width="132" style="display:block;width:132px;height:auto;border:0" /></td>' +
            '<td align="right" valign="middle" style="font-family:' + MONO + ';font-size:10px;letter-spacing:2px;color:' + C.green + '">' + esc(options.kicker || '') + '</td>' +
          '</tr></table>' +
        '</td></tr>' +

        '<tr><td style="padding:28px 36px 0">' +
          '<h1 style="margin:0;font-family:' + FONT + ';font-size:26px;line-height:1.2;font-weight:600;letter-spacing:-0.5px;color:' + C.text + '">' + esc(options.title) + '</h1>' +
        '</td></tr>' +

        '<tr><td style="padding:14px 36px 32px;font-family:' + FONT + ';font-size:15px;line-height:1.6;color:' + C.muted + '">' + options.body + '</td></tr>' +

        '<tr><td style="padding:18px 36px 22px;border-top:1px solid ' + C.line + ';font-family:' + MONO + ';font-size:10px;letter-spacing:1.5px;color:' + C.faint + '">' + esc(options.footer || 'SIGMACX') + '</td></tr>' +

      '</table>' +
    '</td></tr>' +
  '</table>' +
  '</body></html>';
}

function logoBlob() {
  return Utilities.newBlob(Utilities.base64Decode(LOGO_WHITE_B64), 'image/png', 'logo.png');
}

function send(to, subject, html, text) {
  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: text,
    htmlBody: html,
    name: SENDER_NAME,
    inlineImages: { logo: logoBlob() }
  });
}

/* ------------------------------------------------------------------ */
/* E-mails. Cada build* devolve { subject, html, text } sem enviar nada,
   para a previa do repositorio (scripts/gerar-apps-script.mjs) usar. */

function buildLoginCode(data) {
  var l = t(data.lang);
  var ms = Number(data.expiresAt) > 0 ? Number(data.expiresAt) * 1000 : Date.now() + 10 * 60 * 1000;
  var hora = Utilities.formatDate(new Date(ms), TIMEZONE, 'HH:mm');
  var code = String(data.code || '').replace(/[^A-Z0-9]/g, '');

  var body = '' +
    '<p style="margin:0 0 26px">' + esc(l.codeLead) + '</p>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="' + C.cardSoft + '" style="background:' + C.cardSoft + ';border:1px solid ' + C.line + ';border-radius:14px">' +
      '<tr><td align="center" style="padding:22px 16px 8px;font-family:' + MONO + ';font-size:10px;letter-spacing:2.4px;color:' + C.faint + '">' + esc(l.codeLabel) + '</td></tr>' +
      '<tr><td align="center" style="padding:0 16px 10px;font-family:' + MONO + ';font-size:32px;font-weight:700;letter-spacing:6px;color:' + C.green + '">' + esc(code) + '</td></tr>' +
      '<tr><td align="center" style="padding:0 16px 22px;font-family:' + FONT + ';font-size:13px;color:' + C.muted + '">' + esc(l.codeValid) + ' <b style="color:' + C.text + '">' + hora + '</b> (' + esc(l.codeTz) + ')</td></tr>' +
    '</table>' +
    '<p style="margin:24px 0 0;font-size:13px;color:' + C.faint + '">' + esc(l.codeIgnore) + '</p>';

  return {
    subject: l.codeSubject,
    html: layout({ preheader: l.codeTitle + ': ' + code, kicker: l.codeKicker, title: l.codeTitle, body: body, footer: l.footer }),
    text: l.codeTitle + ': ' + code + '\n' + l.codeValid + ' ' + hora + ' (' + l.codeTz + ').\n\n' + l.codeIgnore
  };
}

function buildRequestApproval(data) {
  var p = data.person || {};
  var rows = [
    ['Nome', p.name],
    ['E-mail', p.email],
    ['Empresa / fundo', p.company],
    ['Cargo', p.role],
    ['Perfil', p.profile],
    ['Interesse', p.message]
  ].filter(function (row) { return String(row[1] || '').trim(); });

  var table = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 28px">';
  for (var i = 0; i < rows.length; i++) {
    table += '<tr>' +
      '<td valign="top" style="padding:12px 14px 12px 0;border-top:1px solid ' + C.line + ';font-family:' + MONO + ';font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:' + C.faint + ';width:130px">' + esc(rows[i][0]) + '</td>' +
      '<td valign="top" style="padding:12px 0;border-top:1px solid ' + C.line + ';font-family:' + FONT + ';font-size:14px;line-height:1.55;color:' + C.text + ';word-break:break-word">' + esc(rows[i][1]).replace(/\n/g, '<br>') + '</td>' +
    '</tr>';
  }
  table += '</table>';

  var body = '' +
    '<p style="margin:0 0 22px">Um novo pedido de acesso chegou pelo formulário do site.</p>' +
    table +
    '<table role="presentation" cellpadding="0" cellspacing="0"><tr>' +
      '<td style="padding:0 12px 0 0">' + button('Sim, aprovar', data.approveUrl, true) + '</td>' +
      '<td>' + button('Não', data.rejectUrl, false) + '</td>' +
    '</tr></table>' +
    '<p style="margin:22px 0 0;font-size:12px;line-height:1.55;color:' + C.faint + '">Cada botão abre uma página para confirmar a decisão. O link vale uma vez só.</p>';

  var title = 'Pedido de acesso: ' + (p.name || p.email || 'sem nome');
  return {
    subject: 'Pedido de acesso · ' + (p.name || p.email || '') + (p.company ? ' (' + p.company + ')' : ''),
    html: layout({ preheader: (p.name || '') + ' · ' + (p.company || '') + ' pediu acesso à área do investidor', kicker: 'APROVAÇÃO', title: title, body: body, footer: 'SIGMACX · ÁREA DO INVESTIDOR' }),
    text: title + '\n\n' + rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') +
      '\n\nAprovar: ' + safeUrl(data.approveUrl) + '\nRecusar: ' + safeUrl(data.rejectUrl)
  };
}

function buildAccessApproved(data) {
  var l = t(data.lang);
  var name = String(data.name || '').trim().split(/\s+/)[0];
  var loginUrl = safeUrl(data.loginUrl);
  var body = '' +
    '<p style="margin:0 0 6px;color:' + C.text + ';font-size:16px">' + esc(l.hello + (name ? ', ' + name : '') + ',') + '</p>' +
    '<p style="margin:0 0 10px">' + esc(l.approvedLead) + '</p>' +
    '<p style="margin:0 0 28px">' + esc(l.approvedHow) + '</p>' +
    button(l.approvedCta, loginUrl, true);
  return {
    subject: l.approvedSubject,
    html: layout({ preheader: l.approvedLead, kicker: l.codeKicker, title: l.approvedTitle, body: body, footer: l.footer }),
    text: l.approvedLead + '\n\n' + l.approvedHow + '\n' + loginUrl
  };
}

function buildAccessRejected(data) {
  var l = t(data.lang);
  var name = String(data.name || '').trim().split(/\s+/)[0];
  var body = '' +
    '<p style="margin:0 0 6px;color:' + C.text + ';font-size:16px">' + esc(l.hello + (name ? ', ' + name : '') + ',') + '</p>' +
    '<p style="margin:0 0 10px">' + esc(l.rejectedLead) + '</p>' +
    '<p style="margin:0">' + esc(l.rejectedHow) + '</p>';
  return {
    subject: l.rejectedSubject,
    html: layout({ preheader: l.rejectedLead, kicker: l.codeKicker, title: l.rejectedTitle, body: body, footer: l.footer }),
    text: l.rejectedLead + '\n\n' + l.rejectedHow
  };
}

/* ------------------------------------------------------------------ */
/* Entrada do Web App. */

function reply(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}

function validEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value || ''));
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply('bad_request');
  }

  var secret = PropertiesService.getScriptProperties().getProperty('MAIL_SECRET');
  if (!secret || data.secret !== secret) return reply('unauthorized');
  if (!validEmail(data.to)) return reply('bad_request');

  var mail;
  if (data.action === 'send_login_code') mail = buildLoginCode(data);
  else if (data.action === 'request_approval') mail = buildRequestApproval(data);
  else if (data.action === 'access_approved') mail = buildAccessApproved(data);
  else if (data.action === 'access_rejected') mail = buildAccessRejected(data);
  else if (data.action === 'trello_card') {
    /* E-mail para o quadro do Trello: o assunto vira o titulo do card e o
       texto vira a descricao. Sem HTML e sem logo, que o Trello ignoraria. */
    MailApp.sendEmail({ to: data.to, subject: String(data.title || 'Investidor aprovado').slice(0, 250), body: String(data.description || ''), name: SENDER_NAME });
    return reply('sent');
  }
  else return reply('ignored');

  send(data.to, mail.subject, mail.html, mail.text);
  return reply('sent');
}

/* Sem GET: abrir a URL no navegador nao faz nada. */
function doGet() {
  return reply('ok');
}

/* Rode UMA vez pelo editor para autorizar o envio de e-mail. Manda um
   e-mail de teste com o layout do codigo para a propria conta. */
function autorizar() {
  var me = Session.getActiveUser().getEmail();
  var mail = buildLoginCode({ code: 'TESTE123', expiresAt: Math.floor(Date.now() / 1000) + 600, lang: 'pt' });
  send(me, '[teste] ' + mail.subject, mail.html, mail.text);
}
