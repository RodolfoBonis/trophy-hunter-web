import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import type {
  GameAccount,
  GameDetail,
  Platform,
  Trophy,
  TrophyType,
} from "@/api/schemas";
import { GameCover } from "@/design-system/components/GameCover";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { ProgressRing } from "@/design-system/components/ProgressRing";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { cn } from "@/lib/utils";
import { ChatPanel } from "@/features/ai/ChatPanel";
import { RoadmapPanel, TrophyGuidePanel } from "@/features/ai/AIGuides";
import { CrossPlatform } from "./CrossPlatform";
import { GameAnnotations, TAG_LABEL, TrophyMarks } from "./GameAnnotations";
import { useGame } from "./queries";

const TYPE_LABEL: Record<TrophyType, string> = {
  platinum: "Platina",
  gold: "Ouro",
  silver: "Prata",
  bronze: "Bronze",
  achievement: "Conquista",
};

type Show = "all" | "missing" | "earned";
type Order = "default" | "rarity" | "recent";

function Glyph({ id, size }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} aria-hidden>
      <use href={`#${id}`} />
    </svg>
  );
}

/** Data de desbloqueio como no tile: "12 out 2026 · 21:47". */
function unlockedAt(iso: string): string {
  const d = new Date(iso);
  const date = d
    .toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(".", "");
  const time = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

/**
 * Ícone da linha (`.ticon` do tile): o ícone REAL da conquista/troféu com o glifo do tipo no canto;
 * bloqueado → ícone de bloqueio da plataforma (ou o ícone dessaturado) + cadeado; sem ícone → glifo.
 */
function TrophyArt({ trophy, spoiler }: { trophy: Trophy; spoiler: boolean }) {
  const [broken, setBroken] = useState(false);
  const src = trophy.earned ? trophy.icon : trophy.icon_locked || trophy.icon;
  const showImg = Boolean(src) && !broken;
  return (
    <div className="ticon">
      {showImg ? (
        <>
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
            className={cn(
              "ticon-img",
              !trophy.earned && !trophy.icon_locked && "dim",
              spoiler && "spoiled",
            )}
          />
          <span className="ticon-type">
            <TrophyIcon type={trophy.type} size={14} />
          </span>
        </>
      ) : (
        <TrophyIcon type={trophy.type} size={34} />
      )}
      {!trophy.earned && (
        <svg
          className="lock"
          style={{ color: "var(--color-text-2)" }}
          aria-hidden
        >
          <use href="#i-lock" />
        </svg>
      )}
    </div>
  );
}

/** Linha de troféu do style tile (`.trow`): obtido / bloqueado / oculto (spoiler guard). */
function TrophyRow({ trophy }: { trophy: Trophy }) {
  const [revealed, setRevealed] = useState(false);
  const [marking, setMarking] = useState(false);
  const [guide, setGuide] = useState(false);
  const hidden = trophy.hidden && !trophy.earned;
  const spoiler = hidden && !revealed;
  const progress =
    trophy.progress != null && trophy.target != null && !trophy.earned
      ? ` · ${trophy.progress}/${trophy.target}`
      : "";

  const status = trophy.earned ? (
    <span className="unlock-date">
      <Glyph id="i-check" />
      {trophy.earned_at
        ? `Desbloqueado em ${unlockedAt(trophy.earned_at)}`
        : "Desbloqueado"}
    </span>
  ) : hidden ? (
    <span className="status-locked">
      <Glyph id="i-eye" size={12} />
      {trophy.type === "achievement" ? "Conquista oculta" : "Troféu oculto"} ·
      pode conter spoiler
    </span>
  ) : (
    <span className="status-locked">
      <Glyph id="i-lock" size={12} />
      Bloqueado{progress}
    </span>
  );

  return (
    <li
      id={`trophy-${trophy.id}`}
      className={cn(
        "trow",
        trophy.earned ? "unlocked" : "locked",
        hidden && "hidden-t",
        revealed && "revealed",
      )}
    >
      <TrophyArt trophy={trophy} spoiler={spoiler} />
      <div className="relative min-w-0">
        {hidden ? (
          <>
            <div className="spoil" aria-hidden={spoiler}>
              <div className="tt">{trophy.name}</div>
              {trophy.description && (
                <div className="td">{trophy.description}</div>
              )}
            </div>
            <div className="tm">{status}</div>
            {spoiler && (
              <button
                className="reveal-btn"
                type="button"
                onClick={() => setRevealed(true)}
              >
                <Glyph id="i-eye" />
                Clique para revelar
              </button>
            )}
          </>
        ) : (
          <>
            <div className="tt">{trophy.name}</div>
            {trophy.description && (
              <div className="td">{trophy.description}</div>
            )}
            <div className="tm">
              {status}
              {(trophy.tags ?? []).map((t) => (
                <span key={t} className="chip !px-1.5 !py-1 !text-warning">
                  {TAG_LABEL[t]}
                </span>
              ))}
              {trophy.server_shutdown_risk && (
                <span className="chip !px-1.5 !py-1 !text-danger">
                  Servidor pode fechar
                </span>
              )}
            </div>
          </>
        )}
      </div>
      <div className="right">
        {trophy.rarity_pct != null && (
          <RarityBadge pct={trophy.rarity_pct} mini />
        )}
        <span className="flex gap-3">
          <button
            type="button"
            className="label inline-flex cursor-pointer items-center gap-1 hover:!text-neon-violet-text"
            aria-expanded={guide}
            aria-label={`Guia de IA: ${spoiler ? "troféu oculto" : trophy.name}`}
            onClick={() => setGuide((g) => !g)}
          >
            <Glyph id="i-ai" size={12} />
            Guia
          </button>
          {!trophy.earned && (
            <button
              type="button"
              className="label cursor-pointer hover:!text-neon-cyan"
              aria-expanded={marking}
              onClick={() => setMarking((m) => !m)}
            >
              Marcar
            </button>
          )}
        </span>
      </div>
      {guide && (
        <div className="col-span-full mt-3">
          <TrophyGuidePanel trophyId={trophy.id} />
        </div>
      )}
      {marking && (
        <div className="col-span-full">
          <TrophyMarks
            trophyId={trophy.id}
            tags={trophy.tags ?? []}
            serverRisk={trophy.server_shutdown_risk ?? false}
            onClose={() => setMarking(false)}
          />
        </div>
      )}
    </li>
  );
}

/** Contas com o jogo, lado a lado; a atual marcada com aria-current (não só cor). */
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
  return (
    <nav aria-label="Contas com este jogo" className="flex flex-col gap-2">
      <span className="label">
        Contas ({accounts.length}) · mais avançada primeiro
      </span>
      <ul className="m-0 flex list-none gap-3 overflow-x-auto p-0 pb-1">
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
                  "panel sm flex min-w-[220px] items-center gap-3 no-underline",
                  !current && "opacity-70 hover:opacity-100",
                )}
              >
                <ProgressRing
                  value={pct}
                  size={44}
                  color={
                    platform === "steam" ? "var(--color-steam)" : undefined
                  }
                />
                <span className="flex min-w-0 flex-col">
                  <span className="font-display text-sm font-bold uppercase tracking-[0.04em] text-text-1">
                    {a.label}
                    {i === 0 && (
                      <span className="ml-2 text-[10px] text-neon-cyan">
                        ★ melhor
                      </span>
                    )}
                  </span>
                  <span className="caption tabular-nums">
                    {a.progress.earned}/{a.progress.total} · {pct}%
                    {current ? " · aberta" : ""}
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

