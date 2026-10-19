import { useId, useState } from "react";
import { isApiError } from "@/api/errors";
import { useSession } from "@/auth/session";
import { Panel } from "@/design-system/components/Panel";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { useIsOwner } from "@/features/members/queries";
import { useDeleteMyAccount, useExportMyData } from "./queries";

/** Página estática para onde a pessoa vai depois de excluir a conta (não depende de login). */
export const ACCOUNT_DELETED_URL = "/legal/conta-excluida.html";
const CONFIRM_WORD = "EXCLUIR";

function download(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Baixar tudo: perfil, contas (sem credenciais), jogos, troféus com marcações, IA, desafios. */
export function ExportData() {
  const exp = useExportMyData();
  const rateLimited = isApiError(exp.error) && exp.error.status === 429;
  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 text-sm text-text-2">
        Baixe um arquivo JSON com tudo o que o app guarda sobre você: perfil, contas conectadas (sem as credenciais),
        jogos, troféus com suas marcações e notas, roadmaps, conversas com a IA e desafios.
      </p>
      <Button
        variant="secondary"
        size="sm"
        className="self-start"
        disabled={exp.isPending}
        onClick={() =>
          exp.mutate(undefined, {
            onSuccess: (data) => download(data, `trophy-hunter-dados-${new Date().toISOString().slice(0, 10)}.json`),
          })
        }
      >
        {exp.isPending ? "Preparando…" : "Baixar meus dados"}
      </Button>
      <p aria-live="polite" className="m-0 text-caption text-text-3">
        {exp.isSuccess && "Arquivo baixado."}
      </p>
      {exp.isError && (
        <p role="alert" className="m-0 text-sm text-danger">
          {rateLimited ? "Você acabou de exportar. Tente de novo em alguns minutos." : "Não deu para gerar o arquivo agora."}
        </p>
      )}
    </div>
  );
}

/** Excluir a conta: apaga tudo na hora (também o login). Confirmação digitando a palavra. */
export function DeleteAccount() {
  const isOwner = useIsOwner();
  const session = useSession();
  const del = useDeleteMyAccount();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const inputId = useId();

  if (isOwner) {
    return (
      <Panel className="flex flex-col gap-2">
        <h3 className="sub !mb-0">Excluir conta</h3>
        <p className="m-0 text-sm text-text-2">Você é o dono do app; a conta do dono não pode ser excluída por aqui.</p>
      </Panel>
    );
  }
  return (
    <Panel className="flex flex-col gap-3">
      <h3 className="sub !mb-0 !text-danger">Excluir conta</h3>
      <p className="m-0 text-sm text-text-2">
        Apaga na hora e para sempre: suas contas conectadas, jogos, troféus, marcações, conversas com a IA, desafios e o seu
        login. Não dá para desfazer. Para voltar depois, só com um convite novo — e começando do zero.
      </p>
      {!open ? (
        <Button variant="danger" size="sm" className="self-start" onClick={() => setOpen(true)}>
          Excluir minha conta
        </Button>
      ) : (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (typed !== CONFIRM_WORD) return;
            del.mutate(undefined, {
              onSuccess: () => {
                if (session.status === "authenticated") void session.signOut({ local: true, redirectTo: ACCOUNT_DELETED_URL });
              },
            });
          }}
        >
          <Label htmlFor={inputId} className="text-sm text-text-2">
            Digite <b className="text-text-1">{CONFIRM_WORD}</b> para confirmar
          </Label>
          <Input
            id={inputId}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            autoFocus
            className="max-w-xs"
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => (setOpen(false), setTyped(""))}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" size="sm" disabled={typed !== CONFIRM_WORD || del.isPending}>
              {del.isPending ? "Excluindo…" : "Excluir tudo para sempre"}
            </Button>
          </div>
          {del.isError && (
            <p role="alert" className="m-0 text-sm text-danger">
              Não deu para excluir agora. Nada foi apagado; tente de novo.
            </p>
          )}
        </form>
      )}
    </Panel>
  );
}
