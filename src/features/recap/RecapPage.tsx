import { sectionIdx } from "@/layout/nav";
import { useState } from "react";
import { Link } from "react-router";
import type { Recap } from "@/api/schemas";
import { useAuthenticatedSession } from "@/auth/session";
import { GameCover } from "@/design-system/components/GameCover";
import { Panel } from "@/design-system/components/Panel";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { SectionHead } from "@/design-system/components/SectionHead";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { Button } from "@/design-system/components/ui/button";
import { recapPeriods } from "./periods";
import { useRecap } from "./queries";
import { renderRecapCard, shareOrDownload } from "./shareCard";
import { WeeklyRecapPanel } from "./WeeklyRecapPanel";

const nf = new Intl.NumberFormat("pt-BR");

function Delta({ now, prev }: { now: number; prev: number }) {
  if (prev === 0) return null;
  const pct = Math.round(((now - prev) / prev) * 100);
  return (
    <span className={pct >= 0 ? "text-success" : "text-warning"}>
      {pct >= 0 ? "▲" : "▼"} {Math.abs(pct)}% vs. período anterior
    </span>
  );
}

function Big({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="stat-tile" style={{ borderTopColor: color }}>
      <span className="num">{nf.format(value)}</span>
      <span className="caption">{label}</span>
    </div>
  );
}

function Story({ r }: { r: Recap }) {
  const top = r.top_games[0];
  return (
    <div className="flex flex-col gap-6">
      <div className="panel hero-stat">
        <span className="label">{r.label}{r.partial ? " · até agora" : ""}</span>
        <div className="big mt-3">
          {nf.format(r.earned)}
          <small>troféus e conquistas</small>
        </div>
        <p className="caption mt-2">
          <Delta now={r.earned} prev={r.previous_earned} />
        </p>
        <div className="statline">
          {(
            [
              ["t-plat", "Platina", r.platinum],
              ["t-gold", "Ouro", r.gold],
              ["t-silver", "Prata", r.silver],
              ["t-bronze", "Bronze", r.bronze],
            ] as const
          ).map(([cls, label, v]) => (
            <div key={cls} className={cls}>
              <span className="num">{v}</span>
              <span className="caption">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="stat-tiles">
        <Big value={r.rare} label="Raros (< 5%)" color="var(--color-rarity-legendary)" />
        <Big value={r.games} label="Jogos" color="var(--color-neon-cyan)" />
        <Big value={r.active_days} label="Dias ativos" color="var(--color-success)" />
        <Big value={r.longest_streak} label="Maior sequência (dias)" color="var(--color-neon-violet)" />
        <Big value={r.achievements} label="Conquistas Steam" color="var(--color-steam)" />
        <Big value={r.best_day_count} label="No melhor dia" color="var(--color-trophy-gold)" />
      </div>
      {r.favorite_weekday && (
        <p className="m-0 text-sm text-text-2">
          Seu dia favorito para caçar foi <b className="text-text-1">{r.favorite_weekday}</b>.
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        {top && (
          <Link to={`/games/${top.game_id}`} className="panel hero-stat game-hero !p-0 no-underline">
            <div className="game-hero-art" aria-hidden>
              <GameCover variant="hero" cover={top.cover} hero={top.hero} title={top.title} platform={top.platform} externalId={top.external_id} />
            </div>
            <div className="relative z-[1] flex flex-col gap-1 p-6">
              <span className="kicker label">Jogo do período</span>
              <span className="font-display text-h3 font-bold uppercase text-text-1">{top.title}</span>
              <span className="caption">
                {top.unlocked} desbloqueios · agora {top.earned}/{top.total}
              </span>
            </div>
          </Link>
        )}
        <Panel className="flex flex-col gap-3">
          <h3 className="sub !mb-0">Fechou no período</h3>
          {r.completions.length === 0 && <p className="caption">Nenhum jogo fechado (ainda).</p>}
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {r.completions.map((c) => (
              <li key={c.game_id} className="flex items-center gap-2">
                <TrophyIcon type={c.platform === "psn" ? "platinum" : "achievement"} size={22} />
                <Link to={`/games/${c.game_id}`} className="text-sm text-text-1 no-underline hover:text-neon-cyan">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
          {r.rarest.length > 0 && (
            <>
              <h3 className="sub !mb-0 mt-2">Mais raros</h3>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {r.rarest.map((t) => (
                  <li key={`${t.game_title}-${t.name}`} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm text-text-1">
                      {t.hidden ? "Troféu oculto" : t.name} <span className="caption">· {t.game_title}</span>
                    </span>
                    <RarityBadge pct={t.rarity_pct} mini />
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}

/** Retrospectiva ("Wrapped") por mês/ano, com cartão para compartilhar e o resumo semanal da IA. */
export default function RecapPage() {
  const session = useAuthenticatedSession();
  const periods = recapPeriods(new Date());
  const [period, setPeriod] = useState(periods[0]!.key);
  const q = useRecap(period);
  const [sharing, setSharing] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function share() {
    if (!q.data) return;
    setSharing("busy");
    try {
      const blob = await renderRecapCard(q.data, session.user.name);
      await shareOrDownload(blob, `trophy-hunter-${q.data.period}.png`);
      setSharing("done");
    } catch (e) {
      // Cancelar o compartilhamento não é erro.
      setSharing(e instanceof DOMException && e.name === "AbortError" ? "idle" : "error");
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        idx={sectionIdx("/recap")}
        title="Retrospectiva"
        subtitle="Seu período em números — e um cartão para mostrar por aí."
        actions={
          <Button size="sm" variant="secondary" onClick={() => void share()} disabled={!q.data || q.data.earned === 0 || sharing === "busy"}>
            {sharing === "busy" ? "Gerando…" : "Compartilhar cartão"}
          </Button>
        }
      />
      <div className="seg self-start" role="group" aria-label="Período">
        {periods.map((p) => (
          <button key={p.key} type="button" aria-pressed={period === p.key} onClick={() => setPeriod(p.key)}>
            {p.label}
          </button>
        ))}
      </div>
      {sharing === "done" && (
        <p role="status" className="m-0 text-sm text-success">
          Cartão pronto.
        </p>
      )}
      {sharing === "error" && (
        <p role="alert" className="m-0 text-sm text-danger">
          Não deu para gerar o cartão.
        </p>
      )}
      <WeeklyRecapPanel />
      {q.isPending && <div className="skel chamfer-md h-72" aria-busy="true" />}
      {q.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar a retrospectiva.
        </p>
      )}
      {q.data && q.data.earned === 0 && <p className="text-sm text-text-2">Nenhum troféu em {q.data.label}. Bora mudar isso?</p>}
      {q.data && q.data.earned > 0 && <Story r={q.data} />}
    </section>
  );
}
