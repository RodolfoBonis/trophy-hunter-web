import { useSyncExternalStore } from "react";

/** Viewport do app shell: mobile (<768), tablet (768–1279) e desktop (≥1280). */
export type Viewport = "mobile" | "tablet" | "desktop";

export const BREAKPOINTS = { tablet: 768, desktop: 1280 } as const;

function query(q: string) {
  return {
    subscribe(onChange: () => void) {
      const mql = window.matchMedia(q);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    get() {
      return window.matchMedia(q).matches;
    },
  };
}

export function useMediaQuery(q: string): boolean {
  const store = query(q);
  return useSyncExternalStore(
    store.subscribe,
    store.get,
    () => false,
  );
}

export function useViewport(): Viewport {
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.desktop}px)`);
  const isTablet = useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px)`);
  if (isDesktop) return "desktop";
  if (isTablet) return "tablet";
  return "mobile";
}
