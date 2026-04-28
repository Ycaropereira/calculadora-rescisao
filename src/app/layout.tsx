import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://calculadora-rescisao-ten.vercel.app"),
  title: "Calculadora de Rescisão CLT",
  description:
    "Calculadora de rescisão CLT: simule saldo de salário, 13º proporcional, férias proporcionais + 1/3 e aviso prévio estimado.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Calculadora de Rescisão CLT",
    description:
      "Simule a rescisão CLT: saldo de salário, 13º proporcional, férias proporcionais + 1/3 e aviso prévio estimado.",
    type: "website",
    locale: "pt_BR",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Calculadora de Rescisão CLT",
    description:
      "Simule a rescisão CLT: saldo de salário, 13º proporcional, férias proporcionais + 1/3 e aviso prévio estimado.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-adsense-account" content="ca-pub-7524008220498928" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7524008220498928"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="mt-auto border-t border-black/5 bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-600">
              © {new Date().getFullYear()} Calculadora de Rescisão CLT
            </p>
            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link className="text-zinc-700 hover:underline" href="/privacidade">
                Privacidade
              </Link>
              <Link className="text-zinc-700 hover:underline" href="/termos">
                Termos
              </Link>
              <Link className="text-zinc-700 hover:underline" href="/contato">
                Contato
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
