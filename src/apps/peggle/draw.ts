import { W, H, PEG_R, BALL_R, BUCKET_W, BUCKET_H, FEVER_THRESHOLD, SLOW_MO_DURATION, ZOOM_SCALE, BONUS_BUCKET_XS } from "./constants";
import { computeAimLine } from "./physics";
import type { GameState, Ball, Peg } from "./types";

// Win98 palette
const FACE   = "#c0c0c0"; // button face gray
const HI     = "#ffffff"; // highlight (top-left edges)
const SHD    = "#808080"; // shadow (bottom-right edges)
const DARK   = "#404040"; // outer dark edge
const TEAL   = "#008080"; // Win98 desktop teal
const NAVY   = "#000080"; // Win98 titlebar navy
const BLUE_T = "#1084d0"; // Win98 titlebar light blue

// --- Helpers ---

// Draw Win98 raised bevel arcs clipped to a circle already drawn in the path
function raisedBevel(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();

  // Highlight: left → (clockwise through top) → right = upper half
  ctx.strokeStyle = "rgba(255,255,255,0.82)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r - 1.2, Math.PI, 0, false);
  ctx.stroke();

  // Inner highlight
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r - 2.6, Math.PI * 1.05, Math.PI * (-0.05), false);
  ctx.stroke();

  // Shadow: right → (clockwise through bottom) → left = lower half
  ctx.strokeStyle = "rgba(0,0,0,0.48)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r - 1.2, 0, Math.PI, false);
  ctx.stroke();

  ctx.restore();
}

// Draw a tiny Win98 desktop icon at (x,y), type 0=document 1=folder 2=monitor
function drawDesktopIcon(ctx: CanvasRenderingContext2D, x: number, y: number, type: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;

  if (type === 0) {
    // Document/file icon
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 5, y - 6, 10, 13);
    // Dog-ear fold
    ctx.fillStyle = FACE;
    ctx.fillRect(x + 2, y - 6, 3, 3);
    // Header bar
    ctx.fillStyle = NAVY;
    ctx.fillRect(x - 5, y - 6, 10, 3);
    // Text lines
    ctx.fillStyle = "#888888";
    ctx.fillRect(x - 3, y - 1, 6, 1);
    ctx.fillRect(x - 3, y + 1, 6, 1);
    ctx.fillRect(x - 3, y + 3, 4, 1);
    // Border
    ctx.strokeStyle = "#808080";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x - 5, y - 6, 10, 13);
  } else if (type === 1) {
    // Folder icon
    ctx.fillStyle = "#e8c040";
    ctx.fillRect(x - 6, y - 6, 5, 3);  // tab
    ctx.fillStyle = "#f0d060";
    ctx.fillRect(x - 6, y - 4, 13, 10); // body
    ctx.fillStyle = "#ffe880";
    ctx.fillRect(x - 5, y - 3, 11, 2);  // highlight stripe
    ctx.fillStyle = "#c09820";
    ctx.fillRect(x - 6, y + 5, 13, 1);  // bottom shadow
    ctx.fillRect(x + 6, y - 4, 1, 10);  // right shadow
  } else {
    // Monitor/computer icon
    ctx.fillStyle = FACE;
    ctx.fillRect(x - 7, y - 7, 14, 10); // monitor body
    ctx.fillStyle = NAVY;
    ctx.fillRect(x - 5, y - 5, 10, 6);  // screen
    ctx.fillStyle = "#00aaff";
    ctx.fillRect(x - 4, y - 4, 3, 2);   // window on screen
    ctx.fillStyle = "#00ff44";
    ctx.fillRect(x + 1, y - 4, 2, 1);
    ctx.fillStyle = FACE;
    ctx.fillRect(x - 2, y + 2, 4, 3);   // stand stem
    ctx.fillRect(x - 5, y + 5, 10, 2);  // stand base
    // Raised border on monitor
    ctx.fillStyle = HI;
    ctx.fillRect(x - 7, y - 7, 14, 1);
    ctx.fillRect(x - 7, y - 7, 1, 11);
    ctx.fillStyle = SHD;
    ctx.fillRect(x - 7, y + 3, 14, 1);
    ctx.fillRect(x + 6, y - 7, 1, 11);
  }

  ctx.restore();
}

