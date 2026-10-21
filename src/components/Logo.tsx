/** Logo FlowPulse : le F dessiné comme un plan de lignes de bus (arrêts cuivre, émeraude, blanc). */
export function LogoSymbol({ inverse = false }: { inverse?: boolean }) {
  const bg = inverse ? "#FFFFFF" : "#1B1F2A";
  const fg = inverse ? "#1B1F2A" : "#FFFFFF";
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill={bg} />
      <path d="M22 50V16H42M22 32H36" fill="none" stroke={fg} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="45" cy="16" r="5" fill="#C2703D" stroke={bg} strokeWidth="2.5" />
      <circle cx="39" cy="32" r="5" fill="#13A06F" stroke={bg} strokeWidth="2.5" />
      <circle cx="22" cy="50" r="5" fill={fg} stroke={bg} strokeWidth="2.5" />
    </svg>
  );
}

export default function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <div className={onDark ? "logo on-dark" : "logo"}>
      <LogoSymbol inverse={onDark} />
      <b>
        Flow<span>Pulse</span>
      </b>
    </div>
  );
}
