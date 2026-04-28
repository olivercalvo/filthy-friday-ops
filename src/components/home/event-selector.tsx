"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Check, ChevronDown } from "lucide-react";
import { cn, formatEventDate } from "@/lib/utils";
import { setStoredEventId } from "@/lib/event-selection";
import type { EventRow } from "@/types/database";

type Props = {
  events: Pick<EventRow, "id" | "date" | "status">[];
  selectedId: string;
};

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  draft: "Borrador",
  completed: "Cerrado",
};

// Estilos del badge de status — replicados aquí (en vez de StatusPill)
// para tener control fino del tamaño dentro del trigger del selector.
const STATUS_BADGE: Record<string, string> = {
  active: "bg-[#9DFF60]/15 text-[#9DFF60] border-[#9DFF60]/30",
  draft: "bg-[#FFF200]/15 text-[#FFF200] border-[#FFF200]/30",
  completed: "bg-white/10 text-white/60 border-white/15",
};

export function EventSelector({ events, selectedId }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Cerrar al click fuera o con Escape — sin librería ni Portal
  // (el panel está dentro del flujo y abrirse hacia abajo nos basta).
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const selected = sorted.find((e) => e.id === selectedId) ?? sorted[0];

  const pick = (id: string) => {
    setStoredEventId(id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border bg-[#161718] px-4 py-3 text-left transition-colors",
          open ? "border-[#FA2BA9]/60" : "border-white/10 hover:border-white/20"
        )}
      >
        <Calendar size={18} className="shrink-0 text-[#FA2BA9]" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
            Fiesta seleccionada
          </p>
          <p className="mt-0.5 truncate text-base font-bold text-white">
            {selected ? formatEventDate(selected.date) : "—"}
          </p>
        </div>
        {selected && (
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              STATUS_BADGE[selected.status] ?? STATUS_BADGE.draft
            )}
          >
            {STATUS_LABEL[selected.status] ?? selected.status}
          </span>
        )}
        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 text-white/60 transition-transform",
            open && "rotate-180 text-[#FA2BA9]"
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[60vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#161718] p-1 shadow-2xl shadow-black/60 backdrop-blur"
        >
          {sorted.map((e) => {
            const active = e.id === selectedId;
            return (
              <button
                key={e.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => pick(e.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  active ? "bg-[#FA2BA9]/15" : "hover:bg-white/5"
                )}
              >
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                  {formatEventDate(e.date)}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    STATUS_BADGE[e.status] ?? STATUS_BADGE.draft
                  )}
                >
                  {STATUS_LABEL[e.status] ?? e.status}
                </span>
                {active && <Check size={14} className="shrink-0 text-[#FA2BA9]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
