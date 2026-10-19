import { Check, Copy, Link2, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Invite, Member } from "@/api/schemas";
import { NotFoundScreen } from "@/app/screens";
import { Panel } from "@/design-system/components/Panel";
import { SectionHead } from "@/design-system/components/SectionHead";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import {
  useCreateInvite,
  useInvites,
  useIsOwner,
  useMe,
  useMembers,
  useRemoveMember,
  useRevokeInvite,
} from "./queries";

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const fmt = (iso: string | null) => (iso ? dateFmt.format(new Date(iso)) : "—");

function validity(invite: Invite): string {
  const uses = invite.max_uses === 1 ? "uma pessoa" : `${invite.max_uses} pessoas`;
  return `Vale até ${fmt(invite.expires_at)}, para ${uses}`;
}

type CopyState = "idle" | "copied" | "failed";

/** Link recém-criado: o código só existe agora (a API guarda o hash), então é copiar e mandar. */
function NewInviteLink({ invite }: { invite: Invite & { url: string } }) {
  const [state, setState] = useState<CopyState>("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(invite.url);
      setState("copied");
    } catch {
      setState("failed");
    }
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="invite-url" className="hud-label">
        Link de convite
      </Label>
      <div className="flex gap-2">
        <Input
          id="invite-url"
          readOnly
          value={invite.url}
          onFocus={(e) => e.currentTarget.select()}
          className="font-mono text-xs"
        />
        <Button type="button" variant="secondary" size="sm" onClick={() => void copy()}>
          {state === "copied" ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          Copiar
        </Button>
      </div>
      <p aria-live="polite" className="text-caption text-text-2">
        {state === "copied" && "Link copiado."}
        {state === "failed" && "Não deu para copiar — selecione o link e copie à mão."}
      </p>
      <p className="text-caption text-text-3">
        {validity(invite)}. Ele só aparece agora — copie e mande. Quem abrir entra com Google ou cria uma conta e
        já cai no app.
      </p>
    </div>
  );
}

function InviteRow({ invite, onRevoked }: { invite: Invite; onRevoked: (id: string) => void }) {
  const revoke = useRevokeInvite();
  return (
    <li className="flex flex-col gap-1 border-b border-border-subtle py-2 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-text-2">
          Criado em {fmt(invite.created_at)} · {validity(invite).toLowerCase()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => revoke.mutate(invite.id, { onSuccess: () => onRevoked(invite.id) })}
          disabled={revoke.isPending}
          aria-label={`Revogar o convite criado em ${fmt(invite.created_at)}`}
          className="text-text-3 hover:text-danger"
        >
          <X className="size-4" aria-hidden /> Revogar
        </Button>
      </div>
      {revoke.isError && (
        <p role="alert" className="m-0 text-sm text-danger">
          Não foi possível revogar o convite.
        </p>
      )}
    </li>
  );
}

function InvitesPanel() {
  const invites = useInvites();
  const create = useCreateInvite();
  // A API só lista convites ainda úteis (não revogados, não vencidos, com usos sobrando).
  const open = invites.data ?? [];
  const created = create.data?.url ? { ...create.data, url: create.data.url } : null;
  return (
    <Panel className="flex flex-col gap-4">
      <h2 className="font-display text-h4 font-bold uppercase tracking-[0.02em] text-text-1">Convites</h2>
      <Button className="self-start" onClick={() => create.mutate()} disabled={create.isPending}>
        <Link2 className="size-4" aria-hidden /> {create.isPending ? "Gerando…" : "Gerar link de convite"}
      </Button>
      {created && <NewInviteLink invite={created} />}
      {create.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível gerar o convite.
        </p>
      )}
      {invites.isPending && <Skeleton className="h-16 w-full" />}
      {invites.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar os convites.
        </p>
      )}
      {open.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="label">Ainda não usados</span>
          <ul className="m-0 list-none p-0">
            {open.map((i) => (
              <InviteRow
                key={i.id}
                invite={i}
                // O link recém-criado some da tela se for ele o revogado.
                onRevoked={(id) => id === create.data?.id && create.reset()}
              />
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

/**
 * Remoção em dois passos. Sem "apagar dados", as contas ficam guardadas e um convite novo devolve o
 * acesso com tudo; com ela, contas e progresso somem de vez.
 */
function RemoveMember({ member }: { member: Member }) {
  const remove = useRemoveMember();
  const [confirming, setConfirming] = useState(false);
  const [purge, setPurge] = useState(false);
  const who = member.name || member.email;
  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(true)}
        className="text-text-3 hover:text-danger"
        aria-label={`Remover ${who}`}
      >
        <Trash2 className="size-4" aria-hidden /> Remover
      </Button>
    );
  }
  return (
    <div role="group" aria-label={`Confirmar remoção de ${who}`} className="flex flex-col gap-2">
      <label className="flex items-center gap-1.5 text-sm text-text-2">
        <input type="checkbox" checked={purge} onChange={(e) => setPurge(e.target.checked)} />
        Apagar também as contas e o progresso (não dá para desfazer)
      </label>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setConfirming(false)} autoFocus>
          Cancelar
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => remove.mutate({ id: member.id, purge })}
          disabled={remove.isPending}
          aria-label={purge ? `Apagar tudo e remover ${who}` : `Remover o acesso de ${who}`}
        >
          {purge ? "Apagar tudo e remover" : "Remover acesso"}
        </Button>
      </div>
      {remove.isError && (
        <p role="alert" className="m-0 text-sm text-danger">
          Não foi possível remover.
        </p>
      )}
    </div>
  );
}

function MembersPanel() {
  const members = useMembers();
  const me = useMe();
  return (
    <Panel className="flex flex-col gap-4">
      <h2 className="font-display text-h4 font-bold uppercase tracking-[0.02em] text-text-1">Membros</h2>
      {members.isPending && <Skeleton className="h-24 w-full" />}
      {members.isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar os membros.
        </p>
      )}
      <ul className="m-0 flex list-none flex-col p-0">
        {members.data?.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle py-3 last:border-0"
          >
            <div className="min-w-0">
              <p className="m-0 truncate font-display text-sm font-semibold text-text-1">
                {m.name || m.email}
                {m.id === me.data?.id && <span className="text-text-3"> (você)</span>}
              </p>
              <p className="caption m-0 truncate">
                {m.email} · {m.role === "owner" ? "dono" : "membro"}
                {m.status === "removed" && " · removido"} · {m.accounts} {m.accounts === 1 ? "conta" : "contas"} ·
                visto em {fmt(m.last_seen_at)}
              </p>
            </div>
            {m.role !== "owner" && m.status === "active" && <RemoveMember member={m} />}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Membros e convites — só o dono (para os outros, a rota nem existe). */
export default function MembersPage() {
  const me = useMe();
  const isOwner = useIsOwner();
  if (me.isPending) return <Skeleton className="h-40 w-full" />;
  if (!isOwner) return <NotFoundScreen />;
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        idx="07"
        title="Membros e convites"
        subtitle="Cada pessoa conecta as próprias contas; os dados ficam separados. Guias de troféu são compartilhados."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <InvitesPanel />
        <MembersPanel />
      </div>
    </section>
  );
}
