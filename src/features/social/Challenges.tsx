import { Link } from "react-router";
import type { ChallengeKind, ChallengeSummary } from "@/api/schemas";
import { Panel } from "@/design-system/components/Panel";
import { Button, buttonClasses } from "@/design-system/components/ui/button";
import { cn } from "@/lib/utils";
import { useChallengeAction, useChallenges } from "./queries";

export const KIND_LABEL: Record<ChallengeKind, string> = {
  first_to_complete: "Quem fecha primeiro",
  most_trophies: "Mais troféus",
  most_rare: "Mais troféus raros",
};

/** "termina em 3 dias", "terminou", "sem prazo". */
export function deadlineText(c: Pick<ChallengeSummary, "status" | "ends_at">): string {
  if (c.status === "canceled") return "cancelado";
  if (c.status === "finished") return "encerrado";
  if (!c.ends_at) return "sem prazo";
  const ms = new Date(c.ends_at).getTime() - Date.now();
  if (ms <= 0) return "encerrando…";
  const h = Math.ceil(ms / 3_600_000);
  if (h < 48) return `termina em ${h} h`;
  return `termina em ${Math.ceil(h / 24)} dias`;
}

function InviteActions({ c }: { c: ChallengeSummary }) {
  const act = useChallengeAction(c.id);
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => act.mutate("accept")} disabled={act.isPending} aria-label={`Aceitar: ${c.title}`}>
        Aceitar
      </Button>
      <Button size="sm" variant="ghost" onClick={() => act.mutate("decline")} disabled={act.isPending} aria-label={`Recusar: ${c.title}`}>
        Recusar
      </Button>
      {act.isError && (
        <span role="alert" className="caption !text-danger">
          {act.error instanceof Error ? act.error.message : "Não deu certo."}
        </span>
      )}
    </div>
  );
}

function ChallengeRow({ c }: { c: ChallengeSummary }) {
  const open = c.status === "open";
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle py-3 last:border-0">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{KIND_LABEL[c.kind]}</span>
          {c.my_state === "invited" && open && <span className="chip !text-neon-violet-text">Convite</span>}
          {!open && <span className={cn("chip", c.status === "finished" ? "!text-success" : "!text-text-3")}>{c.status === "finished" ? "Encerrado" : "Cancelado"}</span>}
        </div>
        <Link to={`/friends/challenges/${c.id}`} className="mt-1 block truncate font-display font-semibold text-text-1 no-underline hover:text-neon-cyan">
          {c.title}
        </Link>
        <span className="caption">
          {c.accepted_count} {c.accepted_count === 1 ? "participante" : "participantes"} · {deadlineText(c)}
          {c.status === "finished" && (c.winner_name ? ` · venceu ${c.winner_name}` : " · sem vencedor")}
        </span>
      </div>
      {c.my_state === "invited" && open && <InviteActions c={c} />}
    </li>
  );
}

/** Desafios (lista em Amigos): convites pendentes primeiro, depois os em andamento e os encerrados. */
export function ChallengesPanel() {
  const q = useChallenges();
  const items = [...(q.data ?? [])].sort(
    (a, b) => Number(b.my_state === "invited" && b.status === "open") - Number(a.my_state === "invited" && a.status === "open"),
  );
  return (
    <Panel className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="sub !mb-0">Desafios</h3>
        <Link to="/friends/challenges/new" className={cn(buttonClasses("secondary", "sm"), "no-underline")}>
          <span className="s" aria-hidden />
          <span className="gl" aria-hidden />
          Novo desafio
        </Link>
      </div>
      {q.isPending && <div className="skel skel-line h-16 w-full" />}
      {q.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar os desafios.
        </p>
      )}
      {q.data && items.length === 0 && <p className="caption">Nenhum desafio ainda. Chame um amigo para uma corrida de platina.</p>}
      <ul className="m-0 list-none p-0" aria-label="Desafios">
        {items.map((c) => (
          <ChallengeRow key={c.id} c={c} />
        ))}
      </ul>
    </Panel>
  );
}
