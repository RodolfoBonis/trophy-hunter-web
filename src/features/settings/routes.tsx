import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

const SettingsLayout = lazy(() => import("./SettingsLayout"));
const IntegrationsPage = lazy(() => import("@/features/integrations/IntegrationsPage"));
const NotificationsSettings = lazy(() => import("./NotificationsSettings"));
const PrivacySettings = lazy(() => import("./PrivacySettings"));
const SyncLogPage = lazy(() => import("@/features/sync-log/SyncLogPage"));
const MembersPage = lazy(() => import("@/features/members/MembersPage"));

export const settingsRoutes: RouteObject[] = [
  {
    path: "settings",
    element: <SettingsLayout />,
    children: [
      { index: true, element: <Navigate to="integrations" replace /> },
      { path: "integrations", element: <IntegrationsPage /> },
      { path: "notifications", element: <NotificationsSettings /> },
      { path: "privacy", element: <PrivacySettings /> },
      { path: "sync", element: <SyncLogPage /> },
      { path: "members", element: <MembersPage /> },
    ],
  },
  // Endereço antigo do log de sync.
  { path: "sync", element: <Navigate to="/settings/sync" replace /> },
];