/** Tiers de raridade (cortes do style tile), do mais raro ao mais comum. */
const RARITY_TIERS = [
  { key: "legendary", label: "Lendárias", range: "< 1%", lo: 0, hi: 1 },
  { key: "epic", label: "Épicas", range: "1–5%", lo: 1, hi: 5 },
  { key: "rare", label: "Raras", range: "5–20%", lo: 5, hi: 20 },
  { key: "uncommon", label: "Incomuns", range: "20–50%", lo: 20, hi: 50 },
  { key: "common", label: "Comuns", range: "≥ 50%", lo: 50, hi: Infinity },
] as const;

/**
 * Statline do hero (tile `.statline`). Raridade para as duas plataformas: troféus ganhos/total em
 * cada tier (lendário → comum), com a cor e o glifo do tier. No PSN, antes, a linha por tipo
 * (platina/ouro/prata/bronze). "Conquistas" e "Faltam" já aparecem abaixo do título.
 */
function StatLine({ game }: { game: GameDetail }) {
  const all = game.groups
    .flatMap((g) => g.trophies)
    .filter((t) => t.rarity_pct != null);
  const tiers = RARITY_TIERS.map((tier) => {
    const inTier = all.filter(
      (t) => t.rarity_pct! >= tier.lo && t.rarity_pct! < tier.hi,
    );
    return {
      ...tier,
      total: inTier.length,
      earned: inTier.filter((t) => t.earned).length,
    };
  }).filter((t) => t.total > 0);

  const by = game.progress.by_type ?? {};
  const types =
    game.platform === "psn"
      ? (
          [
            ["platinum", "t-plat"],
            ["gold", "t-gold"],
            ["silver", "t-silver"],
            ["bronze", "t-bronze"],
          ] as const
        ).filter(([type]) => (by[type]?.total ?? 0) > 0)
      : [];

  return (
    <div className="flex flex-col gap-4">
      {types.length > 0 && (
        <div className="statline !mt-0">
          {types.map(([type, cls]) => (
            <div key={type} className={cls}>
              <span className="num">
                {by[type]!.earned}/{by[type]!.total}
              </span>
              <span className="caption">{TYPE_LABEL[type]}</span>
            </div>
          ))}
        </div>
      )}
      {tiers.length > 0 && (
        <div
          className="statline rarity-line !mt-0"
          aria-label="Conquistas por raridade (ganhas/total)"
        >
          {tiers.map((t) => (
            <div
              key={t.key}
              style={{ ["--rc" as string]: `var(--color-rarity-${t.key})` }}
            >
              <span className="num">
                {t.earned}
                <small>/{t.total}</small>
              </span>
              <span className="caption inline-flex items-center gap-1">
                <svg width={11} height={11} aria-hidden>
                  <use href={`#r-${t.key}`} />
                </svg>
                {t.label} <span className="opacity-70">{t.range}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Tab = "trophies" | "roadmap" | "chat";
const TABS: [Tab, string][] = [
  ["trophies", "Troféus"],
  ["roadmap", "Roadmap IA"],
  ["chat", "Chat IA"],
];

const SHOW: [Show, string][] = [
  ["all", "Todos"],
  ["missing", "Faltando"],
  ["earned", "Obtidos"],
];
const ORDER: [Order, string][] = [
  ["default", "Padrão"],
  ["rarity", "Mais comuns"],
  ["recent", "Recentes"],
];

/** Página do jogo — hero do tile, contas lado a lado, filtros e linhas de troféu `.trow`. */
export default function GamePage() {
  const { gameId = "" } = useParams();
  const query = useGame(gameId);
  const [show, setShow] = useState<Show>("all");
  const [order, setOrder] = useState<Order>("default");
  const [tab, setTab] = useState<Tab>("trophies");
  const { hash } = useLocation();

  // Troféu aberto pela paleta (#trophy-<id>): mostra a lista completa, rola até ele e destaca.
  useEffect(() => {
    if (!hash.startsWith("#trophy-") || !query.data) return;
    setTab("trophies");
    setShow("all");
    const t = window.setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (!el) return;
      el.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
      el.classList.remove("is-target");
      void el.offsetWidth; // reinicia a animação se o mesmo troféu for aberto de novo
      el.classList.add("is-target");
    }, 50);
    return () => window.clearTimeout(t);
  }, [hash, query.data]);

  const groups = useMemo(() => {
    if (!query.data) return [];
    return query.data.groups.map((g) => {
      let ts = g.trophies.filter((t) =>
        show === "all" ? true : show === "earned" ? t.earned : !t.earned,
      );
      if (order === "rarity")
        ts = [...ts].sort(
          (a, b) => (b.rarity_pct ?? -1) - (a.rarity_pct ?? -1),
        );
      if (order === "recent")
        ts = [...ts].sort((a, b) =>
          (b.earned_at ?? "").localeCompare(a.earned_at ?? ""),
        );
      return { ...g, shown: ts };
    });
  }, [query.data, show, order]);

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="skel chamfer-md h-56 w-full" />
        <div className="skel chamfer-sm h-16 w-full" />
        <div className="skel chamfer-sm h-16 w-full" />
      </div>
    );
  }
  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        Não foi possível carregar o jogo.
      </p>
    );
  }

  const game = query.data;
  const isPsn = game.platform === "psn";
  const complete =
    game.progress.total > 0 && game.progress.earned === game.progress.total;
  const shownCount = groups.reduce((n, g) => n + g.shown.length, 0);

  return (
    <section className="flex flex-col gap-6">
      <Link
        to="/library"
        className="label inline-flex w-fit items-center gap-2 no-underline hover:!text-text-1"
      >
        ← Biblioteca
      </Link>

      <div className="panel hero-stat game-hero !p-0">
        {/* Arte do jogo como fundo do card: nítida, com pouca opacidade e esmaecendo em gradiente
            (topo no celular, direita no desktop). Fica acima do ::before do painel e abaixo do texto. */}
        <div className="game-hero-art" aria-hidden>
          <GameCover
            variant="hero"
            cover={game.cover}
            hero={game.hero}
            title={game.title}
            platform={game.platform}
            externalId={game.external_id}
          />
        </div>
        <div className="game-hero-body">
          <div
            className="game-hero-thumb chamfer-md hidden w-56 overflow-hidden shadow-[0_12px_40px_rgb(0_0_0/0.5)] md:block"
            style={{
              aspectRatio: "16 / 10",
              viewTransitionName: `game-art-${game.id}`,
            }}
          >
            <GameCover
              variant="hero"
              cover={game.cover}
              hero={game.hero}
              title={game.title}
              platform={game.platform}
              externalId={game.external_id}
            />
          </div>
          <div className="game-hero-info min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <PlatformBadge platform={game.platform} />
              {game.accounts.length > 1 && (
                <span className="chip">Conta: {game.account_label}</span>
              )}
              {complete && (
                <span className="chip !text-[var(--color-plat-3)]">
                  {isPsn ? "Platinado" : "100%"}
                </span>
              )}
            </div>
            <h2 className="mt-3 font-display text-h2 font-bold uppercase leading-none tracking-[0.02em] text-text-1 [text-shadow:0_2px_16px_rgb(0_0_0/0.6)]">
              {game.title}
            </h2>
            <p className="muted mt-2">
              <span className="num text-text-1">{game.progress.earned}</span>/
              {game.progress.total} {isPsn ? "troféus" : "conquistas"}
              {game.progress.remaining > 0
                ? ` · faltam ${game.progress.remaining}`
                : ""}
              {game.progress.dlc && game.progress.dlc.total > 0
                ? ` · ${game.progress.dlc.total} em DLC`
                : ""}
            </p>
          </div>
          <div className="game-hero-stats">
            <StatLine game={game} />
          </div>
          <ProgressRing
            value={game.progress.completion_pct * 100}
            platinum={complete}
            color={isPsn ? undefined : "var(--color-steam)"}
            className="game-hero-ring"
          />
        </div>
      </div>

      <AccountSwitcher
        accounts={game.accounts}
        currentGameId={game.id}
        platform={game.platform}
      />

      <CrossPlatform game={game} />

      <GameAnnotations game={game} />

      <div
        className="seg self-start"
        role="tablist"
        aria-label="Seções do jogo"
      >
        {TABS.map(([v, l]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={tab === v}
            aria-pressed={tab === v}
            onClick={() => setTab(v)}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "roadmap" && (
        <RoadmapPanel gameId={game.id} platform={game.platform} />
      )}
      {tab === "chat" && <ChatPanel gameId={game.id} />}

      {tab === "trophies" && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="seg" role="group" aria-label="Mostrar">
              <span className="seg-l" aria-hidden>
                Mostrar
              </span>
              {SHOW.map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={show === v}
                  onClick={() => setShow(v)}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="seg" role="group" aria-label="Ordenar">
              <span className="seg-l" aria-hidden>
                Ordenar
              </span>
              {ORDER.map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={order === v}
                  onClick={() => setOrder(v)}
                >
                  {l}
                </button>
              ))}
            </div>
            <span className="caption ml-auto tabular-nums">
              {shownCount} exibidos
            </span>
          </div>

          {groups.map((group) => {
            if (group.trophies.length === 0 || group.shown.length === 0)
              return null;
            const earned = group.trophies.filter((t) => t.earned).length;
            return (
              <div key={group.id} className="flex flex-col gap-3">
                <h3 className="sub !mb-0 flex items-baseline gap-3">
                  {group.is_base ? "Jogo base" : group.name}
                  {!group.is_base && <span className="chip">DLC</span>}
                  <span className="caption tabular-nums">
                    {earned}/{group.trophies.length}
                  </span>
                </h3>
                <ul className="m-0 list-none p-0">
                  {group.shown.map((t) => (
                    <TrophyRow key={t.id} trophy={t} />
                  ))}
                </ul>
              </div>
            );
          })}

          {game.groups.every((g) => g.trophies.length === 0) && (
            <p className="text-sm text-text-2">
              Nenhum troféu sincronizado ainda para este jogo.
            </p>
          )}
        </>
      )}
    </section>
  );
}
