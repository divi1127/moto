import { useRef } from 'react';
import { cn } from '../../utils/helpers';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './partPresets';
import {
  Upload, Sparkles, Undo2, Eraser, Trash2, FlipHorizontal2, Copy,
  Check, X, MousePointerClick, Layers, ImagePlus,
} from 'lucide-react';

function ToolButton({ icon: Icon, onClick, title, disabled, dangerous }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        dangerous
          ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
          : 'bg-surface-lighter border-border text-dark-300 hover:text-white hover:border-primary-500/30'
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

export default function BikeWorkspace({ core }) {
  const fileRef = useRef(null);

  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => core.setPhoto(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-border bg-dark-950"
      style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
    >
      <div ref={core.mountRef} className="bike-canvas-scroll w-full h-full rounded-none" />

      {!core.hasPhoto && (
        <div className="absolute inset-0 bg-dark-950/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
              <ImagePlus className="w-9 h-9 text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Start with a photo of your bike</h3>
            <p className="text-sm text-dark-400 mt-2 leading-relaxed">
              Upload a clear <span className="text-dark-200 font-medium">side or 3/4 view</span> — you'll mark
              each part you want recolored and decorate it with stickers right on the photo.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-black font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-primary-500/20"
              >
                <Upload className="w-4 h-4" /> Upload photo
              </button>
              <button
                type="button"
                onClick={core.useDemo}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-lighter hover:bg-dark-700 border border-border text-white font-semibold text-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-primary-400" /> Try demo bike
              </button>
            </div>
            <p className="text-[11px] text-dark-600 mt-4">JPG, PNG or WebP. The photo stays on your device & is saved only when you book.</p>
          </div>
        </div>
      )}

      {core.hasPhoto && (
        <>
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <ToolButton icon={Undo2} title="Undo last mask / sticker" disabled={core.parts.length + core.stickers.length === 0} onClick={core.undoLast} />
            <ToolButton icon={Eraser} title="Clear all masks & stickers" disabled={core.parts.length + core.stickers.length === 0} onClick={core.clearAll} />
            {core.selected?.kind === 'sticker' && (
              <>
                <span className="w-px h-6 bg-border" />
                <ToolButton icon={FlipHorizontal2} title="Flip horizontally" onClick={core.flipSelected} />
                <ToolButton icon={Copy} title="Duplicate sticker" onClick={core.duplicateSelected} />
              </>
            )}
            {core.selected && (
              <ToolButton icon={Trash2} title="Delete selected" dangerous onClick={core.removeSelected} />
            )}
          </div>

          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur border border-white/10 text-[11px] font-medium text-dark-300">
            <Layers className="w-3.5 h-3.5 text-primary-400" />
            {core.parts.length} part{core.parts.length === 1 ? '' : 's'} · {core.stickers.length} sticker{core.stickers.length === 1 ? '' : 's'}
          </div>

          {core.drawing ? (
            <div className="absolute inset-x-0 bottom-3 flex justify-center px-4">
              <div className="inline-flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface-lighter/95 backdrop-blur border border-primary-500/40 shadow-xl">
                <div className="flex items-center gap-2 text-sm text-white">
                  <MousePointerClick className="w-4 h-4 text-primary-400" />
                  <span>
                    Click around the part ({core.drawing.points.length} point{core.drawing.points.length === 1 ? '' : 's'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={core.cancelDraw}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-dark-700 border border-border text-xs font-medium text-dark-300 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    type="button"
                    disabled={core.drawing.points.length < 3}
                    onClick={core.completeDraw}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Complete shape
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur border border-white/10 text-[11px] text-dark-400">
              {core.selected
                ? core.selected.kind === 'part'
                  ? 'Selected part — pick a colour below'
                  : 'Selected sticker — pick a colour below'
                : 'Select a part to colour it, or add stickers from the panel'}
            </div>
          )}
        </>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}