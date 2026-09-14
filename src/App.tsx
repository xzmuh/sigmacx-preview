import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { JourneyRouteReady, ProductJourney } from "./site/ProductJourney";
import { SmoothScroll } from "./site/SmoothScroll";

/* Cada pagina vira um chunk proprio: a home traz three/r3f (~700 KB),
   que as paginas de produto e o blog nao usam; e vice-versa. */
const SigmaExperience = lazy(() => import("./SigmaExperience").then((m) => ({ default: m.SigmaExperience })));
const Produto = lazy(() => import("./pages/Produto"));
const SigmaChannel = lazy(() => import("./pages/SigmaChannel"));
const SigmaBrain = lazy(() => import("./pages/SigmaBrain"));
const SigmaInsights = lazy(() => import("./pages/SigmaInsights"));
const Dialogi = lazy(() => import("./pages/Dialogi"));
const Sobre = lazy(() => import("./pages/Sobre"));
const Investidores = lazy(() => import("./pages/Investidores"));
const InvestidoresArea = lazy(() => import("./pages/InvestidoresArea"));
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
        <SmoothScroll />
        <Routes>
          {PREFIXES.map((p) => (
            <Route key={p || "pt"} path={p || "/"}>
              <Route index element={<SigmaExperience />} />
              <Route path="produto" element={<Produto />} />
              <Route path="sigma-channel" element={<SigmaChannel />} />
              <Route path="sigma-brain" element={<SigmaBrain />} />
              <Route path="sigma-insights" element={<SigmaInsights />} />
              <Route path="dialogi" element={<Dialogi />} />
              <Route path="sobre" element={<Sobre />} />
              <Route path="investidores" element={<Investidores />} />
              <Route path="investidores/area" caseSensitive element={<InvestidoresArea />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path="category/:category" element={<Blog />} />
              <Route path="politica-de-privacidade" element={<Privacidade />} />
            </Route>
          ))}
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
        <JourneyRouteReady />
      </Suspense>
    </BrowserRouter>
  );
}
