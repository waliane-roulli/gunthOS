// ====================================================================
// TASKKILL.EXE — The Bloatware Purge v2.0
// Moteur de jeu Shmup horizontal pour GunthOS
// "Object pooling, deltaTime, zéro GC — parce que le navigateur
//  a déjà assez de fuites mémoire comme ça."
// v2: pixelated, spaceship, middle fingers, power-ups, max dégénté
// ====================================================================

// --- Configuration d'entrée ---
export interface EngineConfig {
  onShake?: (intensity: number) => void;
  onNotify?: (message: string) => void;
  onGameOver?: (score: number, wave: number) => void;
}

// ====================================================================
// TYPES
// ====================================================================
type EnemyType = "plouf" | "notif" | "popup" | "radio" | "defrag" | "clippy" | "trash" | "bsod";
type GameState = "title" | "playing" | "waveIntro" | "gameover" | "victory";

interface Poolable {
  alive: boolean;
}

interface BulletData extends Poolable {
  x: number; y: number;
  vx: number; vy: number;
  w: number; h: number;
  damage: number;
  isPlayerBullet: boolean;
  // Offset for spread rendering
  spreadIndex: number;
}

interface ParticleData extends Poolable {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  char: string; color: string;
  size: number; rotation: number; rotationSpeed: number;
}

interface EnemyData extends Poolable {
  x: number; y: number; w: number; h: number;
  vx: number; vy: number;
  hp: number; maxHp: number;
  enemyType: EnemyType;
  score: number;
  canShoot: boolean;
  fireTimer: number; fireRate: number;
  phase: number; phaseTimer: number;
  flashTimer: number;
  emoji: string;
  baseY: number;
}

interface BossData {
  x: number; y: number; w: number; h: number;
  hp: number; maxHp: number;
  phase: number;
  fireTimer: number; fireRate: number;
  moveTimer: number; targetY: number;
  alive: boolean; entered: boolean;
  driftVx: number; deathTimer: number;
}

interface PowerUpData extends Poolable {
  x: number; y: number;
  vx: number; vy: number;
  w: number; h: number;
  type: "powerup";
  timer: number;
  pulsePhase: number;
}

interface BannerData {
  text: string;
  x: number; y: number;
  life: number; maxLife: number;
  color: string;
  size: number;
  vy: number;
}

// ====================================================================
// CONSTANTES
// ====================================================================

const ENEMY_DEFS: Record<
  EnemyType,
  { hp: number; speed: number; score: number; canShoot: boolean; emoji: string; w: number; h: number; fireRate: number }
> = {
  plouf:     { hp: 3,  speed: 100, score: 100, canShoot: false, emoji: "🐟",  w: 32, h: 24, fireRate: 0 },
  notif:     { hp: 3,  speed: 145, score: 125, canShoot: true,  emoji: "🔔",  w: 28, h: 28, fireRate: 2.2 },
  popup:     { hp: 6,  speed: 55,  score: 200, canShoot: false, emoji: "💬",  w: 48, h: 40, fireRate: 0 },
  radio:     { hp: 6,  speed: 65,  score: 250, canShoot: true,  emoji: "📡",  w: 34, h: 34, fireRate: 2.0 },
  defrag:    { hp: 4,  speed: 75,  score: 200, canShoot: false, emoji: "🧩",  w: 36, h: 36, fireRate: 0 },
  clippy:    { hp: 12, speed: 50,  score: 500, canShoot: true,  emoji: "📎",  w: 56, h: 56, fireRate: 1.3 },
  trash:     { hp: 9,  speed: 45,  score: 225, canShoot: false, emoji: "🗑️", w: 40, h: 40, fireRate: 0 },
  bsod:      { hp: 15, speed: 35,  score: 400, canShoot: false, emoji: "💀",  w: 56, h: 44, fireRate: 0 },
};

const PLAYER_SPEED = 360;
const PLAYER_FIRE_RATE = 0.15;
const PLAYER_MAX_HEALTH = 3;
const PLAYER_INVINCIBLE_TIME = 2.0;
const BULLET_SPEED = 700;
const ENEMY_BULLET_SPEED = 230;
const HITSTOP_DURATION = 0.04;
const PARTICLE_GRAVITY = 160;
const POWERUP_DROP_RATE = 0.28;
const POWERUP_SPEED = -60;
const MAX_POWER_LEVEL = 4;
const RAGE_KILL_THRESHOLD = 5;
const RAGE_DURATION = 4.0;
const RAGE_KILL_WINDOW = 3.0;

const DEATH_CHARS = ["✕", "▓", "☠", "💀", "⚠", "⊕", "∅", "404", "0xDEAD", "SEGV", "null", "🗑️", "💥", "🤡", "ERR", "🖕", "💩", "FML"];
const SPARK_CHARS = ["·", "∗", "✦", "□", "■", "🖕", "🔥"];
const BOSS_CHARS = ["CRASH", "DUMP", "FATAL", "0x0F", "HALT", "☠", "💀", "BSOD", "RIP", "🖕", "LOL"];


const WAVE_CONFIG = [
  { name: "🐟 Plouf Plouf a crashé — les poissons s'échappent !", types: { plouf: 20 } },
  { name: "🔔 GunthMessenger™ — spam de notifications", types: { plouf: 8, notif: 14 } },
  { name: "🟢 Matrix — le système se fait hacker", types: { notif: 6, popup: 4, defrag: 6 } },
  { name: "📡 GunthRadio™ — ondes parasites + Défragmenteur bloqué", types: { radio: 8, popup: 6, defrag: 8 } },
  { name: "🗑️ Corbeille pleine — fichiers corrompus + BSOD", types: { trash: 8, clippy: 3, bsod: 4 } },
  { name: "💀 MISE À JOUR CRITIQUE — Windows Update.exe", types: {}, boss: true },
];

const GUNTHOS_NOTIFS = [
  "Vous venez de détruire System32. Bravo. J'espère que vous êtes fier.",
  "Astuce : Les pop-ups 'Vous êtes le 1 000 000ème visiteur' ont 300 PV. Bonne chance.",
  "Mémoire RAM insuffisante pour votre ego. Réduction de la cadence de tir.",
  "DLL manquante : self_control.dll — le tir continu est activé par défaut.",
  "Le Gestionnaire des Tâches observe vos performances. Il n'est pas impressionné.",
  "Erreur 418 : Je suis une théière. Et vous, vous êtes mauvais.",
  "Conseil technique : esquiver les balles réduit les dégâts. Incroyable, non ?",
  "Votre curseur a été déplacé. Raison : incompétence.",
  "BSOD imminent. Profitez du spectacle.",
  "Défragmentation de votre style de jeu... 0% complété.",
  "🖕 Windows Update vous salue bien bas.",
  "ALERTE : Votre fichier pagefile.sys est plus gros que votre avenir.",
  "Windows Defender a détecté une menace : votre gameplay.",
  "Erreur 0x80070057 : Le paramètre 'talent' est incorrect.",
  "Cortana essaie de vous aider. Elle a abandonné.",
  "Votre PC a rencontré un problème : vous.",
  "Bonjour. C'est Bill Gates. Arrêtez de tirer sur mes pop-ups.",
  "CTRL+ALT+DEL n'a jamais sauvé personne ici.",
  "🐟 Plouf Plouf a essayé de nager dans votre RAM. Il s'est noyé.",
  "📡 GunthRadio™ diffuse vos échecs en direct sur 98.8 FM.",
  "💬 GunthMessenger™ : 'Vous êtes nul' — message de vous-même.",
  "🧩 Défragmenteur bloqué à 99%. Comme votre vie.",
  "🗑️ La Corbeille est pleine. Comme votre historique de défaites.",
  "🔔 Nouvelle notification : vous perdez. Encore.",
];

// Banners spécifiques par type d'ennemi
const ENEMY_BANNERS: Partial<Record<EnemyType, string[]>> = {
  plouf:     ["🐟 PLOUF !", "LE SORT A CHOISI...", "SPLASH !", "ÇA FAIT PLOUF !"],
  notif:     ["🔔 MUTED !", "SPAM ÉLIMINÉ !", "NOTIF FERMÉE !", "SILENCE !"],
  popup:     ["💬 POP-UP FERMÉ !", "AD BLOCKED !", "FENÊTRE FERMÉE !", "CLIQUE PAS !"],
  radio:     ["📡 SIGNAL PERDU !", "RADIO OFF !", "FRÉQUENCE COUPÉE !", "MUTE FORCÉ !"],
  defrag:    ["🧩 DÉFRAGMENTÉ !", "BLOC CORROMPU !", "SECTEUR EFFACÉ !", "DISQUE FRAGMENTÉ !"],
  clippy:    ["📎 CLIPPY OUT !", "T'ES MOCHE !", "ASSISTANT VIRÉ !", "AIDE REFUSÉE !", "CLIPPY DÉSINSTALLÉ !"],
  trash:     [
    "🗑️ bukake_facials_vol3.avi",
    "🗑️ selfie_nu_artistique.jpg",
    "🗑️ Kazaa_crack_virus.exe",
    "🗑️ voisine_piscine_zoom.jpg",
    "🗑️ milf_hunter_ep47.avi",
    "🗑️ celine_dion_remix.mp3",
    "🗑️ backup_mdp_SECRET.txt",
    "🗑️ recherches_a_effacer.txt",
  ],
  bsod:      ["💀 BSOD FIXED !", "REDÉMARRAGE...", "CRASH RÉSOLU !", "PAS DE CHANCE !"],
};

