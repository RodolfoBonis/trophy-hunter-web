import { Check, KeyRound, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { isApiError } from "@/api/errors";
import type { Integration, IntegrationStatus, SyncRun } from "@/api/schemas";
import { Banner } from "@/design-system/components/Banner";
import { SettingsTitle } from "@/features/settings/SettingsLayout";
import { Panel } from "@/design-system/components/Panel";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { ProgressBar } from "@/design-system/components/ProgressBar";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useConnectPSN,
  useConnectSteam,
  useIntegrations,
  useReconnect,
  useLatestRuns,
  useRemoveIntegration,
  useRenameIntegration,
  useSyncNow,
} from "./queries";

const STATUS: Record<IntegrationStatus, { label: string; cls: string }> = {
  connected: { label: "Conectado", cls: "text-success" },
  needs_reconnect: { label: "Reconectar", cls: "text-danger" },
  error_private: { label: "Perfil privado", cls: "text-warning" },
  error: { label: "Erro", cls: "text-danger" },
  disabled: { label: "Desativado", cls: "text-text-3" },
};

function StatusChip({ status }: { status: IntegrationStatus }) {
  const s = STATUS[status];
  return (
    <span className={cn("hud-label", s.cls)}>
      <span
        className="mr-1.5 inline-block size-2 rounded-full bg-current align-middle"
        aria-hidden
      />
      {s.label}
    </span>
  );
}

