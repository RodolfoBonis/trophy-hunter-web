import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "psn";

/**
 * Botão do style tile (`.btn` em hud.css): superfície chanfrada (`.s`) + glow (`.gl`) que acende no
 * hover/foco, tipografia display em caixa alta. `icon` = id de símbolo do Sprite (ex.: "i-sync").
 */
export const HudButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "md" | "sm"; icon?: string; children?: ReactNode }
>(function HudButton({ variant = "primary", size = "md", icon, className, children, type = "button", ...rest }, ref) {
  return (
    <button ref={ref} type={type} className={cn("btn", `btn-${variant}`, size === "sm" && "sm", className)} {...rest}>
      <span className="s" aria-hidden />
      <span className="gl" aria-hidden />
      {icon && (
        <svg aria-hidden>
          <use href={`#${icon}`} />
        </svg>
      )}
      {children}
    </button>
  );
});