// ====================================================================
// OBJECT POOL
// ====================================================================
class Pool<T extends Poolable> {
  private free: T[] = [];
  active: T[] = [];

  constructor(
    private factory: () => T,
    private resetFn: (obj: T) => void,
    initialSize = 60,
  ) {
    for (let i = 0; i < initialSize; i++) {
      const obj = factory();
      obj.alive = false;
      this.free.push(obj);
    }
  }

  acquire(): T {
    const popped = this.free.pop();
    const obj: T = popped !== undefined ? popped : this.factory();
    this.resetFn(obj);
    obj.alive = true;
    this.active.push(obj);
    return obj;
  }

  release(obj: T): void {
    const idx = this.active.indexOf(obj);
    if (idx !== -1) {
      this.active.splice(idx, 1);
      obj.alive = false;
      this.free.push(obj);
    }
  }

  releaseAll(): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      this.active[i]!.alive = false;
      this.free.push(this.active[i]!);
    }
    this.active.length = 0;
  }
}

// ====================================================================
// INPUT MANAGER
// ====================================================================
class InputManager {
  private keys = new Set<string>();
  private justPressed = new Set<string>();
  private onKD: (e: KeyboardEvent) => void;
  private onKU: (e: KeyboardEvent) => void;
  private onBlur: () => void;

  constructor() {
    this.onKD = (e) => {
      if (!this.keys.has(e.key)) this.justPressed.add(e.key);
      this.keys.add(e.key);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
    };
    this.onKU = (e) => this.keys.delete(e.key);
    this.onBlur = () => this.keys.clear();

    window.addEventListener("keydown", this.onKD);
    window.addEventListener("keyup", this.onKU);
    window.addEventListener("blur", this.onBlur);
  }

  isDown(key: string): boolean { return this.keys.has(key); }
  wasPressed(key: string): boolean { return this.justPressed.has(key); }
  clearFrame(): void { this.justPressed.clear(); }

  destroy(): void {
    window.removeEventListener("keydown", this.onKD);
    window.removeEventListener("keyup", this.onKU);
    window.removeEventListener("blur", this.onBlur);
    this.keys.clear();
    this.justPressed.clear();
  }
}

// ====================================================================
// AUDIO SYSTEM
// ====================================================================
class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ready = false;

  init(): void {
    if (this.ready) return;
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.25;
      this.master.connect(this.ctx.destination);
      this.ready = true;
    } catch { /* muet */ }
  }

  resume(): void {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  private tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.1, delay = 0): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.01);
  }

  private noise(dur: number, vol = 0.06): void {
    if (!this.ctx || !this.master) return;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = this.ctx.createBufferSource();
    s.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    s.connect(g); g.connect(this.master);
    s.start(); s.stop(this.ctx.currentTime + dur + 0.01);
  }

  shoot(): void { this.tone(880, 0.05, "square", 0.04); }
  powerShoot(): void { this.tone(1200, 0.06, "square", 0.06); this.tone(880, 0.04, "sawtooth", 0.03); }
  enemyHit(): void { this.tone(160, 0.08, "sawtooth", 0.06); }
  enemyDeath(): void { this.tone(55, 0.2, "sawtooth", 0.1); this.noise(0.12, 0.05); }
  playerHit(): void { this.tone(70, 0.25, "sawtooth", 0.14); this.noise(0.12, 0.09); this.tone(200, 0.06, "square", 0.05, 0.08); }
  bossHit(): void { this.tone(35, 0.25, "sawtooth", 0.15); }
  bossDeath(): void { this.tone(25, 0.6, "sawtooth", 0.18); this.noise(0.4, 0.12); this.tone(18, 0.3, "square", 0.1, 0.25); }
  waveStart(): void { this.tone(330, 0.08, "square", 0.05); this.tone(440, 0.08, "square", 0.05, 0.1); this.tone(660, 0.12, "square", 0.05, 0.2); }
  powerUp(): void { this.tone(660, 0.06, "square", 0.05); this.tone(880, 0.06, "square", 0.05, 0.08); this.tone(1320, 0.1, "square", 0.04, 0.14); }
  rageActivate(): void { this.tone(55, 0.3, "sawtooth", 0.15); this.noise(0.2, 0.1); this.tone(110, 0.15, "square", 0.08, 0.1); }
  glitch(): void { this.noise(0.04, 0.08); }

  destroy(): void {
    if (this.ctx) { this.ctx.close(); this.ctx = null; this.master = null; this.ready = false; }
  }
}

// ====================================================================
// HELPERS
// ====================================================================
function rnd(min: number, max: number): number { return Math.random() * (max - min) + min; }
function aabb(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function pick<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]!; }

