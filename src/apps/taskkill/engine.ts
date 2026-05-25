// ====================================================================
// TASKKILL.EXE — The Bloatware Purge
// Moteur de jeu Shmup horizontal pour GunthOS
// "Object pooling, deltaTime, zéro GC — parce que le navigateur
//  a déjà assez de fuites mémoire comme ça."
// ====================================================================

// --- Configuration d'entrée ---
export interface EngineConfig {
  /** Secoue le conteneur parent (intensité 0–10) */
  onShake?: (intensity: number) => void;
  /** Toast de notification sarcastique */
  onNotify?: (message: string) => void;
  /** Game over — score final */
  onGameOver?: (score: number, wave: number) => void;
}

// ====================================================================
// TYPES
// ====================================================================
type EnemyType = "folder" | "loading" | "cookie" | "clippy" | "error";
type GameState = "title" | "playing" | "waveIntro" | "gameover" | "victory";

interface Poolable {
  alive: boolean;
}

interface BulletData extends Poolable {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  damage: number;
  isPlayerBullet: boolean;
}

interface ParticleData extends Poolable {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  char: string;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

interface EnemyData extends Poolable {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  enemyType: EnemyType;
  score: number;
  canShoot: boolean;
  fireTimer: number;
  fireRate: number;
  phase: number;
  phaseTimer: number;
  flashTimer: number;
  emoji: string;
  baseY: number;
}

interface BossData {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  phase: number;
  fireTimer: number;
  fireRate: number;
  moveTimer: number;
  targetY: number;
  alive: boolean;
  entered: boolean;
  driftVx: number;
  deathTimer: number;
}

// ====================================================================
// CONSTANTES
// ====================================================================
const ENEMY_DEFS: Record<
  EnemyType,
  { hp: number; speed: number; score: number; canShoot: boolean; emoji: string; w: number; h: number; fireRate: number }
> = {
  folder:  { hp: 1, speed: 90,  score: 100, canShoot: false, emoji: "📁", w: 32, h: 32, fireRate: 0 },
  loading: { hp: 2, speed: 55,  score: 200, canShoot: false, emoji: "⏳", w: 44, h: 22, fireRate: 0 },
  cookie:  { hp: 1, speed: 130, score: 175, canShoot: false, emoji: "🍪", w: 28, h: 28, fireRate: 0 },
  clippy:  { hp: 2, speed: 70,  score: 300, canShoot: true,  emoji: "📎", w: 30, h: 30, fireRate: 1.8 },
  error:   { hp: 4, speed: 40,  score: 350, canShoot: false, emoji: "⚠️", w: 54, h: 42, fireRate: 0 },
};

const PLAYER_SPEED = 360;
const PLAYER_FIRE_RATE = 0.13;
const PLAYER_MAX_HEALTH = 5;
const PLAYER_INVINCIBLE_TIME = 1.5;
const BULLET_SPEED = 700;
const ENEMY_BULLET_SPEED = 230;
const HITSTOP_DURATION = 0.03;
const PARTICLE_GRAVITY = 160;

const DEATH_CHARS = ["✕", "▓", "☠", "💀", "⚠", "⊕", "∅", "404", "0xDEAD", "SEGV", "null", "🗑️", "💥", "🤡", "ERR"];
const SPARK_CHARS = ["·", "∗", "✦", "□", "■"];
const BOSS_CHARS = ["CRASH", "DUMP", "FATAL", "0x0F", "HALT", "☠", "💀", "BSOD"];

const WAVE_CONFIG = [
  { name: "Nettoyage de dossiers temporaires", types: { folder: 8 } },
  { name: "Barres de chargement infinies détectées", types: { folder: 5, loading: 5 } },
  { name: "Invasion de cookies publicitaires", types: { cookie: 9, folder: 3 } },
  { name: "L'Assistant Clippy™ se rebelle", types: { clippy: 5, loading: 3, error: 3 } },
  { name: "MISE À JOUR CRITIQUE — Windows Update.exe", types: {}, boss: true },
];

const GUNTHOS_NOTIFS = [
  "Vous venez de détruire System32. Bravo. J'espère que vous êtes fier.",
  "Astuce : Les pop-ups 'Vous avez gagné un iPhone' ont 300 PV. Bonne chance.",
  "Mémoire RAM insuffisante pour votre ego. Réduction de la cadence de tir.",
  "DLL manquante : self_control.dll — le tir continu est activé par défaut.",
  "Le Gestionnaire des Tâches observe vos performances. Il n'est pas impressionné.",
  "Erreur 418 : Je suis une théière. Et vous, vous êtes mauvais.",
  "Conseil technique : esquiver les balles réduit les dégâts. Incroyable, non ?",
  "Votre curseur a été déplacé. Raison : incompétence.",
  "BSOD imminent. Profitez du spectacle.",
  "Défragmentation de votre style de jeu... 0% complété.",
];

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
// INPUT MANAGER — état des touches, pas d'Event par frame
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

