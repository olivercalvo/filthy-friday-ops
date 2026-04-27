"use client";

import { useState, useMemo } from "react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { mockVenues, mockChecklistItems } from "@/lib/mock-data";
import { Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { id: string; task: string; completed: boolean; completed_by: string | null };

export default function MontajePage() {
  const [activeVenue, setActiveVenue] = useState<string>(mockVenues[0].id);
  const [items, setItems] = useState<Record<string, Item[]>>(() => {
    const grouped: Record<string, Item[]> = {};
    for (const v of mockVenues) {
      grouped[v.id] = mockChecklistItems
        .filter((i) => i.venue_id === v.id)
        .map((i) => ({ id: i.id, task: i.task, completed: i.completed, completed_by: i.completed_by }));
    }
    return grouped;
  });

  const current = items[activeVenue] ?? [];
  const progress = useMemo(() => {
    if (current.length === 0) return 0;
    return (current.filter((i) => i.completed).length / current.length) * 100;
  }, [current]);

  const toggle = (id: string) => {
    setItems((prev) => ({
      ...prev,
      [activeVenue]: prev[activeVenue].map((i) =>
        i.id === id ? { ...i, completed: !i.completed, completed_by: !i.completed ? "Diana" : null } : i
      ),
    }));
  };

  const allDone = current.length > 0 && current.every((i) => i.completed);

  return (
    <div className="space-y-4">
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {mockVenues.map((v) => {
          const active = v.id === activeVenue;
          return (
            <button
              key={v.id}
              onClick={() => setActiveVenue(v.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                active
                  ? "border-[#FA2BA9] bg-[#FA2BA9] text-[#090A0B]"
                  : "border-white/10 bg-[#161718] text-white/70"
              )}
            >
              <span className="mr-1">{v.emoji}</span>
              {v.name}
            </button>
          );
        })}
      </div>

      <div className="mx-4 flex items-center gap-4 rounded-2xl border border-white/10 bg-[#161718] p-4">
        <ProgressRing value={progress} size={72} stroke={6} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider text-gold">Montaje</p>
          <p className="mt-0.5 truncate text-lg font-bold">
            {mockVenues.find((v) => v.id === activeVenue)?.name}
          </p>
          <p className="text-xs text-dim">
            {current.filter((i) => i.completed).length} de {current.length} tareas completadas
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2 px-4 md:grid-cols-2 lg:grid-cols-2">
        {current.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => toggle(item.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                item.completed
                  ? "border-[#9DFF60]/30 bg-[#9DFF60]/5"
                  : "border-white/10 bg-[#161718] hover:border-white/25"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                  item.completed ? "border-[#9DFF60] bg-[#9DFF60]" : "border-white/30"
                )}
              >
                {item.completed && <Check size={14} className="text-[#090A0B]" strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm leading-snug", item.completed && "text-dim line-through")}>
                  {item.task}
                </p>
                {item.completed && item.completed_by && (
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#9DFF60]">
                    ✓ {item.completed_by}
                  </p>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>

      <div className="px-4 pt-2">
        <button
          disabled={!allDone}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors md:max-w-sm",
            allDone
              ? "border-[#FA2BA9] bg-[#FA2BA9] text-[#090A0B]"
              : "cursor-not-allowed border-white/10 bg-[#161718] text-white/30"
          )}
        >
          <Upload size={16} /> Subir video de aprobación
        </button>
      </div>
    </div>
  );
}
