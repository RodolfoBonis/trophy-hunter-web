import { sectionIdx } from "@/layout/nav";
import { useState } from "react";
import { Link } from "react-router";
import type { LeaderboardItem, LeaderboardPeriod } from "@/api/schemas";
import { LoadMore } from "@/components/LoadMore";
import { Panel } from "@/design-system/components/Panel";
import { SectionHead } from "@/design-system/components/SectionHead";
import { cn } from "@/lib/utils";
import { ChallengesPanel } from "./Challenges";
import { useFeed, useLeaderboard, useSharing } from "./queries";
import { Avatar, FeedRow, PersonName, SharingOptIn, SharingToggle } from "./SocialBits";

const nf = new Intl.NumberFormat("pt-BR");
const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "month", label: "Mês" },
  { value: "year", label: "Ano" },
  { value: "all", label: "Sempre" },
];

function Rank({ item, pos }: { item: LeaderboardItem; pos: number }) {
  return (
    <li className={cn("grid grid-cols-[2rem_auto_1fr_auto] items-center gap-3 border-b border-border-subtle py-3 last:border-0", item.user.is_me && "bg-[rgb(61_245_255/0.04)]")}>
      <span className={cn("num text-center text-xl", pos === 1 ? "text-[var(--color-trophy-gold)]" : "text-text-3")}>{pos}</span>
      <Avatar user={item.user} />
      <div className="min-w-0">
        <div className="truncate text-sm">
          <PersonName user={item.user} />
        </div>
        <div className="caption truncate">
          {nf.format(item.earned)} troféus · {nf.format(item.rare)} {item.rare === 1 ? "raro" : "raros"} · {nf.format(item.completed)}{" "}
          {item.completed === 1 ? "jogo fechado" : "jogos fechados"}
          {item.psn_points > 0 && ` · ${nf.format(item.psn_points)} pts PSN`}
          {item.badges > 0 && ` · ${nf.format(item.badges)} ${item.badges === 1 ? "medalha" : "medalhas"}`}
        </div>
      </div>
      <div className="flex items-center gap-2" title="Platinas">
        <svg width={22} height={22} aria-hidden>
          <use href="#t-plat" />
        </svg>
        <span className="num text-xl">{item.platinum}</span>
      </div>
    </li>
  );
}

function Leaderboard() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("month");
  const board = useLeaderboard(period);
  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="sub !mb-0">Ranking</h3>
        <div className="seg" role="group" aria-label="Período">
          {PERIODS.map((p) => (
            <button key={p.value} type="button" aria-pressed={p.value === period} onClick={() => setPeriod(p.value)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {board.isPending && <div className="skel skel-line h-24 w-full" />}
      {board.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar o ranking.
        </p>
      )}
      {board.data && board.data.items.length <= 1 && (
        <p className="caption">Por enquanto só você compartilha. Quando um amigo ligar o compartilhamento, ele aparece aqui.</p>
      )}
      <ol className="m-0 list-none p-0" aria-label="Ranking por platinas">
        {board.data?.items.map((it, i) => <Rank key={it.user.id} item={it} pos={i + 1} />)}
      </ol>
    </Panel>
  );
}

function Feed() {
  const feed = useFeed();
  const items = feed.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <Panel className="flex flex-col gap-3">
      <h3 className="sub !mb-0">Atividade</h3>
      {feed.isPending && <div className="skel skel-line h-24 w-full" />}
      {feed.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar a atividade.
        </p>
      )}
      {feed.data && items.length === 0 && <p className="caption">Nenhuma platina ou troféu raro ainda.</p>}
      <ul className="m-0 list-none p-0">{items.map((it) => <FeedRow key={`${it.user.id}-${it.trophy_id}`} item={it} />)}</ul>
      <LoadMore hasNextPage={feed.hasNextPage} isFetchingNextPage={feed.isFetchingNextPage} fetchNextPage={feed.fetchNextPage} />
    </Panel>
  );
}

function FriendsList() {
  const board = useLeaderboard("all");
  const friends = (board.data?.items ?? []).filter((i) => !i.user.is_me);
  if (friends.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="sub !mb-0">Amigos</h3>
      <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
        {friends.map((f) => (
          <li key={f.user.id}>
            <Link to={`/friends/${f.user.id}`} className="panel sm flex items-center gap-3 text-text-1 no-underline hover:[&_.n]:text-neon-cyan">
              <Avatar user={f.user} size={44} />
              <span className="min-w-0">
                <span className="n block truncate font-display font-semibold">{f.user.name}</span>
                <span className="caption">
                  {f.platinum} {f.platinum === 1 ? "platina" : "platinas"} · {nf.format(f.earned)} troféus
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Amigos — ranking, atividade e perfis. Opt-in e recíproco: sem compartilhar, só o convite. */
export default function FriendsPage() {
  const sharing = useSharing();
  return (
    <section className="flex flex-col gap-6">
      <SectionHead idx={sectionIdx("/friends")} title="Amigos" subtitle="Ranking, platinas e troféus raros de quem compartilha o progresso." actions={sharing ? <SharingToggle /> : undefined} />
      {!sharing ? (
        <SharingOptIn />
      ) : (
        <>
          <FriendsList />
          <ChallengesPanel />
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <Leaderboard />
            <Feed />
          </div>
        </>
      )}
    </section>
  );
}
