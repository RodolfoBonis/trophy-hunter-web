import { lazy } from "react";
import type { RouteObject } from "react-router";

const FriendsPage = lazy(() => import("./FriendsPage"));
const FriendPage = lazy(() => import("./FriendPage"));

export const socialRoutes: RouteObject[] = [
  { path: "friends", element: <FriendsPage /> },
  { path: "friends/:id", element: <FriendPage /> },
];
