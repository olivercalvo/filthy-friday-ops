"use client";

import Link from "next/link";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn, shortTime } from "@/lib/utils";
import type { ChecklistItemRow, EventRow, VenueRow } from "@/types/database";

type Props = {
  venues: VenueRow[];
  checklist: ChecklistItemRow[];
  event: EventRow;
};

// Status del venue para la badge:
//  - evento completed → todos cerrados
//  - evento draft     → todos pendientes
//  - evento active    → activeVenue = "Activo", el resto = "Pendiente"
type VenueStatus = "active" | "pending" | "completed";

function venueStatus(event: EventRow, venue: VenueRow): VenueStatus {
  if (event.status === "completed") return "completed";
  if (event.status === "draft") return "pending";
  return event.active_venue_id === venue.id ? "active" : "pending";
}

const STATUS_LABEL: Record<VenueStatus, string> = {
  active: "Activo",
  pending: "Pendiente",
  completed: "Cerrado",
};

const STATUS_BADGE: Record<VenueStatus, string> = {
  active: "bg-[#9DFF60]/15 text-[#9DFF60] border-[#9DFF60]/30",
  pending: "bg-[#FFF200]/15 text-[#FFF200] border-[#FFF200]/30",
  completed: "bg-white/10 text-white/60 border-white/15",
};

export function VenueCards({ venues, checklist, event }: Props) {
  const ordered = [...venues].sort((a, b) => a.order - b.order);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {ordered.map((v) => {
        const items = checklist.filter((c) => c.venue_id === v.id);
        const pct =
          items.length === 0
            ? 0
            : Math.round((items.filter((i) => i.completed).length / items.length) * 100);
        const status = venueStatus(event, v);
        const isActive = status === "active";

        return (
          <Link
            key={v.id}
            href="/operacion/montaje"
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-[#161718] p-4 transition-colors",
              isActive
                ? "border-[#FA2BA9] shadow-[0_0_0_1px_#FA2BA9,0_8px_32px_-12px_rgba(250,43,169,0.5)]"
                : "border-white/10 hover:border-white/20"
            )}
          >
            {isActive && (
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FA2BA9]/10 via-transparent to-transparent" />
            )}
            <div className="relative flex items-center gap-3">
              <span className="text-3xl leading-none">{v.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{v.name}</p>
                <p className="truncate text-[11px] text-dim">
                  {shortTime(v.start_time)}–{shortTime(v.end_time)}
                  {v.location ? ` · ${v.location}` : ""}
                </p>
              </div>
              <ProgressRing value={pct} size={48} stroke={4} />
            </div>
            <div className="relative mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  STATUS_BADGE[status]
                )}
              >
                {STATUS_LABEL[status]}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50 group-hover:text-white">
                Ver montaje →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
