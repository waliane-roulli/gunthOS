export function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "à l'instant";
  if (sec < 3600) return `il y a ${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `il y a ${Math.floor(sec / 3600)}h`;
  return `il y a ${Math.floor(sec / 86400)}j`;
}

export function totalReactions(reactions: Record<string, number>) {
  return Object.values(reactions).reduce((a, b) => a + b, 0);
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function seededPick<T>(arr: readonly T[], seed: number, offset = 0): T {
  return arr[Math.abs(seed * 31 + offset) % arr.length] as T;
}

export function raisedStyle(active = false) {
  return {
    borderTopColor: active ? "var(--t-accent-hover)" : "var(--t-border-light)",
    borderLeftColor: active ? "var(--t-accent-hover)" : "var(--t-border-light)",
    borderBottomColor: "var(--t-border-dark)",
    borderRightColor: "var(--t-border-dark)",
    backgroundColor: active ? "var(--t-accent)" : "var(--t-bg)",
    color: active ? "var(--t-titlebar-text)" : "var(--t-text)",
  };
}

export function sunkenStyle() {
  return {
    borderTopColor: "var(--t-border-dark)",
    borderLeftColor: "var(--t-border-dark)",
    borderBottomColor: "var(--t-border-light)",
    borderRightColor: "var(--t-border-light)",
    backgroundColor: "var(--t-app-bg)",
    color: "var(--t-app-text)",
  };
}
