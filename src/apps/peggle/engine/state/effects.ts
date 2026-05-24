import type { GameState, Particle } from "../types";

export function spawnParticles(
  s: GameState,
  x: number,
  y: number,
  orange: boolean,
  count: number,
  bomb = false,
): void {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * (bomb ? 6 : 3.5);
    const colors = bomb
      ? ["#ff6600", "#ffcc00", "#ff2200", "#ffeeaa", "#ffffff"]
      : orange
      ? ["#4488ff", "#88bbff", "#0044cc", "#ffffff", "#000080"]
      : ["#c0c0c0", "#e0e0e0", "#808080", "#ffffff", "#606060"];
    const p: Particle = {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (bomb ? 2 : 1),
      life: 1,
      maxLife: 0.6 + Math.random() * (bomb ? 1.2 : 0.6),
      color: colors[Math.floor(Math.random() * colors.length)]!,
      size: 2 + Math.random() * (bomb ? 5 : 3),
    };
    s.particles.push(p);
  }
}
