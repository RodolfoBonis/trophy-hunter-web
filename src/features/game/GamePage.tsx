import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";
import type { Trophy, TrophyType } from "@/api/schemas";
import { Badge } from "@/design-system/components/ui/badge";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { useGame } from "./queries";

const TYPE_LABEL: Record<TrophyType, string> = {
  platinum: "Platina",
  gold: "Ouro",
  silver: "Prata",
  bronze: "Bronze",
  achievement: "Conquista",
};

function TrophyRow({ trophy }: { trophy: Trophy }) {
  return (
    <li className="flex items-start gap-3 border-t border-border py-3 first:border-t-0">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-medium text-text">
          {trophy.name}
          {trophy.earned && <Badge tone="success">Desbloqueado</Badge>}
        </p>
        {trophy.description && <p className="mt-0.5 text-sm text-muted">{trophy.description}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-faint">
          <span>{TYPE_LABEL[trophy.type]}</span>
          {trophy.rarity_pct != null && <span>· {trophy.rarity_pct}% têm</span>}
          {(trophy.tags ?? []).map((t) => (
            <Badge key={t} tone="neutral">
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </li>
  );
}

/** Página do jogo — plain, ligada à API. Troféus agrupados por grupo (base vs DLC). */
export default function GamePage() {
  const { gameId = "" } = useParams();
  const query = useGame(gameId);

  return (
    <section className="flex flex-col gap-4">
      <Link to="/library" className="inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft className="size-4" aria-hidden /> Biblioteca
      </Link>

      {query.isPending && <Skeleton className="h-8 w-64" />}
      {query.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar o jogo.
        </p>
      )}

      {query.data && (
        <>
          <header className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-text">{query.data.title}</h2>
            <p className="text-sm text-muted">
              {query.data.progress.earned}/{query.data.progress.total} ·{" "}
              {Math.round(query.data.progress.completion_pct * 100)}%
              {query.data.progress.platinum_earned ? " · Platinado" : ""}
            </p>
          </header>

          {query.data.groups.map((group) => {
            if (group.trophies.length === 0) return null;
            return (
              <div key={group.id}>
                <h3 className="mb-1 text-sm font-semibold text-text">
                  {group.name} {group.is_base ? "" : "(DLC)"}
                </h3>
                <ul>
                  {group.trophies.map((t) => (
                    <TrophyRow key={t.id} trophy={t} />
                  ))}
                </ul>
              </div>
            );
          })}

          {query.data.groups.every((g) => g.trophies.length === 0) && (
            <p className="text-sm text-muted">Nenhum troféu sincronizado ainda para este jogo.</p>
          )}
        </>
      )}
    </section>
  );
}
