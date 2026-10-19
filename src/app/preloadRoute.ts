/**
 * Começa a baixar o chunk da tela atual junto com o boot, em vez de esperar sessão + /me: sem isto a
 * página só é pedida depois do /me responder (cascata). Os imports são os mesmos dos `lazy()` das
 * rotas, então o chunk é o mesmo (o navegador reaproveita).
 */
const ROUTES: [RegExp, () => Promise<unknown>[]][] = [
  [/^\/$/, () => [import("@/features/dashboard/DashboardPage")]],
  [/^\/library\/?$/, () => [import("@/features/library/LibraryPage")]],
  [/^\/games\/[^/]+\/?$/, () => [import("@/features/game/GamePage")]],
  [/^\/next\/?$/, () => [import("@/features/next-platinum/NextPlatinumPage")]],
  [/^\/timeline\/?$/, () => [import("@/features/timeline/TimelinePage")]],
  [/^\/recap\/?$/, () => [import("@/features/recap/RecapPage")]],
  [/^\/friends\/?$/, () => [import("@/features/social/FriendsPage")]],
  [/^\/friends\/challenges\/new\/?$/, () => [import("@/features/social/NewChallengePage")]],
  [/^\/friends\/challenges\/[^/]+\/?$/, () => [import("@/features/social/ChallengePage")]],
  [/^\/friends\/[^/]+\/?$/, () => [import("@/features/social/FriendPage")]],
  [/^\/settings\/integrations\/?$/, () => [import("@/features/settings/SettingsLayout"), import("@/features/integrations/IntegrationsPage")]],
  [/^\/settings\/notifications\/?$/, () => [import("@/features/settings/SettingsLayout"), import("@/features/settings/NotificationsSettings")]],
  [/^\/settings\/privacy\/?$/, () => [import("@/features/settings/SettingsLayout"), import("@/features/settings/PrivacySettings")]],
  [/^\/settings\/sync\/?$/, () => [import("@/features/settings/SettingsLayout"), import("@/features/sync-log/SyncLogPage")]],
  [/^\/settings\/members\/?$/, () => [import("@/features/settings/SettingsLayout"), import("@/features/members/MembersPage")]],
];

export function preloadRoute(pathname: string): void {
  const hit = ROUTES.find(([re]) => re.test(pathname));
  // Falha aqui não importa: o lazy() da rota tenta de novo (e trata chunk velho).
  if (hit) for (const p of hit[1]()) p.catch(() => {});
}
