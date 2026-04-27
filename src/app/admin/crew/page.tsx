"use client";

import { useState, useMemo, useEffect } from "react";
import { mockCrew, mockVenues } from "@/lib/mock-data";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import { fetchWithFallback } from "@/lib/data/client-fetch";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { CrewMemberRow, VenueRow } from "@/types/database";
import { Trash2, X } from "lucide-react";

type Filter = "all" | "active" | "pending" | "off";

export default function CrewPage() {
  const [members, setMembers] = useState<CrewMemberRow[]>(mockCrew);
  const [venues, setVenues] = useState<VenueRow[]>(mockVenues);
  const [filter, setFilter] = useState<Filter>("all");
  const [showAdd, setShowAdd] = useState(false);

  const refetch = async () => {
    const res = await fetchWithFallback<CrewMemberRow[]>(
      "crew",
      async (c) => {
        const { data, error } = await c.from("crew_members").select("*").order("name");
        if (error) throw error;
        return (data ?? []) as CrewMemberRow[];
      },
      mockCrew
    );
    setMembers(res.data);
  };

  useEffect(() => {
    let canceled = false;
    (async () => {
      const venuesRes = await fetchWithFallback<VenueRow[]>(
        "venues",
        async (c) => {
          const { data, error } = await c.from("venues").select("*").order("order");
          if (error) throw error;
          return (data ?? []) as VenueRow[];
        },
        mockVenues
      );
      if (canceled) return;
      setVenues(venuesRes.data);
      await refetch();
    })();
    return () => {
      canceled = true;
    };
  }, []);

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

  const cycleStatus = async (m: CrewMemberRow) => {
    const next: CrewMemberRow["status"] =
      m.status === "active" ? "pending" : m.status === "pending" ? "off" : "active";
    setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: next } : x)));
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("crew_members").update({ status: next }).eq("id", m.id);
      if (error) throw error;
    } catch (err) {
      console.warn("[crew:status] revert", err);
      setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: m.status } : x)));
    }
  };

  const removeMember = async (m: CrewMemberRow) => {
    setMembers((prev) => prev.filter((x) => x.id !== m.id));
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("crew_members").delete().eq("id", m.id);
      if (error) throw error;
    } catch (err) {
      console.warn("[crew:delete] revert", err);
      setMembers((prev) => [m, ...prev]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="px-4">
        <div className="grid grid-cols-3 gap-2 md:grid-cols-3 lg:gap-3">
          <CountCard label="Activos" value={counts.active} color="text-[#9DFF60]" />
          <CountCard label="Pendientes" value={counts.pending} color="text-[#FFF200]" />
          <CountCard label="Libres" value={counts.off} color="text-white/50" />
        </div>
      </div>

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

      <div className="space-y-4 px-4">
        {Object.entries(grouped).map(([venue, list]) => (
          <div key={venue}>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{venue}</h3>
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {list.map((m) => (
                <li key={m.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#161718] p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FA2BA9]/20 text-sm font-black text-[#FA2BA9]">
                    {m.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{m.name}</p>
                    <p className="truncate text-[11px] text-dim">{m.role}</p>
                  </div>
                  <button onClick={() => cycleStatus(m)} title="Cambiar estado">
                    <StatusPill variant={m.status}>
                      {m.status === "active" ? "Activo" : m.status === "pending" ? "Pendiente" : "Libre"}
                    </StatusPill>
                  </button>
                  <button
                    onClick={() => removeMember(m)}
                    className="text-white/30 transition-colors hover:text-[#FA2BA9]"
                    title="Eliminar"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="px-4 pt-2">
        <button
          onClick={() => setShowAdd(true)}
          className="w-full rounded-2xl border-2 border-dashed border-white/15 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white/60 hover:border-[#FA2BA9] hover:text-[#FA2BA9]"
        >
          + Agregar miembro
        </button>
      </div>

      {showAdd && (
        <AddMemberModal
          venues={venues}
          onClose={() => setShowAdd(false)}
          onCreated={async () => {
            setShowAdd(false);
            await refetch();
          }}
        />
      )}
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

function AddMemberModal({
  venues,
  onClose,
  onCreated,
}: {
  venues: VenueRow[];
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [venue, setVenue] = useState("Flotante");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim() || !role.trim()) return;
    setSubmitting(true);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("crew_members")
          .insert({ name: name.trim(), role: role.trim(), status: "active", venue });
        if (error) throw error;
      } catch (err) {
        console.warn("[crew:add] failed", err);
      }
    }
    setSubmitting(false);
    onCreated();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#161718] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Nuevo miembro</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <Field label="Nombre">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none focus:border-[#FA2BA9]"
              placeholder="Nombre completo"
            />
          </Field>
          <Field label="Rol">
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none focus:border-[#FA2BA9]"
              placeholder="Ej: Montaje, Seguridad…"
            />
          </Field>
          <Field label="Asignación">
            <select
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none focus:border-[#FA2BA9]"
            >
              <option value="Flotante">Flotante</option>
              {venues.map((v) => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </Field>
          <button
            onClick={submit}
            disabled={!name.trim() || !role.trim() || submitting}
            className={cn(
              "w-full rounded-lg bg-[#FA2BA9] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#090A0B]",
              (!name.trim() || !role.trim() || submitting) && "opacity-40"
            )}
          >
            {submitting ? "Guardando…" : "Crear"}
          </button>
        </div>
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
