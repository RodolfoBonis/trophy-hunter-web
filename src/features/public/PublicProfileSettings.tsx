import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";
import { isApiError } from "@/api/errors";
import type { User } from "@/api/schemas";
import { Panel } from "@/design-system/components/Panel";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { useMe } from "@/features/members/queries";

/** Sugestão de link a partir do nome: "Rodolfo de Bonis" → "rodolfo-de-bonis". */
export function suggestSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/-+$/g, "");
}

function useSetPublicProfile() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { enabled: boolean; slug: string; name: string }) => api.setPublicProfile(client, body),
    onSuccess: (u: User) => qc.setQueryData(queryKeys.me, u),
  });
}

/** Configurações → Privacidade: perfil público (opt-in, separado do compartilhar com amigos). */
export function PublicProfileSettings() {
  const me = useMe();
  if (!me.data) return null;
  // key: se o salvo mudar (outra aba, desligar), o formulário recomeça do salvo.
  return <PublicProfileForm key={`${me.data.public_slug}|${me.data.public_name}`} user={me.data} />;
}

function PublicProfileForm({ user: u }: { user: User }) {
  const save = useSetPublicProfile();
  const slugId = useId();
  const nameId = useId();
  const firstName = u.name?.split(" ")[0] ?? "";
  // Estado inicial direto do salvo: nada de efeito que sobrescreva o que a pessoa está digitando.
  const [slug, setSlug] = useState(() => u.public_slug || suggestSlug(firstName));
  const [name, setName] = useState(() => u.public_name || firstName);
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/u/${u.public_slug}`;
  const err = save.error;
  const errMsg = isApiError(err)
    ? err.code === "slug_taken"
      ? "Esse link já é de outra pessoa."
      : err.code === "slug_invalid"
        ? "Link: 3 a 30 letras minúsculas, números ou hífen."
        : "Não deu para salvar."
    : err
      ? "Não deu para salvar."
      : null;

  return (
    <Panel className="flex flex-col gap-3">
      <h3 className="sub !mb-0">Perfil público</h3>
      <p className="m-0 text-sm text-text-2">
        Um link para mostrar sua vitrine a quem não usa o app (WhatsApp, Discord…): apelido, platinas, troféus raros e medalhas.
        Nunca aparecem e-mail, contas Steam/PSN, notas ou sua lista de desejos. Dá para desligar a qualquer momento.
      </p>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({ enabled: true, slug: slug.trim().toLowerCase(), name: name.trim() });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={nameId} className="hud-label">
              Apelido
            </Label>
            <Input id={nameId} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={slugId} className="hud-label">
              Link (…/u/<b>{slug || "seu-link"}</b>)
            </Label>
            <Input id={slugId} value={slug} maxLength={30} onChange={(e) => setSlug(e.target.value.toLowerCase())} autoCapitalize="none" spellCheck={false} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm" disabled={save.isPending}>
            {u.public_enabled ? "Salvar" : "Ligar perfil público"}
          </Button>
          {u.public_enabled && (
            <Button type="button" size="sm" variant="secondary" disabled={save.isPending} onClick={() => save.mutate({ enabled: false, slug: u.public_slug, name: u.public_name })}>
              Desligar
            </Button>
          )}
        </div>
        {errMsg && (
          <p role="alert" className="m-0 text-sm text-danger">
            {errMsg}
          </p>
        )}
      </form>
      {u.public_enabled && u.public_slug && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <a href={link} target="_blank" rel="noopener noreferrer" className="break-all text-sm">
              {link}
            </a>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                void navigator.clipboard?.writeText(link).then(() => setCopied(true));
              }}
            >
              {copied ? "Copiado" : "Copiar link"}
            </Button>
          </div>
          <img
            src={`/u/${u.public_slug}/card.png`}
            alt={`Prévia do cartão de ${u.public_name}`}
            className="w-full max-w-[600px] border border-border-subtle"
            loading="lazy"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
      )}
    </Panel>
  );
}
