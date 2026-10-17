import type { TrophyType } from "@/api/schemas";
import { cn } from "@/lib/utils";

const GLYPH: Record<TrophyType, string> = {
  bronze: "#t-bronze",
  silver: "#t-silver",
  gold: "#t-gold",
  platinum: "#t-plat",
  achievement: "#t-ach",
};

const LABEL: Record<TrophyType, string> = {
  bronze: "Troféu de bronze",
  silver: "Troféu de prata",
  gold: "Troféu de ouro",
  platinum: "Troféu de platina",
  achievement: "Conquista Steam",
};

/** Glifo de troféu/conquista (SVG próprio do style tile). `size` em px. */
export function TrophyIcon({ type, size = 34, className }: { type: TrophyType; size?: number; className?: string }) {
  return (
    <svg
      role="img"
      aria-label={LABEL[type]}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    >
      <use href={GLYPH[type]} />
    </svg>
  );
}
