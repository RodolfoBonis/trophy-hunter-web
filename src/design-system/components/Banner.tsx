import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "warning" | "danger" | "info";

/**
 * Banner do style tile (`.banner` em hud.css): listras diagonais, ícone, título em display e ação
 * opcional. `tone` troca a cor (o tile define o âmbar; danger/info são extensões em hud.css).
 */
export function Banner({
  tone = "warning",
  title,
  children,
  action,
  className,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("banner", tone !== "warning" && tone, className)}>
      <span className="ic" aria-hidden>
        <svg>
          <use href="#i-warn" />
        </svg>
      </span>
      <div className="min-w-0">
        <strong>{title}</strong>
        {children && <span>{children}</span>}
      </div>
      {action ?? <span />}
    </div>
  );
}
