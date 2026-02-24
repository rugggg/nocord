import { ReactNode } from "react";

interface PaperCardProps {
  children: ReactNode;
  className?: string;
}

export function PaperCard({ children, className = "" }: PaperCardProps) {
  return (
    <div className={`paper-card ${className}`}>
      {children}
    </div>
  );
}
