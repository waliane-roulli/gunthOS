export type SoundSchemeId = "win98" | "soft" | "amstrad" | "megadrive" | "waterdrop";

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
    tierDiamond: ToneStep[];
    tierGold: ToneStep[];
    tierSilver: ToneStep[];
    tierBronze: ToneStep[];
    tierBanger: ToneStep[];
    tierCaca: ToneStep[];
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
      tierDiamond: [{ freq: 523, dur: 0.10, type: "square", vol: 0.14 }, { freq: 659, dur: 0.10, type: "square", vol: 0.14, delay: 0.10 }, { freq: 784, dur: 0.10, type: "square", vol: 0.14, delay: 0.20 }, { freq: 1047, dur: 0.20, type: "square", vol: 0.16, delay: 0.30 }],
      tierGold:    [{ freq: 523, dur: 0.10, type: "square", vol: 0.14 }, { freq: 659, dur: 0.10, type: "square", vol: 0.14, delay: 0.10 }, { freq: 784, dur: 0.15, type: "square", vol: 0.14, delay: 0.20 }],
      tierSilver:  [{ freq: 523, dur: 0.10, type: "square", vol: 0.12 }, { freq: 659, dur: 0.15, type: "square", vol: 0.12, delay: 0.10 }],
      tierBronze:  [{ freq: 440, dur: 0.12, type: "square", vol: 0.11 }],
      tierBanger:  [{ freq: 330, dur: 0.12, type: "triangle", vol: 0.10 }, { freq: 262, dur: 0.12, type: "triangle", vol: 0.10, delay: 0.13 }, { freq: 220, dur: 0.18, type: "triangle", vol: 0.09, delay: 0.26 }],
      tierCaca:    [{ freq: 300, dur: 0.10, type: "square", vol: 0.08 }, { freq: 280, dur: 0.10, type: "square", vol: 0.08, delay: 0.10 }, { freq: 250, dur: 0.10, type: "square", vol: 0.07, delay: 0.20 }, { freq: 200, dur: 0.15, type: "square", vol: 0.06, delay: 0.30 }],
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
      tierDiamond: [{ freq: 523, dur: 0.12, type: "sine", vol: 0.11 }, { freq: 659, dur: 0.12, type: "sine", vol: 0.11, delay: 0.12 }, { freq: 784, dur: 0.12, type: "sine", vol: 0.11, delay: 0.24 }, { freq: 1047, dur: 0.22, type: "sine", vol: 0.13, delay: 0.36 }],
      tierGold:    [{ freq: 523, dur: 0.12, type: "sine", vol: 0.11 }, { freq: 659, dur: 0.12, type: "sine", vol: 0.11, delay: 0.12 }, { freq: 784, dur: 0.16, type: "sine", vol: 0.11, delay: 0.24 }],
      tierSilver:  [{ freq: 523, dur: 0.12, type: "sine", vol: 0.10 }, { freq: 659, dur: 0.16, type: "sine", vol: 0.10, delay: 0.12 }],
      tierBronze:  [{ freq: 440, dur: 0.14, type: "sine", vol: 0.09 }],
      tierBanger:  [{ freq: 330, dur: 0.14, type: "sine", vol: 0.08 }, { freq: 262, dur: 0.14, type: "sine", vol: 0.08, delay: 0.15 }, { freq: 220, dur: 0.20, type: "sine", vol: 0.07, delay: 0.30 }],
      tierCaca:    [{ freq: 280, dur: 0.12, type: "sine", vol: 0.07 }, { freq: 260, dur: 0.12, type: "sine", vol: 0.06, delay: 0.12 }, { freq: 230, dur: 0.12, type: "sine", vol: 0.06, delay: 0.24 }, { freq: 180, dur: 0.18, type: "sine", vol: 0.05, delay: 0.36 }],
    },
  },
  {
    id: "amstrad",
    label: "Amstrad CPC",
    description: "Puce AY-3-8912, square waves buzzy 8-bit européen",
    sounds: {
      click:          [{ freq: 800,  dur: 0.03, type: "square",   vol: 0.09 }],
      pop:            [{ freq: 500,  dur: 0.10, type: "square",   vol: 0.13 }],
      bip:            [{ freq: 500,  dur: 0.05, type: "square",   vol: 0.09 }],
      delete:         [{ freq: 150,  dur: 0.14, type: "square",   vol: 0.11 }],
      windowOpen:     [{ freq: 300,  dur: 0.06, type: "square",   vol: 0.10 }, { freq: 500, dur: 0.06, type: "square", vol: 0.10, delay: 0.06 }, { freq: 800, dur: 0.06, type: "square", vol: 0.10, delay: 0.12 }],
      windowClose:    [{ freq: 800,  dur: 0.06, type: "square",   vol: 0.10 }, { freq: 500, dur: 0.06, type: "square", vol: 0.10, delay: 0.06 }, { freq: 200, dur: 0.08, type: "square", vol: 0.10, delay: 0.12 }],
      windowMinimize: [{ freq: 600,  dur: 0.05, type: "square",   vol: 0.08 }, { freq: 300, dur: 0.06, type: "square", vol: 0.08, delay: 0.05 }],
      notifyInfo:     [{ freq: 500,  dur: 0.10, type: "square",   vol: 0.13 }],
      notifySuccess:  [{ freq: 300,  dur: 0.08, type: "square",   vol: 0.14 }, { freq: 500, dur: 0.08, type: "square", vol: 0.14, delay: 0.08 }, { freq: 800, dur: 0.08, type: "square", vol: 0.14, delay: 0.16 }, { freq: 1200, dur: 0.14, type: "square", vol: 0.14, delay: 0.24 }],
      notifyError:    [{ freq: 150,  dur: 0.14, type: "square",   vol: 0.11 }],
      notifyWarning:  [{ freq: 500,  dur: 0.05, type: "square",   vol: 0.09 }, { freq: 500, dur: 0.05, type: "square", vol: 0.09, delay: 0.10 }],
      tierDiamond: [{ freq: 523, dur: 0.08, type: "square", vol: 0.15 }, { freq: 659, dur: 0.08, type: "square", vol: 0.15, delay: 0.08 }, { freq: 784, dur: 0.08, type: "square", vol: 0.15, delay: 0.16 }, { freq: 1047, dur: 0.16, type: "square", vol: 0.17, delay: 0.24 }],
      tierGold:    [{ freq: 523, dur: 0.08, type: "square", vol: 0.15 }, { freq: 659, dur: 0.08, type: "square", vol: 0.15, delay: 0.08 }, { freq: 784, dur: 0.12, type: "square", vol: 0.15, delay: 0.16 }],
      tierSilver:  [{ freq: 523, dur: 0.08, type: "square", vol: 0.13 }, { freq: 659, dur: 0.12, type: "square", vol: 0.13, delay: 0.08 }],
      tierBronze:  [{ freq: 440, dur: 0.10, type: "square", vol: 0.12 }],
      tierBanger:  [{ freq: 400, dur: 0.10, type: "square", vol: 0.10 }, { freq: 300, dur: 0.10, type: "square", vol: 0.10, delay: 0.10 }, { freq: 200, dur: 0.14, type: "square", vol: 0.09, delay: 0.20 }],
      tierCaca:    [{ freq: 250, dur: 0.10, type: "square", vol: 0.08 }, { freq: 220, dur: 0.10, type: "square", vol: 0.07, delay: 0.10 }, { freq: 190, dur: 0.10, type: "square", vol: 0.07, delay: 0.20 }, { freq: 150, dur: 0.14, type: "square", vol: 0.06, delay: 0.30 }],
    },
  },
  {
    id: "megadrive",
    label: "Mega Drive",
    description: "Puce YM2612, FM synthesis métallique et percutante",
    sounds: {
      click:          [{ freq: 2400, dur: 0.02, type: "sawtooth", vol: 0.08 }],
      pop:            [{ freq: 1200, dur: 0.07, type: "sawtooth", vol: 0.11 }],
      bip:            [{ freq: 1200, dur: 0.04, type: "sawtooth", vol: 0.08 }],
      delete:         [{ freq: 200,  dur: 0.14, type: "sawtooth", vol: 0.10 }],
      windowOpen:     [{ freq: 400,  dur: 0.06, type: "sawtooth", vol: 0.10 }, { freq: 800, dur: 0.06, type: "sawtooth", vol: 0.10, delay: 0.06 }, { freq: 1600, dur: 0.06, type: "sawtooth", vol: 0.10, delay: 0.12 }],
      windowClose:    [{ freq: 1600, dur: 0.06, type: "sawtooth", vol: 0.10 }, { freq: 800, dur: 0.06, type: "sawtooth", vol: 0.10, delay: 0.06 }, { freq: 300, dur: 0.08, type: "sawtooth", vol: 0.10, delay: 0.12 }],
      windowMinimize: [{ freq: 900,  dur: 0.05, type: "sawtooth", vol: 0.08 }, { freq: 450, dur: 0.05, type: "sawtooth", vol: 0.08, delay: 0.06 }],
      notifyInfo:     [{ freq: 1200, dur: 0.07, type: "sawtooth", vol: 0.11 }],
      notifySuccess:  [{ freq: 400,  dur: 0.07, type: "sawtooth", vol: 0.12 }, { freq: 600, dur: 0.07, type: "sawtooth", vol: 0.12, delay: 0.07 }, { freq: 900, dur: 0.07, type: "sawtooth", vol: 0.12, delay: 0.14 }, { freq: 1400, dur: 0.07, type: "sawtooth", vol: 0.12, delay: 0.21 }, { freq: 2000, dur: 0.12, type: "sawtooth", vol: 0.12, delay: 0.28 }],
      notifyError:    [{ freq: 150,  dur: 0.15, type: "sawtooth", vol: 0.11 }, { freq: 80,  dur: 0.20, type: "sawtooth", vol: 0.10, delay: 0.16 }],
      notifyWarning:  [{ freq: 1200, dur: 0.04, type: "sawtooth", vol: 0.08 }, { freq: 1200, dur: 0.04, type: "sawtooth", vol: 0.08, delay: 0.10 }, { freq: 1200, dur: 0.04, type: "sawtooth", vol: 0.08, delay: 0.20 }],
      tierDiamond: [{ freq: 523, dur: 0.06, type: "sawtooth", vol: 0.13 }, { freq: 659, dur: 0.06, type: "sawtooth", vol: 0.13, delay: 0.07 }, { freq: 784, dur: 0.06, type: "sawtooth", vol: 0.13, delay: 0.14 }, { freq: 1047, dur: 0.07, type: "sawtooth", vol: 0.15, delay: 0.21 }, { freq: 1318, dur: 0.14, type: "sawtooth", vol: 0.14, delay: 0.28 }],
      tierGold:    [{ freq: 523, dur: 0.06, type: "sawtooth", vol: 0.13 }, { freq: 659, dur: 0.06, type: "sawtooth", vol: 0.13, delay: 0.07 }, { freq: 784, dur: 0.10, type: "sawtooth", vol: 0.13, delay: 0.14 }],
      tierSilver:  [{ freq: 523, dur: 0.06, type: "sawtooth", vol: 0.11 }, { freq: 659, dur: 0.10, type: "sawtooth", vol: 0.11, delay: 0.07 }],
      tierBronze:  [{ freq: 440, dur: 0.08, type: "sawtooth", vol: 0.10 }],
      tierBanger:  [{ freq: 300, dur: 0.08, type: "sawtooth", vol: 0.09 }, { freq: 200, dur: 0.08, type: "sawtooth", vol: 0.09, delay: 0.09 }, { freq: 150, dur: 0.12, type: "sawtooth", vol: 0.08, delay: 0.18 }],
      tierCaca:    [{ freq: 200, dur: 0.08, type: "sawtooth", vol: 0.07 }, { freq: 170, dur: 0.08, type: "sawtooth", vol: 0.07, delay: 0.08 }, { freq: 140, dur: 0.08, type: "sawtooth", vol: 0.06, delay: 0.16 }, { freq: 100, dur: 0.12, type: "sawtooth", vol: 0.05, delay: 0.24 }],
    },
  },
  {
    id: "waterdrop",
    label: "Goutte d'eau",
    description: "Plocs et gouttes, ambiance aquatique",
    sounds: {
      click:          [{ freq: 1200, dur: 0.03, type: "sine",     vol: 0.10 }, { freq: 600, dur: 0.05, type: "sine", vol: 0.06, delay: 0.02 }],
      pop:            [{ freq: 800,  dur: 0.06, type: "sine",     vol: 0.14 }, { freq: 300, dur: 0.10, type: "sine", vol: 0.08, delay: 0.04 }],
      bip:            [{ freq: 900,  dur: 0.04, type: "sine",     vol: 0.11 }, { freq: 400, dur: 0.06, type: "sine", vol: 0.06, delay: 0.03 }],
      delete:         [{ freq: 250,  dur: 0.12, type: "sine",     vol: 0.10 }, { freq: 100, dur: 0.15, type: "sine", vol: 0.06, delay: 0.08 }],
      windowOpen:     [{ freq: 500,  dur: 0.05, type: "sine",     vol: 0.10 }, { freq: 800, dur: 0.05, type: "sine", vol: 0.10, delay: 0.06 }, { freq: 1200, dur: 0.05, type: "sine", vol: 0.10, delay: 0.12 }],
      windowClose:    [{ freq: 1200, dur: 0.05, type: "sine",     vol: 0.10 }, { freq: 800, dur: 0.05, type: "sine", vol: 0.10, delay: 0.06 }, { freq: 400, dur: 0.06, type: "sine", vol: 0.10, delay: 0.12 }],
      windowMinimize: [{ freq: 700,  dur: 0.04, type: "sine",     vol: 0.09 }, { freq: 400, dur: 0.05, type: "sine", vol: 0.07, delay: 0.04 }],
      notifyInfo:     [{ freq: 800,  dur: 0.06, type: "sine",     vol: 0.14 }, { freq: 300, dur: 0.10, type: "sine", vol: 0.08, delay: 0.04 }],
      notifySuccess:  [{ freq: 600,  dur: 0.05, type: "sine",     vol: 0.13 }, { freq: 900, dur: 0.05, type: "sine", vol: 0.13, delay: 0.06 }, { freq: 1200, dur: 0.05, type: "sine", vol: 0.13, delay: 0.12 }, { freq: 1600, dur: 0.08, type: "sine", vol: 0.13, delay: 0.18 }],
      notifyError:    [{ freq: 250,  dur: 0.12, type: "sine",     vol: 0.10 }, { freq: 100, dur: 0.15, type: "sine", vol: 0.06, delay: 0.08 }],
      notifyWarning:  [{ freq: 1000, dur: 0.04, type: "sine",     vol: 0.11 }, { freq: 500, dur: 0.06, type: "sine", vol: 0.07, delay: 0.03 }],
      tierDiamond: [{ freq: 600, dur: 0.06, type: "sine", vol: 0.14 }, { freq: 800, dur: 0.06, type: "sine", vol: 0.14, delay: 0.07 }, { freq: 1000, dur: 0.06, type: "sine", vol: 0.14, delay: 0.14 }, { freq: 1400, dur: 0.06, type: "sine", vol: 0.14, delay: 0.21 }, { freq: 1600, dur: 0.07, type: "sine", vol: 0.16, delay: 0.28 }],
      tierGold:    [{ freq: 600, dur: 0.06, type: "sine", vol: 0.13 }, { freq: 800, dur: 0.06, type: "sine", vol: 0.13, delay: 0.07 }, { freq: 1000, dur: 0.10, type: "sine", vol: 0.13, delay: 0.14 }],
      tierSilver:  [{ freq: 600, dur: 0.06, type: "sine", vol: 0.11 }, { freq: 800, dur: 0.10, type: "sine", vol: 0.11, delay: 0.07 }],
      tierBronze:  [{ freq: 500, dur: 0.08, type: "sine", vol: 0.10 }, { freq: 350, dur: 0.12, type: "sine", vol: 0.07, delay: 0.05 }],
      tierBanger:  [{ freq: 400, dur: 0.08, type: "sine", vol: 0.09 }, { freq: 300, dur: 0.10, type: "sine", vol: 0.08, delay: 0.06 }, { freq: 200, dur: 0.14, type: "sine", vol: 0.07, delay: 0.14 }],
      tierCaca:    [{ freq: 300, dur: 0.06, type: "sine", vol: 0.08 }, { freq: 250, dur: 0.06, type: "sine", vol: 0.07, delay: 0.06 }, { freq: 200, dur: 0.06, type: "sine", vol: 0.07, delay: 0.12 }, { freq: 150, dur: 0.06, type: "sine", vol: 0.06, delay: 0.18 }, { freq: 100, dur: 0.08, type: "sine", vol: 0.05, delay: 0.24 }],
    },
  },
];

export const SCHEME_MAP = new Map(SCHEMES.map((s) => [s.id, s]));
export const DEFAULT_SOUND_SCHEME_ID: SoundSchemeId = "win98";

export { SCHEMES as SOUND_SCHEMES };
