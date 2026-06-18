import { cn } from '@/lib/utils';

type BadgeColor = 'zinc' | 'orange' | 'green' | 'blue' | 'red' | 'purple';

const COLOR_MAP: Record<BadgeColor, string> = {
  zinc: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
  orange: 'bg-orange-100 text-orange-700 ring-orange-200',
  green: 'bg-green-100 text-green-700 ring-green-200',
  blue: 'bg-blue-100 text-blue-700 ring-blue-200',
  red: 'bg-red-100 text-red-700 ring-red-200',
  purple: 'bg-purple-100 text-purple-700 ring-purple-200',
};

export function Badge({
  children,
  color = 'zinc',
  className,
}: {
  children: React.ReactNode;
  color?: BadgeColor | string;
  className?: string;
}) {
  const colorClass = COLOR_MAP[(color as BadgeColor) in COLOR_MAP ? (color as BadgeColor) : 'zinc'];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        colorClass,
        className,
      )}
    >
      {children}
    </span>
  );
}