// ====================================================================
// TASKKILL ENGINE v2.0
// ====================================================================
export class TaskkillEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cfg: EngineConfig;
  private W = 800;
  private H = 500;

  // Systèmes
  private input: InputManager;
  private audio: AudioSystem;

  // Pools
  private bullets: Pool<BulletData>;
  private enemyBullets: Pool<BulletData>;
  private particles: Pool<ParticleData>;
  private enemies: Pool<EnemyData>;
  private powerUps: Pool<PowerUpData>;

  // Joueur
  private player = {
    x: 80, y: 250, w: 34, h: 30,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    invTimer: 0,
    fireTimer: 0,
    powerLevel: 0,
    reverseShootTimer: 0,
  };

  // Boss
  private boss: BossData | null = null;

  // État
  private state: GameState = "title";
  private score = 0;
  private wave = 0;
  private waveEnemiesLeft = 0;
  private waveSpawnTimer = 0;
  private waveMessage = "";
  private waveMessageTimer = 0;

  // Scrolling
  private bgOffset = 0;

  // Effets
  private shakeAmt = 0;
  private shakeDur = 0;
  private hitstop = 0;
  private flashAlpha = 0;

  // Glitch
  private glitchX = 0;
  private glitchY = 0;
  private glitchTimer = 0;
  private glitchLines: { y: number; h: number; offset: number; alpha: number }[] = [];

  // Rage mode
  private rageTimer = 0;
  private rageKills: number[] = []; // timestamps

  // Notifications
  private notifQueue: { msg: string; timer: number }[] = [];

  // Banners on-screen
  private banners: BannerData[] = [];

  // Boucle
  private rafId = 0;
  private lastT = 0;
  private running = false;
  private titleBlink = 0;

  // Étoiles
  private stars: { x: number; y: number; r: number; speed: number }[] = [];

  constructor(canvas: HTMLCanvasElement, config: EngineConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;
    this.cfg = config;
    this.input = new InputManager();
    this.audio = new AudioSystem();
    this.resize();

    // Bullet pools
    const makeBullet = (): BulletData => ({ x: 0, y: 0, vx: 0, vy: 0, w: 14, h: 14, damage: 1, isPlayerBullet: true, spreadIndex: 0, alive: false });
    const resetBullet = (b: BulletData) => { b.x = 0; b.y = 0; b.vx = 0; b.vy = 0; b.w = 14; b.h = 14; b.damage = 1; b.isPlayerBullet = true; b.spreadIndex = 0; };
    this.bullets = new Pool(makeBullet, resetBullet, 180);
    this.enemyBullets = new Pool(makeBullet, resetBullet, 80);

    // Particle pool
    const makeParticle = (): ParticleData => ({
      x: 0, y: 0, vx: 0, vy: 0, life: 1, maxLife: 1,
      char: "·", color: "#fff", size: 14, rotation: 0, rotationSpeed: 0, alive: false,
    });
    const resetParticle = (p: ParticleData) => {
      p.x = 0; p.y = 0; p.vx = 0; p.vy = 0;
      p.life = 1; p.maxLife = 1; p.char = "·"; p.color = "#fff";
      p.size = 14; p.rotation = 0; p.rotationSpeed = 0;
    };
    this.particles = new Pool(makeParticle, resetParticle, 400);

    // Enemy pool
    const makeEnemy = (): EnemyData => ({
      x: 0, y: 0, w: 32, h: 32, vx: 0, vy: 0,
      hp: 1, maxHp: 1, enemyType: "plouf", score: 100,
      canShoot: false, fireTimer: 0, fireRate: 0,
      phase: 0, phaseTimer: 0, flashTimer: 0,
      emoji: "🐟", baseY: 0, alive: false,
    });
    const resetEnemy = (e: EnemyData) => {
      e.x = 0; e.y = 0; e.w = 32; e.h = 32; e.vx = 0; e.vy = 0;
      e.hp = 1; e.maxHp = 1; e.enemyType = "plouf"; e.score = 100;
      e.canShoot = false; e.fireTimer = 0; e.fireRate = 0;
      e.phase = 0; e.phaseTimer = 0; e.flashTimer = 0;
      e.emoji = "🐟"; e.baseY = 0;
    };
    this.enemies = new Pool(makeEnemy, resetEnemy, 40);

    // PowerUp pool
    const makePowerUp = (): PowerUpData => ({
      x: 0, y: 0, vx: POWERUP_SPEED, vy: 0, w: 24, h: 24, type: "powerup", timer: 8, pulsePhase: 0, alive: false,
    });
    const resetPowerUp = (p: PowerUpData) => {
      p.x = 0; p.y = 0; p.vx = POWERUP_SPEED; p.vy = 0; p.w = 24; p.h = 24; p.type = "powerup"; p.timer = 8; p.pulsePhase = 0;
    };
    this.powerUps = new Pool(makePowerUp, resetPowerUp, 20);

    // Stars
    for (let i = 0; i < 60; i++) {
      this.stars.push({ x: rnd(0, this.W), y: rnd(0, this.H), r: rnd(1, 3), speed: rnd(20, 70) });
    }
  }

  // ---- Redimensionnement (pixelated) ----
  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.W = rect.width;
    this.H = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.player.y > this.H) this.player.y = this.H / 2;
  }

  // ---- Boucle principale ----
  start(): void {
    if (this.running) return;
    if (this.W <= 0 || this.H <= 0) {
      this.resize();
      if (this.W <= 0 || this.H <= 0) {
        this.cfg.onNotify?.("💀 ERREUR: Canvas invalide.");
        return;
      }
    }
    this.running = true;
    this.audio.init();
    this.lastT = performance.now();
    this.state = "title";
    this.score = 0;
    this.wave = 0;
    this.bgOffset = 0;
    this.boss = null;
    this.resetPlayer();
    this.bullets.releaseAll();
    this.enemyBullets.releaseAll();
    this.enemies.releaseAll();
    this.particles.releaseAll();
    this.powerUps.releaseAll();
    this.banners = [];
    this.notifQueue = [];
    this.rageTimer = 0;
    this.rageKills = [];
    this.glitchX = 0; this.glitchY = 0; this.glitchTimer = 0; this.glitchLines = [];
    this.queueNotif("dragmenteur.exe v2 chargé. Ça va saigner. 🖕");
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop(): void { this.running = false; cancelAnimationFrame(this.rafId); }
  destroy(): void { this.stop(); this.input.destroy(); this.audio.destroy(); }

  // ---- Notifications ----
  private queueNotif(msg: string): void {
    this.notifQueue.push({ msg, timer: 3.5 });
    if (this.notifQueue.length > 8) this.notifQueue.shift();
    this.cfg.onNotify?.(msg);
  }

  private spawnBanner(text: string, x: number, y: number, color = "#fff", size = 18, vy = -60): void {
    this.banners.push({ text, x, y, life: 1.6, maxLife: 1.6, color, size, vy });
    if (this.banners.length > 12) this.banners.shift();
  }

  private maybeSnark(): void {
    if (Math.random() < 0.003 && this.notifQueue.length < 5) {
      this.queueNotif(pick(GUNTHOS_NOTIFS));
    }
  }

  // ---- Reset joueur ----
  private resetPlayer(): void {
    this.player.x = 80;
    this.player.y = this.H / 2;
    this.player.health = PLAYER_MAX_HEALTH;
    this.player.invTimer = 0;
    this.player.fireTimer = 0;
    this.player.powerLevel = 0;
    this.player.reverseShootTimer = 0;
  }

  // ---- Effets ----
  private addShake(intensity: number): void {
    this.shakeAmt = Math.max(this.shakeAmt, intensity);
    this.shakeDur = Math.max(this.shakeDur, 0.25);
    this.cfg.onShake?.(intensity);
  }

  private addHitstop(dur = HITSTOP_DURATION): void { this.hitstop = Math.max(this.hitstop, dur); }
  private addFlash(alpha = 0.15): void { this.flashAlpha = Math.max(this.flashAlpha, alpha); }

  private triggerGlitch(intensity = 1): void {
    this.glitchX = rnd(-10, 10) * intensity;
    this.glitchY = rnd(-3, 3) * intensity;
    this.glitchTimer = rnd(0.04, 0.12);
    // Create glitch scanlines
    this.glitchLines = [];
    const count = Math.floor(rnd(1, 4) * intensity);
    for (let i = 0; i < count; i++) {
      this.glitchLines.push({
        y: rnd(0, this.H),
        h: rnd(4, 16),
        offset: rnd(-30, 30) * intensity,
        alpha: rnd(0.4, 0.9),
      });
    }
    this.audio.glitch();
  }

  // ---- Particules ----
  private spawnParticles(x: number, y: number, count: number, chars: readonly string[], color: string, spread = 180, life = 0.7): void {
    for (let i = 0; i < count; i++) {
      const p = this.particles.acquire();
      p.x = x; p.y = y;
      const angle = rnd(0, Math.PI * 2);
      const speed = rnd(40, spread);
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.maxLife = rnd(life * 0.6, life);
      p.life = p.maxLife;
      p.char = pick(chars);
      p.color = color;
      p.size = rnd(12, 28);
      p.rotation = rnd(0, Math.PI * 2);
      p.rotationSpeed = rnd(-10, 10);
    }
  }

  private spawnEnemyBullet(x: number, y: number, vx: number, vy: number): void {
    const b = this.enemyBullets.acquire();
    b.x = x; b.y = y; b.vx = vx; b.vy = vy;
    b.w = 10; b.h = 6;
    b.damage = 1;
    b.isPlayerBullet = false;
    b.spreadIndex = 0;
  }

  // Tir ennemi générique (utilisé par notif, radio, solitaire, clippy)
  private enemyShoot(e: EnemyData, dt: number): void {
    if (!e.canShoot) return;
    e.fireTimer -= dt;
    if (e.fireTimer <= 0 && e.x < this.W && e.x > 0) {
      e.fireTimer = e.fireRate;
      const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      this.spawnEnemyBullet(e.x, e.y + e.h / 2, Math.cos(angle) * ENEMY_BULLET_SPEED, Math.sin(angle) * ENEMY_BULLET_SPEED);
    }
  }

  // ---- Power-ups ----
  private spawnPowerUp(x: number, y: number): void {
    const p = this.powerUps.acquire();
    p.x = x; p.y = y;
    p.vx = POWERUP_SPEED;
    p.vy = rnd(-20, 20);
    p.w = 24; p.h = 24;
    p.timer = 8;
    p.pulsePhase = rnd(0, Math.PI * 2);
  }

  // ---- Vague ----
  private startWave(): void {
    this.wave++;
    if (this.wave > WAVE_CONFIG.length) {
      this.state = "victory";
      this.queueNotif("Toutes les menaces éliminées. GunthOS est... stable ? Impossible. 🖕");
      return;
    }

    const cfg = WAVE_CONFIG[this.wave - 1]!;
    if (cfg.boss) {
      this.state = "waveIntro";
      this.waveMessage = "⚠️ BOSS FINAL — Windows Update.exe";
      this.waveMessageTimer = 2.0;
      this.queueNotif("⚠️ MISE À JOUR CRITIQUE : Windows Update force l'installation...");
      this.audio.waveStart();
      // Spawn boss after intro
      setTimeout(() => {
        if (this.running && this.state === "playing") this.spawnBoss();
      }, 2000);
      // Switch to playing after intro
      this.state = "playing";
      this.spawnBoss();
      return;
    }

    this.waveMessage = `VAGUE ${this.wave} — ${cfg.name}`;
    this.waveMessageTimer = 2.0;
    this.state = "waveIntro";
    this.audio.waveStart();

    let total = 0;
    for (const [, count] of Object.entries(cfg.types)) { total += count as number; }
    this.waveEnemiesLeft = total;
    this.waveSpawnTimer = 0.6;

    const queue: EnemyType[] = [];
    for (const [type, count] of Object.entries(cfg.types)) {
      for (let i = 0; i < (count as number); i++) queue.push(type as EnemyType);
    }
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j]!, queue[i]!];
    }
    (this as any)._spawnQueue = queue;

    // Auto transition to playing
    this.waveCooldownTimer = 2.0;
  }

  private waveCooldownTimer = 0;

  private spawnNextEnemy(): void {
    const queue = (this as any)._spawnQueue as EnemyType[] | undefined;
    if (!queue || queue.length === 0) return;
    const type = queue.pop()!;
    const def = ENEMY_DEFS[type];

    const e = this.enemies.acquire();
    e.enemyType = type; e.emoji = def.emoji; e.w = def.w; e.h = def.h;
    e.hp = def.hp + Math.floor(this.wave * 0.4);
    e.maxHp = e.hp; e.score = def.score;
    e.canShoot = def.canShoot; e.fireRate = def.fireRate;
    e.fireTimer = rnd(0.5, e.fireRate);
    e.x = this.W + rnd(10, 60);
    e.y = rnd(30, this.H - e.h - 30);
    e.baseY = e.y; e.vx = -def.speed * rnd(0.85, 1.15);
    e.vy = 0; e.phase = rnd(0, Math.PI * 2); e.phaseTimer = 0; e.flashTimer = 0;
    this.waveEnemiesLeft--;
  }

  // ---- Boss (HP réduit : 35 + wave*10 au lieu de 60 + wave*20) ----
  private spawnBoss(): void {
    if (this.boss?.alive) return;
    this.boss = {
      x: this.W + 20, y: this.H / 2 - 50,
      w: 140, h: 100,
      hp: 105 + this.wave * 30,
      maxHp: 105 + this.wave * 30,
      phase: 0, fireTimer: 0, fireRate: 0.7,
      moveTimer: 0, targetY: this.H / 2 - 50,
      alive: true, entered: false,
      driftVx: 0, deathTimer: 0,
    };
    this.spawnBanner("⚠️ BOSS ⚠️", this.W / 2, this.H * 0.3, "#f44", 28, 0);
  }

  // ================================================================
  // UPDATE
  // ================================================================
  private loop = (ts: number): void => {
    if (!this.running) return;
    try {
      const rawDt = (ts - this.lastT) / 1000;
      this.lastT = ts;
      const dt = Math.min(rawDt, 0.05);

      if (this.hitstop > 0) {
        this.hitstop -= rawDt;
        this.render();
        this.rafId = requestAnimationFrame(this.loop);
        return;
      }

      this.update(dt);
      this.render();
      this.input.clearFrame();
    } catch (e) {
      console.error("[TASKKILL] Game loop crashed:", e);
      this.running = false;
      this.cfg.onNotify?.("💀 BSOD : La boucle de jeu a planté. kernel panic. 🖕");
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    // Shake decay
    if (this.shakeDur > 0) { this.shakeDur -= dt; if (this.shakeDur <= 0) this.shakeAmt = 0; else this.shakeAmt *= 0.85; }
    // Flash decay
    if (this.flashAlpha > 0) this.flashAlpha = Math.max(0, this.flashAlpha - dt * 3);
    // Glitch decay
    if (this.glitchTimer > 0) { this.glitchTimer -= dt; if (this.glitchTimer <= 0) { this.glitchX = 0; this.glitchY = 0; this.glitchLines = []; } }
    // Wave message timer
    if (this.waveMessageTimer > 0) this.waveMessageTimer -= dt;
    // Wave cooldown
    if (this.waveCooldownTimer > 0) { this.waveCooldownTimer -= dt; if (this.waveCooldownTimer <= 0 && this.state === "waveIntro") this.state = "playing"; }
    // Rage timer
    if (this.rageTimer > 0) this.rageTimer -= dt;
    // Clean old rage kills
    const now = performance.now() / 1000;
    this.rageKills = this.rageKills.filter(t => now - t < RAGE_KILL_WINDOW);

    // Notifications
    for (let i = this.notifQueue.length - 1; i >= 0; i--) {
      this.notifQueue[i]!.timer -= dt;
      if (this.notifQueue[i]!.timer <= 0) this.notifQueue.splice(i, 1);
    }
    // Banners
    for (let i = this.banners.length - 1; i >= 0; i--) {
      const b = this.banners[i]!;
      b.life -= dt / b.maxLife;
      b.y += b.vy * dt;
      if (b.life <= 0) this.banners.splice(i, 1);
    }

    switch (this.state) {
      case "title": this.updateTitle(dt); break;
      case "waveIntro": this.updateWaveIntro(dt); break;
      case "playing": this.updatePlaying(dt); break;
      case "gameover":
      case "victory": this.updateEnd(dt); break;
    }
  }

  private updateTitle(dt: number): void {
    this.titleBlink += dt;
    this.bgOffset += 40 * dt;
    this.updateParticles(dt);
    this.maybeSnark();

    if (this.input.wasPressed(" ")) {
      this.audio.resume();
      this.audio.init();
      this.state = "playing";
      this.score = 0;
      this.wave = 0;
      this.boss = null;
      this.bullets.releaseAll();
      this.enemyBullets.releaseAll();
      this.enemies.releaseAll();
      this.powerUps.releaseAll();
      this.banners = [];
      this.resetPlayer();
      this.startWave();
      this.queueNotif("Formatage du disque dur en cours... Vous avez été prévenu. 🖕");
    }
  }

  private updateWaveIntro(dt: number): void {
    this.bgOffset += 40 * dt;
    this.updateParticles(dt);
    // transition handled by waveCooldownTimer
  }

  private updatePlaying(dt: number): void {
    this.bgOffset += 60 * dt;
    this.updatePlayer(dt);
    this.updateBullets(dt);
    this.updateEnemyBullets(dt);
    this.updateEnemies(dt);
    this.updateBoss(dt);
    this.updateParticles(dt);
    this.updatePowerUps(dt);
    this.checkCollisions();
    this.updateSpawning(dt);
    this.maybeSnark();

    // Random super snark during boss fights
    if (this.boss?.alive && Math.random() < 0.006) {
      this.queueNotif(pick(GUNTHOS_NOTIFS));
    }

    // Random glitch
    if (Math.random() < 0.004) {
      this.triggerGlitch(0.7);
    }


    // Stars
    for (const s of this.stars) {
      s.x -= s.speed * dt;
      if (s.x < -5) { s.x = this.W + 5; s.y = rnd(0, this.H); }
    }
  }

  private updateEnd(dt: number): void {
    this.updateParticles(dt);
    this.titleBlink += dt;
    if (this.input.wasPressed(" ")) {
      this.state = "title";
      this.score = 0;
      this.wave = 0;
      this.boss = null;
      this.bullets.releaseAll();
      this.enemyBullets.releaseAll();
      this.enemies.releaseAll();
      this.powerUps.releaseAll();
      this.banners = [];
      this.resetPlayer();
      this.queueNotif("Redémarrage du système... Courage, fuyons. 🖕");
    }
  }

  private updatePlayer(dt: number): void {
    let dx = 0, dy = 0;
    if (this.input.isDown("ArrowLeft") || this.input.isDown("q") || this.input.isDown("Q")) dx = -1;
    if (this.input.isDown("ArrowRight") || this.input.isDown("d") || this.input.isDown("D")) dx = 1;
    if (this.input.isDown("ArrowUp") || this.input.isDown("z") || this.input.isDown("Z") || this.input.isDown("w") || this.input.isDown("W")) dy = -1;
    if (this.input.isDown("ArrowDown") || this.input.isDown("s") || this.input.isDown("S")) dy = 1;

    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    this.player.x += dx * PLAYER_SPEED * dt;
    this.player.y += dy * PLAYER_SPEED * dt;
    this.player.x = Math.max(5, Math.min(this.W - this.player.w - 5, this.player.x));
    this.player.y = Math.max(5, Math.min(this.H - this.player.h - 5, this.player.y));

    if (this.player.invTimer > 0) this.player.invTimer -= dt;
    if (this.player.reverseShootTimer > 0) this.player.reverseShootTimer -= dt;

    // Fire rate — rage mode doubles it
    const effectiveFireRate = this.rageTimer > 0 ? PLAYER_FIRE_RATE * 0.45 : PLAYER_FIRE_RATE;
    this.player.fireTimer -= dt;
    if ((this.input.isDown(" ") || this.input.isDown("Control")) && this.player.fireTimer <= 0) {
      this.firePlayerBullet();
      this.player.fireTimer = effectiveFireRate;
    }
    if (this.input.wasPressed(" ") && this.player.fireTimer > effectiveFireRate * 0.5) {
      this.player.fireTimer = 0;
    }
  }

  private firePlayerBullet(): void {
    const pw = this.player.powerLevel;
    const damage = pw >= 3 ? 2 : 1;
    const bulletCount = Math.min(pw + 1, 5);
    const isRage = this.rageTimer > 0;
    const reversed = this.player.reverseShootTimer > 0;
    const dir = reversed ? -1 : 1;
    const spawnX = reversed ? this.player.x : this.player.x + this.player.w;

    for (let i = 0; i < bulletCount; i++) {
      const b = this.bullets.acquire();
      b.x = spawnX;
      b.y = this.player.y + this.player.h / 2 - 7;
      b.vx = BULLET_SPEED * dir;
      b.vy = (i - (bulletCount - 1) / 2) * 45;
      b.w = 16; b.h = 16;
      b.damage = damage;
      b.isPlayerBullet = true;
      b.spreadIndex = i;
    }

    if (isRage || pw >= 2) {
      this.audio.powerShoot();
    } else {
      this.audio.shoot();
    }
  }

  private updateBullets(dt: number): void {
    for (let i = this.bullets.active.length - 1; i >= 0; i--) {
      const b = this.bullets.active[i]!;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x > this.W + 30 || b.x < -30 || b.y > this.H + 30 || b.y < -30) {
        this.bullets.release(b);
      }
    }
  }

  private updateEnemyBullets(dt: number): void {
    for (let i = this.enemyBullets.active.length - 1; i >= 0; i--) {
      const b = this.enemyBullets.active[i]!;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < -20 || b.x > this.W + 20 || b.y < -20 || b.y > this.H + 20) {
        this.enemyBullets.release(b);
      }
    }
  }

  private updateEnemies(dt: number): void {
    for (let i = this.enemies.active.length - 1; i >= 0; i--) {
      const e = this.enemies.active[i]!;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.phaseTimer += dt;
      if (e.flashTimer > 0) e.flashTimer -= dt;

      switch (e.enemyType) {
        case "plouf": e.y = e.baseY + Math.sin(e.phaseTimer * 3) * 35; break;
        case "notif":
          if (e.phaseTimer > 0.5) { e.phaseTimer = 0; e.vy = rnd(-100, 100); }
          this.enemyShoot(e, dt);
          break;
        case "popup": break;
        case "radio": {
          const dy = this.player.y - e.y;
          e.vy = Math.sign(dy) * Math.min(Math.abs(dy) * 1.2, 80);
          this.enemyShoot(e, dt);
          break;
        }
        case "defrag":
          // Avance par à-coups
          e.vx = -75 + Math.sin(e.phaseTimer * 4) * 30;
          break;
        case "clippy": {
          const dy = this.player.y - e.y;
          e.vy = Math.sign(dy) * Math.min(Math.abs(dy) * 1.5, 100);
          this.enemyShoot(e, dt);
          break;
        }
        case "trash": e.y = e.baseY + Math.sin(e.phaseTimer * 1.5) * 15; break;
        case "bsod": break;
      }

      if (e.x < -e.w - 20) this.enemies.release(e);
    }
  }

  private updateBoss(dt: number): void {
    const b = this.boss;
    if (!b || !b.alive) return;

    if (b.hp <= 0) {
      b.x += b.driftVx * dt;
      b.deathTimer -= dt;
      if (b.deathTimer <= 0 || b.x < -b.w - 50) { b.alive = false; this.boss = null; }
      return;
    }
    if (!b.entered) {
      b.x -= 80 * dt;
      if (b.x <= this.W - b.w - 30) { b.x = this.W - b.w - 30; b.entered = true; }
      return;
    }

    b.moveTimer -= dt;
    if (b.moveTimer <= 0) { b.moveTimer = rnd(1.2, 2.5); b.targetY = rnd(20, this.H - b.h - 20); }
    b.y += (b.targetY - b.y) * 2 * dt;

    const hpRatio = b.hp / b.maxHp;
    if (hpRatio > 0.5) b.phase = 0;
    else if (hpRatio > 0.25) b.phase = 1;
    else b.phase = 2;

    b.fireRate = b.phase === 0 ? 0.7 : b.phase === 1 ? 0.45 : 0.25;

    b.fireTimer -= dt;
    if (b.fireTimer <= 0) {
      b.fireTimer = b.fireRate;
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;

      if (b.phase === 0) {
        for (let a = -0.3; a <= 0.3; a += 0.3) {
          this.spawnEnemyBullet(cx, cy + 30, Math.cos(Math.PI + a) * ENEMY_BULLET_SPEED * 0.8, Math.sin(Math.PI + a) * ENEMY_BULLET_SPEED * 0.8);
        }
      } else if (b.phase === 1) {
        const angle = Math.atan2(this.player.y - cy, this.player.x - cx);
        this.spawnEnemyBullet(cx, cy + 30, Math.cos(angle) * ENEMY_BULLET_SPEED * 1.1, Math.sin(angle) * ENEMY_BULLET_SPEED * 1.1);
        for (let a = -0.4; a <= 0.4; a += 0.4) {
          this.spawnEnemyBullet(cx, cy + 30, Math.cos(Math.PI + a) * ENEMY_BULLET_SPEED * 0.7, Math.sin(Math.PI + a) * ENEMY_BULLET_SPEED * 0.7);
        }
      } else {
        for (let a = -0.8; a <= 0.8; a += 0.25) {
          this.spawnEnemyBullet(cx, cy + 30, Math.cos(Math.PI + a) * ENEMY_BULLET_SPEED * 1.2, Math.sin(Math.PI + a) * ENEMY_BULLET_SPEED * 1.2);
        }
        if (Math.random() < 0.3) {
          const def = ENEMY_DEFS.clippy;
          const e = this.enemies.acquire();
          e.enemyType = "clippy"; e.emoji = def.emoji; e.w = def.w; e.h = def.h;
          e.hp = 1; e.maxHp = 1; e.score = 100; e.canShoot = true;
          e.fireRate = 2.5; e.fireTimer = rnd(0.5, 1.5);
          e.x = b.x + rnd(-20, 20); e.y = b.y + rnd(-20, b.h + 20);
          e.baseY = e.y; e.vx = -rnd(40, 80); e.vy = 0;
          e.phase = 0; e.phaseTimer = 0; e.flashTimer = 0;
        }
      }
    }
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.active.length - 1; i >= 0; i--) {
      const p = this.particles.active[i]!;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += PARTICLE_GRAVITY * dt;
      p.life -= dt / p.maxLife;
      p.rotation += p.rotationSpeed * dt;
      if (p.life <= 0) this.particles.release(p);
    }
  }

  private updatePowerUps(dt: number): void {
    for (let i = this.powerUps.active.length - 1; i >= 0; i--) {
      const p = this.powerUps.active[i]!;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.timer -= dt;
      p.pulsePhase += dt * 5;
      if (p.timer <= 0 || p.x < -p.w - 20) {
        this.powerUps.release(p);
      }
    }
  }

  private updateSpawning(dt: number): void {
    const queue = (this as any)._spawnQueue as EnemyType[] | undefined;
    if (!queue || queue.length === 0 && this.enemies.active.length === 0 && this.waveEnemiesLeft === 0) {
      if (!this.boss || !this.boss.alive) {
        this.startWave();
      }
      return;
    }

    if (queue && queue.length > 0) {
      this.waveSpawnTimer -= dt;
      if (this.waveSpawnTimer <= 0) {
        this.spawnNextEnemy();
        this.waveSpawnTimer = rnd(0.3, 0.9);
      }
    }
  }

  private checkCollisions(): void {
    const plr = { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h };

    // Balles joueur → ennemis
    for (let bi = this.bullets.active.length - 1; bi >= 0; bi--) {
      const bullet = this.bullets.active[bi]!;
      if (!bullet.isPlayerBullet) continue;

      for (let ei = this.enemies.active.length - 1; ei >= 0; ei--) {
        const enemy = this.enemies.active[ei]!;
        if (aabb(bullet, enemy)) {
          enemy.hp -= bullet.damage;
          enemy.flashTimer = 0.08;
          this.bullets.release(bullet);
          this.spawnParticles(bullet.x, bullet.y, 4, SPARK_CHARS, "#ff0", 70, 0.3);
          this.audio.enemyHit();
          this.addShake(2);
          this.addHitstop();

          // Clippy touché → tir inversé 5s (demi-boss)
          if (enemy.enemyType === "clippy" && enemy.hp > 0) {
            this.player.reverseShootTimer = 5.0;
            this.spawnBanner("⬅ TIR INVERTI 5s ! PASSE DERRIÈRE !", this.player.x + this.player.w / 2, this.player.y - 15, "#f0f", 15, -50);
            this.queueNotif("📎 CLIPPY TOUCHÉ ! Tir inversé 5s — passe derrière lui !");
          }

          if (enemy.hp <= 0) {
            this.onEnemyKilled(enemy);
            this.enemies.release(enemy);
          }
          break;
        }
      }
    }

    // Balles joueur → boss
    if (this.boss && this.boss.alive && this.boss.entered) {
      for (let bi = this.bullets.active.length - 1; bi >= 0; bi--) {
        const bullet = this.bullets.active[bi]!;
        if (!bullet.isPlayerBullet) continue;
        if (aabb(bullet, this.boss)) {
          this.boss.hp -= bullet.damage;
          this.bullets.release(bullet);
          this.spawnParticles(bullet.x, bullet.y, 5, SPARK_CHARS, "#ff0", 90, 0.3);
          this.audio.bossHit();
          this.addShake(3);
          this.addHitstop();
          this.triggerGlitch(0.5);

          if (this.boss.hp <= 0) {
            this.score += 5000;
            // Particules réduites pour éviter le lag tout en gardant l'effet
            this.spawnParticles(this.boss.x + this.boss.w / 2, this.boss.y + this.boss.h / 2, 20, BOSS_CHARS, "#f0f", 250, 0.8);
            this.spawnParticles(this.boss.x + this.boss.w / 2, this.boss.y + this.boss.h / 2, 15, DEATH_CHARS, "#0ff", 200, 0.7);
            this.addShake(10);
            this.addFlash(0.3);
            this.addHitstop(0.05);
            this.triggerGlitch(1.2);
            this.audio.bossDeath();
            this.queueNotif("MISE À JOUR ANNULÉE. Windows Update a été purgé. 🖕");
            this.spawnBanner("💀 WINDOWS UPDATE DÉSINSTALLÉ 💀", this.W / 2, this.H / 2, "#f0f", 22, 0);
            this.boss.driftVx = -350;
            this.boss.deathTimer = 3;
          }
        }
      }
    }

    // Balles ennemies → joueur
    if (this.player.invTimer <= 0) {
      for (let bi = this.enemyBullets.active.length - 1; bi >= 0; bi--) {
        const bullet = this.enemyBullets.active[bi]!;
        if (aabb(bullet, plr)) { this.enemyBullets.release(bullet); this.damagePlayer(); }
      }
      for (let ei = this.enemies.active.length - 1; ei >= 0; ei--) {
        const enemy = this.enemies.active[ei]!;
        if (aabb(plr, enemy)) {
          this.spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 8, DEATH_CHARS, "#f84", 120, 0.5);
          this.enemies.release(enemy);
          this.damagePlayer();
        }
      }
      if (this.boss && this.boss.alive && this.boss.entered && aabb(plr, this.boss)) {
        this.damagePlayer();
      }
    }

    // Joueur → power-ups
    for (let pi = this.powerUps.active.length - 1; pi >= 0; pi--) {
      const pu = this.powerUps.active[pi]!;
      if (aabb(plr, pu)) {
        this.collectPowerUp(pu);
        this.powerUps.release(pu);
      }
    }
  }

  private onEnemyKilled(enemy: EnemyData): void {
    this.score += enemy.score;
    const cx = enemy.x + enemy.w / 2;
    const cy = enemy.y + enemy.h / 2;
    this.spawnParticles(cx, cy, 16, DEATH_CHARS, "#f44", 220, 0.9);
    this.addShake(5);
    this.addFlash(0.12);
    this.audio.enemyDeath();
    this.triggerGlitch(0.6);

    // Banner spécifique au type d'ennemi (50% des kills)
    if (Math.random() < 0.5) {
      const banners = ENEMY_BANNERS[enemy.enemyType];
      if (banners) {
        this.spawnBanner(pick(banners), cx, cy, pick(["#f44", "#ff0", "#0ff", "#f0f"]), rnd(14, 22), rnd(-80, -30));
      }
    }

    // Power-up drop
    if (Math.random() < POWERUP_DROP_RATE) {
      this.spawnPowerUp(cx, cy);
    }

    // Rage tracking
    this.rageKills.push(performance.now() / 1000);
    if (this.rageKills.length >= RAGE_KILL_THRESHOLD && this.rageTimer <= 0) {
      this.activateRage();
    }
  }

  private activateRage(): void {
    this.rageTimer = RAGE_DURATION;
    this.audio.rageActivate();
    this.addFlash(0.3);
    this.addShake(8);
    this.triggerGlitch(2);
    this.queueNotif("😈 RAGE MODE ACTIVÉ — VA TE FAIRE VOIR !!! 🖕🖕🖕");
    this.rageKills = [];
    // Screen flash color
    this.addFlash(0.4);
    // Shake everything
    this.addShake(8);
  }

  private collectPowerUp(pu: PowerUpData): void {
    if (this.player.powerLevel < MAX_POWER_LEVEL) {
      this.player.powerLevel++;
      this.audio.powerUp();
      this.spawnParticles(pu.x, pu.y, 12, ["⬆", "🔥", "⚡", "💪"], "#ff0", 120, 0.6);
      this.queueNotif(`💾 POWER UP ! Niveau ${this.player.powerLevel + 1} — ${this.player.powerLevel >= 3 ? "DÉGÉNTÉ !" : "Ça commence..."}`);
    } else {
      // Already max power — bonus points
      this.score += 500;
      this.spawnParticles(pu.x, pu.y, 8, ["💰", "💎"], "#ff0", 100, 0.5);
    }
  }

  private damagePlayer(): void {
    if (this.player.invTimer > 0) return;
    this.player.health--;
    this.player.invTimer = PLAYER_INVINCIBLE_TIME;
    // Lose a power level on hit
    if (this.player.powerLevel > 0) {
      this.player.powerLevel--;
      this.spawnBanner("POWER DOWN !", this.player.x, this.player.y - 10, "#f44", 14, -40);
    }
    this.spawnParticles(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 15, SPARK_CHARS, "#f00", 180, 0.6);
    this.addShake(8);
    this.addFlash(0.25);
    this.addHitstop(0.06);
    this.triggerGlitch(1.5);
    this.audio.playerHit();
    this.queueNotif(pick(["Aïe.","Secteur endommagé.","Segment corrompu.","Buffer overflow.","🖕 Windows vous a touché."]));

    if (this.player.health <= 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.state = "gameover";
    this.spawnParticles(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 50, DEATH_CHARS, "#f00", 300, 1.2);
    this.addShake(10);
    this.addFlash(0.5);
    this.addHitstop(0.12);
    this.triggerGlitch(3);
    this.bullets.releaseAll();
    this.enemyBullets.releaseAll();
    this.enemies.releaseAll();
    this.powerUps.releaseAll();
    this.banners = [];
    this.boss = null;
    this.rageTimer = 0;
    this.queueNotif("CRASH SYSTEMATIQUE. Votre score a été sauvegardé... ou pas. 🖕");
    this.spawnBanner("💀 CRASH SYSTEMATIQUE 💀", this.W / 2, this.H / 2, "#f00", 24, 0);
    this.cfg.onGameOver?.(this.score, this.wave);
  }

  // ================================================================
  // RENDER
  // ================================================================
  private render(): void {
    const ctx = this.ctx;
    ctx.save();

    // Screen shake
    if (this.shakeAmt > 0.1) {
      const sx = (Math.random() - 0.5) * this.shakeAmt * 2.5;
      const sy = (Math.random() - 0.5) * this.shakeAmt * 2.5;
      ctx.translate(sx, sy);
    }

    // Glitch translation
    if (this.glitchTimer > 0) {
      ctx.translate(this.glitchX, this.glitchY);
    }

    if (this.state === "title") {
      this.renderBackground(ctx);
      this.renderParticles(ctx);
      this.renderTitle(ctx);
    } else if (this.state === "waveIntro") {
      this.renderBackground(ctx);
      this.renderParticles(ctx);
      this.renderWaveIntro(ctx);
    } else if (this.state === "playing") {
      this.renderBackground(ctx);
      this.renderParticles(ctx);
      this.renderPowerUps(ctx);
      this.renderEnemies(ctx);
      this.renderBullets(ctx);
      this.renderEnemyBullets(ctx);
      this.renderBoss(ctx);
      this.renderPlayer(ctx);
      this.renderHUD(ctx);
      this.renderBanners(ctx);
      this.renderGlitchLines(ctx);
    } else if (this.state === "gameover") {
      this.renderBackground(ctx);
      this.renderParticles(ctx);
      this.renderBanners(ctx);
      this.renderEndScreen(ctx, "💀 CRASH SYSTEMATIQUE 💀", "#f44");
    } else if (this.state === "victory") {
      this.renderBackground(ctx);
      this.renderParticles(ctx);
      this.renderBanners(ctx);
      this.renderEndScreen(ctx, "🏆 SYSTÈME NETTOYÉ 🏆", "#4f4");
    }

    // Flash overlay
    if (this.flashAlpha > 0.01) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, this.W, this.H);
    }

    // Rage mode overlay (red vignette pulsing)
    if (this.rageTimer > 0) {
      const rageAlpha = 0.08 + Math.sin(performance.now() / 60) * 0.05;
      ctx.fillStyle = `rgba(255, 0, 0, ${rageAlpha})`;
      ctx.fillRect(0, 0, this.W, this.H);
      // Border flash
      ctx.strokeStyle = `rgba(255, 100, 0, ${0.4 + Math.sin(performance.now() / 40) * 0.3})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, this.W - 4, this.H - 4);
    }

    ctx.restore();
  }

  private getThemeWave(): number {
    return (this.state === "playing" || this.state === "waveIntro" || this.state === "gameover" || this.state === "victory") ? this.wave : 0;
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    const wave = this.getThemeWave();
    const now = performance.now() / 1000;

    // Couleurs par thème
    const themes: Record<number, { bg: string; grid: string; starR: number; starG: number; starB: number }> = {
      0: { bg: "#0a0a14", grid: "rgba(255,255,255,0.03)", starR: 255, starG: 255, starB: 255 },
      1: { bg: "#061020", grid: "rgba(60,140,255,0.05)", starR: 80,  starG: 180, starB: 255 },
      2: { bg: "#081008", grid: "rgba(80,255,80,0.04)",   starR: 100, starG: 255, starB: 100 },
      3: { bg: "#0d0d20", grid: "rgba(180,180,255,0.05)", starR: 160, starG: 180, starB: 255 },
      4: { bg: "#100818", grid: "rgba(200,80,255,0.05)",  starR: 180, starG: 100, starB: 255 },
      5: { bg: "#100505", grid: "rgba(255,60,60,0.04)",   starR: 255, starG: 80,  starB: 80  },
      6: { bg: "#000820", grid: "rgba(60,120,255,0.06)",  starR: 60,  starG: 140, starB: 255 },
    };
    const t = themes[wave] ?? themes[0]!;

    // Fond
    ctx.fillStyle = t.bg;
    ctx.fillRect(-10, -10, this.W + 20, this.H + 20);

    // Grille
    ctx.strokeStyle = t.grid;
    ctx.lineWidth = 1;
    const gs = 40;
    const ox = -(this.bgOffset % gs);
    for (let x = ox; x < this.W + gs; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.H); ctx.stroke();
    }
    for (let y = 0; y < this.H; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.W, y); ctx.stroke();
    }

    // Étoiles thématiques
    for (const s of this.stars) {
      const alpha = 0.15 + s.r * 0.2;
      ctx.fillStyle = `rgba(${t.starR},${t.starG},${t.starB},${alpha})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }

    // Décorations spécifiques au thème
    if (wave === 1) this.renderBgPlouf(ctx, now);
    else if (wave === 2) this.renderBgMessenger(ctx, now);
    else if (wave === 3) this.renderBgMatrix(ctx, now);
    else if (wave === 4) this.renderBgRadio(ctx, now);
    else if (wave === 5) this.renderBgCorbeille(ctx, now);
    else if (wave === 6) this.renderBgUpdate(ctx, now);
  }

  // --- Décorations par niveau ---

  private renderBgPlouf(ctx: CanvasRenderingContext2D, now: number): void {
    // Vagues sinusoïdales en fond
    ctx.strokeStyle = "rgba(60,160,255,0.12)";
    ctx.lineWidth = 2;
    for (let wave = 0; wave < 3; wave++) {
      const baseY = this.H * (0.7 + wave * 0.1);
      ctx.beginPath();
      for (let x = 0; x <= this.W; x += 6) {
        const y = baseY + Math.sin((x + this.bgOffset * 1.5) * 0.018 + wave * 1.8) * 25;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Bulles qui montent
    ctx.fillStyle = "rgba(100,200,255,0.1)";
    for (let i = 0; i < 8; i++) {
      const bx = ((i * 110 + 30) + now * 15) % (this.W + 60) - 30;
      const by = this.H - ((now * 25 + i * 70) % (this.H + 40));
      ctx.beginPath();
      ctx.arc(bx, by, 3 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderBgMessenger(ctx: CanvasRenderingContext2D, now: number): void {
    // Bulles de chat flottantes
    ctx.strokeStyle = "rgba(100,255,100,0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const bx = ((i * 140 + 40) + now * 20) % (this.W + 100) - 50;
      const by = 40 + i * 70 + Math.sin(now * 1.3 + i) * 25;
      ctx.strokeRect(bx, by, 50, 22);
      // Petite queue de bulle
      ctx.beginPath();
      ctx.moveTo(bx + 8, by + 22);
      ctx.lineTo(bx + 2, by + 30);
      ctx.lineTo(bx + 18, by + 22);
      ctx.stroke();
    }
    // Petites cloches
    ctx.fillStyle = "rgba(150,255,150,0.08)";
    ctx.font = "14px serif";
    for (let i = 0; i < 5; i++) {
      const bx = ((i * 180 + 80) + now * 35) % (this.W + 40) - 20;
      const by = 20 + i * 90 + Math.cos(now * 2 + i) * 30;
      ctx.fillText("🔔", bx, by);
    }
  }

  private renderBgMatrix(ctx: CanvasRenderingContext2D, now: number): void {
    // Matrix digital rain
    const chars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃ0123456789ABCDEF";
    const colW = 16;
    const cols = Math.floor(this.W / colW);
    ctx.font = "11px monospace";
    for (let col = 0; col < cols; col++) {
      const x = col * colW;
      const speed = 35 + (col % 7) * 12;
      const headY = ((now * speed + col * 97) % (this.H + 140)) - 70;
      // Traînée
      for (let t = 0; t < 10; t++) {
        const ty = headY - t * 16;
        if (ty < 0 || ty > this.H) continue;
        const alpha = 0.12 - t * 0.011;
        if (alpha <= 0) continue;
        ctx.fillStyle = `rgba(80,255,80,${alpha})`;
        const ci = Math.floor((col * 17 + t * 3 + now * 10) % chars.length);
        ctx.fillText(chars[ci] ?? "0", x, ty);
      }
      // Tête brillante
      if (headY > 0 && headY < this.H) {
        ctx.fillStyle = "rgba(180,255,180,0.45)";
        const ci = Math.floor((col * 17 + now * 10) % chars.length);
        ctx.fillText(chars[ci] ?? "0", x, headY);
      }
    }
  }

  private renderBgRadio(ctx: CanvasRenderingContext2D, now: number): void {
    // Cercles concentriques (ondes radio) depuis la droite
    ctx.strokeStyle = "rgba(180,100,255,0.08)";
    ctx.lineWidth = 1;
    const cx = this.W - 60;
    const cy = this.H / 2;
    for (let r = 30; r < Math.max(this.W, this.H); r += 45) {
      const pulse = r + Math.sin(now * 3 + r * 0.01) * 10;
      ctx.beginPath();
      ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Blocs défragmentés flottants
    const blocks = ["▓", "▒", "░", "▣", "▧"];
    ctx.font = "14px monospace";
    for (let i = 0; i < 8; i++) {
      const sx = ((i * 120 + 50) + now * 25) % (this.W + 40) - 20;
      const sy = 30 + i * 55 + Math.sin(now * 1.5 + i) * 30;
      ctx.fillStyle = `rgba(${i % 2 === 0 ? "200,180,255" : "255,200,100"},0.1)`;
      ctx.fillText(pick(blocks), sx, sy);
    }
  }

  private renderBgCorbeille(ctx: CanvasRenderingContext2D, now: number): void {
    // Grille corrompue (offset aléatoire sur certaines lignes)
    ctx.strokeStyle = "rgba(255,60,60,0.06)";
    ctx.lineWidth = 1;
    for (let y = 20; y < this.H; y += 35) {
      const glitchOff = Math.sin(y * 0.3 + now * 5) > 0.6 ? rnd(-15, 15) : 0;
      ctx.beginPath();
      ctx.moveTo(glitchOff, y);
      ctx.lineTo(this.W + glitchOff, y);
      ctx.stroke();
    }
    // Blocs "corrompus" aléatoires
    ctx.fillStyle = "rgba(255,30,30,0.04)";
    for (let i = 0; i < 6; i++) {
      const gx = ((i * 150 + 70 + Math.sin(now * 3 + i) * 60) % (this.W + 40)) - 20;
      const gy = ((i * 110 + 40 + Math.cos(now * 2.7 + i) * 50) % (this.H + 40)) - 20;
      ctx.fillRect(gx, gy, rnd(20, 60), rnd(8, 20));
    }
    // Petits crânes flottants
    ctx.font = "12px serif";
    for (let i = 0; i < 4; i++) {
      const sx = ((i * 160 + 90) + now * 15) % (this.W + 30) - 15;
      const sy = 25 + i * 100 + Math.sin(now * 1.8 + i) * 25;
      ctx.fillStyle = "rgba(255,100,100,0.1)";
      ctx.fillText("💀", sx, sy);
    }
  }

  private renderBgUpdate(ctx: CanvasRenderingContext2D, now: number): void {
    // Scanline horizontale qui descend
    const scanY = (now * 40) % (this.H + 60) - 30;
    ctx.fillStyle = "rgba(60,140,255,0.06)";
    ctx.fillRect(0, scanY, this.W, 3);

    // Points de progression style "défilement"
    ctx.fillStyle = "rgba(80,160,255,0.12)";
    for (let i = 0; i < 10; i++) {
      const dx = ((i * 90 + 20) + now * 40) % (this.W + 60) - 30;
      const dy = 30 + i * 45;
      ctx.fillRect(dx, dy, 5, 5);
    }
    // Barre de progression fantôme en bas
    ctx.strokeStyle = "rgba(60,140,255,0.1)";
    ctx.lineWidth = 2;
    const pbx = 40, pby = this.H - 20, pbw = this.W - 80, pbh = 8;
    ctx.strokeRect(pbx, pby, pbw, pbh);
    const progress = (now * 15) % 100 / 100;
    ctx.fillStyle = "rgba(60,140,255,0.08)";
    ctx.fillRect(pbx + 2, pby + 2, (pbw - 4) * progress, pbh - 4);
  }

  private renderPlayer(ctx: CanvasRenderingContext2D): void {
    if (this.player.invTimer > 0 && Math.floor(this.player.invTimer * 20) % 2 === 0) return;

    const { x, y, w, h } = this.player;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    // Ombre
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w, h);

    // Corps du curseur
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;

    // Flèche du curseur (pointant à droite)
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(w / 2 - 4, 0);
    ctx.lineTo(-w / 2, h / 2);
    ctx.lineTo(-w / 2 + 8, 2);
    ctx.lineTo(-w / 2 + 8, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glitch lines sur le curseur
    ctx.strokeStyle = "#0ff";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 4, -h / 4);
    ctx.lineTo(w / 2 - 10, -h / 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 4, h / 4);
    ctx.lineTo(w / 2 - 10, h / 4);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Trainée moteur
    ctx.fillStyle = "#0ff";
    ctx.globalAlpha = 0.4 + Math.random() * 0.3;
    ctx.fillRect(-w / 2 - 4, -4, 6, 8);
    ctx.globalAlpha = 1;

    // Rage mode glow
    if (this.rageTimer > 0) {
      ctx.strokeStyle = `rgba(255, 100, 0, ${0.3 + Math.sin(Date.now() / 40) * 0.2})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
    }

    // Reverse shoot indicator — flèche rouge à gauche
    if (this.player.reverseShootTimer > 0) {
      const blink = Math.sin(Date.now() / 15) > 0;
      if (blink) {
        ctx.fillStyle = "#f0f";
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        ctx.fillText("⬅", -w / 2 - 18, 0);
      }
    }

    ctx.restore();
  }

  private renderEnemies(ctx: CanvasRenderingContext2D): void {
    for (const e of this.enemies.active) {
      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h / 2);

      if (e.flashTimer > 0) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(-e.w / 2 - 2, -e.h / 2 - 2, e.w + 4, e.h + 4);
      }

      ctx.fillStyle = "#fff";
      ctx.font = `${e.h * 0.75}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(e.emoji, 0, 1);

      if (e.maxHp > 1) {
        const bw = e.w; const bh = 4;
        ctx.fillStyle = "#333";
        ctx.fillRect(-bw / 2, -e.h / 2 - bh - 2, bw, bh);
        ctx.fillStyle = e.hp / e.maxHp > 0.3 ? "#4f4" : "#f44";
        ctx.fillRect(-bw / 2, -e.h / 2 - bh - 2, bw * (e.hp / e.maxHp), bh);
      }

      ctx.restore();
    }
  }

  private renderBullets(ctx: CanvasRenderingContext2D): void {
    // Middle finger bullets 🖕
    for (const b of this.bullets.active) {
      ctx.save();
      ctx.translate(b.x, b.y);
      // Slight rotation for spread
      const angle = (b.spreadIndex - 2) * 0.25;
      ctx.rotate(angle);
      // Glow
      ctx.fillStyle = "#ff0";
      ctx.shadowColor = "#ff0";
      ctx.shadowBlur = 6;
      ctx.font = `${b.w + 2}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🖕", 0, 0);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  private renderEnemyBullets(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#f44";
    ctx.shadowColor = "#f44";
    ctx.shadowBlur = 4;
    for (const b of this.enemyBullets.active) {
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
    ctx.shadowBlur = 0;
  }

  private renderBoss(ctx: CanvasRenderingContext2D): void {
    const b = this.boss;
    if (!b || !b.alive) return;
    const { x, y, w, h } = b;

    // Fenêtre style Win98
    ctx.fillStyle = "#c0c0c0";
    ctx.fillRect(x, y, w, h);
    const tbH = 24;
    const grad = ctx.createLinearGradient(x, y, x, y + tbH);
    grad.addColorStop(0, "#800000");
    grad.addColorStop(1, "#a00000");
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, tbH);

    // Boutons
    ctx.fillStyle = "#c0c0c0";
    ctx.fillRect(x + w - 22, y + 3, 18, 18);
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText("✕", x + w - 13, y + 16);

    // Titre
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "left";
    ctx.fillText("☠ Windows Update (Critical)", x + 6, y + 17);

    // Corps
    ctx.fillStyle = "#ece9d8";
    ctx.fillRect(x + 3, y + tbH + 3, w - 6, h - tbH - 6);
    ctx.fillStyle = "#000";
    ctx.font = "11px monospace";
    ctx.fillText("Installation de la mise à jour...", x + 14, y + tbH + 22);
    ctx.fillText("Veuillez SURTOUT éteindre votre ordi.", x + 14, y + tbH + 38);

    // Barre de progression
    const bx = x + 14, by = y + tbH + 50, bw = w - 28, bh2 = 16;
    ctx.fillStyle = "#fff";
    ctx.fillRect(bx, by, bw, bh2);
    ctx.strokeStyle = "#808080";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh2);
    ctx.fillStyle = "#800000";
    ctx.fillRect(bx + 2, by + 2, (bw - 4) * 0.99, bh2 - 4);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("99% complété... OSEF", bx + bw / 2, by + bh2 / 2 + 4);

    // Boss health bar
    const hpW = w; const hpH = 8;
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y - hpH - 4, hpW, hpH);
    const hpRatio = b.hp / b.maxHp;
    const hpColor = hpRatio > 0.5 ? "#4f4" : hpRatio > 0.25 ? "#ff0" : "#f44";
    ctx.fillStyle = hpColor;
    ctx.fillRect(x, y - hpH - 4, hpW * hpRatio, hpH);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`☠ BOSS — ${Math.ceil(b.hp)}/${b.maxHp} PV`, x, y - hpH - 7);

    ctx.textAlign = "start";
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles.active) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.font = `${p.size}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = p.color;
      ctx.fillText(p.char, 0, 0);
      ctx.restore();
    }
  }

  private renderPowerUps(ctx: CanvasRenderingContext2D): void {
    for (const p of this.powerUps.active) {
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      // Pulse
      const pulse = 1 + Math.sin(p.pulsePhase) * 0.2;
      ctx.scale(pulse, pulse);
      // Glow
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "#ff0";
      ctx.shadowBlur = 10;
      ctx.font = `${p.w}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💾", 0, 0);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  private renderBanners(ctx: CanvasRenderingContext2D): void {
    for (const b of this.banners) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, b.life);
      ctx.font = `bold ${b.size}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = b.color;
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(b.text, b.x, b.y);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  private renderGlitchLines(ctx: CanvasRenderingContext2D): void {
    for (const gl of this.glitchLines) {
      ctx.save();
      ctx.globalAlpha = gl.alpha;
      // Capture a slice and offset it
      ctx.fillStyle = "#0ff";
      ctx.fillRect(gl.offset, gl.y, 40, gl.h);
      ctx.fillStyle = "#f0f";
      ctx.fillRect(gl.offset + 5, gl.y + 2, 30, gl.h - 4);
      ctx.restore();
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, this.W - 12, 22);
    ctx.fillStyle = "#aaa";
    ctx.font = "11px monospace";
    ctx.fillText(`VAGUE ${this.wave}`, this.W - 12, 38);

    // Health bar
    const hbW = 160, hbH = 12, hbX = 12, hbY = 12;
    ctx.fillStyle = "#222";
    ctx.fillRect(hbX, hbY, hbW, hbH);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1;
    ctx.strokeRect(hbX, hbY, hbW, hbH);
    const hpR = this.player.health / this.player.maxHealth;
    const hpC = hpR > 0.5 ? "#4f4" : hpR > 0.25 ? "#ff0" : "#f44";
    ctx.fillStyle = hpC;
    ctx.fillRect(hbX + 1, hbY + 1, (hbW - 2) * hpR, hbH - 2);
    ctx.fillStyle = "#fff";
    ctx.font = "9px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`HP: ${this.player.health}/${this.player.maxHealth}`, hbX + 4, hbY + 9);

    // Power level
    if (this.player.powerLevel > 0) {
      const pwY = hbY + hbH + 14;
      ctx.fillStyle = "#ff0";
      ctx.font = "bold 10px monospace";
      const pwLabel = `🖕 POWER x${this.player.powerLevel + 1}`;
      ctx.fillText(pwLabel, hbX, pwY);
      // Power bar
      const pwW = 80, pwH = 5;
      ctx.fillStyle = "#222";
      ctx.fillRect(hbX, pwY + 4, pwW, pwH);
      ctx.fillStyle = "#ff0";
      ctx.fillRect(hbX, pwY + 4, pwW * (this.player.powerLevel / MAX_POWER_LEVEL), pwH);
    }

    // Rage indicator
    if (this.rageTimer > 0) {
      const rageY = this.player.powerLevel > 0 ? hbY + hbH + 36 : hbY + hbH + 14;
      ctx.fillStyle = `rgba(255, 50, 0, ${0.7 + Math.sin(performance.now() / 30) * 0.3})`;
      ctx.font = "bold 12px monospace";
      ctx.fillText(`😈 RAGE ${this.rageTimer.toFixed(1)}s`, hbX, rageY);
    }

    // Reverse shoot indicator
    if (this.player.reverseShootTimer > 0) {
      const revY = (this.rageTimer > 0 ? hbY + hbH + 52 : this.player.powerLevel > 0 ? hbY + hbH + 36 : hbY + hbH + 14);
      ctx.fillStyle = `rgba(255, 0, 255, ${0.7 + Math.sin(performance.now() / 20) * 0.3})`;
      ctx.font = "bold 11px monospace";
      ctx.fillText(`⬅ TIR INVERTI ${this.player.reverseShootTimer.toFixed(1)}s`, hbX, revY);
    }

    ctx.textAlign = "start";
  }

  private renderTitle(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.min(36, this.W * 0.045)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("dragmenteur.exe", this.W / 2, this.H * 0.22);

    ctx.fillStyle = "#0ff";
    ctx.font = `${Math.min(16, this.W * 0.02)}px monospace`;
    ctx.fillText("The Bloatware Purge v2.0", this.W / 2, this.H * 0.22 + 36);

    // Petit vaisseau décoratif
    ctx.fillStyle = "#aaa";
    ctx.font = "28px serif";
    ctx.fillText("🖕", this.W / 2, this.H * 0.22 + 72);

    const blink = Math.sin(this.titleBlink * 3) > 0;
    if (blink) {
      ctx.fillStyle = "#fff";
      ctx.font = `${Math.min(18, this.W * 0.022)}px monospace`;
      ctx.fillText("Appuyez sur ESPACE pour TOUT NIKER", this.W / 2, this.H * 0.58);
    }

    ctx.fillStyle = "#666";
    ctx.font = `${Math.min(12, this.W * 0.015)}px monospace`;
    ctx.fillText("↑↓←→ / ZQSD = Déplacer   |   ESPACE = Tirer des 🖕", this.W / 2, this.H * 0.7);
    ctx.fillText("Ramassez les 💾 pour plus de puissance !", this.W / 2, this.H * 0.76);
    ctx.fillText("5 kills rapides = RAGE MODE 😈", this.W / 2, this.H * 0.82);

    ctx.fillStyle = "#444";
    ctx.font = "10px monospace";
    ctx.fillText("v2.0.0 — Édition DÉGÉNTÉE", this.W / 2, this.H - 14);
    ctx.textAlign = "start";
  }

  private renderWaveIntro(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.min(28, this.W * 0.035)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`VAGUE ${this.wave}`, this.W / 2, this.H * 0.38);
    ctx.fillStyle = "#0ff";
    ctx.font = `${Math.min(15, this.W * 0.018)}px monospace`;
    ctx.fillText(this.waveMessage, this.W / 2, this.H * 0.5);
    ctx.textAlign = "start";
  }

  private renderEndScreen(ctx: CanvasRenderingContext2D, title: string, color: string): void {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.fillStyle = color;
    ctx.font = `bold ${Math.min(32, this.W * 0.04)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(title, this.W / 2, this.H * 0.28);

    ctx.fillStyle = "#fff";
    ctx.font = `${Math.min(20, this.W * 0.025)}px monospace`;
    ctx.fillText(`Score final : ${this.score.toLocaleString()}`, this.W / 2, this.H * 0.42);

    const blink = Math.sin(this.titleBlink * 3) > 0;
    if (blink) {
      ctx.fillStyle = "#aaa";
      ctx.font = `${Math.min(15, this.W * 0.018)}px monospace`;
      ctx.fillText("Appuyez sur ESPACE pour redémarrer (ou fuyez)", this.W / 2, this.H * 0.58);
    }
    ctx.textAlign = "start";
  }
}
