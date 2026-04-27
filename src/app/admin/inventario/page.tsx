"use client";

import { useState, useEffect } from "react";
import { mockInventory, mockLiquor } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";
import { fetchWithFallback } from "@/lib/data/client-fetch";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { InventoryItemRow, LiquorCatalogRow } from "@/types/database";

type Tab = "equipos" | "licor";

export default function InventarioPage() {
  const [tab, setTab] = useState<Tab>("equipos");

  return (
    <div className="space-y-4">
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {(["equipos", "licor"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold",
              tab === t
                ? "border-[#FA2BA9] bg-[#FA2BA9] text-[#090A0B]"
                : "border-white/10 bg-[#161718] text-white/60"
            )}
          >
            {t === "equipos" ? "🧰 Equipos" : "🍾 Licor"}
          </button>
        ))}
      </div>

      {tab === "equipos" ? <Equipos /> : <Licor />}
    </div>
  );
}

function Equipos() {
  const [items, setItems] = useState<InventoryItemRow[]>(mockInventory);
  const [showAdd, setShowAdd] = useState(false);

  const refetch = async () => {
    const res = await fetchWithFallback<InventoryItemRow[]>(
      "inventory",
      async (c) => {
        const { data, error } = await c.from("inventory_items").select("*").order("name");
        if (error) throw error;
        return (data ?? []) as InventoryItemRow[];
      },
      mockInventory
    );
    setItems(res.data);
  };

  useEffect(() => {
    refetch();
  }, []);

  const b1 = items.filter((i) => i.bodega === 1).length;
  const b2 = items.filter((i) => i.bodega === 2).length;

  return (
    <>
      <div className="px-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4">
          <BodegaCard num={1} name="Oficina" count={b1} />
          <BodegaCard num={2} name="Acceso por bote" count={b2} />
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2 px-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const pct = item.total > 0 ? (item.assigned / item.total) * 100 : 0;
          const available = item.total - item.assigned;
          const depleted = available === 0;

          return (
            <li key={item.id} className="rounded-xl border border-white/10 bg-[#161718] p-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    {depleted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF200]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#FFF200]">
                        <AlertTriangle size={10} /> Sin stock
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-dim">
                    Bodega {item.bodega} · {item.assigned}/{item.total} asignados · {available} disponibles
                  </p>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className={cn("h-full", depleted ? "bg-[#FFF200]" : "bg-[#FA2BA9]")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-4 pt-2">
        <button
          onClick={() => setShowAdd(true)}
          className="w-full rounded-2xl border-2 border-dashed border-white/15 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white/60 hover:border-[#FA2BA9] hover:text-[#FA2BA9]"
        >
          + Agregar item
        </button>
      </div>

      {showAdd && (
        <AddEquipoModal
          onClose={() => setShowAdd(false)}
          onCreated={async () => {
            setShowAdd(false);
            await refetch();
          }}
        />
      )}
    </>
  );
}

function BodegaCard({ num, name, count }: { num: number; name: string; count: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161718] p-3">
      <p className="text-[9px] uppercase tracking-wider text-dim">Bodega {num}</p>
      <p className="mt-0.5 text-sm font-bold">{name}</p>
      <p className="mt-1 text-xs text-[#FA2BA9]">{count} items</p>
    </div>
  );
}

const categoryLabels: Record<string, string> = {
  ron: "Ron",
  vodka: "Vodka",
  tequila: "Tequila",
  whisky: "Whisky",
  cerveza: "Cerveza",
  mixer: "Mixer",
  otro: "Otro",
};

function Licor() {
  const [licor, setLicor] = useState<LiquorCatalogRow[]>(mockLiquor);
  const [category, setCategory] = useState<LiquorCatalogRow["category"] | "all">("all");
  const [showAdd, setShowAdd] = useState(false);

  const refetch = async () => {
    const res = await fetchWithFallback<LiquorCatalogRow[]>(
      "liquor",
      async (c) => {
        const { data, error } = await c.from("liquor_catalog").select("*").order("name");
        if (error) throw error;
        return (data ?? []) as LiquorCatalogRow[];
      },
      mockLiquor
    );
    setLicor(res.data);
  };

  useEffect(() => {
    refetch();
  }, []);

  const cats: (LiquorCatalogRow["category"] | "all")[] = [
    "all", "ron", "vodka", "tequila", "whisky", "cerveza", "mixer",
  ];
  const filtered = category === "all" ? licor : licor.filter((l) => l.category === category);
  const lowStock = licor.filter((l) => l.stock < l.min_stock).length;

  return (
    <>
      <div className="px-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#161718] p-3">
            <p className="text-[9px] uppercase tracking-wider text-dim">Referencias</p>
            <p className="mt-0.5 text-2xl font-black">{licor.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#161718] p-3">
            <p className="text-[9px] uppercase tracking-wider text-dim">Bajo mínimo</p>
            <p className={cn("mt-0.5 text-2xl font-black", lowStock > 0 ? "text-[#FFF200]" : "text-[#9DFF60]")}>
              {lowStock}
            </p>
          </div>
        </div>
      </div>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold",
              category === c
                ? "border-[#FA2BA9] bg-[#FA2BA9] text-[#090A0B]"
                : "border-white/10 bg-[#161718] text-white/60"
            )}
          >
            {c === "all" ? "Todas" : categoryLabels[c]}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-1 gap-2 px-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((l) => {
          const low = l.stock < l.min_stock;
          return (
            <li key={l.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#161718] p-3">
              <span className="text-2xl">{l.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold">{l.name}</p>
                  {low && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF200]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#FFF200]">
                      <AlertTriangle size={10} /> Bajo
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-dim">
                  {categoryLabels[l.category]} · {l.unit} · mín {l.min_stock}
                </p>
              </div>
              <div className="text-right">
                <p className={cn("text-xl font-black leading-none", low ? "text-[#FFF200]" : "text-white")}>
                  {l.stock}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-dim">en stock</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-4 pt-2">
        <button
          onClick={() => setShowAdd(true)}
          className="w-full rounded-2xl border-2 border-dashed border-white/15 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white/60 hover:border-[#FA2BA9] hover:text-[#FA2BA9]"
        >
          + Agregar bebida
        </button>
      </div>

      {showAdd && (
        <AddLicorModal
          onClose={() => setShowAdd(false)}
          onCreated={async () => {
            setShowAdd(false);
            await refetch();
          }}
        />
      )}
    </>
  );
}

function AddEquipoModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📦");
  const [total, setTotal] = useState(0);
  const [bodega, setBodega] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("inventory_items")
          .insert({ name: name.trim(), icon, total, assigned: 0, bodega });
        if (error) throw error;
      } catch (err) {
        console.warn("[inventory:add] failed", err);
      }
    }
    setSubmitting(false);
    onCreated();
  };

  return (
    <ModalShell title="Nuevo equipo" onClose={onClose}>
      <Field label="Nombre">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none focus:border-[#FA2BA9]"
          placeholder="Ej: Coolers grandes"
        />
      </Field>
      <Field label="Icono (emoji)">
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none focus:border-[#FA2BA9]"
          maxLength={4}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Total">
          <input
            type="number"
            value={total}
            onChange={(e) => setTotal(Math.max(0, Number(e.target.value) || 0))}
            className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none focus:border-[#FA2BA9]"
          />
        </Field>
        <Field label="Bodega">
          <select
            value={bodega}
            onChange={(e) => setBodega(Number(e.target.value) as 1 | 2)}
            className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none focus:border-[#FA2BA9]"
          >
            <option value={1}>1 · Oficina</option>
            <option value={2}>2 · Acceso por bote</option>
          </select>
        </Field>
      </div>
      <button
        onClick={submit}
        disabled={!name.trim() || submitting}
        className={cn(
          "w-full rounded-lg bg-[#FA2BA9] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#090A0B]",
          (!name.trim() || submitting) && "opacity-40"
        )}
      >
        {submitting ? "Guardando…" : "Crear"}
      </button>
    </ModalShell>
  );
}

function AddLicorModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<LiquorCatalogRow["category"]>("ron");
  const [unit, setUnit] = useState<LiquorCatalogRow["unit"]>("botella");
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const icon = category === "cerveza" ? "🍺" : category === "mixer" ? "🍹" : "🥃";
        const { error } = await supabase
          .from("liquor_catalog")
          .insert({ name: name.trim(), category, unit, stock, min_stock: minStock, icon });
        if (error) throw error;
      } catch (err) {
        console.warn("[liquor:add] failed", err);
      }
    }
    setSubmitting(false);
    onCreated();
  };

  return (
    <ModalShell title="Nueva bebida" onClose={onClose}>
      <Field label="Nombre">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none focus:border-[#FA2BA9]"
          placeholder="Ej: Ron Abuelo 12 años"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Categoría">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as LiquorCatalogRow["category"])}
            className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none focus:border-[#FA2BA9]"
          >
            {(["ron", "vodka", "tequila", "whisky", "cerveza", "mixer", "otro"] as const).map((c) => (
              <option key={c} value={c}>{categoryLabels[c]}</option>
            ))}
          </select>
        </Field>
        <Field label="Unidad">
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as LiquorCatalogRow["unit"])}
            className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none focus:border-[#FA2BA9]"
          >
            {(["botella", "lata", "galon", "caja"] as const).map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Stock">
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Math.max(0, Number(e.target.value) || 0))}
            className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none focus:border-[#FA2BA9]"
          />
        </Field>
        <Field label="Mínimo">
          <input
            type="number"
            value={minStock}
            onChange={(e) => setMinStock(Math.max(0, Number(e.target.value) || 0))}
            className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none focus:border-[#FA2BA9]"
          />
        </Field>
      </div>
      <button
        onClick={submit}
        disabled={!name.trim() || submitting}
        className={cn(
          "w-full rounded-lg bg-[#FA2BA9] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#090A0B]",
          (!name.trim() || submitting) && "opacity-40"
        )}
      >
        {submitting ? "Guardando…" : "Crear"}
      </button>
    </ModalShell>
  );
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm space-y-3 rounded-2xl border border-white/10 bg-[#161718] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[9px] uppercase tracking-wider text-dim">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
