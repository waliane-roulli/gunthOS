import {
  PEG_R, BUCKET_H, BUCKET_W, WALL_BOUNCE, GRAVITY, FRICTION,
  LAUNCH_SPEED, HIT_FREEZE_NORMAL, HIT_FREEZE_ORANGE, SLOW_MO_DURATION,
  W, H, BONUS_BUCKET_XS,
} from "../constants";
import type { GameState, Ball, Peg } from "../types";
import type { GameEvent } from "../events";
import { circleCollide } from "../physics";
import { spawnParticles } from "./effects";
import { triggerBomb } from "./bomb";

export function processBallPhysics(
  b: Ball,
  s: GameState,
  timeScale: number,
  events: GameEvent[],
): void {
  const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  b.trail.push({ x: b.x, y: b.y, speed });
  if (b.trail.length > 32) b.trail.shift();

  const substeps = Math.max(1, Math.ceil(speed / (PEG_R * 0.8)));
  const dt = timeScale / substeps;
  const wallBounce = WALL_BOUNCE * (s.runRelics.includes("boomerang") ? 1.4 : 1);

  for (let step = 0; step < substeps; step++) {
    // Magnet: attract toward nearest orange peg
    if (s.magnetFrames > 0) {
      const orangePegs = s.pegs.filter(p => p.orange && !p.hit && p.hitCooldown === 0);
      if (orangePegs.length > 0) {
        let nearest = orangePegs[0]!;
        let nearDist = Math.hypot(b.x - nearest.x, b.y - nearest.y);
        for (const op of orangePegs) {
          const d = Math.hypot(b.x - op.x, b.y - op.y);
          if (d < nearDist) { nearest = op; nearDist = d; }
        }
        if (nearDist > 0) {
          const force = 0.06 * dt;
          b.vx += ((nearest.x - b.x) / nearDist) * force;
          b.vy += ((nearest.y - b.y) / nearDist) * force;
        }
      }
    }

    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.vy += GRAVITY * dt;
    b.vx *= Math.pow(FRICTION, dt);

    if (b.x - s.effectiveBallR < 0) {
      b.vx = Math.abs(b.vx) * wallBounce;
      b.x = s.effectiveBallR;
      if (step === 0) { events.push({ kind: "sound", id: "bip" }); s.trauma = Math.min(1, s.trauma + 0.06); }
    }
    if (b.x + s.effectiveBallR > W) {
      b.vx = -Math.abs(b.vx) * wallBounce;
      b.x = W - s.effectiveBallR;
      if (step === 0) { events.push({ kind: "sound", id: "bip" }); s.trauma = Math.min(1, s.trauma + 0.06); }
    }

    for (const p of s.pegs) {
      if (p.hit || p.hitCooldown > 0) continue;
      const result = circleCollide(b.x, b.y, b.vx, b.vy, s.effectiveBallR, p.x, p.y, PEG_R, s.effectivePegBounce);
      if (!result) continue;

      // Ghost ball: pass through first peg this shot
      if (s.ghostBallActive && b === s.ball) {
        s.ghostBallActive = false;
        p.hitCooldown = 20;
        s.floatingTexts.push({ x: p.x, y: p.y - 12, text: "👻 FANTÔME", life: 1, maxLife: 1.2, color: "#cc88ff", combo: false, fontSize: 11 });
        continue;
      }

      b.vx = result.vx; b.vy = result.vy;
      const dx = b.x - p.x, dy = b.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const overlap = s.effectiveBallR + PEG_R - dist + 0.5;
      b.x += (dx / dist) * overlap;
      b.y += (dy / dist) * overlap;

      // Boss armor hit (not final kill)
      if (p.boss && p.armorHits > 0) {
        p.armorHits--;
        p.hitCooldown = 12;
        p.scale = 1.6;
        s.trauma = Math.min(1, s.trauma + 0.22);
        s.flashWhite = Math.max(s.flashWhite, 0.35);
        s.hitFreezeFrames = Math.max(s.hitFreezeFrames, HIT_FREEZE_ORANGE);
        spawnParticles(s, p.x, p.y, true, 12);
        const hpLeft = p.armorHits + 1;
        s.floatingTexts.push({ x: p.x, y: p.y - 18, text: `👑 ${hpLeft}/5`, life: 1, maxLife: 1.2, color: "#ffd700", combo: true, fontSize: 14 });
        events.push({ kind: "sound", id: "bip" });
        continue;
      }

      // Armor peg hit
      if (p.armorHits > 0) {
        p.armorHits--;
        p.hitCooldown = 12;
        p.scale = 1.5;
        s.trauma = Math.min(1, s.trauma + 0.12);
        s.hitFreezeFrames = Math.max(s.hitFreezeFrames, HIT_FREEZE_NORMAL);
        spawnParticles(s, p.x, p.y, false, 8);
        s.floatingTexts.push({ x: p.x, y: p.y - 12, text: "CRACK!", life: 1, maxLife: 0.9, color: "#aaccff", combo: false, fontSize: 11 });
        events.push({ kind: "sound", id: "bip" });
        continue;
      }

      // Warp peg
      if (p.warpId !== undefined) {
        const partner = s.pegs.find(pp => pp.warpId === p.warpId && pp !== p && !pp.hit);
        if (partner) {
          b.x = partner.x + (dx / dist) * (s.effectiveBallR + PEG_R + 2);
          b.y = partner.y + (dy / dist) * (s.effectiveBallR + PEG_R + 2);
          spawnParticles(s, p.x, p.y, false, 14);
          spawnParticles(s, partner.x, partner.y, false, 14);
          s.flashWhite = Math.max(s.flashWhite, 0.3);
          s.floatingTexts.push({ x: partner.x, y: partner.y - 14, text: "✦ WARP!", life: 1, maxLife: 1.2, color: "#cc88ff", combo: true, fontSize: 13 });
          partner.hitCooldown = 20;
        }
        p.hit = true; p.popping = true; p.popAlpha = 0.25; p.scale = 1.7;
        s.score += 30 * s.scoreMultiplier;
        events.push({ kind: "sound", id: "pop" });
        continue;
      }

      // Normal peg pop
      p.hit = true; p.popping = true; p.popAlpha = 0.25; p.scale = 1.7;
      s.combo += 1;
      s.cursedLuckHits += 1;

      // Boss final kill
      if (p.boss) {
        s.bossKilledThisLevel = true;
        s.score += 5000 * s.scoreMultiplier;
        s.balls += 2;
        s.trauma = Math.min(1, s.trauma + 0.9);
        s.flashWhite = 1.0;
        s.floatingTexts.push({ x: p.x, y: p.y - 30, text: "👑 BOSS VAINCU! +5000", life: 1, maxLife: 3, color: "#ffd700", combo: true, fontSize: 15 });
        s.floatingTexts.push({ x: p.x, y: p.y - 48, text: "+2 BALLES", life: 1, maxLife: 2.5, color: "#00ffcc", combo: true, fontSize: 13 });
        spawnParticles(s, p.x, p.y, true, 60, true);
        events.push({ kind: "sound", id: "victory" });
      }

      // Green peg power-up
      if (p.green) {
        s.flashWhite = Math.max(s.flashWhite, 0.4);
        switch (p.greenPowerup) {
          case "multiball": {
            const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            const baseA = Math.atan2(b.vy, b.vx);
            s.extraBalls.push({ x: b.x, y: b.y, vx: Math.cos(baseA - 0.22) * spd, vy: Math.sin(baseA - 0.22) * spd, active: true, trail: [], tint: "#ffdd88" });
            s.extraBalls.push({ x: b.x, y: b.y, vx: Math.cos(baseA + 0.22) * spd, vy: Math.sin(baseA + 0.22) * spd, active: true, trail: [], tint: "#88ffcc" });
            s.floatingTexts.push({ x: p.x, y: p.y - 22, text: "⚡ MULTIBALL!", life: 1, maxLife: 2, color: "#ffcc44", combo: true, fontSize: 15 });
            break;
          }
          case "spooky":
            s.spookyActive = true;
            s.floatingTexts.push({ x: p.x, y: p.y - 22, text: "👻 SPOOKY BALL!", life: 1, maxLife: 2, color: "#cc88ff", combo: true, fontSize: 15 });
            break;
          case "extraball":
            s.balls += 1;
            s.floatingTexts.push({ x: p.x, y: p.y - 22, text: "🔮 +1 BALLE!", life: 1, maxLife: 2, color: "#00ffcc", combo: true, fontSize: 15 });
            break;
          case "magnet":
            s.magnetFrames = 300;
            s.floatingTexts.push({ x: p.x, y: p.y - 22, text: "🧲 AIMANT!", life: 1, maxLife: 2, color: "#4488ff", combo: true, fontSize: 15 });
            break;
          case "pyromaniac": {
            for (const np of s.pegs) {
              if (!np.hit && !np.orange && !np.bomb && !np.boss && np !== p) {
                const d = Math.hypot(np.x - p.x, np.y - p.y);
                if (d < s.effectiveBombR * 1.3) np.bomb = true;
              }
            }
            p.bomb = true;
            triggerBomb(s, p, events);
            s.floatingTexts.push({ x: p.x, y: p.y - 22, text: "🔥 PYROMANE!", life: 1, maxLife: 2, color: "#ff6600", combo: true, fontSize: 15 });
            break;
          }
          default:
            s.scoreMultiplier = 2;
            s.floatingTexts.push({ x: p.x, y: p.y - 14, text: "×2 BONUS!", life: 1, maxLife: 1.6, color: "#44ff88", combo: true, fontSize: 14 });
        }
      }

      if (p.orange) {
        const orangeRemaining = s.pegs.filter(pg => pg.orange && !pg.hit).length;
        if (orangeRemaining === 0) {
          s.slowMoFrames = SLOW_MO_DURATION;
          s.flashWhite = 1.0;
          s.floatingTexts.push({ x: W / 2, y: H / 2 - 30, text: "DERNIÈRE FENÊTRE !", life: 1, maxLife: 2.5, color: "#88ccff", combo: true, fontSize: 16 });
        }
      }

      // Cursed luck relic
      let cursedMult = 1;
      if (s.runRelics.includes("cursed_luck") && s.cursedLuckHits % 5 === 0) {
        cursedMult = 3;
        s.floatingTexts.push({ x: p.x, y: p.y - 30, text: "🎲 ×3 MALCHANCE!", life: 1, maxLife: 1.8, color: "#cc44ff", combo: true, fontSize: 13 });
      }

      // Combo_hungry upgrade
      let hungryMult = 1;
      if (p.orange && s.runUpgrades.includes("combo_hungry") && s.lastHitWasOrange) {
        hungryMult = 1.5;
      }
      s.lastHitWasOrange = p.orange;

      const comboMult = Math.max(1, Math.floor(s.combo / 3));
      const totalMult = comboMult * s.scoreMultiplier * cursedMult * hungryMult;
      const basePoints = p.orange ? 100 : p.green ? 50 : p.boss ? 0 : 10;
      const earned = Math.round(basePoints * totalMult);
      if (!p.boss) s.score += earned;

      const freeze = p.orange ? HIT_FREEZE_ORANGE : HIT_FREEZE_NORMAL;
      s.hitFreezeFrames = Math.max(s.hitFreezeFrames, freeze);

      if (p.orange) { s.trauma = Math.min(1, s.trauma + 0.35); s.flashWhite = Math.max(s.flashWhite, 0.5); }
      else { s.trauma = Math.min(1, s.trauma + 0.08); }

      if (p.bomb && !p.green) {
        triggerBomb(s, p, events);
      } else if (!p.boss) {
        spawnParticles(s, p.x, p.y, p.orange, p.orange ? 20 : p.green ? 14 : 8);
      }

      const comboBonus = s.combo >= 3 && s.combo % 3 === 0;
      if (!p.boss && earned > 0) {
        const popFontSize = Math.min(18, 11 + Math.floor(totalMult * 1.5));
        const label = totalMult > 1 ? `+${earned} ×${Math.round(totalMult)}` : `+${earned}`;
        s.floatingTexts.push({
          x: p.x + (Math.random() - 0.5) * 20,
          y: p.y,
          text: label, life: 1, maxLife: 1,
          color: p.orange ? "#88ccff" : p.green ? "#44ff88" : "#ffffff",
          combo: comboBonus,
          fontSize: comboBonus ? popFontSize + 2 : popFontSize,
        });
      }

      if (comboBonus) {
        s.floatingTexts.push({ x: p.x, y: p.y - 22, text: `COMBO ×${comboMult}!`, life: 1, maxLife: 1.6, color: "#ffcc44", combo: true, fontSize: Math.min(20, 13 + comboMult * 2) });
      }

      events.push({ kind: "sound", id: p.orange || p.boss ? "pop" : "bip" });
    }
  }

  // Bucket catch
  const bucketTop = H - BUCKET_H - 4;
  const isLastBall = s.balls === 0;

  if (isLastBall) {
    for (let i = 0; i < BONUS_BUCKET_XS.length; i++) {
      const bx = BONUS_BUCKET_XS[i]!;
      if (b.y + s.effectiveBallR >= bucketTop && b.x >= bx && b.x <= bx + BUCKET_W) {
        const mult = s.bonusBucketMults[i] ?? 1;
        const turnScore = Math.max(0, s.score - s.turnScoreStart);
        const bonus = (mult - 1) * turnScore;
        s.balls += 1;
        s.bonusBucketFlash[i] = 1;
        s.trauma = Math.min(1, s.trauma + 0.2);
        if (bonus > 0) {
          s.score += bonus;
          s.floatingTexts.push({ x: bx + BUCKET_W / 2, y: bucketTop - 14, text: `×${mult} BONUS +${bonus.toLocaleString()}`, life: 1, maxLife: 2.2, color: mult === 5 ? "#ffcc00" : "#cc44ff", combo: true, fontSize: 15 });
        } else {
          s.floatingTexts.push({ x: bx + BUCKET_W / 2, y: bucketTop - 14, text: mult > 1 ? `×${mult} FREE BALL!` : "FREE BALL!", life: 1, maxLife: 1.8, color: mult === 5 ? "#ffcc00" : mult === 3 ? "#cc44ff" : "#00ffcc", combo: mult > 1, fontSize: 14 });
        }
        events.push({ kind: "sound", id: "victory" });
        b.active = false;
        break;
      }
    }
  } else {
    if (b.y + s.effectiveBallR >= bucketTop && b.x >= s.bucket && b.x <= s.bucket + BUCKET_W) {
      s.balls += 1;
      s.bucketFlash = 1;
      s.trauma = Math.min(1, s.trauma + 0.15);
      s.floatingTexts.push({ x: s.bucket + BUCKET_W / 2, y: bucketTop - 14, text: "FREE BALL!", life: 1, maxLife: 1.8, color: "#00ffcc", combo: true, fontSize: 14 });
      events.push({ kind: "sound", id: "victory" });
      b.active = false;
    }
  }

  // Ball falls off screen
  if (b.active && b.y > H + 40) {
    const isMain = b === s.ball;
    if (isMain && s.spookyActive) {
      s.spookyActive = false;
      b.x = Math.max(s.effectiveBallR, Math.min(W - s.effectiveBallR, b.x));
      b.y = 58;
      b.vy = -LAUNCH_SPEED * 0.65;
      b.vx *= 0.5;
      s.flashWhite = Math.max(s.flashWhite, 0.45);
      s.floatingTexts.push({ x: b.x, y: 78, text: "👻 SPOOKY SAVE!", life: 1, maxLife: 2, color: "#cc88ff", combo: true, fontSize: 14 });
    } else if (isMain && s.phoenixAvailable) {
      s.phoenixAvailable = false;
      b.x = Math.max(s.effectiveBallR, Math.min(W - s.effectiveBallR, b.x));
      b.y = 58;
      b.vy = -LAUNCH_SPEED * 0.65;
      b.vx *= 0.5;
      s.flashWhite = Math.max(s.flashWhite, 0.6);
      s.trauma = Math.min(1, s.trauma + 0.3);
      s.floatingTexts.push({ x: b.x, y: 78, text: "🔥 PHÉNIX SAVE!", life: 1, maxLife: 2, color: "#ff8800", combo: true, fontSize: 14 });
    } else {
      if (isMain) s.ballsLostThisLevel++;
      b.active = false;
    }
  }
}
