"use client";

interface AmbiancePanelProps {
  roomId: string;
  onBroadcast: (sampleId: string | null) => Promise<void>;
  onAmbianceSync: (cb: (sampleId: string | null, displayName: string) => void) => void;
  onClose: () => void;
}

export function AmbiancePanel({ onClose }: AmbiancePanelProps) {
  return (
    <div
      className="p-4"
      style={{
        background: "var(--t-bg)",
        borderTop: "2px solid var(--t-border-light)",
        borderLeft: "2px solid var(--t-border-light)",
        borderBottom: "2px solid var(--t-border-dark)",
        borderRight: "2px solid var(--t-border-dark)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: "var(--t-text-sm)", fontWeight: "bold" }}>Ambiance musicale</span>
        <button
          onClick={onClose}
          style={{
            fontSize: "var(--t-text-sm)",
            background: "none",
            border: "none",
            color: "var(--t-text-muted)",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
      <p style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
        Sélectionne une ambiance à diffuser dans le salon.
      </p>
    </div>
  );
}
