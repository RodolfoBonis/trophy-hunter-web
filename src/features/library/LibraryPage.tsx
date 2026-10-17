import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { Platform } from "@/api/schemas";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { ProgressRing } from "@/design-system/components/ProgressRing";
import { Input } from "@/design-system/components/ui/input";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLibrary } from "./queries";

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "chamfer-sm px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-[var(--dur-fast)]",
        active
          ? "bg-[color-mix(in_oklab,var(--color-neon-cyan)_18%,transparent)] text-neon-cyan"
          : "bg-surface-2 text-text-3 hover:text-text-1",
      )}
    >
      {children}
    </button>
  );
}

/** Biblioteca — grade de cards HUD ligada à API. Capa chanfrada, badge de plataforma e anel de %. */
export default function LibraryPage() {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState<Platform | undefined>();
  const query = useLibrary({ q: q || undefined, platform });

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder="Buscar jogo…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Buscar jogo"
          className="max-w-xs"
        />
        <div className="flex gap-1.5" role="group" aria-label="Filtrar por plataforma">
          <FilterChip active={platform === undefined} onClick={() => setPlatform(undefined)}>
            Todas
          </FilterChip>
          <FilterChip active={platform === "steam"} onClick={() => setPlatform("steam")}>
            Steam
          </FilterChip>
          <FilterChip active={platform === "psn"} onClick={() => setPlatform("psn")}>
            PSN
          </FilterChip>
        </div>
      </div>

      {query.isPending && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-3.5 w-3/4" />
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
        <p className="text-sm text-text-2">Nenhum jogo ainda. Conecte uma integração e sincronize.</p>
      )}

      {query.data && query.data.items.length > 0 && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          {query.data.items.map((game) => {
            const pct = Math.round(game.progress.completion_pct * 100);
            return (
              <li key={game.id}>
                <Link
                  to={`/games/${game.id}`}
                  className="group flex flex-col gap-2.5 focus-visible:outline-none"
                >
                  <div className="relative">
                    {/* moldura chanfrada com borda em gradiente que acende no hover/foco */}
                    <div
                      className="chamfer-md absolute -inset-px opacity-25 transition-opacity duration-[var(--dur-fast)] group-hover:opacity-90 group-focus-visible:opacity-90"
                      style={{
                        background:
                          "linear-gradient(140deg,var(--color-neon-cyan),transparent 35%,transparent 70%,var(--color-neon-violet))",
                      }}
                      aria-hidden
                    />
                    <div className="chamfer-md relative aspect-[3/4] overflow-hidden bg-surface-2">
                      {game.cover ? (
                        <img src={game.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <span className="grid h-full place-items-center px-2 text-center font-display text-sm uppercase text-text-3">
                          {game.title}
                        </span>
                      )}
                      <div className="absolute left-2 top-2">
                        <PlatformBadge platform={game.platform} />
                      </div>
                      <div className="absolute bottom-2 right-2 rounded-full bg-bg-0/70 p-0.5 backdrop-blur-sm">
                        <ProgressRing
                          value={pct}
                          size={44}
                          strokeWidth={10}
                          platinum={game.progress.platinum_earned}
                          color={game.platform === "steam" ? "var(--color-steam)" : "var(--color-neon-cyan)"}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="truncate font-display text-sm font-semibold text-text-1" title={game.title}>
                      {game.title}
                    </p>
                    <p className="font-numeric text-xs tabular-nums text-text-2">
                      {game.progress.earned}/{game.progress.total}
                      {game.progress.platinum_earned ? " · Platinado" : ""}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
