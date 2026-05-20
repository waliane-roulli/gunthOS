"use client";

import { useEffect, useRef, useState } from "react";
import type { WallpaperId } from "@/lib/wallpapers";

interface Props {
  decorationKey: string;
  wallpaperId: WallpaperId;
}

export function WallpaperDecoration({ decorationKey, wallpaperId }: Props) {
  switch (decorationKey) {
    case "win95_default": return <Win95Default />;
    case "matrix": return <MatrixRain />;
    case "space": return <StarField />;
    case "pizza": return <PizzaRain />;
    case "cats": return <CatSwarm />;
    case "bsod": return <BsodScreen />;
    case "windows_error": return <WindowsErrors />;
    case "doge": return <DogeWallpaper />;
    case "nyan": return <NyanWallpaper />;
    case "stonks": return <StonksChart />;
    case "xphill": return <XpHillDecor />;
    case "vaporwave_grid": return <VaporwaveGrid />;
    case "dark_souls": return <DarkSoulsScreen />;
    case "loading": return <LoadingScreen />;
    case "clippy": return <ClippyWallpaper />;
    case "404": return <NotFoundWallpaper />;
    case "dial_up": return <DialUpWallpaper />;
    case "among_us": return <AmongUsWallpaper />;
    case "todo_list": return <TodoListWallpaper />;
    case "this_is_fine": return <ThisIsFineWallpaper />;
    case "rickroll": return <RickrollWallpaper />;
    case "aquarium": return <AquariumWallpaper />;
    case "lemmings": return <LemmingsWallpaper />;
    case "coffee": return <CoffeeWallpaper />;
    case "windows_update": return <WindowsUpdateWallpaper />;
    case "confetti": return <ConfettiWallpaper />;
    case "printer": return <PrinterWallpaper />;
    case "captcha": return <CaptchaWallpaper />;
    case "snake": return <SnakeWallpaper />;
    case "tamagotchi": return <TamagotchiWallpaper />;
    case "horaire_sncf": return <SncfWallpaper />;
    case "startup_sound": return <StartupSoundWallpaper />;
    case "recycle_bin": return <RecycleBinWallpaper />;
    case "defrag": return <DefragWallpaper />;
    case "wifi_bars": return <WifiWallpaper />;
    case "boomer_forward": return <BoomerForwardWallpaper />;
    default: return null;
  }
}

/* ─── Matrix Rain ─────────────────────────────────────────── */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
    const fontSize = 14;
    let cols = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(cols).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0,5,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff41";
      ctx.font = `${fontSize}px monospace`;

      cols = Math.floor(canvas.width / fontSize);
      while (drops.length < cols) drops.push(Math.random() * canvas.height / fontSize);

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = i % 7 === 0 ? "#ccffcc" : "#00ff41";
        ctx.fillText(char!, i * fontSize, drops[i]! * fontSize);
        if (drops[i]! * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]!++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/* ─── Star Field ──────────────────────────────────────────── */
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random(),
      twinkle: Math.random() * Math.PI * 2,
    }));

    const shooting: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

    let frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,16,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frame++;
      if (frame % 120 === 0) {
        shooting.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          vx: 4 + Math.random() * 3,
          vy: 2 + Math.random() * 2,
          life: 40,
        });
      }

      for (const s of stars) {
        s.twinkle += 0.02;
        const a = 0.4 + Math.sin(s.twinkle) * 0.4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }

      for (let i = shooting.length - 1; i >= 0; i--) {
        const s = shooting[i]!;
        const alpha = s.life / 40;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
        ctx.strokeStyle = `rgba(255,255,200,${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        s.x += s.vx;
        s.y += s.vy;
        s.life--;
        if (s.life <= 0) shooting.splice(i, 1);
      }

      // Occasional planet
      ctx.beginPath();
      const grad = ctx.createRadialGradient(
        canvas.width * 0.75, canvas.height * 0.3, 5,
        canvas.width * 0.75, canvas.height * 0.3, 60
      );
      grad.addColorStop(0, "rgba(100,160,255,0.4)");
      grad.addColorStop(1, "rgba(50,80,200,0.0)");
      ctx.arc(canvas.width * 0.75, canvas.height * 0.3, 60, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none" style={{ zIndex: 1, fontFamily: "monospace", color: "rgba(255,255,255,0.08)", fontSize: "10px", textAlign: "center" }}>
        SYSTÈME SOLAIRE NON TROUVÉ
      </div>
    </>
  );
}

/* ─── Pizza Rain ──────────────────────────────────────────── */
function PizzaRain() {
  const emojis = ["🍕", "🍕", "🍕", "🧀", "🍅", "🫒", "🌶️"];
  const [items] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 95,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 4,
      size: 24 + Math.random() * 32,
      rotate: Math.random() * 360,
    }))
  );

  return (
    <>
      <style>{`
        @keyframes pizzaFall {
          0% { transform: translateY(-80px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute pointer-events-none"
          style={{
            left: `${item.left}%`,
            top: 0,
            fontSize: item.size,
            animation: `pizzaFall ${item.duration}s ${item.delay}s infinite linear`,
            zIndex: 0,
            filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.4))",
          }}
        >
          {item.emoji}
        </div>
      ))}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 1, fontFamily: "monospace" }}
      >
        <div style={{
          color: "rgba(255,200,100,0.15)",
          fontSize: "clamp(40px, 8vw, 120px)",
          fontWeight: "bold",
          textAlign: "center",
          lineHeight: 1.2,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}>
          PIZZA<br />TIME
        </div>
      </div>
    </>
  );
}

/* ─── Cat Swarm ───────────────────────────────────────────── */
function CatSwarm() {
  const cats = ["🐱", "😸", "😹", "😺", "😻", "🐈", "🐾"];
  const [items] = useState(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      cat: cats[Math.floor(Math.random() * cats.length)],
      x: Math.random() * 90,
      y: Math.random() * 85,
      size: 20 + Math.random() * 28,
      delay: Math.random() * 3,
      dur: 2 + Math.random() * 2,
      driftX: (Math.random() - 0.5) * 40,
      driftY: (Math.random() - 0.5) * 30,
    }))
  );

  return (
    <>
      <style>{`
        @keyframes catFloat {
          0%, 100% { transform: translate(0, 0) rotate(-5deg); }
          25% { transform: translate(var(--dx), calc(var(--dy) * 0.5)) rotate(5deg); }
          50% { transform: translate(calc(var(--dx) * 0.7), var(--dy)) rotate(-3deg); }
          75% { transform: translate(calc(var(--dx) * 0.3), calc(var(--dy) * 0.8)) rotate(8deg); }
        }
      `}</style>
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: item.size,
            ["--dx" as string]: `${item.driftX}px`,
            ["--dy" as string]: `${item.driftY}px`,
            animation: `catFloat ${item.dur}s ${item.delay}s infinite ease-in-out`,
            zIndex: 0,
            filter: "drop-shadow(1px 2px 4px rgba(0,0,0,0.2))",
          }}
        >
          {item.cat}
        </div>
      ))}
      <div
        className="absolute bottom-20 w-full text-center pointer-events-none"
        style={{
          zIndex: 1,
          fontFamily: "monospace",
          color: "rgba(150,80,30,0.25)",
          fontSize: "clamp(20px, 4vw, 60px)",
          fontWeight: "bold",
          letterSpacing: "0.2em",
        }}
      >
        ON A UN PROBLÈME
      </div>
    </>
  );
}

