/**
 * Card no Trello quando um investidor e aprovado. Dois jeitos:
 *
 * 1. TRELLO_EMAIL: o endereco "E-mail para o quadro" do Trello (Menu >
 *    Configuracoes > E-mail para o quadro, ja escolhendo a lista). O Apps
 *    Script manda um e-mail para ele e o Trello cria o card. Nao precisa de
 *    chave de API.
 * 2. TRELLO_KEY + TRELLO_TOKEN + TRELLO_LIST_ID: API do Trello
 *    (`npm run trello:listas`).
 *
 * Sem nenhum dos dois, devolve "skipped": a aprovacao vale igual.
 */

import { sendMail } from './mail.js';

function cardText(person, approvedAt) {
  const when = new Date(approvedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const title = `${person.name}${person.company ? ` · ${person.company}` : ''} · aprovado`;
  const fields = [
    ['E-mail', person.email],
    ['Empresa / fundo', person.company],
    ['Cargo', person.role],
    ['Perfil', person.profile],
    ['Interesse', person.message],
  ]
    .filter(([, value]) => String(value || '').trim())
    .map(([label, value]) => `${label}: ${value}`);
  const description = [
    ...fields,
    '',
    `Status: aprovado em ${when}`,
    'Origem: formulário da área de investidores do site',
  ].join('\n');
  return { title, description };
}

export async function createApprovedCard(env, person, approvedAt, devLog = false) {
  const { title, description } = cardText(person, approvedAt);

  if (env.TRELLO_EMAIL) {
    const result = await sendMail(env, 'trello_card', { to: env.TRELLO_EMAIL, title, description }, devLog);
    return result === 'sent' ? 'ok' : result;
  }

  if (!env.TRELLO_KEY || !env.TRELLO_TOKEN || !env.TRELLO_LIST_ID) return 'skipped';
  const params = new URLSearchParams({
    key: env.TRELLO_KEY,
    token: env.TRELLO_TOKEN,
    idList: env.TRELLO_LIST_ID,
    name: title,
    desc: description,
    pos: 'top',
  });
  try {
    const response = await fetch(`https://api.trello.com/1/cards?${params}`, { method: 'POST' });
    return response.ok ? 'ok' : `error ${response.status}`;
  } catch {
    return 'error';
  }
}
