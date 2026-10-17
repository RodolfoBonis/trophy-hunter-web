import { LogOut, Menu } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useAuthenticatedSession } from "@/auth/session";
import { Button } from "@/design-system/components/ui/button";
import { useViewport } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { NAV_ITEMS, isNavActive, sectionFor } from "./nav";

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(item.to, pathname);
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "chamfer-sm relative flex items-center gap-3 px-3 py-2.5 font-display text-[12.5px] font-semibold uppercase tracking-[0.06em] transition-colors duration-[var(--dur-fast)]",
              active
                ? "bg-[color-mix(in_oklab,var(--color-neon-cyan)_14%,transparent)] text-neon-cyan"
                : "text-text-2 hover:bg-white/[0.04] hover:text-text-1",
            )}
          >
            {active && <span className="absolute inset-y-1.5 left-0 w-[2px] bg-neon-cyan shadow-glow-cyan" aria-hidden />}
            <Icon className="size-[18px] shrink-0" aria-hidden />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 px-4 py-4 font-display font-bold uppercase tracking-[0.08em]"
      aria-label="Trophy Hunter — início"
    >
      <svg width={26} height={26} aria-hidden className="shrink-0" style={{ color: "var(--color-plat-2)" }}>
        <use href="#t-plat" />
      </svg>
      <span className="text-[15px] text-text-1">
        Trophy <b className="text-neon-cyan">Hunter</b>
      </span>
    </Link>
  );
}

/**
 * Chrome do app (sidebar + topbar HUD) — style tile aprovado. O fundo (grade + scanlines) vem do
 * body; o shell é transparente para deixá-lo aparecer. Topbar em glass, sidebar em surface.
 */
export function AppShell() {
  const viewport = useViewport();
  const location = useLocation();
  const session = useAuthenticatedSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const section = sectionFor(location.pathname);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col">
      <Brand />
      <div className="flex-1 overflow-y-auto">
        <NavList pathname={location.pathname} onNavigate={onNavigate} />
      </div>
      <div className="border-t border-border-subtle p-3">
        <div className="px-2 pb-2 text-caption text-text-3">
          <p className="truncate text-text-1">{session.user.name}</p>
          <p className="truncate">{session.user.email}</p>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => void session.signOut()}>
          <LogOut className="size-4" aria-hidden /> Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="relative z-[1] flex h-full min-h-0">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-overlay)] focus:chamfer-sm focus:bg-surface-1 focus:px-4 focus:py-2 focus:text-text-1"
      >
        Pular para o conteúdo
      </a>

      {viewport !== "mobile" && (
        <aside className="h-full w-[248px] shrink-0 border-r border-border-subtle bg-surface-1/80 backdrop-blur-sm">
          {sidebar()}
        </aside>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[var(--z-sticky)] flex h-16 items-center gap-3 border-b border-border-subtle bg-glass px-4 backdrop-blur-[14px] backdrop-saturate-150">
          {viewport === "mobile" && (
            <>
              <Button variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}>
                <Menu className="size-5" aria-hidden />
              </Button>
              <span className="flex items-center gap-2 font-display font-bold uppercase tracking-[0.08em] text-[15px]">
                <svg width={22} height={22} aria-hidden style={{ color: "var(--color-plat-2)" }}>
                  <use href="#t-plat" />
                </svg>
              </span>
            </>
          )}
          <h1 className="font-display text-[15px] font-bold uppercase tracking-[0.04em] text-text-1">{section}</h1>
        </header>

        <main id="conteudo" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto p-4 outline-none md:p-6">
          <Suspense fallback={<div className="hud-label">Carregando…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {viewport === "mobile" && (
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)}>
          <div className="h-full bg-surface-1">{sidebar(() => setMenuOpen(false))}</div>
        </MobileMenu>
      )}
    </div>
  );
}