/** Apelido da conta com edição inline (Enter salva, Esc cancela). */
function AccountLabel({ integration }: { integration: Integration }) {
  const rename = useRenameIntegration();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(integration.label);

  function save(e: FormEvent) {
    e.preventDefault();
    const label = value.trim();
    if (!label || label === integration.label) {
      setEditing(false);
      return;
    }
    rename.mutate(
      { id: integration.id, label },
      { onSuccess: () => setEditing(false) },
    );
  }

  if (!editing) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate font-display text-h4 font-bold uppercase tracking-[0.02em] text-text-1">
          {integration.label}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setValue(integration.label);
            setEditing(true);
          }}
          aria-label={`Renomear a conta ${integration.label}`}
        >
          <Pencil className="size-4" aria-hidden />
        </Button>
      </div>
    );
  }
  return (
    <form onSubmit={save} className="flex items-center gap-2">
      <Label htmlFor={`label-${integration.id}`} className="sr-only">
        Apelido da conta
      </Label>
      <Input
        id={`label-${integration.id}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
        maxLength={40}
        autoFocus
        className="h-9 w-48"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={rename.isPending}
        aria-label="Salvar apelido"
      >
        <Check className="size-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setEditing(false)}
        aria-label="Cancelar"
      >
        <X className="size-4" aria-hidden />
      </Button>
    </form>
  );
}

/** Remoção em dois passos (sem modal): o 1º clique pede confirmação explícita. */
function RemoveAccount({ integration }: { integration: Integration }) {
  const remove = useRemoveIntegration();
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(true)}
        className="text-text-3 hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden /> Remover
      </Button>
    );
  }
  return (
    <div
      role="group"
      aria-label="Confirmar remoção"
      className="flex items-center gap-2"
    >
      <span className="text-sm text-text-2">
        Remover {integration.label} e os jogos dela?
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setConfirming(false)}
      >
        Cancelar
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => remove.mutate(integration.id)}
        disabled={remove.isPending}
      >
        Remover conta
      </Button>
    </div>
  );
}

function IntegrationCard({
  integration,
  runningRun,
}: {
  integration: Integration;
  runningRun?: SyncRun;
}) {
  const sync = useSyncNow();
  const needsAttention =
    integration.status === "needs_reconnect" || integration.status === "error";
  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <PlatformBadge platform={integration.platform} />
          <AccountLabel integration={integration} />
        </div>
        <StatusChip status={integration.status} />
      </div>

      {runningRun && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-numeric text-xs tabular-nums text-text-2">
            <span className="hud-label text-neon-cyan">Sincronizando…</span>
            <span>
              {runningRun.games_done ?? 0}/{runningRun.games_total ?? 0} jogos
              {(runningRun.games_failed ?? 0) > 0 && (
                <span className="ml-2 text-warning">
                  · {runningRun.games_failed} falhas
                </span>
              )}
            </span>
          </div>
          <ProgressBar
            value={
              (runningRun.games_total ?? 0) > 0
                ? ((runningRun.games_done ?? 0) /
                    (runningRun.games_total ?? 1)) *
                  100
                : 0
            }
          />
        </div>
      )}

      <dl className="grid gap-1 text-sm">
        {integration.display_name && (
          <div className="flex gap-2">
            <dt className="text-text-3">Conta:</dt>
            <dd className="text-text-1">{integration.display_name}</dd>
          </div>
        )}
        {integration.last_synced_at && (
          <div className="flex gap-2">
            <dt className="text-text-3">Último sync:</dt>
            <dd className="text-text-2">
              {new Date(integration.last_synced_at).toLocaleString("pt-BR")}
            </dd>
          </div>
        )}
      </dl>

      {needsAttention && integration.last_error && (
        <Banner
          tone="danger"
          title={
            integration.status === "needs_reconnect"
              ? "Reconexão necessária"
              : "Falha na integração"
          }
        >
          {integration.last_error}
        </Banner>
      )}
      {integration.platform === "psn" &&
        integration.status === "needs_reconnect" && (
          <ReconnectPSN integrationId={integration.id} />
        )}
      {integration.platform === "psn" &&
        integration.status !== "needs_reconnect" && (
          <UpdateNpsso integrationId={integration.id} />
        )}
      {integration.status === "error_private" && (
        <Banner tone="warning" title="Perfil privado">
          Libere &quot;Detalhes do jogo&quot; como público na Steam para
          sincronizar.
        </Banner>
      )}
      {sync.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível iniciar o sync.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => sync.mutate(integration.id)}
          disabled={sync.isPending}
        >
          <RefreshCw
            className={cn("size-4", sync.isPending && "animate-spin")}
            aria-hidden
          />{" "}
          Sincronizar agora
        </Button>
        <RemoveAccount integration={integration} />
      </div>
    </Panel>
  );
}

/**
 * Adiciona uma conta Steam: basta o perfil. A API key é opcional (avançado) — sem ela, a API usa a
 * key de outra conta Steam da pessoa ou a key do servidor; qualquer key lê perfis públicos.
 */
export function ConnectSteamForm({
  hasSteamAccount,
}: {
  hasSteamAccount: boolean;
}) {
  const connect = useConnectSteam();
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [account, setAccount] = useState("");
  const fieldError =
    connect.error && isApiError(connect.error) ? connect.error : null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    connect.mutate(
      {
        steam_id_or_vanity: account.trim(),
        ...(label.trim() ? { label: label.trim() } : {}),
        ...(apiKey.trim() ? { api_key: apiKey.trim() } : {}),
      },
      {
        onSuccess: () => {
          setLabel("");
          setApiKey("");
          setAccount("");
        },
      },
    );
  }

  return (
    <Panel className="flex flex-col gap-4">
      <h2 className="font-display text-h4 font-bold uppercase tracking-[0.02em] text-text-1">
        {hasSteamAccount ? "Adicionar conta Steam" : "Conectar Steam"}
      </h2>
      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="steam-label" className="hud-label">
            Apelido (opcional)
          </Label>
          <Input
            id="steam-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={hasSteamAccount ? "Alt" : "Principal"}
            maxLength={40}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="steam-account" className="hud-label">
            SteamID64 ou vanity
          </Label>
          <Input
            id="steam-account"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="76561198... ou nome-do-perfil"
            autoComplete="off"
            required
          />
          <p className="text-caption text-text-3">
            17 dígitos = SteamID64; qualquer outra coisa é tratada como vanity.
            O perfil e os &quot;Detalhes do jogo&quot; precisam estar públicos.
          </p>
        </div>
        <details className="group flex flex-col gap-1.5">
          <summary className="cursor-pointer text-caption text-text-3 hover:text-text-1">
            Avançado: usar a sua própria Steam Web API key
          </summary>
          <div className="mt-2 flex flex-col gap-1.5">
            <Label htmlFor="steam-api-key" className="hud-label">
              Steam Web API key (opcional)
            </Label>
            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-3"
                aria-hidden
              />
              <Input
                id="steam-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••"
                autoComplete="off"
                spellCheck={false}
                aria-describedby="steam-api-key-hint"
                className="pl-10"
              />
            </div>
            <p id="steam-api-key-hint" className="text-caption text-text-3">
              Em branco, o app usa {hasSteamAccount ? "a key da sua outra conta ou " : ""}a key do
              servidor — ela lê qualquer perfil público. Gere a sua em steamcommunity.com/dev/apikey.
            </p>
          </div>
        </details>
        {fieldError && (
          <p role="alert" className="text-sm text-danger">
            {fieldError.message || "Não foi possível conectar."}
          </p>
        )}
        {connect.isSuccess && (
          <p className="text-sm text-success">
            Conta conectada — o sync completo já começou.
          </p>
        )}
        <Button
          type="submit"
          disabled={connect.isPending}
          className="self-start"
        >
          {connect.isPending
            ? "Conectando…"
            : hasSteamAccount
              ? "Adicionar conta"
              : "Conectar"}
        </Button>
      </form>
    </Panel>
  );
}

/** Integrações — tela funcional (HUD). Lista integrações, conecta Steam e dispara sync manual. */
export default function IntegrationsPage() {
  const query = useIntegrations();
  const runs = useLatestRuns();
  // Run em andamento mais recente por conta (a lista vem do mais novo para o mais antigo).
  const runningFor = (id: string) =>
    runs.data?.find((r) => r.integration_id === id && r.status === "running");
  const hasSteamAccount =
    query.data?.some((i) => i.platform === "steam") ?? false;
  return (
    <section className="flex flex-col gap-6">
      <SettingsTitle title="Contas conectadas" subtitle="Contas da Steam e da PSN conectadas ao Trophy Hunter." />
      {query.isPending && <Skeleton className="h-40 w-full" />}
      {query.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar as integrações.
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        {query.data?.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            runningRun={runningFor(integration.id)}
          />
        ))}
      </div>
      {query.data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ConnectSteamForm hasSteamAccount={hasSteamAccount} />
          <ConnectPSNForm />
        </div>
      )}
    </section>
  );
}

/** Como obter o NPSSO (mostrado nos formulários da PSN). */
function NpssoHelp({ id }: { id: string }) {
  return (
    <ol
      id={id}
      className="m-0 grid list-decimal gap-1 pl-5 text-caption text-text-3"
    >
      <li>
        Entre em{" "}
        <a
          href="https://www.playstation.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          playstation.com
        </a>{" "}
        com a sua conta.
      </li>
      <li>
        Na mesma janela, abra{" "}
        <a
          href="https://ca.account.sony.com/api/v1/ssocookie"
          target="_blank"
          rel="noopener noreferrer"
        >
          ca.account.sony.com/api/v1/ssocookie
        </a>{" "}
        e copie o valor de <span className="mono">npsso</span>.
      </li>
      <li>
        O NPSSO só é trocado por tokens — nunca fica gravado. Ele expira em
        semanas; aí é só colar outro.
      </li>
    </ol>
  );
}

/** Conecta uma conta PSN pelo NPSSO. */
export function ConnectPSNForm() {
  const connect = useConnectPSN();
  const [label, setLabel] = useState("");
  const [npsso, setNpsso] = useState("");
  const error =
    connect.error && isApiError(connect.error) ? connect.error : null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    connect.mutate(
      { npsso: npsso.trim(), ...(label.trim() ? { label: label.trim() } : {}) },
      {
        onSuccess: () => {
          setLabel("");
          setNpsso("");
        },
      },
    );
  }

  return (
    <Panel className="flex flex-col gap-4">
      <h2 className="font-display text-h4 font-bold uppercase tracking-[0.02em] text-text-1">
        Conectar PSN
      </h2>
      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
        <div className="field">
          <label htmlFor="psn-label">Apelido da conta PSN (opcional)</label>
          <Input
            id="psn-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={40}
            placeholder="Principal"
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="psn-npsso">NPSSO</label>
          <Input
            id="psn-npsso"
            icon="i-key"
            type="password"
            value={npsso}
            onChange={(e) => setNpsso(e.target.value)}
            required
            autoComplete="off"
            spellCheck={false}
            aria-describedby="psn-npsso-help"
            placeholder="cole o valor de npsso"
          />
          <NpssoHelp id="psn-npsso-help" />
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error.message || "Não foi possível conectar."}
          </p>
        )}
        {connect.isSuccess && (
          <p className="text-sm text-success">
            PSN conectada — o sync completo já começou.
          </p>
        )}
        <Button
          type="submit"
          variant="psn"
          disabled={connect.isPending}
          className="self-start"
        >
          {connect.isPending ? "Conectando…" : "Conectar PSN"}
        </Button>
      </form>
    </Panel>
  );
}

/** Reconexão inline de uma conta PSN expirada. */
function ReconnectPSN({
  integrationId,
  onDone,
}: {
  integrationId: string;
  onDone?: () => void;
}) {
  const reconnect = useReconnect();
  const [npsso, setNpsso] = useState("");
  const error =
    reconnect.error && isApiError(reconnect.error) ? reconnect.error : null;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        reconnect.mutate(
          { id: integrationId, npsso: npsso.trim() },
          {
            onSuccess: () => {
              setNpsso("");
              onDone?.();
            },
          },
        );
      }}
      className="flex flex-col gap-3"
    >
      <div className="field !max-w-none">
        <label htmlFor={`reconnect-${integrationId}`}>Novo NPSSO</label>
        <Input
          id={`reconnect-${integrationId}`}
          icon="i-key"
          type="password"
          value={npsso}
          onChange={(e) => setNpsso(e.target.value)}
          required
          autoComplete="off"
          spellCheck={false}
          aria-describedby={`reconnect-help-${integrationId}`}
        />
        <NpssoHelp id={`reconnect-help-${integrationId}`} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error.message || "Não foi possível reconectar."}
        </p>
      )}
      <Button
        type="submit"
        variant="psn"
        size="sm"
        disabled={reconnect.isPending}
        className="self-start"
      >
        {reconnect.isPending ? "Reconectando…" : "Reconectar"}
      </Button>
    </form>
  );
}

/**
 * "Atualizar NPSSO" (conta PSN conectada): guarda um NPSSO novo para a renovação automática da
 * sessão (o refresh da PSN dura ~10 dias; o NPSSO, ~2 meses).
 */
function UpdateNpsso({ integrationId }: { integrationId: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <p className="caption flex flex-wrap items-center gap-2">
        Sessão renovada automaticamente pelo NPSSO guardado (cifrado).
        <button
          type="button"
          className="label cursor-pointer !text-neon-cyan"
          onClick={() => setOpen(true)}
        >
          Atualizar NPSSO
        </button>
      </p>
    );
  }
  return (
    <ReconnectPSN integrationId={integrationId} onDone={() => setOpen(false)} />
  );
}
