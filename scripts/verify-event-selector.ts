/**
 * Verifica el selector de evento en Home + propagación a los módulos.
 *
 * 1. Home muestra la fecha del evento "active" (Apr 25) por default.
 * 2. localStorage queda con el id del evento default tras el primer load.
 * 3. Cambiar el selector a un evento distinto actualiza la fecha del Home.
 * 4. Tras cambiar, navegar a /operacion/cuadre carga los números del
 *    evento elegido (ej: Apr 18 completed tiene tickets_sold=478).
 *
 *   npx tsx scripts/verify-event-selector.ts
 */
import { chromium, type Page } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const EVT_APR18 = "e1180426-eeee-eeee-eeee-eeeeeeeeeeee";
const EVT_APR25 = "e2250426-eeee-eeee-eeee-eeeeeeeeeeee";

type Check = { name: string; ok: boolean; detail?: string };
const results: Check[] = [];
function record(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
}

async function getStored(page: Page): Promise<string | null> {
  return await page.evaluate(() => window.localStorage.getItem("ff_selected_event_id"));
}

async function main() {
  const browser = await chromium.launch();
  try {
    // (1) Home con default = Apr 25 active
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1800);

      const dateText = (await page.locator("h1, h2").first().innerText()).trim();
      // PageHeader pinta el title como h1; capturar y verificar fecha.
      const allHeadings = await page.locator("h1, h2").allInnerTexts();

      const stored = await getStored(page);
      record(
        "default selection = active event",
        stored === EVT_APR25,
        `localStorage=${stored} expected=${EVT_APR25}`
      );

      // El título del PageHeader debe contener "25 de abril"
      const hasAprDate = allHeadings.some((t) => t.includes("25 de abril"));
      record(
        "Home title shows event date (Apr 25)",
        hasAprDate,
        `headings=${JSON.stringify(allHeadings)}`
      );

      // El selector muestra "Activo" como status
      const selectorText = await page.locator("label:has(select)").innerText();
      record(
        "selector shows 'Activo' for default",
        /Activo/.test(selectorText),
        `selector="${selectorText.replace(/\s+/g, " ").trim()}"`
      );

      await ctx.close();
    }

    // (2) Cambiar el selector a Apr 18 → Home actualiza
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1800);

      // selectOption sobre el <select> nativo
      await page.locator("select").selectOption(EVT_APR18);
      await page.waitForTimeout(1200);

      const stored = await getStored(page);
      record(
        "selector change persists in localStorage",
        stored === EVT_APR18,
        `localStorage=${stored}`
      );

      const headings = await page.locator("h1, h2").allInnerTexts();
      const hasApr18 = headings.some((t) => t.includes("18 de abril"));
      record(
        "Home updates to Apr 18 after selection change",
        hasApr18,
        `headings=${JSON.stringify(headings)}`
      );

      const selectorText = await page.locator("label:has(select)").innerText();
      record(
        "selector reflects 'Cerrado' for Apr 18 (completed)",
        /Cerrado/.test(selectorText),
        `selector="${selectorText.replace(/\s+/g, " ").trim()}"`
      );

      // (3) Navegar a /operacion/cuadre con localStorage = Apr 18 → ver
      // los números del evento cerrado (tickets_sold = 478).
      await page.goto(`${BASE}/operacion/cuadre`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1800);
      const ticketsValue = await page.locator("text=Vendidos").locator("..").locator("p").nth(1).innerText();
      record(
        "cuadre uses selected event (Apr 18: tickets_sold=478)",
        ticketsValue.trim() === "478",
        `ticketsRendered=${ticketsValue.trim()} expected=478`
      );

      await ctx.close();
    }

    // (4) Volver al default — limpiar localStorage para no dejar el
    // evento Apr 18 fijo en sesiones siguientes.
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      await page.evaluate(() => window.localStorage.removeItem("ff_selected_event_id"));
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks OK`);
  if (failed.length) {
    console.log(`FAILED:`);
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail ?? ""}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
