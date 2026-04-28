"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/section-header";
import { ProgressRing } from "@/components/ui/progress-ring";
import { EventSelector } from "@/components/home/event-selector";
import { fetchWithFallback } from "@/lib/data/client-fetch";
import { mockEvent, mockVenues, mockChecklistItems } from "@/lib/mock-data";
import { formatEventDate, shortTime } from "@/lib/utils";
import {
  CHANGE_EVENT,
  resolveSelectedEvent,
} from "@/lib/event-selection";
import type { EventRow, VenueRow, ChecklistItemRow } from "@/types/database";

const moduleCards = [
  {
    href: "/operacion/montaje",
    emoji: "🎯",
    title: "Operación",
    desc: "Montaje, monitoreo en vivo y cuadre",
    accent: "#FA2BA9",
    gradient: "from-[#FA2BA9]/30 via-[#FA2BA9]/10 to-transparent",
    border: "border-[#FA2BA9]/30 hover:border-[#FA2BA9]",
  },
  {
    href: "/admin/crew",
    emoji: "⚙️",
    title: "Administración",
    desc: "Crew, inventario y reportes",
    accent: "#F7DA64",
    gradient: "from-[#F7DA64]/25 via-[#F7DA64]/10 to-transparent",
    border: "border-[#F7DA64]/30 hover:border-[#F7DA64]",
  },
];

const quickLinks = [
  { href: "/operacion/cuadre", emoji: "📋", label: "Cuadre rápido" },
  { href: "/operacion/en-vivo", emoji: "🎫", label: "Tickets vs Check-in" },
  { href: "/operacion/en-vivo", emoji: "📡", label: "Alertas" },
  { href: "/admin/reportes", emoji: "📊", label: "Reportes" },
];

