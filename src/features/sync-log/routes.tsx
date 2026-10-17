import { lazy } from "react";
import type { RouteObject } from "react-router";

const SyncLogPage = lazy(() => import("./SyncLogPage"));

export const syncLogRoutes: RouteObject[] = [{ path: "sync", element: <SyncLogPage /> }];
