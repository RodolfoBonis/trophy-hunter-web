import {
  CommandPalette,
  PALETTE_SHORTCUT,
} from "@/features/command-palette/CommandPalette";
import { setSoundOn, useSoundOn } from "@/features/unlocks/sound";
import { UnlockNotices } from "@/features/unlocks/UnlockNotices";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useAuthenticatedSession } from "@/auth/session";
import { cn } from "@/lib/utils";
import { useIsOwner } from "@/features/members/queries";
import { MenuItemContent, MenuPanel } from "@/design-system/components/MenuPanel";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { NAV_ITEMS, SETTINGS_ITEMS, isNavActive } from "./nav";

function Glyph({ id, size = 18 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} aria-hidden className="shrink-0">
      <use href={`#${id}`} />
    </svg>
  );
}

function Brand() {
  return (
    <Link
      to="/"
      className="brand text-text-1 no-underline"
      aria-label="Trophy Hunter — início"
    >
      <svg aria-hidden style={{ color: "var(--color-plat-2)" }}>
        <use href="#t-plat" />
      </svg>
      <span>
        Trophy <b>Hunter</b>
      </span>
    </Link>
  );
}

/**
 * Menu da conta: quem está logado (nome, e-mail, papel), Configurações (abas), som dos avisos e sair.
 * No celular vira uma folha que sobe do rodapé e inclui o que não cabe na tab bar (Retrospectiva).
 */
function UserMenu() {
  const session = useAuthenticatedSession();
  const isOwner = useIsOwner();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const soundOn = useSoundOn();
  const anchor = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const name = session.user.name ?? session.user.email ?? "?";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const extra = NAV_ITEMS.filter((i) => !i.mobile);
  const settings = SETTINGS_ITEMS.filter((s) => !s.ownerOnly || isOwner);

  return (
    <div ref={anchor} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Conta de ${session.user.name ?? "usuário"}`}
        className="chamfer-sm grid size-9 place-items-center bg-surface-2 font-display text-xs font-bold text-neon-cyan shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-surface-3"
      >
        {initials}
      </button>
      <MenuPanel open={open} onClose={close} label="Conta e configurações" anchorRef={anchor} width="w-80">
        <div className="flex items-center gap-3 px-2 pb-3">
          <span className="chamfer-sm grid size-11 shrink-0 place-items-center bg-surface-2 font-display text-sm font-bold text-neon-cyan shadow-[inset_0_0_0_1px_var(--color-border)]">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-semibold text-text-1">{session.user.name}</span>
            <span className="caption block truncate">{session.user.email}</span>
          </span>
          {isOwner && <span className="chip ml-auto !px-1.5 !py-1">Dono</span>}
        </div>

        {extra.length > 0 && (
          <div className="menu-group min-[901px]:hidden">
            {extra.map((i) => (
              <Link key={i.to} to={i.to} className="menu-item" onClick={close} aria-current={isNavActive(i.to, pathname) ? "page" : undefined}>
                <MenuItemContent icon={i.icon} label={i.label} />
              </Link>
            ))}
          </div>
        )}

        <div className="menu-group">
          <span className="label">Configurações</span>
          {settings.map((s) => (
            <Link key={s.to} to={s.to} className="menu-item" onClick={close} aria-current={pathname === s.to ? "page" : undefined}>
              <MenuItemContent icon={s.icon} label={s.label} />
            </Link>
          ))}
        </div>

        <div className="menu-group">
          <button role="switch" aria-checked={soundOn} type="button" className="menu-item" onClick={() => setSoundOn(!soundOn)}>
            <MenuItemContent
              icon="i-sound"
              label="Som dos avisos"
              badge={<span className={cn("chip !px-1.5 !py-1", soundOn && "!text-neon-cyan")}>{soundOn ? "Ligado" : "Desligado"}</span>}
            />
          </button>
          <button type="button" className="menu-item danger" onClick={() => void session.signOut()}>
            <MenuItemContent icon="i-logout" label="Sair" />
          </button>
        </div>
      </MenuPanel>
    </div>
  );
}

/**
 * Chrome do app no estilo do style tile: barra superior de vidro (marca + abas de console + conta) e,
 * no celular, tab bar inferior. A página rola a janela (topbar sticky), como no tile.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="relative z-[1] min-h-dvh">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-overlay)] focus:chamfer-sm focus:bg-surface-1 focus:px-4 focus:py-2 focus:text-text-1"
      >
        Pular para o conteúdo
      </a>

      <header className="topbar">
        <div className="wrap">
          <Brand />
          <nav aria-label="Navegação principal" className="nav app-nav">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item.to, pathname);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(active && "on")}
                  title={item.label}
                >
                  <Glyph id={item.icon} size={16} />
                  {/* Nome completo quando cabe; em telas médias, o rótulo curto (nome completo no title). */}
                  <span className="hidden min-[1200px]:inline">{item.label}</span>
                  <span className="min-[1200px]:hidden" aria-hidden>
                    {item.short}
                  </span>
                  <span className="sr-only min-[1200px]:hidden">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="controls">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setPaletteOpen(true)}
              aria-label={`Buscar (${PALETTE_SHORTCUT})`}
              title={`Buscar jogos, troféus e telas (${PALETTE_SHORTCUT})`}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      <main
        id="conteudo"
        tabIndex={-1}
        className="wrap pb-28 pt-8 outline-none md:pb-16"
      >
        <Suspense fallback={<div className="label">Carregando…</div>}>
          <Outlet />
        </Suspense>
      </main>

      <UnlockNotices />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <nav aria-label="Navegação" className="tabbar">
        {NAV_ITEMS.filter((i) => i.mobile).map((item) => {
          const active = isNavActive(item.to, pathname);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(active && "on")}
            >
              <Glyph id={item.icon} size={20} />
              {item.short}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
