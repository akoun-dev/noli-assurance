import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "NOLI - Assurance",
  description: "Comparez les meilleures offres d'assurance auto en Côte d'Ivoire",
  keywords: ["assurance", "auto", "Côte d'Ivoire", "comparateur", "NOLI"],
  authors: [{ name: "NOLI Team" }],
  openGraph: {
    title: "NOLI - Assurance ",
    description: "Comparez les meilleures offres d'assurance auto en Côte d'Ivoire",
    url: "https://noli.ci",
    siteName: "NOLI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOLI - Assurance",
    description: "Comparez les meilleures offres d'assurance auto en Côte d'Ivoire",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
