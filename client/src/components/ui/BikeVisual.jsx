import { cn } from '../../utils/helpers';

const PALETTES = {
  default: { tank: '#f59e0b', dark: '#1f232d', accent: '#ef4444', body: '#2a2f3a' },
  orange: { tank: '#ea580c', dark: '#1f232d', accent: '#fbbf24', body: '#2a2f3a' },
  blue: { tank: '#2563eb', dark: '#1f232d', accent: '#38bdf8', body: '#2a2f3a' },
  red: { tank: '#dc2626', dark: '#1f232d', accent: '#fb7185', body: '#2a2f3a' },
  green: { tank: '#166534', dark: '#1f232d', accent: '#4ade80', body: '#2a2f3a' },
  grey: { tank: '#64748b', dark: '#1f232d', accent: '#cbd5e1', body: '#2a2f3a' },
  black: { tank: '#3f3f46', dark: '#16181d', accent: '#f59e0b', body: '#23262e' },
  custom: { tank: '#7c3aed', dark: '#1f232d', accent: '#a78bfa', body: '#2a2f3a' },
};

const BRAND_PALETTE = {
  'royal enfield': 'orange',
  yamaha: 'blue',
  ktm: 'orange',
  tvs: 'red',
  honda: 'red',
  bajaj: 'blue',
  suzuki: 'dark',
};

export default function BikeVisual({
  color = '',
  brand = '',
  variant = 'naked',
  className,
  showRider = true,
}) {
  const base = brand && BRAND_PALETTE[brand.toLowerCase()] ? BRAND_PALETTE[brand.toLowerCase()] : 'default';
  const p = PALETTES[base] || PALETTES.default;
  const resolvedTank = color && !['Black', 'White', 'Grey', 'Silver', 'Matte Black'].includes(color) ? p.tank : (color === 'Black' || color === 'Matte Black' ? '#3f3f46' : p.tank);

  return (
    <div className={cn('w-full h-full flex items-center justify-center', className)}>
      <svg viewBox="0 0 480 280" className="w-full max-w-full h-auto" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="bgcyl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="tankGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={resolvedTank} />
            <stop offset="1" stopColor={p.dark} />
          </linearGradient>
          <radialGradient id="wheelGrad" cx="0.4" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#3a3f4b" />
            <stop offset="1" stopColor="#14161a" />
          </radialGradient>
        </defs>

        <ellipse cx="240" cy="236" rx="210" ry="18" fill="#000" opacity="0.35" />

        <circle cx="120" cy="190" r="62" fill="url(#wheelGrad)" stroke="#0b0d10" strokeWidth="10" />
        <circle cx="120" cy="190" r="40" fill="none" stroke="#23262e" strokeWidth="4" />
        <circle cx="120" cy="190" r="8" fill={p.accent} />
        {[0, 72, 144, 216, 288].map(a => (
          <line key={a} x1={120 + 34 * Math.cos(a * Math.PI / 180)} y1={190 + 34 * Math.sin(a * Math.PI / 180)} x2={120 + 47 * Math.cos(a * Math.PI / 180)} y2={190 + 47 * Math.sin(a * Math.PI / 180)} stroke="#3a3f4b" strokeWidth="3" />
        ))}

        <circle cx="368" cy="190" r="62" fill="url(#wheelGrad)" stroke="#0b0d10" strokeWidth="10" />
        <circle cx="368" cy="190" r="40" fill="none" stroke="#23262e" strokeWidth="4" />
        <circle cx="368" cy="190" r="8" fill={p.accent} />
        {[0, 72, 144, 216, 288].map(a => (
          <line key={a} x1={368 + 34 * Math.cos(a * Math.PI / 180)} y1={190 + 34 * Math.sin(a * Math.PI / 180)} x2={368 + 47 * Math.cos(a * Math.PI / 180)} y2={190 + 47 * Math.sin(a * Math.PI / 180)} stroke="#3a3f4b" strokeWidth="3" />
        ))}

        <path d="M120 190 L175 128 Q185 118 195 118 L210 126" stroke="#0d0f12" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M368 190 L330 130 Q322 120 310 120 L300 128" stroke="#0d0f12" strokeWidth="7" strokeLinecap="round" fill="none" />

        <path d="M150 128 Q140 190 120 190" stroke="#0d0f12" strokeWidth="6" strokeLinecap="round" fill="none" />

        <path d="M170 120 L300 92 Q320 88 335 92 L360 118 L350 130 L320 118 Q300 112 285 116 L255 124 Q245 128 240 136 Q235 148 230 158 L225 176 Q222 190 225 205 L230 214 Q300 224 368 190" stroke="#0d0f12" strokeWidth="9" strokeLinecap="round" fill="none" />

        <path d="M200 132 Q245 110 300 100 Q315 98 330 100 Q345 104 356 118 L358 128 L340 118 Q320 110 295 112 Q250 118 215 140 Z" fill="url(#tankGrad)" />
        <path d="M200 132 Q245 110 300 100 Q315 98 330 100 Q345 104 356 118" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" fill="none" />
        <path d="M240 122 Q260 112 285 108" stroke={p.accent} strokeWidth="3" strokeLinecap="round" fill="none" />

        <path d="M356 120 Q372 96 390 86 Q400 82 408 86" stroke="#0d0f12" strokeWidth="8" strokeLinecap="round" fill="none" />
        <rect x="396" y="76" width="22" height="16" rx="4" fill="#0d0f12" />
        <ellipse cx="407" cy="84" rx="13" ry="7" fill={p.accent} />

        <path d="M228 142 Q246 168 244 190" stroke="#0d0f12" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M250 160 L300 170 Q315 172 318 180 L320 190" stroke="#23262e" strokeWidth="4" strokeLinecap="round" fill="none" />

        <path d="M170 156 Q150 160 142 172 L138 180" stroke="#0d0f12" strokeWidth="5" strokeLinecap="round" fill="none" />

        <path d="M300 190 L356 186 Q364 184 366 178 L368 166 Q370 156 366 148 L362 142" stroke="#0d0f12" strokeWidth="6" strokeLinecap="round" fill="none" />

        <path d="M258 170 L312 170 Q322 170 322 178 L322 200 Q322 208 312 208 L258 208 Q250 208 250 200 L250 180 Q250 170 258 170 Z" fill={p.body} stroke={p.accent} strokeWidth="2" opacity="0.9" />
        <text x="285" y="196" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif" letterSpacing="1">MOTO</text>

        <path d="M240 214 Q300 222 340 214 Q350 212 355 204" stroke="#0d0f12" strokeWidth="8" strokeLinecap="round" fill="none" />
        <ellipse cx="292" cy="220" rx="62" ry="12" fill="#181b20" stroke="#23262e" strokeWidth="2" />
        <rect x="262" y="204" width="60" height="20" rx="9" fill={p.accent} opacity="0.9" />

        {showRider && (
          <g>
            <path d="M276 178 Q270 160 276 152 Q280 146 288 144" stroke="#0d0f12" strokeWidth="5" strokeLinecap="round" fill="none" />
            <ellipse cx="300" cy="130" rx="16" ry="15" fill={p.accent} />
            <rect x="284" y="142" width="32" height="26" rx="10" fill="#0d0f12" transform="rotate(-8 300 155)" />
          </g>
        )}

        <path d="M112 190 Q60 186 52 172 Q46 160 56 152" stroke="#0b0d10" strokeWidth="5" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}