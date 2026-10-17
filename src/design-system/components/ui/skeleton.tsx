import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Placeholder com shimmer HUD (ver tokens: .skeleton-shimmer). */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton-shimmer chamfer-sm", className)} {...props} />;
}
