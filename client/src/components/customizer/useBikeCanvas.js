import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, Polygon, Path, Rect, IText, Image } from 'fabric';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, DEFAULT_PART_COLOR, PART_TINT_OPACITY,
  DEMO_BIKE_DATA_URI, stickerById, partById,
} from './partPresets';

let uidCounter = 0;
const nextUid = () => `ob-${Date.now()}-${uidCounter++}`;

const lockSticker = obj => {
  obj.set({
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    lockSkewingX: true,
    lockSkewingY: true,
    lockScalingFlip: true,
    hasControls: false,
    hasBorders: true,
  });
};

export default function useBikeCanvas() {
  const mountNodeRef = useRef(null);
  const fcRef = useRef(null);
  const photoRef = useRef(null);
  const orderRef = useRef([]);
  const byIdRef = useRef(new Map());
  const drawingRef = useRef(null);
  const previewRef = useRef(null);

  const [photoUrl, setPhotoUrl] = useState(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [drawing, setDrawing] = useState(null);
  const [parts, setParts] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);

  const mountRef = useCallback(node => {
    mountNodeRef.current = node;
    setReady(!!node);
  }, []);

  const syncLists = useCallback(() => {
    const newParts = [];
    const newStickers = [];
    for (const id of orderRef.current) {
      const o = byIdRef.current.get(id);
      if (!o) continue;
      if (o.customType === 'part') newParts.push({ id, partType: o.partType, color: o.fill, opacity: o.opacity });
      else if (o.customType === 'sticker') newStickers.push({ id, key: o.stickerKey, color: o.fill, opacity: o.opacity });
    }
    setParts(newParts);
    setStickers(newStickers);
  }, []);

  useEffect(() => {
    const mount = mountNodeRef.current;
    if (!ready || !mount) return;

    const el = document.createElement('canvas');
    mount.appendChild(el);

    const fc = new Canvas(el, {
      selection: false,
      preserveObjectStacking: true,
      backgroundColor: '#0f1115',
    });
    fc.setDimensions({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    fc.defaultCursor = 'default';
    fc.selectionColor = 'rgba(245, 158, 11, 0.12)';
    fc.selectionBorderColor = '#fbbf24';
    fcRef.current = fc;

    const snapshotSelected = obj => {
      if (!obj || !obj.customType) {
        setSelected(null);
        return;
      }
      setSelected({
        id: obj.uid,
        kind: obj.customType,
        type: obj.customType === 'part' ? obj.partType : obj.stickerKey,
        color: obj.fill,
        opacity: obj.opacity,
      });
    };

    const onSelectionChanged = e => snapshotSelected(e?.selected?.[0] ?? fc.getActiveObject());

    fc.on('selection:created', onSelectionChanged);
    fc.on('selection:updated', onSelectionChanged);
    fc.on('selection:cleared', () => setSelected(null));
    fc.on('object:added', () => syncLists());
    fc.on('object:removed', e => {
      if (e?.target) {
        orderRef.current = orderRef.current.filter(id => id !== e.target.uid);
        byIdRef.current.delete(e.target.uid);
      }
      syncLists();
    });

    fc.on('mouse:down', e => {
      const d = drawingRef.current;
      if (!d?.active) return;
      const fc = fcRef.current;
      const p = e.scenePoint || e.pointer;
      if (!p) return;
      d.points = [...d.points, { x: p.x, y: p.y }];
      if (previewRef.current) {
        try { fc.remove(previewRef.current); } catch { /* noop */ }
      }
      const dmin = {
        x: Math.min(...d.points.map(p => p.x)),
        y: Math.min(...d.points.map(p => p.y)),
      };
      const preview = new Polygon(d.points.map(pt => ({ x: pt.x, y: pt.y })), {
        left: dmin.x, top: dmin.y,
        fill: 'transparent',
        stroke: '#fbbf24',
        strokeWidth: 2,
        strokeDashArray: [6, 6],
        selectable: false,
        evented: false,
        objectCaching: false,
      });
      fc.add(preview);
      previewRef.current = preview;
      setDrawing({ partType: d.partType, points: d.points });
    });

    const onKey = ev => {
      const fc = fcRef.current;
      if (!fc) return;
      if (ev.key === 'Escape' && drawingRef.current?.active) {
        cleanupDrawRef();
      } else if ((ev.key === 'Delete' || ev.key === 'Backspace') && !drawingRef.current?.active) {
        const o = fc.getActiveObject();
        if (o?.customType && o.type !== 'i-text') {
          ev.preventDefault();
          fc.remove(o);
          fc.discardActiveObject();
          fc.requestRenderAll();
        }
      }
    };

    const cleanupDrawRef = () => {
      const c = fcRef.current;
      if (previewRef.current && c) {
        try { c.remove(previewRef.current); } catch { /* noop */ }
      }
      previewRef.current = null;
      drawingRef.current = null;
      setDrawing(null);
      if (c) {
        c.selection = true;
        c.skipTargetFind = false;
        c.defaultCursor = 'default';
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      fc.dispose();
      fcRef.current = null;
      photoRef.current = null;
      previewRef.current = null;
      drawingRef.current = null;
      orderRef.current = [];
      byIdRef.current.clear();
      if (el && el.parentNode) el.parentNode.removeChild(el);
    };
  }, [ready, syncLists]);

  const register = useCallback(obj => {
    obj.uid = obj.uid || nextUid();
    if (!byIdRef.current.has(obj.uid)) {
      byIdRef.current.set(obj.uid, obj);
      orderRef.current.push(obj.uid);
    }
  }, []);

  const startDraw = useCallback((partType) => {
    const fc = fcRef.current;
    if (!fc) return;
    drawingRef.current = { active: true, partType, points: [] };
    fc.selection = false;
    fc.skipTargetFind = true;
    fc.defaultCursor = 'crosshair';
    fc.discardActiveObject();
    fc.requestRenderAll();
    setDrawing({ partType, points: [] });
  }, []);

  const cleanupDraw = useCallback(() => {
    const c = fcRef.current;
    if (previewRef.current && c) {
      try { c.remove(previewRef.current); } catch { /* noop */ }
    }
    previewRef.current = null;
    drawingRef.current = null;
    setDrawing(null);
    if (c) {
      c.selection = true;
      c.skipTargetFind = false;
      c.defaultCursor = 'default';
    }
  }, []);

  const completeDraw = useCallback(() => {
    const fc = fcRef.current;
    const d = drawingRef.current;
    if (!fc || !d?.active) return false;
    if (d.points.length < 3) return false;
    if (!partById(d.partType)) return false;

    const pmin = {
      x: Math.min(...d.points.map(p => p.x)),
      y: Math.min(...d.points.map(p => p.y)),
    };
    const poly = new Polygon(d.points.map(pt => ({ x: pt.x, y: pt.y })), {
      left: pmin.x, top: pmin.y,
      fill: DEFAULT_PART_COLOR,
      opacity: PART_TINT_OPACITY,
      stroke: '#ffffff',
      strokeWidth: 1.5,
      strokeUniform: true,
      selectable: true,
      evented: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      lockSkewingX: true,
      lockSkewingY: true,
      lockScalingFlip: true,
      hasControls: false,
      hasBorders: true,
      objectCaching: false,
      borderColor: '#fbbf24',
      customType: 'part',
      partType: d.partType,
    });

    register(poly);
    fc.add(poly);
    cleanupDraw();
    fc.setActiveObject(poly);
    fc.requestRenderAll();
    return true;
  }, [register, cleanupDraw]);

  const cancelDraw = useCallback(() => {
    cleanupDraw();
  }, [cleanupDraw]);

  const addSticker = useCallback((key) => {
    const fc = fcRef.current;
    const def = stickerById(key);
    if (!fc || !def) return;

    let obj;
    const opts = {
      left: CANVAS_WIDTH / 2 - 60,
      top: CANVAS_HEIGHT / 2 - 40,
    };
    if (def.kind === 'rect') {
      obj = new Rect({ width: def.width, height: def.height, rx: def.rx || 0, ...opts });
    } else if (def.kind === 'text') {
      obj = new IText(def.text, { fontSize: 64, fontFamily: 'Inter, sans-serif', fontWeight: 900, charSpacing: 90, ...opts });
    } else {
      const sc = def.scale || 1;
      obj = new Path(def.d, { scaleX: sc, scaleY: sc, ...opts });
    }

    obj.set({
      fill: def.color || '#ffffff',
      opacity: 1,
      selectable: true,
      evented: true,
      borderColor: '#fbbf24',
      cornerColor: '#fbbf24',
      cornerStrokeColor: '#fbbf24',
      transparentCorners: false,
      cornerStyle: 'circle',
      customType: 'sticker',
      stickerKey: key,
    });
    register(obj);
    fc.add(obj);
    fc.renderAll();
    const act = fc.getActiveObject();
    let partObj = null;
    if (act?.customType === 'part') partObj = act;
    if (!partObj) {
      for (let i = orderRef.current.length - 1; i >= 0; i--) {
        const o = byIdRef.current.get(orderRef.current[i]);
        if (o?.customType === 'part') { partObj = o; break; }
      }
    }
    if (partObj) {
      partObj.setCoords();
      const pb = partObj.getBoundingRect();
      const cx = pb.left + pb.width / 2;
      const cy = pb.top + pb.height / 2;
      obj.setCoords();
      const ob = obj.getBoundingRect();
      obj.set({
        left: obj.left + (cx - (ob.left + ob.width / 2)),
        top: obj.top + (cy - (ob.top + ob.height / 2)),
      });
      obj.setCoords();
    }
    lockSticker(obj);
    fc.setActiveObject(obj);
    fc.requestRenderAll();
  }, [register]);

  const applyColor = useCallback((hex) => {
    const fc = fcRef.current;
    const o = fc?.getActiveObject();
    if (!o?.customType) return;
    o.set('fill', hex);
    o.setCoords();
    fc.requestRenderAll();
    syncLists();
    setSelected(s => (s ? { ...s, color: hex } : s));
  }, [syncLists]);

  const applyOpacity = useCallback((value) => {
    const fc = fcRef.current;
    const o = fc?.getActiveObject();
    if (!o?.customType) return;
    o.set('opacity', value);
    fc.requestRenderAll();
    syncLists();
    setSelected(s => (s ? { ...s, opacity: value } : s));
  }, [syncLists]);

  const setSelectedPartType = useCallback((partType) => {
    const fc = fcRef.current;
    const o = fc?.getActiveObject();
    if (!o || o.customType !== 'part') return;
    o.set('partType', partType);
    fc.requestRenderAll();
    syncLists();
    setSelected(s => (s ? { ...s, type: partType } : s));
  }, [syncLists]);

  const removeSelected = useCallback(() => {
    const fc = fcRef.current;
    const o = fc?.getActiveObject();
    if (!o?.customType) return;
    fc.remove(o);
    fc.discardActiveObject();
    fc.requestRenderAll();
  }, []);

  const flipSelected = useCallback(() => {
    const fc = fcRef.current;
    const o = fc?.getActiveObject();
    if (!o?.customType) return;
    o.set('flipX', !o.flipX);
    o.setCoords();
    fc.requestRenderAll();
  }, []);

  const duplicateSelected = useCallback(() => {
    const fc = fcRef.current;
    const o = fc?.getActiveObject();
    if (!o || o.customType !== 'sticker') return;
    const def = stickerById(o.stickerKey);
    if (!def) return;

    let copy;
    const pos = { left: (o.left ?? 0) + 26, top: (o.top ?? 0) + 26 };
    if (def.kind === 'rect') {
      copy = new Rect({ width: def.width, height: def.height, rx: def.rx || 0, ...pos });
    } else if (def.kind === 'text') {
      copy = new IText(o.text || def.text, { fontSize: 64, fontFamily: 'Inter, sans-serif', fontWeight: 900, charSpacing: 90, ...pos });
    } else {
      copy = new Path(def.d, pos);
    }
    copy.set({
      fill: o.fill,
      opacity: o.opacity,
      scaleX: o.scaleX || 1,
      scaleY: o.scaleY || 1,
      angle: o.angle || 0,
      flipX: !!o.flipX,
      flipY: !!o.flipY,
      selectable: true,
      evented: true,
      borderColor: '#fbbf24',
      cornerColor: '#fbbf24',
      cornerStrokeColor: '#fbbf24',
      transparentCorners: false,
      customType: 'sticker',
      stickerKey: o.stickerKey,
    });
    lockSticker(copy);
    copy.setCoords();
    register(copy);
    fc.add(copy);
    fc.setActiveObject(copy);
    fc.requestRenderAll();
  }, [register]);

  const undoLast = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    const id = orderRef.current[orderRef.current.length - 1];
    if (!id) return;
    const o = byIdRef.current.get(id);
    if (o) {
      fc.remove(o);
      fc.discardActiveObject();
    }
    fc.requestRenderAll();
  }, []);

  const clearAll = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    [...orderRef.current].forEach(id => {
      const o = byIdRef.current.get(id);
      if (o) fc.remove(o);
    });
    fc.discardActiveObject();
    fc.requestRenderAll();
  }, []);

  const selectById = useCallback((id) => {
    const fc = fcRef.current;
    const o = byIdRef.current.get(id);
    if (!o) return;
    fc.discardActiveObject();
    fc.setActiveObject(o);
    fc.requestRenderAll();
    setSelected({
      id: o.uid,
      kind: o.customType,
      type: o.customType === 'part' ? o.partType : o.stickerKey,
      color: o.fill,
      opacity: o.opacity,
    });
  }, []);

  const setPhoto = useCallback(async (url) => {
    const fc = fcRef.current;
    if (!fc || !url) return;
    clearAll();
    try {
      const img = await Image.fromURL(url, undefined, { selectable: false, evented: false });
      const original = img.getOriginalSize();
      const iw = img.width || original.width || 0;
      const ih = img.height || original.height || 0;
      if (!iw || !ih) throw new Error('Invalid image');
      const scale = Math.max(CANVAS_WIDTH / iw, CANVAS_HEIGHT / ih);
      img.set({
        left: (CANVAS_WIDTH - iw * scale) / 2,
        top: (CANVAS_HEIGHT - ih * scale) / 2,
        scaleX: scale,
        scaleY: scale,
      });
      if (photoRef.current) {
        try { fc.remove(photoRef.current); } catch { /* noop */ }
      }
      photoRef.current = img;
      fc.add(img);
      fc.sendObjectToBack(img);
      fc.requestRenderAll();
      setPhotoUrl(url);
      setHasPhoto(true);
    } catch (err) {
      console.error('Customizer: failed to load photo', err);
      setHasPhoto(false);
      setPhotoUrl(null);
    }
  }, [clearAll]);

  const useDemo = useCallback(() => {
    setPhoto(DEMO_BIKE_DATA_URI);
  }, [setPhoto]);

  const clearPhoto = useCallback(() => {
    const fc = fcRef.current;
    if (!fc) return;
    if (photoRef.current) {
      try { fc.remove(photoRef.current); } catch { /* noop */ }
    }
    photoRef.current = null;
    clearAll();
    fc.discardActiveObject();
    fc.requestRenderAll();
    setPhotoUrl(null);
    setHasPhoto(false);
  }, [clearAll]);

  const capture = useCallback((withOverlays = true) => {
    const fc = fcRef.current;
    if (!fc) return null;
    fc.discardActiveObject();
    fc.requestRenderAll();
    const hidden = [];
    if (!withOverlays) {
      fc.getObjects().forEach(o => {
        if (o.customType) {
          hidden.push(o);
          o.visible = false;
        }
      });
    }
    const url = fc.toDataURL({ format: 'png', multiplier: 1 });
    if (!withOverlays) {
      hidden.forEach(o => { o.visible = true; });
      fc.requestRenderAll();
    }
    return url;
  }, []);

  return {
    mountRef,
    photoUrl,
    hasPhoto,
    drawing,
    parts,
    stickers,
    selected,
    setPhoto,
    useDemo,
    clearPhoto,
    startDraw,
    completeDraw,
    cancelDraw,
    addSticker,
    applyColor,
    applyOpacity,
    setSelectedPartType,
    removeSelected,
    flipSelected,
    duplicateSelected,
    undoLast,
    clearAll,
    selectById,
    capture,
  };
}