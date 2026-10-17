import { AlertTriangle, RefreshCw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { isApiError } from "@/api/errors";
import type { Integration, IntegrationStatus, Platform } from "@/api/schemas";
import { Alert } from "@/design-system/components/ui/alert";
import { Badge, type BadgeProps } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system/components/ui/card";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { useConnectSteam, useIntegrations, useSyncNow } from "./queries";

const PLATFORM_LABEL: Record<Platform, string> = { steam: "Steam", psn: "PSN" };

const STATUS: Record<IntegrationStatus, { label: string; tone: NonNullable<BadgeProps["tone"]> }> = {
  connected: { label: "Conectado", tone: "success" },
  needs_reconnect: { label: "Reconectar", tone: "danger" },
  error_private: { label: "Perfil privado", tone: "warning" },
  error: { label: "Erro", tone: "danger" },
  disabled: { label: "Desativado", tone: "neutral" },
};

function IntegrationCard({ integration }: { integration: Integration }) {
  const sync = useSyncNow();
  const status = STATUS[integration.status];
  const needsAttention = integration.status === "needs_reconnect" || integration.status === "error";
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>{PLATFORM_LABEL[integration.platform]}</CardTitle>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => sync.mutate(integration.platform)}
          disabled={sync.isPending}
        >
          <RefreshCw className="size-4" aria-hidden /> Sincronizar agora
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        {integration.display_name && (
          <p className="text-muted">
            Conta: <span className="text-text">{integration.display_name}</span>
          </p>
        )}
        {integration.last_synced_at && (
          <p className="text-muted">Último sync: {new Date(integration.last_synced_at).toLocaleString("pt-BR")}</p>
        )}
        {needsAttention && integration.last_error && (
          <Alert tone="danger" icon={<AlertTriangle />}>
            <p className="font-medium">
              {integration.status === "needs_reconnect" ? "Reconexão necessária" : "Falha na integração"}
            </p>
            <p className="mt-0.5 text-sm opacity-90">{integration.last_error}</p>
            {integration.platform === "psn" && integration.status === "needs_reconnect" && (
              <p className="mt-1 text-sm opacity-90">Cole um novo NPSSO para reconectar (fluxo da Fase 2).</p>
            )}
          </Alert>
        )}
        {integration.status === "error_private" && (
          <Alert tone="warning" icon={<AlertTriangle />}>
            Perfil privado na Steam — libere &quot;Detalhes do jogo&quot; como público para sincronizar.
          </Alert>
        )}
        {sync.isError && (
          <p role="alert" className="text-sm text-danger">
            Não foi possível iniciar o sync.
          </p>
        )}
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Conectar Steam</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="steam-api-key">Steam Web API key</Label>
            <Input
              id="steam-api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              autoComplete="off"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="steam-account">SteamID64 ou vanity</Label>
            <Input
              id="steam-account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="76561198... ou nome-do-perfil"
              autoComplete="off"
              required
            />
            <p className="text-xs text-faint">17 dígitos = SteamID64; qualquer outra coisa é tratada como vanity.</p>
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
      </CardContent>
    </Card>
  );
}

/** Integrações — tela funcional (plain). Lista integrações, conecta Steam e dispara sync manual. */
export default function IntegrationsPage() {
  const query = useIntegrations();

  return (
    <section className="flex max-w-2xl flex-col gap-4">
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
