/**
 * Verificación end-to-end de la conexión con Supabase.
 *
 * - Visita todas las rutas y confirma 200 + sin errores de consola
 * - Confirma que NO aparece el OfflinePill (ping server-side OK)
 * - En En Vivo: verifica que `Publicar` NO está disabled (señal de que
 *   `eventSource === "supabase"`) e inserta una alerta de prueba que
 *   persiste tras reload
 * - En Montaje: hace toggle de un item, recarga y confirma persistencia
 *
 *   npx tsx scripts/verify-supabase.ts
 */
import { chromium, type Browser, type Page } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const ROUTES = [
  "/",
  "/operacion/montaje",
  "/operacion/en-vivo",
  "/operacion/cuadre",
  "/admin/crew",
  "/admin/inventario",
  "/admin/reportes",
];

type Check = { name: string; ok: boolean; detail?: string };
const results: Check[] = [];

function record(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail });
  const tag = ok ? "✓" : "✗";
  const line = `${tag} ${name}${detail ? `  — ${detail}` : ""}`;
  console.log(line);
}

async function withPage<T>(
  browser: Browser,
  fn: (page: Page, errors: string[]) => Promise<T>
): Promise<T> {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
  });
  try {
    return await fn(page, errors);
  } finally {
    await ctx.close();
  }
}

async function checkRoutes(browser: Browser) {
  for (const path of ROUTES) {
    await withPage(browser, async (page, errors) => {
      const resp = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      const status = resp?.status() ?? 0;
      // Tiempo extra para que terminen los useEffect de fetch en cliente.
      await page.waitForTimeout(1500);
      const offlineCount = await page
        .getByText("Modo offline · datos mock", { exact: false })
        .count();
      const ok = status === 200 && offlineCount === 0 && errors.length === 0;
      record(
        `route ${path}`,
        ok,
        `status=${status} offlinePill=${offlineCount} errors=${errors.length}` +
          (errors.length ? `\n   ${errors.slice(0, 3).join("\n   ")}` : "")
      );
    });
  }
}

async function checkEnVivoButtonState(browser: Browser) {
  await withPage(browser, async (page) => {
    await page.goto(`${BASE}/operacion/en-vivo`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    const btn = page.getByRole("button", { name: "Publicar" });
    await btn.waitFor({ state: "visible", timeout: 5000 });
    const disabled = await btn.isDisabled();
    record(
      "en-vivo Publicar enabled (eventSource=supabase)",
      !disabled,
      `disabled=${disabled}`
    );
  });
}

async function checkAlertInsertPersistence(browser: Browser) {
  const marker = `verify-${Date.now().toString(36)}`;
  await withPage(browser, async (page) => {
    await page.goto(`${BASE}/operacion/en-vivo`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    const input = page.getByPlaceholder("Describe la alerta…");
    await input.waitFor({ state: "visible", timeout: 5000 });
    await input.fill(`Test alerta ${marker}`);
    await page.getByRole("button", { name: "Publicar" }).click();
    // Espera a que se vea en el feed
    await page.waitForTimeout(1500);
    const seenBefore = await page.getByText(marker).count();
    record(`alert visible immediately`, seenBefore > 0, `count=${seenBefore}`);
  });

  // Recarga en una página NUEVA — esto demuestra persistencia en DB
  await withPage(browser, async (page) => {
    await page.goto(`${BASE}/operacion/en-vivo`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2200);
    const seenAfter = await page.getByText(marker).count();
    record(`alert persists after reload`, seenAfter > 0, `marker=${marker} count=${seenAfter}`);
  });
}

async function checkChecklistTogglePersistence(browser: Browser) {
  // Primer pase: leer estado inicial del primer item, hacer toggle
  let initialCompleted: boolean | null = null;
  let itemText = "";
  await withPage(browser, async (page) => {
    await page.goto(`${BASE}/operacion/montaje`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    // Cualquier botón con role=button que esté dentro del UL del checklist.
    // Más estable: el primer <li> del listado tiene un <button> con
    // un texto de tarea adentro.
    const first = page.locator("ul.grid > li:first-child > button");
    await first.waitFor({ state: "visible", timeout: 5000 });
    itemText = (await first.locator("p").first().innerText()).trim();
    // El check verde aparece cuando completed es true.
    initialCompleted = (await first.locator(".bg-\\[\\#9DFF60\\]").count()) > 0;
    await first.click();
    // Espera que el optimistic update + DB roundtrip terminen
    await page.waitForTimeout(1200);
  });
  record(
    `checklist toggle initial read`,
    !!itemText,
    `task="${itemText}" wasCompleted=${initialCompleted}`
  );

  // Segundo pase: recargar y leer el estado actualizado
  await withPage(browser, async (page) => {
    await page.goto(`${BASE}/operacion/montaje`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    const first = page.locator("ul.grid > li:first-child > button");
    await first.waitFor({ state: "visible", timeout: 5000 });
    const nowCompleted = (await first.locator(".bg-\\[\\#9DFF60\\]").count()) > 0;
    const flipped = initialCompleted !== nowCompleted;
    record(
      `checklist toggle persists after reload`,
      flipped,
      `before=${initialCompleted} after=${nowCompleted}`
    );

    // Revertimos para no contaminar la DB con el cambio del test.
    if (flipped) {
      await first.click();
      await page.waitForTimeout(1200);
    }
  });
}

async function main() {
  console.log(`\n→ base: ${BASE}\n`);
  // Espera por dev server
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }

  const browser = await chromium.launch();
  try {
    console.log("\n[1/4] rutas + OfflinePill + errores de consola");
    await checkRoutes(browser);
    console.log("\n[2/4] en-vivo: estado del botón Publicar");
    await checkEnVivoButtonState(browser);
    console.log("\n[3/4] en-vivo: insertar alerta y verificar persistencia");
    await checkAlertInsertPersistence(browser);
    console.log("\n[4/4] montaje: toggle de checklist y verificar persistencia");
    await checkChecklistTogglePersistence(browser);
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
