"use client";

export function Avatar({ src, emoji, size = 38 }: { src?: string | null; emoji?: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center overflow-hidden border-2 shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.5,
        borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)",
        borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
        backgroundColor: "var(--t-app-bg)",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (emoji ?? "👤")}
    </div>
  );
}
