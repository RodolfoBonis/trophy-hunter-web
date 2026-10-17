import { useDeferredValue, useState } from "react";
import { Link } from "react-router";
import type { CrossPlatformGame, GameDetail } from "@/api/schemas";
import { GameCover } from "@/design-system/components/GameCover";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { ProgressRing } from "@/design-system/components/ProgressRing";
import { useLinkCandidates, useLinkGame } from "./queries";

/** Um lado da comparação: arte, progresso e % pelo critério da plataforma. */
function Side({ game, current }: { game: CrossPlatformGame; current?: boolean }) {
  const pct = Math.round(game.completion_pct * 100);
  const steam = game.platform === "steam";
  const body = (
    <>
      <span className="chamfer-sm relative block w-28 shrink-0 overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
        <GameCover variant="hero" cover={game.cover} hero={game.hero} title={game.title} platform={game.platform} externalId={game.external_id} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <PlatformBadge platform={game.platform} />
        <span className="truncate font-display text-sm font-bold text-text-1">{game.title}</span>
        <span className="caption tabular-nums">
          {game.earned}/{game.total} {steam ? "conquistas" : "troféus"}
          {current ? " · aberto" : ""}
        </span>
      </span>
      <ProgressRing value={pct} size={48} color={steam ? "var(--color-steam)" : undefined} />
    </>
  );
  if (current) {
    return (
      <div className="panel sm flex items-center gap-3" aria-current="page">
        {body}
      </div>
    );
  }
  return (
    <Link to={`/games/${game.game_id}`} viewTransition className="panel sm flex items-center gap-3 no-underline hover:[&_.font-display]:text-neon-cyan">
      {body}
    </Link>
  );
}

/** Busca na outra plataforma para vincular à mão (match automático só pega título idêntico). */
function LinkSearch({ game, onDone }: { game: GameDetail; onDone: () => void }) {
  const [q, setQ] = useState(game.title.replace(/[™®©]/g, ""));
  const deferred = useDeferredValue(q.trim());
  const candidates = useLinkCandidates(game.id, deferred, true);
  const link = useLinkGame();
  const other = game.platform === "steam" ? "PlayStation" : "Steam";
  const items = candidates.data ?? [];
  return (
    <div className="flex flex-col gap-3 border-t border-border-subtle pt-4">
      <div className="input">
        <svg aria-hidden>
          <use href="#i-target" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Buscar na ${other}…`}
          aria-label={`Buscar jogo na ${other}`}
        />
      </div>
      {candidates.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível buscar.
        </p>
      )}
      {candidates.data && items.length === 0 && <p className="caption">Nenhum jogo da {other} com esse título.</p>}
      <ul className="m-0 flex list-none flex-col gap-2 p-0" aria-label="Candidatos" aria-busy={candidates.isFetching}>
        {items.map((c) => (
          <li key={c.game_id} className="flex items-center gap-3">
            <span className="min-w-0 flex-1 truncate text-sm text-text-1">{c.title}</span>
            <span className="caption tabular-nums">
              {c.earned}/{c.total}
            </span>
            <button
              type="button"
              className="btn btn-secondary sm"
              disabled={link.isPending}
              onClick={() => link.mutate({ id: game.id, otherGameId: c.game_id }, { onSuccess: onDone })}
              aria-label={`Vincular a ${c.title}`}
            >
              <span className="s" aria-hidden />
              Vincular
            </button>
          </li>
        ))}
      </ul>
      {link.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível vincular.
        </p>
      )}
    </div>
  );
}

/**
 * Unificação cross-platform: o mesmo jogo na Steam e na PSN lado a lado (cada um pelo critério da
 * sua plataforma — 100% vs platina). Vínculo automático por título idêntico; aqui dá para vincular
 * à mão (títulos diferentes) ou desfazer — a decisão manual trava o automático.
 */
export function CrossPlatform({ game }: { game: GameDetail }) {
  const [searching, setSearching] = useState(false);
  const unlink = useLinkGame();
  const linked = game.cross_platform.length > 0;
  const other = game.platform === "steam" ? "PlayStation" : "Steam";
  const self: CrossPlatformGame = {
    game_id: game.id,
    platform: game.platform,
    external_id: game.external_id,
    title: game.title,
    cover: game.cover ?? "",
    hero: game.hero ?? "",
    earned: game.progress.earned,
    total: game.progress.total,
    completion_pct: game.progress.completion_pct,
    last_unlock_at: null,
  };

  return (
    <section aria-label="Outras plataformas" className="panel sm flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="label inline-flex items-center gap-2">
          <svg width={14} height={14} aria-hidden>
            <use href="#i-link" />
          </svg>
          {linked ? "Steam × PlayStation · lado a lado" : `Também tem na ${other}?`}
          {game.unify_locked && linked && <span className="opacity-60">· vínculo manual</span>}
        </span>
        <div className="flex gap-2">
          {linked && (
            <button
              type="button"
              className="label cursor-pointer hover:!text-danger"
              disabled={unlink.isPending}
              onClick={() => unlink.mutate({ id: game.id, otherGameId: null })}
            >
              Desvincular
            </button>
          )}
          {!linked && (
            <button type="button" className="label cursor-pointer hover:!text-text-1" aria-expanded={searching} onClick={() => setSearching((s) => !s)}>
              {searching ? "Fechar" : `Vincular jogo da ${other}`}
            </button>
          )}
        </div>
      </div>
      {linked && (
        <div className="grid gap-3 md:grid-cols-2">
          <Side game={self} current />
          {game.cross_platform.map((c) => (
            <Side key={c.game_id} game={c} />
          ))}
        </div>
      )}
      {linked && <p className="caption">Cada lado segue o critério da plataforma: 100% na Steam, platina na PSN.</p>}
      {!linked && searching && <LinkSearch game={game} onDone={() => setSearching(false)} />}
      {unlink.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível desvincular.
        </p>
      )}
    </section>
  );
}
