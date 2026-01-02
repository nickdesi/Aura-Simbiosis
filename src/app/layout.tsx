import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aura-Symbiosis | Métabolisme Territorial Clermont-Vichy",
  description: "Plateforme de métabolisme territorial connectant mobilité, industrie et santé sur le territoire Clermont-Vichy. Optimisez vos ressources avec Aura-Logistics, Eco-Flux B2B et Therma-Track 360.",
  keywords: ["mobilité", "covoiturage", "industrie circulaire", "santé", "Clermont-Ferrand", "Vichy", "ZFE", "écologie industrielle"],
  authors: [{ name: "Aura-Symbiosis" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aura-Symbiosis",
  },
  openGraph: {
    title: "Aura-Symbiosis",
    description: "Plateforme de métabolisme territorial Clermont-Vichy",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00d9ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
