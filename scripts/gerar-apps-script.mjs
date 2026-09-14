/**
 * Gera apps-script/investidores.gs (o arquivo para colar no Google Apps
 * Script) a partir de apps-script/investidores.template.gs, embutindo o logo
 * em base64. Tambem gera a previa dos quatro e-mails em apps-script/previa/.
 *
 *   npm run apps-script
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = join(ROOT, "apps-script", "investidores.template.gs");
const OUT = join(ROOT, "apps-script", "investidores.gs");
const PREVIEW_DIR = join(ROOT, "apps-script", "previa");

/* Logo branco no dobro da largura exibida (132px), para ficar nitido em tela retina. */
const logo = await sharp(join(ROOT, "public", "media", "logo-white.png"))
  .resize({ width: 264 })
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();
const logoB64 = logo.toString("base64");

const source = readFileSync(TEMPLATE, "utf8");
if (!source.includes("__LOGO_B64__")) throw new Error("template sem __LOGO_B64__");
const script = source
  .replace(" * Arquivo gerado por scripts/gerar-apps-script.mjs a partir de\n * apps-script/investidores.template.gs (o logo entra em base64).",
    " * ARQUIVO GERADO: edite apps-script/investidores.template.gs e rode\n * `npm run apps-script`. O logo entra em base64.")
  .replace("__LOGO_B64__", logoB64);
writeFileSync(OUT, script);
console.log(`Gerado ${OUT} (${Math.round(script.length / 1024)} KB, logo ${Math.round(logo.length / 1024)} KB)`);

/* Previa: roda o proprio script num sandbox com imitacoes minimas das APIs do
   Google e troca o cid:logo por data URI para abrir no navegador. */
const sandbox = {
  Utilities: {
    formatDate: (date, _tz, pattern) => {
      const parts = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(date);
      const get = (type) => parts.find((p) => p.type === type).value;
      return pattern.replace("HH", get("hour")).replace("mm", get("minute"));
    },
  },
  Date, Number, String, Math, JSON,
};
vm.createContext(sandbox);
vm.runInContext(script, sandbox);

const expiresAt = Math.floor(Date.now() / 1000) + 600;
const samples = {
  "1-codigo": sandbox.buildLoginCode({ code: "K7QX2MPA", expiresAt, lang: "pt" }),
  "2-aprovacao": sandbox.buildRequestApproval({
    person: {
      name: "Ana Souza", email: "ana@fundoexemplo.com", company: "Fundo Exemplo Capital",
      role: "Sócia", profile: "Fundo de venture capital",
      message: "Acompanhamos CX e IA aplicada.\nQueremos entender tração e a rodada. <b>teste de HTML</b>",
    },
    approveUrl: "https://sigmacx.pages.dev/investidores/decisao?t=exemplo&acao=sim",
    rejectUrl: "https://sigmacx.pages.dev/investidores/decisao?t=exemplo&acao=nao",
  }),
  "3-aprovado": sandbox.buildAccessApproved({ name: "Ana Souza", loginUrl: "https://sigmacx.pages.dev/investidores?entrar=1", lang: "pt" }),
  "4-recusado": sandbox.buildAccessRejected({ name: "Ana Souza", lang: "pt" }),
};

mkdirSync(PREVIEW_DIR, { recursive: true });
const dataUri = `data:image/png;base64,${logoB64}`;
for (const [name, mail] of Object.entries(samples)) {
  writeFileSync(join(PREVIEW_DIR, `${name}.html`), mail.html.replaceAll("cid:logo", dataUri));
  console.log(`Previa ${name}: ${mail.subject}`);
}
