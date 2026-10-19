import { lazy } from "react";
import type { RouteObject } from "react-router";

const BadgesPage = lazy(() => import("./BadgesPage"));

export const badgesRoutes: RouteObject[] = [{ path: "badges", element: <BadgesPage /> }];
