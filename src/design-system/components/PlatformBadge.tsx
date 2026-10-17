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
  // Marcação/classes do style tile (.pbadge.psn / .pbadge.steam em hud.css).
  return (
    <span className={cn("pbadge", isPsn ? "psn" : "steam", className)}>
      <svg aria-hidden>
        <use href={isPsn ? "#i-ps" : "#i-steam"} />
      </svg>
      {label ?? (isPsn ? "PSN" : "Steam")}
    </span>
  );
}
