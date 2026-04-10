# task_plan.md — Filthy Friday OPS

> Plan de trabajo vivo, organizado por fases BLAST. Actualizar en cada turno.
>
> Leyenda: `[ ]` pendiente · `[~]` en progreso · `[x]` hecho · `[!]` bloqueado

---

## FASE 0 — INIT

- [x] Generar `claude.md`
- [x] Generar `productdesign.md`
- [x] Generar `sop.md`
- [x] Generar `changelog.md`
- [x] Generar `task_plan.md`
- [x] Generar `findings.md`
- [ ] `git init` en la raíz del proyecto
- [ ] Crear `.gitignore` (Node + Next.js + .env*)
- [ ] Primer commit: `chore: init project with BLAST framework`
- [ ] `gh repo create filthy-friday-ops --public --source=. --remote=origin`
- [ ] Crear rama `develop` y setearla como default
- [ ] Push inicial a `origin/develop`

---

## FASE 1 — BLUEPRINT

### Supabase
- [ ] Crear proyecto Supabase (dev)
- [ ] Guardar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`
- [ ] Migración inicial: tablas `venues`, `events`, `checklist_templates`, `checklist_items`, `crew_members`, `inventory_items`, `liquor_catalog`, `liquor_movements`, `alerts`
- [ ] Habilitar Realtime en `events`, `checklist_items`, `alerts`
- [ ] Seed: 3 venues, todas las checklist_templates, 10 crew, 10 inventory, 10 liquor, 1 evento de hoy

### Next.js
- [ ] `npx create-next-app@latest filthy-friday-ops --ts --tailwind --app --src-dir --import-alias "@/*"` (en una carpeta temporal, luego mover contenido a la raíz)
- [ ] Instalar shadcn/ui: `npx shadcn@latest init`
- [ ] Componentes base: button, card, tabs, input, dialog, badge, progress

---

## FASE 2 — LINKS

- [ ] `src/lib/supabase/client.ts` — cliente browser
- [ ] `src/lib/supabase/server.ts` — cliente server
- [ ] `src/types/database.ts` — tipos generados desde Supabase (`npx supabase gen types typescript`)
- [ ] `src/lib/queries/` — helpers de queries tipadas por tabla
- [ ] Hooks: `useActiveEvent`, `useVenues`, `useChecklistForVenue`, `useAlertsFeed`

---

## FASE 3 — ARCHITECT

### Layout global
- [ ] `src/app/layout.tsx` — dark theme, fuentes, bg near-black
- [ ] `src/components/BottomNav.tsx` — 3 tabs fijos
- [ ] `src/components/MobileShell.tsx` — max-width 430px centrado, responsive

### Home
- [ ] `src/app/page.tsx` — dashboard
- [ ] Componente `EventHeader` (fecha + badge EN VIVO)
- [ ] Componente `MetricsStrip` (tickets, check-ins, % montaje)
- [ ] Componente `VenueCard` con progress ring
- [ ] Componente `LiveFeed` (últimas alertas)

### Módulo Operación
- [ ] `src/app/operacion/layout.tsx` — sub-tabs pills
- [ ] `src/app/operacion/montaje/page.tsx`
  - [ ] Selector de venue
  - [ ] Lista de checklist_items con tap-to-complete
  - [ ] Progress ring
  - [ ] Botón subir video (stub)
- [ ] `src/app/operacion/en-vivo/page.tsx`
  - [ ] Métricas en tiempo real
  - [ ] Status cards por venue
  - [ ] Feed de alertas (Realtime)
  - [ ] Input para crear alerta
- [ ] `src/app/operacion/cuadre/page.tsx`
  - [ ] Reconciliación de tickets (barra visual)
  - [ ] Cuadre VIP (inputs editables)
  - [ ] Merchandise (inputs editables)

### Módulo Administración
- [ ] `src/app/admin/layout.tsx` — sub-tabs pills
- [ ] `src/app/admin/crew/page.tsx`
  - [ ] Lista agrupada por venue
  - [ ] Filtros por status
  - [ ] Dialog CRUD
- [ ] `src/app/admin/inventario/page.tsx` con sub-tabs Equipos/Licor
  - [ ] Equipos: lista, bodega indicators, CRUD
  - [ ] Licor: catálogo, movimientos, alertas de mínimo, CRUD
- [ ] `src/app/admin/reportes/page.tsx`
  - [ ] Lista de reportes (solo UI)

---

## FASE 4 — STYLIZE

- [ ] Configurar Tailwind theme con tokens de marca en `tailwind.config.ts`
- [ ] Custom CSS vars en `globals.css` (`--ff-*`)
- [ ] Aplicar paleta a todos los componentes
- [ ] Progress ring SVG custom con `--ff-hot-pink`
- [ ] Badges con colores según status
- [ ] Animación del badge EN VIVO (pulse)
- [ ] Microinteracciones en tap de checklist
- [ ] Verificación visual con Playwright MCP en cada ruta

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

*Última actualización: 2026-04-10 — Fase 0 en progreso.*
