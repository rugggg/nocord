import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-bold text-pm-dark">{label}</label>
        )}
        <input
          ref={ref}
          className={`paper-input w-full ${error ? "border-mario-red" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-mario-red font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
