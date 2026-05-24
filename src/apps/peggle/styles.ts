import type { CSSProperties } from "react";

export const captionBtn: CSSProperties = {
  width: 18,
  height: 16,
  background: "var(--t-bg)",
  borderWidth: 2,
  borderStyle: "solid",
  borderTopColor: "var(--t-border-light)",
  borderLeftColor: "var(--t-border-light)",
  borderBottomColor: "var(--t-border-dark)",
  borderRightColor: "var(--t-border-dark)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 9,
  color: "var(--t-text)",
  userSelect: "none",
  cursor: "default",
  lineHeight: 1,
  flexShrink: 0,
};

export const btnRaised: CSSProperties = {
  padding: "5px 14px",
  fontFamily: "var(--t-font-display)",
  fontSize: "var(--t-text-sm)",
  cursor: "pointer",
  background: "var(--t-bg)",
  color: "var(--t-text)",
  borderWidth: 2,
  borderStyle: "solid",
  borderTopColor: "var(--t-border-light)",
  borderLeftColor: "var(--t-border-light)",
  borderBottomColor: "var(--t-border-dark)",
  borderRightColor: "var(--t-border-dark)",
  whiteSpace: "nowrap",
  lineHeight: 1.4,
};

export const btnPrimary: CSSProperties = {
  ...btnRaised,
  background: "linear-gradient(to bottom, var(--t-titlebar-from), var(--t-titlebar-to))",
  color: "#fff",
};
