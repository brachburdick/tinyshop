export type MascotRole =
  | "architect"
  | "designer"
  | "developer"
  | "kickstart"
  | "orchestrator"
  | "researcher"
  | "qa-tester"
  | "validator";

interface MascotProps {
  role: MascotRole;
  size?: number;
  className?: string;
}

export function Mascot({ role, size = 48, className }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      aria-label={`TINY ${role}`}
    >
      <use href={`/mascots/sprites.svg#${role}`} />
    </svg>
  );
}
