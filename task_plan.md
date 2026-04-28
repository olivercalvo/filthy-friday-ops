# task_plan.md — Filthy Friday OPS

> Plan de trabajo vivo, organizado por fases BLAST. Actualizar en cada turno.
>
> Leyenda: `[ ]` pendiente · `[~]` en progreso · `[x]` hecho · `[!]` bloqueado

---

## FASE 0 — INIT ✅

- [x] Generar `claude.md`
- [x] Generar `productdesign.md`
- [x] Generar `sop.md`
- [x] Generar `changelog.md`
- [x] Generar `task_plan.md`
- [x] Generar `findings.md`
- [x] `git init` en la raíz del proyecto
- [x] Crear `.gitignore` (Node + Next.js + .env* + .claude/)
- [x] Primer commit: `chore: init project with BLAST framework` (fe3ff77)
- [x] `gh repo create filthy-friday-ops --public` → https://github.com/olivercalvo/filthy-friday-ops
- [x] Crear rama `develop`
- [x] Push inicial a `origin/main` y `origin/develop`

---

## FASE 1 — BLUEPRINT ✅ (migrations ready; DB provisioning deferred)

### Supabase
- [ ] Crear proyecto Supabase (dev) — **requiere credenciales del usuario**
- [ ] Guardar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`
- [x] Migración inicial escrita en `/supabase/migrations/0001_init.sql` (tables + indexes + permissive RLS + realtime publication)
- [x] Seed escrito en `/supabase/seed.sql` (venues, templates, crew, inventory, liquor, evento de hoy)
- [ ] Ejecutar migración + seed contra el proyecto dev cuando esté creado

### Next.js
- [x] Scaffold Next.js 14 App Router + TypeScript + Tailwind + src-dir
- [x] shadcn/ui init + componentes base (button, card, tabs, input, dialog, badge, progress, label)
- [x] Cliente Supabase (`src/lib/supabase/client.ts`) + types (`src/types/database.ts`)
- [x] Mock data fallback en `src/lib/mock-data.ts`

---

## FASE 2 — LINKS

- [x] `src/lib/supabase/client.ts` — cliente browser (con guard `isSupabaseConfigured`)
- [ ] `src/lib/supabase/server.ts` — cliente server (cuando haya queries server-side)
- [x] `src/types/database.ts` — tipos hand-written (reemplazar con `supabase gen types` cuando DB esté viva)
- [ ] `src/lib/queries/` — helpers de queries tipadas por tabla
- [ ] Hooks: `useActiveEvent`, `useVenues`, `useChecklistForVenue`, `useAlertsFeed` (con Realtime)

---

## FASE 3 — ARCHITECT ✅ (MVP shell con mock data)

### Layout global
- [x] `src/app/layout.tsx` — dark theme, system font, metadata, viewport
- [x] `src/components/layout/bottom-nav.tsx` — 3 tabs flotantes con active state
- [x] `src/components/layout/mobile-shell.tsx` — max-width 430px centrado

### Home
- [x] `src/app/page.tsx` — dashboard completo
- [x] Header con badge EN VIVO (animación pulse)
- [x] Strip de métricas (tickets, check-ins, % montaje)
- [x] Cards de venues con ProgressRing SVG
- [x] Feed en vivo (últimas 5 alertas)

### Módulo Operación
- [x] `src/app/operacion/layout.tsx` — header + SubTabs pills
- [x] `src/app/operacion/montaje/page.tsx` — selector venue, checklist interactivo (tap to toggle), progress ring, botón video
- [x] `src/app/operacion/en-vivo/page.tsx` — métricas, status venues, feed de alertas con input manual (ok/warn/info)
- [x] `src/app/operacion/cuadre/page.tsx` — reconciliación tickets + VIP + merch con inputs editables

### Módulo Administración
- [x] `src/app/admin/layout.tsx` — header + SubTabs pills
- [x] `src/app/admin/crew/page.tsx` — counts, filtros, lista agrupada por venue, avatars
- [x] `src/app/admin/inventario/page.tsx` — sub-tabs Equipos/Licor con bodegas, progress bars, filtros categoría, alertas de stock bajo
- [x] `src/app/admin/reportes/page.tsx` — lista de 6 reportes (UI only)

### Pendiente para CRUD real
- [ ] Dialogs de add/edit/delete en Crew, Inventario (Equipos), Inventario (Licor)
- [ ] Conectar al cliente Supabase cuando haya credenciales (reemplazar mock imports por hooks)

---

## FASE 4 — STYLIZE

- [x] Tailwind theme extendido con tokens de marca (`ff.*`) y colores shadcn en RGB triplets
- [x] CSS vars `--ff-*` en `globals.css`
- [x] Paleta aplicada a Home + todos los módulos
- [x] ProgressRing SVG custom con `--ff-hot-pink`
- [x] StatusPill con variantes active/pending/off/pink/gold/info
- [x] Animación del badge EN VIVO (keyframe `pulse-live`)
- [x] Microinteracciones en tap de checklist (transición + strikethrough)
- [ ] Verificación visual con Playwright MCP en cada ruta (pendiente: configurar MCP)
- [ ] Revisar jerarquía tipográfica y ajustar si usuario pide más "hype"

---

## FASE 4.2 — MULTI-EVENT (2026-04-27) ✅

### Selector de evento en Home
- [x] Helper `src/lib/event-selection.ts` (localStorage + CustomEvent + default-pick)
- [x] `EventSelector` (`src/components/home/event-selector.tsx`) con select nativo y badges de status
- [x] Refactor de `src/app/page.tsx` a Client Component que muestra la fecha del evento elegido
- [x] Default = evento `active` → próximo futuro → último pasado

### Propagación a Operación
- [x] `montaje/page.tsx` lee evento desde `loadSelectedEvent`
- [x] `en-vivo/page.tsx` ídem (Realtime sigue keyed por `event.id`)
- [x] `cuadre/page.tsx` ídem
- [x] Re-fetch en respuesta a `ff:event-changed`

### Datos
- [x] `supabase/seed.sql` con 3 eventos (Apr 18 completed / Apr 25 active / May 2 draft)
- [x] `scripts/reseed-events.ts` para reaplicar la sección eventos sin re-correr migración
- [x] Verificación `scripts/verify-event-selector.ts` 7/7 OK

---

## FASE 4.1 — RESPONSIVE + HOME REDESIGN (2026-04-27) ✅

### Layout responsive (3 breakpoints)
- [x] `SideNav` (lg:flex, 220px fijo, logo + tabs verticales)
- [x] `BottomNav` con `lg:hidden`
- [x] `MobileShell` con max-w 430 → md:768 → lg:1280 + `lg:pl-[220px]`
- [x] `body` `padding-bottom: 88px` solo en mobile/tablet

### Home como landing
- [x] Header limpio + badge EN VIVO (sin métricas en strip)
- [x] Card de fiesta activa compacta con progress ring
- [x] 2 cards grandes de módulos (Operación pink, Admin gold) en grid 1/2-col
- [x] 4 accesos directos en grid 2/4-col

### Dashboard movido a Operación → En Vivo
- [x] Venues con progress ring junto a status pill
- [x] Métricas en grid 2/4-col

### Grids responsive en páginas internas
- [x] Crew: 1/2/3-col
- [x] Inventario (equipos + licor): 1/2/3-col
- [x] Reportes: 1/2/3-col
- [x] Cuadre: secciones 1/2/3-col
- [x] Montaje: checklist 1/2-col

---

## FASE 5 — TRIGGER (parcial — prod corriendo desde develop sin merge a main)

- [x] Crear proyecto en Vercel y conectar a GitHub (`filthy-friday-ops` linkeado)
- [x] Configurar variables de entorno de producción en Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` en Production + Preview + Development)
- [~] Crear proyecto Supabase de producción + aplicar migraciones (proyecto existe; migraciones aplicadas — pendiente E-003 verificación post-fix)
- [~] Ejecutar Pre-Deploy checklist (claude.md §5) — corrido retroactivamente para 0.4.0:
  - [x] build clean · lint clean · typecheck clean
  - [x] Smoke test 7 rutas en prod → 200
  - [x] CSS verificado en prod (`c09c1f446ea635c8.css`, 31 KB, `text/css`)
  - [ ] Tests unit/functional/e2e — **infraestructura no existe**: `/tests/` no creado, no hay `npm run test`. Vitest+Playwright instalados como devDep pero sin specs. Backlog.
  - [ ] Playwright MCP visual — no conectado en sesión.
