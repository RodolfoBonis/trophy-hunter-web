import { lazy } from "react";
import type { RouteObject } from "react-router";

const RecapPage = lazy(() => import("./RecapPage"));

export const recapRoutes: RouteObject[] = [{ path: "recap", element: <RecapPage /> }];
