"use client";

import { ChevronDown } from "lucide-react";
import { capitalizeFirst, formatEventDate, cn } from "@/lib/utils";
import type { EventRow } from "@/types/database";
import { setStoredEventId } from "@/lib/event-selection";

// `<select>` nativo — en mobile abre el picker del OS (mejor UX que un
// dropdown custom), y en desktop se ve consistente sin pelear con
// estilos de focus de cada browser.

type Props = {
  events: Pick<EventRow, "id" | "date" | "status">[];
  selectedId: string;
};

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  draft: "Borrador",
  completed: "Cerrado",
};

const STATUS_COLOR: Record<string, string> = {
  active: "text-[#9DFF60]",
  draft: "text-[#FFF200]",
  completed: "text-dim",
};

export function EventSelector({ events, selectedId }: Props) {
  const selected = events.find((e) => e.id === selectedId);
  const dateLabel = selected ? formatEventDate(selected.date) : "—";
  const statusLabel = selected ? STATUS_LABEL[selected.status] ?? selected.status : "";
  const statusColor = selected ? STATUS_COLOR[selected.status] ?? "text-white" : "text-white";

  return (
    <label className="relative block">
      <span className="sr-only">Seleccionar fiesta</span>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#161718] px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
            Fiesta
          </p>
          <p className="mt-0.5 truncate text-base font-bold">{dateLabel}</p>
          {statusLabel && (
            <p className={cn("text-[10px] font-bold uppercase tracking-wider", statusColor)}>
              {statusLabel}
            </p>
          )}
        </div>
        <ChevronDown size={18} className="shrink-0 text-dim" />
      </div>
      <select
        value={selectedId}
        onChange={(e) => setStoredEventId(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent text-transparent opacity-0"
        aria-label="Seleccionar fiesta"
      >
        {events.map((e) => (
          <option key={e.id} value={e.id}>
            {capitalizeFirst(formatEventDate(e.date))} —{" "}
            {STATUS_LABEL[e.status] ?? e.status}
          </option>
        ))}
      </select>
    </label>
  );
}
