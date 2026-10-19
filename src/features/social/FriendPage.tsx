import { useState } from "react";
import { Link, useParams } from "react-router";
import { isApiError } from "@/api/errors";
import type { GameStatus } from "@/api/schemas";
import { GameCover } from "@/design-system/components/GameCover";
import { Panel } from "@/design-system/components/Panel";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { ProgressBar } from "@/design-system/components/ProgressBar";
import { SectionHead } from "@/design-system/components/SectionHead";
import { Hero, Moments, Rarest } from "@/features/dashboard/DashboardPage";
import { useFriend, useFriendGames, useSharing } from "./queries";
import { SharingOptIn } from "./SocialBits";

const STATUSES: { value?: GameStatus; label: string }[] = [
  { label: "Todos" },
  { value: "completed", label: "Completos" },
  { value: "in_progress", label: "Em andamento" },
  { value: "almost", label: "Quase lá" },
];

/** Biblioteca do amigo — só leitura (lista compacta; o jogo dele não abre). */
function FriendLibrary({ id }: { id: string }) {
  const [status, setStatus] = useState<GameStatus | undefined>();
  const games = useFriendGames(id, { status, sort: "last_played", limit: 60 });
  const items = games.data?.items ?? [];
  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="sub !mb-0">Biblioteca{games.data ? ` · ${games.data.total}` : ""}</h3>
        <div className="seg" role="group" aria-label="Status">
          {STATUSES.map((s) => (
            <button key={s.label} type="button" aria-pressed={s.value === status} onClick={() => setStatus(s.value)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {games.isPending && <div className="skel skel-line h-24 w-full" />}
      {games.data && items.length === 0 && <p className="caption">Nenhum jogo com esse filtro.</p>}
      <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
        {items.map((g) => {
          const complete = g.progress.total > 0 && g.progress.earned === g.progress.total;
          return (
            <li key={g.id} className="flex items-center gap-3">
              <span className="chamfer-sm relative block w-24 shrink-0 overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
                <GameCover variant="hero" cover={g.cover} hero={g.hero} title={g.title} platform={g.platform} externalId={g.external_id} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="block truncate font-display font-semibold text-text-1">{g.title}</span>
                  <PlatformBadge platform={g.platform} />
                </span>
                <span className="caption">
                  {g.progress.earned}/{g.progress.total} · {complete ? (g.platform === "psn" ? "platinado" : "100%") : `${Math.round(g.progress.completion_pct * 100)}%`}
                </span>
                <span className="mt-1 block">
                  <ProgressBar value={g.progress.completion_pct * 100} />
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/** Perfil de um amigo que compartilha: o mesmo resumo do Início + biblioteca. */
export default function FriendPage() {
  const { id = "" } = useParams();
  const sharing = useSharing();
  const friend = useFriend(id);
  if (!sharing) {
    return (
      <section className="flex flex-col gap-6">
        <SectionHead idx="06" title="Amigo" />
        <SharingOptIn />
      </section>
    );
  }
  if (friend.isError) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHead idx="06" title="Amigo" />
        <p className="text-sm text-text-2">
          {isApiError(friend.error) && friend.error.isNotFound
            ? "Esse perfil não está disponível — a pessoa pode ter parado de compartilhar."
            : "Não foi possível carregar o perfil."}
        </p>
        <Link to="/friends" className="label no-underline">
          ← Amigos
        </Link>
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-8">
      <SectionHead
        idx="06"
        title={friend.data?.user.name ?? "Amigo"}
        subtitle="Progresso compartilhado — só leitura."
        actions={
          <span className="flex items-center gap-4">
            <Link to={`/friends/challenges/new?friend=${id}`} className="label no-underline hover:!text-text-1">
              Desafiar
            </Link>
            <Link to="/friends" className="label no-underline hover:!text-text-1">
              ← Amigos
            </Link>
          </span>
        }
      />
      {friend.isPending && <div className="skel chamfer-md h-72" aria-busy="true" />}
      {friend.data && (
        <>
          <Hero stats={friend.data.stats} kicker={`Resumo de ${friend.data.user.name}`} />
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <Rarest stats={friend.data.stats} linkGames={false} />
            <Moments stats={friend.data.stats} linkGames={false} />
          </div>
          <FriendLibrary id={id} />
        </>
      )}
    </section>
  );
}
