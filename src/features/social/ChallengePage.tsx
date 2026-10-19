import { sectionIdx } from "@/layout/nav";
import { Link, useParams } from "react-router";
import { isApiError } from "@/api/errors";
import type { ChallengeDetail, ChallengeStanding } from "@/api/schemas";
import { GameCover } from "@/design-system/components/GameCover";
import { Panel } from "@/design-system/components/Panel";
import { ProgressBar } from "@/design-system/components/ProgressBar";
import { SectionHead } from "@/design-system/components/SectionHead";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { Button } from "@/design-system/components/ui/button";
import { cn } from "@/lib/utils";
import { deadlineText, KIND_LABEL } from "./Challenges";
import { useChallenge, useChallengeAction, useSharing } from "./queries";
import { Avatar, PersonName, SharingOptIn } from "./SocialBits";

function sortStandings(c: ChallengeDetail): ChallengeStanding[] {
  const accepted = c.standings.filter((s) => s.state === "accepted");
  const rest = c.standings.filter((s) => s.state !== "accepted");
  accepted.sort((a, b) =>
    c.kind === "first_to_complete"
      ? Number(Boolean(b.completed_at)) - Number(Boolean(a.completed_at)) || b.completion_pct - a.completion_pct
      : b.score - a.score,
  );
  return [...accepted, ...rest];
}

function StandingRow({ c, s, pos }: { c: ChallengeDetail; s: ChallengeStanding; pos: number }) {
  const accepted = s.state === "accepted";
  const winner = c.winner?.id === s.user.id;
  return (
    <li className={cn("grid grid-cols-[2rem_auto_1fr_auto] items-center gap-3 border-b border-border-subtle py-3 last:border-0", !accepted && "opacity-60")}>
      <span className={cn("num text-center text-xl", winner ? "text-[var(--color-trophy-gold)]" : "text-text-3")}>{accepted ? pos : "–"}</span>
      <Avatar user={s.user} />
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <PersonName user={s.user} />
          {winner && <TrophyIcon type="platinum" size={16} />}
          {!accepted && <span className="caption">{s.state === "invited" ? "convidado" : "recusou"}</span>}
        </div>
        {accepted && c.kind === "first_to_complete" && (
          <>
            <span className="caption">
              {s.has_game ? `${s.earned}/${s.total} · ${Math.round(s.completion_pct * 100)}%` : "ainda não tem o jogo"}
              {s.completed_at && " · fechou!"}
            </span>
            <span className="mt-1 block max-w-md">
              <ProgressBar value={s.completion_pct * 100} platinum={Boolean(s.completed_at)} />
            </span>
          </>
        )}
      </div>
      {accepted && c.kind !== "first_to_complete" && (
        <span className="num text-xl" aria-label={`${s.score} ${c.kind === "most_rare" ? "raros" : "troféus"}`}>
          {s.score}
        </span>
      )}
    </li>
  );
}

/** Desafio: placar ao vivo, prazo, resultado e ações (aceitar/recusar/cancelar). */
export default function ChallengePage() {
  const { id = "" } = useParams();
  const sharing = useSharing();
  const q = useChallenge(id);
  const act = useChallengeAction(id);
  if (!sharing) {
    return (
      <section className="flex flex-col gap-6">
        <SectionHead idx={sectionIdx("/friends")} title="Desafio" />
        <SharingOptIn />
      </section>
    );
  }
  if (q.isError) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHead idx={sectionIdx("/friends")} title="Desafio" />
        <p className="text-sm text-text-2">{isApiError(q.error) && q.error.isNotFound ? "Desafio não encontrado." : "Não foi possível carregar o desafio."}</p>
        <Link to="/friends" className="label no-underline">
          ← Amigos
        </Link>
      </section>
    );
  }
  const c = q.data;
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        idx={sectionIdx("/friends")}
        title={c?.title ?? "Desafio"}
        subtitle={c ? `${KIND_LABEL[c.kind]} · ${deadlineText(c)}` : undefined}
        actions={
          <Link to="/friends" className="label no-underline hover:!text-text-1">
            ← Amigos
          </Link>
        }
      />
      {q.isPending && <div className="skel chamfer-md h-48" aria-busy="true" />}
      {c && (
        <>
          {c.status === "finished" && (
            <div className="banner" role="status">
              <span className="ic" aria-hidden>
                <TrophyIcon type="platinum" size={26} />
              </span>
              <div className="min-w-0">
                <strong>{c.winner ? `${c.winner.is_me ? "Você venceu" : `${c.winner.name} venceu`}!` : "Encerrado sem vencedor"}</strong>
                <span>{c.winner ? "Placar final abaixo." : "Ninguém fechou a tempo (ou deu empate)."}</span>
              </div>
            </div>
          )}
          {c.my_state === "invited" && c.status === "open" && (
            <Panel sm className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-text-2">Você foi desafiado. Topa?</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => act.mutate("accept")} disabled={act.isPending}>
                  Aceitar desafio
                </Button>
                <Button size="sm" variant="ghost" onClick={() => act.mutate("decline")} disabled={act.isPending}>
                  Recusar
                </Button>
              </div>
            </Panel>
          )}
          {act.isError && (
            <p role="alert" className="m-0 text-sm text-danger">
              {act.error instanceof Error ? act.error.message : "Não deu certo."}
            </p>
          )}
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <Panel className="flex flex-col gap-3">
              <h3 className="sub !mb-0">Placar</h3>
              <ol className="m-0 list-none p-0" aria-label="Placar do desafio">
                {sortStandings(c).map((s, i) => (
                  <StandingRow key={s.user.id} c={c} s={s} pos={i + 1} />
                ))}
              </ol>
            </Panel>
            {c.game && (
              <Panel className="flex flex-col gap-3">
                <span className="label">Jogo do desafio</span>
                <span className="chamfer-sm block overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
                  <GameCover variant="hero" cover={c.game.cover} title={c.game.title} platform={c.game.platform} externalId={c.game.external_id} />
                </span>
                <span className="font-display font-semibold text-text-1">{c.game.title}</span>
                <span className="caption">Vale qualquer plataforma (Steam ou PSN) — conta quem fechar primeiro depois do início.</span>
              </Panel>
            )}
          </div>
          {c.is_creator && c.status === "open" && (
            <Button variant="ghost" size="sm" className="self-start text-text-3 hover:text-danger" onClick={() => act.mutate("cancel")} disabled={act.isPending}>
              Cancelar desafio
            </Button>
          )}
        </>
      )}
    </section>
  );
}
