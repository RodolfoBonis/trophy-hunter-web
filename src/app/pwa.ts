/**
 * Registro do Service Worker (PWA). Só fora do modo mock: no mock quem controla o worker é o MSW, e
 * dois service workers no mesmo escopo brigam. UX de atualização minimalista: ao haver versão nova,
 * aplica e recarrega (single-user, sem edição concorrente — não precisamos de um toast elaborado).
 */
export async function registerPwa(): Promise<void> {
  if (import.meta.env.VITE_API_MOCK === "true") return;
  if (import.meta.env.DEV) return;
  const { registerSW } = await import("virtual:pwa-register");
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      void updateSW(true);
    },
  });
}
