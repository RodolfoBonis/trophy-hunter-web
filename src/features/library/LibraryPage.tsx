import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { Platform } from "@/api/schemas";
import { GameCover } from "@/design-system/components/GameCover";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { ProgressRing } from "@/design-system/components/ProgressRing";
import { Input } from "@/design-system/components/ui/input";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { useIntegrations } from "@/features/integrations/queries";
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

/**
 * O jogo existe em várias contas: o card mostra a mais avançada (best); o chip diz quantas contas e
 * qual é a melhor (texto, não só cor).
 */
function AccountsChip({ best, count }: { best: string; count: number }) {
  return (
    <span
      className="chamfer-sm bg-surface-2 px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-neon-cyan"
      title={`${count} contas — mostrando a mais avançada: ${best}`}
    >
      {best} · {count} contas
    </span>
  );
}

/** Biblioteca — grade de cards HUD ligada à API. Capa chanfrada, badge de plataforma e anel de %. */
export default function LibraryPage() {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState<Platform | undefined>();
  const [account, setAccount] = useState<string>("");
  const integrations = useIntegrations();
  const query = useLibrary({ q: q || undefined, platform, integration_id: account || undefined });
  // Só faz sentido filtrar por conta quando existe mais de uma.
  const accounts = integrations.data ?? [];

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
        {accounts.length > 1 && (
          <label className="flex items-center gap-2">
            <span className="hud-label text-text-3">Conta</span>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="chamfer-sm h-9 bg-surface-2 px-3 font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-text-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
            >
              <option value="">Todas</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
        )}
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
                      <GameCover
                        cover={game.cover}
                        title={game.title}
                        platform={game.platform}
                        externalId={game.external_id}
                      />
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
                    <p className="flex items-center gap-2 font-numeric text-xs tabular-nums text-text-2">
                      <span>
                        {game.progress.earned}/{game.progress.total}
                        {game.progress.platinum_earned ? " · Platinado" : ""}
                      </span>
                      {game.accounts.length > 1 && (
                        <AccountsChip best={game.accounts[0]?.label ?? ""} count={game.accounts.length} />
                      )}
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
