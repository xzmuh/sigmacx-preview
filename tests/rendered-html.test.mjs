import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://preview.sigmacx.ai/", {
      headers: {
        accept: "text/html",
        host: "preview.sigmacx.ai",
        "x-forwarded-host": "preview.sigmacx.ai",
        "x-forwarded-proto": "https",
      },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the SigmaCX experience and metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="pt-BR">/i);
  assert.match(html, /<title>SigmaCX — Inteligência para cada conversa<\/title>/i);
  assert.match(html, /Navegação principal/);
  assert.match(html, /It’s for/);
  assert.match(html, /Toda conversa/);
  assert.match(html, /Sigma Brain/);
  assert.match(html, /src="\/media\/brain\.mp4"/);
  assert.match(html, /src="\/media\/woman\.mp4"/);
  assert.match(html, /property="og:image" content="https:\/\/preview\.sigmacx\.ai\/og\.png"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps motion accessible and removes starter-only code", async () => {
  const [experience, css, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/SigmaExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(experience, /ScrollTrigger/);
  assert.match(experience, /new Lenis/);
  assert.match(experience, /<Canvas/);
  assert.match(experience, /prefers-reduced-motion: reduce/);
  assert.match(experience, /"Abrir menu"/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@font-face/);
  assert.match(layout, /generateMetadata/);
  assert.match(packageJson, /"gsap"/);
  assert.match(packageJson, /"@react-three\/fiber"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
