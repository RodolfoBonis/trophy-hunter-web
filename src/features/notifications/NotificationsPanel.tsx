import type { NotificationPreferences } from "@/api/schemas";
import { Button } from "@/design-system/components/ui/button";
import { setSoundOn, useSoundOn } from "@/features/unlocks/sound";
import { permission, PermissionDeniedError, pushSupport } from "./browserPush";
import {
  useDisablePush,
  useEnablePush,
  useLocalSubscription,
  useNotificationPrefs,
  usePushStatus,
  useSaveNotificationPrefs,
  useTestPush,
} from "./queries";

const PREFS: [keyof NotificationPreferences, string, string][] = [
  [
    "unlocks",
    "Troféus novos",
    "Quando o sync encontrar troféus/conquistas que você acabou de pegar.",
  ],
  ["completions", "Platina e 100%", "Quando um jogo fechar."],
  ["reconnect", "Conta precisa de você", "Ex.: reautenticar a PSN ou deixar o perfil Steam público."],
  ["ai_ready", "Guia pronto", "Quando um guia ou roadmap de IA terminar."],
  ["challenges", "Desafios", "Convites, quando um amigo avança e o resultado."],
];

const UNSUPPORTED_TEXT = {
  "ios-install":
    "No iPhone/iPad, notificações só funcionam com o app instalado: no Safari, Compartilhar → Adicionar à Tela de Início, e abra por lá.",
  unsupported: "Este navegador não suporta notificações push.",
  dev: "Notificações push ficam indisponíveis no modo de desenvolvimento/demonstração.",
} as const;

/**
 * Notificações: ativar web push neste aparelho, testar, escolher os tipos e o som dos avisos no app.
 */
export function NotificationsPanel() {
  const support = pushSupport();
  const status = usePushStatus();
  const local = useLocalSubscription(
    support.ok && (status.data?.enabled ?? false),
  );
  const enable = useEnablePush();
  const disable = useDisablePush();
  const test = useTestPush();
  const prefs = useNotificationPrefs();
  const savePrefs = useSaveNotificationPrefs();
  const soundOn = useSoundOn();

  const subscribed = local.data === true;
  const denied = support.ok && permission() === "denied";
  const serverOff = status.data && !status.data.enabled;

  return (
    <section
      aria-labelledby="notif-title"
      className="panel flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1">
        <h3 id="notif-title" className="sub !mb-0">
          Notificações
        </h3>
        <p className="caption">
          Avisos no celular/computador mesmo com o app fechado.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {!support.ok && (
          <p className="text-sm text-text-2">
            {UNSUPPORTED_TEXT[support.reason]}
          </p>
        )}
        {support.ok && serverOff && (
          <p className="text-sm text-text-2">
            O servidor ainda não está configurado para enviar notificações.
          </p>
        )}
        {support.ok && denied && (
          <p role="alert" className="text-sm text-warning">
            As notificações estão bloqueadas para este site. Libere nas
            configurações do navegador e recarregue.
          </p>
        )}
        {support.ok && status.data?.enabled && !denied && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="label" aria-live="polite">
              {local.isPending
                ? "Verificando…"
                : subscribed
                  ? "Ativas neste aparelho"
                  : "Desligadas neste aparelho"}
            </span>
            {subscribed ? (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => test.mutate()}
                  disabled={test.isPending}
                >
                  {test.isPending ? "Enviando…" : "Enviar teste"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => disable.mutate()}
                  disabled={disable.isPending}
                >
                  Desativar neste aparelho
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => enable.mutate(status.data!.public_key)}
                disabled={enable.isPending || local.isPending}
              >
                {enable.isPending ? "Ativando…" : "Ativar notificações"}
              </Button>
            )}
            <span className="caption">
              {status.data.subscriptions}{" "}
              {status.data.subscriptions === 1
                ? "aparelho inscrito"
                : "aparelhos inscritos"}
            </span>
          </div>
        )}
        {enable.isError && (
          <p role="alert" className="text-sm text-danger">
            {enable.error instanceof PermissionDeniedError
              ? "Você não permitiu as notificações."
              : "Não foi possível ativar as notificações. Tente de novo."}
          </p>
        )}
        {test.data && (
          <p className="text-sm text-text-2" role="status">
            Teste enviado para {test.data.sent}{" "}
            {test.data.sent === 1 ? "aparelho" : "aparelhos"}
            {test.data.failed > 0 ? ` (${test.data.failed} falharam)` : ""}.
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-3" disabled={!prefs.data}>
        <legend className="label mb-2">O que avisar</legend>
        {PREFS.map(([key, label, help]) => (
          <label key={key} className="switch !items-start">
            <input
              type="checkbox"
              checked={prefs.data?.[key] ?? true}
              onChange={(e) =>
                prefs.data &&
                savePrefs.mutate({ ...prefs.data, [key]: e.target.checked })
              }
            />
            <span className="flex flex-col">
              <span className="text-sm text-text-1">{label}</span>
              <span className="caption">{help}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <label className="switch">
        <input
          type="checkbox"
          checked={soundOn}
          onChange={(e) => setSoundOn(e.target.checked)}
        />
        Som nos avisos dentro do app
      </label>
    </section>
  );
}
