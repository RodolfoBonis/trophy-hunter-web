import { API_ERROR, isApiError } from "@/api/errors";

/** Mensagem para um pedido de IA que falhou: o teto diário (membros) tem texto próprio. */
export function aiRequestError(error: unknown, fallback: string): string {
  if (isApiError(error) && error.code === API_ERROR.aiDailyLimit) {
    return "Você chegou ao limite de pedidos de IA de hoje. Amanhã libera de novo.";
  }
  return fallback;
}
