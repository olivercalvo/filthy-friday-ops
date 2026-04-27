// Capa de datos: cada función intenta Supabase y, si falla o no está
// configurado, regresa el mock equivalente con `source: "mock"`.
// Las páginas pueden mostrar un indicador "modo offline" cuando ven `source === "mock"`.

import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createServerClient } from "@/lib/supabase/server";
import {
  mockEvent,
  mockVenues,
  mockChecklistItems,
  mockCrew,
  mockInventory,
  mockLiquor,
  mockAlerts,
} from "@/lib/mock-data";
import type {
  EventRow,
  VenueRow,
  ChecklistItemRow,
  ChecklistTemplateRow,
  CrewMemberRow,
  InventoryItemRow,
  LiquorCatalogRow,
  AlertRow,
} from "@/types/database";

export type DataSource = "supabase" | "mock";
export type Result<T> = { data: T; source: DataSource };

// Items con la tarea adjunta (lo que el UI necesita para renderizar la lista).
export type ChecklistItemWithTask = ChecklistItemRow & { task: string };

function logFallback(scope: string, err: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[data:${scope}] Supabase falló, usando mock —`, err);
  }
}

async function tryQuery<T>(
  scope: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<Result<T>> {
  if (!isSupabaseConfigured()) {
    return { data: fallback, source: "mock" };
  }
  try {
    return { data: await fn(), source: "supabase" };
  } catch (err) {
    logFallback(scope, err);
    return { data: fallback, source: "mock" };
  }
}

export async function getActiveEvent(): Promise<Result<EventRow>> {
  return tryQuery("getActiveEvent", async () => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "active")
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("no active event");
    return data as EventRow;
  }, mockEvent);
}

export async function getVenues(): Promise<Result<VenueRow[]>> {
  return tryQuery("getVenues", async () => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as VenueRow[];
  }, mockVenues);
}

export async function getChecklistItems(eventId: string): Promise<Result<ChecklistItemWithTask[]>> {
  return tryQuery("getChecklistItems", async () => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("checklist_items")
      .select("*, checklist_templates(task, order)")
      .eq("event_id", eventId);
    if (error) throw error;
    type Joined = ChecklistItemRow & { checklist_templates: { task: string; order: number } | null };
    const rows = (data ?? []) as unknown as Joined[];
    return rows
      .map((r) => ({
        id: r.id,
        event_id: r.event_id,
        template_id: r.template_id,
        venue_id: r.venue_id,
        completed: r.completed,
        completed_at: r.completed_at,
        completed_by: r.completed_by,
        task: r.checklist_templates?.task ?? "",
      }))
      .sort((a, b) => {
        const aOrd = (rows.find((x) => x.id === a.id)?.checklist_templates?.order ?? 0);
        const bOrd = (rows.find((x) => x.id === b.id)?.checklist_templates?.order ?? 0);
        return aOrd - bOrd;
      });
  }, mockChecklistItems as ChecklistItemWithTask[]);
}

export async function getCrew(): Promise<Result<CrewMemberRow[]>> {
  return tryQuery("getCrew", async () => {
    const supabase = createServerClient();
    const { data, error } = await supabase.from("crew_members").select("*").order("name");
    if (error) throw error;
    return (data ?? []) as CrewMemberRow[];
  }, mockCrew);
}

export async function getInventory(): Promise<Result<InventoryItemRow[]>> {
  return tryQuery("getInventory", async () => {
    const supabase = createServerClient();
    const { data, error } = await supabase.from("inventory_items").select("*").order("name");
    if (error) throw error;
    return (data ?? []) as InventoryItemRow[];
  }, mockInventory);
}

export async function getLiquor(): Promise<Result<LiquorCatalogRow[]>> {
  return tryQuery("getLiquor", async () => {
    const supabase = createServerClient();
    const { data, error } = await supabase.from("liquor_catalog").select("*").order("name");
    if (error) throw error;
    return (data ?? []) as LiquorCatalogRow[];
  }, mockLiquor);
}

export async function getAlerts(eventId: string): Promise<Result<AlertRow[]>> {
  return tryQuery("getAlerts", async () => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("event_id", eventId)
      .order("time", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as AlertRow[];
  }, mockAlerts);
}

export async function getChecklistTemplates(): Promise<Result<ChecklistTemplateRow[]>> {
  return tryQuery("getChecklistTemplates", async () => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("checklist_templates")
      .select("*")
      .order("order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ChecklistTemplateRow[];
  }, []);
}

// Comprueba conexión real con un select barato — útil para el indicador
// "modo offline" en el layout sin tener que esperar a otra query.
// Nota: usar `head: true` puede silenciar errores PGRST205 (tabla inexistente)
// en algunas versiones de supabase-js, así que hacemos un select normal limit 1.
export async function pingSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = createServerClient();
    const { error } = await supabase.from("venues").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}
