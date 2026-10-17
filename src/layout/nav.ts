import {
  LayoutDashboard,
  Library,
  ListChecks,
  Plug,
  RefreshCw,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

/** Navegação do app (copy em pt-BR). Ordem = prioridade no fluxo de uso. */
export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/library", label: "Biblioteca", icon: Library },
  { to: "/next", label: "Próxima Platina", icon: Trophy },
  { to: "/timeline", label: "Linha do tempo", icon: ListChecks },
  { to: "/settings/integrations", label: "Integrações", icon: Plug },
  { to: "/sync", label: "Sync", icon: RefreshCw },
];

export function isNavActive(to: string, pathname: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function sectionFor(pathname: string): string {
  // Jogo é filho da biblioteca no breadcrumb.
  if (pathname.startsWith("/games/")) return "Biblioteca";
  for (const item of NAV_ITEMS) {
    if (isNavActive(item.to, pathname)) return item.label;
  }
  return "Trophy Hunter";
}
