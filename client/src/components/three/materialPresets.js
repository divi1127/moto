export const FINISH_PRESETS = {
  Gloss: {
    name: 'Gloss',
    roughness: 0.12,
    metalness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.3,
    description: 'High-gloss factory shine with deep reflection',
    price: 0,
  },
  Matte: {
    name: 'Matte',
    roughness: 0.85,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.9,
    envMapIntensity: 0.4,
    description: 'Non-reflective satin-flat look',
    price: 0,
  },
  Metallic: {
    name: 'Metallic',
    roughness: 0.2,
    metalness: 0.9,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.5,
    description: 'Metallic-flake paint with shimmer',
    price: 700,
  },
  Pearl: {
    name: 'Pearl',
    roughness: 0.15,
    metalness: 0.3,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15,
    iridescence: 0.45,
    iridescenceIOR: 1.3,
    envMapIntensity: 1.4,
    description: 'Pearlescent iridescent finish',
    price: 1000,
  },
};

export const FINISH_LIST = Object.values(FINISH_PRESETS);

export const PAINTABLE_ZONES = [
  'tank',
  'sidePanelL',
  'sidePanelR',
  'frontMudguard',
  'rearMudguard',
];

export const ZONE_LABELS = {
  tank: 'Fuel Tank',
  sidePanelL: 'Left Panel',
  sidePanelR: 'Right Panel',
  frontMudguard: 'Front Mudguard',
  rearMudguard: 'Rear Mudguard',
};

export const DEFAULT_COLOR = '#cc0000';
export const DEFAULT_FINISH = 'Gloss';