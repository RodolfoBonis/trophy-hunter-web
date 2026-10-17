import { cn } from "@/lib/utils";

/** Barra de progresso HUD (chanfrada). `value` 0–100. `platinum` troca o preenchimento pelo gradiente. */
export function ProgressBar({
  value,
  platinum = false,
  className,
}: {
  value: number;
  platinum?: boolean;
  className?: string;
}) {
  const p = Math.max(0, Math.min(100, value)) / 100;
  return (
    <div
      className={cn("chamfer-sm relative h-2.5 overflow-hidden bg-surface-3", className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="absolute inset-0 origin-left transition-transform duration-[var(--dur-count)] ease-[var(--ease-out)]"
        style={{
          transform: `scaleX(${p})`,
          background: platinum
            ? "var(--gradient-platinum-linear)"
            : "linear-gradient(90deg, var(--color-neon-violet), var(--color-neon-cyan))",
        }}
      />
    </div>
  );
}