  isDown(key: string): boolean {
    return this.keys.has(key);
  }

  wasPressed(key: string): boolean {
    return this.justPressed.has(key);
  }

  clearFrame(): void {
    this.justPressed.clear();
  }

  destroy(): void {
    window.removeEventListener("keydown", this.onKD);
    window.removeEventListener("keyup", this.onKU);
    window.removeEventListener("blur", this.onBlur);
    this.keys.clear();
    this.justPressed.clear();
  }
}

// ====================================================================
// AUDIO SYSTEM — Web Audio API procédural
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
    } catch {
      // Muet — l'utilisateur survit sans l'expérience auditive complète
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
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.01);
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
    s.connect(g);
    g.connect(this.master);
    s.start();
    s.stop(this.ctx.currentTime + dur + 0.01);
  }

  shoot(): void {
    this.tone(880, 0.05, "square", 0.04);
  }
  enemyHit(): void {
    this.tone(160, 0.08, "sawtooth", 0.06);
  }
  enemyDeath(): void {
    this.tone(55, 0.2, "sawtooth", 0.1);
    this.noise(0.12, 0.05);
  }
  playerHit(): void {
    this.tone(70, 0.2, "sawtooth", 0.14);
    this.noise(0.1, 0.08);
    this.tone(200, 0.06, "square", 0.05, 0.08);
    this.tone(140, 0.06, "square", 0.05, 0.16);
  }
  bossHit(): void {
    this.tone(35, 0.25, "sawtooth", 0.15);
    this.noise(0.15, 0.08);
  }
  bossDeath(): void {
    this.tone(25, 0.5, "sawtooth", 0.18);
    this.noise(0.35, 0.12);
    this.tone(18, 0.3, "square", 0.1, 0.25);
  }
  waveStart(): void {
    this.tone(330, 0.08, "square", 0.05);
    this.tone(440, 0.08, "square", 0.05, 0.1);
    this.tone(660, 0.12, "square", 0.05, 0.2);
  }

  destroy(): void {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.master = null;
      this.ready = false;
    }
  }
}

