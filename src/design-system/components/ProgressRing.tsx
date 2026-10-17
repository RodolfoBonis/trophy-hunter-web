import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const R = 52;
const CIRC = 2 * Math.PI * R;

/**
 * Anel de progresso HUD (SVG). Conta o número e preenche o arco; respeita reduced-motion (mostra o
 * valor final na hora). `platinum` usa o gradiente iridescente no traço.
 */
export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 8,
  color = "var(--color-neon-cyan)",
  platinum = false,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  platinum?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  const raf = useRef<number | undefined>(undefined);
  const target = Math.max(0, Math.min(100, value));

  useEffect(() => {
    if (reduced) {
      setDisplay(target);
      return;
    }
    const start = performance.now();
    const from = 0;
    const DUR = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (target - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, reduced]);

  const offset = CIRC * (1 - display / 100);
  const stroke = platinum ? "url(#g-plat)" : color;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(target)}% concluído`}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth={strokeWidth} className="stroke-surface-3" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={stroke}
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 4px color-mix(in oklab, ${platinum ? "var(--color-plat-2)" : color} var(--glow-mix), transparent))` }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-numeric font-bold tabular-nums leading-none"
        style={{ fontSize: size * 0.3 }}
      >
        {Math.round(display)}
        <small className="self-center text-[0.5em] text-text-3">%</small>
      </div>
    </div>
  );
}
