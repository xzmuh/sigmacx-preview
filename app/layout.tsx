import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "sigmacx.ai";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "SigmaCX — Inteligência para cada conversa",
    description: "Soluções que escutam, entendem e melhoram cada conversa entre marcas e pessoas.",
    icons: {
      icon: "/media/sigma-mark.png",
      shortcut: "/media/sigma-mark.png",
    },
    openGraph: {
      title: "SigmaCX — Inteligência para cada conversa",
      description: "CX inteligente começa com a tecnologia certa.",
      type: "website",
      locale: "pt_BR",
      images: [{ url: new URL("/og.png", metadataBase).href, width: 1792, height: 936, alt: "SigmaCX — Inteligência para cada conversa" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "SigmaCX — Inteligência para cada conversa",
      description: "CX inteligente começa com a tecnologia certa.",
      images: [new URL("/og.png", metadataBase).href],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
