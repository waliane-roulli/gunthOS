import { W, H } from "../constants";
import type { GameState } from "../types";
import type { GameEvent } from "../events";

export function endOfTurn(s: GameState, ironWillUsed: boolean, events: GameEvent[]): void {
  s.pegs = s.pegs.filter(p => !p.hit);
  s.combo = 0;
  s.scoreMultiplier = 1;
  s.lastHitWasOrange = false;

  const remainingOrange = s.pegs.filter(p => p.orange).length;

  if (remainingOrange === 0) {
    if (s.runRelics.includes("trophy") && s.ballsLostThisLevel === 0) {
      s.balls += 2;
      s.floatingTexts.push({ x: W / 2, y: H / 3, text: "!! TROPHÉE +2 BALLES!", life: 1, maxLife: 2.5, color: "#ffd700", combo: true, fontSize: 14 });
    }

    if (s.runUpgrades.includes("recovery") && s.balls > 3) {
      s.balls += 1;
      s.floatingTexts.push({ x: W / 2, y: H / 3 + 20, text: ">> RÉCUPÉRATION +1", life: 1, maxLife: 2, color: "#44ff88", combo: true, fontSize: 12 });
    }

    const ballBonus = s.balls * 1000;
    s.score += ballBonus;
    if (ballBonus > 0) {
      s.floatingTexts.push({ x: W / 2, y: H / 2, text: `+${ballBonus.toLocaleString()} BONUS BILLES !`, life: 1, maxLife: 3, color: "#00ffcc", combo: true, fontSize: 16 });
    }

    const saved = parseInt(localStorage.getItem("peggle98_best") ?? "0", 10);
    if (s.score > saved) {
      localStorage.setItem("peggle98_best", String(s.score));
      events.push({ kind: "best-score", score: s.score });
    }

    s.phase = "won";
    s.message = `NIVEAU ${s.level} TERMINÉ !`;
    events.push({ kind: "sound", id: "victory" });
    events.push({ kind: "level-won", bossKilled: s.bossKilledThisLevel });

  } else if (s.balls <= 0) {
    if (s.runUpgrades.includes("iron_will") && !ironWillUsed) {
      s.balls = 2;
      s.flashWhite = 0.8;
      s.trauma = Math.min(1, s.trauma + 0.5);
      s.floatingTexts.push({ x: W / 2, y: H / 2 - 20, text: "[] VOLONTÉ DE FER!", life: 1, maxLife: 2.5, color: "#4488ff", combo: true, fontSize: 15 });
      s.phase = "aim";
      events.push({ kind: "iron-will" });
    } else {
      const saved = parseInt(localStorage.getItem("peggle98_best") ?? "0", 10);
      if (s.score > saved) {
        localStorage.setItem("peggle98_best", String(s.score));
        events.push({ kind: "best-score", score: s.score });
      }
      s.phase = "lost";
      s.message = "GAME OVER";
      events.push({ kind: "sound", id: "delete" });
      events.push({ kind: "level-lost", score: s.score });
    }

  } else {
    s.phoenixAvailable = s.runRelics.includes("phoenix");
    s.phase = "aim";
  }
}