/* ─── BSOD Screen ─────────────────────────────────────────── */
function BsodScreen() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
      style={{ zIndex: 0, fontFamily: "monospace", color: "white", padding: "40px" }}
    >
      <div style={{ maxWidth: 600, textAlign: "left" }}>
        <div style={{ fontSize: "clamp(14px, 2.5vw, 20px)", lineHeight: 1.6 }}>
          <div style={{ fontSize: "clamp(18px, 3vw, 28px)", marginBottom: "20px", fontWeight: "bold" }}>
            :(
          </div>
          <div style={{ fontSize: "clamp(12px, 2vw, 16px)", marginBottom: "24px" }}>
            Votre PC a rencontré un problème et doit redémarrer. Nous collectons
            quelques informations sur l&apos;erreur, puis nous redémarrerons pour vous.
          </div>
          <div style={{ fontSize: "clamp(28px, 6vw, 72px)", fontWeight: "bold", margin: "20px 0", letterSpacing: "-2px" }}>
            0%
          </div>
          <div style={{ fontSize: "clamp(10px, 1.5vw, 13px)", opacity: 0.7 }}>
            <div>Arrêtez-vous là et prenez un café.</div>
            <div style={{ marginTop: 8 }}>
              Pour plus d&apos;informations sur ce problème et les éventuelles solutions :
            </div>
            <div style={{ marginTop: 4, textDecoration: "underline" }}>
              https://www.gunthOS.fr/CRITICAL_VIBES_OVERFLOW
            </div>
            <div style={{ marginTop: 16, opacity: 0.5 }}>
              Code d&apos;arrêt : MACHINE_HUMEUR_INEXPLICABLE
            </div>
            <div style={{ opacity: 0.5 }}>
              Ce n&apos;est pas votre faute. Enfin... peut-être un peu.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Windows Errors ──────────────────────────────────────── */
function WindowsErrors() {
  const errors = [
    { title: "Erreur fatale", msg: "Une erreur s'est produite. Appuyez OK pour continuer l'erreur." },
    { title: "Alerte critique", msg: "Votre ordinateur est trop lent. Essayez de souffler dessus." },
    { title: "Mise à jour Windows", msg: "Redémarrage dans 3 secondes. Ou dans 3 jours. On sait pas." },
    { title: "Virus détecté", msg: "Le virus est en réalité votre comportement. Corrigez-vous." },
    { title: "Disque dur plein", msg: "Vos memes occupent 98% de l'espace disque. Normal." },
    { title: "Connexion perdue", msg: "Vous avez perdu la connexion avec la réalité. Reboot recommandé." },
  ];

  const [visible] = useState(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      error: errors[Math.floor(Math.random() * errors.length)]!,
      x: 5 + Math.random() * 55,
      y: 5 + Math.random() * 55,
      rotate: (Math.random() - 0.5) * 8,
    }))
  );

  return (
    <>
      <style>{`
        @keyframes errorPop {
          0% { transform: scale(0) rotate(var(--r)); opacity: 0; }
          60% { transform: scale(1.05) rotate(var(--r)); opacity: 1; }
          100% { transform: scale(1) rotate(var(--r)); opacity: 1; }
        }
        @keyframes errorShake {
          0%, 100% { transform: rotate(var(--r)) translateX(0); }
          25% { transform: rotate(var(--r)) translateX(-3px); }
          75% { transform: rotate(var(--r)) translateX(3px); }
        }
      `}</style>
      {visible.map((item, idx) => (
        <div
          key={item.id}
          className="absolute pointer-events-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            ["--r" as string]: `${item.rotate}deg`,
            animation: `errorPop 0.4s ${idx * 0.3}s both, errorShake 0.5s ${idx * 0.3 + 2}s ease-in-out`,
            zIndex: idx + 1,
            minWidth: 220,
            maxWidth: 280,
          }}
        >
          <div style={{
            border: "3px solid",
            borderTopColor: "#fff",
            borderLeftColor: "#fff",
            borderBottomColor: "#808080",
            borderRightColor: "#808080",
            backgroundColor: "#c0c0c0",
            boxShadow: "4px 4px 0 rgba(0,0,0,0.4)",
            fontFamily: "monospace",
            fontSize: 11,
          }}>
            <div style={{
              background: "linear-gradient(to right, #000080, #1084d0)",
              color: "white",
              padding: "3px 6px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: "bold",
            }}>
              <span>⚠️</span>
              <span>{item.error.title}</span>
            </div>
            <div style={{ padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>⛔</span>
              <span style={{ lineHeight: 1.4 }}>{item.error.msg}</span>
            </div>
            <div style={{ padding: "0 12px 8px", display: "flex", justifyContent: "center", gap: 8 }}>
              {["OK", "Annuler", "Aide"].map((btn) => (
                <div
                  key={btn}
                  style={{
                    border: "2px solid",
                    borderTopColor: "#fff",
                    borderLeftColor: "#fff",
                    borderBottomColor: "#808080",
                    borderRightColor: "#808080",
                    backgroundColor: "#c0c0c0",
                    padding: "2px 14px",
                    fontSize: 11,
                    cursor: "default",
                    minWidth: 60,
                    textAlign: "center",
                  }}
                >
                  {btn}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/* ─── Doge Wallpaper ─────────────────────────────────────── */
function DogeWallpaper() {
  const wows = [
    { text: "wow", x: 10, y: 20, color: "#ff69b4", size: 28, rot: -10 },
    { text: "such desktop", x: 60, y: 10, color: "#00ffff", size: 22, rot: 5 },
    { text: "very background", x: 15, y: 65, color: "#ffff00", size: 20, rot: -5 },
    { text: "much pixel", x: 65, y: 60, color: "#ff8c00", size: 24, rot: 8 },
    { text: "so wallpaper", x: 40, y: 80, color: "#00ff80", size: 18, rot: -3 },
    { text: "amaze", x: 75, y: 35, color: "#ff6b35", size: 30, rot: 12 },
    { text: "wow", x: 30, y: 45, color: "#b967ff", size: 26, rot: -8 },
    { text: "doge approved", x: 5, y: 88, color: "#ffff00", size: 16, rot: 4 },
  ];

  return (
    <>
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div style={{ fontSize: "clamp(80px, 20vw, 200px)" }}>🐕</div>
      </div>
      {wows.map((w, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${w.x}%`,
            top: `${w.y}%`,
            color: w.color,
            fontSize: w.size,
            fontFamily: "Comic Sans MS, cursive",
            fontWeight: "bold",
            transform: `rotate(${w.rot}deg)`,
            textShadow: "2px 2px 0 rgba(0,0,0,0.3)",
            zIndex: 1,
          }}
        >
          {w.text}
        </div>
      ))}
    </>
  );
}

/* ─── Nyan Cat ───────────────────────────────────────────── */
function NyanWallpaper() {
  const [pos, setPos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPos((p) => (p + 2) % 110), 16);
    return () => clearInterval(interval);
  }, []);

  const rainbowColors = ["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#0088ff", "#8800ff"];

  return (
    <>
      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      {/* Stars */}
      {Array.from({ length: 15 }, (_, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${(i * 7) % 95}%`,
            top: `${(i * 11) % 80}%`,
            color: "white",
            fontSize: 16 + (i % 3) * 8,
            animation: `starTwinkle ${1 + (i % 3) * 0.5}s ${i * 0.2}s infinite`,
            zIndex: 0,
          }}
        >
          ✦
        </div>
      ))}
      {/* Rainbow trail */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${pos - 60}%`,
          top: "42%",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          zIndex: 1,
          transition: "left 0ms",
        }}
      >
        {rainbowColors.map((color, i) => (
          <div
            key={i}
            style={{
              width: `${60}vw`,
              height: 8,
              backgroundColor: color,
            }}
          />
        ))}
      </div>
      {/* Cat */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          left: `${pos}%`,
          top: "38%",
          fontSize: 48,
          zIndex: 2,
          transition: "left 0ms",
        }}
      >
        🐱
      </div>
    </>
  );
}

/* ─── Stonks Chart ───────────────────────────────────────── */
function StonksChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const points: { x: number; y: number }[] = [];
    let x = 0;
    let y = canvas.height * 0.7;

    while (x < canvas.width + 20) {
      points.push({ x, y });
      x += 3;
      y += (Math.random() - 0.35) * 8;
      y = Math.max(40, Math.min(canvas.height - 40, y));
    }

    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = "rgba(0,255,0,0.08)";
      ctx.lineWidth = 1;
      for (let gy = 0; gy < canvas.height; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(canvas.width, gy);
        ctx.stroke();
      }
      for (let gx = 0; gx < canvas.width; gx += 60) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, canvas.height);
        ctx.stroke();
      }

      // Line
      ctx.beginPath();
      const visible = points.slice(offset, offset + 120);
      for (let i = 0; i < visible.length; i++) {
        const p = visible[i]!;
        const px = (i / 120) * canvas.width;
        if (i === 0) ctx.moveTo(px, p.y);
        else ctx.lineTo(px, p.y);
      }
      ctx.strokeStyle = "#00ff41";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fill
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fillStyle = "rgba(0,255,65,0.05)";
      ctx.fill();

      offset = (offset + 1) % (points.length - 120 || 1);

      if (offset < points.length - 120) {
        const lastY = points[offset + 119]?.y ?? canvas.height * 0.5;
        // Arrow up
        ctx.fillStyle = "#00ff41";
        ctx.font = "bold 24px monospace";
        ctx.fillText("▲ +9999%", canvas.width - 140, 40);
        ctx.font = "12px monospace";
        ctx.fillStyle = "rgba(0,255,65,0.5)";
        ctx.fillText("STONKS CORP™", canvas.width - 120, 58);
      }
    };

    const interval = setInterval(draw, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <div style={{
          fontSize: "clamp(60px, 15vw, 180px)",
          opacity: 0.06,
          filter: "blur(2px)",
        }}>
          📈
        </div>
      </div>
    </>
  );
}

/* ─── XP Hill Decor ──────────────────────────────────────── */
function XpHillDecor() {
  return (
    <>
      {/* Clouds */}
      {[
        { x: 10, y: 8, scale: 1.2, delay: 0 },
        { x: 40, y: 5, scale: 0.8, delay: 2 },
        { x: 70, y: 10, scale: 1, delay: 1 },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            fontSize: 60 * c.scale,
            filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.15))",
            animation: `cloudDrift ${8 + i * 3}s ${c.delay}s infinite ease-in-out`,
            zIndex: 0,
          }}
        >
          ☁️
        </div>
      ))}
      <style>{`
        @keyframes cloudDrift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(30px); }
        }
      `}</style>
      {/* Sun */}
      <div
        className="absolute pointer-events-none select-none"
        style={{ right: "8%", top: "6%", fontSize: 70, zIndex: 1, filter: "drop-shadow(0 0 20px rgba(255,220,0,0.6))" }}
      >
        ☀️
      </div>
      {/* Small flowers */}
      {["🌼", "🌸", "🌻", "💐"].map((f, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            bottom: "8%",
            left: `${20 + i * 18}%`,
            fontSize: 24,
            zIndex: 1,
          }}
        >
          {f}
        </div>
      ))}
    </>
  );
}

/* ─── Vaporwave Grid ─────────────────────────────────────── */
function VaporwaveGrid() {
  return (
    <>
      <style>{`
        @keyframes gridScroll {
          0% { background-position: 0 0; }
          100% { background-position: 0 80px; }
        }
        @keyframes sunPulse {
          0%, 100% { opacity: 0.7; filter: blur(0px); }
          50% { opacity: 1; filter: blur(2px); }
        }
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 10px #ff71ce, 0 0 20px #ff71ce; }
          50% { text-shadow: 0 0 20px #ff71ce, 0 0 40px #ff71ce, 0 0 60px #b967ff; }
        }
        @keyframes palmSway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>

      {/* Grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "55%",
          backgroundImage: `
            linear-gradient(rgba(185,103,255,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(185,103,255,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          animation: "gridScroll 2s linear infinite",
          zIndex: 0,
          maskImage: "linear-gradient(to bottom, transparent 0%, black 20%)",
        }}
      />

      {/* Sun */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "20%",
          transform: "translateX(-50%)",
          width: 200,
          height: 200,
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "linear-gradient(to bottom, #ff71ce 0%, #ffdd00 40%, #ff8c00 60%, transparent 100%)",
            animation: "sunPulse 3s ease-in-out infinite",
          }}
        />
        {/* Stripes */}
        {[30, 45, 57, 66, 73, 79].map((pct, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${pct}%`,
              height: i < 3 ? 6 : 4,
              backgroundColor: "#2d1b69",
            }}
          />
        ))}
      </div>

      {/* Palms */}
      {[{ x: 5, dir: 1 }, { x: 80, dir: -1 }].map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${p.x}%`,
            bottom: "12%",
            fontSize: 80,
            zIndex: 2,
            transformOrigin: "bottom center",
            animation: `palmSway ${3 + i}s ${i}s ease-in-out infinite`,
            transform: `scaleX(${p.dir})`,
          }}
        >
          🌴
        </div>
      ))}

      {/* Text */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: "5%",
          width: "100%",
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: "clamp(24px, 5vw, 64px)",
          fontWeight: "bold",
          color: "#fffb96",
          letterSpacing: "0.3em",
          animation: "textGlow 2s ease-in-out infinite",
          zIndex: 3,
        }}
      >
        A E S T H E T I C
      </div>
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: "calc(5% + clamp(30px, 6vw, 80px))",
          width: "100%",
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: "clamp(10px, 1.5vw, 18px)",
          color: "#ff71ce",
          letterSpacing: "0.5em",
          opacity: 0.8,
          zIndex: 3,
        }}
      >
        2 0 X X
      </div>
    </>
  );
}

