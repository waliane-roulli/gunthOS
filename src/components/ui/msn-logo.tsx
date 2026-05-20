export function MsnLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* ── Bonhomme vert (arrière-plan, décalé en haut-gauche) ── */}
      {/* Tête verte */}
      <circle cx="34" cy="22" r="16" fill="#5dc85d" />
      <circle cx="34" cy="22" r="13" fill="#7edd6e" />
      {/* Reflet tête verte */}
      <ellipse cx="29" cy="16" rx="5" ry="4" fill="rgba(255,255,255,0.35)" transform="rotate(-20 29 16)" />
      {/* Corps vert */}
      <ellipse cx="34" cy="58" rx="22" ry="20" fill="#5dc85d" />
      <ellipse cx="34" cy="56" rx="19" ry="18" fill="#7edd6e" />
      {/* Reflet corps vert */}
      <ellipse cx="26" cy="46" rx="7" ry="5" fill="rgba(255,255,255,0.25)" transform="rotate(-15 26 46)" />

      {/* ── Bonhomme bleu (avant-plan, décalé en bas-droite) ── */}
      {/* Ombre portée */}
      <ellipse cx="67" cy="97" rx="20" ry="5" fill="rgba(0,0,0,0.18)" />
      {/* Tête bleue */}
      <circle cx="65" cy="30" r="19" fill="#29a8e0" />
      <circle cx="65" cy="30" r="16" fill="#4dc8f0" />
      {/* Reflet tête bleue */}
      <ellipse cx="58" cy="21" rx="7" ry="5" fill="rgba(255,255,255,0.45)" transform="rotate(-25 58 21)" />
      {/* Corps bleu */}
      <ellipse cx="65" cy="72" rx="27" ry="25" fill="#29a8e0" />
      <ellipse cx="65" cy="70" rx="23" ry="22" fill="#4dc8f0" />
      {/* Reflet corps bleu */}
      <ellipse cx="54" cy="57" rx="9" ry="6" fill="rgba(255,255,255,0.3)" transform="rotate(-20 54 57)" />
    </svg>
  );
}
