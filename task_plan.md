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

## FASE 5 — TRIGGER

- [ ] Crear proyecto en Vercel y conectar a GitHub
- [ ] Configurar variables de entorno de producción en Vercel
- [ ] Crear proyecto Supabase de producción + aplicar migraciones
- [ ] Ejecutar Pre-Deploy checklist (claude.md §5)
- [ ] Merge `develop` → `main` (con aprobación explícita del usuario)
- [ ] Verificación post-deploy
- [ ] Documentar URL de producción en `changelog.md`

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

- **Completado:** Fases 0, 1 (SQL ready), 2 (client + types), 3 (páginas con mock), 4 (branding aplicado), 4.1 (responsive + home redesign).
- **Bloqueos:** falta credenciales Supabase para ejecutar migración + seed y conectar datos reales. Falta proyecto Vercel para Fase 5. Falta Playwright MCP para verificación visual automatizada.
- **Próximo:** el usuario provee credenciales Supabase → correr migración + seed → swap mock imports por queries reales → conectar Realtime al feed de alertas y checklist.

*Última actualización: 2026-04-27 — Fase 4.1 aplicada (layout responsive + Home rediseñado).*
