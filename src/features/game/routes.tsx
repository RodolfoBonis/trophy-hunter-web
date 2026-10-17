import { lazy } from "react";
import type { RouteObject } from "react-router";

const GamePage = lazy(() => import("./GamePage"));

export const gameRoutes: RouteObject[] = [{ path: "games/:gameId", element: <GamePage /> }];
