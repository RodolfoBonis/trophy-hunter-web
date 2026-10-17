import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Placeholder com shimmer do style tile (`.skel` em hud.css). */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skel chamfer-sm", className)} aria-hidden {...props} />;
}
