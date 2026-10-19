import { Panel } from "@/design-system/components/Panel";
import { DeleteAccount, ExportData } from "@/features/account/AccountData";
import { SharingToggle } from "@/features/social/SocialBits";
import { SettingsTitle } from "./SettingsLayout";

export default function PrivacySettings() {
  return (
    <div className="flex flex-col gap-6">
      <SettingsTitle title="Privacidade" subtitle="O que os outros membros veem e onde ficam seus dados." />
      <Panel className="flex flex-col gap-3">
        <h3 className="sub !mb-0">Compartilhar com os amigos</h3>
        <p className="m-0 text-sm text-text-2">
          Ligado, os membros que também compartilham veem sua biblioteca, platinas e troféus raros, e você entra no
          ranking e nos desafios. Contas Steam/PSN, notas e conversas com a IA nunca são compartilhadas.
        </p>
        <SharingToggle />
      </Panel>
      <Panel className="flex flex-col gap-3">
        <h3 className="sub !mb-0">Seus dados</h3>
        <p className="m-0 text-sm text-text-2">
          Credenciais da Steam e da PSN ficam criptografadas e nunca aparecem na tela. Para apagar uma conta e os jogos
          dela, use Contas conectadas → Remover.
        </p>
        <ExportData />
        <p className="m-0 flex gap-4 text-sm">
          <a href="/legal/privacidade.html" target="_blank" rel="noopener">
            Política de Privacidade ↗
          </a>
          <a href="/legal/termos.html" target="_blank" rel="noopener">
            Termos de Uso ↗
          </a>
        </p>
      </Panel>
      <DeleteAccount />
    </div>
  );
}
