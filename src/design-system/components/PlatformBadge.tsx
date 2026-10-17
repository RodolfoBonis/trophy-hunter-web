import type { Platform } from "@/api/schemas";
import { cn } from "@/lib/utils";

/**
 * Badge de plataforma. A diferença é de FORMA (não só cor), então se distingue até em escala de
 * cinza: PSN = preenchimento azul royal sólido; Steam = contorno slate com traço azul-céu.
 */
export function PlatformBadge({
  platform,
  label,
  className,
}: {
  platform: Platform;
  label?: string;
  className?: string;
}) {
  const isPsn = platform === "psn";
  return (
    <span
      className={cn(
        "chamfer-sm inline-flex items-center gap-1.5 py-1.5 pl-1.5 pr-2 font-display text-[10.5px] font-bold uppercase leading-none tracking-[0.12em]",
        isPsn ? "bg-psn text-white" : "bg-steam-bg text-steam shadow-[inset_0_0_0_1px_rgb(102_192_244/0.45)]",
        className,
      )}
    >
      <svg width={13} height={13} aria-hidden className="shrink-0">
        <use href={isPsn ? "#i-ps" : "#i-steam"} />
      </svg>
      {label ?? (isPsn ? "PSN" : "Steam")}
    </span>
  );
}
