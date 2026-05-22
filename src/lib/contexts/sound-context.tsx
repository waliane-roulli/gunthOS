"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useSound } from "@/lib/hooks/use-sound";
import { useSettingsState } from "@/lib/contexts/settings-context";


type SoundContextValue = ReturnType<typeof useSound>;

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettingsState();
  const sound = useSound(!settings.soundEnabled, settings.soundSchemeId);

  useEffect(() => {
    return () => { sound.closeContext(); };
  // sound est stable sur la durée de vie du provider — pas de re-run voulu
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync volume master sur les sons UI
  useEffect(() => {
    sound.setMasterGain(settings.masterVolume);
  }, [settings.masterVolume, sound]);

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
