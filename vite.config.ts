import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { fileURLToPath, URL } from "node:url";

/**
 * Cada pagina e um chunk lazy (App.tsx). Sem ajuda, o browser so descobre o
 * chunk da pagina (e o CSS dela) depois de baixar e executar o index.js: duas
 * idas e voltas em serie antes de desenhar qualquer coisa. Este plugin injeta
 * no index.html um script minusculo que olha a URL e ja pede, em paralelo com
 * o index.js, os chunks daquela rota (modulepreload) e o CSS dela. So a rota
 * aberta e antecipada: as outras paginas nao baixam nada a toa (three/r3f
 * continuam so na home).
 */
const ROUTE_CHUNKS: Record<string, string> = {
  "": "SigmaExperience",
  "/produto": "Produto",
  "/sigma-channel": "SigmaChannel",
  "/sigma-brain": "SigmaBrain",
  "/sigma-insights": "SigmaInsights",
  "/dialogi": "Dialogi",
  "/sobre": "Sobre",
  "/investidores": "Investidores",
  "/investidores/area": "InvestidoresArea",
  "/blog": "Blog",
  "/blog/*": "BlogPost",
  "/category/*": "Blog",
  "/politica-de-privacidade": "Privacidade",
};

type BuiltChunk = { type: "chunk"; fileName: string; name?: string; isEntry?: boolean; imports: string[]; viteMetadata?: { importedCss?: Set<string> } };

function preloadRouteChunks(): Plugin {
  return {
    name: "sigmacx:preload-route-chunks",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;
        const chunks = Object.values(bundle).filter((c) => c.type === "chunk") as unknown as BuiltChunk[];
        const entry = chunks.find((c) => c.isEntry);
        const byFile = new Map(chunks.map((c) => [c.fileName, c]));
        const map: Record<string, { js: string[]; css: string[] }> = {};
        for (const [route, name] of Object.entries(ROUTE_CHUNKS)) {
          const root = chunks.find((c) => c.name === name && !c.isEntry);
          if (!root) continue;
          const js = new Set<string>();
          const css = new Set<string>();
          const walk = (file: string) => {
            if (js.has(file) || file === entry?.fileName) return;
            const chunk = byFile.get(file);
            if (!chunk) return;
            js.add(file);
            chunk.viteMetadata?.importedCss?.forEach((f) => css.add(f));
            chunk.imports.forEach(walk);
          };
          walk(root.fileName);
          map[route] = { js: [...js].map((f) => "/" + f), css: [...css].map((f) => "/" + f) };
        }
        const script =
          "<script>(function(){var m=" + JSON.stringify(map) + ";" +
          'var p=location.pathname.replace(/^\\/(en|es)(?=\\/|$)/,"").replace(/\\/+$/,"");' +
          'var r=m[p]||(/^\\/blog\\/[^/]+$/.test(p)?m["/blog/*"]:/^\\/category\\/[^/]+$/.test(p)?m["/category/*"]:null);' +
          "if(!r)return;var h=document.head;" +
          'r.css.forEach(function(f){var l=document.createElement("link");l.rel="stylesheet";l.href=f;h.appendChild(l);});' +
          'r.js.forEach(function(f){var l=document.createElement("link");l.rel="modulepreload";l.href=f;h.appendChild(l);});' +
          "})();</script>";
        return html.replace("</head>", script + "\n  </head>");
      },
    },
  };
}

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [react(), preloadRouteChunks()],
  build: {
    // Bibliotecas grandes em chunks proprios: mudam pouco entre deploys (cache)
    // e three/r3f so entram na home (as demais paginas nao os importam).
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](three|@react-three)[\\/]/.test(id)) return "three";
          if (/[\\/]node_modules[\\/]gsap[\\/]/.test(id)) return "gsap";
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return "react";
        },
      },
    },
  },
  server: {
    // Permite acessar o dev server por tuneis (ngrok) sem o bloqueio de host.
    allowedHosts: true,
    // Login da area do investidor: /api/* sao Cloudflare Pages Functions. No
    // dev elas rodam no wrangler (npm run dev:api, porta 8789; a 8788 fica para o treinamento) e o Vite repassa.
    proxy: { "/api": "http://127.0.0.1:8789" },
  },
});
