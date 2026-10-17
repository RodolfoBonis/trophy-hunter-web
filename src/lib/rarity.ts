/** Tiers de raridade (loot) a partir do % de jogadores que têm o troféu. Ver style tile. */
export type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface RarityInfo {
  tier: RarityTier;
  label: string;
  glyph: string;
  colorVar: string;
}

const INFO: Record<RarityTier, RarityInfo> = {
  common: { tier: "common", label: "Comum", glyph: "#r-common", colorVar: "var(--color-rarity-common)" },
  uncommon: { tier: "uncommon", label: "Incomum", glyph: "#r-uncommon", colorVar: "var(--color-rarity-uncommon)" },
  rare: { tier: "rare", label: "Raro", glyph: "#r-rare", colorVar: "var(--color-rarity-rare)" },
  epic: { tier: "epic", label: "Épico", glyph: "#r-epic", colorVar: "var(--color-rarity-epic)" },
  legendary: { tier: "legendary", label: "Lendário", glyph: "#r-legendary", colorVar: "var(--color-rarity-legendary)" },
};

export function rarityTier(pct: number): RarityTier {
  if (pct < 1) return "legendary";
  if (pct < 5) return "epic";
  if (pct < 20) return "rare";
  if (pct < 50) return "uncommon";
  return "common";
}

export function rarityInfo(pct: number): RarityInfo {
  return INFO[rarityTier(pct)];
}

/** Formata o % como no style tile (vírgula decimal pt-BR, 1 casa abaixo de 10%). */
export function formatRarityPct(pct: number): string {
  const digits = pct < 10 ? 1 : 0;
  return `${pct.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
}
