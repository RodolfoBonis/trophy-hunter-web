import { Panel } from "@/design-system/components/Panel";
import { SectionHead } from "@/design-system/components/SectionHead";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { Medal } from "./Medal";
import { useMyBadges } from "./queries";

function Goal({ label, value, goal }: { label: string; value: number; goal: number }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-text-2">{label}</span>
        <span className="num text-text-1">
          {Math.min(value, goal)}/{goal}
        </span>
      </div>
      <span className="medal-bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={goal} aria-valuenow={value}>
        <span style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

/** Medalhas do app: temporada do mês, as ganhas e o catálogo com andamento. */
export default function BadgesPage() {
  const q = useMyBadges();
  if (q.isPending) return <Skeleton className="h-64 w-full" />;
  if (q.isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        Não deu para carregar as medalhas.
      </p>
    );
  }
  const { earned, catalog, season } = q.data;
  const open = catalog.filter((b) => !b.earned);
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        title="Medalhas"
        subtitle={`${earned.length} ${earned.length === 1 ? "ganha" : "ganhas"} · as do app, além dos troféus dos jogos.`}
      />

      <Panel className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="sub !mb-0">{season.label}</h3>
          <span className={season.done ? "chip !text-success" : "caption"}>
            {season.done ? "Temporada fechada" : "Feche uma das metas até o fim do mês"}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Goal label="Platinas (ou 100% na Steam)" value={season.platinums} goal={season.platinum_goal} />
          <Goal label="Troféus raros (< 5%)" value={season.rare} goal={season.rare_goal} />
        </div>
      </Panel>

      <div className="flex flex-col gap-3">
        <h3 className="sub !mb-0">Ganhas</h3>
        {earned.length === 0 ? (
          <p className="m-0 text-sm text-text-2">Nenhuma ainda — a primeira platina já vale uma.</p>
        ) : (
          <ul className="medal-grid">
            {earned.map((b) => (
              <li key={`${b.key}:${b.season ?? ""}`}>
                <Medal badge={b} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {open.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="sub !mb-0">Para conquistar</h3>
          <ul className="medal-grid">
            {open.map((b) => (
              <li key={b.key}>
                <Medal badge={b} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
