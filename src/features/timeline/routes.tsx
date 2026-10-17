import { lazy } from "react";
import type { RouteObject } from "react-router";

const TimelinePage = lazy(() => import("./TimelinePage"));

export const timelineRoutes: RouteObject[] = [{ path: "timeline", element: <TimelinePage /> }];
