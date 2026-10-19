import type { AdminHealth } from "@/api/schemas";
import { NotFoundScreen } from "@/app/screens";
import { Panel } from "@/design-system/components/Panel";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { Button } from "@/design-system/components/ui/button";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { useIsOwner, useMe } from "@/features/members/queries";
import { SettingsTitle } from "@/features/settings/SettingsLayout";
import { cn } from "@/lib/utils";
import { useAdminHealth, useAdminSync, useRetryJob } from "./queries";

const GRAFANA_URL = "https://grafana.rb.lab/d/trophy-hunter";
const dt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const fmt = (iso: string | null) => (iso ? dt.format(new Date(iso)) : "—");
const pct = (r: number) => `${Math.round(r * 100)}%`;

const STATUS_LABEL: Record<string, string> = {
  connected: "conectada",
  needs_reconnect: "reconectar",
  error_private: "perfil privado",
  error: "erro",
  disabled: "desligada",
};

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <Panel className={cn("flex flex-col gap-3", className)}>
      <h3 className="sub !mb-0">{title}</h3>
      {children}
    </Panel>
  );
}

function Alerts({ prom }: { prom: AdminHealth["prometheus"] }) {
  if (!prom.available) return <p className="m-0 text-sm text-warning">Prometheus indisponível agora — alertas, erros e fontes externas não carregaram.</p>;
  if (prom.alerts.length === 0) return <p className="m-0 text-sm text-success">Nenhum alerta disparando.</p>;
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {prom.alerts.map((a) => (
        <li key={a.name} className={cn("chip", a.severity === "critical" ? "!text-danger" : "!text-warning")}>
          {a.name}
        </li>
      ))}
    </ul>
  );
}

function Accounts({ data }: { data: AdminHealth }) {
  const sync = useAdminSync();
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {data.accounts.map((a) => (
        <li key={a.id} className="flex flex-wrap items-center gap-3 border-b border-border-subtle py-2 last:border-0">
          <PlatformBadge platform={a.platform} />
          <div className="min-w-0 flex-1">
            <p className="m-0 line-clamp-2 text-sm text-text-1">
              {a.label || a.display_name} <span className="text-text-3">· {a.user}</span>
            </p>
            <p className="caption m-0 line-clamp-2">
              <span className={a.status === "connected" ? "text-success" : "text-warning"}>{STATUS_LABEL[a.status] ?? a.status}</span> · último sync{" "}
              {fmt(a.last_synced_at)}
              {a.last_error && ` · ${a.last_error}`}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => sync.mutate(a.id)} disabled={sync.isPending} aria-label={`Sincronizar ${a.label || a.display_name} de ${a.user}`}>
            Sincronizar
          </Button>
        </li>
      ))}
    </ul>
  );
}

