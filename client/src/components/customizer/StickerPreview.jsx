import { cn } from '../../utils/helpers';

export default function StickerPreview({ def, className }) {
  const color = def.color || '#ffffff';

  if (def.kind === 'text') {
    return (
      <div className={cn('flex items-center justify-center w-full h-full font-black leading-none', className)} style={{ color, fontSize: def.premium ? 30 : 18, fontStyle: def.key === 'number' ? 'italic' : 'normal' }}>
        {def.text}
      </div>
    );
  }

  if (def.kind === 'rect') {
    return (
      <svg viewBox={`0 0 ${def.width} ${def.height}`} className={cn('w-full h-full', className)} preserveAspectRatio="xMidYMid meet">
        <rect x="0" y="0" width={def.width} height={def.height} rx={def.rx} fill={color} />
      </svg>
    );
  }

  return (
    <svg viewBox={def.viewBox} className={cn('w-full h-full', className)} preserveAspectRatio="xMidYMid meet">
      <path d={def.d} fill={color} />
    </svg>
  );
}