import { useState } from "react";
import { Link } from "react-router";
import type { CompareTrophy } from "@/api/schemas";
import { Panel } from "@/design-system/components/Panel";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { cn } from "@/lib/utils";
import { useCompare, useGameFriends } from "./queries";
import { Avatar } from "./SocialBits";

type Filter = "all" | "they" | "me" | "both";
const FILTERS: [Filter, string][] = [
  ["all", "Todos"],
  ["they", "Ele tem, eu não"],
  ["me", "Eu tenho, ele não"],
  ["both", "Os dois"],
];

function Mark({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={cn("grid size-7 place-items-center", on ? "text-success" : "text-text-disabled")} aria-label={`${label}: ${on ? "tem" : "não tem"}`}>
      <svg width={16} height={16} aria-hidden>
        <use href={on ? "#i-check" : "#i-lock"} />
      </svg>
    </span>
  );
}

function Row({ t }: { t: CompareTrophy }) {
  const [revealed, setRevealed] = useState(false);
  const spoiler = t.hidden && !t.mine && !revealed;
  return (
    <li className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-b border-border-subtle py-2 last:border-0">
      <TrophyIcon type={t.type} size={22} />
      <div className="min-w-0">
        <div className={cn("tt truncate !text-sm", spoiler && "blur-sm select-none")} aria-hidden={spoiler}>
          {t.name}
        </div>
        {spoiler ? (
          <button type="button" className="caption !text-neon-cyan" onClick={() => setRevealed(true)}>
            Oculto — revelar
          </button>
        ) : (
          t.description && <div className="caption truncate">{t.description}</div>
        )}
      </div>
      {t.rarity_pct != null ? <RarityBadge pct={t.rarity_pct} mini /> : <span />}
      <span className="flex">
        <Mark on={t.mine} label="Você" />
        {t.matched ? <Mark on={t.friend} label="Amigo" /> : <span className="caption w-7 text-center" title="Não existe na versão dele">—</span>}
      </span>
    </li>
  );
}

/** Aba "Comparar" do jogo: meus troféus × os de um amigo que tem o mesmo jogo (Steam × PSN pelo nome). */
export function ComparePanel({ gameId }: { gameId: string }) {
  const friends = useGameFriends(gameId);
  const options = friends.data?.items ?? [];
  const [friendId, setFriendId] = useState<string | undefined>();
  const selected = friendId ?? options[0]?.user.id;
  const cmp = useCompare(gameId, selected);
  const [filter, setFilter] = useState<Filter>("all");

  if (friends.data && !friends.data.sharing) {
    return (
      <p className="caption">
        Para comparar com amigos, <Link to="/friends">ligue o compartilhamento</Link>.
      </p>
    );
  }
  if (friends.data && options.length === 0) return <p className="caption">Nenhum amigo que compartilha tem este jogo.</p>;
  const items = (cmp.data?.trophies ?? []).filter((t) =>
    filter === "they" ? t.friend && !t.mine : filter === "me" ? t.mine && !t.friend : filter === "both" ? t.mine && t.friend : true,
  );
  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Comparar com">
        {options.map((o) => (
          <button
            key={`${o.user.id}-${o.platform}`}
            type="button"
            role="radio"
            aria-checked={selected === o.user.id}
            onClick={() => setFriendId(o.user.id)}
            className={cn("panel sm flex items-center gap-2", selected === o.user.id && "[--panel-bg:linear-gradient(180deg,rgb(61_245_255/0.22),rgb(61_245_255/0.06))] text-neon-cyan")}
          >
            <Avatar user={o.user} size={26} />
            <span className="text-sm text-text-1">{o.user.name}</span>
            <span className="caption">{Math.round(o.completion_pct * 100)}%</span>
          </button>
        ))}
        {selected && (
          <Link to={`/friends/challenges/new?game=${gameId}&friend=${selected}`} className="label ml-auto no-underline hover:!text-text-1">
            Desafiar →
          </Link>
        )}
      </div>
      {cmp.data && (
        <p className="caption m-0">
          {cmp.data.friend.name}: {cmp.data.friend_earned}/{cmp.data.friend_total} ({Math.round(cmp.data.friend_completion_pct * 100)}%)
          {!cmp.data.same_platform && ` na ${cmp.data.friend_platform === "psn" ? "PSN" : "Steam"} — troféus casados pelo nome`}
        </p>
      )}
      <div className="seg self-start" role="group" aria-label="Filtro da comparação">
        {FILTERS.map(([v, l]) => (
          <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)}>
            {l}
          </button>
        ))}
      </div>
      {cmp.isPending && selected && <div className="skel skel-line h-24 w-full" />}
      {cmp.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível comparar.
        </p>
      )}
      <div className="flex justify-end gap-1 pr-1 caption">
        <span className="w-7 text-center">Você</span>
        <span className="w-7 text-center">Ele</span>
      </div>
      <ul className="m-0 list-none p-0" aria-label="Troféus comparados">
        {items.map((t) => (
          <Row key={t.trophy_id} t={t} />
        ))}
      </ul>
      {cmp.data && items.length === 0 && <p className="caption">Nada nesse filtro.</p>}
    </Panel>
  );
}
