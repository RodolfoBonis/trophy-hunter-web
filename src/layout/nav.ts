export interface NavItem {
  to: string;
  label: string;
  /** Rótulo curto (tab bar do celular). */
  short: string;
  /** Símbolo do Sprite (glifos do style tile). */
  icon: string;
  /** Aparece na tab bar inferior do celular (máx. 5). */
  mobile: boolean;
  /** Fica fora da barra superior (cabe no menu da conta/paleta) — a barra comporta ~7 itens. */
  topbar?: false;
}

/** Navegação do app (copy em pt-BR). Ordem = prioridade no fluxo de uso. */
export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Início", short: "Início", icon: "i-home", mobile: true },
  { to: "/library", label: "Biblioteca", short: "Jogos", icon: "i-lib", mobile: true },
  { to: "/next", label: "Próxima Platina", short: "Próxima", icon: "t-plat", mobile: true },
  { to: "/timeline", label: "Linha do tempo", short: "Tempo", icon: "i-play", mobile: true },
  { to: "/friends", label: "Amigos", short: "Amigos", icon: "i-user", mobile: true },
  { to: "/recap", label: "Retrospectiva", short: "Retro", icon: "i-target", mobile: false },
  // No celular, Contas fica no menu da conta (a tab bar comporta 5).
  { to: "/settings/integrations", label: "Contas", short: "Contas", icon: "i-key", mobile: false },
  { to: "/sync", label: "Sync", short: "Sync", icon: "i-sync", mobile: false, topbar: false },
];

export function isNavActive(to: string, pathname: string): boolean {
  if (to === "/") return pathname === "/";
  // A página do jogo é "filha" da biblioteca.
  if (to === "/library" && pathname.startsWith("/games/")) return true;
  return pathname === to || pathname.startsWith(`${to}/`);
}
