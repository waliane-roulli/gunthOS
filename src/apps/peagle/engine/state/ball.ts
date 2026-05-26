import {
  PEG_R, BUCKET_H, BUCKET_W, WALL_BOUNCE, GRAVITY, FRICTION,
  LAUNCH_SPEED, HIT_FREEZE_NORMAL, HIT_FREEZE_ORANGE, SLOW_MO_DURATION,
  W, H, BONUS_BUCKET_XS,
} from "../constants";
import { BALANCE } from "../balance";
import type { GameState, Ball } from "../types";
import type { GameEvent } from "../events";
import { circleCollide, capsuleCollide, arcCollide, spikeCollide, closestOnSeg } from "../physics";
import { spawnParticles } from "./effects";
import { triggerBomb } from "./bomb";

export function processBallPhysics(
  b: Ball,
  s: GameState,
  timeScale: number,
  events: GameEvent[],
): void {
  const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);

  // Ring buffer trail — avoids O(n) Array.shift() and per-frame object allocation
  const TRAIL_MAX = 32;
  if (b.trail.length < TRAIL_MAX) {
    b.trail.push({ x: b.x, y: b.y, speed });
  } else {
    const slot = b.trail[b.trailHead]!;
    slot.x = b.x; slot.y = b.y; slot.speed = speed;
    b.trailHead = (b.trailHead + 1) % TRAIL_MAX;
  }

  const substeps = Math.max(1, Math.ceil(speed / (PEG_R * 0.8)));
  const dt = timeScale / substeps;
  const frictionDt = Math.pow(FRICTION, dt); // hoisted — same value every substep
  const wallBounce = WALL_BOUNCE * (s.runRelics.includes("boomerang") ? 1.4 : 1);

  // Cache orange pegs for magnet — avoids repeated filter per substep
  const orangePegsForMagnet = s.magnetFrames > 0
    ? s.pegs.filter(p => p.orange && !p.hit && p.hitCooldown === 0)
    : [];

  for (let step = 0; step < substeps; step++) {
    // Magnet: attract toward nearest orange peg
    if (s.magnetFrames > 0 && orangePegsForMagnet.length > 0) {
      let nearest = orangePegsForMagnet[0]!;
      let ndx = b.x - nearest.x, ndy = b.y - nearest.y;
      let nearDistSq = ndx * ndx + ndy * ndy;
      for (const op of orangePegsForMagnet) {
        const odx = b.x - op.x, ody = b.y - op.y;
        const dSq = odx * odx + ody * ody;
        if (dSq < nearDistSq) { nearest = op; nearDistSq = dSq; ndx = odx; ndy = ody; }
      }
      if (nearDistSq > 0) {
        const nearDist = Math.sqrt(nearDistSq);
        const force = BALANCE.magnet.force * dt;
        b.vx += ((nearest.x - b.x) / nearDist) * force;
        b.vy += ((nearest.y - b.y) / nearDist) * force;
      }
    }

    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.vy += GRAVITY * dt;
    b.vx *= frictionDt;

    if (b.x - s.effectiveBallR < 0) {
      b.vx = Math.abs(b.vx) * wallBounce;
      b.x = s.effectiveBallR;
      if (step === 0) { events.push({ kind: "sound", id: "bip" }); s.trauma = Math.min(1, s.trauma + BALANCE.wall.traumaPerHit); }
    }
    if (b.x + s.effectiveBallR > W) {
      b.vx = -Math.abs(b.vx) * wallBounce;
      b.x = W - s.effectiveBallR;
      if (step === 0) { events.push({ kind: "sound", id: "bip" }); s.trauma = Math.min(1, s.trauma + BALANCE.wall.traumaPerHit); }
    }

    for (const p of s.pegs) {
      if (p.hit || p.hitCooldown > 0) continue;
      const result = circleCollide(b.x, b.y, b.vx, b.vy, s.effectiveBallR, p.x, p.y, PEG_R, s.effectivePegBounce);
      if (!result) continue;

      // Ghost ball: pass through first peg this shot — ball doesn't bounce but peg still pops
      if (s.ghostBallActive && b === s.ball) {
        s.ghostBallActive = false;
        p.hit = true; p.popping = true; p.popAlpha = BALANCE.peg.popStartAlpha; p.scale = BALANCE.peg.popStartScale;
        if (p.orange) s.orangeLeft = Math.max(0, s.orangeLeft - 1);
        s.combo += 1;
        s.cursedLuckHits += 1;
        const basePoints = p.orange ? BALANCE.score.orangeBase : p.green ? BALANCE.score.greenBase : BALANCE.score.normalBase;
        s.score += Math.round(basePoints * s.scoreMultiplier);
        if (p.bomb) triggerBomb(s, p, events);
        spawnParticles(s, p.x, p.y, p.orange, p.orange ? 20 : 8);
        s.floatingTexts.push({ x: p.x, y: p.y - 12, text: ">> PASSAGE FANTÔME!", life: 1, maxLife: 1.2, color: "#cc88ff", combo: false, fontSize: 11 });
        events.push({ kind: "sound", id: p.orange ? "pop" : "bip" });
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
        p.hitCooldown = BALANCE.peg.armorCooldown;
        p.scale = BALANCE.peg.bossArmorScale;
        s.trauma = Math.min(1, s.trauma + BALANCE.trauma.bossArmorPeg);
        s.flashWhite = Math.max(s.flashWhite, BALANCE.flash.bossArmorPeg);
        s.hitFreezeFrames = Math.max(s.hitFreezeFrames, HIT_FREEZE_ORANGE);
        spawnParticles(s, p.x, p.y, true, 12);
        const hpLeft = p.armorHits + 1;
        s.floatingTexts.push({ x: p.x, y: p.y - 18, text: `[BOSS] ${hpLeft}/5`, life: 1, maxLife: 1.2, color: "#ffd700", combo: true, fontSize: 14 });
        events.push({ kind: "sound", id: "bip" });
        continue;
      }

      // Armor peg hit
      if (p.armorHits > 0) {
        p.armorHits--;
        p.hitCooldown = BALANCE.peg.armorCooldown;
        p.scale = BALANCE.peg.armorScale;
        s.trauma = Math.min(1, s.trauma + BALANCE.trauma.armorPeg);
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
          s.flashWhite = Math.max(s.flashWhite, BALANCE.flash.warpPeg);
          s.floatingTexts.push({ x: partner.x, y: partner.y - 14, text: "✦ WARP!", life: 1, maxLife: 1.2, color: "#cc88ff", combo: true, fontSize: 13 });
          partner.hitCooldown = BALANCE.peg.warpCooldown;
        }
        if (p.orange) s.orangeLeft = Math.max(0, s.orangeLeft - 1);
        p.hit = true; p.popping = true; p.popAlpha = BALANCE.peg.popStartAlpha; p.scale = BALANCE.peg.popStartScale;
        s.score += BALANCE.score.warpBase * s.scoreMultiplier;
        events.push({ kind: "sound", id: "pop" });
        continue;
      }

      // Normal peg pop
      p.hit = true; p.popping = true; p.popAlpha = BALANCE.peg.popStartAlpha; p.scale = BALANCE.peg.popStartScale;
      if (p.orange) s.orangeLeft = Math.max(0, s.orangeLeft - 1);
      s.combo += 1;
      s.cursedLuckHits += 1;

      // Boss final kill
      if (p.boss) {
        s.bossKilledThisLevel = true;
        s.score += BALANCE.score.bossKill * s.scoreMultiplier;
        s.balls += BALANCE.score.bossBallBonus;
        s.trauma = Math.min(1, s.trauma + BALANCE.trauma.bossPeg);
        s.flashWhite = BALANCE.flash.bossPeg;
        s.floatingTexts.push({ x: p.x, y: p.y - 30, text: `!! BOSS VAINCU! +${BALANCE.score.bossKill}`, life: 1, maxLife: 3, color: "#ffd700", combo: true, fontSize: 15 });
        s.floatingTexts.push({ x: p.x, y: p.y - 48, text: `+${BALANCE.score.bossBallBonus} ŒUFS`, life: 1, maxLife: 2.5, color: "#00ffcc", combo: true, fontSize: 13 });
        spawnParticles(s, p.x, p.y, true, 60, true);
        events.push({ kind: "sound", id: "victory" });
      }

      // Green peg power-up
      if (p.green) {
        s.flashWhite = Math.max(s.flashWhite, BALANCE.flash.greenPeg);
        switch (p.greenPowerup) {
          case "multiball": {
            const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            const baseA = Math.atan2(b.vy, b.vx);
            const spread = BALANCE.multiball.spreadAngle;
            s.extraBalls.push({ x: b.x, y: b.y, vx: Math.cos(baseA - spread) * spd, vy: Math.sin(baseA - spread) * spd, active: true, trail: [], trailHead: 0, tint: "#ffdd88" });
            s.extraBalls.push({ x: b.x, y: b.y, vx: Math.cos(baseA + spread) * spd, vy: Math.sin(baseA + spread) * spd, active: true, trail: [], trailHead: 0, tint: "#88ffcc" });
            s.floatingTexts.push({ x: p.x, y: p.y - 22, text: ">> DOUBLE PONTE!", life: 1, maxLife: 2, color: "#ffcc44", combo: true, fontSize: 15 });
            break;
          }
          case "spooky":
            s.spookyActive = true;
            s.floatingTexts.push({ x: p.x, y: p.y - 22, text: ">> ŒUF FANTÔME!", life: 1, maxLife: 2, color: "#cc88ff", combo: true, fontSize: 15 });
            break;
          case "extraball":
            s.balls += 1;
            s.floatingTexts.push({ x: p.x, y: p.y - 22, text: "+1 ŒUF!", life: 1, maxLife: 2, color: "#00ffcc", combo: true, fontSize: 15 });
            break;
          case "magnet":
            s.magnetFrames = BALANCE.magnet.duration;
            s.floatingTexts.push({ x: p.x, y: p.y - 22, text: ">> AIMANT!", life: 1, maxLife: 2, color: "#4488ff", combo: true, fontSize: 15 });
            break;
          default:
            s.scoreMultiplier = 2;
            s.floatingTexts.push({ x: p.x, y: p.y - 14, text: "×2 BONUS!", life: 1, maxLife: 1.6, color: "#44ff88", combo: true, fontSize: 14 });
        }
      }

      if (p.orange) {
        if (s.orangeLeft === 0) {
          s.slowMoFrames = SLOW_MO_DURATION;
          s.flashWhite = 1.0;
          s.floatingTexts.push({ x: W / 2, y: H / 2 - 30, text: "DERNIÈRE FENÊTRE !", life: 1, maxLife: 2.5, color: "#88ccff", combo: true, fontSize: 16 });
        }
      }

      // Cursed luck relic
      let cursedMult = 1;
      if (s.runRelics.includes("cursed_luck") && s.cursedLuckHits % BALANCE.cursedLuck.hitInterval === 0) {
        cursedMult = BALANCE.cursedLuck.multiplier;
        s.floatingTexts.push({ x: p.x, y: p.y - 30, text: `?? ×${BALANCE.cursedLuck.multiplier} MALCHANCE!`, life: 1, maxLife: 1.8, color: "#cc44ff", combo: true, fontSize: 13 });
      }

      // Combo_hungry upgrade
      let hungryMult = 1;
      if (p.orange && s.runUpgrades.includes("combo_hungry") && s.lastHitWasOrange) {
        hungryMult = 1.5;
      }
      s.lastHitWasOrange = p.orange;

      const comboMult = Math.max(1, Math.floor(s.combo / BALANCE.combo.interval));
      const totalMult = comboMult * s.scoreMultiplier * cursedMult * hungryMult;
      const basePoints = p.orange ? BALANCE.score.orangeBase : p.green ? BALANCE.score.greenBase : p.boss ? 0 : BALANCE.score.normalBase;
      const earned = Math.round(basePoints * totalMult);
      if (!p.boss) s.score += earned;

      const freeze = p.orange ? HIT_FREEZE_ORANGE : HIT_FREEZE_NORMAL;
      s.hitFreezeFrames = Math.max(s.hitFreezeFrames, freeze);

      if (p.orange) { s.trauma = Math.min(1, s.trauma + BALANCE.trauma.orangePeg); s.flashWhite = Math.max(s.flashWhite, BALANCE.flash.orangePeg); }
      else { s.trauma = Math.min(1, s.trauma + BALANCE.trauma.normalPeg); }

      if (p.bomb && !p.green) {
        triggerBomb(s, p, events);
      } else if (!p.boss) {
        spawnParticles(s, p.x, p.y, p.orange, p.orange ? 20 : p.green ? 14 : 8);
      }

      const comboBonus = s.combo >= BALANCE.combo.interval && s.combo % BALANCE.combo.interval === 0;
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

    // Decor collisions (bumpers, planks, arcs, spikes) — inside substep loop
    for (const d of s.decors) {
      if (d.kind === "bumper") {
        const dx = b.x - d.x, dy = b.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const rc = circleCollide(b.x, b.y, b.vx, b.vy, s.effectiveBallR, d.x, d.y, d.r, 0.9);
        if (rc && dist > 0.001) {
          b.vx = rc.vx + (dx / dist) * 1.5;
          b.vy = rc.vy + (dy / dist) * 1.5;
          const overlap = s.effectiveBallR + d.r - dist + 0.5;
          b.x += (dx / dist) * overlap;
          b.y += (dy / dist) * overlap;
          d.flashFrames = 14;
          if (step === 0) events.push({ kind: "sound", id: "bip" });
        }
      } else if (d.kind === "plank") {
        const ax = d.ax ?? d.x + Math.cos(d.angle) * d.len;
        const ay = d.ay ?? d.y + Math.sin(d.angle) * d.len;
        const ex = d.ex ?? d.x - Math.cos(d.angle) * d.len;
        const ey = d.ey ?? d.y - Math.sin(d.angle) * d.len;
        const rc = capsuleCollide(b.x, b.y, b.vx, b.vy, s.effectiveBallR, ax, ay, ex, ey, d.thickness, 0.72);
        if (rc) {
          b.vx = rc.vx; b.vy = rc.vy;
          const cp = closestOnSeg(ax, ay, ex, ey, b.x, b.y);
          const ddx = b.x - cp.x, ddy = b.y - cp.y;
          const ddd = Math.sqrt(ddx * ddx + ddy * ddy);
          if (ddd > 0.001) {
            const ov = s.effectiveBallR + d.thickness - ddd + 0.5;
            b.x += (ddx / ddd) * ov; b.y += (ddy / ddd) * ov;
          }
          d.flashFrames = 10;
          if (step === 0) events.push({ kind: "sound", id: "bip" });
        }
      } else if (d.kind === "arc") {
        const rc = arcCollide(b.x, b.y, b.vx, b.vy, s.effectiveBallR, d.x, d.y, d.r, d.startAngle, d.endAngle, d.thickness, 0.72);
        if (rc) {
          b.vx = rc.vx; b.vy = rc.vy;
          const dx = b.x - d.x, dy = b.y - d.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0.001) {
            const signed = dist - d.r;
            const minReq = s.effectiveBallR + d.thickness / 2;
            if (Math.abs(signed) < minReq) {
              const ov = minReq - Math.abs(signed) + 0.5;
              const sn = signed >= 0 ? 1 : -1;
              b.x += (dx / dist) * sn * ov; b.y += (dy / dist) * sn * ov;
            }
          }
          d.flashFrames = 10;
          if (step === 0) events.push({ kind: "sound", id: "bip" });
        }
      } else if (d.kind === "spike") {
        const rc = spikeCollide(b.x, b.y, b.vx, b.vy, s.effectiveBallR, d.x, d.y, d.size, d.angle, 0.72);
        if (rc) {
          b.vx = rc.vx; b.vy = rc.vy;
          d.flashFrames = 10;
          if (step === 0) events.push({ kind: "sound", id: "bip" });
        }
      }
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
        s.trauma = Math.min(1, s.trauma + BALANCE.trauma.bonusBucketCatch);
        if (bonus > 0) {
          s.score += bonus;
          s.floatingTexts.push({ x: bx + BUCKET_W / 2, y: bucketTop - 14, text: `×${mult} BONUS +${bonus.toLocaleString()}`, life: 1, maxLife: 2.2, color: mult === 5 ? "#ffcc00" : "#cc44ff", combo: true, fontSize: 15 });
        } else {
          s.floatingTexts.push({ x: bx + BUCKET_W / 2, y: bucketTop - 14, text: mult > 1 ? `×${mult} ŒUF RÉCUPÉRÉ!` : "ŒUF RÉCUPÉRÉ!", life: 1, maxLife: 1.8, color: mult === 5 ? "#ffcc00" : mult === 3 ? "#cc44ff" : "#00ffcc", combo: mult > 1, fontSize: 14 });
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
      s.trauma = Math.min(1, s.trauma + BALANCE.trauma.bucketCatch);
      s.floatingTexts.push({ x: s.bucket + BUCKET_W / 2, y: bucketTop - 14, text: "ŒUF RÉCUPÉRÉ!", life: 1, maxLife: 1.8, color: "#00ffcc", combo: true, fontSize: 14 });
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
      b.y = BALANCE.spooky.yReset;
      b.vy = -LAUNCH_SPEED * BALANCE.spooky.reboundSpeed;
      b.vx *= BALANCE.spooky.vxDamp;
      s.flashWhite = Math.max(s.flashWhite, BALANCE.flash.spookySave);
      s.floatingTexts.push({ x: b.x, y: 78, text: ">> L'AIGLE A RATTRAPÉ L'ŒUF!", life: 1, maxLife: 2, color: "#cc88ff", combo: true, fontSize: 14 });
    } else if (isMain && s.phoenixAvailable) {
      s.phoenixAvailable = false;
      b.x = Math.max(s.effectiveBallR, Math.min(W - s.effectiveBallR, b.x));
      b.y = BALANCE.phoenix.yReset;
      b.vy = -LAUNCH_SPEED * BALANCE.phoenix.reboundSpeed;
      b.vx *= BALANCE.phoenix.vxDamp;
      s.flashWhite = Math.max(s.flashWhite, BALANCE.flash.phoenixSave);
      s.trauma = Math.min(1, s.trauma + BALANCE.trauma.phoenixSave);
      s.floatingTexts.push({ x: b.x, y: 78, text: "!! PHÉNIX SAVE!", life: 1, maxLife: 2, color: "#ff8800", combo: true, fontSize: 14 });
    } else {
      if (isMain) s.ballsLostThisLevel++;
      b.active = false;
    }
  }
}
