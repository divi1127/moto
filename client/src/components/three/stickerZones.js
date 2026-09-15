import { stickerById } from '../customizer/partPresets';

export const STICKER_ZONES = {
  tank: { label: 'Fuel Tank', position: [0, 0.62, 0.42], rotation: [-0.18, 0, 0], scale: 0.62 },
  sidePanelL: { label: 'Left Panel', position: [-0.32, 0.95, -0.02], rotation: [0, -Math.PI / 2, 0], scale: 0.4 },
  sidePanelR: { label: 'Right Panel', position: [0.32, 0.95, -0.02], rotation: [0, Math.PI / 2, 0], scale: 0.4 },
  frontMudguard: { label: 'Front Mudguard', position: [0, 0.62, 0.9], rotation: [-0.1, 0, 0], scale: 0.5 },
  rearMudguard: { label: 'Rear Mudguard', position: [0, 0.62, -1.0], rotation: [0.1, 0, 0], scale: 0.5 },
  tail: { label: 'Tail Panel', position: [0, 1.05, -1.05], rotation: [0.05, 0, 0], scale: 0.45 },
};

export const STICKER_ZONE_LIST = Object.values(STICKER_ZONESلاف);

export const PAINTABLE_ZONES = [
  'tank', 'sidePanelL', 'sidePanelR', 'frontMudguard', 'rearMudguard', 'tail', 'rimFront', 'rimRear',
];

export const ZONE_LABELS = {
  tank: 'Fuel Tank', sidePanelL: 'Left Panel', sidePanelR: 'Right Panel',
  frontMudguard: 'Front Mudguard', rearMudguard: 'Rear Mudguard', tail: 'Tail Panel',
};

export const FINISH_PRESETS = [
  { key: 'Gloss', name: 'Gloss', roughness: 0.12, metalness: 0.2, clearcoat: 1.0 },
  { key: 'Matte', name: 'Matte', roughness: 0.85, metalness: 0.0, clearcoat: 0.0 },
  { key: 'Metallic', name: 'Metallic', roughness: 0.2, metalness: 0.9, clearcoat: 0.5, premium: 700 },
];

export function stickerPrice(sticker) {
  const def = stickerById(sticker.key);
  return def?.price || 500;
}
