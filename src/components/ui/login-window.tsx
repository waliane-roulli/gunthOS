"use client";

import { useState, useCallback } from "react";
import { z } from "zod";
import { signIn, signUp } from "@/lib/auth-client";
import { useAuth } from "@/lib/contexts/auth-context";

type Mode = "login" | "register" | "logged-in";

const loginSchema = z.object({
  username: z.string().min(2, "Pseudo trop court. Même GUEST fait 5 lettres."),
  password: z.string().min(1, "Le mot de passe ne peut pas être vide, voyons"),
});

const registerSchema = z.object({
  username: z
    .string()
    .min(2, "Votre pseudo doit faire au moins 2 caractères. Soyez créatif.")
    .max(32, "32 caractères max. GunthOS n'est pas un roman.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Lettres, chiffres, _ et - uniquement. Pas de @#$%."),
  password: z
    .string()
    .min(8, "Minimum 8 caractères. Votre date de naissance ne compte pas."),
});

const LOGIN_HINTS = [
  "Mot de passe oublié ? Parlez à votre thérapeute, pas à nous.",
  "Conseil : n'utilisez pas '123456'. (On sait que vous y avez pensé.)",
  "Votre session expire après 30 jours ou une coupure de courant.",
  "GunthOS protège vos données. Sauf en cas d'erreur 404.",
  "Connexion sécurisée par GUNTH-SSL™ (certifié par nous-mêmes).",
];

function getHint() {
  return LOGIN_HINTS[Math.floor(Math.random() * LOGIN_HINTS.length)]!;
}

