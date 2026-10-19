import { useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { Link } from "react-router";
import { useApi } from "@/api/ApiProvider";
import { api } from "@/api/endpoints";
import { MenuItemContent, MenuPanel } from "@/design-system/components/MenuPanel";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { useIntegrations } from "@/features/integrations/queries";
import { useWeeklyRecap } from "@/features/recap/queries";
import { useChallenges, useSharing } from "@/features/social/queries";
import { pushSupport } from "./browserPush";
import { useLocalSubscription, usePushStatus } from "./queries";

const SEEN_KEY = "th:notif-seen-at";

function readSeen(): number {
  return Number(window.localStorage.getItem(SEEN_KEY) ?? 0);
}

function ago(iso: string | null | undefined): string {
  if (!iso) return "";
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "agora há pouco";
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "ontem" : `há ${d} dias`;
}

/**
 * Sino da barra: o que pede ação (conta para reconectar, convite de desafio, resumo semanal pronto),
 * os últimos troféus e o estado do push. O selo conta só o que é novo desde a última abertura (mais o
 * que exige ação, que continua contando até ser resolvido).
 */
export function NotificationBell() {
  const client = useApi();
  const anchor = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(readSeen);
  const sharing = useSharing();
  const integrations = useIntegrations();
  const challenges = useChallenges(sharing);
  const weekly = useWeeklyRecap();
  const recent = useQuery({ queryKey: ["timeline", "bell"], queryFn: () => api.timeline(client, { limit: 6 }), staleTime: 60_000 });
  const support = pushSupport();
  const status = usePushStatus();
  const subscribed = useLocalSubscription(support.ok && (status.data?.enabled ?? false)).data === true;

  const needsYou = (integrations.data ?? []).filter((i) => i.status === "needs_reconnect" || i.status === "error_private");
  const invites = (challenges.data ?? []).filter((c) => c.status === "open" && c.my_state === "invited");
  const recap = weekly.data?.recap?.status === "ready" ? weekly.data.recap : null;
  const recapNew = recap && new Date(recap.updated_at ?? 0).getTime() > seenAt;
  const unlocks = recent.data?.items ?? [];
  const newUnlocks = unlocks.filter((u) => u.earned_at && new Date(u.earned_at).getTime() > seenAt).length;
  const count = needsYou.length + invites.length + (recapNew ? 1 : 0) + newUnlocks;

  const close = useCallback(() => setOpen(false), []);
  function toggle() {
    setOpen((o) => {
      if (!o) {
        const now = Date.now();
        window.localStorage.setItem(SEEN_KEY, String(now));
        // Mantém os destaques desta abertura; o selo zera na próxima renderização após fechar.
        setTimeout(() => setSeenAt(now), 0);
      }
      return !o;
    });
  }

  const attention = needsYou.length + invites.length + (recap ? 1 : 0);
  return (
    <div ref={anchor} className="relative">
      <button
        type="button"
        className="icon-btn"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={count > 0 ? `Notificações: ${count} novas` : "Notificações"}
      >
        <svg width={18} height={18} aria-hidden>
          <use href="#i-bell" />
        </svg>
        {count > 0 && <span className="dot">{count > 9 ? "9+" : count}</span>}
      </button>
      <MenuPanel open={open} onClose={close} label="Notificações" anchorRef={anchor} width="w-96">
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="font-display text-sm font-bold uppercase tracking-[0.08em] text-text-1">Notificações</span>
          <Link to="/settings/notifications" className="label no-underline hover:!text-text-1" onClick={close}>
            Preferências
          </Link>
        </div>

        {attention > 0 && (
          <div className="menu-group">
            <span className="label">Pede sua atenção</span>
            {needsYou.map((i) => (
              <Link key={i.id} to="/settings/integrations" className="menu-item" onClick={close}>
                <MenuItemContent
                  icon="i-warn"
                  label={`${i.label}: ${i.status === "needs_reconnect" ? "reconectar a PSN" : "perfil Steam privado"}`}
                  hint="Sem isso o sync dessa conta para."
                />
              </Link>
            ))}
            {invites.map((c) => (
              <Link key={c.id} to={`/friends/challenges/${c.id}`} className="menu-item" onClick={close}>
                <MenuItemContent icon="i-user" label="Você foi desafiado" hint={c.title} />
              </Link>
            ))}
            {recap && (
              <Link to="/recap" className="menu-item" onClick={close}>
                <MenuItemContent icon="i-ai" label="Seu resumo da semana está pronto" hint={recap.content?.headline} />
              </Link>
            )}
          </div>
        )}

        <div className="menu-group">
          <span className="label">Últimos troféus</span>
          {unlocks.length === 0 && <p className="caption px-2 py-1">Nada por aqui ainda.</p>}
          {unlocks.map((u) => (
            <Link key={u.trophy_id} to={`/games/${u.game_id}#trophy-${u.trophy_id}`} className="menu-item" onClick={close}>
              <TrophyIcon type={u.type} size={18} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-text-1">{u.name}</span>
                <span className="caption block truncate">
                  {u.game_title} · {ago(u.earned_at)}
                </span>
              </span>
            </Link>
          ))}
          <Link to="/timeline" className="menu-item" onClick={close}>
            <MenuItemContent icon="i-play" label="Ver linha do tempo" />
          </Link>
        </div>

        <div className="menu-group">
          <Link to="/settings/notifications" className="menu-item" onClick={close}>
            <MenuItemContent
              icon="i-bell"
              label={subscribed ? "Push ligado neste aparelho" : "Ativar notificações push"}
              hint={subscribed ? "Tipos de aviso e som nas preferências." : "Avisos mesmo com o app fechado."}
            />
          </Link>
        </div>
      </MenuPanel>
    </div>
  );
}
