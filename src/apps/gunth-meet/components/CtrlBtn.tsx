"use client";

export function CtrlBtn({
  active,
  danger,
  onClick,
  children,
  title,
  badge,
}: {
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        position: "relative",
        padding: "4px 10px",
        background: danger ? "#c0392b" : active ? "var(--t-accent)" : "var(--t-bg)",
        color: danger || active ? "#fff" : "var(--t-text)",
        border: "2px solid",
        borderColor: "var(--t-border-light) var(--t-border-dark) var(--t-border-dark) var(--t-border-light)",
        cursor: "pointer",
        fontFamily: "var(--t-font-display)",
        fontSize: "var(--t-text-sm)",
        minWidth: 36,
      }}
    >
      {children}
      {badge && badge > 0 ? (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            background: "#e74c3c",
            color: "#fff",
            borderRadius: "50%",
            width: 16,
            height: 16,
            fontSize: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--t-font-display)",
            lineHeight: 1,
          }}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}
