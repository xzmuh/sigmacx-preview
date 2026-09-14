/**
 * Cifra o material da area do investidor para ele poder ir ao git.
 *
 * O repositorio de preview (origin) e PUBLICO. Os JSON com numeros, clientes
 * e condicoes da rodada nao podem ir em texto aberto: o texto fica em
 * content/private (fora do git) e o que vai para o repositorio e
 * functions/_content/investidores-area.enc.json, cifrado com AES-256-GCM.
 * A chave (INVESTOR_CONTENT_KEY) fica so no .dev.vars e nas variaveis de
 * ambiente da Cloudflare. A Function decifra na hora de responder.
 *
 * Uso:
 *   npm run cifrar:investidores          cifra content/private -> .enc.json
 *   npm run cifrar:investidores -- --abrir   decifra .enc.json -> content/private
 *
 * A chave vem de INVESTOR_CONTENT_KEY no ambiente ou no .dev.vars: 64
 * caracteres hexadecimais (32 bytes). Gere com:  openssl rand -hex 32
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PLAIN_DIR = join(ROOT, "content", "private");
const SEALED = join(ROOT, "functions", "_content", "investidores-area.enc.json");
const LANGS = ["pt", "en", "es"];

function readKey() {
  let hex = process.env.INVESTOR_CONTENT_KEY;
  const devVars = join(ROOT, ".dev.vars");
  if (!hex && existsSync(devVars)) {
    const line = readFileSync(devVars, "utf8").split(/\r?\n/).find((l) => l.startsWith("INVESTOR_CONTENT_KEY="));
    hex = line?.slice("INVESTOR_CONTENT_KEY=".length).trim();
  }
  if (!hex || !/^[0-9a-f]{64}$/i.test(hex)) {
    console.error("INVESTOR_CONTENT_KEY ausente ou invalida (64 hex). Defina no .dev.vars ou no ambiente.");
    process.exit(1);
  }
  return crypto.subtle.importKey("raw", Buffer.from(hex, "hex"), "AES-GCM", false, ["encrypt", "decrypt"]);
}

/* O idioma entra como dado autenticado: um bloco cifrado de "en" nao
   decifra se alguem troca-lo de lugar com o de "pt". */
const aad = (lang) => new TextEncoder().encode(`investidores-area:${lang}`);

const key = await readKey();

if (process.argv.includes("--abrir")) {
  const sealed = JSON.parse(readFileSync(SEALED, "utf8"));
  mkdirSync(PLAIN_DIR, { recursive: true });
  for (const lang of LANGS) {
    const { iv, data } = sealed[lang];
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: Buffer.from(iv, "base64"), additionalData: aad(lang) },
      key, Buffer.from(data, "base64"),
    );
    writeFileSync(join(PLAIN_DIR, `investidores-area.${lang}.json`), Buffer.from(plain));
  }
  console.log(`Decifrado em ${PLAIN_DIR}`);
} else {
  const out = { v: 1, alg: "AES-256-GCM" };
  for (const lang of LANGS) {
    const text = readFileSync(join(PLAIN_DIR, `investidores-area.${lang}.json`), "utf8");
    JSON.parse(text); // nao cifra JSON quebrado
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, additionalData: aad(lang) },
      key, new TextEncoder().encode(text),
    );
    out[lang] = { iv: Buffer.from(iv).toString("base64"), data: Buffer.from(data).toString("base64") };
  }
  mkdirSync(dirname(SEALED), { recursive: true });
  writeFileSync(SEALED, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`Cifrado em ${SEALED}`);
}
