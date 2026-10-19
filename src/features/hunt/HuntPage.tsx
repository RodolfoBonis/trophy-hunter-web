import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import type { HuntStage, Trophy } from "@/api/schemas";
import { ProgressRing } from "@/design-system/components/ProgressRing";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { Button } from "@/design-system/components/ui/button";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { RoadmapPanel } from "@/features/ai/AIGuides";
import { useRoadmap } from "@/features/ai/queries";
import { TrophyArt } from "@/features/game/TrophyArt";
import { useGame } from "@/features/game/queries";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/endpoints";
import { useHunt, useSetHuntStage, useSyncThisGame } from "./queries";

/** Com a tela aberta (e visível), sincroniza o jogo sozinho de tempos em tempos. */
const AUTO_SYNC_MS = 10 * 60_000;

function useAutoSync(run: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") run();
    }, AUTO_SYNC_MS);
    return () => window.clearInterval(t);
  }, [run, enabled]);
}

function StageTrophy({ trophy }: { trophy: Trophy }) {
  const secret = trophy.hidden && !trophy.earned;
  return (
    <li className={cn("hunt-trophy", trophy.earned && "got")}>
      <TrophyArt trophy={trophy} spoiler={false} />
      <div className="min-w-0 flex-1">
        <p className="m-0 line-clamp-2 text-sm font-semibold text-text-1 [overflow-wrap:anywhere]">{trophy.name}</p>
        {!secret && trophy.description && <p className="m-0 line-clamp-2 text-caption text-text-3">{trophy.description}</p>}
      </div>
      {trophy.rarity_pct != null && <RarityBadge pct={trophy.rarity_pct} mini />}
      <span className="sr-only">{trophy.earned ? "obtido" : "falta"}</span>
    </li>
  );
}

function StageCard({
  stage,
  trophies,
  current,
  onToggle,
  pending,
}: {
  stage: HuntStage;
  trophies: Map<string, Trophy>;
  current: boolean;
  onToggle: (done: boolean) => void;
  pending: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const finished = stage.done || stage.complete;
  const list = stage.trophy_ids.map((id) => trophies.get(id)).filter((t): t is Trophy => Boolean(t));
  const missing = list.filter((t) => !t.earned);
  // Marcar como feita com perdível pendente: pergunta antes (depois do ponto sem volta não dá mais).
  const needsConfirm = !stage.done && stage.missables.length > 0 && missing.length > 0;

  return (
    <li className={cn("panel hunt-stage flex flex-col gap-3", current && "current", finished && "finished")} aria-current={current ? "step" : undefined}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={stage.done}
          aria-label={`Etapa ${stage.index + 1} feita: ${stage.title}`}
          className="hunt-check"
          disabled={pending}
          onClick={() => (needsConfirm ? setConfirming(true) : onToggle(!stage.done))}
        >
          {stage.done && (
            <svg width={16} height={16} aria-hidden>
              <use href="#i-check" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <span className="label">Etapa {stage.index + 1}{current && " · agora"}</span>
          <h3 className="sub !m-0">{stage.title}</h3>
        </div>
        {stage.trophy_ids.length > 0 && (
          <span className={cn("chip", stage.complete && "!text-success")}>
            {stage.earned}/{stage.trophy_ids.length} troféus
          </span>
        )}
      </div>
      {stage.description && <p className="m-0 text-sm text-text-2">{stage.description}</p>}

      {stage.missables.length > 0 && !finished && (
        <div className="hunt-warn" role="note">
          <b>Antes de avançar:</b> {stage.missables.join(" · ")}
        </div>
      )}

      {confirming && (
        <div className="hunt-confirm" role="alertdialog" aria-label="Confirmar etapa com perdíveis">
          <p className="m-0 text-sm text-text-1">
            Você pegou {missing.map((t) => t.name).join(", ")}? Depois daqui não dá mais.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setConfirming(false)} autoFocus>
              Ainda não
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setConfirming(false);
                onToggle(true);
              }}
            >
              Já peguei, marcar
            </Button>
          </div>
        </div>
      )}

      {list.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {list.map((t) => (
            <StageTrophy key={t.id} trophy={t} />
          ))}
        </ul>
      )}
      {stage.unmatched.length > 0 && (
        <p className="m-0 text-caption text-text-3">
          Também citados pela IA: {stage.unmatched.join(" · ")}
        </p>
      )}
    </li>
  );
}

