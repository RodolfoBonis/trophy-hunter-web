/**
 * Proteção contra "versão velha na aba": as telas são carregadas sob demanda (lazy). Se a aba ficou
 * aberta durante um deploy, o app antigo pede um pedaço de tela que não existe mais e o import falha.
 * Nesse caso recarregamos a página UMA vez (guarda em sessionStorage contra laço) para pegar a versão
 * nova, em vez de mostrar a tela de erro.
 */
const KEY = "th:stale-chunk-reload";
const WINDOW_MS = 30_000;

/** O erro é de pedaço de JS/CSS que não carregou (deploy novo)? Mensagens de Chrome/Firefox/Safari. */
export function isStaleChunkError(error: unknown): boolean {
  const msg = error instanceof Error ? `${error.name} ${error.message}` : String(error ?? "");
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Unable to preload CSS/i.test(
    msg,
  );
}

/** Recarrega uma vez por janela de 30 s. Devolve false se já tentou (deixa o erro aparecer). */
export function reloadOnceForNewVersion(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < WINDOW_MS) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* sessionStorage indisponível: recarrega mesmo assim */
  }
  window.location.reload();
  return true;
}

/** Registra o handler do Vite para falha de preload de módulos. Chamado no boot. */
export function installStaleChunkGuard(): void {
  window.addEventListener("vite:preloadError", (event) => {
    if (reloadOnceForNewVersion()) event.preventDefault();
  });
}
