/**
 * Publica o site na Cloudflare Pages com a area do investidor protegida.
 *
 *   npm run publicar                       publica (na 1a vez pergunta o que precisa)
 *   npm run publicar -- --emails "a@x.com,b@y.com"   troca a lista de acesso e publica
 *   npm run publicar -- --simular          confere tudo e faz o build, sem publicar
 *   npm run publicar -- --aprovador pessoa@empresa.com   quem recebe os pedidos
 *   npm run publicar -- --trello-email xxx@boards.trello.com   card no Trello a cada aprovado
 *   npm run publicar -- --apps-script https://script.google.com/macros/s/.../exec
 *                       liga o Apps Script "SigmaCX Investidores" (segredo em .apps-script.local.txt)
 *
 * O que ele faz, em ordem, e para no primeiro problema:
 *   1. confere a chave e o material cifrado (e recifra se content/private mudou)
 *   2. login na Cloudflare (so na primeira vez abre o navegador)
 *   3. cria o projeto no Pages, se ainda nao existir
 *   4. envia os segredos de producao (guardados em .producao.vars, fora do git)
 *   5. build e trava: se algum numero do material aparecer no build, cancela
 *   6. publica e testa no ar se a area e a API estao trancadas
 *
 * Ver docs/LOGIN-INVESTIDORES.md.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, rmSync, mkdtempSync } from "node:fs";
import { randomBytes, webcrypto as crypto } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEV_VARS = join(ROOT, ".dev.vars");
const PROD_VARS = join(ROOT, ".producao.vars");
const SEALED = join(ROOT, "functions", "_content", "investidores-area.enc.json");
const TOML = join(ROOT, "wrangler.toml");
const APPS_SCRIPT_SECRET_FILE = join(ROOT, ".apps-script.local.txt");
/* Chaves do .producao.vars que sao configuracao local, nao segredo da Cloudflare. */
const LOCAL_ONLY = new Set(["PAGES_PROJECT", "AUTH_MAIL_SCRIPT"]);
const PLAIN_DIR = join(ROOT, "content", "private");
const LANGS = ["pt", "en", "es"];
const WRANGLER = ["--yes", "wrangler@3"];

const args = process.argv.slice(2);
const SIMULATE = args.includes("--simular");
const arg = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const emailsArg = arg("--emails");

const step = (n, text) => console.log(`\n[${n}/6] ${text}`);
const ok = (text) => console.log(`      ok: ${text}`);
function fail(text) {
  console.error(`\n  PAROU: ${text}\n`);
  process.exit(1);
}

function readVars(file) {
  if (!existsSync(file)) return {};
  return Object.fromEntries(readFileSync(file, "utf8").split(/\r?\n/)
    .filter((l) => /^[A-Z_][A-Z0-9_]*=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]));
}

function writeVars(file, vars, header) {
  const body = Object.entries(vars).map(([k, v]) => `${k}=${v}`).join("\n");
  writeFileSync(file, `${header}\n${body}\n`);
}

function run(cmd, cmdArgs, { capture = false, allowFail = false } = {}) {
  const result = spawnSync(cmd, cmdArgs, {
    cwd: ROOT,
    shell: process.platform === "win32",
    encoding: "utf8",
    stdio: capture ? ["inherit", "pipe", "pipe"] : "inherit",
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  if (result.status !== 0 && !allowFail) {
    if (capture) console.error(output);
    fail(`o comando "${cmd} ${cmdArgs.join(" ")}" falhou.`);
  }
  return { status: result.status, output };
}
const wrangler = (cmdArgs, opts) => run("npx", [...WRANGLER, ...cmdArgs], opts);

async function ask(question, fallback) {
  if (!process.stdin.isTTY) return fallback;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(`      ${question}${fallback ? ` [${fallback}]` : ""}: `)).trim();
  rl.close();
  return answer || fallback;
}

const normalizeEmails = (raw) => [...new Set(String(raw).split(/[,\s;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];
const validEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

async function aesKey(hex) {
  return crypto.subtle.importKey("raw", Buffer.from(hex, "hex"), "AES-GCM", false, ["decrypt"]);
}
async function openSealed(hex) {
  const key = await aesKey(hex);
  const sealed = JSON.parse(readFileSync(SEALED, "utf8"));
  const out = {};
  for (const lang of LANGS) {
    const { iv, data } = sealed[lang];
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: Buffer.from(iv, "base64"), additionalData: new TextEncoder().encode(`investidores-area:${lang}`) },
      key, Buffer.from(data, "base64"),
    );
    out[lang] = Buffer.from(plain).toString("utf8");
  }
  return out;
}

/* Trechos do material que nao podem aparecer em nenhum arquivo publico:
   todo valor de metrica e celula de tabela com digito, mais os nomes das
   empresas comparaveis. */
function sensitiveNeedles(contentByLang) {
  const needles = new Set();
  for (const text of Object.values(contentByLang)) {
    const walk = (node) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== "object") return;
      if (typeof node.v === "string" && /\d/.test(node.v) && node.v.length >= 4) needles.add(node.v);
      if (Array.isArray(node.cells)) node.cells.forEach((c) => { if (/\d/.test(c) && c.length >= 5) needles.add(c); });
      if (node.type === "table" && node.mutedCol !== undefined) node.rows.forEach((r) => needles.add(r.cells[0]));
      Object.values(node).forEach(walk);
    };
    walk(JSON.parse(text));
  }
  return [...needles];
}

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? filesUnder(full) : [full];
  });
}

