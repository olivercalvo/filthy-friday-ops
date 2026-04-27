"use client";

import { useState, useMemo, useEffect } from "react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { mockVenues, mockChecklistItems } from "@/lib/mock-data";
import { Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWithFallback } from "@/lib/data/client-fetch";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { CHANGE_EVENT, loadSelectedEvent } from "@/lib/event-selection";
import type { VenueRow, ChecklistItemRow } from "@/types/database";

type Item = { id: string; task: string; completed: boolean; completed_by: string | null };

export default function MontajePage() {
  const [venues, setVenues] = useState<VenueRow[]>(mockVenues);
  const [activeVenue, setActiveVenue] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, Item[]>>({});
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const onChange = () => setReloadKey((k) => k + 1);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

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

      const eventRes = await loadSelectedEvent();

      const checklistRes = await fetchWithFallback<(ChecklistItemRow & { task: string })[]>(
        "checklist",
        async (c) => {
          const { data, error } = await c
            .from("checklist_items")
            .select("*, checklist_templates(task, order)")
            .eq("event_id", eventRes.event.id);
          if (error) throw error;
          type Joined = ChecklistItemRow & { checklist_templates: { task: string; order: number } | null };
          const rows = (data ?? []) as unknown as Joined[];
          return [...rows]
            .sort(
              (a, b) =>
                (a.checklist_templates?.order ?? 0) - (b.checklist_templates?.order ?? 0)
            )
            .map((r) => ({
              id: r.id,
              event_id: r.event_id,
              template_id: r.template_id,
              venue_id: r.venue_id,
              completed: r.completed,
              completed_at: r.completed_at,
              completed_by: r.completed_by,
              task: r.checklist_templates?.task ?? "",
            }));
        },
        mockChecklistItems as (ChecklistItemRow & { task: string })[]
      );

      if (canceled) return;
      const grouped: Record<string, Item[]> = {};
      for (const v of venuesRes.data) grouped[v.id] = [];
      for (const it of checklistRes.data) {
        grouped[it.venue_id] = grouped[it.venue_id] ?? [];
        grouped[it.venue_id].push({
          id: it.id,
          task: it.task,
          completed: it.completed,
          completed_by: it.completed_by,
        });
      }
      setVenues(venuesRes.data);
      setItems(grouped);
      setActiveVenue((cur) => cur ?? venuesRes.data[0]?.id ?? null);
      setLoading(false);
    })();
    return () => {
      canceled = true;
    };
  }, [reloadKey]);

  const current = useMemo<Item[]>(
    () => (activeVenue ? items[activeVenue] ?? [] : []),
    [activeVenue, items]
  );
  const progress = useMemo(() => {
    if (current.length === 0) return 0;
    return (current.filter((i) => i.completed).length / current.length) * 100;
  }, [current]);

  const toggle = async (id: string) => {
    if (!activeVenue) return;
    const before = items[activeVenue] ?? [];
    const target = before.find((i) => i.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;
    const nextBy = nextCompleted ? "Diana" : null;

    // Optimistic update
    setItems((prev) => ({
      ...prev,
      [activeVenue]: prev[activeVenue].map((i) =>
        i.id === id ? { ...i, completed: nextCompleted, completed_by: nextBy } : i
      ),
    }));

    if (!isSupabaseConfigured()) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("checklist_items")
        .update({
          completed: nextCompleted,
          completed_by: nextBy,
          completed_at: nextCompleted ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      // Revertir si la DB falló
      console.warn("[montaje:toggle] revert", err);
      setItems((prev) => ({
        ...prev,
        [activeVenue]: prev[activeVenue].map((i) =>
          i.id === id ? { ...i, completed: target.completed, completed_by: target.completed_by } : i
        ),
      }));
    }
  };

  const allDone = current.length > 0 && current.every((i) => i.completed);

  return (
    <div className="space-y-4">
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {venues.map((v) => {
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
            {venues.find((v) => v.id === activeVenue)?.name ?? "—"}
          </p>
          <p className="text-xs text-dim">
            {loading
              ? "Cargando…"
              : `${current.filter((i) => i.completed).length} de ${current.length} tareas completadas`}
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
