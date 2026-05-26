// ====================================================================
// TASKKILL.EXE — The Bloatware Purge v3.0
// Moteur de jeu Shoot 'em Up VERTICAL pour GunthOS
// "Parce que les ennemis devraient venir d'en haut, comme les mises à jour Windows."
// ====================================================================

export interface EngineConfig {
  onShake?: (intensity: number) => void;
  onNotify?: (message: string) => void;
  onWin?: (score: number) => void;
  onLose?: (score: number) => void;
}

// ====================================================================
// TYPES
// ====================================================================
type EnemyType = "popup" | "notif" | "ploufplouf" | "radio" | "dll" | "clippy" | "bsod";
type GameState = "title" | "playing" | "waveIntro" | "gameover" | "victory";
type PowerUpType = "shotgun" | "laser" | "bomb" | "shield" | "speed" | "option";

interface Poolable { alive: boolean; }

interface BulletData extends Poolable {
  x: number; y: number;
  vx: number; vy: number;
  w: number; h: number;
  damage: number;
  isPlayerBullet: boolean;
  piercing: boolean;
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
  baseX: number;
  shootPattern: number;
}

interface BossData {
  x: number; y: number; w: number; h: number;
  hp: number; maxHp: number;
  phase: number;
  fireTimer: number; fireRate: number;
  moveTimer: number; targetX: number;
  alive: boolean; entered: boolean;
  updateProgress: number;
  deathTimer: number;
}

interface PowerUpData extends Poolable {
  x: number; y: number;
  vy: number;
  w: number; h: number;
  type: PowerUpType;
  timer: number;
  pulsePhase: number;
}

interface BannerData {
  text: string; x: number; y: number;
  life: number; maxLife: number;
  color: string; size: number; vy: number;
}

interface OptionDrone {
  x: number; y: number;
  offsetX: number; offsetY: number;
}

// ====================================================================
// CONSTANTS
// ====================================================================

const ENEMY_DEFS: Record<EnemyType, {
  hp: number; speed: number; score: number; canShoot: boolean;
  emoji: string; w: number; h: number; fireRate: number;
}> = {
  popup:     { hp: 1, speed: 70,  score: 100,  canShoot: false, emoji: "💬", w: 32, h: 28, fireRate: 0 },
  notif:     { hp: 2, speed: 50,  score: 150,  canShoot: true,  emoji: "🔔", w: 28, h: 28, fireRate: 2.0 },
  ploufplouf: { hp: 3, speed: 60, score: 200,  canShoot: true,  emoji: "🐟", w: 30, h: 24, fireRate: 1.6 },
  radio:     { hp: 2, speed: 45,  score: 175,  canShoot: false, emoji: "📡", w: 34, h: 34, fireRate: 0 },
  dll:       { hp: 5, speed: 40,  score: 350,  canShoot: false, emoji: "🧩", w: 36, h: 36, fireRate: 0 },
  clippy:    { hp: 20, speed: 35, score: 800,  canShoot: true,  emoji: "📎", w: 48, h: 48, fireRate: 1.0 },
  bsod:      { hp: 15, speed: 30, score: 500,  canShoot: false, emoji: "💀", w: 50, h: 40, fireRate: 0 },
};

const PLAYER_SPEED = 320;
const PLAYER_FIRE_RATE = 0.14;
const PLAYER_MAX_HEALTH = 3;
const PLAYER_INVINCIBLE_TIME = 2.0;
const PLAYER_HITBOX_RADIUS = 4;
const BULLET_SPEED = 650;
const ENEMY_BULLET_SPEED = 200;
const HITSTOP_DURATION = 0.04;
const PARTICLE_GRAVITY = 140;
const POWERUP_DROP_RATE = 0.22;
const POWERUP_SPEED = 80;
const COMBO_WINDOW = 2.0;

const DEATH_CHARS = ["✕","▓","☠","💀","⚠","⊕","∅","404","0xDEAD","SEGV","null","🗑️","💥","🤡","ERR","🖕","💩","FML"];
const SPARK_CHARS = ["·","∗","✦","□","■","🔥"];
const BOSS_CHARS = ["CRASH","DUMP","FATAL","0x0F","HALT","☠","💀","BSOD","RIP","🖕","LOL"];

const GUNTHOS_NOTIFS = [
  "Vous venez de détruire System32. Bravo.",
  "Astuce : Les pop-ups ont 1 PV. Mais ils sont nombreux.",
  "Mémoire RAM insuffisante pour votre ego.",
  "DLL manquante : self_control.dll",
  "Le Gestionnaire des Tâches n'est pas impressionné.",
  "Erreur 418 : Je suis une théière.",
  "Conseil technique : esquiver les balles réduit les dégâts.",
  "Votre curseur a été déplacé. Raison : incompétence.",
  "BSOD imminent. Profitez du spectacle.",
  "Défragmentation de votre style de jeu... 0% complété.",
  "🖕 Windows Update vous salue bien bas.",
  "ALERTE : Votre fichier pagefile.sys est plus gros que votre avenir.",
  "Windows Defender a détecté une menace : votre gameplay.",
  "Votre PC a rencontré un problème : vous.",
  "CTRL+ALT+DEL n'a jamais sauvé personne ici.",
  "🐟 Plouf Plouf a essayé de nager dans votre RAM. Il s'est noyé.",
  "📡 GunthRadio™ diffuse vos échecs en direct sur 98.8 FM.",
  "🧩 DLL manquante : réinstallez Windows.",
  "🔔 Nouvelle notification : vous perdez. Encore.",
];

const POWERUP_LABELS: Record<PowerUpType, string> = {
  shotgun: "💥 SHOTGUN", laser: "⚡ LASER", bomb: "💣 BOMBE",
  shield: "🛡️ SHIELD", speed: "💨 SPEED", option: "🛸 OPTION",
};