export default function Home() {
  const [events, setEvents] = useState<EventRow[]>([mockEvent]);
  // `selectedId === null` significa "todavía no resolvimos qué evento
  // mostrar" — los efectos que dependen del id deben skipear hasta que
  // el primer fetch lo asigne. Así evitamos disparar
  // `event_id=eq.<mock-id>` contra Postgres (22P02 — la columna es uuid).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [venues, setVenues] = useState<VenueRow[]>(mockVenues);
  const [checklist, setChecklist] = useState<ChecklistItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  // 1) Cargar la lista de eventos + venues una sola vez al montar.
  useEffect(() => {
    let canceled = false;
    (async () => {
      const [eventsRes, venuesRes] = await Promise.all([
        fetchWithFallback<EventRow[]>(
          "events",
          async (c) => {
            const { data, error } = await c
              .from("events")
              .select("*")
              .order("date", { ascending: true });
            if (error) throw error;
            return (data ?? []) as EventRow[];
          },
          [mockEvent]
        ),
        fetchWithFallback<VenueRow[]>(
          "venues",
          async (c) => {
            const { data, error } = await c
              .from("venues")
              .select("*")
              .order("order", { ascending: true });
            if (error) throw error;
            return (data ?? []) as VenueRow[];
          },
          mockVenues
        ),
      ]);
      if (canceled) return;

      const list = eventsRes.data;
      setEvents(list);
      setVenues(venuesRes.data);

      const initial = resolveSelectedEvent(list);
      setSelectedId(initial ? initial.id : null);
    })();
    return () => {
      canceled = true;
    };
  }, []);

  // 2) Cuando cambia el evento seleccionado, refetch del checklist
  //    filtrado. Skip mientras `selectedId` siga `null`.
  useEffect(() => {
    if (!selectedId) return;
    let canceled = false;
    (async () => {
      setLoading(true);
      const checklistRes = await fetchWithFallback<ChecklistItemRow[]>(
        "checklist",
        async (c) => {
          const { data, error } = await c
            .from("checklist_items")
            .select("*")
            .eq("event_id", selectedId);
          if (error) throw error;
          return (data ?? []) as ChecklistItemRow[];
        },
        mockChecklistItems
      );
      if (canceled) return;
      setChecklist(checklistRes.data);
      setLoading(false);
    })();
    return () => {
      canceled = true;
    };
  }, [selectedId]);

  // 3) Suscripción al cambio de evento desde el selector.
  useEffect(() => {
    const onChange = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id) setSelectedId(id);
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  const selected = useMemo(
    () => events.find((e) => e.id === selectedId) ?? events[0] ?? mockEvent,
    [events, selectedId]
  );
  const overallMontaje =
    checklist.length === 0
      ? 0
      : Math.round((checklist.filter((i) => i.completed).length / checklist.length) * 100);
  const checkInPct = Math.round(
    (selected.checked_in / Math.max(1, selected.tickets_sold)) * 100
  );
  const activeVenue = venues.find((v) => v.id === selected.active_venue_id);
  const isLive = selected.status === "active";

  return (
    <div className="pb-6">
      <PageHeader
        accent="Filthy Friday OPS"
        title={selectedId ? formatEventDate(selected.date) : ""}
        loading={!selectedId}
        subtitle="Centro de operaciones"
        right={
          isLive ? (
            <div className="flex items-center gap-2 rounded-full border border-[#9DFF60]/40 bg-[#9DFF60]/10 px-3 py-1.5">
              <span className="pulse-live inline-block h-2 w-2 rounded-full bg-[#9DFF60]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9DFF60]">En Vivo</span>
            </div>
          ) : null
        }
      />

      <section className="px-4">
        <EventSelector
          events={events.map((e) => ({ id: e.id, date: e.date, status: e.status }))}
          selectedId={selectedId ?? ""}
        />
      </section>

      {activeVenue && (
        <section className="mt-4 px-4">
          <Link
            href="/operacion/en-vivo"
            className="block rounded-2xl border border-white/10 bg-gradient-to-br from-[#FA2BA9]/15 via-[#161718] to-[#161718] p-4 transition-colors hover:border-[#FA2BA9]/50"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl leading-none">{activeVenue.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9DFF60]">
                  {isLive ? "Fiesta activa" : "Venue protagónico"}
                </p>
                <p className="mt-0.5 truncate text-base font-bold">{activeVenue.name}</p>
                <p className="text-xs text-dim">
                  {shortTime(activeVenue.start_time)}–{shortTime(activeVenue.end_time)} · {activeVenue.location}
                </p>
              </div>
              <ProgressRing value={overallMontaje} size={56} stroke={5} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 border-t border-white/10 pt-3">
              <Stat label="Tickets" value={selected.tickets_sold.toString()} />
              <Stat label="Check-in" value={`${selected.checked_in}`} hint={`${checkInPct}%`} color="text-[#9DFF60]" />
              <Stat
                label="Montaje"
                value={loading ? "…" : `${overallMontaje}%`}
                color="text-[#FA2BA9]"
              />
            </div>
          </Link>
        </section>
      )}

      <section className="mt-6 px-4">
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Módulos</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {moduleCards.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`group relative overflow-hidden rounded-3xl border bg-[#161718] p-6 transition-colors ${m.border}`}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${m.gradient}`} />
              <div className="relative flex flex-col gap-3">
                <span className="text-5xl leading-none">{m.emoji}</span>
                <div>
                  <h3 className="text-2xl font-black tracking-tight" style={{ color: m.accent }}>
                    {m.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/70">{m.desc}</p>
                </div>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white/60 group-hover:text-white">
                  Abrir módulo →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 px-4">
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Accesos directos</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {quickLinks.map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#161718] p-3 transition-colors hover:border-[#FA2BA9]/50"
            >
              <span className="text-xl leading-none">{q.emoji}</span>
              <span className="text-xs font-semibold text-white/80">{q.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint, color = "text-white" }: { label: string; value: string; hint?: string; color?: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-[9px] uppercase tracking-wider text-dim">{label}</span>
      <span className={`mt-0.5 text-lg font-black leading-tight ${color}`}>{value}</span>
      {hint && <span className="text-[10px] text-dim">{hint}</span>}
    </div>
  );
}
