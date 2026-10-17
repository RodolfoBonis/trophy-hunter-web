import { LogOut, Menu, Trophy } from "lucide-react";
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
              "flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-surface-2 text-text" : "text-muted hover:bg-surface-2 hover:text-text",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2 px-4 py-4 text-text" aria-label="Trophy Hunter — início">
      <Trophy className="size-5 text-accent" aria-hidden />
      <span className="font-semibold">Trophy Hunter</span>
    </Link>
  );
}

/**
 * Chrome do app (sidebar + topbar). Estilo neutro/placeholder até o style tile. Desktop/tablet usam
 * a sidebar fixa; mobile usa topbar compacta + gaveta. Inclui skip link e Suspense para o
 * code-splitting por rota.
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
      <div className="border-t border-border p-3">
        <div className="px-2 pb-2 text-xs text-muted">
          <p className="truncate text-text">{session.user.name}</p>
          <p className="truncate">{session.user.email}</p>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => void session.signOut()}>
          <LogOut className="size-4" aria-hidden /> Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 bg-canvas">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[var(--radius)] focus:bg-surface focus:px-4 focus:py-2 focus:text-text"
      >
        Pular para o conteúdo
      </a>

      {viewport !== "mobile" && (
        <aside className="h-full w-[248px] shrink-0 border-r border-border bg-surface">{sidebar()}</aside>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-surface px-4">
          {viewport === "mobile" && (
            <Button variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}>
              <Menu className="size-5" aria-hidden />
            </Button>
          )}
          <h1 className="text-sm font-semibold text-text">{section}</h1>
        </header>

        <main id="conteudo" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto p-4 outline-none md:p-6">
          <Suspense fallback={<div className="text-sm text-muted">Carregando…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {viewport === "mobile" && (
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)}>
          {sidebar(() => setMenuOpen(false))}
        </MobileMenu>
      )}
    </div>
  );
}
