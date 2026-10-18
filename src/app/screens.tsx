import { useEffect, type ReactNode } from "react";
import { useRouteError } from "react-router";
import { useSession } from "@/auth/session";
import { clearLoginRedirectMark } from "@/auth/redirectGuard";
import { Button, buttonClasses } from "@/design-system/components/ui/button";
import { reportError } from "@/lib/observability";
import { isStaleChunkError, reloadOnceForNewVersion } from "@/lib/staleChunk";

function FullScreen({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
      <h1 className="text-lg font-semibold text-text">{title}</h1>
      {description && <p className="max-w-md text-sm text-muted">{description}</p>}
      {children}
    </div>
  );
}

export function SessionLoadingScreen({ message = "Autenticando" }: { message?: string }) {
  return (
    <FullScreen title="Entrando…">
      <p role="status" className="font-mono text-xs uppercase tracking-wide text-muted">
        {message}
      </p>
    </FullScreen>
  );
}

export function SessionErrorScreen({ error }: { error: Error }) {
  return (
    <FullScreen title="Não deu para entrar" description={error.message}>
      <Button
        size="sm"
        onClick={() => {
          clearLoginRedirectMark();
          window.location.assign("/");
        }}
      >
        Tentar de novo
      </Button>
    </FullScreen>
  );
}

/** Entrou, mas ainda não aceitou um convite (`/me` pending ou 403 not_invited). */
export function NoAccessScreen({
  title = "Você ainda não tem acesso",
  description,
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  const session = useSession();
  const email = session.status === "authenticated" ? session.user.email : "";
  return (
    <FullScreen
      title={title}
      description={
        description ??
        `Você entrou${email ? ` como ${email}` : ""}, mas o Trophy Hunter é só para convidados. Peça um link de convite a quem administra o app e abra-o com esta conta.`
      }
    >
      {children}
      <SignOutButton />
    </FullScreen>
  );
}

/** O dono revogou o acesso deste usuário. */
export function RemovedScreen() {
  return (
    <FullScreen title="Acesso removido" description="Quem administra o Trophy Hunter removeu o seu acesso. Um convite novo devolve o acesso.">
      <SignOutButton />
    </FullScreen>
  );
}

function SignOutButton() {
  const session = useSession();
  if (session.status !== "authenticated") return null;
  return (
    <Button size="sm" variant="secondary" onClick={() => void session.signOut()}>
      Sair e trocar de conta
    </Button>
  );
}

export function CrashScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <FullScreen title="Algo quebrou" description="O erro foi registrado. Recarregue para continuar.">
      <Button size="sm" onClick={onRetry}>
        Recarregar
      </Button>
    </FullScreen>
  );
}

/** errorElement do router: erros de render/lazy dentro das rotas. */
export function RouteErrorScreen() {
  const error = useRouteError();
  const stale = isStaleChunkError(error);
  useEffect(() => {
    // Versão nova publicada com a aba aberta: recarrega sozinho (uma vez) em vez de mostrar erro.
    if (stale && reloadOnceForNewVersion()) return;
    reportError(error, { boundary: "route" });
  }, [error, stale]);
  if (stale) {
    return (
      <div className="p-6">
        <h2 className="text-base font-semibold text-text">Saiu uma versão nova do app</h2>
        <p className="mt-1 text-sm text-muted">Recarregue para continuar com a versão atualizada.</p>
        <Button className="mt-4" size="sm" onClick={() => window.location.reload()}>
          Recarregar
        </Button>
      </div>
    );
  }
  return (
    <div className="p-6">
      <h2 className="text-base font-semibold text-text">Esta tela não carregou</h2>
      <p className="mt-1 text-sm text-muted">O erro foi registrado. Tente recarregar a página.</p>
      <Button className="mt-4" size="sm" onClick={() => window.location.reload()}>
        Recarregar
      </Button>
    </div>
  );
}

export function NotFoundScreen() {
  return (
    <div className="p-6">
      <h2 className="text-base font-semibold text-text">Página não encontrada</h2>
      <p className="mt-1 text-sm text-muted">O endereço não existe no app.</p>
      <a href="/" className={`${buttonClasses("secondary", "sm")} mt-4 no-underline`}>
        <span className="s" aria-hidden />
        <span className="gl" aria-hidden />
        Ir para o início
      </a>
    </div>
  );
}
