import { formatRarityPct, rarityInfo } from "@/lib/rarity";
import { cn } from "@/lib/utils";

/**
 * Badge de raridade loot: cor + forma + rótulo + % (nunca só cor). `pct` = % de jogadores que têm.
 * A borda esquerda e o glifo carregam a cor do tier.
 */
export function RarityBadge({ pct, mini = false, className }: { pct: number; mini?: boolean; className?: string }) {
  const info = rarityInfo(pct);
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-2 font-display",
        mini ? "gap-1.5 py-1 pl-2 pr-2.5" : "gap-2.5 py-2 pl-3 pr-4",
        className,
      )}
      style={{ color: info.colorVar }}
    >
      <span
        className="chamfer-sm absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(90deg, color-mix(in oklab, ${info.colorVar} 22%, transparent), color-mix(in oklab, ${info.colorVar} 6%, transparent))`,
          boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${info.colorVar} 45%, transparent)`,
        }}
      />
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: info.colorVar }} aria-hidden />
      <svg width={mini ? 12 : 16} height={mini ? 12 : 16} aria-hidden className="relative shrink-0">
        <use href={info.glyph} />
      </svg>
      <span
        className={cn("relative font-bold uppercase leading-none tracking-[0.12em]", mini ? "text-[10.5px]" : "text-sm")}
      >
        {info.label}
      </span>
      <span className="relative font-numeric font-semibold tabular-nums text-text-2" style={{ fontSize: mini ? 11 : 12 }}>
        {formatRarityPct(pct)}
      </span>
    </span>
  );
}
