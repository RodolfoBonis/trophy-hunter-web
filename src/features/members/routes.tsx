import { lazy } from "react";
import type { RouteObject } from "react-router";

const MembersPage = lazy(() => import("./MembersPage"));

export const membersRoutes: RouteObject[] = [
  { path: "settings/members", element: <MembersPage /> },
];
