import { useState } from "react";
import { Link } from "react-router";
import type { Platform } from "@/api/schemas";
import { Badge } from "@/design-system/components/ui/badge";
import { Card } from "@/design-system/components/ui/card";
import { Input } from "@/design-system/components/ui/input";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { useLibrary } from "./queries";

const PLATFORM_LABEL: Record<Platform, string> = { steam: "Steam", psn: "PSN" };

/**
 * Biblioteca — lista plain ligada à API (TanStack Query). Sem estilo final (aguarda o style tile);
 * serve para validar o contrato e a navegação para a página do jogo.
 */
export default function LibraryPage() {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState<Platform | undefined>();
  const query = useLibrary({ q: q || undefined, platform });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          placeholder="Buscar jogo…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Buscar jogo"
          className="max-w-xs"
        />
        <div className="flex gap-1" role="group" aria-label="Filtrar por plataforma">
          {([undefined, "steam", "psn"] as const).map((p) => (
            <button
              key={p ?? "all"}
              type="button"
              onClick={() => setPlatform(p)}
              aria-pressed={platform === p}
              className={`rounded-[var(--radius)] border px-3 py-1.5 text-sm ${
                platform === p ? "border-accent/40 bg-accent/15 text-accent" : "border-border text-muted hover:text-text"
              }`}
            >
              {p ? PLATFORM_LABEL[p] : "Todas"}
            </button>
          ))}
        </div>
      </div>

      {query.isPending && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[3/4] w-full" />
            </li>
          ))}
        </ul>
      )}

      {query.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar a biblioteca.
        </p>
      )}

      {query.data && query.data.items.length === 0 && (
        <p className="text-sm text-muted">Nenhum jogo ainda. Conecte uma integração e sincronize.</p>
      )}

      {query.data && query.data.items.length > 0 && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          {query.data.items.map((game) => (
            <li key={game.id}>
              <Link to={`/games/${game.id}`} className="block focus-visible:outline-none">
                <Card className="overflow-hidden transition-colors hover:border-border-strong">
                  <div className="flex aspect-[3/4] items-center justify-center bg-surface-2">
                    {game.cover ? (
                      <img
                        src={game.cover}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-2 text-center text-xs text-faint">{game.title}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    <p className="truncate text-sm font-medium text-text" title={game.title}>
                      {game.title}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone="neutral">{PLATFORM_LABEL[game.platform]}</Badge>
                      <span className="text-xs text-muted">
                        {game.progress.earned}/{game.progress.total}
                      </span>
                    </div>
                    {game.progress.platinum_earned && <Badge tone="accent">Platinado</Badge>}
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
