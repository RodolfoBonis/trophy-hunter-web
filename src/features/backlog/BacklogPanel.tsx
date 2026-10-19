import { useDeferredValue, useId, useMemo, useState } from "react";
import type { CatalogItem, WishlistItem } from "@/api/schemas";
import { GameCover } from "@/design-system/components/GameCover";
import { PlatformBadge } from "@/design-system/components/PlatformBadge";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { cn } from "@/lib/utils";
import { useAddWishlist, useCatalogSearch, useDeleteWishlist, useSetWishlistTarget, useWishlist } from "./queries";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const money = (cents: number) => brl.format(cents / 100);
/** "Platina rápida": até 15 h para 100% (HowLongToBeat). */
const QUICK_HOURS = 15;

function Price({ cents, regular, cut }: { cents: number | null; regular: number | null; cut: number }) {
  if (cents == null) return <span className="caption">sem preço</span>;
  if (cents === 0) return <span className="font-display text-sm font-semibold text-success">Grátis</span>;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className="num text-base text-text-1">{money(cents)}</span>
      {cut > 0 && regular != null && (
        <>
          <s className="caption">{money(regular)}</s>
          <span className="chip !py-1 !text-success">−{cut}%</span>
        </>
      )}
    </span>
  );
}

function SearchResult({ item, inList }: { item: CatalogItem; inList: boolean }) {
  const add = useAddWishlist();
  const added = inList || add.isSuccess;
  return (
    <li className="backlog-row">
      <div className="backlog-cover">
        <GameCover cover={item.cover} title={item.title} platform={item.platform} externalId={item.platform === "steam" ? item.store_id : undefined} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 line-clamp-2 text-sm font-semibold text-text-1">{item.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <PlatformBadge platform={item.platform} />
          <Price cents={item.price_cents} regular={item.regular_cents} cut={item.cut} />
        </div>
      </div>
      {item.owned ? (
        <span className="chip">Na biblioteca</span>
      ) : (
        <Button size="sm" variant={added ? "secondary" : "primary"} disabled={added || add.isPending} onClick={() => add.mutate(item)}>
          {added ? "Na lista" : add.isPending ? "Adicionando…" : "Quero platinar"}
        </Button>
      )}
    </li>
  );
}

function TargetPrice({ item }: { item: WishlistItem }) {
  const set = useSetWishlistTarget();
  const id = useId();
  const [value, setValue] = useState(item.target_price_cents != null ? String(item.target_price_cents / 100) : "");
  const save = () => {
    const n = Number(value.replace(",", "."));
    const target = value.trim() === "" || !Number.isFinite(n) || n < 0 ? null : Math.round(n * 100);
    if (target !== item.target_price_cents) set.mutate({ id: item.id, target });
  };
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-caption text-text-3">
      Avisar abaixo de R$
      <Input
        id={id}
        inputMode="decimal"
        value={value}
        placeholder="—"
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="!h-8 w-24 text-sm"
        aria-label={`Preço-alvo de ${item.title}`}
      />
    </label>
  );
}

function WishRow({ item }: { item: WishlistItem }) {
  const del = useDeleteWishlist();
  const atTarget = item.target_price_cents != null && item.price_cents != null && item.price_cents <= item.target_price_cents;
  const atLow = item.low_cents != null && item.price_cents != null && item.cut > 0 && item.price_cents <= item.low_cents;
  return (
    <li className={cn("backlog-row panel sm", (atTarget || atLow) && "deal")}>
      <div className="backlog-cover">
        <GameCover cover={item.cover} title={item.title} platform={item.platform} externalId={item.platform === "steam" ? item.store_id : undefined} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 line-clamp-2 font-display text-sm font-semibold text-text-1">{item.title}</p>
          <PlatformBadge platform={item.platform} />
          {atTarget && <span className="chip !text-success">No seu preço</span>}
          {atLow && <span className="chip !text-success">Menor preço já visto</span>}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {item.price_status === "ok" ? (
            <Price cents={item.price_cents} regular={item.regular_cents} cut={item.cut} />
          ) : (
            <span className="caption">
              {item.price_status === "none" ? "buscando preço…" : item.price_status === "not_found" ? "sem preço na loja" : "loja não respondeu; tentando de novo"}
            </span>
          )}
          {item.price_status === "ok" && item.shop && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="caption">
              {item.shop} ↗
            </a>
          )}
          {item.low_cents != null && <span className="caption">menor histórico {money(item.low_cents)}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="caption">
            {item.completionist_h != null ? `~${Math.round(item.completionist_h)} h para 100%` : "tempo para platinar: ainda sem estimativa"}
          </span>
          <TargetPrice item={item} />
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => del.mutate(item.id)} disabled={del.isPending} aria-label={`Tirar ${item.title} da lista`}>
        Tirar
      </Button>
    </li>
  );
}

