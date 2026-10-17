import { KeyRound, RefreshCw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { isApiError } from "@/api/errors";
import type { Integration, IntegrationStatus } from "@/api/schemas";
import { Banner } from "@/design-system/components/Banner";
import { Panel } from "@/design-system/components/Panel";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useConnectSteam, useIntegrations, useSyncNow } from "./queries";

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
      <span className="mr-1.5 inline-block size-2 rounded-full bg-current align-middle" aria-hidden />
      {s.label}
    </span>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const sync = useSyncNow();
  const needsAttention = integration.status === "needs_reconnect" || integration.status === "error";
  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PlatformBadge platform={integration.platform} />
          <StatusChip status={integration.status} />
        </div>
        <Button variant="secondary" size="sm" onClick={() => sync.mutate(integration.platform)} disabled={sync.isPending}>
          <RefreshCw className={cn("size-4", sync.isPending && "animate-spin")} aria-hidden /> Sincronizar agora
        </Button>
      </div>

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
            <dd className="text-text-2">{new Date(integration.last_synced_at).toLocaleString("pt-BR")}</dd>
          </div>
        )}
      </dl>

      {needsAttention && integration.last_error && (
        <Banner tone="danger" title={integration.status === "needs_reconnect" ? "Reconexão necessária" : "Falha na integração"}>
          {integration.last_error}
          {integration.platform === "psn" && integration.status === "needs_reconnect" && (
            <> Cole um novo NPSSO para reconectar (fluxo da Fase 2).</>
          )}
        </Banner>
      )}
      {integration.status === "error_private" && (
        <Banner tone="warning" title="Perfil privado">
          Libere &quot;Detalhes do jogo&quot; como público na Steam para sincronizar.
        </Banner>
      )}
      {sync.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível iniciar o sync.
        </p>
      )}
    </Panel>
  );
}

function ConnectSteamForm() {
  const connect = useConnectSteam();
  const [apiKey, setApiKey] = useState("");
  const [account, setAccount] = useState("");
  const fieldError = connect.error && isApiError(connect.error) ? connect.error : null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    connect.mutate(
      { api_key: apiKey.trim(), steam_id_or_vanity: account.trim() },
      {
        onSuccess: () => {
          setApiKey("");
          setAccount("");
        },
      },
    );
  }

  return (
    <Panel className="flex flex-col gap-4">
      <h2 className="font-display text-h4 font-bold uppercase tracking-[0.02em] text-text-1">Conectar Steam</h2>
      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="steam-api-key" className="hud-label">
            Steam Web API key
          </Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-3" aria-hidden />
            <Input
              id="steam-api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              autoComplete="off"
              required
              className="pl-10"
            />
          </div>
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
          <p className="text-caption text-text-3">17 dígitos = SteamID64; qualquer outra coisa é tratada como vanity.</p>
        </div>
        {fieldError && (
          <p role="alert" className="text-sm text-danger">
            {fieldError.message || "Não foi possível conectar."}
          </p>
        )}
        {connect.isSuccess && <p className="text-sm text-success">Steam conectada.</p>}
        <Button type="submit" disabled={connect.isPending} className="self-start">
          {connect.isPending ? "Conectando…" : "Conectar"}
        </Button>
      </form>
    </Panel>
  );
}

/** Integrações — tela funcional (HUD). Lista integrações, conecta Steam e dispara sync manual. */
export default function IntegrationsPage() {
  const query = useIntegrations();
  return (
    <section className="flex max-w-2xl flex-col gap-5">
      {query.isPending && <Skeleton className="h-40 w-full" />}
      {query.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar as integrações.
        </p>
      )}
      {query.data?.map((integration) => (
        <IntegrationCard key={integration.platform} integration={integration} />
      ))}
      <ConnectSteamForm />
    </section>
  );
}
