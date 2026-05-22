export type SoundSchemeId = "win98" | "soft" | "chiptune" | "futuriste" | "drole";

export interface ToneStep {
  freq: number;
  dur: number;
  type: OscillatorType;
  vol: number;
  delay?: number;
}

export interface SoundScheme {
  id: SoundSchemeId;
  label: string;
  description: string;
  sounds: {
    click: ToneStep[];
    pop: ToneStep[];
    bip: ToneStep[];
    delete: ToneStep[];
    windowOpen: ToneStep[];
    windowClose: ToneStep[];
    windowMinimize: ToneStep[];
    notifyInfo: ToneStep[];
    notifySuccess: ToneStep[];
    notifyError: ToneStep[];
    notifyWarning: ToneStep[];
  };
}

const SCHEMES: SoundScheme[] = [
  {
    id: "win98",
    label: "Win98",
    description: "Beeps carrés rétro, fidèle à l'original",
    sounds: {
      click:          [{ freq: 1200, dur: 0.04, type: "square",   vol: 0.07 }],
      pop:            [{ freq: 1100, dur: 0.12, type: "sine",     vol: 0.15 }],
      bip:            [{ freq: 820,  dur: 0.05, type: "square",   vol: 0.08 }],
      delete:         [{ freq: 400,  dur: 0.15, type: "triangle", vol: 0.12 }],
      windowOpen:     [{ freq: 440,  dur: 0.07, type: "square",   vol: 0.09 }, { freq: 880, dur: 0.07, type: "square", vol: 0.09, delay: 0.07 }],
      windowClose:    [{ freq: 880,  dur: 0.08, type: "square",   vol: 0.09 }, { freq: 220, dur: 0.09, type: "square", vol: 0.09, delay: 0.08 }],
      windowMinimize: [{ freq: 660,  dur: 0.06, type: "square",   vol: 0.07 }, { freq: 330, dur: 0.06, type: "square", vol: 0.07, delay: 0.06 }],
      notifyInfo:     [{ freq: 1100, dur: 0.12, type: "sine",     vol: 0.15 }],
      notifySuccess:  [{ freq: 523,  dur: 0.12, type: "sine",     vol: 0.18 }, { freq: 659, dur: 0.12, type: "sine", vol: 0.18, delay: 0.13 }, { freq: 784, dur: 0.12, type: "sine", vol: 0.18, delay: 0.26 }, { freq: 1047, dur: 0.2, type: "sine", vol: 0.18, delay: 0.39 }],
      notifyError:    [{ freq: 400,  dur: 0.15, type: "triangle", vol: 0.12 }],
      notifyWarning:  [{ freq: 820,  dur: 0.05, type: "square",   vol: 0.08 }],
    },
  },
  {
    id: "soft",
    label: "Soft",
    description: "Tons feutrés et doux, ambiance calme",
    sounds: {
      click:          [{ freq: 900,  dur: 0.06, type: "sine",     vol: 0.06 }],
      pop:            [{ freq: 700,  dur: 0.18, type: "sine",     vol: 0.10 }],
      bip:            [{ freq: 550,  dur: 0.08, type: "sine",     vol: 0.07 }],
      delete:         [{ freq: 280,  dur: 0.20, type: "sine",     vol: 0.08 }],
      windowOpen:     [{ freq: 520,  dur: 0.10, type: "sine",     vol: 0.08 }, { freq: 780, dur: 0.12, type: "sine", vol: 0.08, delay: 0.10 }],
      windowClose:    [{ freq: 680,  dur: 0.10, type: "sine",     vol: 0.08 }, { freq: 340, dur: 0.12, type: "sine", vol: 0.08, delay: 0.10 }],
      windowMinimize: [{ freq: 580,  dur: 0.09, type: "sine",     vol: 0.07 }, { freq: 380, dur: 0.09, type: "sine", vol: 0.06, delay: 0.09 }],
      notifyInfo:     [{ freq: 700,  dur: 0.18, type: "sine",     vol: 0.10 }],
      notifySuccess:  [{ freq: 440,  dur: 0.15, type: "sine",     vol: 0.12 }, { freq: 554, dur: 0.15, type: "sine", vol: 0.12, delay: 0.16 }, { freq: 659, dur: 0.22, type: "sine", vol: 0.12, delay: 0.32 }],
      notifyError:    [{ freq: 280,  dur: 0.20, type: "sine",     vol: 0.08 }],
      notifyWarning:  [{ freq: 550,  dur: 0.08, type: "sine",     vol: 0.07 }],
    },
  },
  {
    id: "chiptune",
    label: "Chiptune",
    description: "Style NES/GameBoy, notes pixélisées",
    sounds: {
      click:          [{ freq: 1400, dur: 0.03, type: "square",   vol: 0.10 }],
      pop:            [{ freq: 880,  dur: 0.08, type: "square",   vol: 0.14 }],
      bip:            [{ freq: 660,  dur: 0.06, type: "square",   vol: 0.10 }],
      delete:         [{ freq: 110,  dur: 0.12, type: "square",   vol: 0.13 }],
      windowOpen:     [{ freq: 523,  dur: 0.05, type: "square",   vol: 0.12 }, { freq: 659, dur: 0.05, type: "square", vol: 0.12, delay: 0.06 }, { freq: 784, dur: 0.05, type: "square", vol: 0.12, delay: 0.12 }],
      windowClose:    [{ freq: 784,  dur: 0.05, type: "square",   vol: 0.12 }, { freq: 659, dur: 0.05, type: "square", vol: 0.12, delay: 0.06 }, { freq: 523, dur: 0.05, type: "square", vol: 0.12, delay: 0.12 }],
      windowMinimize: [{ freq: 660,  dur: 0.05, type: "square",   vol: 0.10 }, { freq: 440, dur: 0.05, type: "square", vol: 0.10, delay: 0.06 }],
      notifyInfo:     [{ freq: 880,  dur: 0.08, type: "square",   vol: 0.14 }],
      notifySuccess:  [{ freq: 523,  dur: 0.07, type: "square",   vol: 0.15 }, { freq: 659, dur: 0.07, type: "square", vol: 0.15, delay: 0.08 }, { freq: 784, dur: 0.07, type: "square", vol: 0.15, delay: 0.16 }, { freq: 1047, dur: 0.07, type: "square", vol: 0.15, delay: 0.24 }, { freq: 1319, dur: 0.12, type: "square", vol: 0.15, delay: 0.32 }],
      notifyError:    [{ freq: 220,  dur: 0.10, type: "square",   vol: 0.13 }, { freq: 110, dur: 0.15, type: "square", vol: 0.13, delay: 0.12 }],
      notifyWarning:  [{ freq: 660,  dur: 0.06, type: "square",   vol: 0.10 }, { freq: 660, dur: 0.06, type: "square", vol: 0.10, delay: 0.12 }],
    },
  },
  {
    id: "futuriste",
    label: "Futuriste",
    description: "Sweeps électroniques, ambiance spatiale",
    sounds: {
      click:          [{ freq: 2200, dur: 0.03, type: "sine",     vol: 0.06 }],
      pop:            [{ freq: 1800, dur: 0.07, type: "sine",     vol: 0.09 }],
      bip:            [{ freq: 1600, dur: 0.05, type: "sawtooth", vol: 0.06 }],
      delete:         [{ freq: 300,  dur: 0.20, type: "sawtooth", vol: 0.08 }],
      windowOpen:     [{ freq: 200,  dur: 0.18, type: "sine",     vol: 0.08 }, { freq: 2000, dur: 0.12, type: "sine", vol: 0.06, delay: 0.08 }],
      windowClose:    [{ freq: 2000, dur: 0.10, type: "sine",     vol: 0.07 }, { freq: 150,  dur: 0.15, type: "sine", vol: 0.07, delay: 0.09 }],
      windowMinimize: [{ freq: 1200, dur: 0.08, type: "sawtooth", vol: 0.06 }, { freq: 600,  dur: 0.08, type: "sawtooth", vol: 0.05, delay: 0.09 }],
      notifyInfo:     [{ freq: 1800, dur: 0.07, type: "sine",     vol: 0.09 }],
      notifySuccess:  [{ freq: 400,  dur: 0.25, type: "sine",     vol: 0.10 }, { freq: 2400, dur: 0.15, type: "sine", vol: 0.08, delay: 0.15 }],
      notifyError:    [{ freq: 80,   dur: 0.30, type: "sawtooth", vol: 0.10 }, { freq: 60,   dur: 0.20, type: "sawtooth", vol: 0.08, delay: 0.25 }],
      notifyWarning:  [{ freq: 1600, dur: 0.05, type: "sawtooth", vol: 0.06 }, { freq: 1600, dur: 0.05, type: "sawtooth", vol: 0.06, delay: 0.10 }, { freq: 1600, dur: 0.05, type: "sawtooth", vol: 0.06, delay: 0.20 }],
    },
  },
  {
    id: "drole",
    label: "Cartoon",
    description: "Sons exagérés et comiques, genre dessin animé",
    sounds: {
      click:          [{ freq: 2800, dur: 0.02, type: "sine",     vol: 0.12 }],
      pop:            [{ freq: 150,  dur: 0.05, type: "sine",     vol: 0.20 }, { freq: 2500, dur: 0.08, type: "sine", vol: 0.15, delay: 0.03 }],
      bip:            [{ freq: 3000, dur: 0.04, type: "square",   vol: 0.10 }],
      delete:         [{ freq: 800,  dur: 0.04, type: "sine",     vol: 0.14 }, { freq: 200, dur: 0.15, type: "triangle", vol: 0.14, delay: 0.04 }, { freq: 80, dur: 0.12, type: "triangle", vol: 0.12, delay: 0.16 }],
      windowOpen:     [{ freq: 300,  dur: 0.06, type: "sine",     vol: 0.12 }, { freq: 600,  dur: 0.06, type: "sine", vol: 0.12, delay: 0.06 }, { freq: 1200, dur: 0.06, type: "sine", vol: 0.12, delay: 0.12 }, { freq: 2400, dur: 0.06, type: "sine", vol: 0.12, delay: 0.18 }],
      windowClose:    [{ freq: 2400, dur: 0.06, type: "sine",     vol: 0.12 }, { freq: 1200, dur: 0.06, type: "sine", vol: 0.12, delay: 0.06 }, { freq: 600,  dur: 0.06, type: "sine", vol: 0.12, delay: 0.12 }, { freq: 80,   dur: 0.10, type: "sine", vol: 0.10, delay: 0.18 }],
      windowMinimize: [{ freq: 1000, dur: 0.04, type: "sine",     vol: 0.10 }, { freq: 700,  dur: 0.04, type: "sine", vol: 0.10, delay: 0.05 }, { freq: 400,  dur: 0.04, type: "sine", vol: 0.10, delay: 0.10 }],
      notifyInfo:     [{ freq: 150,  dur: 0.05, type: "sine",     vol: 0.20 }, { freq: 2500, dur: 0.08, type: "sine", vol: 0.15, delay: 0.03 }],
      notifySuccess:  [{ freq: 400,  dur: 0.04, type: "sine",     vol: 0.16 }, { freq: 600,  dur: 0.04, type: "sine", vol: 0.16, delay: 0.05 }, { freq: 800,  dur: 0.04, type: "sine", vol: 0.16, delay: 0.10 }, { freq: 1200, dur: 0.04, type: "sine", vol: 0.16, delay: 0.15 }, { freq: 1600, dur: 0.04, type: "sine", vol: 0.16, delay: 0.20 }, { freq: 2400, dur: 0.10, type: "sine", vol: 0.18, delay: 0.25 }],
      notifyError:    [{ freq: 800,  dur: 0.04, type: "sine",     vol: 0.14 }, { freq: 200,  dur: 0.15, type: "triangle", vol: 0.14, delay: 0.04 }, { freq: 80,   dur: 0.12, type: "triangle", vol: 0.12, delay: 0.16 }],
      notifyWarning:  [{ freq: 3000, dur: 0.04, type: "square",   vol: 0.10 }, { freq: 3000, dur: 0.04, type: "square", vol: 0.10, delay: 0.08 }],
    },
  },
];

export const SCHEME_MAP = new Map(SCHEMES.map((s) => [s.id, s]));
export const DEFAULT_SOUND_SCHEME_ID: SoundSchemeId = "win98";

export { SCHEMES as SOUND_SCHEMES };
