"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  mockEvent,
  mockVenues,
  mockAlerts,
  mockChecklistItems,
} from "@/lib/mock-data";
import { StatusPill } from "@/components/ui/status-pill";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn, formatPanamaTime } from "@/lib/utils";
import { fetchWithFallback } from "@/lib/data/client-fetch";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  AlertRow,
  EventRow,
  VenueRow,
  ChecklistItemRow,
} from "@/types/database";

export default function EnVivoPage() {
  const [event, setEvent] = useState<EventRow>(mockEvent);
  const [venues, setVenues] = useState<VenueRow[]>(mockVenues);
  const [checklist, setChecklist] = useState<ChecklistItemRow[]>(mockChecklistItems);
  const [alerts, setAlerts] = useState<AlertRow[]>(mockAlerts);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"ok" | "warn" | "info">("ok");

  useEffect(() => {
    let canceled = false;
    (async () => {
      const eventRes = await fetchWithFallback<EventRow>(
        "event",
        async (c) => {
          const { data, error } = await c
            .from("events")
            .select("*")
            .eq("status", "active")
            .order("date", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (error) throw error;
          if (!data) throw new Error("no active event");
          return data as EventRow;
        },
        mockEvent
      );

      const venuesRes = await fetchWithFallback<VenueRow[]>(
        "venues",
        async (c) => {
          const { data, error } = await c.from("venues").select("*").order("order");
          if (error) throw error;
          return (data ?? []) as VenueRow[];
        },
        mockVenues
      );

      const checklistRes = await fetchWithFallback<ChecklistItemRow[]>(
        "checklist",
        async (c) => {
          const { data, error } = await c
            .from("checklist_items")
            .select("*")
            .eq("event_id", eventRes.data.id);
          if (error) throw error;
          return (data ?? []) as ChecklistItemRow[];
        },
        mockChecklistItems
      );

      const alertsRes = await fetchWithFallback<AlertRow[]>(
        "alerts",
        async (c) => {
          const { data, error } = await c
            .from("alerts")
            .select("*")
            .eq("event_id", eventRes.data.id)
            .order("time", { ascending: false })
            .limit(50);
          if (error) throw error;
          return (data ?? []) as AlertRow[];
        },
        mockAlerts
      );

      if (canceled) return;
      setEvent(eventRes.data);
      setVenues(venuesRes.data);
      setChecklist(checklistRes.data);
      setAlerts(alertsRes.data);
    })();
    return () => {
      canceled = true;
    };
  }, []);

  // Realtime subscription a alertas: cualquier INSERT desde otro cliente o
  // desde nuestro propio addAlert se refleja al instante.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`alerts:${event.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts", filter: `event_id=eq.${event.id}` },
        (payload) => {
          const row = payload.new as AlertRow;
          setAlerts((prev) => (prev.some((a) => a.id === row.id) ? prev : [row, ...prev]));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id]);

  const venueProgress = (venueId: string) => {
    const items = checklist.filter((i) => i.venue_id === venueId);
    if (items.length === 0) return 0;
    return (items.filter((i) => i.completed).length / items.length) * 100;
  };

  const addAlert = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessage("");

    if (!isSupabaseConfigured()) {
      // En modo offline solo añadimos al estado local
      const local: AlertRow = {
        id: `a-${Date.now()}`,
        event_id: event.id,
        time: new Date().toISOString(),
        message: trimmed,
        type,
        venue_id: null,
      };
      setAlerts((prev) => [local, ...prev]);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("alerts")
        .insert({ event_id: event.id, message: trimmed, type, venue_id: null })
        .select()
        .single();
      if (error) throw error;
      // Si el canal Realtime ya nos llegó el INSERT, no duplicamos.
      const row = data as AlertRow;
      setAlerts((prev) => (prev.some((a) => a.id === row.id) ? prev : [row, ...prev]));
    } catch (err) {
      console.warn("[en-vivo:addAlert] insert failed", err);
      const local: AlertRow = {
        id: `a-${Date.now()}`,
        event_id: event.id,
        time: new Date().toISOString(),
        message: trimmed,
        type,
        venue_id: null,
      };
      setAlerts((prev) => [local, ...prev]);
    }
  };

  const noShow = event.tickets_sold - event.checked_in;
  const noShowPct = Math.round((noShow / Math.max(1, event.tickets_sold)) * 100);

  return (
    <div className="space-y-5">
      <section className="px-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <MetricCard label="Tickets" value={event.tickets_sold.toString()} color="text-white" />
          <MetricCard label="Check-ins" value={event.checked_in.toString()} color="text-[#9DFF60]" />
          <MetricCard label="No-show" value={`${noShowPct}%`} color="text-[#FFF200]" />
          <MetricCard label="Ventas VIP" value={`$${event.vip_total.toLocaleString()}`} color="text-[#F7DA64]" />
        </div>
      </section>

      <section className="px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Venues</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {venues.map((v) => {
            const active = v.id === event.active_venue_id;
            const finished =
              (venues.findIndex((x) => x.id === event.active_venue_id) ?? 0) >
              (venues.findIndex((x) => x.id === v.id) ?? 0);
            const progress = venueProgress(v.id);
            return (
              <Link
                key={v.id}
                href={`/operacion/montaje?venue=${v.id}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#161718] p-3 transition-colors hover:border-[#FA2BA9]/50"
              >
                <span className="text-2xl">{v.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{v.name}</p>
                  <p className="text-[11px] text-dim">{v.start_time}–{v.end_time}</p>
                  <div className="mt-1">
                    <StatusPill variant={active ? "active" : finished ? "off" : "pending"}>
                      {active ? "Activo" : finished ? "Cerrado" : "Pendiente"}
                    </StatusPill>
                  </div>
                </div>
                <ProgressRing value={progress} size={48} stroke={4} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Nueva alerta</h2>
        <div className="rounded-2xl border border-white/10 bg-[#161718] p-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe la alerta…"
            className="w-full rounded-lg border border-white/10 bg-[#090A0B] px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-[#FA2BA9]"
            onKeyDown={(e) => e.key === "Enter" && addAlert()}
          />
          <div className="mt-2 flex items-center gap-2">
            {(["ok", "warn", "info"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors",
                  type === t
                    ? t === "ok"
                      ? "bg-[#9DFF60] text-[#090A0B]"
                      : t === "warn"
                      ? "bg-[#FFF200] text-[#090A0B]"
                      : "bg-[#FA2BA9] text-[#090A0B]"
                    : "border border-white/10 text-white/60"
                )}
              >
                {t === "ok" ? "OK" : t === "warn" ? "Alerta" : "Info"}
              </button>
            ))}
            <button
              onClick={addAlert}
              className="rounded-lg bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#090A0B]"
            >
              Publicar
            </button>
          </div>
        </div>
      </section>

      <section className="px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Feed</h2>
        <ol className="space-y-2">
          {alerts.map((a) => (
            <li key={a.id} className="flex gap-3 rounded-xl border border-white/10 bg-[#161718] p-3">
              <span
                className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{
                  background: a.type === "ok" ? "#9DFF60" : a.type === "warn" ? "#FFF200" : "#FA2BA9",
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{a.message}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-dim">
                  {formatPanamaTime(a.time)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161718] p-3">
      <p className="text-[9px] uppercase tracking-wider text-dim">{label}</p>
      <p className={cn("mt-1 text-2xl font-black leading-none", color)}>{value}</p>
    </div>
  );
}
