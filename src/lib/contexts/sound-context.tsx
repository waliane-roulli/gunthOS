"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useSound } from "@/lib/hooks/use-sound";
import { useSettings } from "@/lib/contexts/settings-context";

type SoundContextValue = ReturnType<typeof useSound>;

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const sound = useSound(!settings.soundEnabled);

  useEffect(() => {
    return () => { sound.closeContext(); };
  // sound est stable sur la durée de vie du provider — pas de re-run voulu
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync volume ambiant en temps réel depuis les settings
  useEffect(() => {
    if (!settings.soundEnabled) {
      sound.stopAmbient();
    } else {
      sound.setAmbientVolume(settings.ambientVolume);
    }
  }, [settings.ambientVolume, settings.soundEnabled, sound]);

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