// Draw a Win98-style chrome/silver ball
function drawBall98(ctx: CanvasRenderingContext2D, ball: Ball, inSlowMo: boolean) {
  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  const speedNorm = Math.min(1, speed / 18);
  const angle = Math.atan2(ball.vy, ball.vx);

  // Trail — faint gray ghost orbs (muted Win98 feel)
  for (let i = 0; i < ball.trail.length; i++) {
    const tp = ball.trail[i]; if (!tp) continue;
    const t = i / ball.trail.length;
    ctx.save();
    ctx.globalAlpha = t * t * 0.3;
    ctx.fillStyle = ball.tint ?? (inSlowMo ? "#aaccff" : FACE);
    ctx.beginPath();
    ctx.arc(tp.x, tp.y, BALL_R * t * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Squash & stretch
  const stretchFactor = 0.22 * speedNorm;
  const rx = BALL_R * (1 + stretchFactor);
  const ry = BALL_R * (1 - stretchFactor * 0.6);

  // Highlight source offset
  const hx = ball.x + Math.cos(angle + Math.PI) * 2.5;
  const hy = ball.y + Math.sin(angle + Math.PI) * 2.5;

  const grad = ctx.createRadialGradient(hx, hy, 0.5, ball.x, ball.y, BALL_R);

  if (inSlowMo) {
    // Win98 selection blue during slow-mo
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.2, "#ccddff");
    grad.addColorStop(0.55, "#4488cc");
    grad.addColorStop(0.85, "#002266");
    grad.addColorStop(1, "#000033");
  } else if (ball.tint) {
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, ball.tint);
    grad.addColorStop(0.7, ball.tint);
    grad.addColorStop(1, "#222222");
  } else {
    // Chrome/silver — Win98 3D ball screensaver
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.18, "#eeeeee");
    grad.addColorStop(0.45, "#c0c0c0");
    grad.addColorStop(0.75, "#888888");
    grad.addColorStop(1, "#404040");
  }

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 5;
  ctx.fillStyle = grad;
  ctx.translate(ball.x, ball.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Specular highlight dot
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  ctx.ellipse(hx, hy, 3.2, 2, angle - 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// Draw a Win98 raised button rectangle
function win98Button(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  face: string,
  sunken = false,
) {
  ctx.fillStyle = face;
  ctx.fillRect(x, y, w, h);

  if (sunken) {
    ctx.fillStyle = DARK;
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillStyle = SHD;
    ctx.fillRect(x + 1, y + 1, w - 2, 1);
    ctx.fillRect(x + 1, y + 1, 1, h - 2);
    ctx.fillStyle = HI;
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x + w - 1, y, 1, h);
  } else {
    ctx.fillStyle = HI;
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillStyle = SHD;
    ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
    ctx.fillRect(x + w - 2, y + 1, 1, h - 2);
    ctx.fillStyle = DARK;
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x + w - 1, y, 1, h);
  }
}

// --- Main draw function ---

