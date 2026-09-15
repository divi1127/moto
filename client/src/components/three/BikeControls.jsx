import { STICKER_ZONES } from './stickerZones';

export default function BikeControls({
  pendingColor, setPendingColor,
  pendingFinish, setPendingFinish,
  selectedZone, setSelectedZone,
  applyPaint, resetPaint,
  stickers, addSticker,
  canUndo, canRedo, undo, redo,
}) {
  return (
    <div className="center-street flex w-64 flex-none flex-col gap-3 rounded-xl border border-white/10 bg-emerald-950/60 p-3 text-zinc-100 backdrop-blur">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Paint</h3>
        <input
          type="color"
          value={pendingColor}
          onChange={(e) => setPendingColor(e.target.value)}
          className="mt-2 h-10 w-full cursor-pointer rounded-md border border-white/10 bg-transparent"
          aria-label="Paint color"
        />
        <div className="mt-2 grid grid-cols-1 gap-1">
          <span className="text-[11px] uppercase tracking-wide text-zinc-400">Finish: {pendingFinish}</span>
          <select
            value={pendingFinish}
            onChange={(e) => setPendingFinish(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs"
          >
            <option>Gloss</option>
            <option>Matte</option>
            <option>Metallic</option>
            <option>Pearl</option>
          </select>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={applyPaint}
            className="flex-1 rounded-md bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Apply Paint
          </button>
          <button
            onClick={resetPaint}
            className="rounded-md bg-white/10 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/20"
          >
            Reset
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Sticker Zone</h3>
        <div className="mt-2 grid grid-cols-1 gap-1">
          {Object.keys(STICKER_ZONES).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedZone(selectedZone === key ? null : key)}
              className={`rounded-md px-2 py-1.5 text-left text-xs font-medium ${
                selectedZone === key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-zinc-200 hover:bg-white/10'
              }`}
            >
              {STICKER_ZONES[key].label}
            </button>
          ))}
        </div>
        <button
          onClick={() => addSticker({ zone: selectedZone || 'tank', label: 'Sticker', price: 500 })}
          disabled={!selectedZone}
          className="mt-2 w-full rounded-md bg-white/10 py-2 text-xs font-medium text-zinc-200 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add Sticker to {selectedZone ? STICKER_ZONES[selectedZone].label : 'zone'}
        </button>
        {stickers.length > 0 && (
          <p className="mt-2 text-[11px] text-emerald-300">
            {stickers.length} sticker{stickers.length === 1 ? '' : 's'} added
          </p>
        )}
      </div>

      <div className="flex gap-2 border-t border-white/10 pt-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex-1 rounded-md bg-white/5 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10 disabled:opacity-40"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex-1 rounded-md bg-white/5 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10 disabled:opacity-40"
        >
          Redo
        </button>
      </div>
    </div>
  );
}
