import type { SyncRun } from "@/api/schemas";
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

/** Log de sync — tabela plain ligada à API. */
export default function SyncLogPage() {
  const query = useSyncRuns();

  if (query.isPending) return <Skeleton className="h-64 w-full" />;
  if (query.isError)
    return (
      <p role="alert" className="text-sm text-danger">
        Não foi possível carregar o log de sync.
      </p>
    );
  if (query.data.length === 0) return <p className="text-sm text-muted">Nenhum sync executado ainda.</p>;

  return (
    <Table>
      <THead>
        <TR>
          <TH scope="col">Início</TH>
          <TH scope="col">Plataforma</TH>
          <TH scope="col">Escopo</TH>
          <TH scope="col">Gatilho</TH>
          <TH scope="col">Status</TH>
          <TH scope="col">Mudanças</TH>
          <TH scope="col">Duração</TH>
        </TR>
      </THead>
      <TBody>
        {query.data.map((run) => (
          <TR key={run.id}>
            <TD className="whitespace-nowrap text-muted">{new Date(run.started_at).toLocaleString("pt-BR")}</TD>
            <TD className="uppercase">{run.platform}</TD>
            <TD>{SCOPE_LABEL[run.scope]}</TD>
            <TD>{run.trigger === "manual" ? "Manual" : "Agendado"}</TD>
            <TD>
              <Badge tone={STATUS_TONE[run.status]}>{STATUS_LABEL[run.status]}</Badge>
              {run.error && <p className="mt-1 text-xs text-danger">{run.error}</p>}
            </TD>
            <TD className="text-muted">
              {run.items_changed ?? 0} itens · {run.games_touched ?? 0} jogos
            </TD>
            <TD className="text-muted">{duration(run)}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
