import { cn } from "@/lib/utils";
import { sectionIdx } from "@/layout/nav";
import { useState, type ReactNode } from "react";
import type { GamesQuery } from "@/api/endpoints";
import type { GameStatus, Platform } from "@/api/schemas";
import { GameCard } from "@/design-system/components/GameCard";
import { SectionHead } from "@/design-system/components/SectionHead";
import { LoadMore } from "@/components/LoadMore";
import { useIntegrations } from "@/features/integrations/queries";
import { LIBRARY_PAGE_SIZE, useLibrary } from "./queries";

type Sort = NonNullable<GamesQuery["sort"]>;

const STATUS: { value: GameStatus | undefined; label: string }[] = [
  { value: undefined, label: "Todos" },
  { value: "completed", label: "Platinados / 100%" },
  { value: "almost", label: "Quase lá" },
  { value: "in_progress", label: "Em andamento" },
  { value: "not_started", label: "Sem progresso" },
  { value: "abandoned", label: "Abandonados" },
];

const SORTS: { value: Sort; label: string }[] = [
  { value: "last_played", label: "Recentes" },
  { value: "completion", label: "% concluído" },
  { value: "remaining", label: "Faltam menos" },
  { value: "rarity", label: "Raridade" },
  { value: "title", label: "A–Z" },
];

const PLATFORMS: { value: Platform | undefined; label: string }[] = [
  { value: undefined, label: "Todas" },
  { value: "steam", label: "Steam" },
  { value: "psn", label: "PSN" },
];

/** Grupo segmentado do style tile (`.seg`): rótulo + botões com aria-pressed. */
function Seg<T>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      <span className="seg-l" aria-hidden>
        {label}
      </span>
      {options.map((o) => (
        <button key={String(o.value ?? "all")} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Biblioteca — cards do style tile, filtros, ordenação e rolagem infinita. */
export default function LibraryPage() {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState<Platform | undefined>();
  const [status, setStatus] = useState<GameStatus | undefined>();
  const [sort, setSort] = useState<Sort>("last_played");
  const [account, setAccount] = useState("");
  const [withoutAch, setWithoutAch] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = [platform, status, account || undefined, withoutAch || undefined, sort !== "last_played" || undefined].filter(Boolean).length;
  const integrations = useIntegrations();
  const accounts = integrations.data ?? [];

  const query = useLibrary({
    q: q || undefined,
    platform,
    status,
    sort,
    integration_id: account || undefined,
    has_achievements: withoutAch ? "all" : "true",
  });
  const games = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total;

  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        idx={sectionIdx("/library")}
        title="Biblioteca"
        subtitle={
          total === undefined ? "Seus jogos, conquistas e troféus." : `${total} ${total === 1 ? "jogo" : "jogos"}`
        }
      />

      <div className="panel sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="input min-w-0 flex-1">
            <svg aria-hidden>
              <use href="#i-target" />
            </svg>
            <input
              type="search"
              placeholder="Buscar jogo…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar jogo"
            />
          </div>
          {/* Celular: os filtros ficam recolhidos atrás deste botão (ocupavam a primeira tela inteira). */}
          <button
            type="button"
            className="btn btn-secondary sm sm:hidden"
            aria-expanded={filtersOpen}
            aria-controls="library-filters"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <span className="s" aria-hidden />
            <span className="gl" aria-hidden />
            Filtros{activeFilters > 0 ? ` · ${activeFilters}` : ""}
          </button>
        </div>
        <div id="library-filters" className={cn("flex flex-col gap-4", !filtersOpen && "max-sm:hidden")}>
          <div className="flex flex-wrap items-center gap-3">
            <Seg label="Plataforma" options={PLATFORMS} value={platform} onChange={setPlatform} />
            {accounts.length > 1 && (
              <label className="seg items-center">
                <span className="seg-l">Conta</span>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="h-full cursor-pointer bg-transparent py-[7px] pl-1 pr-2 font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-neon-cyan outline-none"
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
          <div className="flex flex-wrap items-center gap-3">
            <Seg label="Status" options={STATUS} value={status} onChange={setStatus} />
            <Seg label="Ordenar" options={SORTS} value={sort} onChange={setSort} />
            <label className="switch sm:ml-auto">
              <input type="checkbox" checked={withoutAch} onChange={(e) => setWithoutAch(e.target.checked)} />
              Mostrar jogos sem conquistas
            </label>
          </div>
        </div>
      </div>

      {query.isPending && (
        <div className="cards-grid" aria-busy="true" aria-label="Carregando biblioteca">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="skel aspect-[16/10] w-full" />
              <div className="skel skel-line w-2/3" />
              <div className="skel skel-line w-1/3" />
            </div>
          ))}
        </div>
      )}

      {query.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar a biblioteca.
        </p>
      )}

      {query.data && games.length === 0 && (
        <p className="text-sm text-text-2">
          {q || status || platform || account
            ? "Nenhum jogo com esses filtros."
            : "Nenhum jogo ainda. Conecte uma integração e sincronize."}
        </p>
      )}

      {games.length > 0 && (
        <>
          <ul className="cards-grid">
            {games.map((game, i) => {
              const best = game.accounts[0];
              const complete = game.progress.total > 0 && game.progress.earned === game.progress.total;
              return (
                <li key={game.id} className="gcard-in" style={{ ["--i" as string]: Math.min(i % LIBRARY_PAGE_SIZE, 12) }}>
                  <GameCard
                    to={`/games/${game.id}`}
                    title={game.title}
                    platform={game.platform}
                    externalId={game.external_id}
                    cover={game.cover}
                    hero={game.hero}
                    pct={game.progress.completion_pct * 100}
                    earned={game.progress.earned}
                    total={game.progress.total}
                    complete={complete}
                    counts={game.counts}
                    lastUnlockAt={game.last_unlock_at}
                    abandoned={game.abandoned ?? false}
                    transitionName={`game-art-${game.id}`}
                    extra={
                      game.accounts.length > 1 && best ? (
                        <span className="text-neon-cyan" title={`${game.accounts.length} contas — mostrando a mais avançada`}>
                          <svg width={14} height={14} aria-hidden>
                            <use href="#i-user" />
                          </svg>
                          {best.label} · {game.accounts.length} contas
                        </span>
                      ) : null
                    }
                    crossPlatform={game.cross_platform}
                  />
                </li>
              );
            })}
          </ul>
          <LoadMore hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} fetchNextPage={query.fetchNextPage} />
        </>
      )}
    </section>
  );
}
