import {
  CommandPalette,
  PALETTE_SHORTCUT,
} from "@/features/command-palette/CommandPalette";
import { setSoundOn, useSoundOn } from "@/features/unlocks/sound";
import { UnlockNotices } from "@/features/unlocks/UnlockNotices";
import { Suspense, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useAuthenticatedSession } from "@/auth/session";
import { cn } from "@/lib/utils";
import { useIsOwner } from "@/features/members/queries";
import { NAV_ITEMS, isNavActive } from "./nav";

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

/** Menu do usuário (nome, e-mail, sair) — popover simples acessível por teclado. */
function UserMenu() {
  const session = useAuthenticatedSession();
  const isOwner = useIsOwner();
  const [open, setOpen] = useState(false);
  const soundOn = useSoundOn();
  const ref = useRef<HTMLDivElement>(null);
  const initials = (session.user.name ?? session.user.email ?? "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Conta de ${session.user.name ?? "usuário"}`}
        className="chamfer-sm grid size-9 place-items-center bg-surface-2 font-display text-xs font-bold text-neon-cyan shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-surface-3"
      >
        {initials}
      </button>
      {open && (
        <div
          role="menu"
          className="panel sm absolute right-0 top-12 z-[var(--z-overlay)] w-64"
        >
          <p className="truncate font-display text-sm font-semibold text-text-1">
            {session.user.name}
          </p>
          <p className="caption truncate">{session.user.email}</p>
          <div className="mt-3 flex flex-col gap-1 border-t border-border-subtle pt-3">
            <Link
              role="menuitem"
              to="/settings/integrations"
              className="label !text-text-2 no-underline hover:!text-text-1"
              onClick={() => setOpen(false)}
            >
              Contas conectadas
            </Link>
            {isOwner && (
              <Link
                role="menuitem"
                to="/settings/members"
                className="label !text-text-2 no-underline hover:!text-text-1"
                onClick={() => setOpen(false)}
              >
                Membros e convites
              </Link>
            )}
            <Link
              role="menuitem"
              to="/sync"
              className="label !text-text-2 no-underline hover:!text-text-1"
              onClick={() => setOpen(false)}
            >
              Log de sync
            </Link>
            <button
              role="menuitemcheckbox"
              aria-checked={soundOn}
              type="button"
              className="label text-left !text-text-2 hover:!text-text-1"
              onClick={() => setSoundOn(!soundOn)}
            >
              Som dos avisos: {soundOn ? "ligado" : "desligado"}
            </button>
            <button
              role="menuitem"
              type="button"
              className="label text-left !text-danger"
              onClick={() => void session.signOut()}
            >
              Sair
            </button>
          </div>
        </div>
      )}
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
                >
                  <Glyph id={item.icon} size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="controls">
            <button
              type="button"
              className="cmdk-trigger"
              onClick={() => setPaletteOpen(true)}
              aria-label={`Buscar (${PALETTE_SHORTCUT})`}
            >
              <Glyph id="i-target" size={14} />
              <span className="t">Buscar</span>
              <kbd>{PALETTE_SHORTCUT}</kbd>
            </button>
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
