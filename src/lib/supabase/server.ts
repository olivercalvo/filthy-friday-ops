import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Server-side cliente sin sesión. CLAUDE.md C-001: el MVP no tiene auth,
// así que no necesitamos cookies/SSR. Usamos la anon key con RLS permisiva.
// Mantener este cliente sin `cookies()` evita que el layout se marque como
// dinámico (lo que rompería static generation de las páginas hijas).
export function createServerClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