export function LoginWindow({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const [mode, setMode] = useState<Mode>(user ? "logged-in" : "login");
  const [hint] = useState(getHint);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const clearForm = () => {
    setUsername("");
    setPassword("");
    setError(null);
    setSuccessMsg(null);
  };

  const handleLogin = useCallback(async () => {
    setError(null);
    const parsed = loginSchema.safeParse({ username, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Données invalides");
      return;
    }
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (signIn as any).username({ username, password });
      if (result.error) {
        setError("Identifiants incorrects. Réessayez ou inventez-en de nouveaux.");
      }
    } catch {
      setError("Erreur réseau. Le modem 14.4k a encore lâché.");
    } finally {
      setLoading(false);
    }
  }, [username, password]);

  const handleRegister = useCallback(async () => {
    setError(null);
    const parsed = registerSchema.safeParse({ username, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Données invalides");
      return;
    }
    setLoading(true);
    try {
      // Email fictif interne — l'utilisateur ne le voit jamais
      const fakeEmail = `${username.toLowerCase()}@gunth.local`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (signUp as any).email({ email: fakeEmail, password, name: username, username });
      if (result.error) {
        setError("Impossible de créer le compte. Peut-être que l'univers s'y oppose.");
      } else {
        setSuccessMsg("Compte créé ! Bienvenue dans GunthOS. Vous êtes maintenant officiel(le).");
        clearForm();
        setMode("login");
      }
    } catch {
      setError("Erreur réseau. Soufflez dans la cartouche et réessayez.");
    } finally {
      setLoading(false);
    }
  }, [username, password]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      mode === "login" ? handleLogin() : handleRegister();
    }
  };

  const currentUser = user;


  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text)" }}>

      {/* Logged-in view */}
      {currentUser && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <div className="text-5xl">👤</div>
          <div className="text-center">
            <div className="text-xl tracking-widest mb-1">{currentUser.name}</div>
          </div>
          <div
            className="text-sm tracking-wide text-center px-4 py-2 border"
            style={{
              borderColor: "var(--t-border-dark)",
              backgroundColor: "var(--t-app-bg, var(--t-bg))",
              color: "var(--t-text-muted, #666)",
            }}
          >
            ✅ Connecté à GunthOS. Vos données sont en sécurité.<br />
            <span style={{ color: "var(--t-text-muted, #888)", fontSize: "0.8em" }}>
              (Enfin, autant que peut l&apos;être un OS de 1998.)
            </span>
          </div>
          <RetroButton onClick={logout} variant="danger">
            🔌 Se déconnecter
          </RetroButton>
        </div>
      )}

      {/* Auth forms */}
      {!currentUser && (
        <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">

          {/* Tab switcher */}
          <div className="flex border-b-2" style={{ borderColor: "var(--t-border-dark)" }}>
            <TabButton active={mode === "login"} onClick={() => { setMode("login"); clearForm(); }}>
              🔑 Connexion
            </TabButton>
            <TabButton active={mode === "register"} onClick={() => { setMode("register"); clearForm(); }}>
              📝 Inscription
            </TabButton>
          </div>

          {/* Success message */}
          {successMsg && (
            <div
              className="text-sm tracking-wide px-3 py-2 border-2"
              style={{
                borderColor: "var(--t-accent, #000080)",
                backgroundColor: "var(--t-app-bg, #fff)",
                color: "var(--t-accent, #000080)",
              }}
            >
              ✅ {successMsg}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              className="text-sm tracking-wide px-3 py-2 border-2"
              style={{
                borderColor: "#c0392b",
                backgroundColor: "#fff0f0",
                color: "#c0392b",
              }}
            >
              ⚠ {error}
            </div>
          )}

          <FieldGroup label="IDENTIFIANT.SYS">
            <RetroInput
              type="text"
              placeholder="votre_pseudo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoComplete="username"
            />
          </FieldGroup>

          <FieldGroup label="MOT_DE_PASSE.EXE">
            <RetroInput
              type="password"
              placeholder={mode === "register" ? "8 caractères minimum" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </FieldGroup>

          <div className="flex gap-2 mt-1">
            <RetroButton
              onClick={mode === "login" ? handleLogin : handleRegister}
              disabled={loading}
              variant="primary"
            >
              {loading
                ? "⏳ Connexion en cours…"
                : mode === "login"
                ? "🔑 Connexion"
                : "📝 Créer le compte"}
            </RetroButton>
            <RetroButton
              onClick={() => onClose?.()}
              disabled={loading}
              variant="secondary"
            >
              👤 Continuer en invité
            </RetroButton>
          </div>

          {/* Hint */}
          <div
            className="text-xs tracking-wide mt-2 px-2 py-1 border-l-4"
            style={{
              borderLeftColor: "var(--t-border-dark)",
              color: "var(--t-text-muted, #808080)",
              fontFamily: "var(--font-vt323), monospace",
              fontSize: "0.95rem",
            }}
          >
            💡 {hint}
          </div>

          {/* Guest info */}
          <div
            className="text-xs tracking-wide px-2"
            style={{ color: "var(--t-text-muted, #999)", fontFamily: "var(--font-vt323), monospace", fontSize: "0.85rem" }}
          >
            Mode invité : vos paramètres restent en local, comme en 1998.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sous-composants ────────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 text-sm tracking-widest cursor-pointer border-t-2 border-x-2 -mb-0.5 select-none"
      style={{
        fontFamily: "var(--t-font-display)",
        color: "var(--t-text)",
        backgroundColor: active ? "var(--t-bg)" : "var(--t-bg-dark, #a0a0a0)",
        borderTopColor: active ? "var(--t-border-light)" : "var(--t-border-dark)",
        borderLeftColor: active ? "var(--t-border-light)" : "var(--t-border-dark)",
        borderRightColor: active ? "var(--t-border-dark)" : "var(--t-border-light)",
        borderBottomColor: active ? "var(--t-bg)" : "var(--t-border-dark)",
        zIndex: active ? 1 : 0,
        position: "relative",
      }}
    >
      {children}
    </button>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs tracking-widest select-none"
        style={{ color: "var(--t-text-muted, #666)", fontFamily: "var(--font-vt323), monospace", fontSize: "0.9rem" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function RetroInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-2 py-1 text-base border-2 outline-none"
      style={{
        fontFamily: "var(--t-font-display)",
        color: "var(--t-text)",
        backgroundColor: "var(--t-app-bg, #fff)",
        borderTopColor: "var(--t-border-dark)",
        borderLeftColor: "var(--t-border-dark)",
        borderBottomColor: "var(--t-border-light)",
        borderRightColor: "var(--t-border-light)",
        ...props.style,
      }}
    />
  );
}

function RetroButton({
  onClick,
  children,
  disabled,
  variant = "secondary",
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const bg =
    variant === "primary"
      ? "linear-gradient(180deg, var(--t-bg-light, #e0e0e0) 0%, var(--t-bg, #c0c0c0) 50%, var(--t-bg-dark, #a0a0a0) 100%)"
      : variant === "danger"
      ? "linear-gradient(180deg, #e88, #c44)"
      : "var(--t-bg)";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-1 border-2 text-sm tracking-widest cursor-pointer select-none shrink-0"
      style={{
        fontFamily: "var(--t-font-display)",
        color: variant === "danger" ? "#fff" : "var(--t-text)",
        background: bg,
        borderTopColor: "var(--t-border-light)",
        borderLeftColor: "var(--t-border-light)",
        borderBottomColor: "var(--t-border-dark)",
        borderRightColor: "var(--t-border-dark)",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
