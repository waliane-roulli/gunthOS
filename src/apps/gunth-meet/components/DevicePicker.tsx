"use client";

export function DevicePicker({
  audioDevices,
  videoDevices,
  selectedAudioId,
  selectedVideoId,
  onAudioChange,
  onVideoChange,
  onClose,
}: {
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedAudioId: string | null;
  selectedVideoId: string | null;
  onAudioChange: (deviceId: string) => void;
  onVideoChange: (deviceId: string) => void;
  onClose: () => void;
}) {
  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "2px 4px",
    border: "2px solid",
    borderColor: "var(--t-border-dark) var(--t-border-light) var(--t-border-light) var(--t-border-dark)",
    background: "#fff",
    fontFamily: "var(--t-font-display)",
    fontSize: "var(--t-text-xs)",
    color: "#000",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "var(--t-text-xs)",
    color: "var(--t-text-muted)",
    fontFamily: "var(--t-font-display)",
    marginBottom: 4,
    display: "block",
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 44,
        left: 8,
        background: "var(--t-bg)",
        border: "2px solid",
        borderColor: "var(--t-border-light) var(--t-border-dark) var(--t-border-dark) var(--t-border-light)",
        padding: 12,
        zIndex: 100,
        width: 260,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", fontWeight: "bold" }}>
          ⚙️ Périphériques
        </span>
        <button
          onClick={onClose}
          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 12, color: "var(--t-text-muted)" }}
        >
          ✕
        </button>
      </div>

      {audioDevices.length > 0 && (
        <div>
          <label style={labelStyle}>🎤 Microphone</label>
          <select
            value={selectedAudioId ?? ""}
            onChange={(e) => onAudioChange(e.target.value)}
            style={selectStyle}
          >
            {audioDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Micro ${d.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {videoDevices.length > 0 && (
        <div>
          <label style={labelStyle}>📹 Caméra</label>
          <select
            value={selectedVideoId ?? ""}
            onChange={(e) => onVideoChange(e.target.value)}
            style={selectStyle}
          >
            {videoDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Caméra ${d.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
