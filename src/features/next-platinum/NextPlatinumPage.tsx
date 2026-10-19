import { sectionIdx } from "@/layout/nav";
import { BacklogPanel } from "@/features/backlog/BacklogPanel";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { NextItem, RemainingTrophy } from "@/api/schemas";
import { GameCover } from "@/design-system/components/GameCover";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { ProgressBar } from "@/design-system/components/ProgressBar";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { SectionHead } from "@/design-system/components/SectionHead";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { formatHours } from "@/lib/hours";
import { cn } from "@/lib/utils";
import { useAlerts, useNext } from "@/features/dashboard/queries";

/** Fatores do ranking (máximos teóricos de cada peso, ver internal/ranking na API). */
const FACTORS = [
  { key: "completion", label: "Concluído", max: 0.45, color: "var(--color-neon-cyan)" },
  { key: "remaining", label: "Restantes", max: 0.25, color: "var(--color-steam)" },
  { key: "ease", label: "Facilidade", max: 0.3, color: "var(--color-success)" },
  { key: "priority", label: "Prioridade", max: 0.15, color: "var(--color-neon-violet)" },
  { key: "urgency", label: "Urgência", max: 0.05, color: "var(--color-warning)" },
  { key: "time", label: "Tempo", max: 0.1, color: "var(--color-plat-3)" },
] as const;

/** Filtros por tempo restante (HowLongToBeat). Jogo sem estimativa só aparece em "Todos". */
const TIME_FILTERS = [
  { key: "all", label: "Todos", max: Infinity },
  { key: "quick", label: "Platinas rápidas", max: 15, hint: "< 15 h" },
  { key: "weekend", label: "Cabe no fim de semana", max: 6, hint: "< 6 h" },
] as const;
type TimeFilter = (typeof TIME_FILTERS)[number]["key"];

/** Troféu que falta (linha `.trow` do tile), com spoiler guard para ocultos. */
function RemainingRow({ trophy }: { trophy: RemainingTrophy }) {
  const [revealed, setRevealed] = useState(false);
  const spoiler = trophy.hidden && !revealed;
  const src = trophy.icon_locked || trophy.icon;
  return (
    <li className={cn("trow locked", trophy.hidden && "hidden-t", revealed && "revealed")}>
      <div className="ticon">
        {src ? (
          <img className={cn("ticon-img", !trophy.icon_locked && "dim", spoiler && "spoiled")} src={src} alt="" loading="lazy" />
        ) : (
          <TrophyIcon type={trophy.type} size={30} />
        )}
      </div>
      <div className="relative min-w-0">
        <div className={cn(trophy.hidden && "spoil")} aria-hidden={spoiler}>
          <div className="tt">{trophy.name}</div>
          {trophy.description && <div className="td">{trophy.description}</div>}
        </div>
        {spoiler && (
          <button className="reveal-btn" type="button" onClick={() => setRevealed(true)}>
            <svg aria-hidden>
              <use href="#i-eye" />
            </svg>
            Clique para revelar
          </button>
        )}
      </div>
      <div className="right">{trophy.rarity_pct != null && <RarityBadge pct={trophy.rarity_pct} mini />}</div>
    </li>
  );
}

