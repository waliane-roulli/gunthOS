import type { Metadata } from "next";
import { Fredoka, VT323 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/contexts/theme-context";
import { SiteShell } from "@/components/ui/site-shell";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "Plouf Plouf — Le portail de jeux et outils Web 1.0",
  description:
    "Tirage au sort, mini-jeux et outils kitsch façon années 90. 100% gratuit, sans inscription.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${vt323.variable}`}>
      <body>
        <ThemeProvider>
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