/* ------------------------------------------------------------------ */

console.log("\nPublicar SigmaCX na Cloudflare Pages" + (SIMULATE ? "  (SIMULACAO: nada vai para o ar)" : ""));

step(1, "Conferindo o material cifrado");
const dev = readVars(DEV_VARS);
let prod = readVars(PROD_VARS);
const contentKey = prod.INVESTOR_CONTENT_KEY || dev.INVESTOR_CONTENT_KEY;
if (!/^[0-9a-f]{64}$/i.test(contentKey || "")) fail("falta INVESTOR_CONTENT_KEY no .dev.vars. Sem ela o material nao abre.");
if (!existsSync(SEALED)) fail("falta functions/_content/investidores-area.enc.json. Rode: npm run cifrar:investidores");
let opened;
try { opened = await openSealed(contentKey); } catch { fail("a chave nao abre o material cifrado. Confira INVESTOR_CONTENT_KEY."); }
if (existsSync(PLAIN_DIR)) {
  const changed = LANGS.some((lang) => {
    const file = join(PLAIN_DIR, `investidores-area.${lang}.json`);
    return existsSync(file) && readFileSync(file, "utf8") !== opened[lang];
  });
  if (changed) {
    console.log("      content/private mudou desde a ultima cifragem: cifrando de novo");
    run("node", ["scripts/cifrar-investidores.mjs"]);
    opened = await openSealed(contentKey);
    ok("material recifrado. Lembre de commitar functions/_content/investidores-area.enc.json");
  }
}
ok("a chave abre o material nos 3 idiomas");

let project = prod.PAGES_PROJECT;
let productionDomain = "";
if (!SIMULATE) {
  step(2, "Login na Cloudflare");
  const who = wrangler(["whoami"], { capture: true, allowFail: true });
  if (/not authenticated/i.test(who.output)) {
    console.log("      Vai abrir o navegador. Entre na conta da Cloudflare e autorize.");
    wrangler(["login"]);
    if (/not authenticated/i.test(wrangler(["whoami"], { capture: true, allowFail: true }).output)) fail("o login nao foi concluido.");
  }
  ok("logado");
} else {
  step(2, "Login na Cloudflare (pulado na simulacao)");
}

step(3, "Projeto e segredos de producao");
if (!project) project = await ask("Nome do projeto no Cloudflare Pages", "sigmacx");
if (!/^[a-z0-9][a-z0-9-]{0,56}$/.test(project)) fail(`nome de projeto invalido: ${project} (so minusculas, numeros e hifen).`);

/* "nenhum": sem lista fixa, so entra quem for aprovado pelo formulario. */
const noFixedList = (emailsArg || prod.AUTH_ALLOWED_EMAILS) === "nenhum";
let emails = noFixedList ? [] : normalizeEmails(emailsArg || prod.AUTH_ALLOWED_EMAILS || "");
if (!emails.length && !noFixedList) emails = normalizeEmails(await ask("E-mails com acesso a area, separados por virgula", "murilo_agudos@hotmail.com"));
const invalid = emails.filter((e) => !validEmail(e));
if (invalid.length) fail(`e-mail invalido na lista: ${invalid.join(", ")}`);
if (!emails.length && !noFixedList) fail("a lista de e-mails esta vazia. Use --emails nenhum para deixar so os aprovados pelo formulario.");

let mailUrl = prod.AUTH_MAIL_URL || dev.AUTH_MAIL_URL;
let mailSecret = prod.AUTH_MAIL_SECRET || dev.AUTH_MAIL_SECRET;
let mailScript = prod.AUTH_MAIL_SCRIPT || "";
const appsScriptArg = arg("--apps-script");
if (appsScriptArg) {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(appsScriptArg)) fail("a URL do Apps Script deve terminar em /exec.");
  if (!existsSync(APPS_SCRIPT_SECRET_FILE)) fail("falta .apps-script.local.txt com o MAIL_SECRET do Apps Script novo.");
  const secretLine = readFileSync(APPS_SCRIPT_SECRET_FILE, "utf8").split(/\r?\n/).map((l) => l.trim()).find((l) => /^[0-9a-f]{32,}$/i.test(l));
  if (!secretLine) fail("nao achei o MAIL_SECRET em .apps-script.local.txt.");
  mailUrl = appsScriptArg;
  mailSecret = secretLine;
  mailScript = "investidores";
}
if (!mailUrl || !mailSecret) fail("faltam AUTH_MAIL_URL e AUTH_MAIL_SECRET: o codigo nao chegaria por e-mail.");

