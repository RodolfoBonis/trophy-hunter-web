import { useEffect, useRef } from "react";
import { HudButton } from "@/design-system/components/HudButton";

/**
 * Rolagem infinita: carrega a próxima página quando o sentinela chega perto da tela
 * (IntersectionObserver), com o botão "Carregar mais" como alternativa acessível.
 */
export function LoadMore({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
}) {
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!hasNextPage) return null;
  return (
    <div ref={sentinel} className="flex justify-center py-4">
      <HudButton variant="secondary" onClick={() => void fetchNextPage()} disabled={isFetchingNextPage}>
        {isFetchingNextPage ? "Carregando…" : "Carregar mais"}
      </HudButton>
    </div>
  );
}
