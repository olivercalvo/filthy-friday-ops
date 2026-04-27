"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type DataSource = "supabase" | "mock" | "loading";

// Wrapper que ejecuta una query contra Supabase, y si falla (o no hay config)
// regresa los datos mock con `source: "mock"`. Estandariza el patrón de
// fallback en todas las páginas cliente.
export async function fetchWithFallback<T>(
  scope: string,
  query: (client: SupabaseClient<Database>) => Promise<T>,
  fallback: T
): Promise<{ data: T; source: "supabase" | "mock" }> {
  if (!isSupabaseConfigured()) {
    return { data: fallback, source: "mock" };
  }
  try {
    const client = createClient();
    const data = await query(client);
    return { data, source: "supabase" };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[data:${scope}] fallback a mock —`, err);
    }
    return { data: fallback, source: "mock" };
  }
}
