import { NavLink, Outlet } from "react-router";
import { SectionHead } from "@/design-system/components/SectionHead";
import { useIsOwner } from "@/features/members/queries";
import { SETTINGS_ITEMS } from "@/layout/nav";
import { cn } from "@/lib/utils";

/**
 * Configurações (menu da conta): abas à esquerda no desktop e em faixa rolável no celular. Fora da
 * numeração das seções principais (01–06), que é a da barra superior.
 */
export default function SettingsLayout() {
  const isOwner = useIsOwner();
  const items = SETTINGS_ITEMS.filter((s) => !s.ownerOnly || isOwner);
  return (
    <section className="flex flex-col gap-6">
      <SectionHead title="Configurações" subtitle="Sua conta, notificações e privacidade." />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Configurações" className="settings-nav">
          {items.map((s) => (
            <NavLink key={s.to} to={s.to} className={({ isActive }) => cn("settings-tab", isActive && "on")}>
              <svg width={16} height={16} aria-hidden className="shrink-0">
                <use href={`#${s.icon}`} />
              </svg>
              {s.label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </section>
  );
}

/** Título de uma aba de Configurações (menor que o cabeçalho de seção). */
export function SettingsTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="m-0 font-display text-h3 font-bold uppercase tracking-[0.02em] text-text-1">{title}</h2>
        {subtitle && <p className="m-0 mt-1 text-sm text-text-2">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
