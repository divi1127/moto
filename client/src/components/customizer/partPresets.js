export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 620;

export const PLATFORM_FEE = 2000;

export const CUSTOM_PARTS = [
  { id: 'tank', name: 'Fuel Tank', icon: 'Fuel', price: 1500, hint: 'Draw the outline of the tank' },
  { id: 'front-mudguard', name: 'Front Mudguard', icon: 'Shield', price: 600, hint: 'Trace above the front wheel' },
  { id: 'rear-body', name: 'Rear Body Panel', icon: 'Box', price: 900, hint: 'Tail section / rear cowl' },
  { id: 'side-panel', name: 'Side Panels', icon: 'Square', price: 800, hint: 'Left & right body panels' },
  { id: 'visor', name: 'Visor / Fairing', icon: 'Wind', price: 700, hint: 'Front fairing or visor' },
  { id: 'rim-front', name: 'Front Rim', icon: 'Circle', price: 500, hint: 'Trace the front wheel rim' },
  { id: 'rim-rear', name: 'Rear Rim', icon: 'Circle', price: 500, hint: 'Trace the rear wheel rim' },
  { id: 'seat', name: 'Seat', icon: 'Armchair', price: 1200, hint: 'The seat / seat cowl' },
  { id: 'exhaust', name: 'Exhaust', icon: 'Flame', price: 899, hint: 'Exhaust / muffler body' },
];

export const partById = id => CUSTOM_PARTS.find(p => p.id === id);

export const FINISH_TYPES = ['Gloss', 'Matte', 'Satin', 'Metallic', 'Pearl', 'Chrome', 'Chameleon'];
export const FINISH_PREMIUMS = { Gloss: 0, Matte: 0, Satin: 0, Metallic: 700, Pearl: 1000, Chrome: 1800, Chameleon: 2500 };

export const DEFAULT_PART_COLOR = '#fbbf24';
export const PART_TINT_OPACITY = 0.45;

export const STICKER_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'racing', name: 'Racing' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'geometric', name: 'Geometric' },
  { id: 'flames', name: 'Flames' },
  { id: 'tribal', name: 'Tribal' },
  { id: 'typography', name: 'Typography' },
  { id: 'premium', name: 'Premium' },
];

export const STICKER_DEFS = [
  { key: 'stripe', name: 'Racing Stripe', category: 'racing', kind: 'rect', width: 170, height: 16, rx: 2, price: 500, color: '#ffffff' },
  { key: 'wedge', name: 'Speed Wedge', category: 'racing', kind: 'path', d: 'M6 2 L34 2 L10 34 L6 34 Z', viewBox: '0 0 40 36', scale: 5, price: 500, color: '#ffffff' },
  { key: 'chevron', name: 'Chevron', category: 'racing', kind: 'path', d: 'M6 2 L34 2 L14 30 L6 30 Z', viewBox: '0 0 40 32', scale: 5, price: 500, color: '#ffffff' },
  { key: 'dot', name: 'Minimal Dot', category: 'minimal', kind: 'rect', width: 90, height: 90, rx: 45, price: 500, color: '#ffffff' },
  { key: 'hexagon', name: 'Hexagon', category: 'geometric', kind: 'path', d: 'M24 0 L40 14 L40 40 L24 54 L8 40 L8 14 Z', viewBox: '0 0 48 54', scale: 4, price: 500, color: '#ffffff' },
  { key: 'lightning', name: 'Lightning Bolts', category: 'geometric', kind: 'path', d: 'M14 2 L34 22 L22 22 L30 40 L10 20 L22 20 Z', viewBox: '0 0 44 42', scale: 4, price: 500, color: '#ffffff' },
  { key: 'star', name: 'Star', category: 'premium', kind: 'path', d: 'M24 2 L30 17 L45 17 L34 26 L38 42 L24 32 L10 42 L14 26 L3 17 L18 17 Z', viewBox: '0 0 48 44', scale: 4, price: 1000, color: '#ffffff', premium: true },
  { key: 'flames', name: 'Flames', category: 'flames', kind: 'path', d: 'M12 2 C20 10 24 14 24 22 C24 29 18 32 18 32 C18 32 17 26 13 26 C17 22 16 12 12 2 Z', viewBox: '0 0 26 34', scale: 7, price: 1000, color: '#f59e0b', premium: true },
  { key: 'tribal', name: 'Tribal Swoosh', category: 'tribal', kind: 'path', d: 'M2 30 C 12 8 26 4 40 8 C 33 16 25 22 18 30 C 10 36 6 35 2 30 Z', viewBox: '0 0 42 38', scale: 5, price: 750, color: '#ffffff' },
  { key: 'dragon', name: 'Dragon Wing', category: 'tribal', kind: 'path', d: 'M4 42 C 18 26 34 18 52 16 C 44 26 34 34 26 42 C 16 52 8 50 4 42 Z', viewBox: '0 0 56 54', scale: 4, price: 1000, color: '#ffffff', premium: true },
  { key: 'number', name: 'Race Number', category: 'number', kind: 'text', text: '7', price: 1000, color: '#ffffff', premium: true },
  { key: 'type', name: 'Typography', category: 'typography', kind: 'text', text: 'RIDE HARD', price: 750, color: '#ffffff' },
];