const GAME_W = 480;
const GAME_H = 700;

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
  mouseX = 0;
  mouseY = 0;
  mouseDown = false;
  touchActive = false;
  touchX = 0;
  touchY = 0;
  private getScale: () => number;
  private onKD: (e: KeyboardEvent) => void;
  private onKU: (e: KeyboardEvent) => void;
  private onBlur: () => void;
  private onMM: (e: MouseEvent) => void;
  private onMD: (e: MouseEvent) => void;
  private onMU: (e: MouseEvent) => void;
  private onTS: (e: TouchEvent) => void;
  private onTM: (e: TouchEvent) => void;
  private onTE: (e: TouchEvent) => void;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, getScale: () => number) {
    this.canvas = canvas;
    this.getScale = getScale;
    this.onKD = (e) => {
      if (!this.keys.has(e.key)) this.justPressed.add(e.key);
      this.keys.add(e.key);
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
    };
    this.onKU = (e) => this.keys.delete(e.key);
    this.onBlur = () => this.keys.clear();
    this.onMM = (e) => {
      const r = canvas.getBoundingClientRect();
      const s = this.getScale();
      this.mouseX = (e.clientX - r.left) / s;
      this.mouseY = (e.clientY - r.top) / s;
    };
    this.onMD = (e) => {
      this.mouseDown = true;
      const r = canvas.getBoundingClientRect();
      const s = this.getScale();
      this.mouseX = (e.clientX - r.left) / s;
      this.mouseY = (e.clientY - r.top) / s;
    };
    this.onMU = () => { this.mouseDown = false; };
    this.onTS = (e) => {
      e.preventDefault();
      this.touchActive = true;
      const r = canvas.getBoundingClientRect();
      const s = this.getScale();
      this.touchX = (e.touches[0]!.clientX - r.left) / s;
      this.touchY = (e.touches[0]!.clientY - r.top) / s;
    };
    this.onTM = (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const s = this.getScale();
      this.touchX = (e.touches[0]!.clientX - r.left) / s;
      this.touchY = (e.touches[0]!.clientY - r.top) / s;
    };
    this.onTE = () => { this.touchActive = false; };

    window.addEventListener("keydown", this.onKD);
    window.addEventListener("keyup", this.onKU);
    window.addEventListener("blur", this.onBlur);
    canvas.addEventListener("mousemove", this.onMM);
    canvas.addEventListener("mousedown", this.onMD);
    canvas.addEventListener("mouseup", this.onMU);
    canvas.addEventListener("touchstart", this.onTS, { passive: false });
    canvas.addEventListener("touchmove", this.onTM, { passive: false });
    canvas.addEventListener("touchend", this.onTE);
  }

  isDown(key: string): boolean { return this.keys.has(key); }
  wasPressed(key: string): boolean { return this.justPressed.has(key); }
  isFiring(): boolean {
    return this.isDown(" ") || this.mouseDown || this.touchActive;
  }
  clearFrame(): void { this.justPressed.clear(); }

  destroy(): void {
    window.removeEventListener("keydown", this.onKD);
    window.removeEventListener("keyup", this.onKU);
    window.removeEventListener("blur", this.onBlur);
    this.canvas.removeEventListener("mousemove", this.onMM);
    this.canvas.removeEventListener("mousedown", this.onMD);
    this.canvas.removeEventListener("mouseup", this.onMU);
    this.canvas.removeEventListener("touchstart", this.onTS);
    this.canvas.removeEventListener("touchmove", this.onTM);
    this.canvas.removeEventListener("touchend", this.onTE);
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
      this.master.gain.value = 0.2;
      this.master.connect(this.ctx.destination);
      this.ready = true;
    } catch { /* muet */ }
  }

  resume(): void {
    if (this.ctx?.state === "suspended") this.ctx.resume();
  }

  private tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.08, delay = 0): void {
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

  private noise(dur: number, vol = 0.05): void {
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

  shoot(): void { this.tone(880, 0.05, "square", 0.03); }
  laserShoot(): void { this.tone(1200, 0.04, "sawtooth", 0.04); }
  enemyHit(): void { this.tone(160, 0.07, "sawtooth", 0.05); }
  enemyDeath(): void { this.tone(55, 0.18, "sawtooth", 0.08); this.noise(0.1, 0.04); }
  playerHit(): void { this.tone(70, 0.22, "sawtooth", 0.12); this.noise(0.1, 0.07); }
  bossHit(): void { this.tone(35, 0.2, "sawtooth", 0.12); }
  bossDeath(): void { this.tone(25, 0.5, "sawtooth", 0.15); this.noise(0.35, 0.1); this.tone(18, 0.25, "square", 0.08, 0.2); }
  waveStart(): void { this.tone(330, 0.06, "square", 0.04); this.tone(440, 0.06, "square", 0.04, 0.08); this.tone(660, 0.1, "square", 0.04, 0.16); }
  powerUp(): void { this.tone(660, 0.05, "square", 0.04); this.tone(880, 0.05, "square", 0.04, 0.06); this.tone(1320, 0.08, "square", 0.03, 0.12); }
  bomb(): void { this.noise(0.3, 0.15); this.tone(40, 0.35, "sawtooth", 0.14); }
  glitch(): void { this.noise(0.03, 0.06); }

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
function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
function circleRect(cx: number, cy: number, cr: number, rx: number, ry: number, rw: number, rh: number): boolean {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  return (cx - closestX) ** 2 + (cy - closestY) ** 2 < cr ** 2;
}

// ====================================================================
// WAVE CONFIG
// ====================================================================
interface WaveEntry { type: EnemyType; count: number }
interface WaveConfig { name: string; enemies: WaveEntry[]; boss?: boolean }

function buildWaves(): WaveConfig[] {
  return [
    { name: "💬 Pop-ups publicitaires — ils arrivent !", enemies: [{ type: "popup", count: 15 }] },
    { name: "🔔 GunthMessenger™ — spam de notifications", enemies: [{ type: "popup", count: 6 }, { type: "notif", count: 10 }] },
    { name: "🐟 Plouf Plouf a crashé — les poissons s'échappent !", enemies: [{ type: "notif", count: 6 }, { type: "ploufplouf", count: 8 }] },
    { name: "📡 GunthRadio™ — ondes parasites", enemies: [{ type: "radio", count: 6 }, { type: "ploufplouf", count: 6 }, { type: "notif", count: 4 }] },
    { name: "🧩 DLL Hell — dépendances manquantes", enemies: [{ type: "dll", count: 6 }, { type: "radio", count: 6 }, { type: "popup", count: 8 }] },
    { name: "📎 Clippy et les BSOD — l'apocalypse", enemies: [{ type: "clippy", count: 3 }, { type: "bsod", count: 3 }, { type: "dll", count: 4 }] },
    { name: "💀 MISE À JOUR CRITIQUE — Windows Update.exe", enemies: [], boss: true },
  ];
}

// ====================================================================
// TASKKILL ENGINE v3.0 — VERTICAL SHMUP
// ====================================================================
export class TaskkillEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cfg: EngineConfig;
  private scale = 1;

  // Systems
  private input: InputManager;
  private audio: AudioSystem;

  // Pools
  private bullets: Pool<BulletData>;
  private enemyBullets: Pool<BulletData>;
  private particles: Pool<ParticleData>;
  private enemies: Pool<EnemyData>;
  private powerUps: Pool<PowerUpData>;

  // Player
  private player = {
    x: 240, y: 600, w: 28, h: 32,
    health: PLAYER_MAX_HEALTH, maxHealth: PLAYER_MAX_HEALTH,
    invTimer: 0, fireTimer: 0,
    activePowerUp: null as PowerUpType | null,
    powerTimer: 0,
    shieldActive: false,
    speedBoost: false,
    options: [] as OptionDrone[],
  };

  // Boss
  private boss: BossData | null = null;

  // State
  private state: GameState = "title";
  private score = 0;
  private wave = 0;
  private waveEnemiesLeft = 0;
  private waveSpawnTimer = 0;
  private waveMessage = "";
  private waveMessageTimer = 0;
  private waveQueue: EnemyType[] = [];
  private waveCooldownTimer = 0;

  // Scrolling background
  private bgScroll = 0;

  // Effects
  private shakeAmt = 0;
  private shakeDur = 0;
  private hitstop = 0;
  private flashAlpha = 0;

  // Glitch
  private glitchX = 0;
  private glitchY = 0;
  private glitchTimer = 0;
  private glitchLines: { y: number; h: number; offset: number; alpha: number }[] = [];

  // Combo
  private comboCount = 0;
  private comboTimer = 0;
  private comboMultiplier = 1;

  // Notifications + banners
  private notifQueue: { msg: string; timer: number }[] = [];
  private banners: BannerData[] = [];

  // Loop
  private rafId = 0;
  private lastT = 0;
  private running = false;
  private titleBlink = 0;

  // Stars
  private stars: { x: number; y: number; r: number; speed: number; brightness: number }[] = [];

  // Difficulty scaling
  private gameTimer = 0;

  // Options fire timer
  private optionFireTimer = 0;

  constructor(canvas: HTMLCanvasElement, config: EngineConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;
    this.cfg = config;
    this.input = new InputManager(canvas, () => this.scale);
    this.audio = new AudioSystem();
    this.resize();

    const makeBullet = (): BulletData => ({
      x:0,y:0,vx:0,vy:0,w:8,h:12,damage:1,isPlayerBullet:true,piercing:false,alive:false,
    });
    const resetBullet = (b: BulletData) => { b.x=0;b.y=0;b.vx=0;b.vy=0;b.w=8;b.h=12;b.damage=1;b.isPlayerBullet=true;b.piercing=false; };
    this.bullets = new Pool(makeBullet, resetBullet, 200);
    this.enemyBullets = new Pool(makeBullet, resetBullet, 120);

    const makeParticle = (): ParticleData => ({
      x:0,y:0,vx:0,vy:0,life:1,maxLife:1,char:"·",color:"#fff",size:14,rotation:0,rotationSpeed:0,alive:false,
    });
    const resetParticle = (p: ParticleData) => {
      p.x=0;p.y=0;p.vx=0;p.vy=0;p.life=1;p.maxLife=1;p.char="·";p.color="#fff";p.size=14;p.rotation=0;p.rotationSpeed=0;
    };
    this.particles = new Pool(makeParticle, resetParticle, 500);

    const makeEnemy = (): EnemyData => ({
      x:0,y:0,w:32,h:32,vx:0,vy:0,hp:1,maxHp:1,enemyType:"popup",score:100,
      canShoot:false,fireTimer:0,fireRate:0,phase:0,phaseTimer:0,flashTimer:0,
      emoji:"💬",baseX:0,shootPattern:0,alive:false,
    });
    const resetEnemy = (e: EnemyData) => {
      e.x=0;e.y=0;e.w=32;e.h=32;e.vx=0;e.vy=0;e.hp=1;e.maxHp=1;e.enemyType="popup";e.score=100;
      e.canShoot=false;e.fireTimer=0;e.fireRate=0;e.phase=0;e.phaseTimer=0;e.flashTimer=0;
      e.emoji="💬";e.baseX=0;e.shootPattern=0;
    };
    this.enemies = new Pool(makeEnemy, resetEnemy, 50);

    const makePowerUp = (): PowerUpData => ({
      x:0,y:0,vy:POWERUP_SPEED,w:24,h:24,type:"shotgun",timer:10,pulsePhase:0,alive:false,
    });
    const resetPowerUp = (p: PowerUpData) => {
      p.x=0;p.y=0;p.vy=POWERUP_SPEED;p.w=24;p.h=24;p.type="shotgun";p.timer=10;p.pulsePhase=0;
    };
    this.powerUps = new Pool(makePowerUp, resetPowerUp, 16);

    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: rnd(0, GAME_W), y: rnd(0, GAME_H),
        r: rnd(0.5, 2.5), speed: rnd(30, 120),
        brightness: rnd(0.3, 1),
      });
    }
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scaleX = rect.width / GAME_W;
    const scaleY = rect.height / GAME_H;
    this.scale = Math.min(scaleX, scaleY);

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.setTransform(dpr * this.scale, 0, 0, dpr * this.scale, 0, 0);
  }

  // ---- Lifecycle ----
  start(): void {
    if (this.running) return;
    if (this.scale <= 0) { this.resize(); if (this.scale <= 0) return; }
    this.running = true;
    this.audio.init();
    this.lastT = performance.now();
    this.state = "title";
    this.score = 0;
    this.wave = 0;
    this.bgScroll = 0;
    this.boss = null;
    this.resetPlayer();
    this.bullets.releaseAll();
    this.enemyBullets.releaseAll();
    this.enemies.releaseAll();
    this.particles.releaseAll();
    this.powerUps.releaseAll();
    this.banners = [];
    this.notifQueue = [];
    this.glitchX = 0; this.glitchY = 0; this.glitchTimer = 0; this.glitchLines = [];
    this.comboCount = 0; this.comboTimer = 0; this.comboMultiplier = 1;
    this.gameTimer = 0;
    this.waveQueue = [];
    this.queueNotif("dragmenteur.exe v3.1 — Édition VERTICALE (résolution fixe). 🖕");
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

  private spawnBanner(text: string, x: number, y: number, color = "#fff", size = 16, vy = -50): void {
    this.banners.push({ text, x, y, life: 1.5, maxLife: 1.5, color, size, vy });
    if (this.banners.length > 14) this.banners.shift();
  }

  private maybeSnark(): void {
    if (Math.random() < 0.002 && this.notifQueue.length < 5) {
      this.queueNotif(pick(GUNTHOS_NOTIFS));
    }
  }

  // ---- Player ----
  private resetPlayer(): void {
    this.player.x = GAME_W / 2;
    this.player.y = GAME_H - 80;
    this.player.health = PLAYER_MAX_HEALTH;
    this.player.invTimer = 0;
    this.player.fireTimer = 0;
    this.player.activePowerUp = null;
    this.player.powerTimer = 0;
    this.player.shieldActive = false;
    this.player.speedBoost = false;
    this.player.options = [];
    this.optionFireTimer = 0;
  }

  // ---- Effects ----
  private addShake(intensity: number): void {
    this.shakeAmt = Math.max(this.shakeAmt, intensity);
    this.shakeDur = Math.max(this.shakeDur, 0.2);
    this.cfg.onShake?.(intensity);
  }
  private addHitstop(dur = HITSTOP_DURATION): void { this.hitstop = Math.max(this.hitstop, dur); }
  private addFlash(alpha = 0.12): void { this.flashAlpha = Math.max(this.flashAlpha, alpha); }

  private triggerGlitch(intensity = 1): void {
    this.glitchX = rnd(-8, 8) * intensity;
    this.glitchY = rnd(-2, 2) * intensity;
    this.glitchTimer = rnd(0.03, 0.1);
    this.glitchLines = [];
    const count = Math.floor(rnd(1, 3) * intensity);
    for (let i = 0; i < count; i++) {
      this.glitchLines.push({ y: rnd(0, GAME_H), h: rnd(4, 14), offset: rnd(-25, 25) * intensity, alpha: rnd(0.4, 0.8) });
    }
    this.audio.glitch();
  }

  // ---- Particles ----
  private spawnParticles(x: number, y: number, count: number, chars: readonly string[], color: string, spread = 150, life = 0.6): void {
    for (let i = 0; i < count; i++) {
      const p = this.particles.acquire();
      p.x = x; p.y = y;
      const angle = rnd(0, Math.PI * 2);
      const speed = rnd(30, spread);
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.maxLife = rnd(life * 0.5, life);
      p.life = p.maxLife;
      p.char = pick(chars);
      p.color = color;
      p.size = rnd(10, 24);
      p.rotation = rnd(0, Math.PI * 2);
      p.rotationSpeed = rnd(-8, 8);
    }
  }

  // ---- Bullets ----
  private spawnEnemyBullet(x: number, y: number, vx: number, vy: number): void {
    const b = this.enemyBullets.acquire();
    b.x = x; b.y = y; b.vx = vx; b.vy = vy;
    b.w = 8; b.h = 8; b.damage = 1; b.isPlayerBullet = false;
  }

  private enemyShootTargeted(e: EnemyData): void {
    if (!e.canShoot) return;
    e.fireTimer -= 1 / 60;
    if (e.fireTimer <= 0 && e.y > 0 && e.y < GAME_H) {
      e.fireTimer = e.fireRate;
      const cx = e.x + e.w / 2;
      const cy = e.y + e.h / 2;
      const angle = Math.atan2(this.player.y - cy, this.player.x - cx);
      this.spawnEnemyBullet(cx, cy, Math.cos(angle) * ENEMY_BULLET_SPEED, Math.sin(angle) * ENEMY_BULLET_SPEED);
    }
  }

  private enemyShootFan(e: EnemyData, count: number, spread: number): void {
    e.fireTimer -= 1 / 60;
    if (e.fireTimer <= 0 && e.y > 0 && e.y < GAME_H) {
      e.fireTimer = e.fireRate;
      const cx = e.x + e.w / 2;
      const cy = e.y + e.h / 2;
      const baseAngle = Math.PI / 2; // downward
      for (let i = 0; i < count; i++) {
        const a = baseAngle + (i - (count - 1) / 2) * spread;
        this.spawnEnemyBullet(cx, cy, Math.cos(a) * ENEMY_BULLET_SPEED, Math.sin(a) * ENEMY_BULLET_SPEED);
      }
    }
  }

  // ---- Power-ups ----
  private spawnPowerUp(x: number, y: number): void {
    const types: PowerUpType[] = ["shotgun","laser","bomb","shield","speed","option"];
    const p = this.powerUps.acquire();
    p.x = x; p.y = y;
    p.vy = POWERUP_SPEED;
    p.w = 22; p.h = 22;
    p.type = pick(types);
    p.timer = 10;
    p.pulsePhase = rnd(0, Math.PI * 2);
  }

  // ---- Wave system ----
  private startWave(): void {
    this.wave++;
    const waves = buildWaves();
    if (this.wave > waves.length) {
      this.victory();
      return;
    }

    const cfg = waves[this.wave - 1]!;
    if (cfg.boss) {
      this.state = "waveIntro";
      this.waveMessage = "⚠️ BOSS FINAL — Windows Update.exe";
      this.waveMessageTimer = 2.0;
      this.waveCooldownTimer = 2.0;
      this.queueNotif("⚠️ MISE À JOUR CRITIQUE : Windows Update force l'installation...");
      this.audio.waveStart();
      return;
    }

    this.waveMessage = `VAGUE ${this.wave} — ${cfg.name}`;
    this.waveMessageTimer = 2.0;
    this.waveCooldownTimer = 2.0;
    this.state = "waveIntro";
    this.audio.waveStart();

    let total = 0;
    for (const e of cfg.enemies) total += e.count;
    this.waveEnemiesLeft = total;
    this.waveSpawnTimer = 0.5;

    const queue: EnemyType[] = [];
    for (const e of cfg.enemies) {
      for (let i = 0; i < e.count; i++) queue.push(e.type);
    }
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j]!, queue[i]!];
    }
    this.waveQueue = queue;
  }

  private spawnNextEnemy(): void {
    if (this.waveQueue.length === 0) return;
    const type = this.waveQueue.pop()!;
    const def = ENEMY_DEFS[type];

    const e = this.enemies.acquire();
    e.enemyType = type; e.emoji = def.emoji; e.w = def.w; e.h = def.h;
    e.hp = def.hp + Math.floor(this.wave * 0.3);
    e.maxHp = e.hp; e.score = def.score;
    e.canShoot = def.canShoot; e.fireRate = def.fireRate;
    e.fireTimer = rnd(0.5, e.fireRate);
    e.shootPattern = type === "ploufplouf" ? 1 : type === "clippy" ? 2 : 0;
    e.y = -e.h - rnd(5, 40);
    e.x = rnd(20, GAME_W - e.w - 20);
    e.baseX = e.x;
    e.vy = def.speed * rnd(0.85, 1.15);
    e.vx = 0;
    e.phase = rnd(0, Math.PI * 2);
    e.phaseTimer = 0;
    e.flashTimer = 0;
    this.waveEnemiesLeft--;
  }

  // ---- Boss ----
  private spawnBoss(): void {
    if (this.boss?.alive) return;
    this.boss = {
      x: GAME_W / 2 - 80, y: -120,
      w: 160, h: 120,
      hp: 120 + this.wave * 25,
      maxHp: 120 + this.wave * 25,
      phase: 0, fireTimer: 0, fireRate: 0.6,
      moveTimer: 0, targetX: GAME_W / 2 - 80,
      alive: true, entered: false,
      updateProgress: 0,
      deathTimer: 0,
    };
    this.spawnBanner("⚠️ WINDOWS UPDATE ⚠️", GAME_W / 2, GAME_H * 0.35, "#f44", 24, 0);
  }

  // ================================================================
  // MAIN LOOP
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
    // Decay effects
    if (this.shakeDur > 0) { this.shakeDur -= dt; if (this.shakeDur <= 0) this.shakeAmt = 0; else this.shakeAmt *= 0.85; }
    if (this.flashAlpha > 0) this.flashAlpha = Math.max(0, this.flashAlpha - dt * 3);
    if (this.glitchTimer > 0) { this.glitchTimer -= dt; if (this.glitchTimer <= 0) { this.glitchX = 0; this.glitchY = 0; this.glitchLines = []; } }
    if (this.waveMessageTimer > 0) this.waveMessageTimer -= dt;
    if (this.waveCooldownTimer > 0) { this.waveCooldownTimer -= dt; if (this.waveCooldownTimer <= 0 && this.state === "waveIntro") this.state = "playing"; }

    // Combo decay
    if (this.comboTimer > 0) { this.comboTimer -= dt; if (this.comboTimer <= 0) { this.comboCount = 0; this.comboMultiplier = 1; } }

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

    // Game timer for difficulty
    if (this.state === "playing") this.gameTimer += dt;

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
    this.bgScroll += 50 * dt;
    this.updateParticles(dt);
    this.maybeSnark();

    if (this.input.wasPressed(" ") || this.input.wasPressed("Enter")) {
      this.audio.resume();
      this.audio.init();
      this.state = "playing";
      this.score = 0;
      this.wave = 0;
      this.gameTimer = 0;
      this.boss = null;
      this.bullets.releaseAll();
      this.enemyBullets.releaseAll();
      this.enemies.releaseAll();
      this.powerUps.releaseAll();
      this.banners = [];
      this.resetPlayer();
      this.startWave();
      this.queueNotif("Formatage du disque dur en cours... 🖕");
    }
  }

  private updateWaveIntro(dt: number): void {
    this.bgScroll += 50 * dt;
    this.updateParticles(dt);
    // Boss spawn after intro
    if (this.boss === null && this.waveCooldownTimer <= 0.5 && this.wave === buildWaves().length) {
      this.spawnBoss();
    }
  }

  private updatePlaying(dt: number): void {
    this.bgScroll += 80 * dt;
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

    // Boss snark
    if (this.boss?.alive && Math.random() < 0.005) {
      this.queueNotif(pick(GUNTHOS_NOTIFS));
    }
    // Random glitch
    if (Math.random() < 0.003) this.triggerGlitch(0.6);

    // Stars scroll downward
    for (const s of this.stars) {
      s.y += s.speed * dt;
      if (s.y > GAME_H + 5) { s.y = -5; s.x = rnd(0, GAME_W); }
    }
  }

  private updateEnd(dt: number): void {
    this.updateParticles(dt);
    this.titleBlink += dt;
    if (this.input.wasPressed(" ") || this.input.wasPressed("Enter")) {
      this.state = "title";
      this.score = 0;
      this.wave = 0;
      this.gameTimer = 0;
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

    // Keyboard input
    if (this.input.isDown("ArrowLeft") || this.input.isDown("q") || this.input.isDown("Q")) dx = -1;
    if (this.input.isDown("ArrowRight") || this.input.isDown("d") || this.input.isDown("D")) dx = 1;
    if (this.input.isDown("ArrowUp") || this.input.isDown("z") || this.input.isDown("Z") || this.input.isDown("w") || this.input.isDown("W")) dy = -1;
    if (this.input.isDown("ArrowDown") || this.input.isDown("s") || this.input.isDown("S")) dy = 1;

    // Mouse/touch follow (takes priority if active)
    if (this.input.mouseDown || this.input.touchActive) {
      const tx = this.input.touchActive ? this.input.touchX : this.input.mouseX;
      const ty = this.input.touchActive ? this.input.touchY : this.input.mouseY;
      const d = dist({ x: this.player.x + this.player.w / 2, y: this.player.y + this.player.h / 2 }, { x: tx, y: ty });
      if (d > 3) {
        dx = (tx - (this.player.x + this.player.w / 2)) / d;
        dy = (ty - (this.player.y + this.player.h / 2)) / d;
        // Slow down when close
        const speed = Math.min(1, d / 40);
        dx *= speed;
        dy *= speed;
      }
    }

    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    const speed = this.player.speedBoost ? PLAYER_SPEED * 1.6 : PLAYER_SPEED;
    this.player.x += dx * speed * dt;
    this.player.y += dy * speed * dt;
    this.player.x = Math.max(5, Math.min(GAME_W - this.player.w - 5, this.player.x));
    this.player.y = Math.max(40, Math.min(GAME_H - this.player.h - 5, this.player.y));

    // Invincibility
    if (this.player.invTimer > 0) this.player.invTimer -= dt;

    // Power-up timer
    if (this.player.powerTimer > 0) {
      this.player.powerTimer -= dt;
      if (this.player.powerTimer <= 0) {
        this.player.activePowerUp = null;
        this.player.speedBoost = false;
      }
    }

    // Firing
    this.player.fireTimer -= dt;
    const fireRate = this.player.activePowerUp === "speed" ? PLAYER_FIRE_RATE * 0.7 : PLAYER_FIRE_RATE;
    if (this.input.isFiring() && this.player.fireTimer <= 0) {
      this.firePlayerBullets();
      this.player.fireTimer = fireRate;
    }

    // Option drones fire
    if (this.player.options.length > 0) {
      this.optionFireTimer -= dt;
      if (this.optionFireTimer <= 0 && this.input.isFiring()) {
        this.optionFireTimer = fireRate * 1.2;
        for (const opt of this.player.options) {
          const b = this.bullets.acquire();
          b.x = opt.x + this.player.x + this.player.w / 2 - 4;
          b.y = opt.y + this.player.y + this.player.h / 2;
          b.vx = 0; b.vy = -BULLET_SPEED;
          b.w = 6; b.h = 10; b.damage = 1; b.isPlayerBullet = true; b.piercing = false;
        }
      }
    }

    // Update option positions
    if (this.player.options.length > 0) {
      const now = performance.now() / 1000;
      for (let i = 0; i < this.player.options.length; i++) {
        const opt = this.player.options[i]!;
        opt.offsetX = Math.sin(now * 3 + i * 2) * 25;
        opt.offsetY = Math.cos(now * 2 + i * 2) * 10 - 15 * (i + 1);
      }
    }
  }

  private firePlayerBullets(): void {
    const pw = this.player.activePowerUp;
    const cx = this.player.x + this.player.w / 2;
    const cy = this.player.y;

    if (pw === "shotgun") {
      for (let a = -0.35; a <= 0.35; a += 0.175) {
        const b = this.bullets.acquire();
        b.x = cx - 5; b.y = cy;
        b.vx = Math.sin(a) * BULLET_SPEED * 0.6; b.vy = Math.cos(a) * -BULLET_SPEED;
        b.w = 10; b.h = 10; b.damage = 1; b.isPlayerBullet = true; b.piercing = false;
      }
    } else if (pw === "laser") {
      const b = this.bullets.acquire();
      b.x = cx - 3; b.y = cy - 20;
      b.vx = 0; b.vy = -BULLET_SPEED * 1.3;
      b.w = 6; b.h = 40; b.damage = 2; b.isPlayerBullet = true; b.piercing = true;
      this.audio.laserShoot();
      return;
    } else {
      // Normal shot or slight spread
      const spread = this.player.options.length > 0 ? 0.15 : 0;
      const count = this.player.options.length > 0 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const b = this.bullets.acquire();
        b.x = cx - 4 + (i - (count - 1) / 2) * 8;
        b.y = cy;
        b.vx = (i - (count - 1) / 2) * spread * BULLET_SPEED;
        b.vy = -BULLET_SPEED;
        b.w = 8; b.h = 14; b.damage = 1; b.isPlayerBullet = true; b.piercing = false;
      }
    }
    this.audio.shoot();
  }

  private updateBullets(dt: number): void {
    for (let i = this.bullets.active.length - 1; i >= 0; i--) {
      const b = this.bullets.active[i]!;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.y < -40 || b.y > GAME_H + 40 || b.x < -40 || b.x > GAME_W + 40) {
        this.bullets.release(b);
      }
    }
  }

  private updateEnemyBullets(dt: number): void {
    for (let i = this.enemyBullets.active.length - 1; i >= 0; i--) {
      const b = this.enemyBullets.active[i]!;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.y < -30 || b.y > GAME_H + 30 || b.x < -30 || b.x > GAME_W + 30) {
        this.enemyBullets.release(b);
      }
    }
  }

  private updateEnemies(dt: number): void {
    for (let i = this.enemies.active.length - 1; i >= 0; i--) {
      const e = this.enemies.active[i]!;
      e.phaseTimer += dt;
      if (e.flashTimer > 0) e.flashTimer -= dt;

      // Movement patterns
      switch (e.enemyType) {
        case "popup":
          // Straight down with slight wobble
          e.x = e.baseX + Math.sin(e.phaseTimer * 4) * 20;
          e.x += e.vx * dt;
          e.y += e.vy * dt;
          break;
        case "notif":
          // Follows player slowly
          e.y += e.vy * dt;
          {
            const dx = this.player.x - e.x;
            e.vx = Math.sign(dx) * Math.min(Math.abs(dx) * 1.5, 60);
            e.x += e.vx * dt;
          }
          this.enemyShootTargeted(e);
          break;
        case "ploufplouf":
          // Moves down, shoots fan pattern
          e.y += e.vy * dt;
          e.x = e.baseX + Math.sin(e.phaseTimer * 3) * 40;
          e.fireTimer -= dt;
          if (e.fireTimer <= 0 && e.y > 10 && e.y < GAME_H - 10) {
            e.fireTimer = e.fireRate;
            const cx = e.x + e.w / 2;
            const cy = e.y + e.h / 2;
            for (let a = -0.4; a <= 0.4; a += 0.2) {
              this.spawnEnemyBullet(cx, cy, Math.sin(a) * 80, ENEMY_BULLET_SPEED);
            }
          }
          break;
        case "radio":
          // Zigzag pattern
          e.y += e.vy * dt;
          e.x = e.baseX + Math.sin(e.phaseTimer * 5) * 70;
          this.enemyShootTargeted(e);
          break;
        case "dll":
          // Slow, has shield (absorbs damage), moves horizontally
          e.y += e.vy * dt;
          e.x += Math.sin(e.phaseTimer * 2) * 50 * dt;
          // Shield visual = flash every 2s
          break;
        case "clippy":
          // Tracks player, shoots complex patterns
          e.y += e.vy * dt;
          {
            const dx = this.player.x - e.x;
            e.vx = Math.sign(dx) * Math.min(Math.abs(dx) * 2, 80);
            e.x += e.vx * dt;
          }
          e.fireTimer -= dt;
          if (e.fireTimer <= 0 && e.y > 10) {
            e.fireTimer = e.fireRate;
            const cx = e.x + e.w / 2;
            const cy = e.y + e.h / 2;
            const angle = Math.atan2(this.player.y - cy, this.player.x - cx);
            this.spawnEnemyBullet(cx, cy, Math.cos(angle) * ENEMY_BULLET_SPEED * 1.2, Math.sin(angle) * ENEMY_BULLET_SPEED * 1.2);
            // Extra side shots
            this.spawnEnemyBullet(cx, cy, Math.cos(angle - 0.35) * ENEMY_BULLET_SPEED, Math.sin(angle - 0.35) * ENEMY_BULLET_SPEED);
            this.spawnEnemyBullet(cx, cy, Math.cos(angle + 0.35) * ENEMY_BULLET_SPEED, Math.sin(angle + 0.35) * ENEMY_BULLET_SPEED);
          }
          break;
        case "bsod":
          // Big, slow, shoots lasers downward
          e.y += e.vy * dt;
          e.x = e.baseX + Math.sin(e.phaseTimer * 1.5) * 30;
          e.fireTimer -= dt;
          if (e.fireTimer <= 0 && e.y > 10) {
            e.fireTimer = 1.8;
            for (let a = -0.3; a <= 0.3; a += 0.15) {
              this.spawnEnemyBullet(e.x + e.w / 2, e.y + e.h, Math.sin(a) * 60, ENEMY_BULLET_SPEED * 0.8);
            }
          }
          break;
        default:
          e.y += e.vy * dt;
          break;
      }

      // Remove if off screen bottom
      if (e.y > GAME_H + 60) {
        this.enemies.release(e);
        // Penalty: reset combo
        this.comboCount = 0;
        this.comboMultiplier = 1;
      }
    }
  }

  private updateBoss(dt: number): void {
    const b = this.boss;
    if (!b || !b.alive) return;

    if (b.hp <= 0) {
      b.deathTimer -= dt;
      b.y += 40 * dt; // drift down
      if (b.deathTimer <= 0 || b.y > GAME_H + 200) { b.alive = false; this.boss = null; }
      return;
    }

    // Enter screen
    if (!b.entered) {
      b.y += 60 * dt;
      if (b.y >= 30) { b.y = 30; b.entered = true; }
      return;
    }

    // Update progress bar (slowly rises)
    b.updateProgress += dt * 3; // ~3% per second
    if (b.updateProgress >= 100) {
      // Update complete = game over!
      this.gameOver("MISE À JOUR INSTALLÉE ! Windows a gagné. 💀");
      return;
    }

    // Horizontal movement
    b.moveTimer -= dt;
    if (b.moveTimer <= 0) { b.moveTimer = rnd(1.0, 2.0); b.targetX = rnd(20, GAME_W - b.w - 20); }
    b.x += (b.targetX - b.x) * 1.5 * dt;
    b.x = Math.max(5, Math.min(GAME_W - b.w - 5, b.x));

    // Phase based on HP
    const hpRatio = b.hp / b.maxHp;
    if (hpRatio > 0.6) b.phase = 0;
    else if (hpRatio > 0.3) b.phase = 1;
    else if (hpRatio > 0.1) b.phase = 2;
    else b.phase = 3;

    b.fireRate = [0.7, 0.5, 0.35, 0.2][b.phase]!;

    b.fireTimer -= dt;
    if (b.fireTimer <= 0) {
      b.fireTimer = b.fireRate;
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2 + 30;

      switch (b.phase) {
        case 0:
          // Targeted shots
          for (let a = -0.2; a <= 0.2; a += 0.2) {
            const angle = Math.atan2(this.player.y - cy, this.player.x - cx) + a;
            this.spawnEnemyBullet(cx, cy, Math.cos(angle) * ENEMY_BULLET_SPEED, Math.sin(angle) * ENEMY_BULLET_SPEED);
          }
          break;
        case 1:
          // Fan + targeted
          for (let a = -0.6; a <= 0.6; a += 0.3) {
            this.spawnEnemyBullet(cx, cy, Math.sin(a) * ENEMY_BULLET_SPEED * 0.6, ENEMY_BULLET_SPEED * 0.8);
          }
          if (Math.random() < 0.5) {
            const angle = Math.atan2(this.player.y - cy, this.player.x - cx);
            this.spawnEnemyBullet(cx, cy, Math.cos(angle) * ENEMY_BULLET_SPEED * 1.3, Math.sin(angle) * ENEMY_BULLET_SPEED * 1.3);
          }
          break;
        case 2:
          // Spawn minions
          if (Math.random() < 0.4) {
            const def = ENEMY_DEFS.notif;
            const ne = this.enemies.acquire();
            ne.enemyType = "notif"; ne.emoji = def.emoji; ne.w = def.w; ne.h = def.h;
            ne.hp = 1; ne.maxHp = 1; ne.score = 50; ne.canShoot = true;
            ne.fireRate = 3; ne.fireTimer = rnd(0.5, 1.5);
            ne.x = b.x + rnd(-10, b.w); ne.y = b.y + b.h;
            ne.baseX = ne.x; ne.vy = rnd(50, 100); ne.vx = 0;
            ne.phase = 0; ne.phaseTimer = 0; ne.flashTimer = 0; ne.shootPattern = 0;
          }
          // Circle pattern
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
            this.spawnEnemyBullet(cx, cy, Math.cos(a) * ENEMY_BULLET_SPEED * 1.1, Math.sin(a) * ENEMY_BULLET_SPEED * 1.1);
          }
          break;
        case 3:
          // Rage: everything
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
            this.spawnEnemyBullet(cx, cy, Math.cos(a) * ENEMY_BULLET_SPEED * 1.3, Math.sin(a) * ENEMY_BULLET_SPEED * 1.3);
          }
          if (Math.random() < 0.6) {
            const angle = Math.atan2(this.player.y - cy, this.player.x - cx);
            this.spawnEnemyBullet(cx, cy, Math.cos(angle) * ENEMY_BULLET_SPEED * 1.5, Math.sin(angle) * ENEMY_BULLET_SPEED * 1.5);
          }
          // Screen darkening effect
          this.addFlash(0.06);
          break;
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
      p.y += p.vy * dt;
      p.timer -= dt;
      p.pulsePhase += dt * 5;
      if (p.timer <= 0 || p.y > GAME_H + 30) {
        this.powerUps.release(p);
      }
    }
  }

  private updateSpawning(dt: number): void {
    if (this.boss?.alive) return;

    if (this.waveQueue.length === 0 && this.enemies.active.length === 0 && this.waveEnemiesLeft === 0) {
      this.startWave();
      return;
    }

    if (this.waveQueue.length > 0) {
      this.waveSpawnTimer -= dt;
      // Spawn faster as game progresses
      const spawnRate = Math.max(0.2, 0.7 - this.gameTimer * 0.005);
      if (this.waveSpawnTimer <= 0) {
        this.spawnNextEnemy();
        this.waveSpawnTimer = rnd(spawnRate * 0.5, spawnRate * 1.5);
      }
    }
  }

  private checkCollisions(): void {
    const px = this.player.x + this.player.w / 2;
    const py = this.player.y + this.player.h / 2;
    const playerBox = { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h };

    // Player bullets → enemies
    for (let bi = this.bullets.active.length - 1; bi >= 0; bi--) {
      const bullet = this.bullets.active[bi]!;
      if (!bullet.isPlayerBullet) continue;

      for (let ei = this.enemies.active.length - 1; ei >= 0; ei--) {
        const enemy = this.enemies.active[ei]!;
        if (aabb(bullet, enemy)) {
          enemy.hp -= bullet.damage;
          enemy.flashTimer = 0.06;
          if (!bullet.piercing) this.bullets.release(bullet);
          this.spawnParticles(bullet.x, bullet.y, 3, SPARK_CHARS, "#ff0", 60, 0.25);
          this.audio.enemyHit();
          this.addShake(1.5);
          this.addHitstop();

          if (enemy.hp <= 0) {
            this.onEnemyKilled(enemy);
            this.enemies.release(enemy);
          }
          break;
        }
      }
    }

    // Player bullets → boss
    if (this.boss?.alive && this.boss.entered) {
      for (let bi = this.bullets.active.length - 1; bi >= 0; bi--) {
        const bullet = this.bullets.active[bi]!;
        if (!bullet.isPlayerBullet) continue;
        if (aabb(bullet, this.boss)) {
          this.boss.hp -= bullet.damage;
          this.boss.updateProgress = Math.max(0, this.boss.updateProgress - 1.5); // Push back progress
          if (!bullet.piercing) this.bullets.release(bullet);
          this.spawnParticles(bullet.x, bullet.y, 4, SPARK_CHARS, "#ff0", 80, 0.25);
          this.audio.bossHit();
          this.addShake(2.5);
          this.addHitstop();
          this.triggerGlitch(0.4);

          if (this.boss.hp <= 0) {
            this.score += 10000;
            this.spawnParticles(this.boss.x + this.boss.w / 2, this.boss.y + this.boss.h / 2, 30, BOSS_CHARS, "#f0f", 250, 0.9);
            this.spawnParticles(this.boss.x + this.boss.w / 2, this.boss.y + this.boss.h / 2, 20, DEATH_CHARS, "#0ff", 200, 0.7);
            this.addShake(12);
            this.addFlash(0.35);
            this.addHitstop(0.06);
            this.triggerGlitch(1.5);
            this.audio.bossDeath();
            this.queueNotif("MISE À JOUR ANNULÉE. Windows Update a été purgé. 🖕");
            this.spawnBanner("💀 WINDOWS UPDATE DÉSINSTALLÉ 💀", GAME_W / 2, GAME_H / 2, "#f0f", 20, 0);
            this.boss.deathTimer = 3;
          }
        }
      }
    }

    // Enemy bullets → player (use circle hitbox)
    if (this.player.invTimer <= 0) {
      for (let bi = this.enemyBullets.active.length - 1; bi >= 0; bi--) {
        const bullet = this.enemyBullets.active[bi]!;
        if (circleRect(px, py, PLAYER_HITBOX_RADIUS, bullet.x, bullet.y, bullet.w, bullet.h)) {
          this.enemyBullets.release(bullet);
          this.damagePlayer();
        }
      }
      // Enemy body → player
      for (let ei = this.enemies.active.length - 1; ei >= 0; ei--) {
        const enemy = this.enemies.active[ei]!;
        if (aabb(playerBox, enemy)) {
          this.spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 8, DEATH_CHARS, "#f84", 120, 0.5);
          this.enemies.release(enemy);
          this.damagePlayer();
        }
      }
      // Boss body → player
      if (this.boss?.alive && this.boss.entered && aabb(playerBox, this.boss)) {
        this.damagePlayer();
      }
    }

    // Player → power-ups
    for (let pi = this.powerUps.active.length - 1; pi >= 0; pi--) {
      const pu = this.powerUps.active[pi]!;
      if (aabb(playerBox, pu)) {
        this.collectPowerUp(pu);
        this.powerUps.release(pu);
      }
    }
  }

  private onEnemyKilled(enemy: EnemyData): void {
    // Combo system
    this.comboCount++;
    this.comboTimer = COMBO_WINDOW;
    this.comboMultiplier = 1 + Math.floor(this.comboCount / 5) * 0.5;
    const points = Math.floor(enemy.score * this.comboMultiplier);
    this.score += points;

    const cx = enemy.x + enemy.w / 2;
    const cy = enemy.y + enemy.h / 2;
    this.spawnParticles(cx, cy, 14, DEATH_CHARS, "#f44", 200, 0.8);
    this.addShake(4);
    this.addFlash(0.1);
    this.audio.enemyDeath();
    this.triggerGlitch(0.5);

    // Combo banner
    if (this.comboCount > 1 && this.comboCount % 5 === 0) {
      this.spawnBanner(`COMBO x${this.comboMultiplier}!`, cx, cy - 15, "#ff0", 16, -45);
      this.queueNotif(`🔥 COMBO x${this.comboMultiplier} ! ${this.comboCount} kills !`);
    }

    // Power-up drop
    if (Math.random() < POWERUP_DROP_RATE) {
      this.spawnPowerUp(cx, cy);
    }
  }

  private collectPowerUp(pu: PowerUpData): void {
    this.player.activePowerUp = pu.type;
    this.player.powerTimer = 10; // 10 seconds
    this.player.shieldActive = pu.type === "shield";
    this.player.speedBoost = pu.type === "speed";

    if (pu.type === "bomb") {
      // Clear screen of enemies and bullets
      for (const e of this.enemies.active) {
        this.spawnParticles(e.x + e.w / 2, e.y + e.h / 2, 8, DEATH_CHARS, "#ff0", 120, 0.5);
        this.score += e.score;
        this.enemies.release(e);
      }
      this.enemyBullets.releaseAll();
      this.addShake(10);
      this.addFlash(0.4);
      this.audio.bomb();
      this.spawnBanner("💣 BOMBE ! 💣", GAME_W / 2, GAME_H / 2, "#ff0", 22, -30);
      this.player.activePowerUp = null;
      this.player.powerTimer = 0;
      return;
    }

    if (pu.type === "shield") {
      this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
    }

    if (pu.type === "option") {
      if (this.player.options.length < 2) {
        this.player.options.push({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
      }
    }

    this.audio.powerUp();
    this.spawnParticles(pu.x, pu.y, 10, ["⬆","🔥","⚡","💪"], "#ff0", 100, 0.5);
    this.spawnBanner(POWERUP_LABELS[pu.type], pu.x, pu.y - 10, "#ff0", 14, -40);
  }

  private damagePlayer(): void {
    if (this.player.invTimer > 0) return;

    if (this.player.shieldActive) {
      this.player.shieldActive = false;
      this.player.activePowerUp = null;
      this.player.powerTimer = 0;
      this.spawnBanner("🛡️ SHIELD BROKEN!", this.player.x + this.player.w / 2, this.player.y - 15, "#0ff", 14, -40);
      this.spawnParticles(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 10, SPARK_CHARS, "#0ff", 100, 0.4);
      this.audio.enemyHit();
      return;
    }

    this.player.health--;
    this.player.invTimer = PLAYER_INVINCIBLE_TIME;

    // Lose power-up on hit
    if (this.player.activePowerUp) {
      this.player.activePowerUp = null;
      this.player.powerTimer = 0;
      this.player.speedBoost = false;
      this.spawnBanner("POWER LOST !", this.player.x, this.player.y - 10, "#f44", 13, -35);
    }

    this.spawnParticles(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 15, SPARK_CHARS, "#f00", 160, 0.5);
    this.addShake(8);
    this.addFlash(0.2);
    this.addHitstop(0.05);
    this.triggerGlitch(1.2);
    this.audio.playerHit();
    this.queueNotif(pick(["Aïe.","Secteur endommagé.","Segment corrompu.","Buffer overflow.","🖕 Windows vous a touché."]));

    if (this.player.health <= 0) {
      this.gameOver("💀 CRASH SYSTEMATIQUE 💀");
    }
  }

  private gameOver(message: string): void {
    this.state = "gameover";
    this.spawnParticles(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 40, DEATH_CHARS, "#f00", 280, 1.0);
    this.addShake(12);
    this.addFlash(0.5);
    this.addHitstop(0.1);
    this.triggerGlitch(3);
    this.bullets.releaseAll();
    this.enemyBullets.releaseAll();
    this.enemies.releaseAll();
    this.powerUps.releaseAll();
    this.banners = [];
    this.boss = null;
    this.queueNotif(message);
    this.spawnBanner(message, GAME_W / 2, GAME_H / 2, "#f00", 20, 0);
    this.cfg.onLose?.(this.score);
  }

  private victory(): void {
    this.state = "victory";
    this.queueNotif("🏆 SYSTÈME NETTOYÉ — GunthOS est (temporairement) stable ! 🖕");
    this.cfg.onWin?.(this.score);
  }

  // ================================================================
  // RENDER
  // ================================================================
  private render(): void {
    const ctx = this.ctx;

    // Clear full canvas in device-pixel space (game transform set via resize)
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();

    ctx.save();

    if (this.shakeAmt > 0.1) {
      ctx.translate((Math.random() - 0.5) * this.shakeAmt * 2.5, (Math.random() - 0.5) * this.shakeAmt * 2.5);
    }
    if (this.glitchTimer > 0) {
      ctx.translate(this.glitchX, this.glitchY);
    }

    switch (this.state) {
      case "title":
        this.renderBackground(ctx);
        this.renderParticles(ctx);
        this.renderTitle(ctx);
        break;
      case "waveIntro":
        this.renderBackground(ctx);
        this.renderParticles(ctx);
        this.renderWaveIntro(ctx);
        break;
      case "playing":
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
        break;
      case "gameover":
        this.renderBackground(ctx);
        this.renderParticles(ctx);
        this.renderBanners(ctx);
        this.renderEndScreen(ctx, "💀 CRASH SYSTEMATIQUE 💀", "#f44");
        break;
      case "victory":
        this.renderBackground(ctx);
        this.renderParticles(ctx);
        this.renderBanners(ctx);
        this.renderEndScreen(ctx, "🏆 SYSTÈME NETTOYÉ 🏆", "#4f4");
        break;
    }

    // Flash overlay
    if (this.flashAlpha > 0.01) {
      ctx.fillStyle = `rgba(255,255,255,${this.flashAlpha})`;
      ctx.fillRect(0, 0, GAME_W, GAME_H);
    }

    // Boss rage red vignette
    if (this.boss?.alive && this.boss.phase >= 3) {
      const a = 0.05 + Math.sin(performance.now() / 80) * 0.03;
      ctx.fillStyle = `rgba(255,0,0,${a})`;
      ctx.fillRect(0, 0, GAME_W, GAME_H);
    }

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    // Dark space background
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_H);
    grad.addColorStop(0, "#020210");
    grad.addColorStop(0.5, "#0a0a1e");
    grad.addColorStop(1, "#0d0d28");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    // Grid lines scrolling downward
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    const gs = 48;
    const oy = this.bgScroll % gs;
    for (let y = -gs + oy; y < GAME_H + gs; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(GAME_W, y); ctx.stroke();
    }

    // Vertical lines
    for (let x = 0; x < GAME_W; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GAME_H); ctx.stroke();
    }

    // Stars
    for (const s of this.stars) {
      const alpha = 0.2 + s.brightness * 0.5;
      ctx.fillStyle = `rgba(200,220,255,${alpha})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }

    // Occasional "data" particles in background
    const now = performance.now() / 1000;
    ctx.fillStyle = "rgba(0,255,100,0.06)";
    ctx.font = "9px monospace";
    for (let i = 0; i < 6; i++) {
      const dx = ((i * 97 + 31) + now * 25) % GAME_W;
      const dy = ((i * 73 + 17) + now * 35) % GAME_H;
      ctx.fillText(["0101","0xFF","SYS","RAM","98","DOS"][i]!, dx, dy);
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D): void {
    if (this.player.invTimer > 0 && Math.floor(this.player.invTimer * 18) % 2 === 0) return;

    const { x, y, w, h } = this.player;
    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Engine glow
    const glowAlpha = 0.2 + Math.random() * 0.2;
    ctx.fillStyle = `rgba(0,200,255,${glowAlpha})`;
    ctx.fillRect(-8, h / 2, 16, 8);

    // Ship body (triangle pointing up)
    ctx.fillStyle = "#e0e0e0";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(w / 2, h / 2);
    ctx.lineTo(-w / 2, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Accent lines
    ctx.strokeStyle = "#0cf";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-6, -h / 4); ctx.lineTo(6, -h / 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.stroke();

    // Shield visual
    if (this.player.shieldActive) {
      const pulse = 1 + Math.sin(performance.now() / 100) * 0.15;
      ctx.strokeStyle = "rgba(0,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, (h / 2 + 6) * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Option drones
    for (const opt of this.player.options) {
      ctx.fillStyle = "#0cf";
      ctx.fillRect(opt.offsetX - 3, opt.offsetY - 3, 6, 6);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.strokeRect(opt.offsetX - 3, opt.offsetY - 3, 6, 6);
    }

    ctx.restore();

    // Hitbox indicator (subtle)
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, PLAYER_HITBOX_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
  }

  private renderEnemies(ctx: CanvasRenderingContext2D): void {
    for (const e of this.enemies.active) {
      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h / 2);

      // Flash on hit
      if (e.flashTimer > 0) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(-e.w / 2 - 2, -e.h / 2 - 2, e.w + 4, e.h + 4);
      }

      // DLL shield ring
      if (e.enemyType === "dll") {
        const shieldPulse = 1 + Math.sin(e.phaseTimer * 4) * 0.1;
        ctx.strokeStyle = "rgba(255,200,50,0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, (e.w / 2 + 4) * shieldPulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Emoji
      ctx.fillStyle = "#fff";
      ctx.font = `${e.h * 0.7}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(e.emoji, 0, 1);

      // HP bar for multi-HP enemies
      if (e.maxHp > 3) {
        const bw = e.w;
        const bh = 4;
        ctx.fillStyle = "#333";
        ctx.fillRect(-bw / 2, -e.h / 2 - bh - 2, bw, bh);
        ctx.fillStyle = e.hp / e.maxHp > 0.3 ? "#4f4" : "#f44";
        ctx.fillRect(-bw / 2, -e.h / 2 - bh - 2, bw * (e.hp / e.maxHp), bh);
      }

      ctx.restore();
    }
  }

  private renderBullets(ctx: CanvasRenderingContext2D): void {
    for (const b of this.bullets.active) {
      if (b.piercing) {
        // Laser beam
        const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y - 40);
        grad.addColorStop(0, "rgba(255,100,0,0.9)");
        grad.addColorStop(0.5, "rgba(255,200,0,0.6)");
        grad.addColorStop(1, "rgba(255,255,0,0.1)");
        ctx.fillStyle = grad;
        ctx.fillRect(b.x - 2, b.y - 40, 4, 44);
      } else {
        ctx.fillStyle = "#ff0";
        ctx.shadowColor = "#ff0";
        ctx.shadowBlur = 4;
        ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
        ctx.shadowBlur = 0;
      }
    }
  }

  private renderEnemyBullets(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#f44";
    ctx.shadowColor = "#f44";
    ctx.shadowBlur = 3;
    for (const b of this.enemyBullets.active) {
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  private renderBoss(ctx: CanvasRenderingContext2D): void {
    const b = this.boss;
    if (!b || !b.alive) return;
    const { x, y, w, h } = b;

    // Win98 window frame
    ctx.fillStyle = "#c0c0c0";
    ctx.fillRect(x, y, w, h);

    // Title bar
    const tbH = 24;
    const grad = ctx.createLinearGradient(x, y, x, y + tbH);
    grad.addColorStop(0, "#000080");
    grad.addColorStop(1, "#0000c0");
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, tbH);

    // Close button
    ctx.fillStyle = "#c0c0c0";
    ctx.fillRect(x + w - 22, y + 3, 18, 18);
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText("✕", x + w - 13, y + 16);

    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Windows Update (Critical)", x + 6, y + 17);

    // Body
    ctx.fillStyle = "#ece9d8";
    ctx.fillRect(x + 3, y + tbH + 3, w - 6, h - tbH - 6);

    ctx.fillStyle = "#000";
    ctx.font = "10px monospace";
    ctx.fillText("Installation des mises à jour...", x + 10, y + tbH + 20);
    ctx.fillText("N'éteignez PAS votre ordinateur.", x + 10, y + tbH + 35);

    // Progress bar
    const bx = x + 10, by = y + tbH + 48, bw = w - 20, bh = 16;
    ctx.fillStyle = "#fff";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "#808080";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    const progressColor = b.updateProgress > 70 ? "#f44" : "#000080";
    ctx.fillStyle = progressColor;
    ctx.fillRect(bx + 2, by + 2, (bw - 4) * Math.min(1, b.updateProgress / 100), bh - 4);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.floor(b.updateProgress)}% complété`, bx + bw / 2, by + bh / 2 + 3);

    // Phase indicator
    const phaseNames = ["Phase 1: Bouclier", "Phase 2: Invocations", "Phase 3: Patterns", "Phase 4: RAGE"];
    ctx.fillStyle = "#f00";
    ctx.font = "bold 9px monospace";
    ctx.fillText(phaseNames[b.phase] ?? "", bx + bw / 2, by + bh + 14);

    // Boss HP bar at top
    const hpW = w;
    const hpH = 8;
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y - hpH - 6, hpW, hpH);
    const hpRatio = b.hp / b.maxHp;
    const hpColor = hpRatio > 0.5 ? "#4f4" : hpRatio > 0.25 ? "#ff0" : "#f44";
    ctx.fillStyle = hpColor;
    ctx.fillRect(x, y - hpH - 6, hpW * hpRatio, hpH);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`BOSS — ${Math.ceil(b.hp)}/${b.maxHp} PV`, x, y - hpH - 9);

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
    const icons: Record<PowerUpType, string> = {
      shotgun: "💥", laser: "⚡", bomb: "💣", shield: "🛡️", speed: "💨", option: "🛸",
    };
    for (const p of this.powerUps.active) {
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      const pulse = 1 + Math.sin(p.pulsePhase) * 0.15;
      ctx.scale(pulse, pulse);
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "#ff0";
      ctx.shadowBlur = 8;
      ctx.font = `${p.w}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(icons[p.type] ?? "?", 0, 0);
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
      ctx.shadowBlur = 3;
      ctx.fillText(b.text, b.x, b.y);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  private renderGlitchLines(ctx: CanvasRenderingContext2D): void {
    for (const gl of this.glitchLines) {
      ctx.save();
      ctx.globalAlpha = gl.alpha;
      ctx.fillStyle = "#0ff";
      ctx.fillRect(gl.offset, gl.y, 40, gl.h);
      ctx.fillStyle = "#f0f";
      ctx.fillRect(gl.offset + 4, gl.y + 1, 28, gl.h - 2);
      ctx.restore();
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    const padX = 10;
    const padY = 10;

    // Score (top-right)
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, GAME_W - padX, padY + 14);

    // Combo (below score)
    if (this.comboMultiplier > 1) {
      ctx.fillStyle = "#ff0";
      ctx.font = "bold 10px monospace";
      ctx.fillText(`COMBO x${this.comboMultiplier}`, GAME_W - padX, padY + 28);
    }

    // Wave
    ctx.fillStyle = "#aaa";
    ctx.font = "9px monospace";
    ctx.fillText(`VAGUE ${this.wave}`, GAME_W - padX, padY + 40);

    // HP bar (top-left)
    const hbW = 140, hbH = 12;
    ctx.fillStyle = "#222";
    ctx.fillRect(padX, padY, hbW, hbH);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1;
    ctx.strokeRect(padX, padY, hbW, hbH);
    const hpR = this.player.health / this.player.maxHealth;
    ctx.fillStyle = hpR > 0.5 ? "#4f4" : hpR > 0.25 ? "#ff0" : "#f44";
    ctx.fillRect(padX + 1, padY + 1, (hbW - 2) * hpR, hbH - 2);
    ctx.fillStyle = "#fff";
    ctx.font = "8px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`⚡ ${this.player.health}/${this.player.maxHealth}`, padX + 4, padY + 10);

    // Active power-up (below HP)
    if (this.player.activePowerUp) {
      ctx.fillStyle = "#0ff";
      ctx.font = "bold 9px monospace";
      ctx.fillText(`${POWERUP_LABELS[this.player.activePowerUp]} ${this.player.powerTimer.toFixed(1)}s`, padX, padY + hbH + 14);
    }

    ctx.textAlign = "start";
  }

  private renderTitle(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.min(32, GAME_W * 0.065)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("dragmenteur.exe", GAME_W / 2, GAME_H * 0.18);

    ctx.fillStyle = "#0ff";
    ctx.font = `${Math.min(14, GAME_W * 0.028)}px monospace`;
    ctx.fillText("The Bloatware Purge v3.0", GAME_W / 2, GAME_H * 0.18 + 32);

    // Ship decoration
    ctx.fillStyle = "#aaa";
    ctx.font = "28px serif";
    ctx.fillText("🛸", GAME_W / 2, GAME_H * 0.18 + 70);

    const blink = Math.sin(this.titleBlink * 3) > 0;
    if (blink) {
      ctx.fillStyle = "#fff";
      ctx.font = `${Math.min(16, GAME_W * 0.032)}px monospace`;
      ctx.fillText("ESPACE ou CLIC pour DÉFRAGMENTER", GAME_W / 2, GAME_H * 0.55);
    }

    ctx.fillStyle = "#666";
    ctx.font = `${Math.min(11, GAME_W * 0.022)}px monospace`;
    ctx.fillText("↑↓←→ / ZQSD = Déplacer", GAME_W / 2, GAME_H * 0.68);
    ctx.fillText("Souris = Suivre   |   Clic = Tirer", GAME_W / 2, GAME_H * 0.73);
    ctx.fillText("Mobile = Touch & Drag (auto-fire)", GAME_W / 2, GAME_H * 0.78);
    ctx.fillText("Tuez vite = COMBO ! 💥", GAME_W / 2, GAME_H * 0.83);

    ctx.fillStyle = "#444";
    ctx.font = "9px monospace";
    ctx.fillText("v3.1.0 — Édition VERTICALE (résolution fixe 480x700)", GAME_W / 2, GAME_H - 12);
    ctx.textAlign = "start";
  }

  private renderWaveIntro(ctx: CanvasRenderingContext2D): void {
    const blink = Math.sin(this.titleBlink * 4) > 0;
    if (!blink) return;
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.min(24, GAME_W * 0.05)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`VAGUE ${this.wave}`, GAME_W / 2, GAME_H * 0.35);
    ctx.fillStyle = "#0ff";
    ctx.font = `${Math.min(13, GAME_W * 0.026)}px monospace`;
    ctx.fillText(this.waveMessage, GAME_W / 2, GAME_H * 0.45);
    ctx.textAlign = "start";
  }

  private renderEndScreen(ctx: CanvasRenderingContext2D, title: string, color: string): void {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    ctx.fillStyle = color;
    ctx.font = `bold ${Math.min(28, GAME_W * 0.055)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(title, GAME_W / 2, GAME_H * 0.3);

    ctx.fillStyle = "#fff";
    ctx.font = `${Math.min(18, GAME_W * 0.035)}px monospace`;
    ctx.fillText(`Score final : ${this.score.toLocaleString()}`, GAME_W / 2, GAME_H * 0.42);

    const blink = Math.sin(this.titleBlink * 3) > 0;
    if (blink) {
      ctx.fillStyle = "#aaa";
      ctx.font = `${Math.min(13, GAME_W * 0.025)}px monospace`;
      ctx.fillText("ESPACE pour recommencer", GAME_W / 2, GAME_H * 0.55);
    }
    ctx.textAlign = "start";
  }
}
