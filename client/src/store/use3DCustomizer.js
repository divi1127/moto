import { create } from 'zustand';

const INITIAL_STATE = {
  bikeModel: 'classic-350',
  paintColor: '#cc0000',
  pendingColor: '#cc0000',
  finishType: 'Gloss',
  pendingFinish: 'Gloss',
  stickers: [],
  pendingStickers: [],
  accessories: [],
  selectedZone: null,
  history: [],
  future: [],
  designName: '',
  savedDesigns: [],
};

const use3DCustomizer = create((set, get) => ({
  ...INITIAL_STATE,

  setPendingColor: (color) => set({ pendingColor: color }),
  setPendingFinish: (finish) => set({ pendingFinish: finish }),

  applyPaint: () => {
    const { pendingColor, pendingFinish } = get();
    const prev = { paintColor: get().paintColor, finishType: get().finishType };
    set(state => ({
      paintColor: pendingColor,
      finishType: pendingFinish,
      history: [...state.history, { type: 'paint', prev }],
      future: [],
    }));
  },

  resetPaint: () => {
    set(state => ({
      pendingColor: state.paintColor,
      pendingFinish: state.finishType,
    }));
  },

  addSticker: (sticker) => {
    const newSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...sticker,
      zone: sticker.zone || 'tank',
    };
    set(state => ({
      stickers: [...state.stickers, newSticker],
      history: [...state.history, { type: 'addSticker', prev: { sticker: newSticker } }],
      future: [],
    }));
    return newSticker;
  },

  removeSticker: (stickerId) => {
    set(state => {
      const removed = state.stickers.find(s => s.id === stickerId);
      return {
        stickers: state.stickers.filter(s => s.id !== stickerId),
        history: [...state.history, { type: 'removeSticker', prev: { sticker: removed } }],
        future: [],
      };
    });
  },

  updateSticker: (stickerId, data) => {
    set(state => ({
      stickers: state.stickers.map(s => s.id === stickerId ? { ...s, ...data } : s),
    }));
  },

  toggleAccessory: (accessoryId) => {
    set(state => {
      const has = state.accessories.includes(accessoryId);
      return {
        accessories: has
          ? state.accessories.filter(a => a !== accessoryId)
          : [...state.accessories, accessoryId],
        history: [...state.history, { type: 'accessory', prev: { accessories: [...state.accessories] } }],
        future: [],
      };
    });
  },

  setSelectedZone: (zone) => set({ selectedZone: zone }),

  undo: () => {
    const { history } = get();
    if (history.length === 0) return;
    const last = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    if (last.type === 'paint') {
      set(state => ({
        paintColor: last.prev.paintColor,
        finishType: last.prev.finishType,
        pendingColor: last.prev.paintColor,
        pendingFinish: last.prev.finishType,
        history: newHistory,
        future: [...state.future, { type: 'paint', current: { paintColor: state.paintColor, finishType: state.finishType } }],
      }));
    } else if (last.type === 'addSticker') {
      set(state => ({
        stickers: state.stickers.filter(s => s.id !== last.prev.sticker.id),
        history: newHistory,
        future: [...state.future, last],
      }));
    } else if (last.type === 'removeSticker') {
      set(state => ({
        stickers: [...state.stickers, last.prev.sticker],
        history: newHistory,
        future: [...state.future, last],
      }));
    } else if (last.type === 'accessory') {
      set(state => ({
        accessories: last.prev.accessories,
        history: newHistory,
        future: [...state.future, last],
      }));
    }
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return;
    const next = future[future.length - 1];
    const newFuture = future.slice(0, -1);

    if (next.type === 'paint') {
      set(state => ({
        paintColor: next.current.paintColor,
        finishType: next.current.finishType,
        pendingColor: next.current.paintColor,
        pendingFinish: next.current.finishType,
        history: [...state.history, { type: 'paint', prev: { paintColor: next.current.paintColor, finishType: next.current.finishType } }],
        future: newFuture,
      }));
    } else if (next.type === 'addSticker') {
      set(state => ({
        stickers: [...state.stickers, next.prev.sticker],
        history: [...state.history, next],
        future: newFuture,
      }));
    } else if (next.type === 'removeSticker') {
      set(state => ({
        stickers: state.stickers.filter(s => s.id !== next.prev.sticker.id),
        history: [...state.history, next],
        future: newFuture,
      }));
    } else if (next.type === 'accessory') {
      set(state => ({
        accessories: next.prev.accessories,
        history: [...state.history, next],
        future: newFuture,
      }));
    }
  },

  saveDesign: (name) => {
    const { bikeModel, paintColor, finishType, stickers, accessories } = get();
    const design = {
      id: `des-${Date.now()}`,
      name: name || `Design ${get().savedDesigns.length + 1}`,
      bikeModel,
      paintColor,
      finishType,
      stickers: [...stickers],
      accessories: [...accessories],
      savedAt: new Date().toISOString(),
    };
    set(state => ({ savedDesigns: [...state.savedDesigns, design] }));
    return design;
  },

  loadDesign: (designId) => {
    const design = get().savedDesigns.find(d => d.id === designId);
    if (!design) return;
    set({
      paintColor: design.paintColor,
      pendingColor: design.paintColor,
      finishType: design.finishType,
      pendingFinish: design.finishType,
      stickers: [...design.stickers],
      accessories: [...design.accessories],
      history: [],
      future: [],
    });
  },

  deleteDesign: (designId) => {
    set(state => ({ savedDesigns: state.savedDesigns.filter(d => d.id !== designId) }));
  },

  setDesignName: (name) => set({ designName: name }),

  clearAll: () => set({
    paintColor: '#cc0000',
    pendingColor: '#cc0000',
    finishType: 'Gloss',
    pendingFinish: 'Gloss',
    stickers: [],
    accessories: [],
    selectedZone: null,
    history: [],
    future: [],
  }),

  canUndo: () => get().history.length > 0,
  canRedo: () => get().future.length > 0,
}));

export default use3DCustomizer;
