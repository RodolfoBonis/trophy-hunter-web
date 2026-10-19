import { sectionIdx } from "@/layout/nav";
import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Stats } from "@/api/schemas";
import { EvolutionChart } from "@/components/EvolutionChart";
import { GameCover } from "@/design-system/components/GameCover";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { ProgressBar } from "@/design-system/components/ProgressBar";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { SectionHead } from "@/design-system/components/SectionHead";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { useChallenges, useFeed, useSharing } from "@/features/social/queries";
import { FeedRow } from "@/features/social/SocialBits";
import { WeeklyRecapPanel } from "@/features/recap/WeeklyRecapPanel";
import { useAlerts, useNext, useStats } from "./queries";

const nf = new Intl.NumberFormat("pt-BR");

function shortDate(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
}

/** Hero do tile: kicker + título com contorno neon + painel hero-stat com o número grande. */
export function Hero({ stats, kicker = "Resumo · todas as contas" }: { stats: Stats; kicker?: string }) {
  const t = stats.trophies;
  const g = stats.games;
  const pct = t.total > 0 ? Math.round((t.earned / t.total) * 100) : 0;
  const psnTypes = t.platinum.total + t.gold.total + t.silver.total + t.bronze.total > 0;
  return (
    <div className="hero !pt-0">
      <div className="hero-grid">
        <div>
          <span className="kicker label">{kicker}</span>
          <h1>
            {nf.format(g.completed)} <span className="outline">{g.completed === 1 ? "jogo" : "jogos"}</span>
            <br />
            {g.completed === 1 ? "completo" : "completos"}
          </h1>
          <p className="lead">
            {nf.format(t.earned)} de {nf.format(t.total)} conquistas e troféus ({pct}%). Cada jogo conta uma vez, pela conta
            mais avançada.
          </p>
          <div className="stat-tiles">
            {(
              [
                ["Completos", g.completed, "var(--color-plat-2)"],
                ["Quase lá", g.almost, "var(--color-neon-cyan)"],
                ["Em andamento", g.in_progress, "var(--color-steam)"],
                ["Sem progresso", g.not_started, "var(--color-border)"],
                ["Abandonados", g.abandoned, "var(--color-text-3)"],
                ["Jogos", g.total, "var(--color-border)"],
              ] as const
            ).map(([label, value, color]) => (
              <div key={label} className="stat-tile" style={{ borderTopColor: color }}>
                <span className="num">{nf.format(value)}</span>
                <span className="caption">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel hero-stat">
          <span className="label">Desbloqueados</span>
          <div className="big mt-3">
            {nf.format(t.earned)}
            <small>/ {nf.format(t.total)}</small>
          </div>
          <div className="mt-4">
            <ProgressBar value={pct} />
          </div>
          {psnTypes && (
            <div className="statline">
              {(
                [
                  ["t-plat", "Platina", t.platinum],
                  ["t-gold", "Ouro", t.gold],
                  ["t-silver", "Prata", t.silver],
                  ["t-bronze", "Bronze", t.bronze],
                ] as const
              ).map(([cls, label, c]) => (
                <div key={cls} className={cls}>
                  <span className="num">{c.earned}</span>
                  <span className="caption">{label}</span>
                </div>
              ))}
            </div>
          )}
          <div className="statline rarity-line">
            {(
              [
                ["legendary", "Lendárias", t.rarity.legendary],
                ["epic", "Épicas", t.rarity.epic],
                ["rare", "Raras", t.rarity.rare],
                ["uncommon", "Incomuns", t.rarity.uncommon],
              ] as const
            ).map(([key, label, n]) => (
              <div key={key} style={{ ["--rc" as string]: `var(--color-rarity-${key})` }}>
                <span className="num">{nf.format(n)}</span>
                <span className="caption inline-flex items-center gap-1">
                  <svg width={11} height={11} aria-hidden>
                    <use href={`#r-${key}`} />
                  </svg>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Próximas platinas (top 3 da fila) com link para a fila completa. */
function NextTeaser() {
  const next = useNext();
  const items = next.data?.items.slice(0, 3) ?? [];
  return (
    <div className="panel flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="sub !mb-0">Próximas platinas</h3>
        <Link to="/next" className="label no-underline hover:!text-text-1">
          Ver fila →
        </Link>
      </div>
      {next.isPending && <div className="skel skel-line h-16 w-full" />}
      {items.length === 0 && !next.isPending && <p className="caption">Nenhum jogo em andamento.</p>}
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((it, i) => (
          <li key={it.game_id}>
            <Link to={`/games/${it.game_id}`} className="flex items-center gap-3 text-text-1 no-underline hover:[&_.t]:text-neon-cyan">
              <span className="num w-6 text-center text-xl text-neon-cyan">{i + 1}</span>
              <span className="chamfer-sm block w-20 shrink-0 overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
                <GameCover variant="hero" cover={it.cover} hero={it.hero} title={it.title} platform={it.platform} externalId={it.external_id} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="t block truncate font-display font-semibold">{it.title}</span>
                <span className="caption">
                  faltam {it.remaining} · {Math.round(it.completion_pct * 100)}%
                </span>
                <span className="mt-1 block">
                  <ProgressBar value={it.completion_pct * 100} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Conquistas mais raras já ganhas. `linkGames=false` no perfil de amigo (o jogo não é seu). */
export function Rarest({ stats, linkGames = true }: { stats: Stats; linkGames?: boolean }) {
  return (
    <div className="panel flex flex-col gap-3">
      <h3 className="sub !mb-0">Mais raras</h3>
      {stats.rarest.length === 0 && <p className="caption">Ainda sem dados de raridade.</p>}
      <ul className="m-0 list-none p-0">
        {stats.rarest.map((r) => (
          <li key={r.id} className="trow unlocked !py-2">
            <div className="ticon">
              {r.icon ? <img className="ticon-img" src={r.icon} alt="" loading="lazy" /> : <TrophyIcon type={r.type} size={30} />}
            </div>
            <div className="min-w-0">
              <div className="tt truncate">{r.name}</div>
              {linkGames ? (
                <Link to={`/games/${r.game_id}`} className="td block truncate no-underline hover:text-neon-cyan">
                  {r.game_title}
                </Link>
              ) : (
                <span className="td block truncate">{r.game_title}</span>
              )}
            </div>
            <div className="right">
              <RarityBadge pct={r.rarity_pct} mini />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Momentos: jogos completados (platina/100%), mais recentes primeiro. */
export function Moments({ stats, linkGames = true }: { stats: Stats; linkGames?: boolean }) {
  if (stats.completions.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="sub !mb-0">Momentos · platinas e 100%</h3>
      <ul className="m-0 grid list-none gap-4 p-0 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
        {stats.completions.map((c) => (
          <li key={c.game_id}>
            <MaybeLink to={linkGames ? `/games/${c.game_id}` : undefined} className="gcard is-plat no-underline">
              <div className="halo" aria-hidden />
              <div className="edge" aria-hidden />
              <div className="frame">
                <div className="cover !aspect-[16/8]">
                  <div className="art">
                    <GameCover variant="hero" cover={c.cover} hero={c.hero} title={c.title} platform={c.platform} externalId={c.external_id} />
                  </div>
                  <div className="fx" aria-hidden />
                  <PlatformBadge platform={c.platform} />
                </div>
                <div className="flex items-center gap-3 px-4 pb-4 pt-1">
                  <TrophyIcon type={c.platform === "psn" ? "platinum" : "achievement"} size={26} />
                  <span className="min-w-0">
                    <span className="block truncate font-display font-bold text-text-1">{c.title}</span>
                    <span className="caption">
                      {c.platform === "psn" ? "Platinado" : "100%"} · {shortDate(c.completed_at)}
                    </span>
                  </span>
                </div>
              </div>
            </MaybeLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MaybeLink({ to, className, children }: { to?: string; className: string; children: ReactNode }) {
  return to ? (
    <Link to={to} className={className}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );
}

/** Alertas: troféus perdíveis/online/dificuldade que ainda faltam. */
function Alerts() {
  const alerts = useAlerts();
  const items = alerts.data ?? [];
  if (items.length === 0) return null;
  return (
    <div className="banner">
      <span className="ic" aria-hidden>
        <svg>
          <use href="#i-warn" />
        </svg>
      </span>
      <div className="min-w-0">
        <strong>
          {items.length} {items.length === 1 ? "troféu precisa" : "troféus precisam"} de atenção
        </strong>
        <span>
          {items
            .slice(0, 3)
            .map((a) => `${a.hidden ? "Oculto" : a.name} (${a.game_title})`)
            .join(" · ")}
          {items.length > 3 ? " …" : ""} — perdíveis, online ou de dificuldade.
        </span>
      </div>
      <Link to="/next" className="label no-underline">
        Ver
      </Link>
    </div>
  );
}

/** Convites de desafio pendentes (só quem compartilha). */
function ChallengeInvites() {
  const sharing = useSharing();
  const q = useChallenges(sharing);
  const invites = (q.data ?? []).filter((c) => c.status === "open" && c.my_state === "invited");
  if (!sharing || invites.length === 0) return null;
  return (
    <div className="banner" role="status">
      <span className="ic" aria-hidden>
        <TrophyIcon type="platinum" size={26} />
      </span>
      <div className="min-w-0">
        <strong>
          {invites.length === 1 ? "Você foi desafiado" : `${invites.length} desafios esperando você`}
        </strong>
        <span>{invites.map((c) => c.title).join(" · ")}</span>
      </div>
      <Link to={invites.length === 1 ? `/friends/challenges/${invites[0]!.id}` : "/friends"} className="label no-underline">
        Ver
      </Link>
    </div>
  );
}

/** Atividade dos amigos (as 4 mais recentes) — só para quem compartilha. */
function FriendsActivity() {
  const sharing = useSharing();
  const feed = useFeed(sharing, 4);
  const items = (feed.data?.pages[0]?.items ?? []).filter((i) => !i.user.is_me);
  if (!sharing || items.length === 0) return null;
  return (
    <div className="panel flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="sub !mb-0">Atividade dos amigos</h3>
        <Link to="/friends" className="label no-underline hover:!text-text-1">
          Ver amigos →
        </Link>
      </div>
      <ul className="m-0 list-none p-0">
        {items.map((it) => (
          <FeedRow key={`${it.user.id}-${it.trophy_id}`} item={it} />
        ))}
      </ul>
    </div>
  );
}

/** Início — resumo no estilo do style tile. */
export default function DashboardPage() {
  const stats = useStats();
  return (
    <section className="flex flex-col gap-8">
      <SectionHead idx={sectionIdx("/")} title="Início" subtitle="Seu progresso em um relance." />
      {stats.isPending && (
        <div className="grid gap-6 md:grid-cols-2" aria-busy="true">
          <div className="skel chamfer-md h-72" />
          <div className="skel chamfer-md h-72" />
        </div>
      )}
      {stats.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar o resumo.
        </p>
      )}
      {stats.data && (
        <>
          <Hero stats={stats.data} />
          <ChallengeInvites />
          <WeeklyRecapPanel compact />
          <Alerts />
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="panel flex flex-col gap-3">
              <h3 className="sub !mb-0">Evolução</h3>
              <EvolutionChart data={stats.data.evolution} />
            </div>
            <NextTeaser />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <Rarest stats={stats.data} />
            <Moments stats={stats.data} />
          </div>
          <FriendsActivity />
        </>
      )}
    </section>
  );
}
