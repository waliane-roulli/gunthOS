"use client";

import { TITLEBAR_GRADIENT, INMAIL_TEMPLATES, ENTHUSIASTIC_REPLIES } from "../constants";
import { pick, raisedStyle, sunkenStyle } from "../helpers";
import { Avatar } from "../components/Avatar";
import { DialogShell } from "../components/Toast";

interface MessagesTabProps {
  followersCount: number;
  inMailRead: boolean;
  inMailIndex: number;
  inMailReplied: boolean;
  showInMail: boolean;
  typingIndicator: boolean;
  onOpenInMail: () => void;
  onCloseInMail: () => void;
  onReplyInMail: () => void;
  onIgnoreInMail: () => void;
  onShowToast: (msg: string) => void;
  playClick: () => void;
  playVictory: () => void;
  playDelete: () => void;
}

export function MessagesTab({
  followersCount, inMailRead, inMailIndex, inMailReplied, showInMail,
  typingIndicator, onOpenInMail, onCloseInMail, onReplyInMail, onIgnoreInMail,
  onShowToast, playClick, playVictory, playDelete,
}: MessagesTabProps) {
  return (
    <>
      <div className="overflow-hidden border-2" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
        <div className="px-2 py-1 text-sm" style={{ ...TITLEBAR_GRADIENT, fontFamily: "var(--t-font-display)" }}>
          ✉️ Messages {!inMailRead && "(1 non lu)"}
        </div>

        <div
          onClick={onOpenInMail}
          className="flex items-start gap-2 p-2 border-b cursor-default"
          style={{ borderColor: "var(--t-border-dark)", backgroundColor: inMailRead ? "var(--t-bg)" : "var(--t-card-hover)" }}
        >
          <Avatar emoji="💼" size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <span className="font-bold text-sm" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>Sandrine R. · Talent Acquisition</span>
              <span className="text-xs shrink-0" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>il y a 2 min</span>
            </div>
            <div className="text-xs" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>InMail Premium</div>
            {typingIndicator ? (
              <div className="text-sm mt-0.5 flex items-center gap-1" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-body)" }}>
                <span className="animate-[blink_0.6s_step-end_infinite]">●●●</span>
                <span className="text-xs italic">Sandrine est en train d&apos;écrire...</span>
              </div>
            ) : (
              <div className="text-sm mt-0.5" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-body)" }}>
                Bonjour [PRÉNOM], votre profil a retenu mon attention...
              </div>
            )}
          </div>
          {!inMailRead && <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: "var(--t-accent)" }} />}
        </div>

        {[
          { emoji: "🤖", name: "LinkedGunth Bot", sub: "Notification automatique", preview: "Votre profil a été vu 1 fois cette semaine (c'était vous)", time: "il y a 3j" },
          { emoji: "📊", name: "Statistiques du réseau", sub: "Rapport hebdo", preview: "Vos posts ont généré 0 engagement cette semaine.", time: "il y a 5j" },
        ].map((m, i) => (
          <div key={i}
            onClick={() => { playClick(); onShowToast("Ce message est verrouillé. Passez à Premium."); }}
            className="flex items-start gap-2 p-2 border-b cursor-default"
            style={{ borderColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)", opacity: 0.7 }}
          >
            <Avatar emoji={m.emoji} size={38} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>{m.name}</span>
                <span className="text-xs shrink-0" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>{m.time}</span>
              </div>
              <div className="text-xs" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>{m.sub}</div>
              <div className="text-sm mt-0.5 flex items-center gap-1" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-body)" }}>
                <span className="text-xs">🔒</span> <span className="blur-[3px] select-none">{m.preview}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="py-6 text-center" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
          <div className="text-2xl mb-1.5 animate-[blink_2s_step-end_infinite]">📭</div>
          <div className="text-sm">C&apos;est normal. Vous avez {followersCount} relations.</div>
          <div className="mt-1 text-xs" style={{ color: "var(--t-text-subtle)" }}>2 messages débloquables avec Premium</div>
        </div>
      </div>

      {showInMail && (
        <DialogShell title="✉️ InMail de Sandrine R." onClose={() => { playClick(); onCloseInMail(); }} width="440px">
          {inMailReplied ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-sm mb-1" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>Réponse envoyée avec enthousiasme !</div>
              <div className="p-2 mb-2 border-2 text-left" style={{ ...sunkenStyle() }}>
                <pre className="text-xs whitespace-pre-wrap m-0" style={{ fontFamily: "var(--t-font-body)", color: "var(--t-app-text)", lineHeight: 1.6 }}>{pick(ENTHUSIASTIC_REPLIES)}</pre>
              </div>
              <div className="text-xs mb-3" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Sandrine ne répondra probablement jamais.</div>
              <button onClick={() => { playClick(); onCloseInMail(); }} className="px-3 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Fermer</button>
            </div>
          ) : (
            <>
              <div className="p-2 mb-2 border-2" style={{ ...sunkenStyle() }}>
                <pre className="text-sm whitespace-pre-wrap m-0" style={{ fontFamily: "var(--t-font-body)", color: "var(--t-app-text)", lineHeight: 1.65 }}>{INMAIL_TEMPLATES[inMailIndex]}</pre>
              </div>
              <div className="flex gap-1.5 justify-end">
                <button onClick={() => { playVictory(); onReplyInMail(); }} className="px-2 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>Répondre avec enthousiasme</button>
                <button onClick={() => { playDelete(); onIgnoreInMail(); }} className="px-2 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Ignorer</button>
              </div>
            </>
          )}
        </DialogShell>
      )}
    </>
  );
}
