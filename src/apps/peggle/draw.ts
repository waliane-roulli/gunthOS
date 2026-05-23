import { W, H, PEG_R, BALL_R, BUCKET_W, BUCKET_H, FEVER_THRESHOLD, SLOW_MO_DURATION, ZOOM_SCALE, BONUS_BUCKET_XS } from "./constants";
import { computeAimLine } from "./physics";
import type { GameState, Ball, Peg } from "./types";

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball, inSlowMo: boolean) {
  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  const speedNorm = Math.min(1, speed / 18);

  // Directional trail — ghost copies with decreasing opacity
  for (let i = 0; i < ball.trail.length; i++) {
    const tp = ball.trail[i]; if (!tp) continue;
    const t = i / ball.trail.length;
    const trailSpeed = Math.min(1, (tp.speed || 8) / 18);
    ctx.save();
    ctx.globalAlpha = t * t * 0.7;
    // Color shifts white→yellow→orange with speed
    const hot = t > 0.6;
    const baseColor = ball.tint ?? (hot ? "#ffffcc" : "#ffaa44");
    ctx.fillStyle = baseColor;
    ctx.shadowColor = ball.tint ?? (hot ? "#ffff88" : "#ff8800");
    ctx.shadowBlur = 4 + trailSpeed * 14;
    ctx.beginPath();
    ctx.arc(tp.x, tp.y, BALL_R * t * (0.7 + trailSpeed * 0.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Squash & stretch: stretch ellipse in direction of velocity
  const stretchFactor = 0.25 * speedNorm;
  const angle = Math.atan2(ball.vy, ball.vx);
  const rx = BALL_R * (1 + stretchFactor);
  const ry = BALL_R * (1 - stretchFactor * 0.6);

  const tintColor = ball.tint;
  const grad = ctx.createRadialGradient(
    ball.x + Math.cos(angle + Math.PI) * 3,
    ball.y + Math.sin(angle + Math.PI) * 3,
    1,
    ball.x, ball.y, BALL_R
  );
  if (tintColor) {
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, tintColor);
    grad.addColorStop(0.7, tintColor);
    grad.addColorStop(1, "#222222");
  } else {
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, "#fffacc");
    grad.addColorStop(0.7, "#ffcc00");
    grad.addColorStop(1, "#cc8800");
  }

  ctx.fillStyle = grad;
  ctx.shadowColor = inSlowMo ? "#88ccff" : (tintColor ?? "#ffdd00");
  ctx.shadowBlur = inSlowMo ? 28 : 18;
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Shine highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.ellipse(
    ball.x + Math.cos(angle + Math.PI) * 3,
    ball.y + Math.sin(angle + Math.PI) * 3,
    3, 2, angle, 0, Math.PI * 2
  );
  ctx.fill();
}

export function draw(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  aimAngle: number,
  launcherX: number,
  launcherY: number
) {
  const orangeLeft = s.pegs.filter(p => p.orange && !p.hit).length;
  const inFever = orangeLeft <= FEVER_THRESHOLD && orangeLeft > 0;
  const feverIntensity = inFever ? (Math.sin(s.feverPulse) * 0.5 + 0.5) : 0;
  const inSlowMo = s.slowMoFrames > 0;

  // Camera zoom toward ball on last-peg slow-mo
  const hasZoom = s.zoomLevel > 1.01 && s.ball?.active;

  ctx.save();
  if (hasZoom && s.ball) {
    ctx.translate(s.shakeX * 0.4, s.shakeY * 0.4); // dampened shake during zoom
    ctx.translate(W / 2, H / 2);
    ctx.scale(s.zoomLevel, s.zoomLevel);
    ctx.translate(-s.ball.x, -s.ball.y);
  } else {
    ctx.translate(s.shakeX, s.shakeY);
  }

  // Background
  const bgR = Math.round(8 + feverIntensity * 35);
  const bgG = Math.round(6 + feverIntensity * 4);
  const bgB = inSlowMo ? Math.round(22 + (s.slowMoFrames / SLOW_MO_DURATION) * 55) : 22;
  ctx.fillStyle = `rgb(${bgR},${bgG},${bgB})`;
  ctx.fillRect(-Math.abs(s.shakeX) - 10, -Math.abs(s.shakeY) - 10, W + 20, H + 20);

  // Parallax starfield
  for (const star of s.stars) {
    const twinkle = 0.55 + 0.45 * Math.sin(star.phase + s.animClock * (1 + star.layer * 0.4));
    const baseAlpha = star.layer === 0 ? 0.15 : star.layer === 1 ? 0.45 : 0.85;
    ctx.globalAlpha = baseAlpha * twinkle;
    ctx.fillStyle = star.layer === 2 ? "#ffffff" : star.layer === 1 ? "#aaccff" : "#6688aa";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Subtle grid (very faint)
  ctx.strokeStyle = `rgba(255,255,255,${0.018 + feverIntensity * 0.025})`;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Fever radial overlay
  if (inFever) {
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.85);
    vg.addColorStop(0, "transparent");
    vg.addColorStop(1, `rgba(220,30,0,${0.22 * feverIntensity})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  // Slow-mo blue overlay
  if (inSlowMo) {
    const slowAlpha = (s.slowMoFrames / SLOW_MO_DURATION) * 0.18;
    const sg = ctx.createRadialGradient(W / 2, H / 2, H * 0.05, W / 2, H / 2, H * 0.95);
    sg.addColorStop(0, "transparent");
    sg.addColorStop(1, `rgba(60,120,255,${slowAlpha})`);
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);
  }

  // Aim line
  if (s.phase === "aim") {
    const pts = computeAimLine(launcherX, launcherY, aimAngle, s.pegs);
    ctx.save();
    ctx.setLineDash([4, 5]);
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "rgba(255,255,100,0.35)";
    ctx.shadowBlur = 5;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]; const cur = pts[i];
      if (!prev || !cur) continue;
      const t = i / pts.length;
      const alpha = t < 0.55 ? 0.45 : 0.45 * (1 - (t - 0.55) / 0.45);
      ctx.strokeStyle = `rgba(255,255,180,${alpha})`;
      ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(cur.x, cur.y); ctx.stroke();
    }
    ctx.restore();
  }

  // Warp peg connecting arcs (draw before pegs)
  const warpMap = new Map<number, Peg[]>();
  for (const p of s.pegs) {
    if (p.warpId !== undefined && !p.hit) {
      const arr = warpMap.get(p.warpId) ?? [];
      arr.push(p);
      warpMap.set(p.warpId, arr);
    }
  }
  for (const [, pair] of warpMap) {
    if (pair.length === 2) {
      const [pa, pb] = pair as [Peg, Peg];
      ctx.save();
      const pulse = 0.4 + 0.3 * Math.sin(s.animClock * 3);
      ctx.strokeStyle = `rgba(160,80,255,${pulse})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.shadowColor = "#aa44ff";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Pegs
  for (const p of s.pegs) {
    const alpha = p.popping ? p.popAlpha : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    const pulseExtra = inFever && p.orange ? Math.sin(s.feverPulse * 2) * 2 : 0;
    const r = (PEG_R + pulseExtra) * p.scale;

    if (p.warpId !== undefined) {
      // Warp peg: purple shimmer
      const warpPulse = 0.6 + 0.4 * Math.sin(s.animClock * 4 + p.warpId * 2);
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.3, "#dd88ff");
      grad.addColorStop(0.75, "#8800dd");
      grad.addColorStop(1, "#330055");
      ctx.fillStyle = grad;
      if (!p.hit) {
        ctx.shadowColor = "#cc44ff";
        ctx.shadowBlur = 10 + warpPulse * 8;
      }
    } else if (p.bomb) {
      // Bomb peg: red with warning pulse
      const bombPulse = 0.5 + 0.5 * Math.sin(s.animClock * 5);
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
      grad.addColorStop(0, "#ffeecc");
      grad.addColorStop(0.3, "#ff4400");
      grad.addColorStop(0.7, "#cc1100");
      grad.addColorStop(1, "#660000");
      ctx.fillStyle = grad;
      if (!p.hit) {
        ctx.shadowColor = "#ff2200";
        ctx.shadowBlur = 8 + bombPulse * 12;
      }
      // Warning ring
      if (!p.hit) {
        ctx.strokeStyle = `rgba(255,150,0,${0.3 + bombPulse * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 4 + bombPulse * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (p.armorHits > 0) {
      // Armor peg: intact steel
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
      grad.addColorStop(0, "#eeeeff");
      grad.addColorStop(0.3, "#aabbcc");
      grad.addColorStop(0.7, "#556677");
      grad.addColorStop(1, "#223344");
      ctx.fillStyle = grad;
      if (!p.hit) { ctx.shadowColor = "#aaccee"; ctx.shadowBlur = 6; }
    } else if (p.armorHits === 0 && !p.orange && !p.green && !p.bomb && !p.warpId) {
      // Check if this is a cracked armor peg (was armor, took first hit)
      // We detect cracked state by: hitCooldown recently set — but that info isn't persistent
      // Actually armorHits=0 for normal pegs too. We can't distinguish without an extra flag.
      // This is a design simplification: just draw normal for now.
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
      grad.addColorStop(0, "#cceeff");
      grad.addColorStop(0.4, "#3377dd");
      grad.addColorStop(0.8, "#1144aa");
      grad.addColorStop(1, "#001166");
      ctx.fillStyle = grad;
      if (!p.hit) { ctx.shadowColor = "#3366cc"; ctx.shadowBlur = 6; }
    } else if (p.orange) {
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
      grad.addColorStop(0, "#fff8cc");
      grad.addColorStop(0.35, "#ff9900");
      grad.addColorStop(0.75, "#dd4400");
      grad.addColorStop(1, "#991100");
      ctx.fillStyle = grad;
      if (!p.hit) {
        ctx.shadowColor = inFever ? "#ff3300" : "#ff8800";
        ctx.shadowBlur = inFever ? 18 + feverIntensity * 12 : 12;
      }
    } else if (p.green) {
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
      grad.addColorStop(0, "#eeffcc");
      grad.addColorStop(0.35, "#44ff88");
      grad.addColorStop(0.75, "#00bb44");
      grad.addColorStop(1, "#005522");
      ctx.fillStyle = grad;
      if (!p.hit) {
        ctx.shadowColor = "#00ff66";
        ctx.shadowBlur = 14 + Math.sin(s.animClock * 2) * 4;
      }
    } else {
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
      grad.addColorStop(0, "#cceeff");
      grad.addColorStop(0.4, "#3377dd");
      grad.addColorStop(0.8, "#1144aa");
      grad.addColorStop(1, "#001166");
      ctx.fillStyle = grad;
      if (!p.hit) { ctx.shadowColor = "#3366cc"; ctx.shadowBlur = 6; }
    }

    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();

    // Shine
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath(); ctx.ellipse(p.x - 2, p.y - 2.5, r * 0.33, r * 0.22, -0.3, 0, Math.PI * 2); ctx.fill();

    // Bomb cross symbol
    if (p.bomb && !p.hit) {
      ctx.strokeStyle = "rgba(255,220,100,0.8)";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      const s2 = r * 0.4;
      ctx.beginPath(); ctx.moveTo(p.x - s2, p.y); ctx.lineTo(p.x + s2, p.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x, p.y - s2); ctx.lineTo(p.x, p.y + s2); ctx.stroke();
    }

    // Armor bolt symbol
    if (p.armorHits > 0 && !p.hit) {
      ctx.strokeStyle = "rgba(180,220,255,0.7)";
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";
      const sh = r * 0.45;
      ctx.beginPath();
      ctx.moveTo(p.x - sh * 0.3, p.y - sh);
      ctx.lineTo(p.x + sh * 0.3, p.y);
      ctx.lineTo(p.x - sh * 0.3, p.y);
      ctx.lineTo(p.x + sh * 0.3, p.y + sh);
      ctx.stroke();
    }

    // Pop ring animation
    if (p.popping) {
      const ringColor = p.orange ? "#ffcc00" : p.bomb ? "#ff6600" : p.warpId !== undefined ? "#cc88ff" : "#66aaff";
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = alpha * 0.8;
      const ringR = PEG_R + (1 - p.popAlpha) * 24;
      ctx.beginPath(); ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 0.7;
      ctx.globalAlpha = alpha * 0.35;
      ctx.beginPath(); ctx.arc(p.x, p.y, ringR * 0.55, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.restore();
  }

  // Particles
  for (const p of s.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * Math.max(0, p.life), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Main ball
  if (s.ball?.active) drawBall(ctx, s.ball, inSlowMo);

  // Extra balls (multiball)
  for (const eb of s.extraBalls) {
    if (eb.active) drawBall(ctx, eb, inSlowMo);
  }

  // Floating texts — size scales with fontSize field
  for (const t of s.floatingTexts) {
    const lifeRatio = Math.min(1, t.life * 2);
    const fontSize = t.fontSize ?? (t.combo ? 13 : 11);
    ctx.save();
    ctx.globalAlpha = lifeRatio;
    // Scale-bounce: starts big, settles at 1
    const scaleBouncePct = Math.max(0, 1 - t.life) * 0.3;
    const textScale = 1 + (1 - Math.min(1, (1 - t.life) * 4)) * scaleBouncePct;
    ctx.translate(t.x, t.y);
    ctx.scale(textScale, textScale);
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillStyle = t.color;
    ctx.textAlign = "center";
    ctx.shadowColor = t.color;
    ctx.shadowBlur = t.combo ? 14 : 7;
    ctx.fillText(t.text, 0, 0);
    ctx.restore();
  }

  // Cannon launcher
  ctx.save();
  ctx.translate(launcherX, launcherY);

  // Barrel (rotates with aim)
  if (s.phase === "aim" || s.phase === "firing") {
    ctx.save();
    ctx.rotate(aimAngle);
    const barrelGrad = ctx.createLinearGradient(0, -5, 0, 5);
    barrelGrad.addColorStop(0, "#ddddee");
    barrelGrad.addColorStop(0.5, "#aaaabc");
    barrelGrad.addColorStop(1, "#555566");
    ctx.fillStyle = barrelGrad;
    ctx.strokeStyle = "#ccccdd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(6, -5, 26, 10, 3);
    ctx.fill();
    ctx.stroke();
    // Barrel tip ring
    ctx.strokeStyle = "#eeeeff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(32, 0, 5.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Base sphere
  const launchGrad = ctx.createRadialGradient(-2, -3, 2, 0, 0, 14);
  launchGrad.addColorStop(0, "#ccccdd");
  launchGrad.addColorStop(0.5, "#888899");
  launchGrad.addColorStop(1, "#333344");
  ctx.fillStyle = launchGrad;
  ctx.strokeStyle = "#bbbbcc";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Center glow dot
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = s.phase === "aim" ? "#aaaaff" : "#ffcc44";
  ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Bucket(s)
  const bucketTop = H - BUCKET_H - 4;
  ctx.save();

  if (s.balls === 0 && s.phase === "firing") {
    // Last ball: draw 3 bonus buckets at fixed positions, order randomised
    const styleForMult = (m: number) => m === 5
      ? { bg0: "#554400", bg1: "#332200", glow: "#ffcc00" }
      : m === 3
      ? { bg0: "#330044", bg1: "#1a0022", glow: "#cc44ff" }
      : { bg0: "#005544", bg1: "#003322", glow: "#00ffcc" };
    for (let i = 0; i < 3; i++) {
      const bx = BONUS_BUCKET_XS[i]!;
      const by = bucketTop;
      const flash = s.bonusBucketFlash[i] ?? 0;
      const mult = s.bonusBucketMults[i] ?? 1;
      const style = styleForMult(mult);

      ctx.shadowColor = flash > 0 ? "#ffffff" : style.glow;
      ctx.shadowBlur = 8 + (flash > 0 ? flash : 0.4) * 22;

      const grad = ctx.createLinearGradient(bx, by, bx, by + BUCKET_H);
      grad.addColorStop(0, flash > 0 ? `rgba(200,255,240,${0.3 + flash * 0.7})` : style.bg0);
      grad.addColorStop(1, flash > 0 ? `rgba(0,255,200,${0.5 + flash * 0.5})` : style.bg1);
      ctx.fillStyle = grad;
      ctx.strokeStyle = flash > 0 ? `rgba(255,255,255,${0.5 + flash * 0.5})` : style.glow;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(bx, by, BUCKET_W, BUCKET_H, 3); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = flash > 0 ? "#ffffff" : style.glow;
      ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
      ctx.fillText(`×${mult}`, bx + BUCKET_W / 2, by + BUCKET_H - 5);
    }
  } else {
    // Normal single moving bucket
    const bx = s.bucket, by = bucketTop;
    const bucketGlow = s.bucketFlash > 0 ? s.bucketFlash : 1;
    ctx.shadowColor = s.bucketFlash > 0 ? "#ffffff" : "#00ffcc";
    ctx.shadowBlur = 8 + bucketGlow * 22;

    const bucketGrad = ctx.createLinearGradient(bx, by, bx, by + BUCKET_H);
    bucketGrad.addColorStop(0, s.bucketFlash > 0 ? `rgba(200,255,240,${0.3 + s.bucketFlash * 0.7})` : "#005544");
    bucketGrad.addColorStop(1, s.bucketFlash > 0 ? `rgba(0,255,200,${0.5 + s.bucketFlash * 0.5})` : "#003322");
    ctx.fillStyle = bucketGrad;
    ctx.strokeStyle = s.bucketFlash > 0 ? `rgba(255,255,255,${0.5 + s.bucketFlash * 0.5})` : "#00ffcc";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(bx, by, BUCKET_W, BUCKET_H, 3); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = `rgba(0,255,200,${0.12 + s.bucketFlash * 0.2})`;
    ctx.beginPath(); ctx.roundRect(bx + 3, by + 3, BUCKET_W - 6, BUCKET_H / 2 - 2, 2); ctx.fill();
    ctx.fillStyle = s.bucketFlash > 0 ? "#ffffff" : "#00ffcc";
    ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
    ctx.fillText("FREE BALL", bx + BUCKET_W / 2, by + BUCKET_H - 5);
  }

  ctx.restore();

  // Floor strip
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(0, H - 3, W, 3);

  ctx.restore(); // end camera transform

  // Screen flash (no zoom applied)
  if (s.flashWhite > 0) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, s.flashWhite * 0.38);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Zoom vignette during slow-mo
  if (s.zoomLevel > 1.05) {
    const vigAlpha = Math.min(0.45, (s.zoomLevel - 1) / (ZOOM_SCALE - 1) * 0.45);
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.85);
    vig.addColorStop(0, "transparent");
    vig.addColorStop(1, `rgba(0,20,60,${vigAlpha})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }
}
