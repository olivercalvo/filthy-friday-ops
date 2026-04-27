/**
 * Re-aplica solo la parte de "events / checklist_items / alerts" del
 * seed contra el proyecto Supabase apuntado por .env.local.
 *
 * Asume que `venues` y `checklist_templates` ya existen (lo hace el
 * seed completo). Acá sólo refrescamos los eventos del nuevo modelo
 * (Apr 18 completed, Apr 25 active, May 2 draft).
 *
 *   npx tsx scripts/reseed-events.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Mini-loader de .env.local — evita una nueva dependencia. Sólo soporta
// asignaciones simples KEY=VALUE (suficiente para Supabase).
function loadEnv(path: string) {
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const v = m[2].replace(/^["']|["']$/g, "");
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch (e) {
    console.error(`No pude leer ${path}:`, e);
    process.exit(1);
  }
}
loadEnv(".env.local");

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!URL || !KEY) {
  console.error("Falta NEXT_PUBLIC_SUPABASE_URL/ANON_KEY en .env.local");
  process.exit(1);
}

const sb = createClient(URL, KEY);

const VENUE_PAPAYA  = "11111111-1111-1111-1111-111111111111";
const VENUE_COCONUT = "22222222-2222-2222-2222-222222222222";
const VENUE_AQUA    = "33333333-3333-3333-3333-333333333333";

const EVT_APR18 = "e1180426-eeee-eeee-eeee-eeeeeeeeeeee";
const EVT_APR25 = "e2250426-eeee-eeee-eeee-eeeeeeeeeeee";
const EVT_MAY02 = "e3020526-eeee-eeee-eeee-eeeeeeeeeeee";

const NAMES = ["Diana", "Rey", "Carlos M.", "Luis R.", "Martina"];
const pickName = () => NAMES[Math.floor(Math.random() * NAMES.length)];

// Acepta PromiseLike — los `PostgrestFilterBuilder` de supabase-js son
// thenables, no Promises completos.
async function step(label: string, p: PromiseLike<{ error: unknown }>) {
  const { error } = await p;
  if (error) {
    console.error(`✗ ${label}:`, error);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
}

async function main() {
  // Limpiar (.neq con un valor imposible mata todos los rows; .delete()
  // en supabase-js requiere un filtro explícito por seguridad).
  await step("delete alerts",          sb.from("alerts").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  await step("delete checklist_items", sb.from("checklist_items").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  await step("delete events",          sb.from("events").delete().neq("id", "00000000-0000-0000-0000-000000000000"));

  // Eventos
  await step(
    "insert events",
    sb.from("events").insert([
      { id: EVT_APR18, date: "2026-04-18", status: "completed", tickets_sold: 478, checked_in: 451, vip_total: 6120, vip_cash: 2400, vip_card: 3720, vip_bottles: 24, merch_units: 87, merch_total: 1740, active_venue_id: VENUE_AQUA },
      { id: EVT_APR25, date: "2026-04-25", status: "active",    tickets_sold: 412, checked_in: 287, vip_total: 4850, vip_cash: 2100, vip_card: 2750, vip_bottles: 18, merch_units: 64, merch_total: 1280, active_venue_id: VENUE_COCONUT },
      { id: EVT_MAY02, date: "2026-05-02", status: "draft",     tickets_sold:   0, checked_in:   0, vip_total:    0, vip_cash:    0, vip_card:    0, vip_bottles:  0, merch_units:  0, merch_total:    0, active_venue_id: VENUE_PAPAYA  },
    ])
  );

  // Templates → para clonar como checklist_items por evento
  const { data: templates, error: tErr } = await sb
    .from("checklist_templates")
    .select("id, venue_id");
  if (tErr || !templates) {
    console.error("✗ fetch templates:", tErr);
    process.exit(1);
  }
  console.log(`  · ${templates.length} templates encontrados`);

  // Apr 18 — todo completado
  const apr18Items = templates.map((t) => ({
    event_id: EVT_APR18,
    template_id: t.id,
    venue_id: t.venue_id,
    completed: true,
    completed_at: new Date(`2026-04-18T${10 + Math.floor(Math.random() * 6)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00-05:00`).toISOString(),
    completed_by: pickName(),
  }));
  await step("insert checklist_items (Apr 18 completed)", sb.from("checklist_items").insert(apr18Items));

  // Apr 25 — mix realista (~55% completados)
  const apr25Items = templates.map((t) => {
    const done = Math.random() < 0.55;
    return {
      event_id: EVT_APR25,
      template_id: t.id,
      venue_id: t.venue_id,
      completed: done,
      completed_at: done
        ? new Date(`2026-04-25T${10 + Math.floor(Math.random() * 4)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00-05:00`).toISOString()
        : null,
      completed_by: done ? pickName() : null,
    };
  });
  await step("insert checklist_items (Apr 25 active mix)", sb.from("checklist_items").insert(apr25Items));

  // May 2 — todo pendiente
  const may2Items = templates.map((t) => ({
    event_id: EVT_MAY02,
    template_id: t.id,
    venue_id: t.venue_id,
    completed: false,
    completed_at: null,
    completed_by: null,
  }));
  await step("insert checklist_items (May 2 draft)", sb.from("checklist_items").insert(may2Items));

  // Alertas
  await step(
    "insert alerts (Apr 25 active)",
    sb.from("alerts").insert([
      { event_id: EVT_APR25, message: "Check-in superó 250 asistentes en Blue Coconut",          type: "ok",   venue_id: VENUE_COCONUT },
      { event_id: EVT_APR25, message: "Stock de Corona bajo en Aqua Lounge — enviar refuerzo",   type: "warn", venue_id: VENUE_AQUA },
      { event_id: EVT_APR25, message: "Montaje Casa Papaya completado",                           type: "ok",   venue_id: VENUE_PAPAYA },
    ])
  );
  await step(
    "insert alerts (Apr 18 completed)",
    sb.from("alerts").insert([
      { event_id: EVT_APR18, message: "Evento cerrado — todos los venues finalizaron en horario", type: "ok",   venue_id: null },
      { event_id: EVT_APR18, message: "Cuadre VIP final: $6,120 (24 botellas)",                   type: "info", venue_id: null },
    ])
  );

  console.log("\n✓ reseed completo");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
