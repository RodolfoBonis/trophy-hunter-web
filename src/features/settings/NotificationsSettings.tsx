import { NotificationsPanel } from "@/features/notifications/NotificationsPanel";
import { SettingsTitle } from "./SettingsLayout";

export default function NotificationsSettings() {
  return (
    <div>
      <SettingsTitle title="Notificações" subtitle="Avisos no celular e no computador, mesmo com o app fechado. O sino na barra mostra os recentes." />
      <NotificationsPanel bare />
    </div>
  );
}
