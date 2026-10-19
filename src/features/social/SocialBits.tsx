import { useState } from "react";
import { Link } from "react-router";
import type { FeedItem, SocialUser } from "@/api/schemas";
import { Panel } from "@/design-system/components/Panel";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { Button } from "@/design-system/components/ui/button";
import { cn } from "@/lib/utils";
import { useSetSharing, useSharing } from "./queries";

export function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

/** Avatar de iniciais (mesmo estilo do menu da conta). */
export function Avatar({ user, size = 36 }: { user: SocialUser; size?: number }) {
  return (
    <span
      aria-hidden
      className={cn(
        "chamfer-sm grid shrink-0 place-items-center bg-surface-2 font-display text-xs font-bold shadow-[inset_0_0_0_1px_var(--color-border)]",
        user.is_me ? "text-neon-cyan" : "text-neon-violet-text",
      )}
      style={{ width: size, height: size }}
    >
      {initialsOf(user.name)}
    </span>
  );
}

/** Nome da pessoa: "Você" para quem pede; amigo vira link para o perfil. */
export function PersonName({ user, link = true }: { user: SocialUser; link?: boolean }) {
  if (user.is_me) return <b className="text-neon-cyan">Você</b>;
  if (!link) return <b>{user.name}</b>;
  return (
    <Link to={`/friends/${user.id}`} className="font-semibold text-text-1 no-underline hover:text-neon-cyan">
      {user.name}
    </Link>
  );
}

/**
 * Convite para ligar o compartilhamento (opt-in). Explica o que os amigos veem e o que NUNCA veem, e
 * a reciprocidade — é a única porta de entrada do social.
 */
export function SharingOptIn({ compact = false }: { compact?: boolean }) {
  const set = useSetSharing();
  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="label !text-neon-violet-text">Opcional · você decide</span>
        <h2 className="m-0 font-display text-h3 font-bold uppercase tracking-[0.02em] text-text-1">
          Compartilhar seu progresso com os amigos
        </h2>
      </div>
      <p className="m-0 max-w-2xl text-sm text-text-2">
        Ligando, os outros membros do Trophy Hunter que também compartilham passam a ver seus jogos e o progresso,
        suas platinas e troféus raros, e você entra no ranking. Em troca, você vê o deles — inclusive quem tem o
        mesmo jogo que você.
      </p>
      {!compact && (
        <ul className="m-0 grid gap-2 p-0 text-sm text-text-2 sm:grid-cols-2">
          <li className="list-none">
            <b className="text-success">Os amigos veem</b> — biblioteca, % de cada jogo, platinas, troféus raros e o
            placar.
          </li>
          <li className="list-none">
            <b className="text-warning">Nunca</b> — suas contas Steam/PSN, notas, marcações e conversas com a IA.
          </li>
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => set.mutate(true)} disabled={set.isPending}>
          {set.isPending ? "Ligando…" : "Compartilhar meu progresso"}
        </Button>
        <span className="caption">Dá para desligar quando quiser.</span>
      </div>
      {set.isError && (
        <p role="alert" className="m-0 text-sm text-danger">
          Não foi possível ligar o compartilhamento.
        </p>
      )}
    </Panel>
  );
}

/** Interruptor do compartilhamento (Contas e cabeçalho de Amigos). */
export function SharingToggle() {
  const sharing = useSharing();
  const set = useSetSharing();
  return (
    <div className="flex flex-col gap-1">
      <label className="switch">
        <input
          type="checkbox"
          checked={sharing}
          disabled={set.isPending}
          onChange={(e) => set.mutate(e.target.checked)}
        />
        Compartilhar meu progresso com os amigos
      </label>
      {set.isError && (
        <p role="alert" className="m-0 text-sm text-danger">
          Não foi possível salvar.
        </p>
      )}
    </div>
  );
}

function ago(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "agora há pouco";
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `há ${d} ${d === 1 ? "dia" : "dias"}`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
}

function headline(item: FeedItem) {
  switch (item.kind) {
    case "platinum":
      return "platinou";
    case "completion":
      return item.platform === "psn" ? "completou" : "fez 100% em";
    default:
      return item.type === "achievement" ? "pegou uma conquista rara em" : "pegou um troféu raro em";
  }
}

/** Um momento do feed (platina, 100% ou raro). Troféu oculto fica borrado até revelar (spoiler). */
export function FeedRow({ item }: { item: FeedItem }) {
  const [revealed, setRevealed] = useState(false);
  const spoiler = item.hidden && !revealed;
  const big = item.kind !== "rare";
  return (
    <li className={cn("trow unlocked !items-start", big && "feed-big")}>
      <Avatar user={item.user} />
      <div className="min-w-0">
        <div className="text-sm text-text-2">
          <PersonName user={item.user} /> {headline(item)} <b className="text-text-1">{item.game_title}</b>
        </div>
        {item.kind === "rare" && (
          <div className="relative mt-1 flex items-center gap-2">
            <TrophyIcon type={item.type} size={16} />
            <span className={cn("tt !text-sm", spoiler && "blur-sm select-none")} aria-hidden={spoiler}>
              {item.name}
            </span>
            {spoiler && (
              <button type="button" className="reveal-btn !static !text-xs" onClick={() => setRevealed(true)}>
                Oculto — revelar
              </button>
            )}
          </div>
        )}
        <div className="tm">
          <span className="caption">{ago(item.earned_at)}</span>
        </div>
      </div>
      <div className="right flex items-center gap-2">
        {item.kind === "platinum" && <TrophyIcon type="platinum" size={28} />}
        {item.kind === "completion" && <TrophyIcon type={item.platform === "psn" ? "platinum" : "achievement"} size={28} />}
        {item.rarity_pct != null && item.kind === "rare" && <RarityBadge pct={item.rarity_pct} mini />}
      </div>
    </li>
  );
}
