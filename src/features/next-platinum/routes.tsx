import { lazy } from "react";
import type { RouteObject } from "react-router";

const NextPlatinumPage = lazy(() => import("./NextPlatinumPage"));

export const nextPlatinumRoutes: RouteObject[] = [{ path: "next", element: <NextPlatinumPage /> }];
