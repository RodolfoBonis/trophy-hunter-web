import { useMemo, useState } from "react";
import type { Platform } from "@/api/schemas";
import { cn } from "@/lib/utils";

/** Header "clássico" da Steam (16:9), fallback comum quando a capa library_600x900 404a (jogos antigos). */
function steamHeader(appid: string): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
}

function Placeholder({
  title,
  platform,
  showTitle,
  className,
}: {
  title: string;
  platform: Platform;
  showTitle: boolean;
  className?: string;
}) {
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
      {showTitle && (
        <span className={cn("line-clamp-3 font-display text-sm font-semibold uppercase leading-tight", isPsn ? "text-white" : "text-[#c7d5e0]")}>
          {title}
        </span>
      )}
    </div>
  );
}

/**
 * Arte do jogo com cadeia de fallback, sem ícone de imagem quebrada.
 * - `variant="cover"` (vertical): cover → hero → (Steam) header.jpg → placeholder.
 * - `variant="hero"` (horizontal, card 16:10 e cabeçalho): hero → cover → header.jpg → placeholder.
 * O placeholder é estilizado (gradiente da plataforma + título em display + glifo sutil).
 */
export function GameCover({
  cover,
  hero,
  variant = "cover",
  title,
  platform,
  externalId,
  className,
  priority = false,
}: {
  cover?: string | null;
  hero?: string | null;
  variant?: "cover" | "hero";
  title: string;
  platform: Platform;
  externalId?: string;
  className?: string;
  /** Imagem principal acima da dobra (LCP): baixa já e com prioridade alta, sem lazy. */
  priority?: boolean;
}) {
  const sources = useMemo(() => {
    const ordered = variant === "hero" ? [hero, cover] : [cover, hero];
    const list = ordered.filter((s): s is string => Boolean(s));
    if (platform === "steam" && externalId) list.push(steamHeader(externalId));
    return [...new Set(list)];
  }, [cover, hero, variant, platform, externalId]);
  const [idx, setIdx] = useState(0);
  const src = sources[idx];

  // Na arte horizontal (card/cabeçalho) o título já aparece por cima; o placeholder fica só com o glifo.
  if (!src) return <Placeholder title={title} platform={platform} showTitle={variant === "cover"} className={className} />;
  return (
    <img
      src={src}
      alt=""
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn("h-full w-full object-cover", className)}
      onError={() => setIdx((i) => i + 1)}
    />
  );
}
