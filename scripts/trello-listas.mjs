/**
 * Mostra os quadros e listas do Trello e grava a lista escolhida para os
 * cards de investidor aprovado.
 *
 *   npm run trello:listas -- --key CHAVE --token TOKEN
 *   npm run trello:listas -- --usar ID_DA_LISTA
 *
 * Chave e token: trello.com/power-ups/admin > seu Power-Up > API key, e o
 * link "Token" ao lado da chave. Ficam em .producao.vars (fora do git) e vao
 * para a Cloudflare no proximo `npm run publicar`.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROD_VARS = join(ROOT, ".producao.vars");
const args = process.argv.slice(2);
const arg = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

function readVars() {
  if (!existsSync(PROD_VARS)) return { header: "", vars: {} };
  const lines = readFileSync(PROD_VARS, "utf8").split(/\r?\n/);
  const header = lines.filter((l) => l.startsWith("#")).join("\n");
  const vars = Object.fromEntries(lines.filter((l) => /^[A-Z_][A-Z0-9_]*=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]));
  return { header, vars };
}
function saveVars(header, vars) {
  writeFileSync(PROD_VARS, `${header || "# Segredos de PRODUCAO da Cloudflare Pages. Fora do git."}\n${Object.entries(vars).map(([k, v]) => `${k}=${v}`).join("\n")}\n`);
}

const { header, vars } = readVars();
if (arg("--key")) vars.TRELLO_KEY = arg("--key");
if (arg("--token")) vars.TRELLO_TOKEN = arg("--token");
if (!vars.TRELLO_KEY || !vars.TRELLO_TOKEN) {
  console.error("Falta a chave ou o token. Rode: npm run trello:listas -- --key CHAVE --token TOKEN");
  process.exit(1);
}

const api = async (path) => {
  const url = `https://api.trello.com/1${path}${path.includes("?") ? "&" : "?"}key=${vars.TRELLO_KEY}&token=${vars.TRELLO_TOKEN}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Trello respondeu ${response.status}: ${(await response.text()).slice(0, 120)}`);
  return response.json();
};

try {
  if (arg("--usar")) {
    const list = await api(`/lists/${arg("--usar")}?fields=name,idBoard`);
    const board = await api(`/boards/${list.idBoard}?fields=name`);
    vars.TRELLO_LIST_ID = list.id;
    saveVars(header, vars);
    console.log(`Cards de aprovados vao cair em: ${board.name} > ${list.name}`);
    console.log("Rode `npm run publicar` para levar para o site.");
  } else {
    saveVars(header, vars);
    const boards = await api("/members/me/boards?filter=open&fields=name&lists=open&list_fields=name");
    for (const board of boards) {
      console.log(`\n${board.name}`);
      for (const list of board.lists || []) console.log(`  ${list.id}  ${list.name}`);
    }
    console.log("\nEscolha a lista e rode: npm run trello:listas -- --usar ID_DA_LISTA");
  }
} catch (error) {
  console.error(String(error.message || error));
  process.exit(1);
}
