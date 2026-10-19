export interface NavItem {
  to: string;
  label: string;
  /** Rótulo curto (tab bar do celular e barra superior estreita). */
  short: string;
  /** Símbolo do Sprite (glifos do style tile). */
  icon: string;
  /** Número da seção (mesmo do cabeçalho da página) — a ordem do menu é a ordem das páginas. */
  idx: string;
  /** Aparece na tab bar inferior do celular (máx. 5). */
  mobile: boolean;
}

/** Navegação principal (copy em pt-BR). Ordem = prioridade no fluxo de uso = numeração das páginas. */
export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Início", short: "Início", icon: "i-home", idx: "01", mobile: true },
  { to: "/library", label: "Biblioteca", short: "Jogos", icon: "i-lib", idx: "02", mobile: true },
  { to: "/next", label: "Próxima Platina", short: "Próxima", icon: "t-plat", idx: "03", mobile: true },
  { to: "/timeline", label: "Linha do tempo", short: "Tempo", icon: "i-play", idx: "04", mobile: true },
  { to: "/friends", label: "Amigos", short: "Amigos", icon: "i-user", idx: "05", mobile: true },
  // No celular a Retrospectiva fica no menu da conta (a tab bar comporta 5).
  { to: "/recap", label: "Retrospectiva", short: "Retro", icon: "i-target", idx: "06", mobile: false },
];

/** Número de seção de uma rota principal (para os cabeçalhos das páginas). */
export function sectionIdx(to: string): string {
  return NAV_ITEMS.find((n) => n.to === to)?.idx ?? "";
}

export interface SettingsItem {
  to: string;
  label: string;
  icon: string;
  description: string;
  ownerOnly?: boolean;
}

/** Abas de Configurações (menu da conta). */
export const SETTINGS_ITEMS: SettingsItem[] = [
  { to: "/settings/integrations", label: "Contas conectadas", icon: "i-key", description: "Steam e PSN: conectar, renomear, sincronizar." },
  { to: "/settings/notifications", label: "Notificações", icon: "i-bell", description: "Push neste aparelho, tipos de aviso e som." },
  { to: "/settings/privacy", label: "Privacidade", icon: "i-shield", description: "O que os amigos veem e seus dados." },
  { to: "/settings/sync", label: "Sincronização", icon: "i-sync", description: "Histórico do que foi buscado na Steam e na PSN." },
  { to: "/settings/members", label: "Membros e convites", icon: "i-user", description: "Quem usa o Trophy Hunter e links de convite.", ownerOnly: true },
];

export function isNavActive(to: string, pathname: string): boolean {
  if (to === "/") return pathname === "/";
  // A página do jogo é "filha" da biblioteca.
  if (to === "/library" && pathname.startsWith("/games/")) return true;
  return pathname === to || pathname.startsWith(`${to}/`);
}

/** Itens da conta (menu do usuário, fora de Configurações). */
export const ACCOUNT_ITEMS = [{ to: "/badges", label: "Medalhas", icon: "i-medal", description: "Medalhas do app e a temporada do mês." }] as const;
