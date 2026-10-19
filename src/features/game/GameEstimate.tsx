import type { GameDetail } from "@/api/schemas";
import { formatHours } from "@/lib/hours";

/** Tempos do HowLongToBeat para o jogo (história / extras / 100%) e quanto ainda falta. */
export function GameEstimatePanel({ game }: { game: GameDetail }) {
  const e = game.estimate;
  if (!e) return null;
  const done = game.progress.total > 0 && game.progress.earned === game.progress.total;
  const goal = game.platform === "psn" ? "a platina" : "100%";
  return (
    <div className="panel sm flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="Tempo estimado">
      <span className="label">Tempo · HowLongToBeat</span>
      <span className="caption">
        História <b className="text-text-1">{formatHours(e.main_h)}</b>
      </span>
      <span className="caption">
        + extras <b className="text-text-1">{formatHours(e.extra_h)}</b>
      </span>
      <span className="caption">
        100% <b className="text-text-1">{formatHours(e.completionist_h)}</b>
      </span>
      {!done && e.hours_left != null && (
        <span className="chip !text-neon-cyan">
          faltam ~{formatHours(e.hours_left)} para {goal}
        </span>
      )}
      {e.source_url && (
        <a href={e.source_url} target="_blank" rel="noopener noreferrer" className="caption ml-auto no-underline hover:!text-text-1">
          ver no HLTB ↗
        </a>
      )}
    </div>
  );
}
