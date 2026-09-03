import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { fileURLToPath, URL } from "node:url";

/**
 * A home e um chunk lazy (App.tsx) que puxa three/r3f/gsap. Sem ajuda, o
 * browser so descobre esses arquivos depois de baixar e executar o index.js
 * (duas idas e voltas em serie). Este plugin injeta no index.html um script
 * que adiciona <link rel="modulepreload"> dos chunks da home apenas quando a
 * URL e a home (/, /en, /es): as outras rotas nao baixam three a toa.
 */
function preloadHomeChunks(): Plugin {
  return {
    name: "sigmacx:preload-home-chunks",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;
        const chunks = Object.values(bundle).filter((c) => c.type === "chunk") as { fileName: string; name?: string; imports: string[] }[];
        const home = chunks.find((c) => c.name === "SigmaExperience" || /SigmaExperience/.test(c.fileName));
        if (!home) return html;
        const seen = new Set<string>();
        const walk = (file: string) => {
          if (seen.has(file)) return;
          seen.add(file);
          chunks.find((x) => x.fileName === file)?.imports.forEach(walk);
        };
        walk(home.fileName);
        const files = JSON.stringify([...seen].map((f) => "/" + f));
        const script =
          '<script>(function(){var p=location.pathname.replace(/\\/+$/,"");' +
          'if(p===""||p==="/en"||p==="/es"){' + files + '.forEach(function(h){' +
          'var l=document.createElement("link");l.rel="modulepreload";l.href=h;document.head.appendChild(l);});}})();</script>';
        return html.replace("</head>", script + "\n  </head>");
      },
    },
  };
}

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [react(), preloadHomeChunks()],
  build: {
    // Bibliotecas grandes em chunks proprios: mudam pouco entre deploys (cache)
    // e three/r3f so entram na home (as demais paginas nao os importam).
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](three|@react-three)[\\/]/.test(id)) return "three";
          if (/[\\/]node_modules[\\/]gsap[\\/]/.test(id)) return "gsap";
          if (/[\\/]node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/.test(id)) return "motion";
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return "react";
        },
      },
    },
  },
  server: {
    // Permite acessar o dev server por tuneis (ngrok) sem o bloqueio de host.
    allowedHosts: true,
  },
});
