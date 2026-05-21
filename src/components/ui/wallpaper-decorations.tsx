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
    case "minitel": return <MinitelWallpaper />;
    case "excel": return <ExcelWallpaper />;
    case "powerpoint": return <PowerpointWallpaper />;
    case "minesweeper": return <MinesweeperWallpaper />;
    case "geocities": return <GeocitiesWallpaper />;
    case "ie6": return <Ie6Wallpaper />;
    case "notepad": return <NotepadWallpaper />;
    case "c64": return <C64Wallpaper />;
    case "winamp": return <WinampWallpaper />;
    case "ms_paint": return <MsPaintWallpaper />;
    case "aol": return <AolWallpaper />;
    case "tamagotchi_death": return <TamagotchiDeathWallpaper />;
    case "solitaire": return <SolitaireWallpaper />;
    case "nasa_panic": return <NasaPanicWallpaper />;
    case "printer_rage": return <PrinterRageWallpaper />;
    case "stackoverflow": return <StackOverflowWallpaper />;
    case "captcha_hell": return <CaptchaHellWallpaper />;
    case "nokia3310": return <Nokia3310Wallpaper />;
    case "fax_2024": return <Fax2024Wallpaper />;
    case "windows_update_forced": return <WindowsUpdateForcedWallpaper />;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;

      // ── Ciel Velvia : bleu intense hypersaturé, horizon brumeux clair ──
      // La vraie Bliss : ~65% de ciel, horizon très bas
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0,    "#3a8fd4"); // bleu cobalt intense (sommet)
      sky.addColorStop(0.3,  "#5aacec"); // bleu ciel Velvia
      sky.addColorStop(0.58, "#8ecef8"); // ciel pâle vers horizon
      sky.addColorStop(0.65, "#b8dff8"); // haze à l'horizon
      sky.addColorStop(1,    "#cce8f8"); // fond du reste (caché par herbe)
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // ── Brume d'horizon très légère ──
      const haze = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.68);
      haze.addColorStop(0, "rgba(255,255,255,0)");
      haze.addColorStop(0.5, "rgba(220,238,255,0.22)");
      haze.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, H * 0.55, W, H * 0.13);

      // ── Collines arrière-plan : légèrement derrière, plus sombres/bleues ──
      // gauche — colline basse et douce
      const bgL = ctx.createLinearGradient(0, H * 0.58, 0, H * 0.75);
      bgL.addColorStop(0, "#3d8c22");
      bgL.addColorStop(1, "#265e10");
      ctx.beginPath();
      ctx.moveTo(-W * 0.02, H);
      ctx.bezierCurveTo(W * 0.02, H * 0.82, W * 0.10, H * 0.68, W * 0.20, H * 0.62);
      ctx.bezierCurveTo(W * 0.28, H * 0.58, W * 0.36, H * 0.60, W * 0.48, H * 0.74);
      ctx.lineTo(W * 0.48, H);
      ctx.closePath();
      ctx.fillStyle = bgL;
      ctx.fill();

      // droite — colline basse
      const bgR = ctx.createLinearGradient(0, H * 0.56, 0, H * 0.72);
      bgR.addColorStop(0, "#3d8c22");
      bgR.addColorStop(1, "#265e10");
      ctx.beginPath();
      ctx.moveTo(W * 0.55, H);
      ctx.bezierCurveTo(W * 0.58, H * 0.76, W * 0.66, H * 0.62, W * 0.74, H * 0.57);
      ctx.bezierCurveTo(W * 0.83, H * 0.52, W * 0.93, H * 0.58, W * 1.03, H * 0.70);
      ctx.lineTo(W * 1.03, H);
      ctx.closePath();
      ctx.fillStyle = bgR;
      ctx.fill();

      // ── Colline principale Bliss ──
      // Sommet légèrement à droite du centre (~55%), horizon à ~62% de H
      // Pente gauche douce et longue, pente droite plus abrupte
      const hillPath = () => {
        ctx.beginPath();
        ctx.moveTo(-W * 0.02, H);
        // montée douce depuis la gauche
        ctx.bezierCurveTo(W * 0.05, H * 0.92, W * 0.16, H * 0.76, W * 0.28, H * 0.68);
        // approche du sommet
        ctx.bezierCurveTo(W * 0.38, H * 0.61, W * 0.47, H * 0.55, W * 0.55, H * 0.52);
        // sommet (légèrement à droite du centre)
        ctx.bezierCurveTo(W * 0.60, H * 0.50, W * 0.66, H * 0.52, W * 0.72, H * 0.57);
        // descente droite plus rapide
        ctx.bezierCurveTo(W * 0.80, H * 0.63, W * 0.89, H * 0.73, W * 0.97, H * 0.82);
        ctx.lineTo(W * 1.02, H * 0.88);
        ctx.lineTo(W * 1.02, H);
        ctx.closePath();
      };

      // Dégradé Velvia : vert lime hypersaturé en haut, vert forêt en bas
      const hill = ctx.createLinearGradient(0, H * 0.50, 0, H);
      hill.addColorStop(0,    "#7ed62e"); // vert lime Velvia intense — crête ensoleillée
      hill.addColorStop(0.15, "#65c420"); // vert vif
      hill.addColorStop(0.40, "#4aaa18"); // vert moyen
      hill.addColorStop(0.70, "#368010"); // vert sombre
      hill.addColorStop(1,    "#245808"); // ombre profonde
      hillPath();
      ctx.fillStyle = hill;
      ctx.fill();

      // ── Lumière solaire sur la crête (le soleil vient de la droite dans Bliss) ──
      const sunlight = ctx.createLinearGradient(W * 0.5, H * 0.50, W * 0.3, H * 0.62);
      sunlight.addColorStop(0, "rgba(200,255,120,0.22)");
      sunlight.addColorStop(0.5, "rgba(200,255,120,0.08)");
      sunlight.addColorStop(1, "rgba(200,255,120,0)");
      hillPath();
      ctx.fillStyle = sunlight;
      ctx.fill();

      // ── Ombre légère sur le flanc droit ──
      const shadow = ctx.createLinearGradient(W * 0.62, 0, W * 0.85, 0);
      shadow.addColorStop(0, "rgba(0,30,0,0)");
      shadow.addColorStop(1, "rgba(0,30,0,0.12)");
      hillPath();
      ctx.fillStyle = shadow;
      ctx.fill();
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <style>{`
        @keyframes blissCloudA { 0%,100% { transform: translateX(0); } 50% { transform: translateX(20px); } }
        @keyframes blissCloudB { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-16px); } }
        @keyframes blissCloudC { 0%,100% { transform: translateX(0); } 50% { transform: translateX(24px); } }
      `}</style>

      {/* Nuage 1 — grand, gauche */}
      <div className="absolute pointer-events-none" style={{ left: "5%", top: "6%", zIndex: 1, animation: "blissCloudA 10s ease-in-out infinite" }}>
        <svg width="180" height="76" viewBox="0 0 180 76" fill="none">
          <ellipse cx="82" cy="58" rx="76" ry="22" fill="white" fillOpacity="0.96"/>
          <ellipse cx="56" cy="46" rx="38" ry="32" fill="white" fillOpacity="0.96"/>
          <ellipse cx="98" cy="38" rx="44" ry="36" fill="white" fillOpacity="0.96"/>
          <ellipse cx="136" cy="52" rx="32" ry="22" fill="white" fillOpacity="0.96"/>
        </svg>
      </div>

      {/* Nuage 2 — moyen, centre */}
      <div className="absolute pointer-events-none" style={{ left: "42%", top: "3%", zIndex: 1, animation: "blissCloudB 13s ease-in-out infinite" }}>
        <svg width="130" height="56" viewBox="0 0 130 56" fill="none">
          <ellipse cx="62" cy="44" rx="58" ry="16" fill="white" fillOpacity="0.93"/>
          <ellipse cx="44" cy="34" rx="30" ry="26" fill="white" fillOpacity="0.93"/>
          <ellipse cx="76" cy="28" rx="34" ry="28" fill="white" fillOpacity="0.93"/>
          <ellipse cx="102" cy="40" rx="24" ry="18" fill="white" fillOpacity="0.93"/>
        </svg>
      </div>

      {/* Nuage 3 — petit, droite */}
      <div className="absolute pointer-events-none" style={{ right: "7%", top: "10%", zIndex: 1, animation: "blissCloudC 8s ease-in-out infinite" }}>
        <svg width="100" height="44" viewBox="0 0 100 44" fill="none">
          <ellipse cx="48" cy="34" rx="44" ry="14" fill="white" fillOpacity="0.90"/>
          <ellipse cx="34" cy="26" rx="22" ry="20" fill="white" fillOpacity="0.90"/>
          <ellipse cx="60" cy="22" rx="26" ry="22" fill="white" fillOpacity="0.90"/>
        </svg>
      </div>

      {/* Nuage 4 — lointain, estompé */}
      <div className="absolute pointer-events-none" style={{ left: "22%", top: "13%", zIndex: 1, animation: "blissCloudA 16s ease-in-out infinite", opacity: 0.55 }}>
        <svg width="90" height="38" viewBox="0 0 90 38" fill="none">
          <ellipse cx="42" cy="28" rx="38" ry="12" fill="white"/>
          <ellipse cx="28" cy="22" rx="20" ry="18" fill="white"/>
          <ellipse cx="56" cy="18" rx="24" ry="20" fill="white"/>
        </svg>
      </div>
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

/* ─── Minitel Rose ──────────────────────────────────────────── */
function MinitelWallpaper() {
  const [line, setLine] = useState(0);
  const lines = [
    "   ╔══════════════════════════════╗",
    "   ║   BIENVENUE SUR 3615 GUNTH   ║",
    "   ╚══════════════════════════════╝",
    "",
    "   SERVICE MESSAGERIE ROSE",
    "   Prix : 1,27 FF/min",
    "",
    "   > Connexion en cours......",
    "   > Authentification...",
    "   > GUNTH connecté à 1200 baud",
    "",
    "   [1] MESSAGERIE PERSONNELLE",
    "   [2] ANNONCES RENCONTRES",
    "   [3] HOROSCOPE DU JOUR",
    "   [4] BLAGUES (interdit -18 ans)",
    "   [5] DÉCONNEXION (impossible)",
    "",
    "   Votre choix : _",
    "",
    "   ⚠ AVERTISSEMENT : Ce service",
    "   vous coûte 47FF/heure.",
    "   Votre mère est au courant.",
  ];

  useEffect(() => {
    const t = setInterval(() => setLine(l => (l + 1) % (lines.length + 8)), 180);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <style>{`@keyframes mtCursor { 0%,49%{opacity:1} 50%,100%{opacity:0} }`}</style>
      <div style={{ fontFamily: "\"Courier New\", monospace", color: "#ff40ff", fontSize: "clamp(9px,1.3vw,14px)", lineHeight: 1.7, maxWidth: 520, width: "90%" }}>
        {lines.slice(0, Math.min(line, lines.length)).map((l, i) => (
          <div key={i} style={{ opacity: i < line - 3 ? 0.6 : 1 }}>{l || " "}</div>
        ))}
        {line <= lines.length && (
          <span style={{ animation: "mtCursor 1s step-end infinite", color: "#ff80ff" }}>█</span>
        )}
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, rgba(255,64,255,0.04) 0px, rgba(255,64,255,0.04) 1px, transparent 1px, transparent 3px)",
        zIndex: 1,
      }} />
    </div>
  );
}

