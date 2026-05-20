"use client";

import { useRef, useCallback, useState } from "react";
import type { CelebrationOptions, CelebType } from "@/types/plouf-plouf";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  color: string;
  life: number;
  shape: string;
  gravity: number;
  wobble: number;
  wobbleSpeed: number;
  targetX?: number;
  targetY?: number;
  speed?: number;
  char?: string;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function getColor(o: CelebrationOptions): string {
  if (o.rainbow) {
    const hue = (Date.now() / 10 + Math.random() * 360) % 360;
    return `hsl(${hue}, 100%, 60%)`;
  }
  return [o.color1, o.color2, o.color3][Math.floor(Math.random() * 3)] ?? o.color1;
}

function makeParticles(type: CelebType, o: CelebrationOptions): Particle[] {
  const c = getColor(o);
  const W = window.innerWidth;
  const H = window.innerHeight;

  switch (type) {
    case "confetti":
      return [
        {
          x: Math.random() * W,
          y: -20 - Math.random() * 200,
          vx: rand(-3, 3),
          vy: rand(2, 6),
          rot: Math.random() * Math.PI * 2,
          vrot: rand(-0.2, 0.2),
          size: rand(6, 14),
          color: c,
          life: 1,
          shape: "rect",
          gravity: 0.15,
          wobble: rand(0, Math.PI * 2),
          wobbleSpeed: rand(0.05, 0.15),
        },
      ];
    case "fireworks": {
      const cx = rand(W * 0.2, W * 0.8);
      const cy = rand(H * 0.2, H * 0.5);
      const color = c;
      return Array.from({ length: randInt(20, 40) }, (_, i) => {
        const angle = (i / 35) * Math.PI * 2;
        const speed = rand(2, 7);
        return {
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: rand(2, 5),
          color: Math.random() > 0.7 ? getColor(o) : color,
          life: 1,
          shape: "circle",
          gravity: 0.08,
          rot: 0,
          vrot: 0,
          wobble: 0,
          wobbleSpeed: 0,
        };
      });
    }
    case "rain":
      return [
        {
          x: Math.random() * W,
          y: -20,
          vx: 0,
          vy: rand(3, 6),
          size: rand(8, 18),
          color: c,
          life: 1,
          shape: "star",
          gravity: 0.05,
          rot: Math.random() * Math.PI * 2,
          vrot: rand(-0.1, 0.1),
          wobble: 0,
          wobbleSpeed: 0,
        },
      ];
    case "matrix": {
      const chars =
        "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789";
      return [
        {
          x: Math.random() * W,
          y: -20,
          vx: 0,
          vy: rand(4, 10),
          size: rand(14, 28),
          color: "#00ff41",
          life: 1,
          shape: "char",
          gravity: 0,
          rot: 0,
          vrot: 0,
          wobble: 0,
          wobbleSpeed: 0,
          char: chars[Math.floor(Math.random() * chars.length)],
        },
      ];
    }
    case "hearts":
      return [
        {
          x: Math.random() * W,
          y: H + 20,
          vx: rand(-1, 1),
          vy: rand(-6, -3),
          size: rand(10, 24),
          color: c,
          life: 1,
          shape: "heart",
          gravity: -0.05,
          rot: 0,
          vrot: rand(-0.1, 0.1),
          wobble: rand(0, Math.PI * 2),
          wobbleSpeed: rand(0.05, 0.15),
        },
      ];
    case "stars":
      return [
        {
          x: Math.random() * W,
          y: -20,
          vx: rand(-2, 2),
          vy: rand(2, 5),
          size: rand(8, 18),
          color: c,
          life: 1,
          shape: "sparkle",
          gravity: 0.03,
          rot: Math.random() * Math.PI * 2,
          vrot: rand(-0.2, 0.2),
          wobble: rand(0, Math.PI * 2),
          wobbleSpeed: rand(0.05, 0.1),
        },
      ];
    case "xp": {
      const cx = W / 2;
      const cy = H / 2;
      const angle = Math.random() * Math.PI * 2;
      const distance = rand(200, 500);
      return [
        {
          x: cx + Math.cos(angle) * distance,
          y: cy + Math.sin(angle) * distance,
          vx: 0,
          vy: 0,
          targetX: cx + rand(-30, 30),
          targetY: cy + rand(-30, 30),
          size: rand(6, 14),
          color: c,
          life: 1,
          shape: "orb",
          gravity: 0,
          rot: 0,
          vrot: 0,
          wobble: 0,
          wobbleSpeed: 0,
          speed: rand(0.02, 0.06),
        },
      ];
    }
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.fillStyle = p.color;

  switch (p.shape) {
    case "rect":
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      break;
    case "circle":
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "star":
      drawStar(ctx, 0, 0, 5, p.size, p.size / 2);
      break;
    case "heart":
      drawHeart(ctx, 0, 0, p.size);
      break;
    case "sparkle":
      drawSparkle(ctx, 0, 0, p.size);
      break;
    case "orb": {
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
      grad.addColorStop(0, "rgba(255,255,255,0.9)");
      grad.addColorStop(0.3, p.color);
      grad.addColorStop(1, p.color + "00");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "char":
      ctx.font = `bold ${p.size}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.char ?? "?", 0, 0);
      break;
  }
  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(
      cx + Math.cos(rot) * outerR,
      cy + Math.sin(rot) * outerR
    );
    rot += step;
    ctx.lineTo(
      cx + Math.cos(rot) * innerR,
      cy + Math.sin(rot) * innerR
    );
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
  ctx.fill();
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
) {
  ctx.beginPath();
  const h = size * 0.3;
  ctx.moveTo(cx, cy + size / 2);
  ctx.bezierCurveTo(cx + size, cy, cx + size, cy - size / 2, cx, cy - h);
  ctx.bezierCurveTo(cx - size, cy - size / 2, cx - size, cy, cx, cy + size / 2);
  ctx.closePath();
  ctx.fill();
}

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
) {
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(angle) * size,
      cy + Math.sin(angle) * size
    );
  }
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = size / 4;
  ctx.stroke();
}

function updateParticle(p: Particle): boolean {
  if (p.shape === "orb" && p.targetX !== undefined && p.targetY !== undefined) {
    const speed = p.speed ?? 0.04;
    p.vx += (p.targetX - p.x) * speed;
    p.vy += (p.targetY - p.y) * speed;
    p.vx *= 0.9;
    p.vy *= 0.9;
    if (Math.hypot(p.targetX - p.x, p.targetY - p.y) < 20) p.life -= 0.05;
  } else {
    p.vy += p.gravity;
    if (p.wobbleSpeed > 0) {
      p.wobble += p.wobbleSpeed;
      p.x += Math.sin(p.wobble) * 0.5;
    }
  }
  p.x += p.vx;
  p.y += p.vy;
  p.rot += p.vrot;

  const H = window.innerHeight;
  const W = window.innerWidth;
  if (p.shape === "heart" ? p.y < -50 : p.y > H + 50) return false;
  if (p.x < -100 || p.x > W + 100) return false;
  return p.life > 0;
}

export function useCelebration() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const spawnAccRef = useRef(0);
  const [active, setActive] = useState(false);

  const stop = useCallback(() => {
    activeRef.current = false;
    setActive(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    particlesRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const start = useCallback(
    (options: CelebrationOptions) => {
      if (activeRef.current) stop();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      activeRef.current = true;
      setActive(true);
      particlesRef.current = [];
      spawnAccRef.current = 0;

      const loop = () => {
        if (!activeRef.current) return;

        spawnAccRef.current += options.density / 60;
        while (spawnAccRef.current >= 1) {
          spawnAccRef.current -= 1;
          const batch = makeParticles(options.type, options);
          particlesRef.current.push(...batch);
        }

        if (options.type === "fireworks" || options.type === "matrix") {
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        } else {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }

        particlesRef.current = particlesRef.current.filter((p) => {
          const alive = updateParticle(p);
          if (alive) drawParticle(ctx, p);
          return alive;
        });

        if (particlesRef.current.length > 2000) {
          particlesRef.current.splice(0, particlesRef.current.length - 2000);
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
      setTimeout(stop, options.duration * 1000);
    },
    [stop]
  );

  return { canvasRef, active, start, stop };
}
