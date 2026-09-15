import { Suspense } from 'react';
import BikeViewer from '../components/three/BikeViewer';
import BikeControls from '../components/three/BikeControls';
import use3DCustomizer from '../store/use3DCustomizer';

export default function ThreeCustomBuilder() {
  const {
    paintColor, pendingColor, setPendingColor,
    finishType, pendingFinish, setPendingFinish,
    stickers, pendingStickers,
    selectedZone, setSelectedZone,
    applyPaint, resetPaint,
    addSticker, removeSticker, undo, redo,
    history, future,
  } = use3DCustomizer();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 p-4 text-zinc-100">
      <header className="flex w-full max-w-6xl items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">3D Custom Builder</h1>
        <span className="text-sm text-zinc-400">
          {pendingColor} · {pendingFinish}
        </span>
      </header>

      <div className="flex w-full max-w-6xl flex-col gap-4 md:flex-row">
        <div className="h-[450px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 [&>div]:h-full">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-zinc-500">Loading 3D…</div>}>
            <BikeViewer color={paintColor} finish={finishType} stickers={stickers} />
          </Suspense>
        </div>
        <BikeControls
          pendingColor={pendingColor} setPendingColor={setPendingColor}
          pendingFinish={pendingFinish} setPendingFinish={setPendingFinish}
          selectedZone={selectedZone} setSelectedZone={setSelectedZone}
          applyPaint={applyPaint} resetPaint={resetPaint}
          stickers={stickers} addSticker={addSticker}
          canUndo={history.length > 0} canRedo={future.length > 0}
          undo={undo} redo={redo}
        />
      </div>

      <p className="max-w-xl text-center text-xs text-zinc-500">
        Drag to rotate · Scroll to zoom. Pick a color and finish, tap Apply, then select a sticker zone and add stickers.
      </p>
    </div>
  );
}