/* ─── Excel Dépression ──────────────────────────────────────── */
function ExcelWallpaper() {
  const cols = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  const rows = Array.from({length: 22}, (_, i) => i + 1);
  const funnyData: Record<string, string> = {
    "B2": "Bonheur", "C2": "Motivation", "D2": "Café", "E2": "Résultat",
    "B3": "0%", "C3": "2%", "D3": "500ml", "E3": "=SI(D3>200,\"Fonctionnel\",\"❌\")",
    "B4": "0%", "C4": "0%", "D4": "1L", "E4": "=SI(D4>500,\"Survie\",\"❌\")",
    "B5": "0%", "C5": "0%", "D5": "2L", "E5": "=\"ERREUR#REF\"",
    "B6": "", "C6": "", "D6": "", "E6": "#DIV/0!",
    "B8": "TOTAL BONHEUR:", "E8": "=SOMME(B3:B99)",
    "B9": "RÉSULTAT:", "E9": "0",
    "B11": "💡 Conseil:", "C11": "Avez-vous essayé d'éteindre et rallumer votre vie ?",
    "B13": "Prochain objectif:", "C13": "Survivre jusqu'à vendredi",
    "B14": "Deadline:", "C14": "Hier (en retard de 3 ans)",
    "B16": "Réunion suivante:", "C16": "Dans 5 min (vous n'êtes pas prêt)",
    "B17": "Ordre du jour:", "C17": "Faire une réunion sur les réunions",
  };
  const [selected, setSelected] = useState("B2");
  useEffect(() => {
    const cells = Object.keys(funnyData);
    const t = setInterval(() => setSelected(cells[Math.floor(Math.random() * cells.length)]!), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0, fontFamily: "\"Segoe UI\", Arial, sans-serif" }}>
      {/* Ribbon */}
      <div style={{ background: "#217346", color: "white", padding: "3px 8px", fontSize: "clamp(9px,1.1vw,12px)", display: "flex", gap: 16 }}>
        {["Fichier","Accueil","Insertion","Mise en page","Formules","Données","Révision","Affichage"].map(m => (
          <span key={m} style={{ opacity: m === "Accueil" ? 1 : 0.75 }}>{m}</span>
        ))}
      </div>
      {/* Formula bar */}
      <div style={{ background: "#f2f2f2", borderBottom: "1px solid #c0c0c0", padding: "2px 6px", fontSize: "clamp(9px,1.1vw,12px)", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ background: "white", border: "1px solid #c0c0c0", padding: "1px 6px", minWidth: 40, textAlign: "center" }}>{selected}</span>
        <span style={{ color: "#666" }}>fx</span>
        <span style={{ background: "white", flex: 1, border: "1px solid #c0c0c0", padding: "1px 6px", color: "#000" }}>{funnyData[selected] ?? ""}</span>
      </div>
      {/* Grid */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: "clamp(8px,1vw,11px)", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ background: "#f2f2f2", border: "1px solid #d0d0d0", width: 30, minWidth: 30 }} />
              {cols.map(c => <th key={c} style={{ background: "#f2f2f2", border: "1px solid #d0d0d0", padding: "1px 8px", fontWeight: "normal", minWidth: 70 }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r}>
                <td style={{ background: "#f2f2f2", border: "1px solid #d0d0d0", textAlign: "center", padding: "1px 4px", color: "#666" }}>{r}</td>
                {cols.map(c => {
                  const key = `${c}${r}`;
                  const isSel = key === selected;
                  return (
                    <td key={c} style={{
                      border: isSel ? "2px solid #217346" : "1px solid #d0d0d0",
                      padding: "1px 4px", background: isSel ? "#e8f5ee" : "white",
                      color: (funnyData[key] ?? "").startsWith("#") || funnyData[key] === "0" ? "#c00000" : "#000",
                      whiteSpace: "nowrap", overflow: "hidden", maxWidth: 120,
                    }}>
                      {funnyData[key] ?? ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── PowerPoint Enfer ──────────────────────────────────────── */
function PowerpointWallpaper() {
  const [slide, setSlide] = useState(0);
  const slides = [
    { title: "SYNERGISER LES SYNERGIES", body: "• Leverager nos assets\n• Paradigm shift disruptif\n• ROI+++++\n• Action items à définir", note: "Slide 1/87 — Comic Sans activé" },
    { title: "NOTRE VISION 2025 2026 2027", body: "• Innovation™\n• Disruption™\n• Transformation™\n• [insérer buzzword ici]", note: "Transition: fondu enchaîné + son de gong" },
    { title: "MERCI DE VOTRE ATTENTION", body: "Questions ?\n\n(personne ne pose de questions)\n(tout le monde regarde son téléphone)", note: "Durée réelle de la présentation : 3h47" },
    { title: "LES CHIFFRES CLÉS 📊", body: "• +∞% de croissance\n• -100% de pauses\n• 47 réunions/semaine\n• 0 décisions prises", note: "Les chiffres sont entièrement inventés" },
  ];
  const current = slides[slide % slides.length]!;

  useEffect(() => {
    const t = setInterval(() => setSlide(s => s + 1), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none" style={{ zIndex: 0 }}>
      <style>{`@keyframes ppIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }`}</style>
      {/* Barre PP */}
      <div style={{ background: "#b7472a", padding: "3px 10px", fontSize: "clamp(9px,1.1vw,12px)", color: "white", display: "flex", gap: 12 }}>
        {["Fichier","Accueil","Insertion","Création","Transitions","Animations","Diaporama"].map(m => <span key={m}>{m}</span>)}
      </div>
      {/* Slide */}
      <div className="flex-1 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e003a 0%, #3a0060 100%)", padding: 20 }}>
        <div key={slide} style={{
          background: "linear-gradient(135deg, #2d004a 0%, #1a0030 60%, #300010 100%)",
          border: "1px solid #ff6030", borderRadius: 4, padding: "clamp(16px,3vw,32px)",
          maxWidth: 600, width: "90%", animation: "ppIn 0.4s ease",
          boxShadow: "0 8px 32px rgba(255,96,48,0.3)",
        }}>
          <div style={{ fontFamily: "\"Comic Sans MS\", cursive", fontSize: "clamp(14px,2.5vw,26px)", color: "#ff6030", fontWeight: "bold", marginBottom: 16, textShadow: "0 0 20px rgba(255,96,48,0.6)" }}>
            {current.title}
          </div>
          <div style={{ fontFamily: "\"Comic Sans MS\", cursive", fontSize: "clamp(10px,1.6vw,15px)", color: "#ffeecc", lineHeight: 1.8, whiteSpace: "pre-line" }}>
            {current.body}
          </div>
          <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid rgba(255,96,48,0.3)", fontSize: "clamp(8px,1.1vw,11px)", color: "rgba(255,180,100,0.5)", fontStyle: "italic" }}>
            📝 {current.note}
          </div>
        </div>
      </div>
      {/* Barre status */}
      <div style={{ background: "#b7472a", padding: "2px 10px", fontSize: "clamp(8px,1vw,11px)", color: "rgba(255,255,255,0.8)", display: "flex", justifyContent: "space-between" }}>
        <span>Slide {(slide % slides.length) + 1} sur 87</span>
        <span>🔊 Son activé · ✨ 34 animations · 💫 Transition : Tourbillon</span>
      </div>
    </div>
  );
}

/* ─── Minesweeper ───────────────────────────────────────────── */
function MinesweeperWallpaper() {
  const COLS = 16, ROWS = 10;
  type Cell = { mine: boolean; revealed: boolean; flagged: boolean; count: number };
  const [board, setBoard] = useState<Cell[][]>(() => {
    const b: Cell[][] = Array.from({length: ROWS}, () =>
      Array.from({length: COLS}, () => ({ mine: Math.random() < 0.18, revealed: false, flagged: false, count: 0 }))
    );
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (b[r]![c]!.mine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (b[r+dr]?.[c+dc]?.mine) n++;
      }
      b[r]![c]!.count = n;
    }
    // Pre-reveal some safe cells
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (!b[r]![c]!.mine && Math.random() < 0.35) b[r]![c]!.revealed = true;
    }
    return b;
  });
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      // Reveal a mine after 3s for drama
      setBoard(prev => {
        const next = prev.map(r => r.map(c => ({...c})));
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
          if (next[r]![c]!.mine) { next[r]![c]!.revealed = true; break; }
        }
        return next;
      });
      setExploded(true);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  const numColors = ["","#0000ff","#008000","#ff0000","#000080","#800000","#008080","#000000","#808080"];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 0, background: "#c0c0c0" }}>
      <style>{`@keyframes boom { 0%{transform:scale(1)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }`}</style>
      {/* Window chrome */}
      <div style={{ border: "3px solid", borderTopColor: "#fff", borderLeftColor: "#fff", borderBottomColor: "#808080", borderRightColor: "#808080", boxShadow: "4px 4px 0 rgba(0,0,0,0.4)" }}>
        <div style={{ background: "linear-gradient(to right, #000080, #1084d0)", color: "white", padding: "3px 8px", fontSize: "clamp(10px,1.3vw,13px)", fontFamily: "monospace", display: "flex", justifyContent: "space-between" }}>
          <span>💣 Démineur</span>
          <span style={{ display: "flex", gap: 4 }}>
            {["_","□","✕"].map(b => <span key={b} style={{ border: "2px solid", borderTopColor: "#fff", borderLeftColor: "#fff", borderBottomColor: "#808080", borderRightColor: "#808080", background: "#c0c0c0", color: "#000", width: 16, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{b}</span>)}
          </span>
        </div>
        <div style={{ padding: 8, background: "#c0c0c0" }}>
          {/* Score bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, background: "#808080", padding: "4px 8px", border: "2px solid", borderTopColor: "#808080", borderLeftColor: "#808080", borderBottomColor: "#fff", borderRightColor: "#fff" }}>
            <span style={{ fontFamily: "\"Courier New\", monospace", fontSize: "clamp(14px,2vw,20px)", color: "#ff0000", background: "#000", padding: "2px 4px", letterSpacing: 2 }}>019</span>
            <span style={{ fontSize: "clamp(20px,3vw,32px)", animation: exploded ? "boom 0.3s ease" : "none" }}>{exploded ? "😵" : "🙂"}</span>
            <span style={{ fontFamily: "\"Courier New\", monospace", fontSize: "clamp(14px,2vw,20px)", color: "#ff0000", background: "#000", padding: "2px 4px", letterSpacing: 2 }}>042</span>
          </div>
          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 1 }}>
            {board.flat().map((cell, i) => (
              <div key={i} style={{
                width: "clamp(16px,1.8vw,22px)", height: "clamp(16px,1.8vw,22px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "clamp(8px,1vw,12px)", fontWeight: "bold", fontFamily: "monospace",
                background: cell.revealed ? "#c0c0c0" : "#c0c0c0",
                border: cell.revealed ? "1px solid #808080" : "2px solid",
                borderTopColor: cell.revealed ? "#808080" : "#fff",
                borderLeftColor: cell.revealed ? "#808080" : "#fff",
                borderBottomColor: cell.revealed ? "#808080" : "#808080",
                borderRightColor: cell.revealed ? "#808080" : "#808080",
                color: cell.revealed && !cell.mine ? numColors[cell.count] ?? "#000" : "inherit",
              }}>
                {cell.revealed
                  ? (cell.mine ? <span style={{ animation: exploded ? "boom 0.4s ease" : "none" }}>💥</span> : (cell.count > 0 ? cell.count : ""))
                  : (cell.flagged ? "🚩" : "")}
              </div>
            ))}
          </div>
          {exploded && (
            <div style={{ textAlign: "center", marginTop: 8, fontFamily: "monospace", fontSize: "clamp(10px,1.3vw,13px)", fontWeight: "bold" }}>
              BOOM — Comme prévu. Réessayer ?
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Geocities 1999 ────────────────────────────────────────── */
function GeocitiesWallpaper() {
  const [blink, setBlink] = useState(true);
  const [visitors, setVisitors] = useState(47);
  useEffect(() => {
    const b = setInterval(() => setBlink(v => !v), 600);
    const v = setInterval(() => setVisitors(n => n + Math.floor(Math.random() * 3)), 2000);
    return () => { clearInterval(b); clearInterval(v); };
  }, []);

  const gifs = ["🌟","💫","✨","⭐","🌈","🔥","💎","🎆","🎇","🌠"];
  const marqueeItems = ["🚧 SITE EN CONSTRUCTION 🚧","📧 MON EMAIL : gunth@club-internet.fr","🎵 MUSIQUE : midi_gunth.mid","💌 LAISSEZ UN MESSAGE !","🏆 MEILLEUR SITE 1999"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0, fontFamily: "\"Comic Sans MS\", cursive" }}>
      <style>{`
        @keyframes gcSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes gcRainbow { 0%{color:#ff0000} 16%{color:#ff8800} 33%{color:#ffff00} 50%{color:#00ff00} 66%{color:#0088ff} 83%{color:#ff00ff} 100%{color:#ff0000} }
        @keyframes gcFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes gcMarquee { from{transform:translateX(100%)} to{transform:translateX(-100%)} }
      `}</style>

      {/* Fond étoiles */}
      {Array.from({length: 20}, (_, i) => (
        <div key={i} className="absolute" style={{ left: `${(i*13+7)%97}%`, top: `${(i*17+11)%90}%`, fontSize: 12 + (i%3)*6, opacity: 0.3, animation: `gcFloat ${2+i%3}s ease-in-out ${i*0.3}s infinite` }}>
          {gifs[i % gifs.length]}
        </div>
      ))}

      {/* Titre rainbow */}
      <div style={{ textAlign: "center", paddingTop: "8%", position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: "clamp(20px,5vw,52px)", fontWeight: "bold", animation: "gcRainbow 1s linear infinite", textShadow: "3px 3px 0 rgba(0,0,0,0.5)" }}>
          ★ BIENVENUE SUR MA PAGE ★
        </div>
        <div style={{ fontSize: "clamp(12px,2vw,20px)", color: blink ? "#ffff00" : "transparent", marginTop: 8 }}>
          ⚡ EN CONSTRUCTION ⚡
        </div>
      </div>

      {/* Compteur de visiteurs */}
      <div style={{ textAlign: "center", marginTop: 16, position: "relative", zIndex: 2 }}>
        <div style={{ display: "inline-block", background: "#000080", border: "3px solid #ffff00", padding: "6px 16px" }}>
          <div style={{ color: "#ffff00", fontSize: "clamp(9px,1.2vw,12px)" }}>👁️ VISITEURS</div>
          <div style={{ color: "#00ffff", fontFamily: "\"Courier New\", monospace", fontSize: "clamp(16px,2.5vw,28px)", letterSpacing: 4 }}>
            {String(visitors).padStart(7, "0")}
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div style={{ background: "#000080", color: "#ffff00", overflow: "hidden", marginTop: 20, padding: "4px 0", position: "relative", zIndex: 2 }}>
        <div style={{ whiteSpace: "nowrap", animation: "gcMarquee 12s linear infinite", fontSize: "clamp(10px,1.4vw,14px)" }}>
          {marqueeItems.join("   ·   ")}
        </div>
      </div>

      {/* Avertissement */}
      <div style={{ textAlign: "center", marginTop: 20, fontSize: "clamp(8px,1.1vw,12px)", color: "#ff00ff", position: "relative", zIndex: 2 }}>
        ⚠️ Ce site est optimisé pour <span style={{ color: "#00ffff" }}>Internet Explorer 4.0</span> — résolution 800×600
      </div>

      {/* GIF spinner */}
      <div style={{ position: "absolute", right: "5%", top: "10%", fontSize: 40, animation: "gcSpin 2s linear infinite", zIndex: 3 }}>⭐</div>
      <div style={{ position: "absolute", left: "5%", top: "12%", fontSize: 32, animation: "gcSpin 3s linear infinite reverse", zIndex: 3 }}>🌟</div>
    </div>
  );
}

/* ─── Internet Explorer 6 ───────────────────────────────────── */
function Ie6Wallpaper() {
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState(0);
  const msgs = [
    "Connexion au site…",
    "Recherche de www.gunth.com…",
    "Téléchargement de la page…",
    "Attente de la réponse…",
    "Chargement des images (1 sur 47)…",
    "Script Java non pris en charge",
    "Erreur de certificat SSL — Continuer ?",
    "Cette page contient des éléments non sécurisés",
    "ActiveX bloqué. Débloquer ? (Oui / Non / Peut-être)",
    "⏳ Ne pas éteindre IE pendant le chargement",
  ];
  const popups = [
    "Vous êtes le 1 000 000e visiteur ! 🎉",
    "Votre PC est infecté ! Appelez le 0800-GUNTH",
    "Téléchargez notre barre d'outils GRATUITE",
    "Agrandissez votre [publicité censurée]",
    "Flash Player doit être mis à jour",
  ];
  const [popup, setPopup] = useState<string | null>(null);

  useEffect(() => {
    const p = setInterval(() => setProgress(v => v >= 100 ? 0 : v + 0.8), 60);
    const m = setInterval(() => setMsg(v => (v + 1) % msgs.length), 2200);
    const pp = setInterval(() => setPopup(popups[Math.floor(Math.random() * popups.length)]!), 5000);
    return () => { clearInterval(p); clearInterval(m); clearInterval(pp); };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, background: "#ece9d8", fontFamily: "\"Tahoma\", sans-serif" }}>
      {/* Chrome IE */}
      <div style={{ background: "linear-gradient(to bottom, #e8e4d8, #d4d0c8)", borderBottom: "1px solid #808080", padding: "4px 8px", fontSize: "clamp(9px,1.1vw,12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: "clamp(14px,2vw,20px)" }}>🌐</span>
          <div style={{ background: "white", flex: 1, border: "2px solid", borderTopColor: "#808080", borderLeftColor: "#808080", borderBottomColor: "#fff", borderRightColor: "#fff", padding: "2px 6px", fontSize: "clamp(9px,1.1vw,12px)" }}>
            http://www.gunth.com/index.htm
          </div>
          <div style={{ background: "linear-gradient(to bottom, #ffffff, #d4d0c8)", border: "2px solid", borderTopColor: "#fff", borderLeftColor: "#fff", borderBottomColor: "#808080", borderRightColor: "#808080", padding: "2px 10px", fontSize: "clamp(9px,1.1vw,12px)" }}>
            OK
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: "#d4d0c8", border: "1px solid #808080" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(to right, #0a246a, #a6caf0)", transition: "width 0.06s linear" }} />
        </div>
      </div>
      {/* Page content */}
      <div style={{ padding: 16, fontSize: "clamp(9px,1.2vw,13px)" }}>
        <div style={{ color: "#0000ee", textDecoration: "underline", marginBottom: 8, fontSize: "clamp(11px,1.5vw,16px)" }}>
          Bienvenue sur GunthOS™ Internet
        </div>
        <div style={{ color: "#333", marginBottom: 4 }}>Cette page utilise des technologies avancées :</div>
        {["ActiveX ✓", "Java Applets ✓", "Flash 5 ✓", "Frames imbriquées ✓", "Tableaux dans tableaux ✓"].map(item => (
          <div key={item} style={{ color: "#0000cc", marginLeft: 12, fontSize: "clamp(8px,1vw,11px)" }}>• {item}</div>
        ))}
        <div style={{ marginTop: 12, color: "#cc0000", fontSize: "clamp(8px,1vw,11px)" }}>
          ⚠️ Erreur : {msgs[msg]}
        </div>
      </div>
      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0" style={{ background: "linear-gradient(to bottom, #e8e4d8, #d4d0c8)", borderTop: "1px solid #808080", padding: "2px 8px", fontSize: "clamp(8px,1vw,11px)", display: "flex", justifyContent: "space-between" }}>
        <span>🌐 {msgs[msg]}</span>
        <span>Zone Internet | {Math.floor(progress)}%</span>
      </div>
      {/* Popup */}
      {popup && (
        <div className="absolute" style={{ top: "30%", left: "50%", transform: "translateX(-50%)", zIndex: 5, minWidth: 240 }}>
          <div style={{ background: "#ece9d8", border: "3px solid", borderTopColor: "#fff", borderLeftColor: "#fff", borderBottomColor: "#808080", borderRightColor: "#808080", boxShadow: "4px 4px 0 rgba(0,0,0,0.4)" }}>
            <div style={{ background: "linear-gradient(to right, #000080, #1084d0)", color: "white", padding: "3px 8px", fontSize: "clamp(9px,1.1vw,12px)", display: "flex", justifyContent: "space-between" }}>
              <span>⚠️ Message de la page Web</span>
              <span onClick={() => setPopup(null)} style={{ cursor: "default" }}>✕</span>
            </div>
            <div style={{ padding: "12px 16px", fontSize: "clamp(9px,1.2vw,13px)" }}>{popup}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingBottom: 10 }}>
              {["OK","Annuler","Aide"].map(b => (
                <div key={b} style={{ border: "2px solid", borderTopColor: "#fff", borderLeftColor: "#fff", borderBottomColor: "#808080", borderRightColor: "#808080", background: "#ece9d8", padding: "2px 14px", fontSize: "clamp(9px,1.1vw,12px)", cursor: "default" }}>{b}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Notepad.exe ───────────────────────────────────────────── */
function NotepadWallpaper() {
  const fullText = `Idées pour changer ma vie.txt - Bloc-notes
══════════════════════════════════════════

TODO:
- Apprendre le Python (depuis 2018)
- Finir ce projet (depuis 2019)
- Rédiger le README (depuis 2020)
- Supprimer ce fichier (ne jamais faire)
- Être productif (définir "productif" d'abord)
- Appeler maman
- Arrêter de laisser 47 onglets ouverts
- IMPORTANT: mot de passe wifi =
  (j'ai oublié)

Notes réunion 14h:
- Réunion annulée → reportée à demain
- Demain → reportée à la semaine prochaine
- La semaine prochaine → annulée définitivement
- Conclusion: parfait

asdfghjkl
asdfghjkl
asdfghjkl
(je testais le clavier)

█`;

  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i < fullText.length) { setDisplayed(fullText.slice(0, i + 1)); i++; }
      else clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none" style={{ zIndex: 0, background: "#f8f8f8", fontFamily: "\"Courier New\", monospace" }}>
      {/* Window chrome */}
      <div style={{ background: "linear-gradient(to right, #000080, #1084d0)", color: "white", padding: "3px 8px", fontSize: "clamp(9px,1.1vw,12px)", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
        <span>📝 Idées pour changer ma vie.txt — Bloc-notes</span>
        <span style={{ display: "flex", gap: 4 }}>
          {["_","□","✕"].map(b => <span key={b} style={{ border: "2px solid", borderTopColor: "#fff", borderLeftColor: "#fff", borderBottomColor: "#808080", borderRightColor: "#808080", background: "#d4d0c8", width: 16, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#000" }}>{b}</span>)}
        </span>
      </div>
      <div style={{ background: "#d4d0c8", padding: "2px 8px", fontSize: "clamp(8px,1vw,11px)", display: "flex", gap: 16, flexShrink: 0 }}>
        {["Fichier","Edition","Format","Affichage","?"].map(m => <span key={m}>{m}</span>)}
      </div>
      {/* Text area */}
      <div className="flex-1 overflow-hidden" style={{ background: "white", border: "2px solid", borderTopColor: "#808080", borderLeftColor: "#808080", borderBottomColor: "#fff", borderRightColor: "#fff", padding: 8, fontSize: "clamp(9px,1.2vw,13px)", whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#000" }}>
        {displayed}
      </div>
      <div style={{ background: "#d4d0c8", borderTop: "1px solid #808080", padding: "1px 8px", fontSize: "clamp(8px,1vw,10px)", color: "#444" }}>
        Ln 999   Col 1   Fichier non enregistré depuis 6 ans
      </div>
    </div>
  );
}

/* ─── Commodore 64 ──────────────────────────────────────────── */
function C64Wallpaper() {
  const [cursor, setCursor] = useState(true);
  const [line, setLine] = useState(0);
  const boot = [
    "    **** COMMODORE 64 BASIC V2 ****",
    "",
    " 64K RAM SYSTEM  38911 BASIC BYTES FREE",
    "",
    "READY.",
    "",
    "LOAD \"GUNTH_OS\",8,1",
    "",
    "SEARCHING FOR GUNTH_OS",
    "LOADING",
    "READY.",
    "",
    "RUN",
    "",
    "GUNTHOS V1.0",
    "COPYRIGHT (C) 1982 COMMODORE",
    "ALL RIGHTS RESERVED (HA)",
    "",
    "?SYNTAX ERROR IN 10",
    "?SYNTAX ERROR IN 20",
    "?OUT OF MEMORY ERROR IN 30",
    "",
    "READY.",
    "> _",
  ];
  useEffect(() => {
    const c = setInterval(() => setCursor(v => !v), 530);
    const l = setInterval(() => setLine(v => Math.min(v + 1, boot.length)), 200);
    return () => { clearInterval(c); clearInterval(l); };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0, background: "#4040a0" }}>
      <div style={{ background: "#4040a0", border: "8px solid #7878f0", padding: "20px 28px", maxWidth: 520, width: "90%", boxShadow: "0 0 0 3px #303090" }}>
        {boot.slice(0, line).map((l, i) => (
          <div key={i} style={{ fontFamily: "\"Courier New\", monospace", fontSize: "clamp(10px,1.4vw,15px)", color: "#7878f0", lineHeight: 1.5, letterSpacing: 1 }}>
            {l === "> _"
              ? <span>{'>'} <span style={{ opacity: cursor ? 1 : 0, background: "#7878f0", color: "#4040a0" }}> </span></span>
              : (l || " ")}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Winamp Visualizer ─────────────────────────────────────── */
function WinampWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [track] = useState({ title: "Darude — Sandstorm", time: "1:47", total: "3:45" });
  const [pos, setPos] = useState(0.47);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      const W = canvas.offsetWidth; const H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      const bars = 64;
      const bw = W / bars;
      for (let i = 0; i < bars; i++) {
        const h = (Math.sin(i * 0.4 + frame * 0.08) * 0.5 + 0.5) *
                  (Math.sin(i * 0.15 + frame * 0.05) * 0.3 + 0.7) * H * 0.8;
        const g = ctx.createLinearGradient(0, H - h, 0, H);
        g.addColorStop(0, "#00ffaa");
        g.addColorStop(0.5, "#00cc66");
        g.addColorStop(1, "#004422");
        ctx.fillStyle = g;
        ctx.fillRect(i * bw + 1, H - h, bw - 2, h);
      }
      frame++;
    };
    const interval = setInterval(draw, 40);
    const posInterval = setInterval(() => setPos(p => (p + 0.002) % 1), 100);
    return () => { clearInterval(interval); clearInterval(posInterval); };
  }, []);

  const fmt = (p: number) => { const s = Math.floor(p * 225); return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      {/* Player window */}
      <div style={{ background: "#1a1a1a", border: "2px solid #00ff88", boxShadow: "0 0 24px rgba(0,255,136,0.4)", width: "min(480px,90%)" }}>
        {/* Title bar */}
        <div style={{ background: "linear-gradient(to right, #003322, #001a11)", padding: "4px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "monospace", fontSize: "clamp(9px,1.1vw,11px)", color: "#00ff88", letterSpacing: 1 }}>WINAMP</span>
          <span style={{ fontSize: "clamp(8px,1vw,10px)", color: "#00aa55" }}>▬ ❐ ✕</span>
        </div>
        {/* Track info */}
        <div style={{ background: "#000", padding: "6px 10px", borderTop: "1px solid #004422", borderBottom: "1px solid #004422" }}>
          <div style={{ fontFamily: "monospace", fontSize: "clamp(9px,1.2vw,13px)", color: "#00ff88", overflow: "hidden", whiteSpace: "nowrap" }}>
            {track.title}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "clamp(8px,1vw,11px)", color: "#00aa55", marginTop: 2 }}>
            <span>{fmt(pos)}</span><span style={{ color: "#00ff88" }}>192 kbps  44100 Hz  Stereo</span><span>-{fmt(1 - pos)}</span>
          </div>
        </div>
        {/* Visualizer */}
        <canvas ref={canvasRef} style={{ width: "100%", height: "clamp(60px,8vw,100px)", display: "block" }} />
        {/* Progress */}
        <div style={{ padding: "6px 10px", background: "#111" }}>
          <div style={{ height: 6, background: "#003322", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${pos * 100}%`, background: "linear-gradient(to right, #00aa55, #00ff88)", transition: "width 0.1s linear" }} />
          </div>
          {/* Controls */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {["⏮","⏪","⏹","▶","⏩","⏭"].map(btn => (
              <div key={btn} style={{ background: "#222", border: "1px solid #00ff88", color: "#00ff88", padding: "3px 8px", fontSize: "clamp(10px,1.4vw,14px)", cursor: "default" }}>{btn}</div>
            ))}
          </div>
          {/* Volume */}
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, fontSize: "clamp(8px,1vw,11px)", color: "#00aa55" }}>
            <span>VOL</span>
            <div style={{ flex: 1, height: 4, background: "#003322" }}>
              <div style={{ width: "73%", height: "100%", background: "#00ff88" }} />
            </div>
            <span>EQ</span>
            <div style={{ flex: 1, height: 4, background: "#003322" }}>
              <div style={{ width: "50%", height: "100%", background: "#00ff88" }} />
            </div>
          </div>
        </div>
      </div>
      {/* Playlist */}
      <div style={{ background: "#0a0a0a", border: "2px solid #00ff88", marginTop: 2, width: "min(480px,90%)", padding: "4px 0" }}>
        {["01. Darude — Sandstorm ▶","02. Eiffel 65 — Blue (da ba dee)","03. Aqua — Barbie Girl","04. Vengaboys — We Like to Party"].map((t, i) => (
          <div key={i} style={{ padding: "2px 8px", fontSize: "clamp(8px,1vw,11px)", fontFamily: "monospace", color: i === 0 ? "#00ff88" : "#005522", background: i === 0 ? "#001a0a" : "transparent" }}>{t}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── MS Paint ──────────────────────────────────────────────── */
function MsPaintWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = ["#ff0000","#ff8800","#ffff00","#00ff00","#0000ff","#ff00ff","#00ffff","#ffffff","#000000","#808080","#804000","#008000","#000080","#800080","#008080","#c0c0c0"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth; const H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, W, H);

    // Dessin aléatoire "style enfant de 7 ans"
    const strokes = [
      { tool: "circle", x: 0.5, y: 0.45, r: 0.22, color: "#ffff00", fill: true },
      { tool: "circle", x: 0.5, y: 0.45, r: 0.22, color: "#000000", fill: false },
      // Yeux
      { tool: "circle", x: 0.44, y: 0.39, r: 0.03, color: "#000000", fill: true },
      { tool: "circle", x: 0.56, y: 0.39, r: 0.03, color: "#000000", fill: true },
      // Sourire
      { tool: "arc", x: 0.5, y: 0.46, r: 0.1, a1: 0.1, a2: Math.PI - 0.1, color: "#000000" },
      // Corps rectangle
      { tool: "rect", x: 0.38, y: 0.67, w: 0.24, h: 0.2, color: "#0000ff", fill: true },
      // Bras
      { tool: "line", x1: 0.38, y1: 0.70, x2: 0.25, y2: 0.78, color: "#0000ff" },
      { tool: "line", x1: 0.62, y1: 0.70, x2: 0.75, y2: 0.78, color: "#0000ff" },
      // Jambes
      { tool: "line", x1: 0.44, y1: 0.87, x2: 0.40, y2: 1.0, color: "#0000ff" },
      { tool: "line", x1: 0.56, y1: 0.87, x2: 0.60, y2: 1.0, color: "#0000ff" },
      // Soleil
      { tool: "circle", x: 0.12, y: 0.12, r: 0.07, color: "#ffff00", fill: true },
      { tool: "circle", x: 0.12, y: 0.12, r: 0.07, color: "#ff8800", fill: false },
      // Maison
      { tool: "rect", x: 0.68, y: 0.6, w: 0.2, h: 0.18, color: "#ff8800", fill: true },
      { tool: "triangle", x: 0.78, y: 0.47, color: "#ff0000" },
      // Herbe
      { tool: "rect", x: 0, y: 0.88, w: 1, h: 0.12, color: "#00aa00", fill: true },
      // Nuages scribouillés
      { tool: "scribble", x: 0.25, y: 0.15, color: "#c0c0c0" },
      { tool: "scribble", x: 0.65, y: 0.12, color: "#c0c0c0" },
    ];

    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (const s of strokes) {
      ctx.strokeStyle = s.color;
      ctx.fillStyle = s.color;
      if (s.tool === "circle") {
        ctx.beginPath();
        ctx.arc(s.x! * W, s.y! * H, s.r! * Math.min(W, H), 0, Math.PI * 2);
        if ((s as {fill?: boolean}).fill) ctx.fill(); else ctx.stroke();
      } else if (s.tool === "arc") {
        ctx.beginPath();
        ctx.arc(s.x! * W, s.y! * H, s.r! * Math.min(W, H), (s as {a1?: number}).a1!, (s as {a2?: number}).a2!);
        ctx.stroke();
      } else if (s.tool === "rect") {
        const rs = s as {x:number;y:number;w:number;h:number;fill?:boolean};
        if (rs.fill) ctx.fillRect(rs.x*W, rs.y*H, rs.w*W, rs.h*H);
        else ctx.strokeRect(rs.x*W, rs.y*H, rs.w*W, rs.h*H);
      } else if (s.tool === "line") {
        const ls = s as {x1:number;y1:number;x2:number;y2:number};
        ctx.beginPath(); ctx.moveTo(ls.x1*W, ls.y1*H); ctx.lineTo(ls.x2*W, ls.y2*H); ctx.stroke();
      } else if (s.tool === "triangle") {
        ctx.beginPath();
        ctx.moveTo(s.x! * W, s.y! * H);
        ctx.lineTo((s.x! - 0.12) * W, (s.y! + 0.13) * H);
        ctx.lineTo((s.x! + 0.12) * W, (s.y! + 0.13) * H);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (s.tool === "scribble") {
        ctx.beginPath();
        ctx.ellipse(s.x! * W, s.y! * H, 0.07 * W, 0.04 * H, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Texte "MAMAN"
    ctx.fillStyle = "#ff00ff";
    ctx.font = `bold ${Math.floor(H * 0.07)}px "Comic Sans MS", cursive`;
    ctx.fillText("MAMAN", 0.03 * W, 0.98 * H);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none" style={{ zIndex: 0 }}>
      {/* Window chrome */}
      <div style={{ background: "linear-gradient(to right, #000080, #1084d0)", color: "white", padding: "3px 8px", fontSize: "clamp(9px,1.1vw,12px)", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
        <span>🖌️ Sans titre — Paint</span>
        <span style={{ display: "flex", gap: 4 }}>
          {["_","□","✕"].map(b => <span key={b} style={{ border: "2px solid", borderTopColor: "#fff", borderLeftColor: "#fff", borderBottomColor: "#808080", borderRightColor: "#808080", background: "#d4d0c8", width: 16, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#000" }}>{b}</span>)}
        </span>
      </div>
      {/* Toolbar */}
      <div style={{ background: "#d4d0c8", borderBottom: "1px solid #808080", padding: "3px 6px", display: "flex", gap: 4, flexWrap: "wrap", flexShrink: 0 }}>
        {["✏️","🖌️","🗑️","📐","◯","▭","🪣","🔍","✂️","📋"].map(t => (
          <div key={t} style={{ border: "2px solid", borderTopColor: "#fff", borderLeftColor: "#fff", borderBottomColor: "#808080", borderRightColor: "#808080", background: "#d4d0c8", padding: "2px 4px", fontSize: "clamp(10px,1.3vw,14px)" }}>{t}</div>
        ))}
        {/* Palette */}
        <div style={{ display: "flex", flexWrap: "wrap", width: "clamp(80px,12vw,128px)", gap: 1, marginLeft: 8 }}>
          {colors.map(c => <div key={c} style={{ width: "clamp(8px,1vw,12px)", height: "clamp(8px,1vw,12px)", background: c, border: "1px solid #808080" }} />)}
        </div>
      </div>
      {/* Canvas */}
      <div className="flex-1 overflow-hidden" style={{ background: "#808080", padding: 4 }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }} />
      </div>
      <div style={{ background: "#d4d0c8", borderTop: "1px solid #808080", padding: "1px 8px", fontSize: "clamp(7px,0.9vw,10px)", color: "#444" }}>
        Pour obtenir de l&apos;aide, cliquez sur Rubriques d&apos;aide dans le menu ?
      </div>
    </div>
  );
}

// ── VOL. 3 ───────────────────────────────────────────────────────────────────

function AolWallpaper() {
  const [dots, setDots] = useState(0);
  const [percent, setPercent] = useState(0);
  const [msgs, setMsgs] = useState<string[]>([]);
  const [popup, setPopup] = useState(false);

  const lines = [
    "Initialisation du modem...",
    "Numérotation: 0800 900 900...",
    "Connexion au serveur AOL...",
    "Vérification des paramètres...",
    "Chargement de la session...",
    "Bienvenue sur AOL !",
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => (d + 1) % 4);
      setPercent(p => {
        if (p >= 100) return 0;
        return p + 1;
      });
    }, 120);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < lines.length) { setMsgs(m => [...m, lines[i] as string]); i++; }
      else { setMsgs([]); i = 0; }
    }, 800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setPopup(p => !p), 4000);
    return () => clearInterval(id);
  }, []);

  const dot = ".".repeat(dots);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: '"Arial", sans-serif', gap: 16 }}>
      {/* Logo AOL */}
      <div style={{ fontSize: "clamp(32px,6vw,72px)", fontWeight: 900, color: "#ffcc00", textShadow: "3px 3px 0 #003087, 6px 6px 0 rgba(0,0,0,0.5)", letterSpacing: -2 }}>
        AOL
      </div>
      <div style={{ color: "#aaccff", fontSize: "clamp(10px,1.4vw,16px)" }}>America Online™</div>

      {/* Terminal */}
      <div style={{ background: "#000f30", border: "2px solid #ffcc00", padding: "12px 20px", width: "clamp(260px,40vw,420px)", borderRadius: 4, fontFamily: '"Courier New", monospace', fontSize: "clamp(9px,1.1vw,13px)" }}>
        {msgs.map((m, i) => <div key={i} style={{ color: i === msgs.length - 1 ? "#ffcc00" : "#6699cc", marginBottom: 2 }}>{m}</div>)}
        <div style={{ color: "#ffcc00" }}>_{dot}</div>
      </div>

      {/* Barre de progression */}
      <div style={{ width: "clamp(260px,40vw,420px)" }}>
        <div style={{ background: "#001f5c", border: "1px solid #ffcc00", height: 16, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${percent}%`, background: "linear-gradient(to right, #003087, #ffcc00)", transition: "width 0.1s" }} />
        </div>
        <div style={{ color: "#aaccff", fontSize: "clamp(8px,1vw,11px)", marginTop: 4, textAlign: "center" }}>Connexion en cours{dot} {percent}%</div>
      </div>

      {/* Popup "You've Got Mail" */}
      {popup && (
        <div style={{ position: "absolute", top: "15%", right: "10%", background: "#fffde7", border: "2px solid #003087", borderRadius: 4, padding: "12px 20px", boxShadow: "4px 4px 0 rgba(0,0,0,0.5)", textAlign: "center", fontSize: "clamp(10px,1.2vw,14px)", color: "#003087", fontWeight: "bold", zIndex: 10 }}>
          <div style={{ fontSize: "clamp(20px,3vw,36px)" }}>✉️</div>
          <div>You&apos;ve Got Mail!</div>
          <div style={{ fontSize: "clamp(8px,0.9vw,10px)", color: "#666", marginTop: 4 }}>247 nouveaux messages</div>
          <div style={{ marginTop: 8, fontSize: "clamp(7px,0.8vw,9px)", background: "#003087", color: "#ffcc00", padding: "2px 8px", borderRadius: 2, cursor: "pointer" }}>OK</div>
        </div>
      )}

      {/* CD AOL flottant */}
      <div style={{ position: "absolute", bottom: "8%", left: "5%", width: "clamp(48px,7vw,80px)", height: "clamp(48px,7vw,80px)", borderRadius: "50%", background: "conic-gradient(#003087,#ffcc00,#0050c8,#aaccff,#003087)", boxShadow: "0 0 20px rgba(255,204,0,0.4)", animation: "spin 4s linear infinite" }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function TamagotchiDeathWallpaper() {
  const [frame, setFrame] = useState(0);
  const [phase, setPhase] = useState<"alive"|"dying"|"dead">("alive");
  const [hunger, setHunger] = useState(3);
  const [, setTimer] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrame(f => (f + 1) % 2);
      setTimer(t => {
        const next = t + 1;
        if (next === 20) setHunger(2);
        if (next === 40) setHunger(1);
        if (next === 60) { setHunger(0); setPhase("dying"); }
        if (next === 80) setPhase("dead");
        if (next === 120) { setPhase("alive"); setHunger(3); return 0; }
        return next;
      });
    }, 300);
    return () => clearInterval(id);
  }, []);

  const aliveFrames: [string, string][] = [
    ["  ","OO"],
    ["  ","@@"],
  ];
  const dyingFrame: [string, string] = [";;","xx"];
  const deadFrame: [string, string]  = ["  ","RIP"];

  const face: [string, string] = phase === "dead" ? deadFrame : phase === "dying" ? dyingFrame : (aliveFrames[frame % aliveFrames.length]!);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: '"Courier New", monospace', gap: 12 }}>
      {/* Coquille */}
      <div style={{ background: "linear-gradient(135deg, #ffb0d8 0%, #ff80c0 100%)", border: "8px solid #e060a0", borderRadius: "50% 50% 40% 40%", width: "clamp(140px,22vw,200px)", height: "clamp(160px,26vw,240px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(255,64,160,0.5)" }}>
        {/* Écran LCD */}
        <div style={{ background: phase === "dead" ? "#555" : "#9bbc0f", border: "3px solid #3a0020", borderRadius: 4, width: "60%", height: "clamp(60px,9vw,90px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: '"Courier New", monospace', fontSize: "clamp(8px,1.3vw,16px)", lineHeight: 1.2 }}>
          <div style={{ color: "#0f380f", fontSize: "clamp(16px,2.5vw,28px)", letterSpacing: 2 }}>{face[0]}</div>
          <div style={{ color: "#0f380f", fontSize: "clamp(16px,2.5vw,28px)", letterSpacing: 2 }}>{face[1]}</div>
          {phase === "dead" && <div style={{ color: "#ffffff", fontSize: "clamp(6px,0.8vw,9px)", marginTop: 4 }}>GAME OVER</div>}
        </div>
        {/* Faim */}
        <div style={{ display: "flex", gap: 4 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ fontSize: "clamp(10px,1.5vw,18px)" }}>{i < hunger ? "❤️" : "🖤"}</div>
          ))}
        </div>
        {/* Boutons */}
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          {["A","B","C"].map(b => <div key={b} style={{ background: "#e060a0", border: "2px solid #3a0020", borderRadius: "50%", width: "clamp(14px,2vw,22px)", height: "clamp(14px,2vw,22px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(7px,1vw,11px)", color: "#fff", fontWeight: "bold" }}>{b}</div>)}
        </div>
      </div>

      <div style={{ color: "#3a0020", fontSize: "clamp(9px,1.2vw,14px)", fontFamily: '"Fredoka One", sans-serif', textAlign: "center", maxWidth: "60%", opacity: 0.8 }}>
        {phase === "dead" ? "💀 Il était 08:47. Tu étais en maths." : phase === "dying" ? "😵 Au secours... faim..." : "🐾 Nourris-moi !!!"}
      </div>
    </div>
  );
}

function SolitaireWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const suits = ["♠","♥","♦","♣"];
    const colors = ["#cc0000","#cc0000","#000000","#000000"];
    type Card = { x: number; y: number; vx: number; vy: number; suit: string; color: string; val: string; rot: number; vr: number };
    const cards: Card[] = [];
    const vals = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let launched = false;
    const launchTimeout = setTimeout(() => {
      launched = true;
      for (let i = 0; i < 52; i++) {
        const si = i % 4;
        cards.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 14,
          vy: -(Math.random() * 12 + 4),
          suit: suits[si]!,
          color: colors[si]!,
          val: vals[i % 13]!,
          rot: 0,
          vr: (Math.random() - 0.5) * 0.3,
        });
      }
    }, 800);

    const drawCard = (c: Card) => {
      const W = Math.min(canvas.width * 0.06, 50);
      const H = W * 1.4;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-W/2, -H/2, W, H, 3);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = c.color;
      ctx.font = `bold ${W * 0.28}px Arial`;
      ctx.textAlign = "left";
      ctx.fillText(c.val + c.suit, -W/2 + 2, -H/2 + W * 0.3);
      ctx.font = `${W * 0.4}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(c.suit, 0, H * 0.15);
      ctx.restore();
    };

    const draw = () => {
      ctx.fillStyle = "#35763a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fond tapis
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

      if (!launched) {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = `bold ${Math.min(canvas.width * 0.03, 24)}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText("🎉 FÉLICITATIONS ! 🎉", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = `${Math.min(canvas.width * 0.02, 16)}px Arial`;
        ctx.fillText("Vous avez gagné au Solitaire !", canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText("(Pour la première fois depuis 2003)", canvas.width / 2, canvas.height / 2 + 32);
      }

      for (const c of cards) {
        c.x += c.vx;
        c.vy += 0.6;
        c.y += c.vy;
        c.rot += c.vr;
        if (c.y > canvas.height + 60) {
          c.x = canvas.width / 2;
          c.y = canvas.height / 2;
          c.vx = (Math.random() - 0.5) * 14;
          c.vy = -(Math.random() * 12 + 4);
          c.rot = 0;
        }
        drawCard(c);
      }
    };

    let raf: number;
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    loop();
    return () => { cancelAnimationFrame(raf); clearTimeout(launchTimeout); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

function NasaPanicWallpaper() {
  const [tick, setTick] = useState(0);
  const [alarm, setAlarm] = useState(false);

  const systems = [
    { name: "MOTEUR PRINCIPAL", status: "CRITIQUE", color: "#ff4400" },
    { name: "BOUCLIER THERMIQUE", status: "DÉFAILLANCE", color: "#ff4400" },
    { name: "NAVIGATION", status: "OFFLINE", color: "#ff4400" },
    { name: "COMMUNICATIONS", status: "STATIQUE", color: "#ffaa00" },
    { name: "OXYGÈNE", status: "3h RESTANTES", color: "#ffaa00" },
    { name: "CAFÉ DE BORD", status: "OK", color: "#00ff44" },
  ];

  useEffect(() => {
    const id = setInterval(() => { setTick(t => t + 1); setAlarm(a => !a); }, 600);
    return () => clearInterval(id);
  }, []);

  const countdown = Math.max(0, 99 - (tick % 100));

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "clamp(8px,2vw,24px)", fontFamily: '"Courier New", monospace', gap: 8, background: alarm ? "rgba(80,0,0,0.3)" : "transparent", transition: "background 0.3s" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ff4400", paddingBottom: 8 }}>
        <div style={{ color: "#ff4400", fontSize: "clamp(10px,1.5vw,18px)", fontWeight: "bold", letterSpacing: 2 }}>🚀 MISSION CONTROL — GUNTH-1</div>
        <div style={{ color: alarm ? "#ff0000" : "#ff4400", fontSize: "clamp(16px,2.5vw,32px)", fontWeight: "bold", fontVariantNumeric: "tabular-nums" }}>T-{String(countdown).padStart(2,"0")}</div>
      </div>

      {/* Systèmes */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {systems.map(s => (
          <div key={s.name} style={{ border: `1px solid ${s.color}`, padding: "6px 10px", borderRadius: 2, background: `${s.color}11` }}>
            <div style={{ color: "#ff8800", fontSize: "clamp(7px,0.9vw,10px)", letterSpacing: 1 }}>{s.name}</div>
            <div style={{ color: s.color, fontSize: "clamp(9px,1.2vw,14px)", fontWeight: "bold", marginTop: 2 }}>{s.status}</div>
          </div>
        ))}
      </div>

      {/* Message Houston */}
      <div style={{ border: "1px solid #ff4400", padding: "8px 12px", textAlign: "center", background: "rgba(255,68,0,0.1)" }}>
        <div style={{ color: alarm ? "#ff4400" : "#ff8800", fontSize: "clamp(9px,1.3vw,15px)", fontWeight: "bold" }}>
          {alarm ? "⚠ HOUSTON, ON A UN PROBLÈME ⚠" : "✦ HOUSTON, ON A UN PROBLÈME ✦"}
        </div>
        <div style={{ color: "#cc6644", fontSize: "clamp(7px,0.9vw,10px)", marginTop: 4 }}>
          {["Recalcul de trajectoire...", "Tentative de redémarrage...", "Lecture du manuel...", "Appel à la mère de l&apos;ingénieur...", "Prière collective en cours..."][tick % 5]}
        </div>
      </div>

      {/* Grille de données */}
      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{ width: "clamp(6px,1vw,12px)", height: "clamp(6px,1vw,12px)", background: Math.random() > 0.3 ? "#ff4400" : "#440000", borderRadius: 1 }} />
        ))}
      </div>
    </div>
  );
}

function PrinterRageWallpaper() {
  const [phase, setPhase] = useState(0);
  const [paperY, setPaperY] = useState(-20);
  const [shake, setShake] = useState(false);

  const phases = [
    "Impression en cours...",
    "PAPER JAM",
    "Retrait du papier...",
    "PAPER JAM (encore)",
    "Redémarrage de l'imprimante...",
    "PAPER JAM (toujours)",
    "Achat d'une nouvelle imprimante recommandé",
    "PAPER JAM",
  ];

  const isError = (phases[phase] ?? "").includes("PAPER JAM");

  useEffect(() => {
    const id = setInterval(() => {
      setPhase(p => (p + 1) % phases.length);
      setShake(true);
      setTimeout(() => setShake(false), 200);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setPaperY(y => {
        if (y > 60) return -20;
        return y + 2;
      });
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: '"Courier New", monospace' }}>
      {/* Imprimante */}
      <div style={{ position: "relative", transform: shake && isError ? `translate(${(Math.random()-0.5)*4}px, ${(Math.random()-0.5)*4}px)` : "none", transition: "transform 0.05s" }}>
        {/* Corps */}
        <div style={{ width: "clamp(120px,18vw,200px)", height: "clamp(60px,9vw,100px)", background: "linear-gradient(to bottom, #f0f0f0, #d0d0d0)", border: "3px solid #808080", borderRadius: "8px 8px 4px 4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: "3px 3px 0 rgba(0,0,0,0.3)" }}>
          {/* Fente */}
          <div style={{ width: "70%", height: 6, background: "#444", borderRadius: 2, position: "relative", overflow: "hidden" }}>
            {/* Papier qui sort */}
            <div style={{ position: "absolute", left: "10%", top: -paperY, width: "80%", height: 40, background: "#ffffff", border: "1px solid #cccccc" }}>
              <div style={{ fontSize: 6, color: "#999", padding: 2, lineHeight: 1.2 }}>Lorem ipsum... PAPER JAM</div>
            </div>
          </div>
          {/* Lumière */}
          <div style={{ position: "absolute", top: 8, right: 12, width: 10, height: 10, borderRadius: "50%", background: isError ? "#ff2200" : "#00cc44", boxShadow: `0 0 8px ${isError ? "#ff2200" : "#00cc44"}` }} />
          {/* Bouton */}
          <div style={{ position: "absolute", top: 8, right: 28, width: 16, height: 16, borderRadius: "50%", background: "#c0c0c0", border: "2px solid #808080" }} />
          {/* Panneau display */}
          <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: "60%", height: 14, background: "#1a1a1a", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: isError ? "#ff2200" : "#00cc44", fontSize: 6, fontFamily: '"Courier New", monospace', letterSpacing: 1 }}>
              {isError ? "ERR:PAPER" : "READY"}
            </div>
          </div>
        </div>
        {/* Bac papier */}
        <div style={{ width: "80%", margin: "0 auto", height: "clamp(10px,2vw,20px)", background: "#c0c0c0", borderRadius: "0 0 4px 4px", border: "2px solid #808080", borderTop: "none" }} />
      </div>

      {/* Message d'état */}
      <div style={{ background: isError ? "#ffeeee" : "#eeffee", border: `2px solid ${isError ? "#ff2200" : "#00cc44"}`, padding: "8px 16px", borderRadius: 2, textAlign: "center", maxWidth: "80%", boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
        <div style={{ color: isError ? "#cc0000" : "#006600", fontSize: "clamp(10px,1.4vw,16px)", fontWeight: "bold" }}>{phases[phase]}</div>
        <div style={{ color: "#666", fontSize: "clamp(7px,0.9vw,10px)", marginTop: 4 }}>
          {isError ? "Retirez le papier coincé. (Bonne chance.)" : "Imprimante prête. Pour l'instant."}
        </div>
      </div>

      {/* Compteur de bourrages */}
      <div style={{ color: "#888", fontSize: "clamp(8px,1vw,11px)" }}>
        Bourrages papier aujourd&apos;hui: {phase + 3} | Nerfs perdus: ∞
      </div>
    </div>
  );
}

function StackOverflowWallpaper() {
  const [lineIdx, setLineIdx] = useState(0);
  const [typing, setTyping] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [error, setError] = useState(false);
  const [votes, setVotes] = useState(-3);

  const snippets = [
    "// Trouvé sur StackOverflow (2008)",
    "// Réponse acceptée ✓  (746 votes)",
    "function fixEverything() {",
    "  return null; // TODO",
    "}",
    "",
    "// Commentaire: 'Does not work'",
    "// Réponse: 'works on my machine'",
    "// Commentaire: 'what is machine'",
    "",
    "const solution = require('./node_modules/",
    "  fix-everything-v2-final-FINAL/')",
  ];

  useEffect(() => {
    const currentLine = snippets[lineIdx] ?? "";
    if (charIdx < currentLine.length) {
      const id = setTimeout(() => { setTyping(t => t + (currentLine[charIdx] ?? "")); setCharIdx(c => c + 1); }, 40 + Math.random() * 30);
      return () => clearTimeout(id);
    } else {
      const id = setTimeout(() => {
        setLineIdx(l => {
          const next = (l + 1) % snippets.length;
          if (next === 0) setTyping("");
          return next;
        });
        setTyping(t => t + "\n");
        setCharIdx(0);
      }, 300);
      return () => clearTimeout(id);
    }
  }, [charIdx, lineIdx]);

  useEffect(() => {
    const id = setInterval(() => { setError(e => !e); setVotes(v => v - 1); }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "clamp(8px,2vw,20px)", gap: 10 }}>
      {/* Header SO */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #f48024", paddingBottom: 8 }}>
        <div style={{ color: "#f48024", fontSize: "clamp(14px,2vw,24px)", fontWeight: 900, letterSpacing: -1 }}>stack<span style={{ color: "#bcbbbb" }}>overflow</span></div>
        <div style={{ color: "#666", fontSize: "clamp(8px,1vw,12px)" }}>Questions: 23,847,291</div>
      </div>

      {/* Question */}
      <div style={{ border: "1px solid #3a3a3a", borderRadius: 2, padding: "8px 12px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 32 }}>
            <div style={{ color: "#666", fontSize: 16 }}>▲</div>
            <div style={{ color: votes < 0 ? "#cc0000" : "#f48024", fontSize: "clamp(10px,1.3vw,16px)", fontWeight: "bold" }}>{votes}</div>
            <div style={{ color: "#666", fontSize: 16 }}>▼</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#e8e8e8", fontSize: "clamp(9px,1.2vw,14px)", fontWeight: "bold", marginBottom: 6 }}>
              Pourquoi mon code ne fonctionne pas? [URGENT]
            </div>
            <div style={{ background: "#0d0d0d", border: "1px solid #333", borderRadius: 2, padding: "6px 10px", fontFamily: '"Courier New", monospace', fontSize: "clamp(7px,1vw,11px)", color: "#00ff88", whiteSpace: "pre", maxHeight: "clamp(80px,14vw,160px)", overflow: "hidden" }}>
              {typing}
              <span style={{ background: "#f48024", color: "#000", animation: "blink 1s step-end infinite" }}>_</span>
            </div>
          </div>
        </div>
      </div>

      {/* Réponse */}
      <div style={{ border: `1px solid ${error ? "#cc0000" : "#3a3a3a"}`, borderRadius: 2, padding: "6px 10px" }}>
        <div style={{ color: "#f48024", fontSize: "clamp(8px,1vw,11px)", marginBottom: 4 }}>✓ Réponse acceptée</div>
        <div style={{ color: "#aaa", fontSize: "clamp(7px,0.9vw,10px)" }}>
          {error ? "⚠ This answer is outdated. See comments." : "Essayez: stackoverflow.com/questions/this-question"}
        </div>
        <div style={{ color: "#666", fontSize: "clamp(7px,0.8vw,9px)", marginTop: 4 }}>
          — answered Jun 12 &apos;08 at 3:47 AM &nbsp;|&nbsp; user: CrazyDev99
        </div>
      </div>

      <div style={{ color: "#444", fontSize: "clamp(7px,0.9vw,10px)", textAlign: "center" }}>
        Duplicate of: <span style={{ color: "#f48024" }}>stackoverflow.com/questions/1</span>
      </div>
      <style>{`@keyframes blink{50%{opacity:0}}`}</style>
    </div>
  );
}

function CaptchaHellWallpaper() {
  const [selected, setSelected] = useState<number[]>([]);
  const [attempt, setAttempt] = useState(1);
  const [verified, setVerified] = useState(false);
  const [challenge, setChallenge] = useState(0);

  const challenges = [
    "Sélectionnez tous les feux tricolores",
    "Sélectionnez tous les bus",
    "Sélectionnez tous les passages piétons",
    "Sélectionnez toutes les bicyclettes",
    "Sélectionnez tous les bateaux",
  ];

  const emojis = ["🚦","🚌","🚶","🚲","⛵","🚗","🏠","🌳","🐈","🚦","🚌","🚶","🚲","⛵","🚗","🌳"];

  const handleClick = (i: number) => {
    if (verified) return;
    setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  };

  const handleVerify = () => {
    if (selected.length === 0) return;
    setVerified(false);
    setSelected([]);
    setAttempt(a => a + 1);
    setChallenge(c => (c + 1) % challenges.length);
    if (attempt >= 5) { setVerified(true); setTimeout(() => { setVerified(false); setAttempt(1); }, 2000); }
  };

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#ffffff", border: "1px solid #d3d3d3", borderRadius: 4, padding: "16px 20px", width: "clamp(240px,38vw,380px)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", fontFamily: '"Arial", sans-serif' }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, borderBottom: "1px solid #e0e0e0", paddingBottom: 8 }}>
          <div style={{ width: 24, height: 24, background: "linear-gradient(135deg, #4a90d9, #5ba3e8)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: "bold" }}>✓</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "clamp(9px,1.1vw,13px)", fontWeight: "bold", color: "#333" }}>{challenges[challenge]}</div>
            <div style={{ fontSize: "clamp(7px,0.9vw,10px)", color: "#999" }}>Tentative {attempt} sur ∞</div>
          </div>
        </div>

        {/* Grille */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3, marginBottom: 12 }}>
          {emojis.map((e, i) => (
            <div key={i} onClick={() => handleClick(i)} style={{ aspectRatio: "1", background: selected.includes(i) ? "#e8f0ff" : "#f8f8f8", border: `2px solid ${selected.includes(i) ? "#4a90d9" : "#e0e0e0"}`, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(14px,2vw,24px)", cursor: "pointer", transition: "all 0.15s" }}>
              {e}
            </div>
          ))}
        </div>

        {/* Bouton */}
        <button onClick={handleVerify} style={{ width: "100%", padding: "8px", background: verified ? "#00cc44" : "#4a90d9", color: "#fff", border: "none", borderRadius: 3, fontSize: "clamp(9px,1.1vw,13px)", fontWeight: "bold", cursor: "pointer" }}>
          {verified ? "✓ Vérifié ! (Pour l&apos;instant...)" : "VÉRIFIER"}
        </button>

        {attempt > 2 && !verified && (
          <div style={{ marginTop: 8, color: "#cc0000", fontSize: "clamp(7px,0.9vw,10px)", textAlign: "center" }}>
            ⚠ Comportement suspect détecté. Êtes-vous humain ?
          </div>
        )}

        <div style={{ marginTop: 6, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
          <div style={{ color: "#999", fontSize: "clamp(7px,0.8vw,9px)" }}>reCAPTCHA</div>
          <div style={{ color: "#999", fontSize: 8 }}>🔒</div>
        </div>
      </div>
    </div>
  );
}

function Nokia3310Wallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Snake game state
    const CELL = 12;
    let snake = [{x: 5, y: 5}, {x: 4, y: 5}, {x: 3, y: 5}];
    let food = {x: 10, y: 8};
    let dir = {x: 1, y: 0};
    let score = 0;
    let dead = false;

    const cols = () => Math.floor(canvas.width / CELL);
    const rows = () => Math.floor(canvas.height / CELL);

    const moveFood = () => { food = { x: Math.floor(Math.random() * (cols() - 2)) + 1, y: Math.floor(Math.random() * (rows() - 2)) + 1 }; };

    const step = () => {
      if (dead) { snake = [{x:5,y:5},{x:4,y:5},{x:3,y:5}]; dir={x:1,y:0}; score=0; dead=false; return; }
      if (!snake[0]) return;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x <= 0 || head.x >= cols()-1 || head.y <= 0 || head.y >= rows()-1) { dead = true; return; }
      if (snake.some(s => s.x === head.x && s.y === head.y)) { dead = true; return; }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) { score++; moveFood(); } else { snake.pop(); }
      // Auto-steer away from walls
      const nx = head.x + dir.x; const ny = head.y + dir.y;
      if (nx <= 0 || nx >= cols()-1 || ny <= 0 || ny >= rows()-1) {
        const options = [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}].filter(d => {
          const tx = head.x+d.x; const ty = head.y+d.y;
          return tx>0&&tx<cols()-1&&ty>0&&ty<rows()-1&&!snake.some(s=>s.x===tx&&s.y===ty);
        });
        if (options.length) dir = options[Math.floor(Math.random()*options.length)]!;
      }
    };

    const draw = () => {
      const C = cols(); const R = rows();
      // BG
      ctx.fillStyle = "#9bbc0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Grid dots
      ctx.fillStyle = "#8aab0e";
      for (let x = 0; x < C; x++) for (let y = 0; y < R; y++) ctx.fillRect(x*CELL+5, y*CELL+5, 2, 2);
      // Border
      ctx.strokeStyle = "#0f380f";
      ctx.lineWidth = CELL;
      ctx.strokeRect(CELL/2, CELL/2, canvas.width-CELL, canvas.height-CELL);
      // Food
      ctx.fillStyle = "#0f380f";
      ctx.fillRect(food.x*CELL+1, food.y*CELL+1, CELL-2, CELL-2);
      // Snake
      for (const s of snake) {
        ctx.fillStyle = dead ? "#aa0000" : "#306230";
        ctx.fillRect(s.x*CELL, s.y*CELL, CELL, CELL);
        ctx.fillStyle = dead ? "#cc0000" : "#0f380f";
        ctx.fillRect(s.x*CELL+1, s.y*CELL+1, CELL-2, CELL-2);
      }
      // Score
      ctx.fillStyle = "#0f380f";
      ctx.font = `bold ${CELL}px "Courier New"`;
      ctx.textAlign = "left";
      ctx.fillText(`SCORE:${score}`, CELL*1.5, CELL*1.2);
      if (dead) {
        ctx.fillStyle = "rgba(15,56,15,0.7)";
        ctx.fillRect(0, canvas.height/2-CELL*2, canvas.width, CELL*4);
        ctx.fillStyle = "#9bbc0f";
        ctx.font = `bold ${CELL*1.5}px "Courier New"`;
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2+CELL*0.6);
      }
    };

    let raf: number;
    let lastStep = 0;
    const loop = (ts: number) => {
      if (ts - lastStep > 180) { step(); lastStep = ts; }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      {/* Phone shell */}
      <div style={{ background: "linear-gradient(to bottom, #2a3614, #1a2208)", border: "6px solid #1a2208", borderRadius: 16, padding: "12px 10px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.7)", width: "clamp(160px,26vw,280px)" }}>
        {/* Screen */}
        <div style={{ width: "90%", borderRadius: 4, overflow: "hidden", border: "3px solid #0f380f" }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "clamp(100px,14vw,160px)", display: "block" }} />
        </div>
        {/* Keypad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, width: "80%" }}>
          {["1","2","3","4","5","6","7","8","9","*","0","#"].map(k => (
            <div key={k} style={{ background: "#2e3c16", border: "1px solid #4a5e28", borderRadius: 3, padding: "4px 0", textAlign: "center", color: "#9bbc0f", fontSize: "clamp(8px,1.2vw,14px)", fontFamily: '"Courier New", monospace' }}>{k}</div>
          ))}
        </div>
        <div style={{ color: "#6a8c00", fontSize: "clamp(7px,0.9vw,10px)", fontFamily: '"Courier New", monospace' }}>NOKIA 3310 · batterie ▰▰▰▰▰</div>
      </div>
    </div>
  );
}

function Fax2024Wallpaper() {
  const [tick, setTick] = useState(0);
  const [papers, setPapers] = useState<{id:number;y:number;msg:string}[]>([]);
  const [nextId, setNextId] = useState(0);

  const faxMessages = [
    "URGENT: Reunion annulee",
    "RE: RE: RE: Voir piece jointe",
    "Confirmer reception SVP",
    "Votre numero de fax est faux",
    "Ce fax vous est parvenu par erreur",
    "Merci de renvoyer ce fax en retour",
    "NE PAS REPONDRE A CE FAX",
    "Y2K: Tout va bien. (Non.)",
  ];

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (tick % 25 === 0) {
      const msg = faxMessages[Math.floor(Math.random() * faxMessages.length)] ?? "Fax reçu";
      const newId = nextId;
      setNextId(n => n + 1);
      setPapers(p => [...p.slice(-4), { id: newId, y: -80, msg }]);
    }
    setPapers(p => p.map(pp => ({ ...pp, y: pp.y + 1.5 })).filter(pp => pp.y < 110) as {id:number;y:number;msg:string}[]);
  }, [tick]);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: '"Courier New", monospace' }}>
      {/* Machine fax */}
      <div style={{ position: "relative", width: "clamp(180px,28vw,300px)" }}>
        {/* Corps principal */}
        <div style={{ background: "linear-gradient(to bottom, #f0ece0, #d4ccbc)", border: "3px solid #a09080", borderRadius: "6px 6px 2px 2px", padding: "16px 12px 10px", boxShadow: "4px 4px 0 rgba(0,0,0,0.25)" }}>
          {/* Écran LCD */}
          <div style={{ background: "#c8d890", border: "2px inset #a09080", padding: "4px 8px", marginBottom: 8, fontFamily: '"Courier New", monospace', fontSize: "clamp(7px,0.9vw,11px)", color: "#2a3a10", letterSpacing: 1 }}>
            {["LIGNE OCCUPEE","TRANSMISSION...","ERREUR P.04","EN ATTENTE...","BOURRAGE PAPIER"][tick % 5]}
          </div>
          {/* Fente de sortie */}
          <div style={{ width: "80%", margin: "0 auto", height: 6, background: "#888", borderRadius: 1, position: "relative", overflow: "visible" }}>
            {/* Papiers qui sortent */}
            {papers.map(p => (
              <div key={p.id} style={{ position: "absolute", left: "5%", top: -p.y, width: "90%", background: "#fffef8", border: "1px solid #ddd", padding: "3px 5px", fontSize: "clamp(5px,0.7vw,8px)", color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", zIndex: Math.floor(p.y) }}>
                {p.msg}
              </div>
            ))}
          </div>
          {/* Boutons */}
          <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "center" }}>
            {["ENVOI","COPIE","STOP"].map(b => (
              <div key={b} style={{ background: "#d4ccbc", border: "2px solid #a09080", borderRadius: 2, padding: "2px 6px", fontSize: "clamp(6px,0.8vw,9px)", color: "#2a1a00" }}>{b}</div>
            ))}
          </div>
        </div>
        {/* Bac papier */}
        <div style={{ width: "70%", margin: "0 auto", height: "clamp(12px,2vw,20px)", background: "#e8e0d0", border: "2px solid #a09080", borderTop: "none", borderRadius: "0 0 4px 4px" }} />
      </div>

      <div style={{ color: "#604830", fontSize: "clamp(8px,1vw,12px)", textAlign: "center" }}>
        📠 Fax reçus aujourd&apos;hui: {tick % 99 + 1} | Urgents: {tick % 99 + 1}
      </div>
      <div style={{ color: "#9a8060", fontSize: "clamp(7px,0.85vw,10px)" }}>
        &quot;Avez-vous pensé à envoyer un email ?&quot; — Non.
      </div>
    </div>
  );
}

function WindowsUpdateForcedWallpaper() {
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState(0);
  const [countdown, setCountdown] = useState(30);

  const phases = [
    "Téléchargement des mises à jour",
    "Installation en cours",
    "Configuration des fonctionnalités",
    "Optimisation de votre PC",
    "Préparation de Windows",
    "Redémarrage dans",
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setPercent(p => {
        if (p >= 100) {
          setPhase(ph => Math.min(ph + 1, phases.length - 1));
          return 0;
        }
        return p + (phase < 5 ? 0.4 : 0);
      });
    }, 60);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === phases.length - 1) {
      const id = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
      return () => clearInterval(id);
    }
    return undefined;
  }, [phase]);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 32 }}>
      {/* Logo Windows */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, width: "clamp(40px,6vw,80px)", height: "clamp(40px,6vw,80px)" }}>
        {["#ff4444","#00cc44","#ffcc00","#4488ff"].map(c => (
          <div key={c} style={{ background: c, borderRadius: 2, opacity: 0.9 }} />
        ))}
      </div>

      {/* Message principal */}
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#ffffff", fontSize: "clamp(14px,2.2vw,28px)", fontWeight: 300, letterSpacing: 1 }}>
          {phase < phases.length - 1 ? phases[phase] : `${phases[phase]} ${countdown}s`}
          {phase === phases.length - 1 && countdown === 0 && " → Redémarrage !"}
        </div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(9px,1.2vw,14px)", marginTop: 8 }}>
          {phase < phases.length - 1
            ? "Ne pas éteindre votre ordinateur"
            : countdown > 0
              ? "Enregistrez vos documents maintenant (trop tard en fait)"
              : "⚠ REDÉMARRAGE EN COURS — TOUT EST PERDU"}
        </div>
      </div>

      {/* Barre de progression */}
      {phase < phases.length - 1 && (
        <div style={{ width: "clamp(200px,35vw,400px)" }}>
          <div style={{ background: "rgba(255,255,255,0.15)", height: 4, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${percent}%`, background: "#ffffff", borderRadius: 2, transition: "width 0.06s linear" }} />
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "clamp(8px,1vw,12px)", textAlign: "center", marginTop: 8 }}>{Math.round(percent)}%</div>
        </div>
      )}

      {/* Spinner */}
      {phase < phases.length - 1 && (
        <div style={{ width: "clamp(24px,3vw,40px)", height: "clamp(24px,3vw,40px)", border: "3px solid rgba(255,255,255,0.2)", borderTopColor: "#ffffff", borderRadius: "50%", animation: "wuspin 1s linear infinite" }} />
      )}

      {/* Countdown bar */}
      {phase === phases.length - 1 && countdown > 0 && (
        <div style={{ width: "clamp(200px,35vw,400px)" }}>
          <div style={{ background: "rgba(255,255,255,0.15)", height: 8, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(countdown / 30) * 100}%`, background: countdown < 10 ? "#ff4444" : "#ffffff", borderRadius: 4, transition: "width 1s linear" }} />
          </div>
        </div>
      )}

      <div style={{ position: "absolute", bottom: 24, color: "rgba(255,255,255,0.3)", fontSize: "clamp(7px,0.9vw,11px)" }}>
        Mise à jour 1 sur 847 — © Microsoft Corporation. Votre avis ne compte pas.
      </div>

      <style>{`@keyframes wuspin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