function Queue({ data }: { data: AdminHealth }) {
  const retry = useRetryJob();
  const syncs = Object.entries(data.syncs_24h);
  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-sm text-text-2">
        Syncs nas últimas 24 h: {syncs.length === 0 ? "nenhum" : syncs.map(([s, n]) => `${n} ${s}`).join(" · ")}
      </p>
      {data.queue.length === 0 ? (
        <p className="m-0 text-sm text-success">Fila vazia: nada parado.</p>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {data.queue.map((q) => (
            <li key={`${q.kind}:${q.status}`} className={cn("chip", q.status === "dead" && "!text-danger")}>
              {q.kind} · {q.status} · {q.count}
            </li>
          ))}
        </ul>
      )}
      {data.recent_dead.length > 0 && (
        <ul className="m-0 flex list-none flex-col p-0" aria-label="Jobs parados recentes">
          {data.recent_dead.slice(0, 8).map((j) => (
            <li key={j.id} className="flex flex-wrap items-center gap-3 border-b border-border-subtle py-2 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm text-text-1">
                  {j.kind} <span className="caption">· {fmt(j.updated_at)}</span>
                </p>
                <p className="caption m-0 line-clamp-2">{j.error || "sem mensagem"}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => retry.mutate(j.id)} disabled={retry.isPending}>
                Reprocessar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Saúde do app — só o dono (para os outros, a rota nem existe). */
export default function HealthPage() {
  const me = useMe();
  const isOwner = useIsOwner();
  const q = useAdminHealth();
  if (me.isPending) return <Skeleton className="h-40 w-full" />;
  if (!isOwner) return <NotFoundScreen />;
  return (
    <div className="flex flex-col gap-6">
      <SettingsTitle
        title="Saúde"
        subtitle="O que está acontecendo por trás: alertas, contas, fila, IA e fontes externas. Atualiza a cada minuto."
        actions={
          <a href={GRAFANA_URL} target="_blank" rel="noopener noreferrer" className="label no-underline hover:text-neon-cyan">
            Grafana ↗
          </a>
        }
      />
      {q.isPending && <Skeleton className="h-64 w-full" />}
      {q.isError && (
        <p role="alert" className="text-sm text-danger">
          Não deu para carregar o painel.
        </p>
      )}
      {q.data && (
        <>
          <Section title="Alertas">
            <Alerts prom={q.data.prometheus} />
          </Section>
          <div className="grid gap-6 lg:grid-cols-2">
            <Section title={`Contas · ${q.data.accounts.length}`}>
              <Accounts data={q.data} />
            </Section>
            <Section title="Fila de jobs">
              <Queue data={q.data} />
            </Section>
            <Section title="Fontes externas (última hora)">
              {q.data.prometheus.providers.length === 0 ? (
                <p className="m-0 text-sm text-text-2">Sem dados.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {q.data.prometheus.providers.map((p) => (
                    <li key={p.provider} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-text-1">{p.provider}</span>
                      <span className="caption">{Math.round(p.calls_24h)} chamadas/24 h</span>
                      <span className={cn("num", p.error_ratio_1h > 0.5 ? "text-danger" : p.error_ratio_1h > 0.1 ? "text-warning" : "text-success")}>
                        {pct(p.error_ratio_1h)} erro
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
            <Section title="Uso de IA">
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {q.data.ai_usage.map((u) => (
                  <li key={u.user} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-text-1">
                      {u.user}
                      {u.owner && <span className="caption"> · dono</span>}
                    </span>
                    <span className="caption">
                      hoje {u.last_24h}
                      {u.day_limit > 0 ? `/${u.day_limit}` : ""} · 7 dias {u.last_7d}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Erros do app (24 h)">
              {q.data.prometheus.client_errors_24h.length === 0 ? (
                <p className="m-0 text-sm text-success">Nenhum erro reportado pelos navegadores.</p>
              ) : (
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {q.data.prometheus.client_errors_24h.map((e) => (
                    <li key={e.label} className="chip !text-warning">
                      {e.label} · {Math.round(e.value)}
                    </li>
                  ))}
                </ul>
              )}
            </Section>
            <Section title="Carregamento real (LCP p75, 24 h)">
              {q.data.prometheus.vitals.length === 0 ? (
                <p className="m-0 text-sm text-text-2">Ainda sem medidas.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {q.data.prometheus.vitals.slice(0, 6).map((v) => (
                    <li key={`${v.route}:${v.device}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-text-1">
                        {v.route} <span className="caption">· {v.device === "mobile" ? "celular" : "computador"}</span>
                      </span>
                      <span className={cn("num", v.lcp_p75_s > 4 ? "text-danger" : v.lcp_p75_s > 2.5 ? "text-warning" : "text-success")}>
                        {v.lcp_p75_s.toFixed(1)} s
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
          <p className="caption m-0">
            {Object.entries(q.data.totals)
              .map(([k, v]) => `${v} ${({ members: "membros", badges: "medalhas", open_challenges: "desafios abertos", wishlist_items: "jogos na lista de desejos" } as Record<string, string>)[k] ?? k}`)
              .join(" · ")}{" "}
            · gerado {fmt(q.data.generated_at)}
          </p>
        </>
      )}
    </div>
  );
}
