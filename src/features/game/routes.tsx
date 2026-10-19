import { lazy } from "react";
import type { RouteObject } from "react-router";

const GamePage = lazy(() => import("./GamePage"));
const HuntPage = lazy(() => import("@/features/hunt/HuntPage"));

export const gameRoutes: RouteObject[] = [
  { path: "games/:gameId", element: <GamePage /> },
  { path: "games/:gameId/hunt", element: <HuntPage /> },
];
