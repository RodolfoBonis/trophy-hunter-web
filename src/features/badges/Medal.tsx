import type { Badge } from "@/api/schemas";
import { cn } from "@/lib/utils";

const TIER_LABEL = { bronze: "Bronze", silver: "Prata", gold: "Ouro", platinum: "Platina" } as const;
const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

/** Medalha hexagonal na cor do tier; apagada (com andamento) enquanto não é ganha. */
export function Medal({ badge, size = "md" }: { badge: Badge; size?: "sm" | "md" }) {
  const pct = Math.round((badge.value / Math.max(badge.goal, 1)) * 100);
  return (
    <figure className={cn("medal m-0", `tier-${badge.tier}`, !badge.earned && "locked", size === "sm" && "sm")}>
      <div className="medal-hex" aria-hidden>
        <svg width={size === "sm" ? 22 : 30} height={size === "sm" ? 22 : 30}>
          <use href={badge.season ? "#t-plat" : "#i-medal"} />
        </svg>
      </div>
      <figcaption className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm font-semibold text-text-1">{badge.name}</span>
        {size === "md" && <span className="caption block">{badge.description}</span>}
        {size === "md" &&
          (badge.earned ? (
            <span className="caption block">
              {TIER_LABEL[badge.tier]}
              {badge.earned_at && ` · ${dateFmt.format(new Date(badge.earned_at))}`}
            </span>
          ) : (
            <span className="mt-1 block">
              <span className="medal-bar" role="progressbar" aria-valuemin={0} aria-valuemax={badge.goal} aria-valuenow={badge.value} aria-label={`${badge.name}: ${badge.value} de ${badge.goal}`}>
                <span style={{ width: `${pct}%` }} />
              </span>
              <span className="caption">
                {badge.value}/{badge.goal}
              </span>
            </span>
          ))}
      </figcaption>
    </figure>
  );
}
