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

## FASE 5 — TRIGGER

- [ ] Crear proyecto en Vercel y conectar a GitHub
- [ ] Configurar variables de entorno de producción en Vercel
- [ ] Crear proyecto Supabase de producción + aplicar migraciones
- [ ] Ejecutar Pre-Deploy checklist (claude.md §5)
- [ ] Merge `develop` → `main` (con aprobación explícita del usuario)
- [ ] Verificación post-deploy
- [ ] Documentar URL de producción en `changelog.md`

---

---

## Estado actual — 2026-04-10

- **Completado:** Fases 0, 1 (SQL ready), 2 (client + types), 3 (páginas con mock), 4 (branding aplicado).
- **Bloqueos:** falta credenciales Supabase para ejecutar migración + seed y conectar datos reales. Falta proyecto Vercel para Fase 5.
- **Próximo:** el usuario provee credenciales Supabase → correr migración + seed → swap mock imports por queries reales → conectar Realtime al feed de alertas y checklist.

*Última actualización: 2026-04-10 — Fases 0-4 completas, pendiente conexión Supabase y Fase 5.*