const approver = (arg("--aprovador") || prod.APPROVER_EMAIL || "").trim().toLowerCase();
const trelloEmail = (arg("--trello-email") || prod.TRELLO_EMAIL || "").trim().toLowerCase();
if (trelloEmail && !validEmail(trelloEmail)) fail(`e-mail do quadro do Trello invalido: ${trelloEmail}`);
if (approver && !validEmail(approver)) fail(`e-mail do aprovador invalido: ${approver}`);
/* O fluxo de pedido so vai ao ar com o Apps Script novo: o do treinamento nao
   conhece as acoes de aprovacao e gravaria os pedidos na planilha dele. */
if (!approver || mailScript !== "investidores") {
  fail("o formulario de pedido de acesso precisa de duas coisas antes de publicar:\n" +
    `  ${approver ? "ok" : "falta"}: aprovador      (--aprovador pessoa@empresa.com)\n` +
    `  ${mailScript === "investidores" ? "ok" : "falta"}: Apps Script novo (--apps-script https://script.google.com/macros/s/.../exec)`);
}

prod = {
  ...prod,
  PAGES_PROJECT: project,
  /* Segredo de sessao PROPRIO de producao, nunca o do .dev.vars. */
  AUTH_SESSION_SECRET: prod.AUTH_SESSION_SECRET || randomBytes(32).toString("hex"),
  /* Vazio nao sobrescreveria o segredo antigo na Cloudflare: "nenhum" nunca casa com e-mail. */
  AUTH_ALLOWED_EMAILS: noFixedList ? "nenhum" : emails.join(","),
  AUTH_MAIL_URL: mailUrl,
  AUTH_MAIL_SECRET: mailSecret,
  AUTH_MAIL_SCRIPT: mailScript,
  APPROVER_EMAIL: approver,
  TRELLO_EMAIL: trelloEmail,
  INVESTOR_CONTENT_KEY: contentKey,
};
writeVars(PROD_VARS, prod, "# Segredos de PRODUCAO da Cloudflare Pages. Gerado por scripts/publicar-cloudflare.mjs.\n# Fora do git (.gitignore). Guarde uma copia num cofre.");
ok(`projeto: ${project}`);
ok(noFixedList ? "sem lista fixa: so entra quem for aprovado pelo formulario" : `acesso fixo para: ${emails.join(", ")} (aprovados pelo formulario entram sozinhos)`);
ok(`pedidos de acesso vao para: ${approver}`);
if (trelloEmail) ok("Trello configurado pelo e-mail do quadro");
else if (prod.TRELLO_KEY && prod.TRELLO_TOKEN && prod.TRELLO_LIST_ID) ok("Trello configurado pela API");
else console.log("      aviso: Trello nao configurado (--trello-email endereco-do-quadro@boards.trello.com). A aprovacao funciona, so nao cria card.");
ok("segredos guardados em .producao.vars (fora do git)");

