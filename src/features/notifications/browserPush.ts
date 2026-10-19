/**
 * Adaptador da Push API do navegador (isolado para os testes trocarem por um fake).
 *
 * - iPhone/iPad: web push só funciona com o app instalado na tela inicial (iOS ≥ 16.4).
 * - Modo mock/dev: o service worker é o do MSW (ou nenhum) — push fica indisponível.
 */

export type PushSupport =
  { ok: true } | { ok: false; reason: "unsupported" | "ios-install" | "dev" };

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function pushSupport(): PushSupport {
  if (import.meta.env.VITE_API_MOCK === "true" || import.meta.env.DEV)
    return { ok: false, reason: "dev" };
  if (isIOS() && !isStandalone()) return { ok: false, reason: "ios-install" };
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    return { ok: false, reason: "unsupported" };
  }
  return { ok: true };
}

export function permission(): NotificationPermission {
  return "Notification" in window ? Notification.permission : "denied";
}

/**
 * O service worker ainda não está ativo (primeira visita, atualização esperando, Safari). Não é bug:
 * o estado do push fica "desconhecido" por enquanto.
 */
export class ServiceWorkerUnavailableError extends Error {
  constructor() {
    super("service worker indisponível");
    this.name = "ServiceWorkerUnavailableError";
  }
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const reg = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => setTimeout(() => reject(new ServiceWorkerUnavailableError()), 8000)),
  ]);
  return reg;
}

/** Inscrição atual deste navegador (null se não inscrito). */
export async function currentSubscription(): Promise<PushSubscription | null> {
  return (await registration()).pushManager.getSubscription();
}

/** Pede permissão e inscreve com a chave pública VAPID (base64url). */
export async function subscribe(
  publicKey: string,
): Promise<PushSubscriptionJSON> {
  const result = await Notification.requestPermission();
  if (result !== "granted") throw new PermissionDeniedError();
  const reg = await registration();
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToBytes(publicKey),
    }));
  return sub.toJSON();
}

/** Cancela a inscrição local; devolve o endpoint que estava inscrito (para avisar a API). */
export async function unsubscribe(): Promise<string | null> {
  const sub = await currentSubscription();
  if (!sub) return null;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  return endpoint;
}

export class PermissionDeniedError extends Error {
  constructor() {
    super("Permissão de notificação negada");
    this.name = "PermissionDeniedError";
  }
}

/** base64url → bytes (applicationServerKey). */
export function base64UrlToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