// ====================================================================
// HELPER — random range, AABB
// ====================================================================
function rnd(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function aabb(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// ====================================================================
// TASKKILL ENGINE — moteur principal
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

  // Joueur
  private player = {
    x: 80, y: 250, w: 34, h: 30,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    invTimer: 0,
    fireTimer: 0,
    powerLevel: 1,
  };

  // Boss
  private boss: BossData | null = null;

  // État
  private state: GameState = "title";
  private score = 0;
  private wave = 0;
  private waveEnemiesLeft = 0;
  private waveSpawnTimer = 0;
  private waveCooldown = 0;
  private waveMessage = "";
  private waveMessageTimer = 0;

  // Scrolling
  private bgOffset = 0;

  // Effets
  private shakeAmt = 0;
  private shakeDur = 0;
  private hitstop = 0;
  private flashAlpha = 0;

  // Notifications
  private notifQueue: { msg: string; timer: number }[] = [];
  private notifTimer = 0;
  private notifIdx = 0;

  // Boucle
  private rafId = 0;
  private lastT = 0;
  private running = false;
  private titleBlink = 0;

  // Étoiles de fond
  private stars: { x: number; y: number; r: number; speed: number }[] = [];

  constructor(canvas: HTMLCanvasElement, config: EngineConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.cfg = config;
    this.input = new InputManager();
    this.audio = new AudioSystem();
    this.resize();

    // Init pools
    const makeBullet = (): BulletData => ({ x: 0, y: 0, vx: 0, vy: 0, w: 6, h: 3, damage: 1, isPlayerBullet: true, alive: false });
    const resetBullet = (b: BulletData) => { b.x = 0; b.y = 0; b.vx = 0; b.vy = 0; b.damage = 1; b.isPlayerBullet = true; };
    this.bullets = new Pool(makeBullet, resetBullet, 120);
    this.enemyBullets = new Pool(makeBullet, resetBullet, 80);

    const makeParticle = (): ParticleData => ({
      x: 0, y: 0, vx: 0, vy: 0, life: 1, maxLife: 1,
      char: "·", color: "#fff", size: 14, rotation: 0, rotationSpeed: 0, alive: false,
    });
    const resetParticle = (p: ParticleData) => {
      p.x = 0; p.y = 0; p.vx = 0; p.vy = 0;
      p.life = 1; p.maxLife = 1; p.char = "·"; p.color = "#fff";
      p.size = 14; p.rotation = 0; p.rotationSpeed = 0;
    };
    this.particles = new Pool(makeParticle, resetParticle, 300);

    const makeEnemy = (): EnemyData => ({
      x: 0, y: 0, w: 32, h: 32, vx: 0, vy: 0,
      hp: 1, maxHp: 1, enemyType: "folder", score: 100,
      canShoot: false, fireTimer: 0, fireRate: 0,
      phase: 0, phaseTimer: 0, flashTimer: 0,
      emoji: "📁", baseY: 0, alive: false,
    });
    const resetEnemy = (e: EnemyData) => {
      e.x = 0; e.y = 0; e.w = 32; e.h = 32; e.vx = 0; e.vy = 0;
      e.hp = 1; e.maxHp = 1; e.enemyType = "folder"; e.score = 100;
      e.canShoot = false; e.fireTimer = 0; e.fireRate = 0;
      e.phase = 0; e.phaseTimer = 0; e.flashTimer = 0;
      e.emoji = "📁"; e.baseY = 0;
    };
    this.enemies = new Pool(makeEnemy, resetEnemy, 40);

    // Étoiles
    for (let i = 0; i < 60; i++) {
      this.stars.push({ x: rnd(0, this.W), y: rnd(0, this.H), r: rnd(0.5, 2), speed: rnd(20, 70) });
    }
  }

  // ---- Redimensionnement ----
  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.W = rect.width;
    this.H = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.player.y > this.H) this.player.y = this.H / 2;
  }

  // ---- Boucle principale ----
  start(): void {
    if (this.running) return;
    // Refuse de démarrer si le canvas n'a pas de dimensions
    if (this.W <= 0 || this.H <= 0) {
      this.resize();
      if (this.W <= 0 || this.H <= 0) {
        console.error("[TASKKILL] Canvas has zero dimensions, refusing to start.");
        this.cfg.onNotify?.("💀 ERREUR: Impossible d'initialiser le rendu. Canvas invalide.");
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
    this.notifQueue = [];
    this.queueNotif("TASKKILL.EXE chargé. Prêt à purger la bloatware.");
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  destroy(): void {
    this.stop();
    this.input.destroy();
    this.audio.destroy();
  }

  // ---- Notifications sarcastiques ----
  private queueNotif(msg: string): void {
    this.notifQueue.push({ msg, timer: 3.5 });
    if (this.notifQueue.length > 6) this.notifQueue.shift();
    this.cfg.onNotify?.(msg);
  }

  private maybeSnark(): void {
    if (Math.random() < 0.001 && this.notifQueue.length < 3) {
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
    this.player.powerLevel = 1;
  }

  // ---- Effets ----
  private addShake(intensity: number): void {
    this.shakeAmt = Math.max(this.shakeAmt, intensity);
    this.shakeDur = Math.max(this.shakeDur, 0.2);
    this.cfg.onShake?.(intensity);
  }

  private addHitstop(dur = HITSTOP_DURATION): void {
    this.hitstop = Math.max(this.hitstop, dur);
  }

  private addFlash(alpha = 0.15): void {
    this.flashAlpha = Math.max(this.flashAlpha, alpha);
  }

  // ---- Particules ----
  private spawnParticles(x: number, y: number, count: number, chars: readonly string[], color: string, spread = 180, life = 0.7): void {
    for (let i = 0; i < count; i++) {
      const p = this.particles.acquire();
      p.x = x;
      p.y = y;
      const angle = rnd(0, Math.PI * 2);
      const speed = rnd(40, spread);
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.maxLife = rnd(life * 0.6, life);
      p.life = p.maxLife;
      p.char = pick(chars);
      p.color = color;
      p.size = rnd(10, 24);
      p.rotation = rnd(0, Math.PI * 2);
      p.rotationSpeed = rnd(-8, 8);
    }
  }

  private spawnEnemyBullet(x: number, y: number, vx: number, vy: number): void {
    const b = this.enemyBullets.acquire();
    b.x = x;
    b.y = y;
    b.vx = vx;
    b.vy = vy;
    b.w = 8;
    b.h = 4;
    b.damage = 1;
    b.isPlayerBullet = false;
  }

  // ---- Vague ----
  private startWave(): void {
    this.wave++;
    if (this.wave > WAVE_CONFIG.length) {
      // Victoire — toutes les vagues complétées
      this.state = "victory";
      this.queueNotif("Toutes les menaces éliminées. GunthOS est... stable ? Impossible.");
      return;
    }

    const cfg = WAVE_CONFIG[this.wave - 1]!;
    if (cfg.boss) {
      this.state = "playing";
      this.spawnBoss();
      this.queueNotif("⚠️ MISE À JOUR CRITIQUE : Windows Update force l'installation...");
      return;
    }

    this.waveMessage = `VAGUE ${this.wave} — ${cfg.name}`;
    this.waveMessageTimer = 1.8;
    this.state = "waveIntro";
    this.audio.waveStart();

    // Calculer les ennemis à spawn
    let total = 0;
    for (const [, count] of Object.entries(cfg.types)) {
      total += count as number;
    }
    this.waveEnemiesLeft = total;
    this.waveSpawnTimer = 0.6;
    this.waveCooldown = 0;

    // Build spawn queue
    const queue: EnemyType[] = [];
    for (const [type, count] of Object.entries(cfg.types)) {
      for (let i = 0; i < (count as number); i++) queue.push(type as EnemyType);
    }
    // Shuffle
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j]!, queue[i]!];
    }
    (this as any)._spawnQueue = queue;
  }

  private spawnNextEnemy(): void {
    const queue = (this as any)._spawnQueue as EnemyType[] | undefined;
    if (!queue || queue.length === 0) return;
    const type = queue.pop()!;
    const def = ENEMY_DEFS[type];

    const e = this.enemies.acquire();
    e.enemyType = type;
    e.emoji = def.emoji;
    e.w = def.w;
    e.h = def.h;
    e.hp = def.hp + Math.floor(this.wave * 0.4);
    e.maxHp = e.hp;
    e.score = def.score;
    e.canShoot = def.canShoot;
    e.fireRate = def.fireRate;
    e.fireTimer = rnd(0.5, e.fireRate);
    e.x = this.W + rnd(10, 60);
    e.y = rnd(30, this.H - e.h - 30);
    e.baseY = e.y;
    e.vx = -def.speed * rnd(0.85, 1.15);
    e.vy = 0;
    e.phase = rnd(0, Math.PI * 2);
    e.phaseTimer = 0;
    e.flashTimer = 0;
    this.waveEnemiesLeft--;
  }

  // ---- Boss ----
  private spawnBoss(): void {
    this.boss = {
      x: this.W + 20,
      y: this.H / 2 - 50,
      w: 140,
      h: 100,
      hp: 60 + this.wave * 20,
      maxHp: 60 + this.wave * 20,
      phase: 0,
      fireTimer: 0,
      fireRate: 0.7,
      moveTimer: 0,
      targetY: this.H / 2 - 50,
      alive: true,
      entered: false,
      driftVx: 0,
      deathTimer: 0,
    };
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
      this.cfg.onNotify?.("💀 BSOD : La boucle de jeu a planté. kernel panic.");
      return;
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    // Shake decay
    if (this.shakeDur > 0) {
      this.shakeDur -= dt;
      if (this.shakeDur <= 0) this.shakeAmt = 0;
      else this.shakeAmt *= 0.9;
    }
    // Flash decay
    if (this.flashAlpha > 0) this.flashAlpha = Math.max(0, this.flashAlpha - dt * 3);
    // Wave message timer
    if (this.waveMessageTimer > 0) this.waveMessageTimer -= dt;

    // Notifications
    for (let i = this.notifQueue.length - 1; i >= 0; i--) {
      this.notifQueue[i]!.timer -= dt;
      if (this.notifQueue[i]!.timer <= 0) this.notifQueue.splice(i, 1);
    }

    switch (this.state) {
      case "title":
        this.updateTitle(dt);
        break;
      case "waveIntro":
        this.updateWaveIntro(dt);
        break;
      case "playing":
        this.updatePlaying(dt);
        break;
      case "gameover":
      case "victory":
        this.updateEnd(dt);
        break;
    }
  }

  private updateTitle(dt: number): void {
    this.titleBlink += dt;
    this.bgOffset += 40 * dt;
    this.updateParticles(dt);
    this.maybeSnark();

    if (this.input.wasPressed(" ")) {
      this.audio.init();
      this.state = "playing";
      this.score = 0;
      this.wave = 0;
      this.boss = null;
      this.bullets.releaseAll();
      this.enemyBullets.releaseAll();
      this.enemies.releaseAll();
      this.particles.releaseAll();
      this.resetPlayer();
      this.startWave();
      this.queueNotif("Formatage du disque dur en cours... Vous avez été prévenu.");
    }
  }

  private updateWaveIntro(dt: number): void {
    this.bgOffset += 40 * dt;
    this.updateParticles(dt);
    if (this.waveMessageTimer <= 0) {
      this.state = "playing";
    }
  }

  private updatePlaying(dt: number): void {
    this.bgOffset += 60 * dt;
    this.updatePlayer(dt);
    this.updateBullets(dt);
    this.updateEnemyBullets(dt);
    this.updateEnemies(dt);
    this.updateBoss(dt);
    this.updateParticles(dt);
    this.checkCollisions();
    this.updateSpawning(dt);
    this.maybeSnark();

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
      // Restart
      this.state = "title";
      this.score = 0;
      this.wave = 0;
      this.boss = null;
      this.bullets.releaseAll();
      this.enemyBullets.releaseAll();
      this.enemies.releaseAll();
      this.particles.releaseAll();
      this.resetPlayer();
      this.queueNotif("Redémarrage du système... Courage, fuyons.");
    }
  }

  private updatePlayer(dt: number): void {
    let dx = 0, dy = 0;
    if (this.input.isDown("ArrowLeft") || this.input.isDown("q") || this.input.isDown("Q")) dx = -1;
    if (this.input.isDown("ArrowRight") || this.input.isDown("d") || this.input.isDown("D")) dx = 1;
    if (this.input.isDown("ArrowUp") || this.input.isDown("z") || this.input.isDown("Z") || this.input.isDown("w") || this.input.isDown("W")) dy = -1;
    if (this.input.isDown("ArrowDown") || this.input.isDown("s") || this.input.isDown("S")) dy = 1;

    // Normaliser la diagonale
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    this.player.x += dx * PLAYER_SPEED * dt;
    this.player.y += dy * PLAYER_SPEED * dt;

    // Clamp
    this.player.x = Math.max(5, Math.min(this.W - this.player.w - 5, this.player.x));
    this.player.y = Math.max(5, Math.min(this.H - this.player.h - 5, this.player.y));

    // Invincibilité
    if (this.player.invTimer > 0) this.player.invTimer -= dt;

    // Tir
    this.player.fireTimer -= dt;
    if ((this.input.isDown(" ") || this.input.isDown("Control")) && this.player.fireTimer <= 0) {
      this.firePlayerBullet();
      this.player.fireTimer = PLAYER_FIRE_RATE;
    }
    // Tir simple au clic rapide (wasPressed depuis la dernière frame)
    if (this.input.wasPressed(" ") && this.player.fireTimer > PLAYER_FIRE_RATE * 0.5) {
      this.player.fireTimer = 0;
    }
  }

  private firePlayerBullet(): void {
    const b = this.bullets.acquire();
    b.x = this.player.x + this.player.w;
    b.y = this.player.y + this.player.h / 2 - 1.5;
    b.vx = BULLET_SPEED;
    b.vy = 0;
    b.w = 8;
    b.h = 3;
    b.damage = 1;
    b.isPlayerBullet = true;
    this.audio.shoot();

    // Double tir si powerLevel >= 2
    if (this.player.powerLevel >= 2) {
      const b2 = this.bullets.acquire();
      b2.x = this.player.x + this.player.w - 4;
      b2.y = this.player.y + this.player.h / 2 - 8;
      b2.vx = BULLET_SPEED;
      b2.vy = -30;
      b2.w = 6;
      b2.h = 3;
      b2.damage = 1;
      b2.isPlayerBullet = true;
    }
  }

  private updateBullets(dt: number): void {
    for (let i = this.bullets.active.length - 1; i >= 0; i--) {
      const b = this.bullets.active[i]!;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x > this.W + 20 || b.x < -20 || b.y > this.H + 20 || b.y < -20) {
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

      // Mouvement par type
      switch (e.enemyType) {
        case "folder":
          e.y = e.baseY + Math.sin(e.phaseTimer * 3) * 35;
          break;
        case "loading":
          // Ligne droite, lent
          break;
        case "cookie":
          // Erratique — change de direction périodiquement
          if (e.phaseTimer > 0.6) {
            e.phaseTimer = 0;
            e.vy = rnd(-90, 90);
          }
          break;
        case "clippy":
          // Se rapproche du Y du joueur
          {
            const dy = this.player.y - e.y;
            e.vy = Math.sign(dy) * Math.min(Math.abs(dy) * 1.5, 100);
          }
          // Tir
          if (e.canShoot) {
            e.fireTimer -= dt;
            if (e.fireTimer <= 0 && e.x < this.W && e.x > 0) {
              e.fireTimer = e.fireRate;
              const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
              this.spawnEnemyBullet(e.x, e.y + e.h / 2, Math.cos(angle) * ENEMY_BULLET_SPEED, Math.sin(angle) * ENEMY_BULLET_SPEED);
            }
          }
          break;
        case "error":
          // Tank lent, bouclier
          break;
      }

      // Sortie d'écran
      if (e.x < -e.w - 20) {
        this.enemies.release(e);
      }
    }
  }

  private updateBoss(dt: number): void {
    const b = this.boss;
    if (!b || !b.alive) return;

    // Boss mort — dérive et expire
    if (b.hp <= 0) {
      b.x += b.driftVx * dt;
      b.deathTimer -= dt;
      if (b.deathTimer <= 0 || b.x < -b.w - 50) {
        b.alive = false;
        this.boss = null;
      }
      return;
    }
    if (!b.entered) {
      b.x -= 80 * dt;
      if (b.x <= this.W - b.w - 30) {
        b.x = this.W - b.w - 30;
        b.entered = true;
      }
      return;
    }

    // Mouvement vertical
    b.moveTimer -= dt;
    if (b.moveTimer <= 0) {
      b.moveTimer = rnd(1.2, 2.5);
      b.targetY = rnd(20, this.H - b.h - 20);
    }
    b.y += (b.targetY - b.y) * 2 * dt;

    // Phases basées sur les HP
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
        // Tir en éventail (3 balles)
        for (let a = -0.3; a <= 0.3; a += 0.3) {
          this.spawnEnemyBullet(cx, cy + 30, Math.cos(Math.PI + a) * ENEMY_BULLET_SPEED * 0.8, Math.sin(Math.PI + a) * ENEMY_BULLET_SPEED * 0.8);
        }
      } else if (b.phase === 1) {
        // Tir visé + éventail
        const angle = Math.atan2(this.player.y - cy, this.player.x - cx);
        this.spawnEnemyBullet(cx, cy + 30, Math.cos(angle) * ENEMY_BULLET_SPEED * 1.1, Math.sin(angle) * ENEMY_BULLET_SPEED * 1.1);
        for (let a = -0.4; a <= 0.4; a += 0.4) {
          this.spawnEnemyBullet(cx, cy + 30, Math.cos(Math.PI + a) * ENEMY_BULLET_SPEED * 0.7, Math.sin(Math.PI + a) * ENEMY_BULLET_SPEED * 0.7);
        }
      } else {
        // Phase désespérée — spray + spawn de Clippys
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
      if (p.life <= 0) {
        this.particles.release(p);
      }
    }
  }

  private updateSpawning(dt: number): void {
    const queue = (this as any)._spawnQueue as EnemyType[] | undefined;
    if (!queue || queue.length === 0 && this.enemies.active.length === 0 && this.waveEnemiesLeft === 0) {
      // Vague terminée
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
          this.spawnParticles(bullet.x, bullet.y, 3, SPARK_CHARS, "#ff0", 60, 0.25);
          this.audio.enemyHit();
          this.addShake(1.5);
          this.addHitstop();

          if (enemy.hp <= 0) {
            this.score += enemy.score;
            this.spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 14, DEATH_CHARS, "#f44", 200, 0.9);
            this.addShake(4);
            this.addFlash(0.1);
            this.audio.enemyDeath();
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
          this.spawnParticles(bullet.x, bullet.y, 4, SPARK_CHARS, "#ff0", 80, 0.3);
          this.audio.bossHit();
          this.addShake(2);
          this.addHitstop();

          if (this.boss.hp <= 0) {
            this.score += 5000;
            this.spawnParticles(this.boss.x + this.boss.w / 2, this.boss.y + this.boss.h / 2, 50, BOSS_CHARS, "#f0f", 300, 1.5);
            this.spawnParticles(this.boss.x + this.boss.w / 2, this.boss.y + this.boss.h / 2, 30, DEATH_CHARS, "#0ff", 250, 1.2);
            this.addShake(10);
            this.addFlash(0.4);
            this.addHitstop(0.08);
            this.audio.bossDeath();
            this.queueNotif("MISE À JOUR ANNULÉE. Windows Update a été purgé avec succès.");
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
        if (aabb(bullet, plr)) {
          this.enemyBullets.release(bullet);
          this.damagePlayer();
        }
      }

      // Collision ennemis → joueur
      for (let ei = this.enemies.active.length - 1; ei >= 0; ei--) {
        const enemy = this.enemies.active[ei]!;
        if (aabb(plr, enemy)) {
          this.damagePlayer();
          this.spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 8, DEATH_CHARS, "#f84", 120, 0.5);
          this.enemies.release(enemy);
        }
      }

      // Collision boss → joueur
      if (this.boss && this.boss.alive && this.boss.entered && aabb(plr, this.boss)) {
        this.damagePlayer();
      }
    }
  }

  private damagePlayer(): void {
    if (this.player.invTimer > 0) return;
    this.player.health--;
    this.player.invTimer = PLAYER_INVINCIBLE_TIME;
    this.spawnParticles(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 10, SPARK_CHARS, "#f00", 150, 0.5);
    this.addShake(6);
    this.addFlash(0.2);
    this.addHitstop(0.04);
    this.audio.playerHit();
    this.queueNotif(pick(["Aïe.","Secteur endommagé.","Segment corrompu.","Buffer overflow."]));

    if (this.player.health <= 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.state = "gameover";
    this.spawnParticles(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 40, DEATH_CHARS, "#f00", 250, 1.2);
    this.addShake(10);
    this.addFlash(0.5);
    this.addHitstop(0.1);
    this.bullets.releaseAll();
    this.enemyBullets.releaseAll();
    this.enemies.releaseAll();
    this.boss = null;
    this.queueNotif("CRASH SYSTEMATIQUE. Votre score a été sauvegardé... ou pas.");
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
      const sx = (Math.random() - 0.5) * this.shakeAmt * 2;
      const sy = (Math.random() - 0.5) * this.shakeAmt * 2;
      ctx.translate(sx, sy);
    }

    // Fond
    ctx.fillStyle = "#0d0d18";
    ctx.fillRect(-10, -10, this.W + 20, this.H + 20);

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
      this.renderEnemies(ctx);
      this.renderBullets(ctx);
      this.renderEnemyBullets(ctx);
      this.renderBoss(ctx);
      this.renderPlayer(ctx);
      this.renderHUD(ctx);
    } else if (this.state === "gameover") {
      this.renderBackground(ctx);
      this.renderParticles(ctx);
      this.renderEndScreen(ctx, "CRASH SYSTEMATIQUE", "#f44");
    } else if (this.state === "victory") {
      this.renderBackground(ctx);
      this.renderParticles(ctx);
      this.renderEndScreen(ctx, "SYSTÈME NETTOYÉ", "#4f4");
    }

    // Flash overlay
    if (this.flashAlpha > 0.01) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, this.W, this.H);
    }

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    // Grille "desktop"
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    const gs = 40;
    const ox = -(this.bgOffset % gs);
    for (let x = ox; x < this.W + gs; x += gs) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.H);
      ctx.stroke();
    }
    for (let y = 0; y < this.H; y += gs) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.W, y);
      ctx.stroke();
    }

    // Étoiles
    for (const s of this.stars) {
      ctx.fillStyle = `rgba(255,255,255,${0.15 + s.r * 0.2})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
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

    ctx.restore();
  }

  private renderEnemies(ctx: CanvasRenderingContext2D): void {
    for (const e of this.enemies.active) {
      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h / 2);

      // Flash blanc au hit
      if (e.flashTimer > 0) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(-e.w / 2 - 2, -e.h / 2 - 2, e.w + 4, e.h + 4);
      }

      // Émoji
      ctx.font = `${e.h * 0.75}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(e.emoji, 0, 1);

      // Barre de vie
      if (e.maxHp > 1) {
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
    ctx.fillStyle = "#0ff";
    ctx.shadowColor = "#0ff";
    ctx.shadowBlur = 4;
    for (const b of this.bullets.active) {
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
    ctx.shadowBlur = 0;
  }

  private renderEnemyBullets(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#f44";
    ctx.shadowColor = "#f44";
    ctx.shadowBlur = 3;
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
    // Titlebar
    const tbH = 24;
    const grad = ctx.createLinearGradient(x, y, x, y + tbH);
    grad.addColorStop(0, "#000080");
    grad.addColorStop(1, "#0000a0");
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, tbH);

    // Boutons titlebar
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
    ctx.fillText("💀 Windows Update", x + 6, y + 17);

    // Corps
    ctx.fillStyle = "#ece9d8";
    ctx.fillRect(x + 3, y + tbH + 3, w - 6, h - tbH - 6);

    // Texte
    ctx.fillStyle = "#000";
    ctx.font = "11px monospace";
    ctx.fillText("Installation de la mise à jour...", x + 14, y + tbH + 22);
    ctx.fillText("Veuillez ne pas éteindre votre ordinateur.", x + 14, y + tbH + 38);

    // Barre de progression
    const bx = x + 14, by = y + tbH + 50, bw = w - 28, bh2 = 16;
    ctx.fillStyle = "#fff";
    ctx.fillRect(bx, by, bw, bh2);
    ctx.strokeStyle = "#808080";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh2);
    // Progrès (bloqué à 99%)
    const progress = 0.99;
    ctx.fillStyle = "#000080";
    ctx.fillRect(bx + 2, by + 2, (bw - 4) * progress, bh2 - 4);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("99% complété...", bx + bw / 2, by + bh2 / 2 + 4);

    // Boss health bar (au-dessus de la fenêtre)
    const hpW = w;
    const hpH = 8;
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y - hpH - 4, hpW, hpH);
    const hpRatio = b.hp / b.maxHp;
    const hpColor = hpRatio > 0.5 ? "#4f4" : hpRatio > 0.25 ? "#ff0" : "#f44";
    ctx.fillStyle = hpColor;
    ctx.fillRect(x, y - hpH - 4, hpW * hpRatio, hpH);
    // Boss label
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`BOSS — ${Math.ceil(b.hp)}/${b.maxHp} PV`, x, y - hpH - 7);

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

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, this.W - 12, 22);

    // Wave
    ctx.fillStyle = "#aaa";
    ctx.font = "11px monospace";
    ctx.fillText(`VAGUE ${this.wave}`, this.W - 12, 38);

    // Barre de vie
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
    ctx.fillText(`SANTÉ: ${this.player.health}/${this.player.maxHealth}`, hbX + 4, hbY + 9);

    // Power level
    if (this.player.powerLevel >= 2) {
      ctx.fillStyle = "#ff0";
      ctx.fillText("POWER x2", hbX, hbY + hbH + 14);
    }

    ctx.textAlign = "start";
  }

  private renderTitle(ctx: CanvasRenderingContext2D): void {
    // Titre principal
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.min(36, this.W * 0.045)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("TASKKILL.EXE", this.W / 2, this.H * 0.28);

    // Sous-titre
    ctx.fillStyle = "#0ff";
    ctx.font = `${Math.min(16, this.W * 0.02)}px monospace`;
    ctx.fillText("The Bloatware Purge", this.W / 2, this.H * 0.28 + 36);

    // Curseur qui clignote
    const blink = Math.sin(this.titleBlink * 3) > 0;
    if (blink) {
      ctx.fillStyle = "#fff";
      ctx.font = `${Math.min(18, this.W * 0.022)}px monospace`;
      ctx.fillText("Appuyez sur ESPACE pour formater le disque dur", this.W / 2, this.H * 0.6);
    }

    // Instructions
    ctx.fillStyle = "#666";
    ctx.font = `${Math.min(12, this.W * 0.015)}px monospace`;
    ctx.fillText("↑↓←→ / ZQSD = Déplacer   |   ESPACE = Tirer", this.W / 2, this.H * 0.73);
    ctx.fillText("Détruisez les dossiers corrompus, barres de chargement,", this.W / 2, this.H * 0.8);
    ctx.fillText("pop-ups publicitaires et l'Assistant Clippy™", this.W / 2, this.H * 0.8 + 18);

    // Version
    ctx.fillStyle = "#444";
    ctx.font = "10px monospace";
    ctx.fillText("v1.0.0 — GunthOS Kernel Entertainment Division", this.W / 2, this.H - 14);
    ctx.textAlign = "start";
  }

  private renderWaveIntro(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.min(28, this.W * 0.035)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`VAGUE ${this.wave}`, this.W / 2, this.H * 0.4);
    ctx.fillStyle = "#0ff";
    ctx.font = `${Math.min(15, this.W * 0.018)}px monospace`;
    ctx.fillText(this.waveMessage, this.W / 2, this.H * 0.52);
    ctx.textAlign = "start";
  }

  private renderEndScreen(ctx: CanvasRenderingContext2D, title: string, color: string): void {
    // Overlay sombre
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.fillStyle = color;
    ctx.font = `bold ${Math.min(32, this.W * 0.04)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(title, this.W / 2, this.H * 0.3);

    ctx.fillStyle = "#fff";
    ctx.font = `${Math.min(20, this.W * 0.025)}px monospace`;
    ctx.fillText(`Score final : ${this.score.toLocaleString()}`, this.W / 2, this.H * 0.45);

    const blink = Math.sin(this.titleBlink * 3) > 0;
    if (blink) {
      ctx.fillStyle = "#aaa";
      ctx.font = `${Math.min(15, this.W * 0.018)}px monospace`;
      ctx.fillText("Appuyez sur ESPACE pour redémarrer", this.W / 2, this.H * 0.6);
    }
    ctx.textAlign = "start";
  }
}
