import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProductJourney } from "./site/ProductJourney";

/* Cada pagina vira um chunk proprio: a home traz three/r3f/lenis (~700 KB),
   que as paginas de produto e o blog nao usam; e vice-versa. */
const SigmaExperience = lazy(() => import("./SigmaExperience").then((m) => ({ default: m.SigmaExperience })));
const Produto = lazy(() => import("./pages/Produto"));
const SigmaChannel = lazy(() => import("./pages/SigmaChannel"));
const SigmaBrain = lazy(() => import("./pages/SigmaBrain"));
const SigmaInsights = lazy(() => import("./pages/SigmaInsights"));
const Sobre = lazy(() => import("./pages/Sobre"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const NaoEncontrado = lazy(() => import("./pages/NaoEncontrado"));

/* As mesmas rotas existem em /, /en e /es; o idioma vem do prefixo (src/lib/i18n). */
const PREFIXES = ["", "/en", "/es"];

export function App() {
  return (
    <BrowserRouter>
      <ProductJourney />
      <Suspense fallback={null}>
        <Routes>
          {PREFIXES.map((p) => (
            <Route key={p || "pt"} path={p || "/"}>
              <Route index element={<SigmaExperience />} />
              <Route path="produto" element={<Produto />} />
              <Route path="sigma-channel" element={<SigmaChannel />} />
              <Route path="sigma-brain" element={<SigmaBrain />} />
              <Route path="sigma-insights" element={<SigmaInsights />} />
              <Route path="sobre" element={<Sobre />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path="category/:category" element={<Blog />} />
              <Route path="politica-de-privacidade" element={<Privacidade />} />
            </Route>
          ))}
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
