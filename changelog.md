# changelog.md — Filthy Friday OPS

Historial de versiones. Formato: [Keep a Changelog](https://keepachangelog.com/) + [Semantic Versioning](https://semver.org/).

---

## [0.3.0] — 2026-04-27

### Added
- **Selector de evento en Home** (`src/components/home/event-selector.tsx`).
  Lista todas las filas de `events` ordenadas por fecha, con badge de
  status (Activo / Borrador / Cerrado) y picker nativo del OS (mejor
  UX en mobile que un dropdown custom).
- **Helper de selección compartido** (`src/lib/event-selection.ts`):
  - `getStoredEventId / setStoredEventId` — fuente de verdad en
    `localStorage` (`ff_selected_event_id`).
  - `pickDefaultEvent` — prioriza `active` → próximo futuro → último
    pasado → cualquier evento existente.
  - `loadSelectedEvent` — wrapper async que las páginas de Operación
    consumen para resolver el evento actual.
- `formatEventDate` y `capitalizeFirst` en `src/lib/utils.ts` (la fecha
  "Sábado, 25 de abril" se renderiza igual en todas las páginas).
- Script `scripts/reseed-events.ts` para reaplicar la sección de eventos
  contra el proyecto Supabase usando el anon key.
- Script `scripts/verify-event-selector.ts` (7 checks: default, persist,
  cambio en Home, propagación a /operacion/cuadre).

### Changed
- **`src/app/page.tsx`**: Home pasa de Server Component a Client
  Component. Carga la lista completa de events + venues, resuelve el
  evento por default, fetchea el checklist filtrado y reacciona al
  CustomEvent `ff:event-changed`. Title del header usa la fecha del
  evento seleccionado, no `today`.
- **Operación (montaje, en-vivo, cuadre)**: las tres páginas ahora
  llaman a `loadSelectedEvent()` en vez de hardcodear `status='active'`.
  Re-fetchean cuando llega el `ff:event-changed`.
- **`supabase/seed.sql`**: la sección de eventos se reescribió. En vez
  de un único evento con `current_date`, ahora hay tres con UUIDs
  estables — Apr 18 completed, Apr 25 active (default), May 2 draft —
  más sus checklist_items (todo true / mix / todo false) y alertas.

### Notes
- Previous hash: 28693c5 (docs: backlog Fase 2)
- `npm run build` ✅ 11 rutas estáticas, sin errores de tipo.
- Verificación: `npx tsx scripts/verify-supabase.ts` 12/12, `npx tsx
  scripts/verify-event-selector.ts` 7/7.
- Calendar mismatch: 2026-04-18, 2026-04-25 y 2026-05-02 son **sábados**
  en el calendario real — el spec del usuario los nombra como "Viernes"
  pero las fechas dadas son sábados. Documentado en findings.md para
  confirmación; el seed usa los días literales que dio el usuario.

---

## [0.2.0] — 2026-04-27

### Changed
- **Layout responsive en 3 breakpoints** (mobile <768, tablet 768–1024, desktop ≥1024).
  - `MobileShell` ahora usa `max-w-430 → md:max-w-768 → lg:max-w-1280` con offset `lg:pl-[220px]` para el sidebar.
  - `BottomNav` se oculta con `lg:hidden`; nuevo `SideNav` aparece solo en `lg:flex` (220px fijo a la izquierda con logo + tabs verticales).
  - `body` solo tiene `padding-bottom: 88px` en mobile/tablet.
- **Home rediseñado como landing de módulos** (`src/app/page.tsx`):
  - Header limpio + badge EN VIVO.
  - Card de fiesta activa compacta (venue actual, horario, métricas resumen, progress ring).
  - 2 cards grandes de módulos (Operación pink-gradient, Admin gold-gradient) que ocupan grid 1-col mobile / 2-col desktop.
  - Grid de 4 accesos directos (Cuadre rápido, Tickets vs Check-in, Alertas, Reportes).
  - El listado de venues + feed en vivo se removió del Home.
- **Operación → En Vivo absorbe el dashboard**: ahora muestra venues con progress rings al lado del status pill, métricas en grid responsive 2/4-col.
- Páginas internas con grids responsive:
  - Crew: lista de miembros 1/2/3-col según breakpoint.
  - Inventario (equipos + licor): items en grids 1/2/3-col.
  - Reportes: cards 1/2/3-col.
  - Cuadre: tres secciones (tickets, VIP, merch) en grid 1/2/3-col.
  - Montaje: checklist en grid 1/2-col.

### Notes
- Previous hash: 2bf28e8 (docs sync after Fase 0-4)
- `npm run typecheck` ✅ · `npm run lint` ✅ (1 warning preexistente) · `npm run build` ✅ 11 rutas estáticas
- Verificación Playwright pendiente: no hay servidor MCP de Playwright conectado en esta sesión. Sí se verificó que las 7 rutas devuelven 200 en `next dev` y que las clases responsive (`lg:hidden`, `lg:flex`, `md:grid-cols-2`, etc.) llegan al HTML renderizado.

---

## [0.1.0] — 2026-04-10

### Added
- Next.js 14 App Router scaffold + TypeScript + Tailwind + shadcn/ui
- Filthy Friday brand palette aplicada (dark theme, hot pink CTA, neon green/yellow/gold)
- Mobile shell (max-w-430) + bottom nav flotante con 3 tabs (Inicio / Operación / Admin)
- **Home dashboard:** header con badge EN VIVO animado, métricas, venue cards con progress rings, feed en vivo
- **Módulo Operación:**
  - Montaje: selector de venue, checklist interactivo tap-to-complete, progress ring, botón subir video
  - En Vivo: métricas, status por venue, feed de alertas con input manual (ok/warn/info)
  - Cuadre: reconciliación tickets + VIP breakdown + merchandise con inputs editables
- **Módulo Administración:**
  - Crew: counts, filtros por status, lista agrupada por venue, avatares
  - Inventario: sub-tabs Equipos/Licor, bodegas, progress bars, alertas de stock bajo, filtros por categoría
  - Reportes: lista UI de 6 reportes (generación pendiente)
- Cliente Supabase (`@supabase/ssr`) con guard `isSupabaseConfigured`
- Types de DB hand-written en `src/types/database.ts`
- Mock data fallback en `src/lib/mock-data.ts` (app corre sin credenciales)
- Migración SQL `supabase/migrations/0001_init.sql` — 9 tablas + indexes + RLS permisivo + realtime
- Seed SQL `supabase/seed.sql` — venues, checklist templates, crew, inventory, liquor, evento de hoy
- `.env.example` con variables esperadas

### Infra
- Repo público creado: https://github.com/olivercalvo/filthy-friday-ops
- Rama `develop` como default de trabajo, `main` como producción
- `.gitignore` ampliado para excluir `.claude/`

### Notes
- Previous hash: fe3ff77 (init commit)
- Build local verificado: `next build` pasa con 11 rutas estáticas, 1 warning menor (exhaustive-deps)
- App 100% funcional con mock data; basta con setear `NEXT_PUBLIC_SUPABASE_URL/KEY` para conectar DB real

---

## [0.0.0] — 2026-04-10

### Added
- Inicialización del proyecto Filthy Friday OPS
- Framework BLAST: generación de los 6 archivos `.md` base
  - `claude.md` — constitución del proyecto
  - `productdesign.md` — requerimientos, modelo de datos, branding
  - `sop.md` — procedimientos operativos estándar
  - `changelog.md` — este archivo
  - `task_plan.md` — plan de trabajo por fases BLAST
  - `findings.md` — hallazgos, errores, decisiones técnicas
- `Filthy_Friday_Brand_Guidelines.md` incorporado como referencia de marca (solo lectura)

### Notes
- Previous hash: N/A (initial commit)
- Sin deploy en este corte — preparación del proyecto únicamente

---
