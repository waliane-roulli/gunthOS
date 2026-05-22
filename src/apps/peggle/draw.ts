import { W, H, PEG_R, BALL_R, BUCKET_W, BUCKET_H, FEVER_THRESHOLD, SLOW_MO_DURATION } from "./constants";
import { computeAimLine } from "./physics";
import type { GameState } from "./types";

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

  ctx.save();
  ctx.translate(s.shakeX, s.shakeY);

  const bgR = Math.round(10 + feverIntensity * 30);
  const bgG = Math.round(10 + feverIntensity * 5);
  const bgB = inSlowMo ? Math.round(26 + (s.slowMoFrames / SLOW_MO_DURATION) * 60) : 26;
  ctx.fillStyle = `rgb(${bgR},${bgG},${bgB})`;
  ctx.fillRect(-Math.abs(s.shakeX) - 4, -Math.abs(s.shakeY) - 4, W + 8, H + 8);

  ctx.strokeStyle = `rgba(255,255,255,${0.03 + feverIntensity * 0.04})`;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  if (inFever) {
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.8);
    vg.addColorStop(0, "transparent");
    vg.addColorStop(1, `rgba(220,30,0,${0.18 * feverIntensity})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  if (inSlowMo) {
    const slowAlpha = (s.slowMoFrames / SLOW_MO_DURATION) * 0.22;
    const sg = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.9);
    sg.addColorStop(0, "transparent");
    sg.addColorStop(1, `rgba(80,140,255,${slowAlpha})`);
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);
  }

  if (s.phase === "aim") {
    const pts = computeAimLine(launcherX, launcherY, aimAngle, s.pegs);
    ctx.save();
    ctx.setLineDash([4, 5]);
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "rgba(255,255,100,0.3)";
    ctx.shadowBlur = 4;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]; const cur = pts[i];
      if (!prev || !cur) continue;
      const t = i / pts.length;
      const alpha = t < 0.6 ? 0.4 : 0.4 * (1 - (t - 0.6) / 0.4);
      ctx.strokeStyle = `rgba(255,255,180,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  for (const p of s.pegs) {
    const alpha = p.popping ? p.popAlpha : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    const pulseExtra = inFever && p.orange ? Math.sin(s.feverPulse * 2) * 2 : 0;
    const r = (PEG_R + pulseExtra) * p.scale;

    if (p.orange) {
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
      grad.addColorStop(0, "#fff8cc");
      grad.addColorStop(0.35, "#ff9900");
      grad.addColorStop(0.75, "#dd4400");
      grad.addColorStop(1, "#991100");
      ctx.fillStyle = grad;
      if (!p.hit) {
        ctx.shadowColor = inFever ? "#ff3300" : "#ff8800";
        ctx.shadowBlur = inFever ? 18 + feverIntensity * 10 : 12;
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
        ctx.shadowBlur = 14 + Math.sin(s.feverPulse * 1.5) * 4;
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

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath(); ctx.ellipse(p.x - 2, p.y - 2.5, r * 0.35, r * 0.25, -0.3, 0, Math.PI * 2); ctx.fill();

    if (p.popping) {
      ctx.strokeStyle = p.orange ? "#ffcc00" : "#66aaff";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = alpha * 0.8;
      const ringR = PEG_R + (1 - p.popAlpha) * 22;
      ctx.beginPath(); ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = alpha * 0.4;
      ctx.beginPath(); ctx.arc(p.x, p.y, ringR * 0.6, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  for (const p of s.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * Math.max(0, p.life), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (s.ball?.active) {
    const trail = s.ball.trail;
    for (let i = 0; i < trail.length; i++) {
      const tp = trail[i]; if (!tp) continue;
      const t = i / trail.length;
      const speedFactor = Math.min(1, (tp.speed || 8) / 18);
      ctx.save();
      ctx.globalAlpha = t * t * 0.65;
      const hot = t > 0.65;
      ctx.fillStyle = hot ? "#ffffcc" : "#ffaa44";
      ctx.shadowColor = hot ? "#ffff88" : "#ff8800";
      ctx.shadowBlur = 4 + speedFactor * 12;
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, BALL_R * t * (0.8 + speedFactor * 0.35), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const grad = ctx.createRadialGradient(s.ball.x - 3, s.ball.y - 3, 1, s.ball.x, s.ball.y, BALL_R);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, "#fffacc");
    grad.addColorStop(0.7, "#ffcc00");
    grad.addColorStop(1, "#cc8800");
    ctx.fillStyle = grad;
    ctx.shadowColor = inSlowMo ? "#88ccff" : "#ffdd00";
    ctx.shadowBlur = inSlowMo ? 28 : 18;
    ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath(); ctx.ellipse(s.ball.x - 3, s.ball.y - 3, 3, 2, -0.5, 0, Math.PI * 2); ctx.fill();
  }

  for (const t of s.floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, t.life * 2);
    ctx.font = t.combo ? "bold 13px monospace" : "bold 11px monospace";
    ctx.fillStyle = t.color;
    ctx.textAlign = "center";
    ctx.shadowColor = t.color;
    ctx.shadowBlur = t.combo ? 12 : 6;
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }

  ctx.save();
  ctx.translate(launcherX, launcherY);
  const launchGrad = ctx.createRadialGradient(-2, -3, 2, 0, 0, 14);
  launchGrad.addColorStop(0, "#cccccc");
  launchGrad.addColorStop(0.5, "#888888");
  launchGrad.addColorStop(1, "#333333");
  ctx.fillStyle = launchGrad;
  ctx.strokeStyle = "#bbbbbb"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (s.phase === "aim") {
    ctx.save(); ctx.rotate(aimAngle);
    const barGrad = ctx.createLinearGradient(0, -5, 0, 5);
    barGrad.addColorStop(0, "#dddddd");
    barGrad.addColorStop(1, "#888888");
    ctx.fillStyle = barGrad;
    ctx.strokeStyle = "#eeeeee"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(2, -4, 22, 8, 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#aaaaff"; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  const bx = s.bucket, by = H - BUCKET_H - 4;
  ctx.save();
  const bucketGlow = s.bucketFlash > 0 ? s.bucketFlash : 1;
  ctx.shadowColor = s.bucketFlash > 0 ? "#ffffff" : "#00ffcc";
  ctx.shadowBlur = 8 + bucketGlow * 20;

  const bucketGrad = ctx.createLinearGradient(bx, by, bx, by + BUCKET_H);
  bucketGrad.addColorStop(0, s.bucketFlash > 0 ? `rgba(200,255,240,${0.3 + s.bucketFlash * 0.7})` : "#005544");
  bucketGrad.addColorStop(1, s.bucketFlash > 0 ? `rgba(0,255,200,${0.5 + s.bucketFlash * 0.5})` : "#003322");
  ctx.fillStyle = bucketGrad;
  ctx.strokeStyle = s.bucketFlash > 0 ? `rgba(255,255,255,${0.5 + s.bucketFlash * 0.5})` : "#00ffcc";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(bx, by, BUCKET_W, BUCKET_H, 3); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = `rgba(0,255,200,${0.15 + s.bucketFlash * 0.2})`;
  ctx.beginPath(); ctx.roundRect(bx + 3, by + 3, BUCKET_W - 6, BUCKET_H / 2 - 2, 2); ctx.fill();
  ctx.fillStyle = s.bucketFlash > 0 ? "#ffffff" : "#00ffcc";
  ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
  ctx.fillText("FREE BALL", bx + BUCKET_W / 2, by + BUCKET_H - 5);
  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, H - 3, W, 3);

  ctx.restore();

  if (s.flashWhite > 0) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, s.flashWhite * 0.35);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}