/* ─── Dark Souls ──────────────────────────────────────────── */
function DarkSoulsScreen() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setOpacity(1), 500);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <div
        style={{
          transition: "opacity 2s ease-in",
          opacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: "#8b0000",
            fontSize: "clamp(48px, 12vw, 140px)",
            fontFamily: "Times New Roman, serif",
            fontWeight: "bold",
            letterSpacing: "0.15em",
            textShadow: "0 0 30px rgba(139,0,0,0.8), 0 0 60px rgba(139,0,0,0.4)",
            lineHeight: 1,
          }}
        >
          YOU<br />DIED
        </div>
        <div
          style={{
            color: "rgba(139,0,0,0.5)",
            fontSize: "clamp(10px, 1.5vw, 18px)",
            fontFamily: "monospace",
            marginTop: 20,
            letterSpacing: "0.3em",
          }}
        >
          ESSAYEZ DE REDÉMARRER
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          opacity: opacity * 0.3,
          transition: "opacity 2s ease-in",
          fontSize: "clamp(30px, 6vw, 80px)",
        }}
      >
        ⚔️ 🛡️ 💀
      </div>
    </div>
  );
}

/* ─── Loading Screen ──────────────────────────────────────── */
function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const steps = [
    "Chargement du fond d'écran...",
    "Chargement du fond d'écran (encore)...",
    "Préparation de la préparation...",
    "Initialisation de l'initialisation...",
    "Chargement presque terminé...",
    "Chargement presque presque terminé...",
    "Encore un peu...",
    "Vraiment bientôt...",
    "99%...",
    "Erreur. Reprise depuis 0%...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 99) {
          setStep((s) => (s + 1) % steps.length);
          return 0;
        }
        return p + Math.random() * 3;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 3000);
    return () => clearInterval(t);
  }, []);

  const bars = Math.floor((progress / 100) * 20);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      style={{ zIndex: 0, fontFamily: "monospace", color: "#ffffff" }}
    >
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: "clamp(16px, 3vw, 32px)", marginBottom: 24, opacity: 0.9 }}>
          ⏳ GunthOS
        </div>
        <div style={{ fontSize: "clamp(10px, 1.5vw, 14px)", marginBottom: 16, opacity: 0.7, minHeight: 20 }}>
          {steps[step]}
        </div>
        <div
          style={{
            border: "2px solid rgba(255,255,255,0.5)",
            padding: "2px 4px",
            fontSize: "clamp(10px, 1.5vw, 14px)",
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          {"█".repeat(bars)}{"░".repeat(20 - bars)}
        </div>
        <div style={{ fontSize: "clamp(10px, 1.2vw, 12px)", opacity: 0.5 }}>
          {Math.min(99, Math.floor(progress))}%
        </div>
      </div>
    </div>
  );
}

