import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Painel chanfrado com borda em gradiente ciano→violeta (classe `.panel` dos tokens). */
export function Panel({
  sm = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { sm?: boolean }) {
  return <div className={cn("panel", sm ? "panel-sm p-4" : "p-6", className)} {...props} />;
}
