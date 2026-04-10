# changelog.md — Filthy Friday OPS

Historial de versiones. Formato: [Keep a Changelog](https://keepachangelog.com/) + [Semantic Versioning](https://semver.org/).

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
