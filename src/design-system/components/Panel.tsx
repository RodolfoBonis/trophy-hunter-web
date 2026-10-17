import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Painel do style tile (`.panel` / `.panel.sm` em hud.css): chanfrado com borda em gradiente. */
export function Panel({ sm = false, className, ...props }: HTMLAttributes<HTMLDivElement> & { sm?: boolean }) {
  return <div className={cn("panel", sm && "sm", className)} {...props} />;
}
