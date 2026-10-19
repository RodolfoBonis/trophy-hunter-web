import { sectionIdx } from "@/layout/nav";
import { Link } from "react-router";
import type { TimelineItem } from "@/api/schemas";
import { LoadMore } from "@/components/LoadMore";
import { GameCover } from "@/design-system/components/GameCover";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { SectionHead } from "@/design-system/components/SectionHead";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { useTimeline } from "@/features/dashboard/queries";

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((new Date(today.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86_400_000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "");
}

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Marco: o desbloqueio que fechou um jogo (platina / 100%) vira um "momento". */
function Moment({ item }: { item: TimelineItem }) {
  const isPsn = item.platform === "psn";
  return (
    <li className="panel hero-stat game-hero !p-0" style={{ ["--panel-bg" as string]: "linear-gradient(120deg, rgb(184 169 255 / .18), var(--color-surface-1) 45%)" }}>
      <div className="game-hero-art" aria-hidden>
        <GameCover variant="hero" cover={item.cover} hero={item.hero} title={item.game_title} platform={item.platform} externalId={item.external_id} />
      </div>
      <Link to={`/games/${item.game_id}`} className="relative z-[1] flex items-center gap-5 p-6 text-text-1 no-underline">
        <span className="moment-glyph grid size-16 shrink-0 place-items-center">
          <TrophyIcon type={isPsn ? "platinum" : "achievement"} size={56} />
        </span>
        <span className="min-w-0">
          <span className="label !text-[var(--color-plat-3)]">
            {isPsn ? "Platina conquistada" : "100% concluído"} · {time(item.earned_at!)}
          </span>
          <span className="mt-1 block truncate font-display text-h3 font-bold uppercase leading-tight">{item.game_title}</span>
          <span className="caption">
            Último: {item.name} · conta {item.account_label}
          </span>
        </span>
      </Link>
    </li>
  );
}

function Unlock({ item }: { item: TimelineItem }) {
  return (
    <li className="trow unlocked">
      <div className="ticon">
        {item.icon ? <img className="ticon-img" src={item.icon} alt="" loading="lazy" /> : <TrophyIcon type={item.type} size={30} />}
        {item.icon && (
          <span className="ticon-type">
            <TrophyIcon type={item.type} size={14} />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="tt">{item.name}</div>
        {item.description && <div className="td">{item.description}</div>}
        <div className="tm">
          <span className="unlock-date">
            <svg aria-hidden>
              <use href="#i-check" />
            </svg>
            {time(item.earned_at!)}
          </span>
          <Link to={`/games/${item.game_id}`} className="no-underline hover:text-neon-cyan">
            {item.game_title}
          </Link>
          <span className="chip !px-1.5 !py-1">{item.account_label}</span>
        </div>
      </div>
      <div className="right">
        <PlatformBadge platform={item.platform} />
        {item.rarity_pct != null && <RarityBadge pct={item.rarity_pct} mini />}
      </div>
    </li>
  );
}

/** Linha do tempo — desbloqueios por dia (todas as contas); platinas/100% viram momentos. */
export default function TimelinePage() {
  const query = useTimeline();
  const items = query.data?.pages.flatMap((p) => p.items).filter((i) => i.earned_at) ?? [];
  const days: { key: string; label: string; items: TimelineItem[] }[] = [];
  for (const it of items) {
    const key = dayKey(it.earned_at!);
    let day = days.at(-1);
    if (!day || day.key !== key) {
      day = { key, label: dayLabel(it.earned_at!), items: [] };
      days.push(day);
    }
    day.items.push(it);
  }

  return (
    <section className="flex flex-col gap-6">
      <SectionHead idx={sectionIdx("/timeline")} title="Linha do tempo" subtitle="Suas conquistas por data — cada platina ou 100% vira um momento." />
      {query.isPending && <div className="skel chamfer-md h-64" aria-busy="true" />}
      {query.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar a linha do tempo.
        </p>
      )}
      {query.data && items.length === 0 && <p className="text-sm text-text-2">Nenhum desbloqueio com data ainda.</p>}
      {days.map((day) => (
        <div key={day.key} className="grid gap-3 md:grid-cols-[150px_1fr]">
          <div className="md:sticky md:top-20 md:self-start">
            <span className="block font-display text-lg font-bold uppercase tracking-[0.04em] text-text-1">{day.label}</span>
            <span className="caption">
              {day.items.length} {day.items.length === 1 ? "desbloqueio" : "desbloqueios"}
            </span>
          </div>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {day.items.map((it) => (
              <div key={it.trophy_id} className="contents">
                {it.completes_game && <Moment item={it} />}
                <Unlock item={it} />
              </div>
            ))}
          </ul>
        </div>
      ))}
      <LoadMore hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} fetchNextPage={query.fetchNextPage} />
    </section>
  );
}
