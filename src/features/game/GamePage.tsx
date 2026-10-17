import { ArrowLeft, Check, Eye, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import type { Trophy, TrophyType } from "@/api/schemas";
import { GameCover } from "@/design-system/components/GameCover";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { Panel } from "@/design-system/components/Panel";
import { ProgressRing } from "@/design-system/components/ProgressRing";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGame } from "./queries";

const TYPE_LABEL: Record<TrophyType, string> = {
  platinum: "Platina",
  gold: "Ouro",
  silver: "Prata",
  bronze: "Bronze",
  achievement: "Conquista",
};

function TrophyRow({ trophy }: { trophy: Trophy }) {
  const [revealed, setRevealed] = useState(false);
  const earned = trophy.earned;
  // Spoiler guard: troféu oculto e não conquistado fica borrado até clique explícito.
  const spoiler = trophy.hidden && !earned && !revealed;

  return (
    <li
      className={cn(
        "chamfer-md relative grid grid-cols-[52px_1fr] items-center gap-3 bg-surface-2 px-4 py-3 sm:grid-cols-[52px_1fr_auto] sm:gap-4",
        earned && "bg-[linear-gradient(90deg,rgb(245_197_66/0.08),transparent_40%),var(--color-surface-2)]",
      )}
    >
      {earned && <span className="absolute inset-y-2.5 left-0 w-[2px] bg-trophy-gold" aria-hidden />}
      <div
        className={cn(
          "chamfer-sm relative grid size-[52px] place-items-center bg-bg-1",
          !earned && "[&_svg]:opacity-40 [&_svg]:grayscale",
        )}
      >
        <TrophyIcon type={trophy.type} size={34} />
        {!earned && (
          <Lock className="absolute bottom-1 right-1 size-3.5 text-text-3" aria-hidden />
        )}
      </div>

      <div className="relative min-w-0">
        {/* Spoiler guard: todo o bloco (nome, descrição, tipo, tags) borra junto; raridade e
            estado "bloqueado" seguem visíveis. Ao revelar, o blur sai com animação (reduced-motion
            zera a duração). */}
        <div
          aria-hidden={spoiler}
          className={cn(
            "transition-[filter] duration-[var(--dur-base)] ease-[var(--ease-out)]",
            spoiler && "pointer-events-none select-none blur-[7px]",
          )}
        >
          <p className="text-[15px] font-semibold leading-snug text-text-1">{trophy.name}</p>
          {trophy.description && (
            <p className="mt-0.5 text-[13px] leading-snug text-text-2">{trophy.description}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-caption text-text-3">
            <span className="hud-label">{TYPE_LABEL[trophy.type]}</span>
            {(trophy.tags ?? []).map((t) => (
              <span key={t} className="chamfer-sm bg-surface-3 px-1.5 py-0.5 text-[11px] text-text-2">
                {t}
              </span>
            ))}
          </div>
        </div>
        {spoiler && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="chamfer-sm absolute inset-0 m-auto inline-flex h-fit w-fit items-center gap-1.5 border border-border-strong bg-bg-0/85 px-3 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.1em] text-neon-cyan"
          >
            <Eye className="size-3.5" aria-hidden /> Clique para revelar
          </button>
        )}
      </div>

      <div className="col-start-2 flex flex-row flex-wrap items-center gap-2 sm:col-start-auto sm:flex-col sm:items-end sm:gap-1.5">
        {earned ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-success">
            <Check className="size-3.5" aria-hidden />
            {trophy.earned_at ? new Date(trophy.earned_at).toLocaleDateString("pt-BR") : "Desbloqueado"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-text-3">
            <Lock className="size-3.5" aria-hidden /> Bloqueado
          </span>
        )}
        {trophy.rarity_pct != null && <RarityBadge pct={trophy.rarity_pct} mini />}
      </div>

    </li>
  );
}

/** Página do jogo — HUD. Cabeçalho com anel + troféus agrupados (base vs DLC) e spoiler guard. */
export default function GamePage() {
  const { gameId = "" } = useParams();
  const query = useGame(gameId);

  return (
    <section className="flex flex-col gap-5">
      <Link to="/library" className="inline-flex items-center gap-1 text-sm text-text-2 hover:text-text-1">
        <ArrowLeft className="size-4" aria-hidden /> Biblioteca
      </Link>

      {query.isPending && <Skeleton className="h-28 w-full" />}
      {query.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar o jogo.
        </p>
      )}

      {query.data && (
        <>
          <Panel className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="chamfer-sm hidden w-20 shrink-0 overflow-hidden sm:block" style={{ aspectRatio: "3 / 4" }}>
                <GameCover
                  cover={query.data.cover}
                  title={query.data.title}
                  platform={query.data.platform}
                  externalId={query.data.external_id}
                />
              </div>
              <div className="flex flex-col gap-2">
                <PlatformBadge platform={query.data.platform} />
                <h2 className="font-display text-h3 font-bold uppercase tracking-[0.02em] text-text-1">
                  {query.data.title}
                </h2>
                <p className="font-numeric text-sm tabular-nums text-text-2">
                  {query.data.progress.earned}/{query.data.progress.total} troféus
                  {query.data.progress.platinum_earned ? " · Platinado" : ""}
                </p>
              </div>
            </div>
            <ProgressRing
              value={Math.round(query.data.progress.completion_pct * 100)}
              size={96}
              strokeWidth={10}
              platinum={query.data.progress.platinum_earned}
              color={query.data.platform === "steam" ? "var(--color-steam)" : "var(--color-neon-cyan)"}
            />
          </Panel>

          {query.data.groups.map((group) => {
            if (group.trophies.length === 0) return null;
            return (
              <div key={group.id} className="flex flex-col gap-2">
                <h3 className="hud-label">
                  {group.name} {group.is_base ? "" : "· DLC"}
                </h3>
                <ul className="flex flex-col gap-2">
                  {group.trophies.map((t) => (
                    <TrophyRow key={t.id} trophy={t} />
                  ))}
                </ul>
              </div>
            );
          })}

          {query.data.groups.every((g) => g.trophies.length === 0) && (
            <p className="text-sm text-text-2">Nenhum troféu sincronizado ainda para este jogo.</p>
          )}
        </>
      )}
    </section>
  );
}
