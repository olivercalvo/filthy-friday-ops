"use client";

// Selección de evento compartida entre Home y los módulos de Operación.
// La fuente de verdad vive en localStorage para que persista entre
// navegaciones cliente-side sin necesidad de un store global.
//
// Cuando Home cambia el evento se emite un CustomEvent en `window` para
// que páginas ya montadas (montaje, en-vivo, cuadre) re-fetcheen.

import { fetchWithFallback } from "@/lib/data/client-fetch";
import { mockEvent } from "@/lib/mock-data";
import type { EventRow } from "@/types/database";

export const STORAGE_KEY = "ff_selected_event_id";
export const CHANGE_EVENT = "ff:event-changed";

export function getStoredEventId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setStoredEventId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: id }));
}

// Default según prioridad:
//   1. evento con status 'active'
//   2. próximo evento con date >= hoy (orden ascendente)
//   3. último evento con date < hoy (orden descendente)
//   4. cualquier evento existente (fallback)
export function pickDefaultEvent<T extends Pick<EventRow, "id" | "status" | "date">>(
  events: T[]
): T | null {
  if (events.length === 0) return null;
  const active = events.find((e) => e.status === "active");
  if (active) return active;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (upcoming.length > 0) return upcoming[0];

  const past = events
    .filter((e) => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return past[0] ?? events[0];
}

// Resuelve el evento "actual" para un componente cliente:
//   - usa lo que haya en localStorage si todavía existe en `events`
//   - si no, aplica `pickDefaultEvent` y persiste la elección
export function resolveSelectedEvent<T extends Pick<EventRow, "id" | "status" | "date">>(
  events: T[]
): T | null {
  if (events.length === 0) return null;
  const stored = getStoredEventId();
  if (stored) {
    const match = events.find((e) => e.id === stored);
    if (match) return match;
  }
  const def = pickDefaultEvent(events);
  if (def) setStoredEventId(def.id);
  return def;
}

// Helper para módulos que sólo necesitan saber qué evento usar (no la
// lista completa). Si no hay nada en localStorage, fetchea events y
// elige default. Devuelve el `EventRow` completo + `source`.
export async function loadSelectedEvent(): Promise<{
  event: EventRow;
  source: "supabase" | "mock";
}> {
  const stored = getStoredEventId();

  // Camino feliz cuando ya tenemos un id en localStorage.
  if (stored) {
    const res = await fetchWithFallback<EventRow | null>(
      "selectedEvent",
      async (c) => {
        const { data, error } = await c
          .from("events")
          .select("*")
          .eq("id", stored)
          .maybeSingle();
        if (error) throw error;
        return (data as EventRow | null) ?? null;
      },
      null
    );
    if (res.data) return { event: res.data, source: res.source };
    // si el id guardado ya no existe en la DB, caemos al fallback
  }

  const list = await fetchWithFallback<EventRow[]>(
    "eventsList",
    async (c) => {
      const { data, error } = await c
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EventRow[];
    },
    [mockEvent]
  );
  const def = pickDefaultEvent(list.data);
  if (def) {
    setStoredEventId(def.id);
    return { event: def, source: list.source };
  }
  return { event: mockEvent, source: "mock" };
}
