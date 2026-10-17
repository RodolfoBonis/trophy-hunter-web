import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "psn";
type Size = "sm" | "md" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/**
 * Botão do style tile (`.btn` em hud.css): superfície chanfrada `.s` + glow `.gl` no hover/foco,
 * display em caixa alta. `size="icon"` = quadrado compacto (ações de ícone).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn("btn", `btn-${variant}`, size !== "md" && "sm", size === "icon" && "btn-icon", className)}
      {...props}
    >
      <span className="s" aria-hidden />
      <span className="gl" aria-hidden />
      {children}
    </button>
  ),
);
Button.displayName = "Button";

/** Classes do botão do tile para links (`<Link className={buttonClasses("secondary")}>` + spans). */
export function buttonClasses(variant: Variant = "primary", size: Size = "md"): string {
  return cn("btn", `btn-${variant}`, size !== "md" && "sm", size === "icon" && "btn-icon");
}
