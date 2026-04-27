/**
 * Captura screenshots de todas las rutas en 3 viewports (mobile/tablet/desktop)
 * y los guarda en /screenshots.
 *
 * Asume que `npm run dev` está sirviendo en http://localhost:3000.
 * Si no, lánzalo en otra terminal antes de correr este script.
 *
 *   npx tsx scripts/screenshots.ts
 *   npx tsx scripts/screenshots.ts --base http://localhost:3001
 */

import { chromium, type Browser, type Page } from "@playwright/test";
import { mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ROUTES = [
  { path: "/", slug: "home" },
  { path: "/operacion/montaje", slug: "operacion-montaje" },
  { path: "/operacion/en-vivo", slug: "operacion-en-vivo" },
  { path: "/operacion/cuadre", slug: "operacion-cuadre" },
  { path: "/admin/crew", slug: "admin-crew" },
  { path: "/admin/inventario", slug: "admin-inventario" },
  { path: "/admin/reportes", slug: "admin-reportes" },
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
];

function getBaseUrl(): string {
  const idx = process.argv.indexOf("--base");
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return process.env.BASE_URL ?? "http://localhost:3000";
}

async function ensureCleanDir(dir: string) {
  if (existsSync(dir)) await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

async function waitForServer(base: string, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(base);
      if (res.ok) return;
    } catch {
      /* not ready yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Dev server at ${base} no respondió en ${timeoutMs}ms`);
}

async function captureRoute(browser: Browser, base: string, route: typeof ROUTES[number], outDir: string) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      colorScheme: "dark",
    });
    const page: Page = await context.newPage();
    const url = `${base}${route.path}`;
    await page.goto(url, { waitUntil: "networkidle" });
    // dar tiempo a animaciones tipo pulse y a que iconos lucide hidraten
    await page.waitForTimeout(400);

    const out = resolve(outDir, `${route.slug}-${vp.name}-${vp.width}.png`);
    await page.screenshot({ path: out, fullPage: true });
    console.log(`✓ ${vp.name.padEnd(7)} ${vp.width.toString().padStart(4)}px  ${route.path.padEnd(24)}  →  ${out.split(/[\\/]/).pop()}`);
    await context.close();
  }
}

async function warmup(browser: Browser, base: string) {
  // Next.js dev compila cada ruta en el primer hit. Sin esto, la primera
  // captura por ruta puede salir sin CSS aplicado.
  console.log("Warmup (compilando rutas en dev)…");
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  for (const r of ROUTES) {
    await page.goto(`${base}${r.path}`, { waitUntil: "networkidle" });
  }
  await ctx.close();
}

async function main() {
  const base = getBaseUrl();
  const outDir = resolve(process.cwd(), "screenshots");

  console.log(`\n→ base   : ${base}`);
  console.log(`→ output : ${outDir}\n`);

  await waitForServer(base);
  await ensureCleanDir(outDir);

  const browser = await chromium.launch();
  try {
    await warmup(browser, base);
    console.log("");
    for (const route of ROUTES) {
      await captureRoute(browser, base, route, outDir);
    }
  } finally {
    await browser.close();
  }

  const total = ROUTES.length * VIEWPORTS.length;
  console.log(`\n${total} screenshots guardados en ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
