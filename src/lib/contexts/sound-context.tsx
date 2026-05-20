"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useSound } from "@/lib/hooks/use-sound";
import { useSettings } from "@/lib/contexts/settings-context";

type SoundContextValue = ReturnType<typeof useSound>;

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const sound = useSound(!settings.soundEnabled);

  // Sync volume ambiant en temps réel depuis les settings
  useEffect(() => {
    if (!settings.soundEnabled) {
      sound.stopAmbient();
    } else {
      sound.setAmbientVolume(settings.ambientVolume);
    }
  }, [settings.ambientVolume, settings.soundEnabled, sound.setAmbientVolume, sound.stopAmbient]);

  return (
    <SoundContext.Provider value={sound}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSoundContext must be used inside SoundProvider");
  return ctx;
}
