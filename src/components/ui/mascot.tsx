interface MascotProps {
  sprite: string;
  size?: number;
  className?: string;
}

/**
 * Renders a mascot SVG sprite. The sprite ID comes from the pipeline
 * manifest's entity.mascotSprite field. Returns null if no sprite is set.
 */
export function Mascot({ sprite, size = 48, className }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      aria-label={`TINY ${sprite}`}
    >
      <use href={`/mascots/sprites.svg#${sprite}`} />
    </svg>
  );
}
