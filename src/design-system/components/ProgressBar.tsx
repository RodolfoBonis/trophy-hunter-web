import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Barra de progresso do style tile (`.pbar` em hud.css): chanfrada, gradiente violeta→ciano com
 * segmentos; `platinum` usa o gradiente iridescente. Anima de 0 até o valor (transform scaleX via
 * --p, transição --dur-count; reduced-motion zera a duração). `value` 0–100.
 */
export function ProgressBar({ value, platinum = false, className }: { value: number; platinum?: boolean; className?: string }) {
  const target = Math.max(0, Math.min(100, value)) / 100;
  const [p, setP] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setP(target));
    return () => cancelAnimationFrame(id);
  }, [target]);
  return (
    <div
      className={cn("pbar", platinum && "plat", className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="fill" style={{ ["--p" as string]: p }} />
    </div>
  );
}
