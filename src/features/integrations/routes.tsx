import { lazy } from "react";
import type { RouteObject } from "react-router";

const IntegrationsPage = lazy(() => import("./IntegrationsPage"));

export const integrationsRoutes: RouteObject[] = [
  { path: "settings/integrations", element: <IntegrationsPage /> },
];
