import type { GameState, Particle } from "../types";
import { PEAGLE_THEME } from "../../renderer/theme";
import { BALANCE } from "../balance";

export function spawnParticles(
  s: GameState,
  x: number,
  y: number,
  orange: boolean,
  count: number,
  bomb = false,
): void {
  const colors = bomb
    ? PEAGLE_THEME.particles.bomb
    : orange
    ? PEAGLE_THEME.particles.orange
    : PEAGLE_THEME.particles.normal;

  for (let i = 0; i < count; i++) {
    // Evict oldest particles to stay under the cap
    if (s.particles.length >= BALANCE.particles.maxCount) s.particles.shift();

    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * (bomb ? 6 : 3.5);
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
