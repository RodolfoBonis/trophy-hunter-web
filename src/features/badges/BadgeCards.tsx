import { Link } from "react-router";
import { Medal } from "./Medal";
import { useFriendBadges, useMyBadges } from "./queries";

/** Card do Início: a próxima medalha e a temporada do mês. */
export function NextBadgeCard() {
  const q = useMyBadges();
  if (!q.data) return null;
  const next = q.data.next[0];
  const { season } = q.data;
  return (
    <div className="panel flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="sub !mb-0">Medalhas</h3>
        <Link to="/badges" className="label no-underline hover:text-neon-cyan">
          Ver todas →
        </Link>
      </div>
      {next && <Medal badge={next} />}
      <p className="m-0 text-caption text-text-3">
        {season.label}:{" "}
        {season.done
          ? "fechada!"
          : `${season.platinums}/${season.platinum_goal} platinas ou ${season.rare}/${season.rare_goal} raros`}
      </p>
    </div>
  );
}

/** Vitrine do perfil do amigo (só aparece para quem compartilha — regra da API). */
export function FriendBadges({ id }: { id: string }) {
  const q = useFriendBadges(id);
  const earned = q.data?.earned ?? [];
  if (earned.length === 0) return null;
  return (
    <div className="panel flex flex-col gap-3">
      <h3 className="sub !mb-0">Medalhas · {earned.length}</h3>
      <ul className="medal-grid">
        {earned.slice(0, 8).map((b) => (
          <li key={`${b.key}:${b.season ?? ""}`}>
            <Medal badge={b} size="sm" />
          </li>
        ))}
      </ul>
    </div>
  );
}
