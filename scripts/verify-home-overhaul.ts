/**
 * Verifica el rediseño del Home (custom selector + 3 venues + crew + layout).
 * Captura screenshots en 390px y 1280px y corre asserts ligeros sobre la
 * estructura del DOM. Pensado para correr contra `next start -p 3100`.
 *
 *   BASE_URL=http://localhost:3100 npx tsx scripts/verify-home-overhaul.ts
 */
import { chromium, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = "screenshots/home-overhaul";

type Check = { name: string; ok: boolean; detail?: string };
const results: Check[] = [];
const record = (name: string, ok: boolean, detail?: string) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

async function snap(page: Page, file: string, full = true) {
  await page.screenshot({ path: `${OUT}/${file}`, fullPage: full });
}

async function checks(page: Page, label: string) {
  // Esperar a que el selector y los venues hidraten
  await page.waitForSelector('[role="listbox"], button:has-text("Fiesta seleccionada")', {
    timeout: 5000,
  });
  await page.waitForTimeout(800);

  const sectionTitles = await page.locator("h2").allInnerTexts();
  const expected = ["MÉTRICAS", "VENUES", "MÓDULOS", "EQUIPO", "ACCESOS DIRECTOS"];
  const present = expected.filter((t) =>
    sectionTitles.some((s) => s.toUpperCase().trim() === t)
  );
  record(
    `[${label}] secciones presentes`,
    present.length === expected.length,
    `found=${JSON.stringify(sectionTitles)} match=${present.length}/${expected.length}`
  );

  // El selector custom debe ser un <button> con "Fiesta seleccionada", NO un <select>
  const trigger = page.locator('button:has-text("Fiesta seleccionada")');
  record(
    `[${label}] selector custom (button, no <select>)`,
    (await trigger.count()) === 1 && (await page.locator("select").count()) === 0
  );

  // Click en el selector → dropdown abre con role=listbox
  await trigger.click();
  await page.waitForTimeout(300);
  const listbox = page.locator('[role="listbox"]');
  const optionCount = await listbox.locator('[role="option"]').count();
  record(
    `[${label}] dropdown abre con opciones`,
    (await listbox.count()) === 1 && optionCount >= 1,
    `options=${optionCount}`
  );
  // Cerrar el dropdown click fuera
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(200);

  // 3 venue cards presentes (texto: Casa Papaya / Blue Coconut / Aqua Lounge)
  const venueNames = ["Casa Papaya", "Blue Coconut", "Aqua Lounge"];
  for (const v of venueNames) {
    const count = await page.locator(`text=${v}`).count();
    record(`[${label}] venue "${v}" visible`, count >= 1, `count=${count}`);
  }

  // Crew section presente
  const crewVisible = await page.locator("text=Crew de hoy").count();
  record(`[${label}] crew section visible`, crewVisible >= 1);

  // El último bloque (accesos directos) no debe estar tapado por el bottom nav.
  // Estrategia: scroll-to-bottom y verificar que el primer link "Cuadre rápido"
  // siga clickeable (no detrás del nav).
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  const lastLink = page.locator('a:has-text("Cuadre rápido")').last();
  const box = await lastLink.boundingBox();
  if (box) {
    const viewportH = page.viewportSize()!.height;
    const navTop = viewportH - 88; // bottom nav ocupa ~88px desde el borde
    record(
      `[${label}] accesos directos no tapados por bottom nav`,
      box.y + box.height <= viewportH - 40,
      `y=${Math.round(box.y)} h=${Math.round(box.height)} viewport=${viewportH} navTop=${navTop}`
    );
  } else {
    record(`[${label}] accesos directos visibles`, false, "no boundingBox");
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    // Mobile 390
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
      await snap(page, "home-390-initial.png");
      await checks(page, "390");
      // Reset selector storage para no contaminar el siguiente browser context
      await page.evaluate(() =>
        window.localStorage.removeItem("ff_selected_event_id")
      );
      await ctx.close();
    }

    // Desktop 1280
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
      await snap(page, "home-1280-initial.png");
      await checks(page, "1280");
      await page.evaluate(() =>
        window.localStorage.removeItem("ff_selected_event_id")
      );
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n${results.length - failed.length}/${results.length} checks OK · screenshots → ${OUT}/`
  );
  if (failed.length) {
    console.log("FAILED:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail ?? ""}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
