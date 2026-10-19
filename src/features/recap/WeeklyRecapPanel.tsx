import { Link } from "react-router";
import { Panel } from "@/design-system/components/Panel";
import { Button } from "@/design-system/components/ui/button";
import { AIDisclaimer } from "@/features/ai/GuideViews";
import { useGenerateWeeklyRecap, useWeeklyRecap } from "./queries";

/** Resumo semanal da IA: o mais recente, ou um botão para gerar o desta semana. */
export function WeeklyRecapPanel({ compact = false }: { compact?: boolean }) {
  const q = useWeeklyRecap();
  const gen = useGenerateWeeklyRecap();
  const r = q.data?.recap;
  if (compact && (!r || r.status !== "ready" || !r.content)) return null;
  return (
    <Panel className="flex flex-col gap-3" aria-label="Resumo da semana">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="label !text-neon-violet-text">Resumo da semana · IA</span>
        {compact && (
          <Link to="/recap" className="label no-underline hover:!text-text-1">
            Retrospectiva →
          </Link>
        )}
      </div>
      {q.isPending && <div className="skel skel-line h-16 w-full" />}
      {r?.status === "pending" && (
        <p role="status" className="m-0 text-sm text-text-2">
          A IA está escrevendo o seu resumo…
        </p>
      )}
      {r?.status === "error" && (
        <p role="alert" className="m-0 text-sm text-danger">
          {r.error ?? "Não deu para gerar o resumo."}
        </p>
      )}
      {r?.status === "ready" && r.content && (
        <>
          <h3 className="m-0 font-display text-h4 font-bold text-text-1">{r.content.headline}</h3>
          {r.content.highlights.length > 0 && (
            <ul className="ai-list m-0">
              {r.content.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
          {!compact && r.content.suggestions.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="label">Para a próxima semana</span>
              {r.content.suggestions.map((s) => (
                <p key={s.game} className="m-0 text-sm text-text-2">
                  <b className="text-text-1">{s.game}</b> — {s.why}
                </p>
              ))}
            </div>
          )}
          {!compact && <p className="m-0 text-sm text-text-1">{r.content.encouragement}</p>}
        </>
      )}
      {!compact && (!r || r.status === "error") && (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={() => gen.mutate()} disabled={gen.isPending}>
            {gen.isPending ? "Pedindo…" : "Gerar o resumo desta semana"}
          </Button>
          <span className="caption">Para receber todo domingo, ligue "Resumo semanal da IA" em Contas → Notificações.</span>
        </div>
      )}
      {gen.isError && (
        <p role="alert" className="m-0 text-sm text-danger">
          Não foi possível pedir o resumo.
        </p>
      )}
      {!compact && r?.status === "ready" && <AIDisclaimer />}
    </Panel>
  );
}