/* ─── Clippy ─────────────────────────────────────────────── */
function ClippyWallpaper() {
  const tips = [
    "Il semble que vous utilisez un fond d'écran. Voulez-vous de l'aide?",
    "Je vois que vous regardez votre bureau. Avez-vous pensé à travailler?",
    "Conseil: Ce papier peint n'est pas une productivité.",
    "Je vois que vous n'avez rien fait depuis 5 minutes. Félicitations!",
    "Voulez-vous que je ferme vos 47 onglets Chrome?",
    "Il semble que vous procrastinez. Est-ce intentionnel? (Réponse: oui)",
  ];

  const [tipIdx, setTipIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTipIdx((i) => (i + 1) % tips.length);
        setVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const bubbles = [
    { x: 15, y: 12, scale: 0.7, delay: 1.5 },
    { x: 40, y: 8, scale: 0.9, delay: 0.5 },
    { x: 65, y: 15, scale: 0.8, delay: 2 },
    { x: 80, y: 5, scale: 0.65, delay: 0 },
  ];

  return (
    <>
      <style>{`
        @keyframes clippyBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes bubbleFade { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* Background paperclips */}
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            fontSize: 50 * b.scale,
            opacity: 0.08,
            transform: `rotate(${(i - 2) * 15}deg)`,
            zIndex: 0,
          }}
        >
          📎
        </div>
      ))}

      {/* Main Clippy */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          right: "10%",
          bottom: "15%",
          zIndex: 2,
          animation: "clippyBounce 3s ease-in-out infinite",
        }}
      >
        <div style={{ fontSize: "clamp(60px, 10vw, 120px)" }}>📎</div>
      </div>

      {/* Speech bubble */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "18%",
          bottom: "calc(15% + clamp(70px, 12vw, 140px))",
          maxWidth: 280,
          zIndex: 3,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s ease",
          animation: visible ? "bubbleFade 0.5s ease" : "none",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            border: "2px solid #000080",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: "clamp(9px, 1.2vw, 13px)",
            fontFamily: "monospace",
            color: "#000080",
            lineHeight: 1.5,
            boxShadow: "4px 4px 0 rgba(0,0,128,0.2)",
            position: "relative",
          }}
        >
          {tips[tipIdx]}
          <div
            style={{
              position: "absolute",
              bottom: -12,
              right: 30,
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "12px solid #000080",
            }}
          />
        </div>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(100,140,220,0.1) 0%, transparent 70%)",
        }}
      />
    </>
  );
}

/* ─── 404 Wallpaper ──────────────────────────────────────── */
function NotFoundWallpaper() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      style={{ zIndex: 0, fontFamily: "monospace" }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "clamp(80px, 18vw, 200px)", color: "#e0e0e0", fontWeight: "bold", lineHeight: 1 }}>
          404
        </div>
        <div style={{ fontSize: "clamp(14px, 2.5vw, 28px)", color: "#888", marginTop: 8 }}>
          Fond d&apos;Écran Non Trouvé
        </div>
        <div style={{ fontSize: "clamp(10px, 1.5vw, 16px)", color: "#bbb", marginTop: 16, maxWidth: 400 }}>
          Le fond d&apos;écran que vous cherchez n&apos;existe pas,<br />
          a été supprimé, ou n&apos;a jamais existé.<br />
          <span style={{ color: "#aaa" }}>Comme certaines promesses.</span>
        </div>
        <div style={{ fontSize: "clamp(30px, 6vw, 80px)", marginTop: 30, opacity: 0.4 }}>
          🔍 🤷 🗑️
        </div>
      </div>
    </div>
  );
}

/* ─── Dial Up ────────────────────────────────────────────── */
function DialUpWallpaper() {
  const [dots, setDots] = useState(0);
  const [speed, setSpeed] = useState(0);
  const msgs = [
    "Connexion à Internet...",
    "Authentification...",
    "Négociation protocole...",
    "Connexion établie à 28.8 kbps",
    "Déconnexion...",
    "Reconnexion...",
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const d = setInterval(() => setDots((p) => (p + 1) % 4), 500);
    const m = setInterval(() => setMsgIdx((p) => (p + 1) % msgs.length), 2500);
    const s = setInterval(() => setSpeed(Math.floor(Math.random() * 3 + 28)), 1000);
    return () => { clearInterval(d); clearInterval(m); clearInterval(s); };
  }, []);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      style={{ zIndex: 0, fontFamily: "monospace", color: "#333" }}
    >
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: "clamp(40px, 8vw, 100px)", marginBottom: 20 }}>📞</div>
        <div style={{ fontSize: "clamp(14px, 2.5vw, 24px)", fontWeight: "bold", marginBottom: 8 }}>
          Connexion Internet
        </div>
        <div
          style={{
            fontSize: "clamp(10px, 1.5vw, 16px)",
            marginBottom: 16,
            opacity: 0.7,
            minHeight: 24,
          }}
        >
          {msgs[msgIdx]}{"...".slice(0, dots)}
        </div>
        <div
          style={{
            border: "2px solid #888",
            padding: "8px 20px",
            fontSize: "clamp(8px, 1.2vw, 12px)",
            marginBottom: 12,
            backgroundColor: "rgba(255,255,255,0.5)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 4 }}>
            <span>Vitesse:</span>
            <span>{speed}.{Math.floor(Math.random() * 9)}K bps</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 4 }}>
            <span>Protocole:</span>
            <span>TCP/IP v4.2.0</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
            <span>Durée:</span>
            <span>∞ heures</span>
          </div>
        </div>
        <div style={{ fontSize: "clamp(8px, 1.2vw, 12px)", color: "#e44", marginTop: 8, opacity: 0.7 }}>
          ⚠️ Quelqu&apos;un a raccroché le téléphone
        </div>
      </div>
    </div>
  );
}

/* ─── Win95 Default ────────────────────────────────────────── */
function Win95Default() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, background: "#008080" }} />
  );
}

/* ─── Among Us ─────────────────────────────────────────────── */
function AmongUsWallpaper() {
  const crewmates = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    color: ["#c51111","#132ed2","#117f2d","#ed54ba","#ef7d0e","#f5f558","#3f474e","#d6e0f0"][i % 8],
    x: Math.random() * 90 + 5,
    y: Math.random() * 80 + 10,
    dur: 3 + Math.random() * 4,
    delay: Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {crewmates.map((c) => (
        <div
          key={c.id}
          style={{
            position: "absolute",
            left: `${c.x}%`,
            top: `${c.y}%`,
            fontSize: "clamp(20px, 4vw, 48px)",
            animation: `float ${c.dur}s ease-in-out ${c.delay}s infinite alternate`,
            filter: `drop-shadow(0 0 8px ${c.color})`,
          }}
        >
          ✦
        </div>
      ))}
      <style>{`@keyframes float { from { transform: translateY(0px) rotate(-5deg); } to { transform: translateY(-20px) rotate(5deg); } }`}</style>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        color: "#ff4444", fontSize: "clamp(20px, 4vw, 48px)", fontWeight: "bold",
        fontFamily: "monospace", textShadow: "0 0 20px #ff0000", textAlign: "center",
      }}>
        <div>EMERGENCY MEETING</div>
        <div style={{ fontSize: "0.5em", color: "#aaa", marginTop: 8 }}>Red was the impostor</div>
      </div>
    </div>
  );
}

/* ─── Todo List ────────────────────────────────────────────── */
function TodoListWallpaper() {
  const todos = [
    { done: true, text: "Allumer l'ordi" },
    { done: true, text: "Ouvrir les paramètres" },
    { done: false, text: "Être productif" },
    { done: false, text: "Finir ce projet" },
    { done: false, text: "Répondre aux emails" },
    { done: false, text: "Faire du sport" },
    { done: false, text: "Dormir à une heure raisonnable" },
    { done: false, text: "..." },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{
        background: "#fffde7", border: "1px solid #e0d060", borderRadius: 4,
        padding: "20px 28px", boxShadow: "3px 3px 10px rgba(0,0,0,0.15)",
        fontFamily: "monospace", maxWidth: 320,
      }}>
        <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, borderBottom: "2px solid #e0d060", paddingBottom: 8 }}>
          TODO - aujourd&apos;hui
        </div>
        {todos.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
            <span style={{ color: t.done ? "#4caf50" : "#bbb", fontSize: 14 }}>{t.done ? "☑" : "☐"}</span>
            <span style={{ fontSize: 13, textDecoration: t.done ? "line-through" : "none", color: t.done ? "#999" : "#333" }}>
              {t.text}
            </span>
          </div>
        ))}
        <div style={{ marginTop: 12, fontSize: 11, color: "#bbb", textAlign: "right" }}>
          2/8 complétées
        </div>
      </div>
    </div>
  );
}

/* ─── This Is Fine ─────────────────────────────────────────── */
function ThisIsFineWallpaper() {
  const flames = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: i * 5 + Math.random() * 4,
    dur: 0.8 + Math.random() * 0.6,
    delay: Math.random() * 1.5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {flames.map((f) => (
        <div key={f.id} style={{
          position: "absolute", bottom: 0, left: `${f.x}%`,
          fontSize: "clamp(24px, 5vw, 60px)",
          animation: `flicker ${f.dur}s ease-in-out ${f.delay}s infinite alternate`,
        }}>
          🔥
        </div>
      ))}
      <style>{`@keyframes flicker { from { transform: scaleY(1) scaleX(1); } to { transform: scaleY(1.3) scaleX(0.9); } }`}</style>
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        textAlign: "center", fontFamily: "monospace",
      }}>
        <div style={{ fontSize: "clamp(48px, 12vw, 120px)" }}>☕</div>
        <div style={{
          fontSize: "clamp(16px, 3vw, 36px)", color: "#ffcc00",
          fontWeight: "bold", textShadow: "0 0 10px #ff6600",
        }}>
          This is fine.
        </div>
      </div>
    </div>
  );
}

/* ─── Rickroll ──────────────────────────────────────────────── */
function RickrollWallpaper() {
  const notes = ["🎵","🎶","🎵","🎸","🎹","🎵","🎶"];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div style={{ textAlign: "center", fontFamily: "monospace" }}>
        <div style={{ fontSize: "clamp(40px, 10vw, 100px)", marginBottom: 16 }}>🕺</div>
        <div style={{ color: "#ff66cc", fontSize: "clamp(14px, 2.5vw, 28px)", fontWeight: "bold", marginBottom: 8 }}>
          Never gonna give you up
        </div>
        <div style={{ color: "#cc44aa", fontSize: "clamp(12px, 2vw, 22px)", marginBottom: 4 }}>
          Never gonna let you down
        </div>
        <div style={{ color: "#aa3388", fontSize: "clamp(10px, 1.5vw, 18px)" }}>
          Never gonna run around and desert you
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {notes.map((n, i) => (
            <span key={i} style={{
              fontSize: "clamp(16px, 3vw, 32px)",
              animation: `bounce 1s ease-in-out ${i * 0.15}s infinite alternate`,
            }}>{n}</span>
          ))}
        </div>
      </div>
      <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-12px); } }`}</style>
    </div>
  );
}

/* ─── Aquarium ──────────────────────────────────────────────── */
function AquariumWallpaper() {
  const fish = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    emoji: ["🐠","🐡","🐟","🦈","🐙","🦑","🦀","🐬"][i],
    y: 15 + i * 10,
    dur: 6 + Math.random() * 6,
    delay: Math.random() * 4,
    dir: i % 2 === 0 ? 1 : -1,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {fish.map((f) => (
        <div key={f.id} style={{
          position: "absolute",
          top: `${f.y}%`,
          fontSize: "clamp(20px, 4vw, 48px)",
          transform: f.dir < 0 ? "scaleX(-1)" : "none",
          animation: `swim${f.id} ${f.dur}s linear ${f.delay}s infinite`,
        }}>
          {f.emoji}
        </div>
      ))}
      <style>
        {fish.map((f) =>
          `@keyframes swim${f.id} {
            from { left: ${f.dir > 0 ? "-10%" : "110%"}; }
            to   { left: ${f.dir > 0 ? "110%" : "-10%"}; }
          }`
        ).join("\n")}
      </style>
      <div style={{
        position: "absolute", bottom: 0, width: "100%", height: "20%",
        background: "linear-gradient(to top, #001a33 0%, transparent 100%)",
      }} />
    </div>
  );
}

