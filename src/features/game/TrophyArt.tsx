import { useState } from "react";
import type { Trophy } from "@/api/schemas";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { cn } from "@/lib/utils";

/**
 * Ícone da linha (`.ticon` do tile): o ícone REAL da conquista/troféu com o glifo do tipo no canto;
 * bloqueado → ícone de bloqueio da plataforma (ou o ícone dessaturado) + cadeado; sem ícone → glifo.
 */
export function TrophyArt({ trophy, spoiler }: { trophy: Trophy; spoiler: boolean }) {
  const [broken, setBroken] = useState(false);
  const src = trophy.earned ? trophy.icon : trophy.icon_locked || trophy.icon;
  const showImg = Boolean(src) && !broken;
  return (
    <div className="ticon">
      {showImg ? (
        <>
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
            className={cn(
              "ticon-img",
              !trophy.earned && !trophy.icon_locked && "dim",
              spoiler && "spoiled",
            )}
          />
          <span className="ticon-type">
            <TrophyIcon type={trophy.type} size={14} />
          </span>
        </>
      ) : (
        <TrophyIcon type={trophy.type} size={34} />
      )}
      {!trophy.earned && (
        <svg
          className="lock"
          style={{ color: "var(--color-text-2)" }}
          aria-hidden
        >
          <use href="#i-lock" />
        </svg>
      )}
    </div>
  );
}