/** "O que fazer hoje": o 1º da fila com os troféus que faltam mais fáceis. */
function Today({ item, trophies }: { item: NextItem; trophies: RemainingTrophy[] }) {
  return (
    <div className="panel hero-stat game-hero !p-0">
      <div className="game-hero-art" aria-hidden>
        <GameCover variant="hero" cover={item.cover} hero={item.hero} title={item.title} platform={item.platform} externalId={item.external_id} />
      </div>
      <div className="relative z-[1] grid gap-5 p-6 md:grid-cols-[1fr_1.2fr] md:p-8">
        <div className="min-w-0">
          <span className="kicker label">O que fazer hoje</span>
          <h2 className="mt-3 font-display text-h2 font-bold uppercase leading-none text-text-1 [text-shadow:0_2px_16px_rgb(0_0_0/0.6)]">
            {item.title}
          </h2>
          <p className="muted mt-2">
            Faltam <span className="num text-text-1">{item.remaining}</span> para {item.platform === "psn" ? "a platina" : "100%"} ·{" "}
            {Math.round(item.completion_pct * 100)}% concluído
            {item.hours_left != null && <> · ~{formatHours(item.hours_left)} de jogo</>}
          </p>
          <div className="mt-3 max-w-sm">
            <ProgressBar value={item.completion_pct * 100} />
          </div>
          <Link to={`/games/${item.game_id}`} className="btn btn-secondary sm mt-5 no-underline">
            <span className="s" aria-hidden />
            <span className="gl" aria-hidden />
            Abrir jogo
          </Link>
        </div>
        <div className={cn("min-w-0", trophies.length === 0 && "hidden")}>
          <span className="label">Os mais fáceis que faltam</span>
          <ul className="m-0 mt-2 list-none p-0">
            {trophies.map((t) => (
              <RemainingRow key={t.id} trophy={t} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Uma posição da fila: posição, arte, progresso, avisos e os fatores que explicam a nota. */
function RankRow({ item, pos }: { item: NextItem; pos: number }) {
  return (
    <li className="panel sm grid items-center gap-4 md:grid-cols-[auto_150px_1fr_260px]">
      <span className="rank-idx" aria-label={`Posição ${pos}`}>
        {String(pos).padStart(2, "0")}
      </span>
      <Link to={`/games/${item.game_id}`} className="chamfer-sm hidden overflow-hidden md:block" style={{ aspectRatio: "16 / 10" }}>
        <GameCover variant="hero" cover={item.cover} hero={item.hero} title={item.title} platform={item.platform} externalId={item.external_id} />
      </Link>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadge platform={item.platform} />
          {item.priority > 0 && <span className="chip !text-neon-violet">Prioridade {item.priority}</span>}
          {item.remaining_missable > 0 && <span className="chip !text-warning">{item.remaining_missable} {item.remaining_missable === 1 ? "perdível" : "perdíveis"}</span>}
          {item.remaining_online > 0 && <span className="chip !text-danger">{item.remaining_online} online</span>}
        </div>
        <Link to={`/games/${item.game_id}`} className="mt-2 block truncate font-display text-lg font-bold text-text-1 no-underline hover:text-neon-cyan">
          {item.title}
        </Link>
        <p className="caption mt-1">
          {item.earned}/{item.total} · faltam {item.remaining} · raridade média do que falta {item.avg_remaining_rarity.toFixed(1).replace(".", ",")}%
          {item.hours_left != null && (
            <>
              {" "}
              · <b className="text-text-1">~{formatHours(item.hours_left)}</b> para {item.platform === "psn" ? "a platina" : "100%"}
            </>
          )}
        </p>
        <div className="mt-2">
          <ProgressBar value={item.completion_pct * 100} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5" aria-label={`Nota ${item.score.toFixed(2)}`}>
        {FACTORS.map((f) => {
          const v = item.factors[f.key];
          return (
            <div key={f.key} className="factor">
              <span>{f.label}</span>
              <span className="track">
                <i style={{ transform: `scaleX(${Math.min(1, v / f.max)})`, ["--fc" as string]: f.color }} />
              </span>
              <b>{Math.round((v / f.max) * 100)}</b>
            </div>
          );
        })}
      </div>
    </li>
  );
}

/** Próxima Platina — fila ranqueada com a explicação de cada posição. */
/** Aba "Na biblioteca": a fila de jogos começados mais perto de fechar. */
function LibraryQueue() {
  const next = useNext();
  const alerts = useAlerts();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const items = next.data?.items ?? [];
  const top = items[0];
  const maxHours = TIME_FILTERS.find((f) => f.key === timeFilter)!.max;
  const shown = timeFilter === "all" ? items : items.filter((it) => it.hours_left != null && it.hours_left < maxHours);
  return (
    <div className="flex flex-col gap-6">
      {next.isPending && <div className="skel chamfer-md h-64" aria-busy="true" />}
      {next.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar a fila.
        </p>
      )}
      {next.data && items.length === 0 && <p className="text-sm text-text-2">Nenhum jogo começado e não concluído.</p>}
      {top && next.data?.today && <Today item={top} trophies={next.data.today.trophies} />}

      {(alerts.data?.length ?? 0) > 0 && (
        <div className="panel sm flex flex-col gap-2">
          <span className="label">Atenção · perdíveis, online e dificuldade</span>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {alerts.data!.map((a) => (
              <li key={a.trophy_id}>
                <Link to={`/games/${a.game_id}`} className="chip inline-flex items-center gap-1.5 no-underline hover:!text-text-1">
                  {a.server_shutdown_risk && <span className="text-danger">servidor ·</span>}
                  {a.hidden ? "Oculto" : a.name} <span className="opacity-60">— {a.game_title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {items.length > 0 && (
        <div className="seg self-start" role="group" aria-label="Tempo restante">
          <span className="seg-l" aria-hidden>
            Tempo
          </span>
          {TIME_FILTERS.map((f) => (
            <button key={f.key} type="button" aria-pressed={f.key === timeFilter} onClick={() => setTimeFilter(f.key)} title={"hint" in f ? f.hint : undefined}>
              {f.label}
            </button>
          ))}
        </div>
      )}
      {items.length > 0 && shown.length === 0 && (
        <p className="text-sm text-text-2">Nenhum jogo da fila com estimativa nessa faixa de tempo. As estimativas (HowLongToBeat) chegam aos poucos.</p>
      )}
      {shown.length > 0 && (
        <ol className="m-0 flex list-none flex-col gap-3 p-0" aria-label="Fila de platinas">
          {shown.map((it) => (
            <RankRow key={it.game_id} item={it} pos={items.indexOf(it) + 1} />
          ))}
        </ol>
      )}
    </div>
  );
}

type Tab = "library" | "buy";

/** Próxima Platina: o que fechar da biblioteca, ou o que comprar para platinar (backlog com preço). */
export default function NextPlatinumPage() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get("tab") === "comprar" ? "buy" : "library";
  const select = (t: Tab) => setParams(t === "buy" ? { tab: "comprar" } : {}, { replace: true });
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        idx={sectionIdx("/next")}
        title="Próxima Platina"
        subtitle={
          tab === "library"
            ? "Jogos começados mais perto de virar platina (PSN) ou 100% (Steam): % concluído, quantos faltam e a raridade do que falta."
            : "Jogos que você ainda não tem: preço no Brasil, menor preço já visto e quanto tempo leva para platinar."
        }
      />
      <div className="seg self-start" role="tablist" aria-label="Próxima platina">
        <button type="button" role="tab" aria-selected={tab === "library"} aria-pressed={tab === "library"} onClick={() => select("library")}>
          Na biblioteca
        </button>
        <button type="button" role="tab" aria-selected={tab === "buy"} aria-pressed={tab === "buy"} onClick={() => select("buy")}>
          Para comprar
        </button>
      </div>
      {tab === "library" ? <LibraryQueue /> : <BacklogPanel />}
    </section>
  );
}
