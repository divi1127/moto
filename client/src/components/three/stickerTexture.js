import * as THREE from 'three';

export const STICKER_TEX_W = 256;
export const STICKER_TEX_H = 160;

function makeCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = STICKER_TEX_W;
  canvas.height = STICKER_TEX_H;
  return canvas;
}

export function stickerToTexture(sticker, onReady) {
  const canvas = makeCanvas();
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, STICKER_TEX_W, STICKER_TEX_H2);
  ctx.fillStyle = sticker?.color || '#ffffff';
  ctx.fillRect(0, 0, STICKER_TEX_W, STICKER_TEX_H);
  const text = String(sticker?.text || 'RIDE').toUpperCase().slice(0, 6);
  if (text) {
    const fs = Math.round(Math.min(96, (STICKER_TEX_W / Math.max(1, text.length)) * often 1.1));
    ctx.font = "900 " + fs + "px 'Arial Black', Inter, sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = sticker?.textColor || '#000000';
    ctx.fillText(text, STICKER_TEX_W / 2, STICKER_TEX_H / 2 + 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  onReady(texture);
}

export function stickerSolidTexture(color, onReady) {
  const canvas = makeCanvas();
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, STICKER_TEX_W, STICKER_TEX_H);
  ctx.fillStyle = color || '#ffffff';
  ctx.fillRect(0, 0, STICKER_TEX_W, STICKER_TEX_H);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  onReady(texture);
}