/* ─── Lemmings ──────────────────────────────────────────────── */
function LemmingsWallpaper() {
  const lems = Array.from({ length: 10 }, (_, i) => ({ id: i, delay: i * 0.8 }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {lems.map((l) => (
        <div key={l.id} style={{
          position: "absolute", bottom: "40%",
          fontSize: "clamp(16px, 3vw, 32px)",
          animation: `march 8s linear ${l.delay}s infinite`,
        }}>
          🐹
        </div>
      ))}
      <style>{`@keyframes march { from { left: -5%; } to { left: 105%; } }`}</style>
      <div style={{
        position: "absolute", bottom: 0, width: "100%", height: "40%",
        background: "linear-gradient(to top, #3a6020 0%, #5a8a3a 60%, transparent 100%)",
      }} />
      <div style={{
        position: "absolute", bottom: "38%", left: "50%", transform: "translateX(-50%)",
        fontFamily: "monospace", color: "#fff", fontWeight: "bold",
        fontSize: "clamp(12px, 2vw, 20px)", textShadow: "1px 1px 4px #000",
      }}>
        Let&apos;s go!
      </div>
    </div>
  );
}

/* ─── Coffee ────────────────────────────────────────────────── */
function CoffeeWallpaper() {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ textAlign: "center", fontFamily: "monospace" }}>
        <div style={{ fontSize: "clamp(60px, 15vw, 160px)", lineHeight: 1 }}>☕</div>
        <div style={{ color: "#c8a060", fontSize: "clamp(14px, 2.5vw, 28px)", fontWeight: "bold", marginTop: 16 }}>
          Pause café en cours
        </div>
        <div style={{ color: "#a08040", fontSize: "clamp(10px, 1.8vw, 20px)", marginTop: 8 }}>
          Retour dans{"...".slice(0, dots + 1)} 5 ans
        </div>
        <div style={{ color: "#806030", fontSize: "clamp(9px, 1.2vw, 14px)", marginTop: 12, opacity: 0.7 }}>
          (ou après un deuxième café)
        </div>
      </div>
    </div>
  );
}

