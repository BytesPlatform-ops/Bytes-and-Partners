"use client";

const STROKE = "rgba(255,255,255,0.22)";

export default function ServiceVisual({ id }: { id: number }) {
  const common = "h-full w-full";
  switch (id) {
    case 1: // AI Agents & Automation — orbiting nodes
      return (
        <svg viewBox="0 0 120 80" className={common} aria-hidden>
          <circle cx="60" cy="40" r="9" fill="url(#sv1)" opacity="0.9" />
          <ellipse cx="60" cy="40" rx="34" ry="14" stroke={STROKE} fill="none" />
          <ellipse cx="60" cy="40" rx="34" ry="14" stroke={STROKE} fill="none" transform="rotate(60 60 40)" />
          <ellipse cx="60" cy="40" rx="34" ry="14" stroke={STROKE} fill="none" transform="rotate(-60 60 40)" />
          <circle cx="94" cy="40" r="2.6" fill="#58e6ff">
            <animate attributeName="cx" values="94;60;26;60;94" dur="7s" repeatCount="indefinite" />
            <animate attributeName="cy" values="40;54;40;26;40" dur="7s" repeatCount="indefinite" />
          </circle>
          <circle cx="43" cy="28" r="2.2" fill="#9b7bff">
            <animate attributeName="cy" values="28;52;28" dur="5.5s" repeatCount="indefinite" />
          </circle>
          <defs>
            <radialGradient id="sv1">
              <stop offset="0%" stopColor="#8fc4ff" />
              <stop offset="100%" stopColor="#2f6bff" stopOpacity="0.25" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 2: // Web applications — layered panels
      return (
        <svg viewBox="0 0 120 80" className={common} aria-hidden>
          <rect x="22" y="14" width="76" height="46" rx="5" stroke={STROKE} fill="rgba(255,255,255,0.03)" />
          <rect x="16" y="22" width="76" height="46" rx="5" stroke="rgba(120,175,255,0.4)" fill="rgba(77,141,255,0.06)" />
          <path d="M16 33h76" stroke={STROKE} />
          <circle cx="23" cy="27.5" r="1.4" fill="rgba(255,255,255,0.4)" />
          <circle cx="28" cy="27.5" r="1.4" fill="rgba(255,255,255,0.22)" />
          <rect x="23" y="40" width="26" height="4" rx="2" fill="rgba(255,255,255,0.22)" />
          <rect x="23" y="48" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.12)" />
          <rect x="23" y="55" width="32" height="3" rx="1.5" fill="rgba(255,255,255,0.12)" />
          <rect x="70" y="40" width="18" height="18" rx="4" fill="rgba(88,230,255,0.16)" stroke="rgba(88,230,255,0.4)" />
        </svg>
      );
    case 3: // Mobile — devices
      return (
        <svg viewBox="0 0 120 80" className={common} aria-hidden>
          <rect x="38" y="8" width="26" height="52" rx="5" stroke={STROKE} fill="rgba(255,255,255,0.03)" transform="rotate(-8 51 34)" />
          <rect x="56" y="14" width="28" height="56" rx="6" stroke="rgba(155,123,255,0.45)" fill="rgba(155,123,255,0.07)" />
          <rect x="63" y="17" width="14" height="2" rx="1" fill="rgba(255,255,255,0.25)" />
          <rect x="61" y="26" width="18" height="12" rx="3" fill="rgba(255,255,255,0.13)" />
          <rect x="61" y="42" width="18" height="2.5" rx="1.2" fill="rgba(255,255,255,0.18)" />
          <rect x="61" y="48" width="12" height="2.5" rx="1.2" fill="rgba(255,255,255,0.12)" />
          <circle cx="70" cy="62" r="3" fill="rgba(88,230,255,0.5)" />
        </svg>
      );
    case 4: // CRM — pipeline
      return (
        <svg viewBox="0 0 120 80" className={common} aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={14 + i * 24} y={16} width="19" height="48" rx="4" stroke={STROKE} fill="rgba(255,255,255,0.025)" />
              <rect
                x={16 + i * 24}
                y={20 + i * 5}
                width="15"
                height={Math.max(8, 16 - i * 2)}
                rx="2.5"
                fill={["rgba(88,230,255,0.4)", "rgba(77,141,255,0.36)", "rgba(155,123,255,0.32)", "rgba(255,255,255,0.14)"][i]}
              />
              <rect x={16 + i * 24} y={40 + i * 5} width="15" height="6" rx="2" fill="rgba(255,255,255,0.1)" />
            </g>
          ))}
        </svg>
      );
    case 5: // AI consulting — waveform
      return (
        <svg viewBox="0 0 120 80" className={common} aria-hidden>
          <path
            d="M8 40c9 0 9-22 18-22s9 44 18 44 9-36 18-36 9 28 18 28 9-16 18-16"
            stroke="url(#sv5)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M8 58h104" stroke={STROKE} strokeDasharray="3 5" />
          <circle cx="62" cy="26" r="3" fill="#58e6ff" />
          <circle cx="62" cy="26" r="7" stroke="rgba(88,230,255,0.35)" fill="none" />
          <defs>
            <linearGradient id="sv5" x1="0" x2="1">
              <stop offset="0%" stopColor="#58e6ff" />
              <stop offset="50%" stopColor="#4d8dff" />
              <stop offset="100%" stopColor="#9b7bff" />
            </linearGradient>
          </defs>
        </svg>
      );
    default: // Custom software — modular blocks
      return (
        <svg viewBox="0 0 120 80" className={common} aria-hidden>
          <rect x="18" y="14" width="30" height="24" rx="5" stroke={STROKE} fill="rgba(255,255,255,0.03)" />
          <rect x="54" y="14" width="30" height="24" rx="5" stroke="rgba(120,175,255,0.42)" fill="rgba(77,141,255,0.07)" />
          <rect x="36" y="44" width="30" height="24" rx="5" stroke={STROKE} fill="rgba(255,255,255,0.03)" />
          <rect x="72" y="44" width="30" height="24" rx="5" stroke="rgba(155,123,255,0.42)" fill="rgba(155,123,255,0.06)" />
          <path d="M48 26h6M69 38v6M51 56h21" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 3" />
        </svg>
      );
  }
}
