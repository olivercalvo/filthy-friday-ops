"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EventSelector } from "@/components/home/event-selector";
import { VenueCards } from "@/components/home/venue-cards";
import { CrewToday } from "@/components/home/crew-today";
import { fetchWithFallback } from "@/lib/data/client-fetch";
import { mockCrew, mockEvent, mockVenues, mockChecklistItems } from "@/lib/mock-data";
import { formatEventDate } from "@/lib/utils";
import {
  CHANGE_EVENT,
  resolveSelectedEvent,
} from "@/lib/event-selection";
import type {
  ChecklistItemRow,
  CrewMemberRow,
  EventRow,
  VenueRow,
} from "@/types/database";

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
  // selectedId === null hasta que el primer fetch resuelve qué evento
  // mostrar — los efectos que dependen del id deben skipear hasta entonces
  // para no disparar `event_id=eq.<mock-id>` (uuid) contra Postgres.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [venues, setVenues] = useState<VenueRow[]>(mockVenues);
  const [checklist, setChecklist] = useState<ChecklistItemRow[]>([]);
  const [crew, setCrew] = useState<CrewMemberRow[]>(mockCrew);
  const [checklistLoading, setChecklistLoading] = useState(true);

  // Fetch one-shot al montar: events + venues + crew.
  useEffect(() => {
    let canceled = false;
    (async () => {
      const [eventsRes, venuesRes, crewRes] = await Promise.all([
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
        fetchWithFallback<CrewMemberRow[]>(
          "crew",
          async (c) => {
            const { data, error } = await c
              .from("crew_members")
              .select("*")
              .order("name", { ascending: true });
            if (error) throw error;
            return (data ?? []) as CrewMemberRow[];
          },
          mockCrew
        ),
      ]);
      if (canceled) return;

      setEvents(eventsRes.data);
      setVenues(venuesRes.data);
      setCrew(crewRes.data);

      const initial = resolveSelectedEvent(eventsRes.data);
      setSelectedId(initial ? initial.id : null);
    })();
    return () => {
      canceled = true;
    };
  }, []);

  // Cuando cambia el evento, refetch del checklist filtrado.
  useEffect(() => {
    if (!selectedId) return;
    let canceled = false;
    (async () => {
      setChecklistLoading(true);
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
      setChecklistLoading(false);
    })();
    return () => {
      canceled = true;
    };
  }, [selectedId]);

  // Suscripción al cambio de evento desde el selector.
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
  const isLive = selected.status === "active";
  const ready = selectedId !== null;

  return (
    <div className="space-y-6 pt-6 pb-10">
      {/* 1. Header */}
      <header className="flex items-start justify-between gap-3 px-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            Filthy Friday OPS
          </p>
          {ready ? (
            <h1 className="mt-1 truncate text-2xl font-black tracking-tight">
              {formatEventDate(selected.date)}
            </h1>
          ) : (
            <div
              aria-hidden
              className="mt-2 h-7 w-56 animate-pulse rounded-md bg-white/10"
            />
          )}
          <p className="mt-1 text-sm text-dim">Centro de operaciones</p>
        </div>
        {isLive && (
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#9DFF60]/40 bg-[#9DFF60]/10 px-3 py-1.5">
            <span className="pulse-live inline-block h-2 w-2 rounded-full bg-[#9DFF60]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9DFF60]">
              En Vivo
            </span>
          </div>
        )}
      </header>

      {/* Selector de evento (debajo del header, ancho completo) */}
      <section className="px-4">
        <EventSelector
          events={events.map((e) => ({ id: e.id, date: e.date, status: e.status }))}
          selectedId={selectedId ?? ""}
        />
      </section>

      {/* 2. Métricas rápidas */}
      <section className="px-4">
        <SectionTitle>Métricas</SectionTitle>
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <Metric
            label="Tickets"
            value={selected.tickets_sold.toLocaleString()}
            color="text-white"
          />
          <Metric
            label="Check-in"
            value={selected.checked_in.toLocaleString()}
            hint={`${checkInPct}%`}
            color="text-[#9DFF60]"
          />
          <Metric
            label="Montaje"
            value={checklistLoading ? "…" : `${overallMontaje}%`}
            hint={`${checklist.filter((i) => i.completed).length}/${checklist.length || 0}`}
            color="text-[#FA2BA9]"
          />
        </div>
      </section>

      {/* 3. Venues — 3-up con highlight del activo */}
      <section className="px-4">
        <SectionTitle>Venues</SectionTitle>
        <VenueCards venues={venues} checklist={checklist} event={selected} />
      </section>

      {/* 4. Módulos */}
      <section className="px-4">
        <SectionTitle>Módulos</SectionTitle>
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
                  <h3
                    className="text-2xl font-black tracking-tight"
                    style={{ color: m.accent }}
                  >
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

      {/* 5. Crew de hoy */}
      <section className="px-4">
        <SectionTitle>Equipo</SectionTitle>
        <CrewToday crew={crew} venues={venues} />
      </section>

      {/* 6. Accesos directos */}
      <section className="px-4">
        <SectionTitle>Accesos directos</SectionTitle>
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
      {children}
    </h2>
  );
}

function Metric({
  label,
  value,
  hint,
  color = "text-white",
}: {
  label: string;
  value: string;
  hint?: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161718] p-3">
      <p className="text-[9px] uppercase tracking-wider text-dim">{label}</p>
      <p className={`mt-0.5 text-xl font-black leading-tight ${color} md:text-2xl`}>
        {value}
      </p>
      {hint && <p className="text-[10px] text-dim">{hint}</p>}
    </div>
  );
}
