"use client";

import { useState } from "react";

const FIREFLY_COUNT = 14;

export function ForestBackground() {
  const [fireflies] = useState(() =>
    Array.from({ length: FIREFLY_COUNT }, (_, i) => ({
      id: i,
      left:  `${8 + Math.random() * 84}%`,
      top:   `${15 + Math.random() * 65}%`,
      fx:    `${(Math.random() - 0.5) * 40}px`,
      fy:    `${-10 - Math.random() * 30}px`,
      dur:   `${3.5 + Math.random() * 5}s`,
      delay: `${-Math.random() * 8}s`,
    })),
  );

  return (
    <>
      {/* Ciel + arbres silhouettés via CSS */}
      <div className="pg-forest-bg" style={{ zIndex: 0 }} />

      {/* Brume basse */}
      <div className="pg-forest-mist" style={{ zIndex: 1 }}>
        <div className="pg-forest-mist-layer" />
        <div className="pg-forest-mist-layer" />
        <div className="pg-forest-mist-layer" />
      </div>

      {/* Lucioles */}
      <div className="pg-fireflies" style={{ zIndex: 2 }}>
        {fireflies.map(f => (
          <div
            key={f.id}
            className="pg-firefly"
            style={{
              left: f.left,
              top: f.top,
              "--fx": f.fx,
              "--fy": f.fy,
              "--fd": f.dur,
              "--fdel": f.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
}
