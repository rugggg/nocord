interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className = "" }: SpinnerProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`border-3 border-paper-border border-t-mario-red rounded-full animate-spin ${className}`}
    />
  );
}
