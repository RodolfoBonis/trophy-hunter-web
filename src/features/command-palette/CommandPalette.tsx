import { useDeferredValue, useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Command } from "cmdk";
import { useNavigate } from "react-router";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { RarityBadge } from "@/design-system/components/RarityBadge";
import { TrophyIcon } from "@/design-system/components/TrophyIcon";
import { useIntegrations, useSyncNow } from "@/features/integrations/queries";
import { setSoundOn, useSoundOn } from "@/features/unlocks/sound";
import { NAV_ITEMS, SETTINGS_ITEMS } from "@/layout/nav";
import { useIsOwner } from "@/features/members/queries";

function Glyph({ id }: { id: string }) {
  return (
    <svg width={16} height={16} aria-hidden>
      <use href={`#${id}`} />
    </svg>
  );
}



/**
 * Paleta de comandos (cmdk): navegar entre telas, achar jogo ou troféu e disparar ações sem mouse.
 * A busca de jogos/troféus é no servidor (≥ 2 caracteres); as telas e ações filtram aqui mesmo.
 */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const client = useApi();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const term = useDeferredValue(q.trim());
  const integrations = useIntegrations();
  const isOwner = useIsOwner();
  const syncNow = useSyncNow();
  const soundOn = useSoundOn();

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const search = useQuery({
    queryKey: queryKeys.search(term),
    queryFn: ({ signal }) => api.search(client, term, signal),
    enabled: open && term.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };
  const match = (label: string) =>
    !term || label.toLowerCase().includes(term.toLowerCase());
  const screens = [
    ...NAV_ITEMS,
    ...SETTINGS_ITEMS.filter((st) => !st.ownerOnly || isOwner).map((st) => ({ ...st, label: `Configurações · ${st.label}` })),
  ].filter((n) => match(n.label));
  const accounts = integrations.data ?? [];
  const actions = [
    {
      id: "sync-all",
      label: "Sincronizar todas as contas",
      icon: "i-sync",
      run: () => accounts.forEach((a) => syncNow.mutate(a.id)),
      hidden: accounts.length === 0,
    },
    {
      id: "sound",
      label: soundOn ? "Desligar o som dos avisos" : "Ligar o som dos avisos",
      icon: "i-play",
      run: () => setSoundOn(!soundOn),
    },
  ].filter((a) => !a.hidden && match(a.label));
  const games = term.length >= 2 ? (search.data?.games ?? []) : [];
  const trophies = term.length >= 2 ? (search.data?.trophies ?? []) : [];

  // Seleção controlada: os resultados chegam do servidor depois de digitar, e o cmdk não reseleciona
  // sozinho — sem isto o Enter não faria nada. Mantém o item atual se ainda existir; senão, o primeiro.
  const values = [
    ...games.map((g) => `game-${g.id}`),
    ...trophies.map((t) => `trophy-${t.id}`),
    ...screens.map((n) => `nav-${n.to}`),
    ...actions.map((a) => `action-${a.id}`),
  ];
  const [selected, setSelected] = useState("");
  const valuesKey = values.join("|");
  useEffect(() => {
    setSelected((cur) => (values.includes(cur) ? cur : (values[0] ?? "")));
    // valuesKey resume a lista (evita depender do array recriado a cada render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesKey]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Buscar jogo, troféu ou ação"
      shouldFilter={false}
      value={selected}
      onValueChange={setSelected}
      overlayClassName="cmdk-overlay"
      contentClassName="cmdk-panel"
    >
      <div className="cmdk-input">
        <Glyph id="i-target" />
        <Command.Input
          value={q}
          onValueChange={setQ}
          placeholder="Buscar jogo, troféu ou ação…"
        />
        <kbd>Esc</kbd>
      </div>
      <Command.List className="cmdk-list">
        {search.isFetching && term.length >= 2 && (
          <Command.Loading>Buscando…</Command.Loading>
        )}
        <Command.Empty>
          {term.length < 2 ? "Digite para buscar." : "Nada encontrado."}
        </Command.Empty>

        {games.length > 0 && (
          <Command.Group heading="Jogos">
            {games.map((g) => (
              <Command.Item
                key={g.id}
                value={`game-${g.id}`}
                onSelect={() => go(`/games/${g.id}`)}
              >
                <PlatformBadge platform={g.platform} />
                <span className="cmdk-title">{g.title}</span>
                <span className="cmdk-meta">
                  {Math.round(g.completion_pct * 100)}%
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {trophies.length > 0 && (
          <Command.Group heading="Troféus">
            {trophies.map((t) => (
              <Command.Item
                key={t.id}
                value={`trophy-${t.id}`}
                onSelect={() => go(`/games/${t.game_id}#trophy-${t.id}`)}
              >
                {t.icon ? (
                  <img src={t.icon} alt="" className="cmdk-icon" />
                ) : (
                  <TrophyIcon type={t.type} size={22} />
                )}
                <span className="cmdk-title">
                  {t.name}
                  <span className="cmdk-sub">{t.game_title}</span>
                </span>
                <span className="cmdk-meta">
                  {t.earned ? (
                    "Obtido"
                  ) : t.rarity_pct != null ? (
                    <RarityBadge pct={t.rarity_pct} mini />
                  ) : null}
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {screens.length > 0 && (
          <Command.Group heading="Ir para">
            {screens.map((n) => (
              <Command.Item
                key={n.to}
                value={`nav-${n.to}`}
                onSelect={() => go(n.to)}
              >
                <Glyph id={n.icon} />
                <span className="cmdk-title">{n.label}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {actions.length > 0 && (
          <Command.Group heading="Ações">
            {actions.map((a) => (
              <Command.Item
                key={a.id}
                value={`action-${a.id}`}
                onSelect={() => {
                  a.run();
                  onOpenChange(false);
                }}
              >
                <Glyph id={a.icon} />
                <span className="cmdk-title">{a.label}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