export function draw(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  aimAngle: number,
  launcherX: number,
  launcherY: number,
) {
  const orangeLeft = s.pegs.filter(p => p.orange && !p.hit).length;
  const inFever = orangeLeft <= FEVER_THRESHOLD && orangeLeft > 0;
  const feverIntensity = inFever ? (Math.sin(s.feverPulse) * 0.5 + 0.5) : 0;
  const inSlowMo = s.slowMoFrames > 0;
  const hasZoom = s.zoomLevel > 1.01 && s.ball?.active;

  ctx.save();
  if (hasZoom && s.ball) {
    ctx.translate(s.shakeX * 0.4, s.shakeY * 0.4);
    ctx.translate(W / 2, H / 2);
    ctx.scale(s.zoomLevel, s.zoomLevel);
    ctx.translate(-s.ball.x, -s.ball.y);
  } else {
    ctx.translate(s.shakeX, s.shakeY);
  }

  // ── Background ──────────────────────────────────────────────────────────────
  // Fever = desktop "crashing" → BSOD navy pulse; slow-mo = icy teal; normal = Win98 teal
  if (inFever) {
    const b = Math.round(128 + feverIntensity * 55);
    ctx.fillStyle = `rgb(0,0,${b})`;
  } else if (inSlowMo) {
    const t = s.slowMoFrames / SLOW_MO_DURATION;
    ctx.fillStyle = `rgb(${Math.round(t * 20)},${Math.round(128 - t * 20)},${Math.round(128 + t * 50)})`;
  } else {
    ctx.fillStyle = TEAL;
  }
  ctx.fillRect(-Math.abs(s.shakeX) - 10, -Math.abs(s.shakeY) - 10, W + 20, H + 20);

  // Dot grid (Win98 desktop wallpaper texture)
  ctx.fillStyle = "rgba(0,0,0,0.13)";
  for (let gx = 0; gx < W; gx += 16) {
    for (let gy = 0; gy < H; gy += 16) {
      ctx.fillRect(gx, gy, 1, 1);
    }
  }

  // ── Desktop icons (replacing starfield) ─────────────────────────────────────
  for (const star of s.stars) {
    const baseAlpha = star.layer === 0 ? 0.07 : star.layer === 1 ? 0.13 : 0.20;
    // Subtle twinkle → icon "blinks" slightly
    const twinkle = 0.75 + 0.25 * Math.sin(star.phase + s.animClock * (0.5 + star.layer * 0.3));
    drawDesktopIcon(ctx, star.x, star.y, star.layer, baseAlpha * twinkle);
  }

  // Scanlines — subtle CRT monitor feel (Win98 era)
  for (let sy = 0; sy < H; sy += 2) {
    ctx.fillStyle = "rgba(0,0,0,0.045)";
    ctx.fillRect(-10, sy, W + 20, 1);
  }

  // ── Aim line (Win98 dotted selection marching-ants style) ────────────────────
  if (s.phase === "aim") {
    const pts = computeAimLine(launcherX, launcherY, aimAngle, s.pegs);
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]; const cur = pts[i];
      if (!prev || !cur) continue;
      const t = i / pts.length;
      const alpha = t < 0.5 ? 0.6 : 0.6 * (1 - (t - 0.5) / 0.5);
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(cur.x, cur.y); ctx.stroke();
    }
    ctx.restore();
  }

  // ── Warp peg connections (dashed cable/wire) ─────────────────────────────────
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
      const pulse = 0.45 + 0.3 * Math.sin(s.animClock * 3);
      ctx.strokeStyle = `rgba(160,80,255,${pulse})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      ctx.restore();
    }
  }

  // ── Pegs (Win98 raised buttons) ───────────────────────────────────────────────
  for (const p of s.pegs) {
    const alpha = p.popping ? p.popAlpha : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    const pulseExtra = inFever && p.orange ? Math.sin(s.feverPulse * 2) * 1.8 : 0;
    const r = (PEG_R + pulseExtra) * p.scale;

    if (p.warpId !== undefined) {
      // Warp peg: purple shimmer (keep distinctive)
      const wp = 0.6 + 0.4 * Math.sin(s.animClock * 4 + (p.warpId ?? 0) * 2);
      const grad = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, r);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.3, "#dd88ff");
      grad.addColorStop(0.75, "#8800dd");
      grad.addColorStop(1, "#330055");
      ctx.fillStyle = grad;
      if (!p.hit) {
        ctx.shadowColor = "#cc44ff";
        ctx.shadowBlur = 8 + wp * 6;
        ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      if (!p.hit) raisedBevel(ctx, p.x, p.y, r);

    } else if (p.bomb) {
      // Bomb peg: Win98 "error" red button with "!" icon
      ctx.shadowColor = "rgba(180,0,0,0.4)";
      ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1; ctx.shadowBlur = 3;
      ctx.fillStyle = "#cc2200";
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      if (!p.hit) {
        raisedBevel(ctx, p.x, p.y, r);
        // "!" symbol
        ctx.fillStyle = "#ffeeaa";
        ctx.font = `bold ${Math.round(r * 1.15)}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("!", p.x, p.y + 0.5);
        ctx.textBaseline = "alphabetic";
      }

    } else if (p.armorHits > 0) {
      // Armor peg: steel Win98 button (darker gray)
      const sg = ctx.createRadialGradient(p.x - 2, p.y - 2, 1, p.x, p.y, r);
      sg.addColorStop(0, "#dedee4");
      sg.addColorStop(0.45, "#9898a0");
      sg.addColorStop(0.85, "#585860");
      sg.addColorStop(1, "#282830");
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1; ctx.shadowBlur = 3;
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      if (!p.hit) {
        raisedBevel(ctx, p.x, p.y, r);
        // Bolt symbol (armor indicator)
        ctx.strokeStyle = "rgba(200,220,255,0.8)";
        ctx.lineWidth = 1.2; ctx.lineCap = "round";
        const sh = r * 0.45;
        ctx.beginPath();
        ctx.moveTo(p.x - sh * 0.3, p.y - sh);
        ctx.lineTo(p.x + sh * 0.3, p.y);
        ctx.lineTo(p.x - sh * 0.3, p.y);
        ctx.lineTo(p.x + sh * 0.3, p.y + sh);
        ctx.stroke();
      }

    } else if (p.orange) {
      // Orange peg: Win98 ACTIVE TITLEBAR — the "windows to close"
      const tg = ctx.createLinearGradient(p.x - r, p.y - r, p.x + r, p.y + r);
      tg.addColorStop(0, NAVY);
      tg.addColorStop(0.5, BLUE_T);
      tg.addColorStop(1, NAVY);
      ctx.shadowColor = inFever ? "#6699ff" : "rgba(0,0,180,0.55)";
      ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
      ctx.shadowBlur = inFever ? 12 + feverIntensity * 10 : 5;
      ctx.fillStyle = tg;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      if (!p.hit) {
        // Titlebar-style highlight (top arc is lighter blue)
        ctx.save();
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.clip();
        ctx.strokeStyle = "rgba(140,210,255,0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, r - 1.2, Math.PI, 0, false); ctx.stroke();
        ctx.strokeStyle = "rgba(0,0,40,0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, r - 1.2, 0, Math.PI, false); ctx.stroke();
        ctx.restore();
      }

    } else if (p.green) {
      // Green peg: Win98 "OK" / success button with checkmark
      const gg = ctx.createRadialGradient(p.x - 2, p.y - 2, 1, p.x, p.y, r);
      gg.addColorStop(0, "#ddffc0");
      gg.addColorStop(0.4, "#44aa22");
      gg.addColorStop(0.85, "#226611");
      gg.addColorStop(1, "#003300");
      ctx.shadowColor = "rgba(0,180,0,0.35)";
      ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1; ctx.shadowBlur = 3;
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      if (!p.hit) {
        raisedBevel(ctx, p.x, p.y, r);
        // Checkmark
        ctx.strokeStyle = "#ccffaa";
        ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
        const cs = r * 0.4;
        ctx.beginPath();
        ctx.moveTo(p.x - cs, p.y);
        ctx.lineTo(p.x - cs * 0.25, p.y + cs);
        ctx.lineTo(p.x + cs, p.y - cs * 0.7);
        ctx.stroke();
      }

    } else {
      // Normal peg: Win98 gray raised button
      ctx.shadowColor = "rgba(0,0,0,0.28)";
      ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1; ctx.shadowBlur = 2;
      ctx.fillStyle = FACE;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      if (!p.hit) raisedBevel(ctx, p.x, p.y, r);
    }

    // Pop ring (Win98 click ripple)
    if (p.popping) {
      const ringColor = p.orange ? BLUE_T : p.bomb ? "#ff6600" : p.warpId !== undefined ? "#cc88ff" : SHD;
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = alpha * 0.7;
      const ringR = PEG_R + (1 - p.popAlpha) * 22;
      ctx.beginPath(); ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.restore();
  }

  // ── Particles (pixel squares for Win98 pixel art feel) ───────────────────────
  for (const p of s.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    const psz = p.size * Math.max(0, p.life);
    if (p.size <= 2.5) {
      // Small: pixel squares
      ctx.fillRect(p.x - psz / 2, p.y - psz / 2, psz, psz);
    } else {
      // Larger: circles
      ctx.beginPath(); ctx.arc(p.x, p.y, psz, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // ── Balls ────────────────────────────────────────────────────────────────────
  if (s.ball?.active) drawBall98(ctx, s.ball, inSlowMo);
  for (const eb of s.extraBalls) {
    if (eb.active) drawBall98(ctx, eb, inSlowMo);
  }

  // ── Floating texts (Win98 message box style for important events) ─────────────
  for (const t of s.floatingTexts) {
    const lifeRatio = Math.min(1, t.life * 2);
    const fontSize = t.fontSize ?? (t.combo ? 13 : 11);
    ctx.save();
    ctx.globalAlpha = lifeRatio;
    const popScale = 1 + Math.max(0, 1 - t.life * 4) * 0.12;
    ctx.translate(t.x, t.y);
    ctx.scale(popScale, popScale);
    ctx.font = `bold ${fontSize}px "MS Sans Serif", monospace`;
    ctx.textAlign = "center";

    if (t.combo && fontSize >= 13) {
      // Mini Win98 dialog box
      const tw = ctx.measureText(t.text).width;
      const ph = 6, pv = 3;
      const bx = -tw / 2 - ph;
      const by = -fontSize - pv;
      const bw = tw + ph * 2;
      const bh = fontSize + pv * 2;

      // Dialog shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(bx + 2, by + 2, bw, bh);
      // Dialog face
      ctx.fillStyle = FACE;
      ctx.fillRect(bx, by, bw, bh);
      // Raised border
      ctx.fillStyle = HI;
      ctx.fillRect(bx, by, bw, 1);
      ctx.fillRect(bx, by, 1, bh);
      ctx.fillStyle = DARK;
      ctx.fillRect(bx, by + bh - 1, bw, 1);
      ctx.fillRect(bx + bw - 1, by, 1, bh);

      ctx.fillStyle = t.color;
    } else {
      // Small text: black drop shadow then color (readable on teal)
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText(t.text, 1, 1);
      ctx.fillStyle = t.color;
    }

    ctx.fillText(t.text, 0, 0);
    ctx.restore();
  }

  // ── Launcher / Cannon (Win98 raised button with barrel) ──────────────────────
  ctx.save();
  ctx.translate(launcherX, launcherY);

  // Barrel: Win98-style scrollbar arrow button
  if (s.phase === "aim" || s.phase === "firing") {
    ctx.save();
    ctx.rotate(aimAngle);
    // Barrel body
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1; ctx.shadowBlur = 2;
    ctx.fillStyle = FACE;
    ctx.fillRect(6, -5, 28, 10);
    ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    // Raised border on barrel
    ctx.fillStyle = HI;
    ctx.fillRect(6, -5, 28, 1);
    ctx.fillRect(6, -5, 1, 10);
    ctx.fillStyle = SHD;
    ctx.fillRect(6, 4, 28, 1);
    ctx.fillRect(33, -5, 1, 10);
    // Grip lines
    ctx.fillStyle = SHD;
    for (let gx = 14; gx <= 28; gx += 4) {
      ctx.fillRect(gx, -3, 1, 6);
    }
    // Tip ring (Win98 scroll arrow button)
    ctx.fillStyle = FACE;
    ctx.beginPath(); ctx.arc(34, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = HI;
    ctx.beginPath(); ctx.arc(34, 0, 5, Math.PI, 0, false); ctx.fill();
    ctx.fillStyle = SHD;
    ctx.beginPath(); ctx.arc(34, 0, 5, 0, Math.PI, false); ctx.fill();
    ctx.restore();
  }

  // Base: Win98 raised circular button
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.shadowBlur = 5;
  ctx.fillStyle = FACE;
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  raisedBevel(ctx, 0, 0, 14);

  // Center: crosshair (aiming) or dot (firing)
  ctx.strokeStyle = s.phase === "aim" ? NAVY : DARK;
  ctx.lineWidth = 1.8; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.stroke();
  ctx.fillStyle = s.phase === "aim" ? NAVY : SHD;
  ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();

  ctx.restore();

  // ── Bucket(s) (Win98 taskbar buttons) ────────────────────────────────────────
  const bucketTop = H - BUCKET_H - 4;
  ctx.save();

  if (s.balls === 0 && s.phase === "firing") {
    // Last ball: 3 bonus buckets
    const styleForMult = (m: number) => m === 5
      ? { face: "#c8a800", text: "#000000", label: "×5 BONUS" }
      : m === 3
      ? { face: NAVY, text: "#ffffff", label: "×3 BONUS" }
      : { face: FACE, text: "#000000", label: "FREE BALL" };

    for (let i = 0; i < 3; i++) {
      const bx = BONUS_BUCKET_XS[i]!;
      const by = bucketTop;
      const flash = s.bonusBucketFlash[i] ?? 0;
      const mult = s.bonusBucketMults[i] ?? 1;
      const style = styleForMult(mult);

      win98Button(ctx, bx, by, BUCKET_W, BUCKET_H, style.face, flash > 0);

      ctx.fillStyle = flash > 0 ? HI : style.text;
      ctx.font = `bold 8px "MS Sans Serif", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(style.label, bx + BUCKET_W / 2, by + BUCKET_H - 5);
    }
  } else {
    // Normal single moving bucket
    const bx = s.bucket, by = bucketTop;
    const isFlash = s.bucketFlash > 0;
    win98Button(ctx, bx, by, BUCKET_W, BUCKET_H, FACE, isFlash);
    ctx.fillStyle = isFlash ? NAVY : "#000000";
    ctx.font = `bold 8px "MS Sans Serif", monospace`;
    ctx.textAlign = "center";
    ctx.fillText("FREE BALL", bx + BUCKET_W / 2, by + BUCKET_H - 5);
  }

  ctx.restore();

  // Floor strip (Win98 taskbar bottom bar)
  ctx.fillStyle = FACE;
  ctx.fillRect(0, H - 3, W, 3);
  ctx.fillStyle = HI;
  ctx.fillRect(0, H - 3, W, 1);

  ctx.restore(); // end camera transform

  // ── Inner canvas bezel (Win98 sunken border, draws after game objects) ───────
  ctx.save();
  ctx.lineWidth = 1;
  // Top + left edges: shadow (dark)
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, 0); ctx.lineTo(W, 0); ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.moveTo(1, H - 1); ctx.lineTo(1, 1); ctx.lineTo(W - 1, 1); ctx.stroke();
  // Bottom + right edges: highlight (light)
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, H); ctx.moveTo(W, 0); ctx.lineTo(W, H); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath(); ctx.moveTo(1, H - 1); ctx.lineTo(W - 1, H - 1); ctx.moveTo(W - 1, 1); ctx.lineTo(W - 1, H - 1); ctx.stroke();
  ctx.restore();

  // ── Screen flash ─────────────────────────────────────────────────────────────
  if (s.flashWhite > 0) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, s.flashWhite * 0.36);
    // Fever flash is blue (BSOD style), normal is white
    ctx.fillStyle = inFever ? "#0000cc" : "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ── Vignette during zoom slow-mo ─────────────────────────────────────────────
  if (s.zoomLevel > 1.05) {
    const vigAlpha = Math.min(0.45, (s.zoomLevel - 1) / (ZOOM_SCALE - 1) * 0.45);
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.85);
    vig.addColorStop(0, "transparent");
    vig.addColorStop(1, `rgba(0,0,80,${vigAlpha})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }
}