if (!SIMULATE) {
  const list = wrangler(["pages", "project", "list"], { capture: true });
  const exists = list.output.split(/\r?\n/).some((line) => line.split(/[│|\s]+/).includes(project));
  if (!exists) {
    console.log(`      criando o projeto "${project}" no Pages`);
    wrangler(["pages", "project", "create", project, "--production-branch", "main", "--compatibility-date", "2024-11-01"]);
  }
  ok("projeto existe no Pages");
  /* O endereco pages.dev pode ganhar sufixo se o nome ja existir em outra conta. */
  const row = wrangler(["pages", "project", "list"], { capture: true }).output.split(/\r?\n/)
    .find((line) => line.split(/[│|\s,]+/).includes(project));
  const domain = row && (row.match(/[a-z0-9-]+\.pages\.dev/) || [])[0];
  if (domain) productionDomain = domain;

  /* Banco dos aprovados (KV). Na primeira publicacao cria e grava o id no wrangler.toml. */
  const toml = readFileSync(TOML, "utf8");
  const currentId = (toml.match(/binding = "INVESTIDORES"\s*\nid = "([^"]+)"/) || [])[1];
  if (!currentId) fail("wrangler.toml sem o KV INVESTIDORES.");
  if (!/^[0-9a-f]{32}$/.test(currentId)) {
    let kvId = (wrangler(["kv", "namespace", "create", "INVESTIDORES"], { capture: true, allowFail: true }).output.match(/id = "([0-9a-f]{32})"/) || [])[1];
    if (!kvId) {
      const listed = wrangler(["kv", "namespace", "list"], { capture: true }).output;
      try {
        const json = JSON.parse(listed.slice(listed.indexOf("["), listed.lastIndexOf("]") + 1));
        kvId = (json.find((ns) => /INVESTIDORES/.test(ns.title) && /sigmacx/i.test(ns.title)) || {}).id;
      } catch { /* sem JSON */ }
    }
    if (!kvId) fail("nao consegui criar nem achar o KV INVESTIDORES na Cloudflare.");
    writeFileSync(TOML, toml.replace(`id = "${currentId}"`, `id = "${kvId}"`));
    ok("banco de aprovados criado. Commite o wrangler.toml");
  }
  ok("banco de aprovados ligado");

  const temp = mkdtempSync(join(tmpdir(), "sigmacx-secrets-"));
  const secretsFile = join(temp, "secrets.json");
  const secrets = Object.fromEntries(Object.entries(prod).filter(([key, value]) => !LOCAL_ONLY.has(key) && value));
  writeFileSync(secretsFile, JSON.stringify(secrets));
  try {
    wrangler(["pages", "secret", "bulk", secretsFile, "--project-name", project]);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
  ok("segredos enviados para a Cloudflare");
}

step(4, "Build");
run("npm", ["run", "build"]);
ok("dist gerada");

step(5, "Trava contra vazamento no build publico");
const needles = sensitiveNeedles(opened);
if (needles.length < 10) fail("nao consegui montar a lista de trechos confidenciais para conferir o build.");
const leaks = [];
for (const file of filesUnder(join(ROOT, "dist"))) {
  if (/\.(png|jpe?g|webp|avif|gif|mp4|webm|woff2?|ico)$/i.test(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const needle of needles) if (text.includes(needle)) leaks.push(`${needle}  em  ${file.slice(ROOT.length + 1)}`);
}
if (leaks.length) fail(`dado confidencial no build publico. Nada foi publicado.\n  ${leaks.slice(0, 10).join("\n  ")}`);
ok(`${needles.length} trechos do material conferidos: nenhum aparece no build`);

if (SIMULATE) {
  console.log("\nSimulacao concluida: tudo pronto para publicar. Rode sem --simular.\n");
  process.exit(0);
}

step(6, "Publicando e testando no ar");
const deploy = wrangler(["pages", "deploy", "dist", "--project-name", project, "--branch", "main", "--commit-dirty=true"], { capture: true });
console.log(deploy.output.split(/\r?\n/).filter((l) => /Uploaded|Compiled|Deployment complete|Success|https:\/\//.test(l)).join("\n"));
const deployUrl = (deploy.output.match(/https:\/\/[a-z0-9.-]+\.pages\.dev/g) || []).pop();
const base = `https://${productionDomain || `${project}.pages.dev`}`;

/* O deploy leva alguns segundos para propagar; tenta por ate ~1 minuto. */
async function probe(url) {
  for (let i = 0; i < 12; i++) {
    try {
      const r = await fetch(url, { redirect: "manual" });
      if (r.status !== 404 && r.status < 500) return r;
    } catch { /* ainda propagando */ }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return null;
}
const checks = [];
for (const origin of [...new Set([deployUrl, base].filter(Boolean))]) {
  const area = await probe(`${origin}/investidores/area`);
  const api = await probe(`${origin}/api/investidores/conteudo`);
  const areaOk = area && area.status === 302 && /\/investidores\?entrar=1$/.test(area.headers.get("location") || "");
  const apiText = api ? await api.text() : "";
  const apiOk = api && api.status === 401 && !needles.some((n) => apiText.includes(n));
  /* Pedido invalido de proposito: prova que a rota existe sem criar pedido nem mandar e-mail. */
  const form = await fetch(`${origin}/api/investidores/solicitar`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }).catch(() => null);
  const formOk = form && form.status === 400;
  checks.push([origin, areaOk && formOk, apiOk]);
  console.log(`      ${origin}\n        area sem login redireciona: ${areaOk ? "sim" : "NAO"}\n        conteudo sem login bloqueado: ${apiOk ? "sim" : "NAO"}\n        formulario de pedido respondendo: ${formOk ? "sim" : `NAO (${form ? form.status : "sem resposta"})`}`);
}
if (!checks.some(([, a, b]) => a && b)) {
  fail("o site subiu, mas o teste de protecao nao passou. Veja o painel da Cloudflare antes de divulgar o link.");
}

console.log(`
Pronto. Site no ar:
  ${base}
  Area do investidor: ${base}/investidores/area

Novos investidores: pedem pelo formulario em ${base}/investidores e voce aprova pelo e-mail.
Para usar o dominio proprio: Cloudflare > Workers & Pages > ${project} > Custom domains.
`);
