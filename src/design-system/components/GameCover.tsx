import { useMemo, useState } from "react";
import type { Platform } from "@/api/schemas";
import { cn } from "@/lib/utils";

/** Header "clássico" da Steam (16:9), fallback comum quando a capa library_600x900 404a (jogos antigos). */
function steamHeader(appid: string): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
}

function Placeholder({ title, platform, className }: { title: string; platform: Platform; className?: string }) {
  const isPsn = platform === "psn";
  return (
    <div
      className={cn("flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center", className)}
      style={{
        background: isPsn
          ? "linear-gradient(135deg, var(--color-psn), var(--color-psn-deep))"
          : "linear-gradient(160deg, var(--color-steam-bg-2), var(--color-steam-bg))",
      }}
    >
      <svg width={30} height={30} aria-hidden className={cn("opacity-40", isPsn ? "text-white" : "text-steam")}>
        <use href={isPsn ? "#i-ps" : "#i-steam"} />
      </svg>
      <span className={cn("line-clamp-3 font-display text-sm font-semibold uppercase leading-tight", isPsn ? "text-white" : "text-[#c7d5e0]")}>
        {title}
      </span>
    </div>
  );
}

/**
 * Capa do jogo com cadeia de fallback: `cover` → (Steam) header.jpg → placeholder estilizado
 * (gradiente da plataforma + título em display + glifo sutil). Evita o ícone de imagem quebrada.
 */
export function GameCover({
  cover,
  title,
  platform,
  externalId,
  className,
}: {
  cover?: string | null;
  title: string;
  platform: Platform;
  externalId?: string;
  className?: string;
}) {
  const sources = useMemo(() => {
    const list: string[] = [];
    if (cover) list.push(cover);
    if (platform === "steam" && externalId) list.push(steamHeader(externalId));
    return list;
  }, [cover, platform, externalId]);
  const [idx, setIdx] = useState(0);
  const src = sources[idx];

  if (!src) return <Placeholder title={title} platform={platform} className={className} />;
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      className={cn("h-full w-full object-cover", className)}
      onError={() => setIdx((i) => i + 1)}
    />
  );
}
