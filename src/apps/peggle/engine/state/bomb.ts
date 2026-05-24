import { W, H, PEG_R, SLOW_MO_DURATION } from "../constants";
import type { GameState, Peg } from "../types";
import type { GameEvent } from "../events";
import { spawnParticles } from "./effects";

export function triggerBomb(s: GameState, bombPeg: Peg, events: GameEvent[]): void {
  const queue: Peg[] = [bombPeg];
  const processed = new Set<Peg>();
  let chainCount = 0;
  let bombsInChain = 0;

  while (queue.length > 0) {
    const bPeg = queue.shift()!;
    if (processed.has(bPeg)) continue;
    processed.add(bPeg);

    for (const p of s.pegs) {
      if (p.hit || processed.has(p)) continue;
      const d = Math.hypot(p.x - bPeg.x, p.y - bPeg.y);
      if (d <= s.effectiveBombR) {
        p.hit = true; p.popping = true; p.popAlpha = 0.25; p.scale = 1.9;
        spawnParticles(s, p.x, p.y, p.orange, p.orange ? 18 : 10, true);
        const chainBonus = s.runUpgrades.includes("chain_master") ? 50 : 0;
        const pts = (p.orange ? 150 : p.green ? 75 : 15) + chainBonus;
        s.score += pts * s.scoreMultiplier;
        chainCount++;
        if (p.bomb) { bombsInChain++; queue.push(p); }

        if (s.runUpgrades.includes("contamination")) {
          for (const neighbor of s.pegs) {
            if (!neighbor.hit && !processed.has(neighbor) && !neighbor.bomb && !neighbor.orange && !neighbor.boss) {
              const nd = Math.hypot(neighbor.x - p.x, neighbor.y - p.y);
              if (nd < PEG_R * 6) { neighbor.bomb = true; queue.push(neighbor); }
            }
          }
        }
      }
    }
  }

  spawnParticles(s, bombPeg.x, bombPeg.y, true, 40, true);
  s.trauma = Math.min(1, s.trauma + 0.5);
  s.flashWhite = Math.max(s.flashWhite, 0.7);

  const label = chainCount > 3 ? `💥 CHAIN ×${chainCount}!` : "💥 BOOM!";
  s.floatingTexts.push({ x: bombPeg.x, y: bombPeg.y - 20, text: label, life: 1, maxLife: 2.2, color: "#ff6600", combo: true, fontSize: 17 });

  if (s.runRelics.includes("scorpion") && bombsInChain > 0) {
    s.balls += bombsInChain;
    s.floatingTexts.push({ x: bombPeg.x, y: bombPeg.y - 36, text: `🦂 +${bombsInChain}`, life: 1, maxLife: 1.8, color: "#ff6644", combo: true, fontSize: 13 });
  }

  const orangeRemaining = s.pegs.filter(pg => pg.orange && !pg.hit).length;
  if (orangeRemaining === 0 && s.slowMoFrames === 0) {
    s.slowMoFrames = SLOW_MO_DURATION;
    s.flashWhite = 1.0;
    s.floatingTexts.push({ x: W / 2, y: H / 2 - 30, text: "DERNIÈRE FENÊTRE !", life: 1, maxLife: 2.5, color: "#88ccff", combo: true, fontSize: 16 });
  }

  // Suppress unused param warning — events kept for future use (e.g. chain sound)
  void events;
}
