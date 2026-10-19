import { useOnline } from "@/lib/useOnline";

/** Sem conexão: o app segue mostrando o que já foi carregado (cache salvo) e avisa. */
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="offline-banner">
      Sem conexão — mostrando os dados salvos da última visita. Atualiza sozinho quando a internet voltar.
    </div>
  );
}