/* ─── Windows Update ────────────────────────────────────────── */
function WindowsUpdateWallpaper() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const phases = [
    "Préparation de la mise à jour...",
    "Téléchargement des fichiers...",
    "Installation en cours...",
    "Configuration des mises à jour...",
    "Ne pas éteindre votre PC...",
    "Finalisation...",
    "Redémarrage dans 3... 2... 1...",
  ];

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { setPhase((ph) => (ph + 1) % phases.length); return 0; }
        return p + 1;
      });
    }, 80);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ textAlign: "center", color: "#fff", fontFamily: "Segoe UI, sans-serif", maxWidth: 400 }}>
        <div style={{ fontSize: "clamp(10px, 1.8vw, 18px)", marginBottom: 24, opacity: 0.85 }}>
          {phases[phase]}
        </div>
        <div style={{
          width: "100%", height: 6, background: "rgba(255,255,255,0.2)",
          borderRadius: 3, overflow: "hidden", marginBottom: 12,
        }}>
          <div style={{
            height: "100%", background: "#fff",
            width: `${progress}%`, transition: "width 0.08s linear",
          }} />
        </div>
        <div style={{ fontSize: "clamp(10px, 1.5vw, 16px)", opacity: 0.7 }}>
          {progress}%
        </div>
        <div style={{ marginTop: 32, fontSize: "clamp(28px, 6vw, 64px)" }}>🔄</div>
      </div>
    </div>
  );
}

/* ─── Confetti ──────────────────────────────────────────────── */
function ConfettiWallpaper() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    emoji: ["🎉","🎊","✨","🎈","🌟","🎀","🥳"][i % 7],
    x: Math.random() * 100,
    dur: 3 + Math.random() * 4,
    delay: Math.random() * 4,
    size: 0.7 + Math.random() * 1.3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`,
          top: "-10%",
          fontSize: `${p.size}em`,
          animation: `fall ${p.dur}s linear ${p.delay}s infinite`,
        }}>
          {p.emoji}
        </div>
      ))}
      <style>{`@keyframes fall { from { top: -10%; transform: rotate(0deg); } to { top: 110%; transform: rotate(360deg); } }`}</style>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        textAlign: "center", fontFamily: "monospace",
      }}>
        <div style={{ fontSize: "clamp(20px, 5vw, 56px)", color: "#fff", fontWeight: "bold", textShadow: "0 0 20px rgba(255,200,0,0.8)" }}>
          Félicitations!
        </div>
        <div style={{ fontSize: "clamp(12px, 2vw, 22px)", color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
          Pour aucune raison particulière
        </div>
      </div>
    </div>
  );
}

/* ─── Imprimante en colère ──────────────────────────────────── */
function PrinterWallpaper() {
  const [msg, setMsg] = useState(0);
  const msgs = [
    "PAPER JAM",
    "BOURRAGE PAPIER",
    "TONER FAIBLE",
    "ERREUR 0x000021FC",
    "HORS LIGNE",
    "PAS DE PAPIER",
    "COUVERCLE OUVERT",
    "CONNEXION PERDUE",
    "PILOTE INTROUVABLE",
    "REDÉMARRAGE REQUIS",
  ];
  useEffect(() => {
    const t = setInterval(() => setMsg((m) => (m + 1) % msgs.length), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ textAlign: "center", fontFamily: "monospace" }}>
        <div style={{ fontSize: "clamp(60px, 12vw, 130px)" }}>🖨️</div>
        <div style={{
          marginTop: 16,
          background: "#cc0000", color: "#fff",
          padding: "8px 24px", fontSize: "clamp(14px, 2.5vw, 26px)",
          fontWeight: "bold", letterSpacing: 2,
          border: "3px solid #880000",
          animation: "blink 0.6s step-end infinite",
        }}>
          ⚠ {msgs[msg]}
        </div>
        <div style={{ marginTop: 12, color: "#666", fontSize: "clamp(9px, 1.3vw, 14px)" }}>
          Travail d&apos;impression: 847 pages restantes
        </div>
        <div style={{ color: "#999", fontSize: "clamp(8px, 1.1vw, 12px)", marginTop: 4 }}>
          Estimation: ∞ minutes
        </div>
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0.2; } }`}</style>
    </div>
  );
}

/* ─── Captcha ───────────────────────────────────────────────── */
function CaptchaWallpaper() {
  const [selected, setSelected] = useState<number[]>([]);
  const [attempt, setAttempt] = useState(0);
  const grid = ["🚦","🌳","🚌","🚦","🏠","🚦","🌳","🚦","🚌"];

  const toggle = (i: number) => setSelected((s) => s.includes(i) ? s.filter((x) => x !== i) : [...s, i]);
  const verify = () => { setAttempt((a) => a + 1); setSelected([]); };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{
        background: "#fff", border: "1px solid #ccc", borderRadius: 4,
        padding: 20, maxWidth: 300, boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        fontFamily: "Arial, sans-serif", pointerEvents: "auto",
      }}>
        <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4, color: "#333" }}>
          Sélectionnez toutes les cases contenant des <strong>feux tricolores</strong>
        </div>
        {attempt > 0 && (
          <div style={{ color: "#c00", fontSize: 12, marginBottom: 8 }}>
            ❌ Incorrect. Réessayez. (tentative {attempt})
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, marginBottom: 12 }}>
          {grid.map((e, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{
                fontSize: 28, textAlign: "center", padding: 8,
                background: selected.includes(i) ? "#d0e8ff" : "#f8f8f8",
                border: selected.includes(i) ? "2px solid #2a7ae2" : "2px solid #ddd",
                cursor: "pointer", borderRadius: 2,
              }}
            >{e}</div>
          ))}
        </div>
        <button
          onClick={verify}
          style={{
            width: "100%", padding: "8px 0", background: "#4a90e2",
            color: "#fff", border: "none", borderRadius: 2,
            fontSize: 14, cursor: "pointer", fontWeight: "bold",
          }}
        >
          Vérifier
        </button>
        <div style={{ fontSize: 10, color: "#aaa", marginTop: 8, textAlign: "center" }}>
          reCAPTCHA v∞ • Tu ne passeras pas.
        </div>
      </div>
    </div>
  );
}

