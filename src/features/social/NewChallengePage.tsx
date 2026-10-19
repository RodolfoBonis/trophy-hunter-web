import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useApi } from "@/api/ApiProvider";
import { api } from "@/api/endpoints";
import type { ChallengeKind } from "@/api/schemas";
import { Panel } from "@/design-system/components/Panel";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { SectionHead } from "@/design-system/components/SectionHead";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { cn } from "@/lib/utils";
import { KIND_LABEL } from "./Challenges";
import { useCreateChallenge, useLeaderboard, useSharing } from "./queries";
import { Avatar, SharingOptIn } from "./SocialBits";

const KIND_HINT: Record<ChallengeKind, string> = {
  first_to_complete: "Escolha um jogo: vence quem fechar (platina/100%) primeiro.",
  most_trophies: "Quem pegar mais troféus/conquistas no período.",
  most_rare: "Quem pegar mais troféus raros (menos de 5% dos jogadores) no período.",
};

/** Seleção do jogo (first_to_complete): busca na SUA biblioteca. */
function GamePicker({ value, onChange }: { value?: string; onChange: (id: string, title: string) => void }) {
  const client = useApi();
  const [q, setQ] = useState("");
  const games = useQuery({
    queryKey: ["challenge-game-search", q],
    queryFn: ({ signal }) => api.games(client, { q, limit: 8, sort: q ? "title" : "last_played" }, signal),
  });
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="challenge-game" className="hud-label">
        Jogo
      </Label>
      <Input id="challenge-game" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar na sua biblioteca…" autoComplete="off" />
      <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2" aria-label="Jogos">
        {(games.data?.items ?? []).map((g) => {
          const done = g.progress.total > 0 && g.progress.earned === g.progress.total;
          return (
            <li key={g.id}>
              <button
                type="button"
                disabled={done}
                aria-pressed={value === g.id}
                onClick={() => onChange(g.id, g.title)}
                className={cn(
                  "panel sm flex w-full items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50",
                  value === g.id && "[--panel-bg:linear-gradient(180deg,rgb(61_245_255/0.22),rgb(61_245_255/0.06))] text-neon-cyan",
                )}
                title={done ? "Você já fechou este jogo" : undefined}
              >
                <PlatformBadge platform={g.platform} />
                <span className="min-w-0 flex-1 truncate text-sm text-text-1">{g.title}</span>
                <span className="caption">{Math.round(g.progress.completion_pct * 100)}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Novo desafio: tipo, amigos (que compartilham), jogo ou período. `?game=` e `?friend=` pré-preenchem. */
export default function NewChallengePage() {
  const sharing = useSharing();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const board = useLeaderboard("all", sharing);
  const create = useCreateChallenge();
  const [kind, setKind] = useState<ChallengeKind>(params.get("game") ? "first_to_complete" : "most_trophies");
  const [friends, setFriends] = useState<string[]>(params.get("friend") ? [params.get("friend")!] : []);
  const [gameId, setGameId] = useState<string | undefined>(params.get("game") ?? undefined);
  const [days, setDays] = useState<number>(params.get("game") ? 0 : 7);
  const candidates = (board.data?.items ?? []).filter((i) => !i.user.is_me);

  if (!sharing) {
    return (
      <section className="flex flex-col gap-6">
        <SectionHead idx="06" title="Novo desafio" />
        <SharingOptIn />
      </section>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate(
      {
        kind,
        friend_ids: friends,
        ...(kind === "first_to_complete" ? { game_id: gameId, ...(days ? { days } : {}) } : { days }),
      },
      { onSuccess: (c) => navigate(`/friends/challenges/${c.id}`, { replace: true }) },
    );
  }
  const toggle = (id: string) => setFriends((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id].slice(0, 5)));
  const ready = friends.length > 0 && (kind !== "first_to_complete" || Boolean(gameId));
  const dayOptions = kind === "first_to_complete" ? [0, 14, 30, 60, 90] : [7, 14, 30];

  return (
    <section className="flex flex-col gap-6">
      <SectionHead idx="06" title="Novo desafio" subtitle="Chame amigos que compartilham o progresso." />
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <Panel className="flex flex-col gap-4">
          <span className="label">Tipo</span>
          <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Tipo de desafio">
            {(Object.keys(KIND_LABEL) as ChallengeKind[]).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => {
                  setKind(k);
                  setDays(k === "first_to_complete" ? 0 : 7);
                }}
                className={cn("panel sm flex flex-col gap-1 text-left", kind === k && "[--panel-bg:linear-gradient(180deg,rgb(61_245_255/0.22),rgb(61_245_255/0.06))] text-neon-cyan")}
              >
                <span className="font-display font-semibold text-text-1">{KIND_LABEL[k]}</span>
                <span className="caption">{KIND_HINT[k]}</span>
              </button>
            ))}
          </div>
          {kind === "first_to_complete" && <GamePicker value={gameId} onChange={(id) => setGameId(id)} />}
          <div className="seg self-start" role="group" aria-label="Prazo">
            <span className="seg-l" aria-hidden>
              Prazo
            </span>
            {dayOptions.map((d) => (
              <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)}>
                {d === 0 ? "Sem prazo" : `${d} dias`}
              </button>
            ))}
          </div>
        </Panel>
        <Panel className="flex flex-col gap-3">
          <span className="label">Amigos (até 5)</span>
          {board.data && candidates.length === 0 && <p className="caption">Nenhum amigo compartilhando o progresso ainda.</p>}
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Amigos">
            {candidates.map((c) => (
              <li key={c.user.id}>
                <button
                  type="button"
                  aria-pressed={friends.includes(c.user.id)}
                  onClick={() => toggle(c.user.id)}
                  className={cn("panel sm flex items-center gap-2", friends.includes(c.user.id) && "[--panel-bg:linear-gradient(180deg,rgb(61_245_255/0.22),rgb(61_245_255/0.06))] text-neon-cyan")}
                >
                  <Avatar user={c.user} size={28} />
                  <span className="text-sm text-text-1">{c.user.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        {create.isError && (
          <p role="alert" className="m-0 text-sm text-danger">
            {create.error instanceof Error ? create.error.message : "Não foi possível criar o desafio."}
          </p>
        )}
        <Button type="submit" className="self-start" disabled={!ready || create.isPending}>
          {create.isPending ? "Criando…" : "Desafiar"}
        </Button>
      </form>
    </section>
  );
}
