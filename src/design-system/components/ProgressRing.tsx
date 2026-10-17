import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const R = 52;
const CIRC = 2 * Math.PI * R;
const DUR = 900; // mesma duração do count-up do style tile

/**
 * Anel de progresso do style tile (`.hring` em hud.css): arco e número contam juntos de 0 até o
 * valor (ease-out cúbico, 900ms). Reduced-motion: valor final na hora. `platinum` usa o gradiente
 * iridescente (#g-plat do Sprite).
 */
export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 10,
  color,
  platinum = false,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Cor do arco (default: ciano; Steam usa --color-steam). */
  color?: string;
  platinum?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const target = Math.max(0, Math.min(100, value));
  const [p, setP] = useState(reduced ? 1 : 0);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (reduced) {
      setP(1);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      setP(1 - Math.pow(1 - t, 3));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, reduced]);

  const shown = target * p;
  const ringColor = platinum ? "var(--color-plat-2)" : color;
  return (
    <div
      className={cn("hring", className)}
      style={{ ["--size" as string]: `${size}px`, ...(ringColor ? { ["--ring-c" as string]: ringColor } : {}) }}
      role="img"
      aria-label={`${Math.round(target)}% concluído`}
    >
      <svg viewBox="0 0 120 120" aria-hidden>
        <circle className="track" cx="60" cy="60" r={R} fill="none" strokeWidth={strokeWidth} />
        <circle
          className="bar"
          cx="60"
          cy="60"
          r={R}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - shown / 100)}
          style={platinum ? { stroke: "url(#g-plat)" } : undefined}
        />
      </svg>
      <div className="val" aria-hidden>
        <span className="rv">{Math.round(shown)}</span>
        <small>%</small>
      </div>
    </div>
  );
}
