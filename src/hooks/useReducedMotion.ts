import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * `true` quando o usuário pede menos animação (SO). As animações do `motion` devem respeitar isto;
 * o CSS também expõe `--th-motion` (ver tokens.css) para transições puramente declarativas.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
