import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

const SettingsLayout = lazy(() => import("./SettingsLayout"));
const IntegrationsPage = lazy(() => import("@/features/integrations/IntegrationsPage"));
const NotificationsSettings = lazy(() => import("./NotificationsSettings"));
const PrivacySettings = lazy(() => import("./PrivacySettings"));
const SyncLogPage = lazy(() => import("@/features/sync-log/SyncLogPage"));
const MembersPage = lazy(() => import("@/features/members/MembersPage"));
const HealthPage = lazy(() => import("@/features/admin/HealthPage"));

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
      { path: "health", element: <HealthPage /> },
    ],
  },
  // Endereço antigo do log de sync.
  { path: "sync", element: <Navigate to="/settings/sync" replace /> },
];
