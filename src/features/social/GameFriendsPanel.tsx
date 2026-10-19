import { Link } from "react-router";
import { Panel } from "@/design-system/components/Panel";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { ProgressBar } from "@/design-system/components/ProgressBar";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { useGameFriends } from "./queries";
import { Avatar, PersonName } from "./SocialBits";

/** "Amigos neste jogo": quem (compartilhando) tem o mesmo jogo, Steam × PSN. Some se não houver ninguém. */
export function GameFriendsPanel({ gameId }: { gameId: string }) {
  const q = useGameFriends(gameId);
  if (!q.data) return null;
  if (!q.data.sharing) {
    return (
      <p className="caption m-0">
        Quer ver quais amigos também jogam isto? <Link to="/friends">Ligue o compartilhamento</Link>.
      </p>
    );
  }
  if (q.data.items.length === 0) return null;
  return (
    <Panel sm className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="sub !mb-0">Amigos neste jogo</h3>
        <Link to={`/friends/challenges/new?game=${gameId}`} className="label no-underline hover:!text-text-1">
          Desafiar →
        </Link>
      </div>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {q.data.items.map((f) => (
          <li key={`${f.user.id}-${f.platform}`} className="flex items-center gap-3">
            <Avatar user={f.user} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm">
                <PersonName user={f.user} />
                <PlatformBadge platform={f.platform} />
                {f.has_platinum && <TrophyIcon type="platinum" size={16} />}
              </span>
              <span className="caption">
                {f.earned}/{f.total} · {Math.round(f.completion_pct * 100)}%
              </span>
              <span className="mt-1 block">
                <ProgressBar value={f.completion_pct * 100} />
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
