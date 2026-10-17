import { useRef, type PointerEvent, type ReactNode } from "react";
import { Link } from "react-router";
import type { Platform } from "@/api/schemas";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { GameCover } from "./GameCover";
import { PlatformBadge } from "./PlatformBadge";
import { ProgressRing } from "./ProgressRing";

/** Inclinação máxima (graus) do tilt — mesmos valores do style tile. */
const TILT_Y = 12;
const TILT_X = 10;

export interface GameCardProps {
  to: string;
  title: string;
  platform: Platform;
  externalId: string;
  cover?: string | null;
  hero?: string | null;
  /** 0..100 */
  pct: number;
  earned: number;
  total: number;
  platinum?: boolean;
  /** Linha de meta extra (ex.: "última: hoje"). */
  meta?: ReactNode;
  /** Chips/contadores abaixo da meta (ex.: contas). */
  footer?: ReactNode;
  /** Badge no canto superior direito da capa. */
  corner?: ReactNode;
  /** Índice na grade, para a entrada em cascata. */
  index?: number;
  /** Nome da view transition (shared element card → página do jogo). */
  transitionName?: string;
}

/**
 * Card de jogo do style tile: moldura chanfrada com borda em gradiente, halo no hover/foco, tilt e
 * parallax guiados pelo ponteiro, reflexo especular e anel com count-up. O tilt escreve CSS vars direto
 * no elemento (sem re-render) e é desligado em touch e com reduced-motion.
 */
export function GameCard({
  to,
  title,
  platform,
  externalId,
  cover,
  hero,
  pct,
  earned,
  total,
  platinum = false,
  meta,
  footer,
  corner,
  index = 0,
  transitionName,
}: GameCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();

  function onPointerMove(e: PointerEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el || reduced || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(x * TILT_Y).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * TILT_X).toFixed(2)}deg`);
    el.style.setProperty("--px", x.toFixed(3));
    el.style.setProperty("--py", y.toFixed(3));
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  }

  function onPointerLeave() {
    const el = ref.current;
    if (!el) return;
    for (const p of ["--rx", "--ry", "--px", "--py"]) el.style.removeProperty(p);
  }

  const ringColor = platform === "steam" ? "var(--color-steam)" : "var(--color-neon-cyan)";
  return (
    <Link
      ref={ref}
      to={to}
      viewTransition
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-label={`${title}, ${platform === "steam" ? "Steam" : "PlayStation"}, ${Math.round(pct)}% concluído${platinum ? ", platinado" : ""}`}
      className={cn("gcard gcard-enter", platinum && "is-plat")}
      style={{ ["--i" as string]: Math.min(index, 12) }}
    >
      <div className="halo" aria-hidden />
      <div className="edge" aria-hidden />
      <div className="frame">
        <div className="cover" style={transitionName ? { viewTransitionName: transitionName } : undefined}>
          <div className="art">
            <GameCover variant="hero" cover={cover} hero={hero} title={title} platform={platform} externalId={externalId} />
          </div>
          <div className="fx" aria-hidden />
          <div className="glare" aria-hidden />
          <span className="pbadge">
            <PlatformBadge platform={platform} />
          </span>
          {corner && <span className="corner">{corner}</span>}
          <span className="ctitle" aria-hidden>
            {title}
          </span>
        </div>
        <div className="gbody">
          <div className="min-w-0">
            <h3 title={title}>{title}</h3>
            <div className="meta">
              <span className="num">{earned}</span>/{total} {platform === "steam" ? "conquistas" : "troféus"}
              {platinum ? " · platinado" : ""}
              {meta}
            </div>
            {footer && <div className="tcounts">{footer}</div>}
          </div>
          <ProgressRing value={pct} size={64} strokeWidth={10} platinum={platinum} color={ringColor} />
        </div>
      </div>
    </Link>
  );
}
