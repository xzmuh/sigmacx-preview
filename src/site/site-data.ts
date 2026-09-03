export const DEMO_URL =
  "https://api.whatsapp.com/send/?phone=551142008282&text=Ol%C3%A1%2C+gostaria+de+saber+mais+sobre+a+SigmaCX&type=phone_number&app_absent=0";

export const PARTNER_MAIL = "mailto:canais@nuveto.com.br";
export const LINKEDIN_URL = "https://www.linkedin.com/company/sigma-cx/";
export const DIALOGI_URL = "https://dialogiai.com/";
export const CAREERS_URL =
  "https://www.glassdoor.com.br/Vis%C3%A3o-geral/Trabalhar-na-Nuveto-EI_IE5463946.13,19.htm";

export const ADDRESS =
  "Av. Alfredo Egídio de Souza Aranha, 100 – Vila Cruzeiro, São Paulo – SP, 04726-170";

export type NavLink = { label: string; to?: string; href?: string; note?: string };

export type NavGroup = {
  label: string;
  to?: string;
  columns?: { title: string; links: NavLink[] }[];
};

export const NAV: NavGroup[] = [
  { label: "Home", to: "/" },
  {
    label: "Soluções",
    to: "/produto",
    columns: [
      {
        title: "Produtos",
        links: [
          { label: "Sigma Suite", to: "/produto", note: "A plataforma completa de CX" },
          { label: "Sigma Channel", to: "/sigma-channel", note: "Todos os canais em um só lugar" },
          { label: "Sigma Brain", to: "/sigma-brain", note: "Agentes de IA que resolvem" },
          { label: "Sigma Insights", to: "/sigma-insights", note: "Análise de interações e qualidade" },
        ],
      },
      {
        title: "Recursos",
        links: [
          { label: "Agentes de IA", to: "/sigma-brain" },
          { label: "Transcrição", to: "/sigma-insights" },
          { label: "Tradução simultânea", to: "/sigma-brain" },
          { label: "Campanhas de disparo", to: "/sigma-channel" },
          { label: "Quality monitoring", to: "/sigma-insights" },
          { label: "Painéis intuitivos", to: "/sigma-insights" },
        ],
      },
    ],
  },
  {
    label: "Plataforma",
    columns: [
      {
        title: "Plataforma",
        links: [{ label: "Dialogi AI", href: DIALOGI_URL, note: "Inteligência artificial conversacional" }],
      },
    ],
  },
  {
    label: "Empresa",
    to: "/sobre",
    columns: [
      {
        title: "Empresa",
        links: [{ label: "Sobre nós", to: "/sobre", note: "Nossa história, valores e time" }],
      },
    ],
  },
  { label: "Blog", to: "/blog" },
];

export const FOOTER_MANIFESTO =
  "SigmaCX é o hub que unifica canais, automatiza interações e gera insights estratégicos para jornadas consistentes e personalizadas.";

export const CASE_TECBAN_PDF =
  "https://sigmacx.ai/wp-content/uploads/2025/10/Case-Tecban-PT.pdf";

export const BOT_VS_AGENT_URL =
  "https://sigmacx.ai/qual-a-diferenca-entre-chatbots-e-agentes-de-ia/";

export const BLOG_URL = "https://sigmacx.ai/blog/";

/* --- Midia das paginas internas (mesmas fontes do site de referencia) --- */
export const VIMEO = {
  produtoHero: "1117880849",
  produtoBrain: "1123883373",
  channelHero: "1195738823",
  brainHero: "1195737736",
  insightsHero: "1195742612",
  sobreHistoria: "1124299711",
};
export const VIDEO = {
  animacao: "/media/site/video/Animacao-2-1.mp4",
  city: "/media/site/video/6257104_City_Exercise_3840x2160.mp4",
  msgBR: "/media/site/video/msg-BR.mp4",
  brain: "/media/site/video/Brain-Animation.mp4",
  dashboard: "/media/site/video/Dashboard-1.mp4",
  designer: "/media/site/video/6252865_Designer_Mobile_1920x1080.mp4",
  people: "/media/site/video/people-business.mp4",
};
export const BG = {
  sobreHero: "/media/site/sobre-hero.webp",
};