/* ─── Snake Nokia ───────────────────────────────────────────── */
function SnakeWallpaper() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => f + 1), 200);
    return () => clearInterval(t);
  }, []);

  const W = 15; const H = 10;
  const snakeLen = Math.min(5 + Math.floor(frame / 10), 30);
  const head = { x: (frame * 2) % W, y: Math.floor(frame / W) % H };
  const cells: string[][] = Array.from({ length: H }, () => Array(W).fill("·"));
  for (let i = 0; i < snakeLen; i++) {
    const x = ((head.x - i) % W + W) % W;
    const row = cells[head.y]; if (row) row[x] = i === 0 ? "█" : "▓";
  }
  const foodX = (head.x + 7) % W;
  const foodY = (head.y + 3) % H;
  if (cells[foodY]) cells[foodY][foodX] = "●";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{
        background: "#8bac0f", border: "6px solid #306230",
        borderRadius: 4, padding: 16, fontFamily: "monospace",
      }}>
        <div style={{ color: "#0f380f", fontSize: "clamp(6px, 1.2vw, 13px)", lineHeight: 1.4, letterSpacing: 2 }}>
          {cells.map((row, y) => (
            <div key={y}>{row.join(" ")}</div>
          ))}
        </div>
        <div style={{ color: "#0f380f", fontSize: "clamp(8px, 1.2vw, 12px)", marginTop: 8, textAlign: "center", fontWeight: "bold" }}>
          SCORE: {snakeLen * 10}
        </div>
      </div>
      <div style={{ color: "#9bbc0f", fontSize: "clamp(10px, 1.5vw, 16px)", marginTop: 12, fontFamily: "monospace", fontWeight: "bold" }}>
        NOKIA 3310
      </div>
    </div>
  );
}

/* ─── Tamagotchi ────────────────────────────────────────────── */
function TamagotchiWallpaper() {
  const [alive, setAlive] = useState(true);
  const [hunger, setHunger] = useState(3);
  const [happy, setHappy] = useState(5);
  const [age, setAge] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setHunger((h) => Math.max(0, h - 1));
      setHappy((h) => Math.max(0, h - 1));
      setAge((a) => a + 1);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (hunger === 0 || happy === 0) setAlive(false);
  }, [hunger, happy]);

  const face = !alive ? "💀" : hunger < 2 ? "😫" : happy < 2 ? "😢" : happy > 3 ? "😁" : "😊";

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{
        background: "linear-gradient(135deg, #ff9de2 0%, #ff6ec7 100%)",
        borderRadius: "50%", width: "clamp(160px, 30vw, 280px)",
        height: "clamp(160px, 30vw, 280px)",
        border: "8px solid #cc44aa", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 30px rgba(204,68,170,0.5)",
        fontFamily: "monospace", pointerEvents: "auto",
      }}>
        <div style={{ fontSize: "clamp(40px, 8vw, 80px)" }}>{face}</div>
        <div style={{ fontSize: "clamp(8px, 1.2vw, 12px)", color: "#6a006a", marginTop: 6 }}>
          <div>🍔 {"█".repeat(hunger)}{"░".repeat(5 - hunger)}</div>
          <div>😊 {"█".repeat(happy)}{"░".repeat(5 - happy)}</div>
          <div style={{ marginTop: 4, textAlign: "center" }}>Âge: {age}s</div>
        </div>
        {!alive && (
          <div style={{ color: "#880000", fontWeight: "bold", fontSize: "clamp(8px, 1.2vw, 12px)", marginTop: 4 }}>
            GAME OVER
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Horaires SNCF ─────────────────────────────────────────── */
function SncfWallpaper() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const trains = [
    { num: "TGV 6201", dest: "Paris Montparnasse", prevu: "08:32", retard: 47 },
    { num: "TER 4422", dest: "Lyon Part-Dieu", prevu: "09:15", retard: 0 },
    { num: "IC 3301", dest: "Bordeaux St-Jean", prevu: "09:48", retard: 120 },
    { num: "TGV 8802", dest: "Marseille St-Ch.", prevu: "10:05", retard: tick % 3 === 0 ? 999 : 23 },
    { num: "TER 5510", dest: "Rennes", prevu: "10:22", retard: 0 },
    { num: "TGV 2201", dest: "Strasbourg", prevu: "10:40", retard: 55 },
  ];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{
        background: "#002060", border: "2px solid #4466aa",
        padding: "16px 24px", minWidth: "clamp(300px, 60vw, 600px)",
        fontFamily: "monospace",
      }}>
        <div style={{ color: "#ffcc00", fontSize: "clamp(12px, 2vw, 20px)", fontWeight: "bold", marginBottom: 12, textAlign: "center" }}>
          ⬛ SNCF — DÉPARTS ⬛
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto auto auto auto", gap: "4px 16px" }}>
          {["Train", "Destination", "Prévu", "État"].map((h) => (
            <div key={h} style={{ color: "#88aaff", fontSize: "clamp(8px, 1.1vw, 11px)", borderBottom: "1px solid #4466aa", paddingBottom: 4 }}>{h}</div>
          ))}
          {trains.map((t) => (
            [
              <div key={t.num + "n"} style={{ color: "#fff", fontSize: "clamp(8px, 1.1vw, 12px)" }}>{t.num}</div>,
              <div key={t.num + "d"} style={{ color: "#ccc", fontSize: "clamp(8px, 1.1vw, 12px)" }}>{t.dest}</div>,
              <div key={t.num + "h"} style={{ color: "#fff", fontSize: "clamp(8px, 1.1vw, 12px)" }}>{t.prevu}</div>,
              <div key={t.num + "s"} style={{ fontSize: "clamp(8px, 1.1vw, 12px)", color: t.retard === 0 ? "#44ff44" : t.retard > 60 ? "#ff4444" : "#ffaa00" }}>
                {t.retard === 0 ? "À l'heure" : t.retard === 999 ? "SUPPRIMÉ" : `+${t.retard} min`}
              </div>,
            ]
          ))}
        </div>
        <div style={{ color: "#ff4444", fontSize: "clamp(7px, 1vw, 11px)", marginTop: 12, textAlign: "center" }}>
          ⚠ Perturbations sur toutes les lignes. Nous nous excusons. Encore.
        </div>
      </div>
    </div>
  );
}

/* ─── Son de démarrage ──────────────────────────────────────── */
function StartupSoundWallpaper() {
  const [phase, setPhase] = useState(0);
  const phases = [
    { icon: "⬛", text: "..." },
    { icon: "🖥️", text: "Démarrage de Windows..." },
    { icon: "🔊", text: "TA-DAAAA" },
    { icon: "😱", text: "Toute la famille est réveillée" },
    { icon: "🌙", text: "Il est 3h47 du matin" },
    { icon: "😴", text: "Plus personne ne dort" },
    { icon: "💻", text: "Mise à jour disponible (528)" },
  ];
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % phases.length), 1800);
    return () => clearInterval(t);
  }, []);
  const p = phases[phase] ?? phases[0]!;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ textAlign: "center", fontFamily: "monospace" }}>
        <div style={{ fontSize: "clamp(60px, 14vw, 140px)", transition: "all 0.3s" }}>{p.icon}</div>
        <div style={{ color: "#6699ff", fontSize: "clamp(14px, 2.5vw, 28px)", marginTop: 16, fontWeight: "bold" }}>
          {p.text}
        </div>
        <div style={{ color: "rgba(100,150,255,0.4)", fontSize: "clamp(9px, 1.2vw, 14px)", marginTop: 8 }}>
          Windows™ — Le son qu&apos;on entend avant de regretter
        </div>
      </div>
    </div>
  );
}

