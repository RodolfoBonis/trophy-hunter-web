import { lazy } from "react";
import type { RouteObject } from "react-router";

const FriendsPage = lazy(() => import("./FriendsPage"));
const FriendPage = lazy(() => import("./FriendPage"));
const ChallengePage = lazy(() => import("./ChallengePage"));
const NewChallengePage = lazy(() => import("./NewChallengePage"));

export const socialRoutes: RouteObject[] = [
  { path: "friends", element: <FriendsPage /> },
  { path: "friends/challenges/new", element: <NewChallengePage /> },
  { path: "friends/challenges/:id", element: <ChallengePage /> },
  { path: "friends/:id", element: <FriendPage /> },
];
