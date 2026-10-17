import type { ReactNode } from "react";
import { formatRarityPct, rarityInfo, type RarityTier } from "@/lib/rarity";
import { cn } from "@/lib/utils";

/**
 * Badge de raridade loot do style tile (`.rbadge` em hud.css): cor + forma (glifo) + rótulo + %
 * (nunca só cor). Tiers raro/épico/lendário têm glow permanente que acende no hover/foco.
 * `pct` = % de jogadores que têm. `tier`/`label`/`detail` permitem usos fora do % (ex.: "Falta 2").
 */
export function RarityBadge({
  pct,
  tier,
  label,
  detail,
  mini = false,
  className,
}: {
  pct?: number;
  tier?: RarityTier;
  label?: ReactNode;
  detail?: ReactNode;
  mini?: boolean;
  className?: string;
}) {
  const info = rarityInfo(pct ?? 100);
  const t = tier ?? info.tier;
  const glyph = `#r-${t}`;
  return (
    <span className={cn("rbadge", `r-${t}`, t, mini && "mini", className)}>
      <span className="bg" />
      <span className="glow" aria-hidden />
      <svg aria-hidden>
        <use href={glyph} />
      </svg>
      <span className="rl">{label ?? (tier ? tierLabel(t) : info.label)}</span>
      {(detail ?? pct) !== undefined && <span className="rr">{detail ?? formatRarityPct(pct ?? 0)}</span>}
    </span>
  );
}

function tierLabel(t: RarityTier): string {
  return { common: "Comum", uncommon: "Incomum", rare: "Raro", epic: "Épico", legendary: "Lendário" }[t];
}
