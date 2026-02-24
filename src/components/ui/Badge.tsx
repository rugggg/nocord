interface BadgeProps {
  count: number;
  className?: string;
}

export function Badge({ count, className = "" }: BadgeProps) {
  if (count === 0) return null;
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
                  rounded-full bg-mario-red text-white text-xs font-bold leading-none ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
