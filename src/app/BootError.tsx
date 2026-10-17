/** Configuração inválida no boot (ex.: /config.js sem OIDC_AUTHORITY). Mostra o motivo, sem stack. */
export function BootError({ error }: { error: unknown }) {
  const detail = error instanceof Error ? error.message : String(error);
  return (
    <div className="flex min-h-full items-center justify-center bg-canvas p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-lg font-semibold text-text">App mal configurado</h1>
        <p className="mt-1 text-sm text-muted">A configuração do ambiente está incompleta.</p>
        <pre className="mt-4 max-w-[560px] overflow-auto whitespace-pre-wrap rounded-[var(--radius)] bg-surface p-4 text-left font-mono text-xs text-muted">
          {detail}
        </pre>
      </div>
    </div>
  );
}
