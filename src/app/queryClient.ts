import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/endpoints";
import { API_ERROR, CLIENT_ERROR, isApiError } from "@/api/errors";
import { addBreadcrumb, reportError } from "@/lib/observability";
import { PERSIST_MAX_AGE } from "./queryCache";

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
  // Acesso revogado no meio da sessão: qualquer chamada recebe 403 member_removed/not_invited →
  // refaz o /me e o MemberGate troca a tela sozinho (em vez de erro genérico em cada tela).
  const onAccessLost = (error: unknown, key: unknown) => {
    if (!isApiError(error) || (error.code !== API_ERROR.memberRemoved && error.code !== API_ERROR.notInvited)) return;
    if (JSON.stringify(key) === JSON.stringify(queryKeys.me)) return;
    void client.invalidateQueries({ queryKey: queryKeys.me });
  };
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        reportUnhandled(error, "query", query.queryKey);
        onAccessLost(error, query.queryKey);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        reportUnhandled(error, "mutation", mutation.options.mutationKey);
        onAccessLost(error, mutation.options.mutationKey);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        // Vive o mesmo tanto que o cache salvo (queryCache.ts), senão some antes de ser persistida.
        gcTime: PERSIST_MAX_AGE,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
          return failureCount < 1;
        },
      },
      mutations: { retry: false },
    },
  });
  return client;
}
