"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const STATIONS = [
  {
    id: "disco-funk",
    name: "Disco Funk",
    emoji: "🕺",
    url: "https://radio.frequencegroove.com/listen/disco-funk/radio.mp3",
    description: "Pour danser seul dans votre cuisine",
    genre: "DISCO / FUNK",
  },
  {
    id: "house",
    name: "House",
    emoji: "🏠",
    url: "https://radio.frequencegroove.com/listen/house/radio.mp3",
    description: "Techno de salon. Voisins non inclus.",
    genre: "HOUSE",
  },
  {
    id: "instrumentals",
    name: "Instrumentals",
    emoji: "🎷",
    url: "https://radio.frequencegroove.com/listen/instrumentals/radio.mp3",
    description: "Musique sans paroles. Parfait pour prétendre travailler.",
    genre: "INSTRUMENTAL",
  },
  {
    id: "jazz-soul",
    name: "Jazz & Soul",
    emoji: "🎺",
    url: "https://radio.frequencegroove.com/listen/jazz-soul/radio.mp3",
    description: "Pour vous sentir sophistiqué. Ça marche.",
    genre: "JAZZ / SOUL",
  },
  {
    id: "latin",
    name: "Latin",
    emoji: "💃",
    url: "https://radio.frequencegroove.com/listen/latin/radio.mp3",
    description: "Déhanchement obligatoire. C'est dans les CGU.",
    genre: "LATIN",
  },
  {
    id: "reggae",
    name: "Reggae",
    emoji: "🌿",
    url: "https://radio.frequencegroove.com/listen/reggae/radio.mp3",
    description: "No problem. Vraiment aucun.",
    genre: "REGGAE",
  },
] as const;

export type StationId = (typeof STATIONS)[number]["id"];
export type Station = (typeof STATIONS)[number];

interface RadioContextValue {
  currentStation: Station | null;
  isBuffering: boolean;
  isPlaying: boolean;
  hasError: boolean;
  volume: number;
  playTime: number;
  play: (id: StationId) => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  setVolume: (v: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const RadioContext = createContext<RadioContextValue>({
  currentStation: null,
  isBuffering: false,
  isPlaying: false,
  hasError: false,
  volume: 80,
  playTime: 0,
  play: () => {},
  stop: () => {},
  next: () => {},
  prev: () => {},
  setVolume: () => {},
  audioRef: { current: null },
});

export function RadioProvider({ children }: { children: ReactNode }) {
  const [currentStationId, setCurrentStationId] = useState<StationId | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [playTime, setPlayTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStation = STATIONS.find((s) => s.id === currentStationId) ?? null;
  const isPlaying = currentStationId !== null && !isBuffering && !hasError;

  useEffect(() => {
    if (isPlaying) {
      timeIntervalRef.current = setInterval(() => setPlayTime((t) => t + 1), 1000);
    }
    return () => {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, [isPlaying]);

  const volumeRef = useRef(volume);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  const play = useCallback((id: StationId) => {
    const audio = audioRef.current;
    if (!audio) return;

    setHasError(false);
    setPlayTime(0);
    setCurrentStationId(id);
    setIsBuffering(true);

    const station = STATIONS.find((s) => s.id === id)!;
    audio.src = station.url;
    audio.volume = volumeRef.current / 100;
    audio.load();
    audio.play().catch(() => {
      setIsBuffering(false);
      setHasError(true);
    });
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setCurrentStationId(null);
    setIsBuffering(false);
    setHasError(false);
    setPlayTime(0);
  }, []);

  const next = useCallback(() => {
    const idx = STATIONS.findIndex((s) => s.id === currentStationId);
    const nextStation = STATIONS[(idx + 1) % STATIONS.length]!;
    play(nextStation.id);
  }, [currentStationId, play]);

  const prev = useCallback(() => {
    const idx = STATIONS.findIndex((s) => s.id === currentStationId);
    const prevStation = STATIONS[(idx - 1 + STATIONS.length) % STATIONS.length]!;
    play(prevStation.id);
  }, [currentStationId, play]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
  }, []);

  const handlePlaying = useCallback(() => {
    setIsBuffering(false);
  }, []);

  const handleError = useCallback(() => {
    setIsBuffering(false);
    setHasError(true);
  }, []);

  return (
    <RadioContext.Provider
      value={{ currentStation, isBuffering, isPlaying, hasError, volume, playTime, play, stop, next, prev, setVolume, audioRef }}
    >
      <audio
        ref={audioRef}
        onPlaying={handlePlaying}
        onError={handleError}
        onStalled={() => setIsBuffering(true)}
        onWaiting={() => setIsBuffering(true)}
        preload="none"
      />
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  return useContext(RadioContext);
}
