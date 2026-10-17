import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xs border border-border bg-bg-1 px-3.5 font-mono text-sm text-text-1",
        "placeholder:text-text-3 focus-visible:border-neon-cyan focus-visible:outline-none",
        "focus-visible:shadow-[0_0_0_3px_rgb(61_245_255/0.18)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
