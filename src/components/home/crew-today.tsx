"use client";

import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { CrewMemberRow, VenueRow } from "@/types/database";

type Props = {
  crew: CrewMemberRow[];
  venues: VenueRow[];
};

const STATUS_DOT: Record<CrewMemberRow["status"], string> = {
  active: "bg-[#9DFF60]",
  pending: "bg-[#FFF200]",
  off: "bg-white/30",
};

const STATUS_LABEL: Record<CrewMemberRow["status"], string> = {
  active: "Activo",
  pending: "Pendiente",
  off: "Libre",
};

// "Bote Crew" / "Flotante" no pertenecen a un venue específico — los
// agrupamos al final bajo "Flotante" para que el grid tenga 4 columnas
// lógicas (3 venues + flotante) en desktop y se apilen en mobile.
const FLOTANTE_KEY = "Flotante";

export function CrewToday({ crew, venues }: Props) {
  const groups = useMemo(() => {
    const orderedVenueNames = [...venues]
      .sort((a, b) => a.order - b.order)
      .map((v) => v.name);
    const all = [...orderedVenueNames, FLOTANTE_KEY];
    const map = new Map<string, CrewMemberRow[]>();
    for (const name of all) map.set(name, []);
    for (const m of crew) {
      const key = orderedVenueNames.includes(m.venue) ? m.venue : FLOTANTE_KEY;
      map.get(key)!.push(m);
    }
    return all
      .map((name) => ({ name, members: map.get(name) ?? [] }))
      .filter((g) => g.members.length > 0);
  }, [crew, venues]);

  const counts = useMemo(
    () => ({
      total: crew.length,
      active: crew.filter((m) => m.status === "active").length,
      pending: crew.filter((m) => m.status === "pending").length,
      off: crew.filter((m) => m.status === "off").length,
    }),
    [crew]
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#161718] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            Crew de hoy
          </p>
          <p className="mt-0.5 text-xs text-dim">
            <span className="font-bold text-white">{counts.total}</span> personas ·{" "}
            <span className="text-[#9DFF60]">{counts.active} activos</span>
            {counts.pending > 0 && (
              <>
                {" · "}
                <span className="text-[#FFF200]">{counts.pending} pendientes</span>
              </>
            )}
            {counts.off > 0 && (
              <>
                {" · "}
                <span className="text-white/50">{counts.off} libres</span>
              </>
            )}
          </p>
        </div>
        <Link
          href="/admin/crew"
          className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-white/50 hover:text-[#FA2BA9]"
        >
          Ver todo →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {groups.map((g) => (
          <div key={g.name} className="rounded-xl border border-white/5 bg-[#090A0B]/40 p-3">
            <p className="mb-2 truncate text-[10px] font-bold uppercase tracking-wider text-white/60">
              {g.name}{" "}
              <span className="text-white/30">· {g.members.length}</span>
            </p>
            <ul className="space-y-1.5">
              {g.members.map((m) => (
                <li key={m.id} className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FA2BA9]/15 text-[10px] font-black text-[#FA2BA9]">
                    {m.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">{m.name}</p>
                    <p className="truncate text-[10px] text-dim">{m.role}</p>
                  </div>
                  <span
                    className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[m.status])}
                    title={STATUS_LABEL[m.status]}
                    aria-label={STATUS_LABEL[m.status]}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
