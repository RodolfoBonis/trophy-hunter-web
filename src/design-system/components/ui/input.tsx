import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Campo do style tile (`.input` em hud.css). Sem ícone, o padding esquerdo do tile (reservado ao
 * ícone) é reduzido via `.input.no-icon`. Use `icon` para um símbolo do Sprite à esquerda.
 */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { icon?: string; wrapperClassName?: string }>(
  ({ className, icon, wrapperClassName, ...props }, ref) => (
    <span className={cn("input block", !icon && "no-icon", wrapperClassName)}>
      {icon && (
        <svg aria-hidden>
          <use href={`#${icon}`} />
        </svg>
      )}
      <input ref={ref} className={className} {...props} />
    </span>
  ),
);
Input.displayName = "Input";
