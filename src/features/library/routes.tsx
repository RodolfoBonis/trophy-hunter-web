import { lazy } from "react";
import type { RouteObject } from "react-router";

const LibraryPage = lazy(() => import("./LibraryPage"));

export const libraryRoutes: RouteObject[] = [{ path: "library", element: <LibraryPage /> }];
