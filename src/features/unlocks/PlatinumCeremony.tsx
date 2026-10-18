import { useEffect, useRef } from "react";
import { Link } from "react-router";
import confetti from "canvas-confetti";
import type { UnlockEvent } from "@/api/schemas";
import { GameCover } from "@/design-system/components/GameCover";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const PLATINUM_COLORS = ["#E5F0FF", "#B8A9FF", "#7FE7FF", "#FFD6F5", "#F5C542"];

/**
 * Cerimônia de platina (PSN) / 100% (Steam): overlay de tela cheia com a arte do jogo, o troféu e
 * partículas. Foco vai para "Fechar"; Esc ou clique fora fecham. Com reduced-motion: sem
 * partículas nem animação, só o conteúdo.
 */
export function PlatinumCeremony({
  event,
  onClose,
}: {
  event: UnlockEvent;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const psn = event.platform === "psn";

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (reduced) return;
    const fire = (ratio: number, opts: confetti.Options) =>
      void confetti({
        ...opts,
        particleCount: Math.floor(220 * ratio),
        colors: PLATINUM_COLORS,
        zIndex: 1300,
        disableForReducedMotion: true,
      });
    fire(0.3, { spread: 30, startVelocity: 55, origin: { y: 0.7 } });
    fire(0.25, { spread: 70, origin: { y: 0.7 } });
    const t = window.setTimeout(() => {
      fire(0.35, {
        spread: 110,
        decay: 0.92,
        scalar: 0.9,
        origin: { x: 0.2, y: 0.6 },
      });
      fire(0.35, {
        spread: 110,
        decay: 0.92,
        scalar: 0.9,
        origin: { x: 0.8, y: 0.6 },
      });
    }, 450);
    return () => {
      window.clearTimeout(t);
      confetti.reset();
    };
  }, [reduced]);

  return (
    <div
      className="ceremony"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ceremony-title"
      onClick={onClose}
    >
      <div className="ceremony-art" aria-hidden>
        <GameCover
          variant="hero"
          cover={event.cover}
          hero={event.hero}
          title={event.game_title}
          platform={event.platform}
          externalId={event.external_id}
        />
      </div>
      <div className="ceremony-card" onClick={(e) => e.stopPropagation()}>
        <div className="ceremony-trophy" aria-hidden>
          <TrophyIcon type={psn ? "platinum" : "achievement"} size={96} />
        </div>
        <span className="label">
          {psn ? "Troféu de platina" : "Jogo 100% concluído"}
        </span>
        <h2 id="ceremony-title" className="ceremony-title">
          {psn ? "Platina!" : "100%!"}
        </h2>
        <p className="ceremony-game">{event.game_title}</p>
        <p className="caption">
          {psn ? event.name : `Última conquista: ${event.name}`}
          {event.rarity_pct != null && (
            <span className="ml-2 inline-block align-middle">
              <RarityBadge pct={event.rarity_pct} mini />
            </span>
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to={`/games/${event.game_id}`}
            className="btn btn-primary sm no-underline"
            onClick={onClose}
          >
            <span className="s" aria-hidden />
            <span className="gl" aria-hidden />
            Ver o jogo
          </Link>
          <button
            ref={closeRef}
            type="button"
            className="btn btn-ghost sm"
            onClick={onClose}
          >
            <span className="s" aria-hidden />
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
