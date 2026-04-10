"use client";

import { useState, useMemo } from "react";
import { mockCrew } from "@/lib/mock-data";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import type { CrewMemberRow } from "@/types/database";

type Filter = "all" | "active" | "pending" | "off";

export default function CrewPage() {
  const [members] = useState<CrewMemberRow[]>(mockCrew);
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(
    () => ({
      active: members.filter((m) => m.status === "active").length,
      pending: members.filter((m) => m.status === "pending").length,
      off: members.filter((m) => m.status === "off").length,
    }),
    [members]
  );

  const filtered = filter === "all" ? members : members.filter((m) => m.status === filter);
  const grouped = useMemo(() => {
    const g: Record<string, CrewMemberRow[]> = {};
    for (const m of filtered) {
      g[m.venue] = g[m.venue] ?? [];
      g[m.venue].push(m);
    }
    return g;
  }, [filtered]);

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="px-4">
        <div className="grid grid-cols-3 gap-2">
          <CountCard label="Activos" value={counts.active} color="text-[#9DFF60]" />
          <CountCard label="Pendientes" value={counts.pending} color="text-[#FFF200]" />
          <CountCard label="Libres" value={counts.off} color="text-white/50" />
        </div>
      </div>

      {/* Filters */}
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {(["all", "active", "pending", "off"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold",
              filter === f
                ? "border-[#FA2BA9] bg-[#FA2BA9] text-[#090A0B]"
                : "border-white/10 bg-[#161718] text-white/60"
            )}
          >
            {f === "all" ? "Todos" : f === "active" ? "Activos" : f === "pending" ? "Pendientes" : "Libres"}
          </button>
        ))}
      </div>

      {/* Grouped list */}
      <div className="space-y-4 px-4">
        {Object.entries(grouped).map(([venue, list]) => (
          <div key={venue}>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{venue}</h3>
            <ul className="space-y-2">
              {list.map((m) => (
                <li key={m.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#161718] p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FA2BA9]/20 text-sm font-black text-[#FA2BA9]">
                    {m.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{m.name}</p>
                    <p className="truncate text-[11px] text-dim">{m.role}</p>
                  </div>
                  <StatusPill variant={m.status}>
                    {m.status === "active" ? "Activo" : m.status === "pending" ? "Pendiente" : "Libre"}
                  </StatusPill>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="px-4 pt-2">
        <button className="w-full rounded-2xl border-2 border-dashed border-white/15 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white/60 hover:border-[#FA2BA9] hover:text-[#FA2BA9]">
          + Agregar miembro
        </button>
      </div>
    </div>
  );
}

function CountCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161718] p-3">
      <p className="text-[9px] uppercase tracking-wider text-dim">{label}</p>
      <p className={`mt-0.5 text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
