"use client";

import { useState } from "react";
import { mockInventory, mockLiquor } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import type { LiquorCatalogRow } from "@/types/database";

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
  const b1 = mockInventory.filter((i) => i.bodega === 1).length;
  const b2 = mockInventory.filter((i) => i.bodega === 2).length;

  return (
    <>
      <div className="px-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4">
          <BodegaCard num={1} name="Oficina" count={b1} />
          <BodegaCard num={2} name="Acceso por bote" count={b2} />
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2 px-4 md:grid-cols-2 lg:grid-cols-3">
        {mockInventory.map((item) => {
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
        <button className="w-full rounded-2xl border-2 border-dashed border-white/15 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white/60 hover:border-[#FA2BA9] hover:text-[#FA2BA9]">
          + Agregar item
        </button>
      </div>
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
  const [category, setCategory] = useState<LiquorCatalogRow["category"] | "all">("all");

  const cats: (LiquorCatalogRow["category"] | "all")[] = [
    "all", "ron", "vodka", "tequila", "whisky", "cerveza", "mixer",
  ];
  const filtered = category === "all" ? mockLiquor : mockLiquor.filter((l) => l.category === category);
  const lowStock = mockLiquor.filter((l) => l.stock < l.min_stock).length;

  return (
    <>
      <div className="px-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#161718] p-3">
            <p className="text-[9px] uppercase tracking-wider text-dim">Referencias</p>
            <p className="mt-0.5 text-2xl font-black">{mockLiquor.length}</p>
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
        <button className="w-full rounded-2xl border-2 border-dashed border-white/15 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white/60 hover:border-[#FA2BA9] hover:text-[#FA2BA9]">
          + Agregar bebida
        </button>
      </div>
    </>
  );
}
