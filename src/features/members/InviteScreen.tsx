import { useEffect, useRef } from "react";
import { Navigate, useParams } from "react-router";
import { API_ERROR, isApiError } from "@/api/errors";
import { NoAccessScreen, RemovedScreen, SessionLoadingScreen } from "@/app/screens";
import { Button } from "@/design-system/components/ui/button";
import { useAcceptInvite } from "./queries";

/**
 * `/convite/:code`: aceita o link (fora do gate de membro — quem chega aqui ainda não tem acesso).
 * O login preserva a rota (returnTo), então o amigo cai aqui de volta depois de criar a conta.
 */
export default function InviteScreen() {
  const { code = "" } = useParams();
  const accept = useAcceptInvite();
  const { mutate } = accept;
  // Convite é de uso único: uma chamada por código (o StrictMode monta o efeito duas vezes).
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    if (!code || sentFor.current === code) return;
    sentFor.current = code;
    mutate(code);
  }, [mutate, code]);

  if (!code) return <Navigate to="/" replace />;
  if (accept.isSuccess) return <Navigate to="/" replace />;
  if (accept.isError) {
    const err = accept.error;
    if (isApiError(err) && err.code === API_ERROR.memberRemoved) return <RemovedScreen />;
    if (isApiError(err) && err.code === API_ERROR.inviteInvalid) {
      return (
        <NoAccessScreen
          title="Convite inválido"
          description="O link expirou, já foi usado ou foi revogado. Peça um novo a quem te convidou."
        />
      );
    }
    return (
      <NoAccessScreen
        title="Não deu para aceitar o convite"
        description="Algo falhou do nosso lado ou na sua conexão. O convite continua valendo."
      >
        <Button size="sm" onClick={() => mutate(code)}>
          Tentar de novo
        </Button>
      </NoAccessScreen>
    );
  }
  return <SessionLoadingScreen message="Aceitando o convite" />;
}
