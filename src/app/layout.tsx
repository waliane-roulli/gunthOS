import type { Metadata } from "next";
import { Fredoka, VT323 } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/lib/contexts/settings-context";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { UnreadProvider } from "@/lib/contexts/unread-context";
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
  title: "GunthOS v1.0 — Chargement en cours… (depuis 1998)",
  description:
    "GunthOS : le système d'exploitation du web. Tirage au sort, mini-jeux et outils kitsch. Chargement en cours depuis 1998.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${vt323.variable}`}>
      <body>
        <AuthProvider>
          <UnreadProvider>
            <SettingsProvider>
              <SiteShell>{children}</SiteShell>
            </SettingsProvider>
          </UnreadProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
