"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "4px 10px",
        background: "var(--t-app-bg)",
        borderWidth: 2,
        borderStyle: "solid",
        borderTopColor: "var(--t-border-dark)",
        borderLeftColor: "var(--t-border-dark)",
        borderBottomColor: "var(--t-border-light)",
        borderRightColor: "var(--t-border-light)",
        minWidth: 60,
      }}
    >
      <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", lineHeight: 1.2 }}>{label}</span>
      <span
        style={{
          fontSize: "var(--t-text-md)",
          fontWeight: "bold",
          color: accent ? "var(--t-accent)" : "var(--t-text)",
          lineHeight: 1.3,
          fontFamily: "var(--t-font-display)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
