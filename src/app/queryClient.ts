import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { CLIENT_ERROR, isApiError } from "@/api/errors";
import { addBreadcrumb, reportError } from "@/lib/observability";

/**
 * Observabilidade das queries/mutações num ponto só: o ApiClient já reporta 5xx e respostas fora do
 * contrato; aqui entra o resto — erros que não são da API (bug de código) são reportados e falhas de
 * rede viram breadcrumb (contexto para o próximo erro, sem ruído). 4xx de negócio não são incidentes.
 */
function reportUnhandled(error: unknown, source: "query" | "mutation", key: unknown): void {
  if (isApiError(error)) {
    if (error.code === CLIENT_ERROR.network) {
      addBreadcrumb({ category: source, level: "warning", message: `network error on ${JSON.stringify(key)}` });
    }
    return;
  }
  if (error instanceof DOMException && error.name === "AbortError") return;
  reportError(error, { source, key });
}

/**
 * Política de cache/retry: não re-tenta erros 4xx (a UI degrada na hora) e re-tenta uma vez falhas de
 * rede/5xx.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: (error, query) => reportUnhandled(error, "query", query.queryKey) }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => reportUnhandled(error, "mutation", mutation.options.mutationKey),
    }),
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
          return failureCount < 1;
        },
      },
      mutations: { retry: false },
    },
  });
}
