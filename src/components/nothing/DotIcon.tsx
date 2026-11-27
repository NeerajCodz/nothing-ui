import { getDotIconPoints, type DotIconName } from '@/lib/dot-icons';
import { cn } from '@/lib/utils';

export interface DotIconProps {
  name: DotIconName;
  size?: number;
  className?: string;
  label?: string;
}

export function DotIcon({ name, size = 20, className, label }: DotIconProps) {
  const points = getDotIconPoints(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 9 9"
      fill="currentColor"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      className={cn('inline-block shrink-0', className)}
    >
      {points.map((pt, idx) => (
        <circle key={idx} cx={pt.x + 0.5} cy={pt.y + 0.5} r={0.39} />
      ))}
    </svg>
  );
}
