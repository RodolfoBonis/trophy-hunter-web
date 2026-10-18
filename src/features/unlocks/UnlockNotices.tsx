import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { UnlockEvent } from "@/api/schemas";
import { GameCover } from "@/design-system/components/GameCover";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { cn } from "@/lib/utils";
import { PlatinumCeremony } from "./PlatinumCeremony";
import { useMarkUnlocksSeen, useUnseenUnlocks } from "./queries";
import { playUnlockSound } from "./sound";

/** Quantos avisos individuais antes de agrupar por jogo. */
const MAX_SINGLE = 3;
const TOAST_MS = 7000;

type Toast =
  | { key: string; kind: "single"; event: UnlockEvent }
  | { key: string; kind: "group"; events: UnlockEvent[] };

/** Monta os toasts: até 3 individuais; acima disso, um por jogo ("N troféus novos em X"). */
export function buildToasts(events: UnlockEvent[]): Toast[] {
  if (events.length <= MAX_SINGLE)
    return events.map((e) => ({ key: e.id, kind: "single", event: e }));
  const byGame = new Map<string, UnlockEvent[]>();
  for (const e of events)
    byGame.set(e.game_id, [...(byGame.get(e.game_id) ?? []), e]);
  return [...byGame.values()].map((evs) =>
    evs.length === 1
      ? { key: evs[0]!.id, kind: "single", event: evs[0]! }
      : { key: `g-${evs[0]!.game_id}`, kind: "group", events: evs },
  );
}

function ToastItem({
  toast,
  onDone,
}: {
  toast: Toast;
  onDone: (key: string) => void;
}) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => onDone(toast.key), TOAST_MS);
    return () => window.clearTimeout(t);
  }, [paused, toast.key, onDone]);

  const first = toast.kind === "single" ? toast.event : toast.events[0]!;
  const steam = first.platform === "steam";
  return (
    <li
      className={cn(
        "utoast",
        toast.kind === "single" &&
          first.rarity_pct != null &&
          first.rarity_pct < 5 &&
          "is-rare",
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Link
        to={`/games/${first.game_id}`}
        className="utoast-body"
        onClick={() => onDone(toast.key)}
      >
        {toast.kind === "single" ? (
          <span className="utoast-icon">
            {first.icon ? (
              <img src={first.icon} alt="" />
            ) : (
              <TrophyIcon type={first.type} size={40} />
            )}
          </span>
        ) : (
          <span className="utoast-icon cover">
            <GameCover
              variant="cover"
              cover={first.cover}
              hero={first.hero}
              title={first.game_title}
              platform={first.platform}
              externalId={first.external_id}
            />
          </span>
        )}
        <span className="min-w-0">
          <span className="utoast-kicker">
            {toast.kind === "group"
              ? `${toast.events.length} ${steam ? "conquistas novas" : "troféus novos"}`
              : steam
                ? "Conquista desbloqueada"
                : "Troféu desbloqueado"}
          </span>
          <span className="utoast-title">
            {toast.kind === "single" ? first.name : first.game_title}
          </span>
          <span className="utoast-sub">
            {toast.kind === "single"
              ? first.game_title
              : toast.events
                  .map((e) => e.name)
                  .slice(0, 3)
                  .join(" · ")}
          </span>
        </span>
        {toast.kind === "single" && first.rarity_pct != null && (
          <RarityBadge pct={first.rarity_pct} mini />
        )}
      </Link>
      <button
        type="button"
        className="utoast-close"
        aria-label="Fechar aviso"
        onClick={() => onDone(toast.key)}
      >
        ×
      </button>
    </li>
  );
}

/**
 * Avisos de troféu: busca os desbloqueios novos (a cada minuto e ao voltar para a aba), mostra os
 * toasts estilo console, enfileira a cerimônia quando um troféu fecha o jogo e marca tudo como visto.
 */
export function UnlockNotices() {
  const unlocks = useUnseenUnlocks();
  const markSeen = useMarkUnlocksSeen();
  const handled = useRef(new Set<string>());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [ceremonies, setCeremonies] = useState<UnlockEvent[]>([]);

  useEffect(() => {
    const fresh = (unlocks.data ?? []).filter(
      (e) => !handled.current.has(e.id),
    );
    if (fresh.length === 0) return;
    fresh.forEach((e) => handled.current.add(e.id));

    // Cerimônia: uma por jogo fechado (o troféu que fechou aparece nela, não em toast).
    const completions = [
      ...new Map(
        fresh.filter((e) => e.completes_game).map((e) => [e.game_id, e]),
      ).values(),
    ];
    const completingIds = new Set(completions.map((e) => e.id));
    const rest = fresh.filter((e) => !completingIds.has(e.id));

    setToasts((cur) => [...cur, ...buildToasts(rest)]);
    setCeremonies((cur) => [...cur, ...completions]);
    playUnlockSound(completions.length > 0 ? "platinum" : "trophy");
    markSeen.mutate(fresh.map((e) => e.id));
    // markSeen é estável o suficiente; dispara só quando chegam dados novos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocks.data]);

  const dismiss = useCallback(
    (key: string) => setToasts((cur) => cur.filter((t) => t.key !== key)),
    [],
  );
  const closeCeremony = useCallback(
    () => setCeremonies((cur) => cur.slice(1)),
    [],
  );

  return (
    <>
      <ol
        className="utoasts"
        aria-live="polite"
        aria-label="Troféus desbloqueados"
      >
        {toasts.slice(0, 4).map((t) => (
          <ToastItem key={t.key} toast={t} onDone={dismiss} />
        ))}
      </ol>
      {ceremonies[0] && (
        <PlatinumCeremony
          key={ceremonies[0].id}
          event={ceremonies[0]}
          onClose={closeCeremony}
        />
      )}
    </>
  );
}
