import { useRef, type PointerEvent, type ReactNode } from "react";
import { Link } from "react-router";
import type { Platform, TypeCounts } from "@/api/schemas";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { GameCover } from "./GameCover";
import { PlatformBadge } from "./PlatformBadge";
import { ProgressRing } from "./ProgressRing";
import { RarityBadge } from "./RarityBadge";

/** Inclinação máxima — mesmos valores do style tile (tilt/parallax). */
const TILT_Y = 12;
const TILT_X = 10;
/** Até quantos troféus faltando o card ganha o selo "Falta N". */
const ALMOST_THERE = 3;

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
  /** Platinado (PSN) ou 100% (Steam). */
  complete?: boolean;
  counts?: TypeCounts;
  lastUnlockAt?: string | null;
  abandoned?: boolean;
  /** Conteúdo extra na linha de contadores (ex.: chip de contas). */
  extra?: ReactNode;
  /** Nome da view transition (arte compartilhada card → página do jogo). */
  transitionName?: string;
}

/**
 * Card de jogo do style tile — mesma marcação e classes (`.gcard` em hud.css): halo, borda em
 * gradiente, moldura chanfrada, capa 16:10 com parallax e reflexo, corpo com título, meta, contadores
 * e anel. O CARD INTEIRO inclina com o ponteiro (CSS vars no próprio elemento, sem re-render); tilt
 * desligado em toque e com reduced-motion.
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
  complete = false,
  counts,
  lastUnlockAt,
  abandoned = false,
  extra,
  transitionName,
}: GameCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();
  const isPsn = platform === "psn";
  const remaining = total - earned;

  function onPointerMove(e: PointerEvent<HTMLAnchorElement>) {
    const card = ref.current;
    if (!card || reduced || e.pointerType === "touch") return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--ry", `${(x * TILT_Y).toFixed(2)}deg`);
    card.style.setProperty("--rx", `${(-y * TILT_X).toFixed(2)}deg`);
    card.style.setProperty("--px", x.toFixed(3));
    card.style.setProperty("--py", y.toFixed(3));
    card.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  }

  function onPointerLeave() {
    const card = ref.current;
    if (!card) return;
    for (const p of ["--rx", "--ry", "--px", "--py"]) card.style.removeProperty(p);
  }

  const unit = isPsn ? "troféus" : "conquistas";
  const when = lastUnlockAt ? relativeDay(lastUnlockAt) : null;
  const metaTail = complete
    ? ` · ${isPsn ? "platinado" : "100%"}${lastUnlockAt ? ` em ${fullDate(lastUnlockAt)}` : ""}`
    : abandoned
      ? " · abandonado"
      : when
        ? ` · última: ${when}`
        : "";

  return (
    <Link
      ref={ref}
      to={to}
      viewTransition
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("gcard", complete && "is-plat")}
      aria-label={`${title}, ${isPsn ? "PlayStation" : "Steam"}, ${complete ? (isPsn ? "platinado" : "100% concluído") : `${Math.round(pct)}% concluído`}`}
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
          <PlatformBadge platform={platform} />
          {!complete && !abandoned && remaining > 0 && remaining <= ALMOST_THERE && (
            <RarityBadge
              mini
              tier="legendary"
              label={`Falta ${remaining}`}
              detail={null}
              className="plat-ready [&_.bg]:!bg-[rgb(7_8_13/0.75)]"
            />
          )}
          <span className="ctitle" aria-hidden>
            {title}
          </span>
        </div>
        <div className="gbody">
          <div className="min-w-0">
            <h4 className="truncate" title={title}>
              {title}
            </h4>
            <div className="meta">
              <span className="num">{earned}</span>/{total}
              {complete ? "" : ` ${unit}`}
              {metaTail}
            </div>
            <div className="tcounts">
              {counts && <TypeCounters counts={counts} platform={platform} earned={earned} total={total} complete={complete} />}
              {extra}
            </div>
          </div>
          <ProgressRing value={pct} platinum={complete} color={isPsn ? undefined : "var(--color-steam)"} />
        </div>
      </div>
    </Link>
  );
}

/** Contadores do card (como no tile): PSN por tipo; Steam total + raras ganhas. */
function TypeCounters({
  counts,
  platform,
  earned,
  total,
  complete,
}: {
  counts: TypeCounts;
  platform: Platform;
  earned: number;
  total: number;
  complete: boolean;
}) {
  if (platform === "psn") {
    if (complete) {
      return (
        <span style={{ color: "var(--color-plat-3)" }}>
          <Glyph id="t-plat" />
          Platina
        </span>
      );
    }
    const types = [
      ["platinum", "t-plat", counts.platinum],
      ["gold", "t-gold", counts.gold],
      ["silver", "t-silver", counts.silver],
      ["bronze", "t-bronze", counts.bronze],
    ] as const;
    return (
      <>
        {types
          .filter(([, , c]) => c.total > 0)
          .map(([key, glyph, c]) => (
            <span key={key} aria-label={`${key}: ${c.earned} de ${c.total}`}>
              <Glyph id={glyph} />
              {c.earned}/{c.total}
            </span>
          ))}
      </>
    );
  }
  return (
    <>
      <span aria-label={`${earned} de ${total} conquistas`}>
        <Glyph id="t-ach" />
        {earned}/{total}
      </span>
      <TopTier rarity={counts.rarity} />
    </>
  );
}

/** Tiers do mais raro ao menos raro, com rótulos no singular/plural (mesmos cortes do style tile). */
const TIERS = [
  ["legendary", "lendária", "lendárias"],
  ["epic", "épica", "épicas"],
  ["rare", "rara", "raras"],
] as const;

/**
 * Destaque de raridade do card (como o "9 épicas" do tile): o tier MAIS ALTO em que o jogador tem
 * troféus ganhos, na cor e com o glifo do tier. Só raro ou acima (comum/incomum não são destaque).
 */
function TopTier({ rarity }: { rarity: TypeCounts["rarity"] }) {
  const top = TIERS.find(([key]) => rarity[key] > 0);
  if (!top) return null;
  const [key, one, many] = top;
  const n = rarity[key];
  return (
    <span style={{ color: `var(--color-rarity-${key})` }} title="Tier de raridade mais alto entre as suas conquistas">
      <Glyph id={`r-${key}`} />
      {n} {n === 1 ? one : many}
    </span>
  );
}

function Glyph({ id }: { id: string }) {
  return (
    <svg width={14} height={14} aria-hidden>
      <use href={`#${id}`} />
    </svg>
  );
}

/** "hoje", "ontem", "há 3 dias" ou data curta. */
function relativeDay(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  return fullDate(iso);
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
}
