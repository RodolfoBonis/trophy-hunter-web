import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Platform } from "@/api/schemas";
import { GameCard } from "@/design-system/components/GameCard";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { useIntegrations } from "@/features/integrations/queries";
import { cn } from "@/lib/utils";
import { LIBRARY_PAGE_SIZE, useLibrary } from "./queries";

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
  const games = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total;
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
        {total !== undefined && (
          <span className="ml-auto font-numeric text-sm tabular-nums text-text-2" aria-live="polite">
            <span className="font-semibold text-text-1">{total}</span> {total === 1 ? "jogo" : "jogos"}
          </span>
        )}
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
        <ul className="gcard-grid" aria-busy="true" aria-label="Carregando biblioteca">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-[16/10] w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </li>
          ))}
        </ul>
      )}

      {query.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar a biblioteca.
        </p>
      )}

      {query.data && games.length === 0 && (
        <p className="text-sm text-text-2">Nenhum jogo ainda. Conecte uma integração e sincronize.</p>
      )}

      {games.length > 0 && (
        <>
          <ul className="gcard-grid">
            {games.map((game, i) => {
              const pct = game.progress.completion_pct * 100;
              const best = game.accounts[0];
              return (
                <li key={game.id}>
                  <GameCard
                    to={`/games/${game.id}`}
                    index={i % LIBRARY_PAGE_SIZE}
                    title={game.title}
                    platform={game.platform}
                    externalId={game.external_id}
                    cover={game.cover}
                    hero={game.hero}
                    pct={pct}
                    earned={game.progress.earned}
                    total={game.progress.total}
                    platinum={game.progress.platinum_earned ?? false}
                    transitionName={`game-art-${game.id}`}
                    meta={game.last_unlock_at ? <> · última: {lastUnlock(game.last_unlock_at)}</> : null}
                    footer={
                      game.accounts.length > 1 && best ? (
                        <AccountsChip best={best.label} count={game.accounts.length} />
                      ) : null
                    }
                  />
                </li>
              );
            })}
          </ul>
          <LoadMore query={query} />
        </>
      )}
    </section>
  );
}

/** "hoje", "ontem", "há 3 dias" ou a data. */
function lastUnlock(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Carrega a próxima página quando o sentinela entra na tela (IntersectionObserver), com um botão como
 * alternativa acessível (teclado/leitor de tela e navegadores sem observer).
 */
function LoadMore({ query }: { query: ReturnType<typeof useLibrary> }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!hasNextPage) return null;
  return (
    <div ref={sentinel} className="flex justify-center py-4">
      <Button variant="secondary" onClick={() => void fetchNextPage()} disabled={isFetchingNextPage}>
        {isFetchingNextPage ? "Carregando…" : "Carregar mais"}
      </Button>
    </div>
  );
}