export const stickerById = key => STICKER_DEFS.find(s => s.key === key);

export function getStickerPrice(key) {
  return stickerById(key)?.price || 500;
}

export function getDesignEstimate(parts, stickers, finishType) {
  const lines = [];
  let subtotal = 0;

  if (parts.length > 0 || stickers.length > 0) {
    lines.push({ label: 'Customization studio fee', amount: PLATFORM_FEE });
    subtotal += PLATFORM_FEE;
  }

  const partTypes = new Set(parts.map(p => p.partType));
  partTypes.forEach(type => {
    const part = partById(type);
    if (part) {
      lines.push({ label: `${part.name} colour`, amount: part.price });
      subtotal += part.price;
    }
  });

  const premium = FINISH_PREMIUMS[finishType] || 0;
  if (premium > 0 && partTypes.size > 0) {
    lines.push({ label: `${finishType} finish premium`, amount: premium });
    subtotal += premium;
  }

  stickers.forEach(s => {
    const def = stickerById(s.key);
    if (def) {
      lines.push({ label: `${def.name}${def.premium ? ' · Premium' : ''} sticker`, amount: def.price });
      subtotal += def.price;
    }
  });

  const tax = Math.round(subtotal * 0.18);
  return { subtotal, tax, total: subtotal + tax, lines };
}

export function toServiceLines(parts, stickers, finishType) {
  const services = [];
  if (parts.length > 0) services.push('Custom Paint');
  const partTypes = [...new Set(parts.map(p => p.partType))]
    .map(t => partById(t)?.name)
    .filter(Boolean);
  services.push(...partTypes.map(n => `${n} Colour`));
  stickers.forEach(s => {
    const def = stickerById(s.key);
    services.push(def ? `${def.name}${def.premium ? ' (Premium)' : ''} Sticker` : 'Custom Sticker');
  });
  if (FINISH_PREMIUMS[finishType] > 0 && parts.length > 0) services.push(`${finishType} Finish`);
  return services;
}

export const DEMO_BIKE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="620" viewBox="0 0 1000 620">
  <rect width="1000" height="620" fill="#14161a"/>
  <ellipse cx="500" cy="560" rx="420" ry="30" fill="#000" opacity="0.35"/>
  <circle cx="250" cy="430" r="105" fill="#1a1d24" stroke="#0b0d10" stroke-width="18"/>
  <circle cx="250" cy="430" r="105" fill="none" stroke="#2a2f3a" stroke-width="4"/>
  <circle cx="770" cy="430" r="105" fill="#1a1d24" stroke="#0b0d10" stroke-width="18"/>
  <circle cx="770" cy="430" r="105" fill="none" stroke="#2a2f3a" stroke-width="4"/>
  <circle cx="250" cy="430" r="14" fill="#f59e0b"/>
  <circle cx="770" cy="430" r="14" fill="#f59e0b"/>
  <path d="M250 430 L370 300 Q385 285 405 285 L430 298" stroke="#0d0f12" stroke-width="14" stroke-linecap="round" fill="none"/>
  <path d="M770 430 L700 300 Q688 285 665 285 L642 298" stroke="#0d0f12" stroke-width="14" stroke-linecap="round" fill="none"/>
  <path d="M340 300 L600 250 Q640 242 680 250 L770 298" stroke="#0d0f12" stroke-width="18" stroke-linecap="round" fill="none"/>
  <path d="M410 285 Q470 245 540 252 Q640 262 700 292 L696 310 L588 292 Q500 278 452 300 Z" fill="#f59e0b" stroke="#0d0f12" stroke-width="3"/>
  <path d="M300 296 Q285 300 278 312 L272 328" stroke="#0d0f12" stroke-width="12" stroke-linecap="round" fill="none"/>
  <path d="M470 300 Q540 300 570 308 Q586 312 590 322 L592 336" stroke="#2a2f3a" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M700 300 L720 280 Q728 272 736 274 L752 288 L748 300 L724 296 Q712 294 700 300 Z" fill="#0d0f12"/>
  <rect x="742" y="238" width="44" height="34" rx="8" fill="#0d0f12"/>
  <ellipse cx="764" cy="256" rx="26" ry="14" fill="#f59e0b"/>
  <path d="M600 462 L755 452 Q770 448 774 436 L776 410 Q778 392 768 380" stroke="#0d0f12" stroke-width="12" stroke-linecap="round" fill="none"/>
  <rect x="560" y="452" width="90" height="26" rx="13" fill="#2a2f3a" stroke="#23262e" stroke-width="2"/>
  <path d="M250 430 L180 470 Q150 482 118 470 L108 468" stroke="#0b0d10" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M760 330 Q815 315 852 300 Q866 296 876 302" stroke="#0d0f12" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M500 210 L500 264 Q500 284 518 290" stroke="#0d0f12" stroke-width="12" stroke-linecap="round" fill="none"/>
  <text x="500" y="186" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" font-weight="800" letter-spacing="6" fill="#0f1115">MOTO</text>
  <path d="M520 285 Q540 402 560 448" stroke="#0d0f12" stroke-width="6" stroke-linecap="round" fill="none"/>
</svg>`;

export const DEMO_BIKE_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(DEMO_BIKE_SVG)}`;