/* ─── Corbeille pleine ──────────────────────────────────────── */
function RecycleBinWallpaper() {
  const items = [
    "mon_cv_final_VRAIMENT_FINAL_v3.doc",
    "photo_embarassante_2003.jpg",
    "projet_abandonné.zip",
    "diet_plan_janvier.txt",
    "résolutions_2019.docx",
    "mot_de_passe.txt",
    "factures_à_payer.pdf",
    "idée_de_startup.pptx",
    "README (2) copie finale.md",
    "ex_photos_à_supprimer_définitivement.rar",
  ];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 0, background: "#c0c0c0" }}>
      <div style={{ fontFamily: "monospace", maxWidth: "80%", textAlign: "center" }}>
        <div style={{ fontSize: "clamp(40px, 10vw, 100px)" }}>🗑️</div>
        <div style={{ fontSize: "clamp(12px, 2vw, 20px)", fontWeight: "bold", color: "#000", marginBottom: 12 }}>
          Corbeille — {items.length} éléments
        </div>
        <div style={{ textAlign: "left", background: "#fff", border: "2px inset #888", padding: "8px 12px", maxHeight: 200, overflowY: "auto" }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "2px 0", fontSize: "clamp(8px, 1.1vw, 12px)", color: "#333", borderBottom: "1px solid #eee" }}>
              <span>📄</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ color: "#666", fontSize: "clamp(8px, 1vw, 11px)", marginTop: 8 }}>
          Depuis 2003. Vider? Non.
        </div>
      </div>
    </div>
  );
}

/* ─── Défragmentation ───────────────────────────────────────── */
function DefragWallpaper() {
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(847);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.3));
      setEta((e) => Math.max(0, e % 2 === 0 ? e + 47 : e - 1));
    }, 100);
    return () => clearInterval(t);
  }, []);

  const totalBlocks = 40 * 20;
  const blocks = Array.from({ length: totalBlocks }, (_, i) => {
    const pct = i / totalBlocks;
    if (pct < progress / 100 * 0.6) return "#44ff44";
    if (pct < progress / 100) return "#4444ff";
    if (Math.random() < 0.15) return "#ff4444";
    if (Math.random() < 0.3) return "#0000aa";
    return "#000080";
  });

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ fontFamily: "monospace", maxWidth: 500, width: "90%" }}>
        <div style={{ color: "#fff", fontSize: "clamp(12px, 2vw, 18px)", marginBottom: 12, textAlign: "center" }}>
          Défragmentation du disque C:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 1, marginBottom: 12, justifyContent: "center" }}>
          {blocks.map((color, i) => (
            <div key={i} style={{ width: 10, height: 8, background: color }} />
          ))}
        </div>
        <div style={{ color: "#aaa", fontSize: "clamp(9px, 1.2vw, 13px)", display: "flex", justifyContent: "space-between" }}>
          <span>Progression: {progress.toFixed(0)}%</span>
          <span>Temps restant: {eta} minutes</span>
        </div>
        <div style={{ color: "#ff8844", fontSize: "clamp(8px, 1vw, 11px)", marginTop: 8, textAlign: "center" }}>
          Ne pas éteindre l&apos;ordinateur. Ne pas regarder l&apos;écran. Ne pas respirer.
        </div>
      </div>
    </div>
  );
}

/* ─── WiFi 1 barre ──────────────────────────────────────────── */
function WifiWallpaper() {
  const [bars, setBars] = useState(1);
  const [msg, setMsg] = useState(0);
  const msgs = [
    "Connexion en cours...",
    "Authentification...",
    "Obtention d'une adresse IP...",
    "Connexion limitée",
    "Pas d'accès Internet",
    "Connexion en cours... (encore)",
    "Avez-vous essayé d'éteindre le routeur?",
    "Et de le rallumer?",
    "Toujours pas.",
    "Bon.",
  ];

  useEffect(() => {
    const t1 = setInterval(() => setBars((b) => b === 1 ? 0 : 1), 800);
    const t2 = setInterval(() => setMsg((m) => (m + 1) % msgs.length), 1500);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ textAlign: "center", fontFamily: "monospace" }}>
        <div style={{ fontSize: "clamp(80px, 18vw, 180px)", lineHeight: 1 }}>
          {bars === 0 ? "📵" : "📶"}
        </div>
        <div style={{ color: "#88aaff", fontSize: "clamp(14px, 2.5vw, 28px)", fontWeight: "bold", marginTop: 16 }}>
          {bars === 0 ? "0" : "1"} barre{bars !== 1 ? "s" : ""}
        </div>
        <div style={{ color: "#aaa", fontSize: "clamp(10px, 1.5vw, 16px)", marginTop: 8, minHeight: "1.5em" }}>
          {msgs[msg]}
        </div>
        <div style={{ color: "#555", fontSize: "clamp(8px, 1vw, 12px)", marginTop: 12 }}>
          Réseau: <span style={{ color: "#88aaff" }}>FREEBOX_XXXXX_5G_EXT_bis_2</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Email chaîne boomer ───────────────────────────────────── */
function BoomerForwardWallpaper() {
  const chain = [
    { from: "Mamie Huguette", subject: "FW: FW: FW: Ce chien est trop mignon!!!" },
    { from: "Tonton Roger", subject: "FW: RE: FW: Blague du jour (très drôle)" },
    { from: "Mireille Dupont", subject: "FW: IMPORTANT: Virus sur Facebook (À LIRE)" },
    { from: "Jean-Pierre M.", subject: "FW: FW: Cette photo est incroyable!! (vrai)" },
    { from: "Mamie Huguette", subject: "FW: Recette de tarte aux pommes (à imprimer)" },
    { from: "Club Pétanque 34", subject: "RE: FW: RE: Compte rendu réunion du 14/03/2008" },
  ];

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none" style={{ zIndex: 0, fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "#316AC5", color: "#fff", padding: "4px 8px", fontSize: "clamp(10px, 1.5vw, 14px)", fontWeight: "bold" }}>
        📧 Boîte de réception — Outlook Express 6.0
      </div>
      <div style={{ flex: 1, background: "#fff", overflowY: "auto" }}>
        {chain.map((mail, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, padding: "6px 12px", alignItems: "center",
            background: i % 2 === 0 ? "#fff" : "#f0f4ff",
            borderBottom: "1px solid #e0e0e0",
            fontWeight: i === 0 ? "bold" : "normal",
          }}>
            <span style={{ fontSize: 16 }}>📨</span>
            <span style={{ flex: "0 0 180px", fontSize: "clamp(8px, 1.1vw, 12px)", color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {mail.from}
            </span>
            <span style={{ flex: 1, fontSize: "clamp(8px, 1.1vw, 12px)", color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {mail.subject}
            </span>
          </div>
        ))}
        <div style={{
          margin: "20px auto", maxWidth: 480, background: "#fffff0",
          border: "1px solid #ccc", padding: 16, fontSize: "clamp(9px, 1.2vw, 13px)", color: "#333",
        }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>De: Mamie Huguette &lt;huguette.martin@wanadoo.fr&gt;</div>
          <div style={{ marginBottom: 8 }}>
            Chéri(e)s, j&apos;espère que vous allez bien!!<br/>
            Regardez ce petit chien trop adorable!!! 😍😍😍<br/><br/>
            <span style={{ fontSize: "2em" }}>🐶</span><br/><br/>
            <strong>TRANSFÉREZ À 10 PERSONNES OU LE CHIEN MOURRA!!!!</strong><br/><br/>
            Bisous, Mamie
          </div>
          <div style={{ color: "#aaa", fontSize: "0.85em", borderTop: "1px solid #ddd", paddingTop: 8 }}>
            -----Message d&apos;origine-----<br/>
            De: tonton.roger@cegetel.net<br/>
            Objet: FW: FW: Ce chien est trop mignon!!!
          </div>
        </div>
      </div>
    </div>
  );
}