/** Modo caçada: o roadmap da IA como checklist do jogo, com os troféus reais e os perdíveis à vista. */
export default function HuntPage() {
  const { gameId = "" } = useParams();
  const game = useGame(gameId);
  const hunt = useHunt(gameId);
  const setStage = useSetHuntStage(gameId);
  const sync = useSyncThisGame(gameId);
  const { mutate: syncNow } = sync;
  const ready = hunt.data?.roadmap === "ready";
  useAutoSync(syncNow, ready);
  // Roadmap acabou de ficar pronto (gerado aqui mesmo): o checklist aparece sem recarregar.
  const qc = useQueryClient();
  const roadmapStatus = useRoadmap(gameId).data?.status;
  useEffect(() => {
    if (roadmapStatus === "ready" && hunt.data && !ready) void qc.invalidateQueries({ queryKey: queryKeys.hunt(gameId) });
  }, [roadmapStatus, ready, hunt.data, qc, gameId]);

  const trophies = useMemo(() => {
    const m = new Map<string, Trophy>();
    for (const g of game.data?.groups ?? []) for (const t of g.trophies) m.set(t.id, t);
    return m;
  }, [game.data]);

  if (game.isPending || hunt.isPending) return <Skeleton className="h-64 w-full" />;
  if (game.isError || hunt.isError || !game.data || !hunt.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        Não deu para abrir o modo caçada.
      </p>
    );
  }
  const g = game.data;
  const h = hunt.data;
  const currentIdx = h.stages.find((s) => !s.done && !s.complete)?.index;
  const current = h.stages.find((s) => s.index === currentIdx);
  const syncing = h.syncing || sync.isPending;
  const missablesNow = current?.missables.length ? current.missables : h.missables_overview;

  return (
    <section className="flex flex-col gap-5">
      <Link to={`/games/${gameId}`} className="label no-underline hover:text-neon-cyan">
        ← {g.title}
      </Link>

      <header className="panel hunt-head flex flex-wrap items-center gap-4">
        <ProgressRing value={g.progress.completion_pct * 100} size={72} strokeWidth={8} platinum={g.progress.platinum_earned} />
        <div className="min-w-0 flex-1">
          <span className="kicker label">Modo caçada</span>
          <h2 className="m-0 truncate font-display text-h3 font-bold uppercase text-text-1">{g.title}</h2>
          <p className="m-0 text-sm text-text-2">
            {g.progress.earned}/{g.progress.total} · faltam {g.progress.remaining}
            {ready && h.stages.length > 0 && ` · etapa ${(currentIdx ?? h.stages.length - 1) + 1} de ${h.stages.length}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button variant="secondary" size="sm" onClick={() => syncNow()} disabled={syncing}>
            {syncing ? "Sincronizando…" : "Sincronizar este jogo"}
          </Button>
          <span aria-live="polite" className="text-caption text-text-3">
            {syncing ? "Buscando troféus novos…" : ready ? "Sincroniza sozinho a cada 10 min com a tela aberta." : ""}
          </span>
        </div>
      </header>

      {ready && missablesNow.length > 0 && (
        <div className="hunt-missables" role="note">
          <span className="label">{current?.missables.length ? `Perdíveis desta etapa` : "Perdíveis do jogo"}</span>
          <p className="m-0 text-sm text-text-1">{missablesNow.join(" · ")}</p>
        </div>
      )}

      {!ready ? (
        <div className="flex flex-col gap-3">
          <p className="m-0 text-sm text-text-2">
            O modo caçada usa o roadmap da IA como checklist. Gere o roadmap deste jogo para começar.
          </p>
          <RoadmapPanel gameId={gameId} platform={g.platform} />
        </div>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {h.stages.map((s) => (
            <StageCard
              key={s.index}
              stage={s}
              trophies={trophies}
              current={s.index === currentIdx}
              pending={setStage.isPending}
              onToggle={(done) => setStage.mutate({ index: s.index, done })}
            />
          ))}
        </ol>
      )}
      {setStage.isError && (
        <p role="alert" className="text-sm text-danger">
          Não deu para salvar a etapa. Tente de novo.
        </p>
      )}
    </section>
  );
}