- [ ] Merge `develop` → `main` (**diferido**: espera confirmación del cliente antes de alinear `main` con prod). Producción corre `6320113` mientras `main` sigue en `fe3ff77`.
- [x] Verificación post-deploy (HTTP 200 en las 7 rutas, sin login en prod, CSS OK)
- [x] Documentar URL de producción en `changelog.md` (https://filthy-friday-ops.vercel.app)
- [x] Configurar SSO Protection: producción pública, previews protegidos (`ssoProtection.deploymentType = preview`)
- [x] Generar Protection Bypass token para previews compartibles

---

## BACKLOG — Infra de testing (siguiente sprint)

> Pre-deploy checklist (claude.md §5) exige tests unit/functional/e2e pero la infra no existe. Diferido por scope; arrastra deuda en cada release.

### Wiring base
- [ ] Crear directorio `/tests/{unit,functional,e2e}/`
- [ ] Configurar Vitest (`vitest.config.ts` + `npm run test` + `npm run test:watch`)
- [ ] Configurar Playwright runner (`playwright.config.ts` + `npm run test:e2e`) — el devDep ya está instalado pero sin specs
- [ ] Integrar coverage (c8 vía Vitest)

### Specs prioritarios
- [ ] Unit: `src/lib/event-selection.ts` (pickDefaultEvent — 4 ramas), `src/lib/utils.ts` (formatPanamaTime, formatEventDate)
- [ ] Functional: `EventSelector` reacciona a `ff:event-changed`, persiste a localStorage; checklist toggle no triggerea fetch antes de `selectedId` resolverse (E-004 regression)
- [ ] E2E: golden path Home → Operación → Cuadre con evento seleccionado; selector cambia evento y propaga a Cuadre

### Hookear al pre-deploy
- [ ] Agregar `npm run test` y `npm run test:e2e` como steps obligatorios del checklist en claude.md §5
- [ ] CI gate en Vercel: bloquear `vercel deploy --prod` si tests fallan (build hook o GitHub Action)

---

## BACKLOG — Fase 2 (post-MVP)

> Especificación detallada en `productdesign.md` §7. **No implementar hasta cierre del MVP.**

### Sesión persistente (prerrequisito de modo offline)
- [ ] Habilitar Supabase Auth (sign-in mínimo: email + password o magic link)
- [ ] Configurar refresh token de larga duración (custom JWT expiry / refresh perpetuo cliente-side)
- [ ] Pantalla de login + estado "logueado" en layout
- [ ] Logout manual desde un menú de usuario
- [ ] Tests: login → cerrar/reabrir 24h con red → sesión activa
- [ ] Tests: login → cerrar/reabrir sin red → sesión activa con cache
- [ ] Tests: logout manual → próxima apertura pide credenciales

### Modo offline con sincronización
- [ ] Capa de cache en IndexedDB del evento activo (venues, checklist_items, crew, inventory, liquor_catalog, alerts, event)
- [ ] Hidratar las páginas desde IndexedDB en primer paint, refrescar contra Supabase si hay red
- [ ] Cola local de mutaciones (toggle de checklist, INSERT de alertas, updates de inventario, updates de cuadre) con `updated_at` cliente-side
- [ ] Listener `navigator.onLine` + evento `online` que dispara flush de la cola
- [ ] Resolución de conflictos por last-write-wins usando el `updated_at` encolado
- [ ] Indicador de estado en layout: `Offline — N cambios pendientes` / `Sincronizando…` / `Sincronizado ✓`
- [ ] Botón "Forzar sincronización" en una pantalla de Settings
- [ ] Tests: simular offline → mutación → verificar IndexedDB
- [ ] Tests: reconexión → verificar Supabase recibe los writes
- [ ] Tests: conflict resolution con dos toggles del mismo item en distintas redes

---

## Estado actual — 2026-04-27

- **Completado:** Fases 0, 1 (SQL ready), 2 (client + types), 3 (páginas con mock), 4 (branding aplicado), 4.1 (responsive + home redesign), 4.2 (multi-event), Fase 5 parcial (prod corriendo en https://filthy-friday-ops.vercel.app desde `develop`).
- **Bloqueos:** infraestructura de tests (Vitest+Playwright wired) sin armar — backlog. Playwright MCP no conectado para verificación visual.
- **Pendiente de cliente:** confirmación de Home rediseñado en prod → al OK, mergeamos `develop → main` y alineamos git history.
- **Próximo técnico:** implementar smoke test post-deploy (E-005 fix permanente) + scripts `npm run deploy:preview` / `deploy:prod` con `--force` por default.

*Última actualización: 2026-04-27 — Fase 5 parcial: prod live, pendiente merge a main + tests retroactivos.*
