import type { SyncRun } from "@/api/schemas";
import { SectionHead } from "@/design-system/components/SectionHead";
import { ProgressBar } from "@/design-system/components/ProgressBar";
import { Badge, type BadgeProps } from "@/design-system/components/ui/badge";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/design-system/components/ui/table";
import { useSyncRuns } from "./queries";

const STATUS_TONE: Record<SyncRun["status"], NonNullable<BadgeProps["tone"]>> = {
  running: "accent",
  ok: "success",
  error: "danger",
};
const STATUS_LABEL: Record<SyncRun["status"], string> = {
  running: "Rodando",
  ok: "OK",
  error: "Erro",
};
const SCOPE_LABEL: Record<SyncRun["scope"], string> = { full: "Completo", incremental: "Incremental", game: "Jogo" };

function duration(run: SyncRun): string {
  if (!run.finished_at) return "—";
  const ms = new Date(run.finished_at).getTime() - new Date(run.started_at).getTime();
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Progresso do fan-out de jogos: barra enquanto roda, contagem concluídos/total, falhas em alerta. */
function GamesCell({ run }: { run: SyncRun }) {
  const total = run.games_total ?? 0;
  const done = run.games_done ?? 0;
  const failed = run.games_failed ?? 0;
  if (total === 0 && run.status !== "running") return <span className="text-text-3">—</span>;
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div className="flex min-w-[140px] flex-col gap-1">
      <span className="font-numeric text-xs tabular-nums text-text-2">
        {done}/{total} jogos
        {failed > 0 && (
          <span className="ml-2 text-warning">
            · {failed} {failed === 1 ? "falha" : "falhas"}
          </span>
        )}
      </span>
      {run.status === "running" && <ProgressBar value={pct} />}
    </div>
  );
}

/** Log de sync — tabela HUD ligada à API (poll a cada 15s). */
export default function SyncLogPage() {
  const query = useSyncRuns();
  return (
    <section className="flex flex-col gap-6">
      <SectionHead idx="06" title="Sync" subtitle="Execuções de sincronização: quando rodaram, o que mudou e o que falhou." />
      <SyncTable query={query} />
    </section>
  );
}

function SyncTable({ query }: { query: ReturnType<typeof useSyncRuns> }) {
  if (query.isPending) return <Skeleton className="h-64 w-full" />;
  if (query.isError)
    return (
      <p role="alert" className="text-sm text-danger">
        Não foi possível carregar o log de sync.
      </p>
    );
  if (query.data.length === 0) return <p className="text-sm text-text-2">Nenhum sync executado ainda.</p>;

  return (
    <Table>
      <THead>
        <TR>
          <TH scope="col">Início</TH>
          <TH scope="col">Plataforma</TH>
          <TH scope="col">Escopo</TH>
          <TH scope="col">Gatilho</TH>
          <TH scope="col">Status</TH>
          <TH scope="col">Jogos</TH>
          <TH scope="col">Itens</TH>
          <TH scope="col">Duração</TH>
        </TR>
      </THead>
      <TBody>
        {query.data.map((run) => (
          <TR key={run.id}>
            <TD className="whitespace-nowrap text-text-2">{new Date(run.started_at).toLocaleString("pt-BR")}</TD>
            <TD className="font-display uppercase">{run.platform}</TD>
            <TD>{SCOPE_LABEL[run.scope]}</TD>
            <TD>{run.trigger === "manual" ? "Manual" : "Agendado"}</TD>
            <TD>
              <Badge tone={STATUS_TONE[run.status]}>{STATUS_LABEL[run.status]}</Badge>
              {run.error && <p className="mt-1 text-xs text-danger">{run.error}</p>}
            </TD>
            <TD>
              <GamesCell run={run} />
            </TD>
            <TD className="font-numeric tabular-nums text-text-2">{run.items_changed ?? 0}</TD>
            <TD className="text-text-2">{duration(run)}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
