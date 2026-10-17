import { ArrowLeft, Check, Eye, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import type { GameAccount, Platform, Trophy, TrophyType } from "@/api/schemas";
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

/**
 * Ícone REAL da conquista/troféu (Steam/PSN) com o glifo do tipo no canto. Bloqueado: ícone de
 * bloqueio da plataforma (icon_locked) ou o ícone dessaturado + cadeado. Sem ícone (ou 404) → glifo.
 * Com o spoiler guard ativo, o ícone também fica borrado (alguns ícones entregam o segredo).
 */
function TrophyArt({ trophy, spoiler }: { trophy: Trophy; spoiler: boolean }) {
  const [broken, setBroken] = useState(false);
  const earned = trophy.earned;
  const src = earned ? trophy.icon : trophy.icon_locked || trophy.icon;
  const desaturate = !earned && !trophy.icon_locked;
  return (
    <div className="chamfer-sm relative grid size-[52px] place-items-center overflow-hidden bg-bg-1">
      {src && !broken ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className={cn(
            "size-full object-cover transition-[filter] duration-[var(--dur-base)]",
            desaturate && "opacity-50 grayscale",
            spoiler && "blur-[5px]",
          )}
        />
      ) : (
        <span className={cn(!earned && "opacity-40 grayscale")}>
          <TrophyIcon type={trophy.type} size={34} />
        </span>
      )}
      {src && !broken && (
        <span className="absolute left-0.5 top-0.5 rounded-sm bg-bg-0/80 p-px" aria-hidden>
          <TrophyIcon type={trophy.type} size={14} />
        </span>
      )}
      {!earned && <Lock className="absolute bottom-1 right-1 size-3.5 text-text-1 drop-shadow" aria-hidden />}
    </div>
  );
}

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
      <TrophyArt trophy={trophy} spoiler={spoiler} />

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

/**
 * Contas que possuem o jogo, lado a lado (≥ lg: cards com anel; < lg: abas compactas). Cada conta é
 * uma linha do jogo na API: selecionar navega para /games/{game_id} daquela conta (URL compartilhável).
 * A conta da página atual fica marcada (aria-current), não só por cor.
 */
function AccountSwitcher({
  accounts,
  currentGameId,
  platform,
}: {
  accounts: GameAccount[];
  currentGameId: string;
  platform: Platform;
}) {
  if (accounts.length < 2) return null;
  const color = platform === "steam" ? "var(--color-steam)" : "var(--color-neon-cyan)";
  return (
    <nav aria-label="Contas com este jogo" className="flex flex-col gap-2">
      <h3 className="hud-label">Contas ({accounts.length}) · mais avançada primeiro</h3>
      <ul className="flex gap-2 overflow-x-auto lg:grid lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] lg:overflow-visible">
        {accounts.map((a, i) => {
          const current = a.game_id === currentGameId;
          const pct = Math.round(a.progress.completion_pct * 100);
          return (
            <li key={a.integration_id} className="shrink-0">
              <Link
                to={`/games/${a.game_id}`}
                replace
                aria-current={current ? "page" : undefined}
                className={cn(
                  "chamfer-sm flex items-center gap-3 border bg-surface-2 px-3 py-2 transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan",
                  current ? "border-neon-cyan text-text-1" : "border-transparent text-text-2 hover:text-text-1",
                )}
              >
                <span className="hidden lg:block">
                  <ProgressRing value={pct} size={44} strokeWidth={8} color={color} />
                </span>
                <span className="flex flex-col">
                  <span className="font-display text-sm font-semibold uppercase tracking-[0.04em]">
                    {a.label}
                    {i === 0 && <span className="ml-2 text-[10px] text-neon-cyan">★ melhor</span>}
                  </span>
                  <span className="font-numeric text-xs tabular-nums text-text-3">
                    {a.progress.earned}/{a.progress.total} · {pct}%
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
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
          <Panel className="relative isolate flex flex-wrap items-center justify-between gap-5 overflow-hidden">
            {/* Fundo hero: a arte horizontal desfocada e escurecida (mesma família visual do card). */}
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
              <div className="absolute inset-[-10%] scale-110 opacity-45 blur-2xl saturate-150">
                <GameCover
                  variant="hero"
                  cover={query.data.cover}
                  hero={query.data.hero}
                  title={query.data.title}
                  platform={query.data.platform}
                  externalId={query.data.external_id}
                />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-surface-1)_20%,color-mix(in_oklab,var(--color-surface-1)_70%,transparent))]" />
            </div>
            <div className="flex items-center gap-5">
              <div
                className="chamfer-sm hidden w-44 shrink-0 overflow-hidden shadow-[0_8px_30px_rgb(0_0_0/0.45)] sm:block"
                style={{ aspectRatio: "16 / 10", viewTransitionName: `game-art-${query.data.id}` }}
              >
                <GameCover
                  variant="hero"
                  cover={query.data.cover}
                  hero={query.data.hero}
                  title={query.data.title}
                  platform={query.data.platform}
                  externalId={query.data.external_id}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <PlatformBadge platform={query.data.platform} />
                  {query.data.accounts.length > 1 && (
                    <span className="hud-label text-text-2">Conta: {query.data.account_label}</span>
                  )}
                </div>
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
              size={112}
              strokeWidth={10}
              platinum={query.data.progress.platinum_earned}
              color={query.data.platform === "steam" ? "var(--color-steam)" : "var(--color-neon-cyan)"}
            />
          </Panel>

          <AccountSwitcher
            accounts={query.data.accounts}
            currentGameId={query.data.id}
            platform={query.data.platform}
          />

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
