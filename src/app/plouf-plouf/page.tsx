import type { Metadata } from "next";
import { PloufApp } from "@/components/plouf-plouf/plouf-app";

export const metadata: Metadata = {
  title: "Plouf Plouf — Tirage au sort de jeux vidéo",
  description:
    "Le meilleur tirage au sort de jeux vidéo du web ! Ajoutez vos jeux et laissez le destin décider. 100% gratuit, sans inscription.",
};

export default function PloufPloufPage() {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background:
          "radial-gradient(ellipse at 20% 20%, rgba(173,216,255,0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(135,206,250,0.35) 0%, transparent 50%), linear-gradient(180deg, var(--t-page-from) 0%, var(--t-page-to) 100%)",
      }}
    >
      <main className="flex-1 flex justify-center items-start py-[40px] px-5">
        <PloufApp />
      </main>
    </div>
  );
}