/** Aba "Para comprar": buscar nas lojas e acompanhar preço dos jogos que você quer platinar. */
export function BacklogPanel() {
  const [q, setQ] = useState("");
  const term = useDeferredValue(q.trim());
  const search = useCatalogSearch(term);
  const wishlist = useWishlist();
  const [quickDeals, setQuickDeals] = useState(false);
  const items = useMemo(() => wishlist.data?.items ?? [], [wishlist.data]);
  const inList = useMemo(() => new Set(items.map((i) => `${i.platform}:${i.store_id}`)), [items]);
  const shown = useMemo(() => {
    const list = quickDeals ? items.filter((i) => i.cut > 0 && i.completionist_h != null && i.completionist_h < QUICK_HOURS) : items;
    // Promoções primeiro, depois as mais curtas.
    return [...list].sort((a, b) => b.cut - a.cut || (a.completionist_h ?? 1e9) - (b.completionist_h ?? 1e9));
  }, [items, quickDeals]);

  return (
    <div className="flex flex-col gap-6">
      <div className="panel flex flex-col gap-3">
        <h3 className="sub !mb-0">Achar um jogo</h3>
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar na Steam e na PS Store…"
          aria-label="Buscar jogo nas lojas"
        />
        {search.data?.unavailable.length ? (
          <p role="status" className="m-0 text-caption text-warning">
            {search.data.unavailable.includes("psn") ? "A PS Store não respondeu agora" : "A Steam não respondeu agora"} — mostrando só a outra loja.
          </p>
        ) : null}
        {search.isError && (
          <p role="alert" className="m-0 text-sm text-danger">
            Não deu para buscar agora.
          </p>
        )}
        {term.length >= 2 && search.data && search.data.items.length === 0 && <p className="m-0 text-sm text-text-2">Nada encontrado.</p>}
        {term.length >= 2 && search.data && search.data.items.length > 0 && (
          <ul className="m-0 flex list-none flex-col gap-2 p-0" aria-label="Resultados nas lojas">
            {search.data.items.map((it) => (
              <SearchResult key={`${it.platform}:${it.store_id}`} item={it} inList={inList.has(`${it.platform}:${it.store_id}`)} />
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="sub !mb-0">Sua lista · {items.length}</h3>
          <button type="button" className="chip" aria-pressed={quickDeals} onClick={() => setQuickDeals((v) => !v)}>
            Platinas rápidas em promoção
          </button>
        </div>
        {wishlist.isPending && <div className="skel chamfer-md h-32" aria-busy="true" />}
        {wishlist.data && items.length === 0 && (
          <p className="m-0 text-sm text-text-2">
            Busque um jogo acima e toque em "Quero platinar". Os preços são atualizados sozinhos e você recebe um aviso quando
            chegar no preço que quer.
          </p>
        )}
        {items.length > 0 && shown.length === 0 && <p className="m-0 text-sm text-text-2">Nenhum jogo curto em promoção agora.</p>}
        <ul className="m-0 flex list-none flex-col gap-3 p-0" aria-label="Lista de desejos">
          {shown.map((it) => (
            <WishRow key={it.id} item={it} />
          ))}
        </ul>
      </div>
    </div>
  );
}
