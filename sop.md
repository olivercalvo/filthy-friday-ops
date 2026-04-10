# sop.md — Filthy Friday OPS

> Standard Operating Procedures. Cada SOP es un flujo repetible. Si descubres un flujo nuevo que se va a repetir, agrégalo aquí.

---

## SOPs de infraestructura

### SOP-001 — Commit y Push a `develop`

1. `git status` — revisar archivos modificados
2. `git diff` — revisar cambios sustantivos
3. Confirmar que no hay secretos (`.env*`, claves, tokens)
4. Stage selectivo: `git add <archivos específicos>` (evitar `git add .`)
5. Commit con mensaje convencional:
   - `feat: <qué>` — nueva funcionalidad
   - `fix: <qué>` — bugfix
   - `docs: <qué>` — solo docs
   - `refactor: <qué>` — sin cambio funcional
   - `chore: <qué>` — tareas de mantenimiento
   - `test: <qué>` — tests
6. `git push origin develop`
7. Actualizar `task_plan.md` marcando la tarea como completada

---

### SOP-002 — Pre-Deploy y Merge a `main`

**Requiere aprobación explícita del usuario en el turno actual.**

1. Ejecutar el checklist de 13 pasos de `claude.md` §5
2. Registrar el hash actual de `main` en `changelog.md` como `previous: <hash>`
3. Bump de versión en `changelog.md` (semver)
4. `git checkout main && git pull origin main`
5. `git merge develop --no-ff`
6. `git push origin main` — dispara deploy automático en Vercel
7. Monitorear el deploy en Vercel dashboard
8. Ejecutar verificación post-deploy (`claude.md` §6)
9. Volver a `develop`: `git checkout develop`

---

### SOP-003 — Rollback

1. Identificar el hash estable previo (de `changelog.md` o `git log`)
2. **Opción A (rápida):** Vercel dashboard → Deployments → seleccionar deploy estable → "Promote to Production"
3. **Opción B (permanente):** `git revert <hash>` → push a `main` (con aprobación)
4. Verificar que producción responde
5. Documentar el incidente en `findings.md` con causa raíz
6. Crear hotfix si el bug es conocido (ver SOP-004)

---

### SOP-004 — Hotfix

1. `git checkout main && git pull`
2. `git checkout -b hotfix/<descripcion-corta>`
3. Aplicar fix mínimo — no refactorizar
4. Tests del flujo afectado
5. Commit
6. Pre-deploy checklist (versión ligera: build + lint + typecheck + test del flujo)
7. Merge a `main` con aprobación explícita
8. Merge a `develop` para mantenerlas sincronizadas
9. Documentar en `findings.md` + `changelog.md`

---

### SOP-005 — Migración de DB (Supabase)

1. Nueva migración en `/supabase/migrations/<timestamp>_<nombre>.sql`
2. Probar en el proyecto de dev primero
3. Actualizar tipos TypeScript: `npx supabase gen types typescript`
4. Commit de migración + tipos en el mismo commit
5. Para producción: aplicar la migración desde el dashboard de Supabase prod o CLI, **antes** del deploy que la requiere
6. Si la migración es destructiva (drop column, rename): crear backup primero
7. Documentar la migración en `changelog.md`

---

### SOP-006 — Self-Annealing (protocolo de errores)

1. **Analizar** la causa raíz — reproducir el error, leer stack trace, entender el porqué
2. **Documentar** en `findings.md` con: fecha, contexto, causa, fix aplicado
3. **Parchear** el código apuntando a la causa, no al síntoma
4. **Testear** con unit + functional + e2e si aplica
5. **Actualizar SOP** si el error revela un flujo repetible que debería estar codificado aquí
6. **Commit** a `develop`: `fix: <descripción>` referenciando el finding

---

## SOPs del proyecto

### SOP-007 — Crear nueva fiesta/evento

1. Ir a Home → botón "Nueva Fiesta" (o menú Admin)
2. Seleccionar fecha
3. El sistema crea un registro en `events` con `status = draft`
4. El sistema instancia `checklist_items` desde `checklist_templates` para los 3 venues
5. El sistema crea entradas en `liquor_movements` con `stock_start = liquor_catalog.stock` para cada bebida activa
6. Redirigir al Home del nuevo evento

---

### SOP-008 — Ejecutar checklist de montaje

1. Operación → Montaje → seleccionar venue
2. Tap en cada tarea para marcarla completada → actualiza `completed = true`, `completed_at = now()`, `completed_by = <nombre>`
3. Progress ring se actualiza en tiempo real
4. Al completar todas las tareas, habilitar botón "Subir video de aprobación"
5. El video se sube (en MVP: simular con URL), el venue pasa a `status = active` cuando el responsable aprueba

---

### SOP-009 — Registrar alerta en vivo

1. Operación → En Vivo → input de alerta
2. Escribir mensaje + seleccionar tipo (ok/warn/info) + venue opcional
3. Insertar en `alerts` con `time = now()`
4. La alerta aparece al tope del feed en todos los clientes conectados (Supabase Realtime)

---

### SOP-010 — Cuadre post-fiesta

1. Marcar el evento como `status = completed` al cierre
2. Operación → Cuadre
3. Ingresar manualmente (hasta que haya integraciones):
   - Tickets vendidos (Easymon)
   - Check-ins (QFlow)
   - Ventas VIP (total, cash, card, botellas)
   - Merchandise (unidades, total)
4. Actualizar stock final en Licor → calcular `consumed = stock_start - stock_end`
5. Guardar → el evento queda cerrado y los datos quedan disponibles para Reportes

---

*Última actualización: 2026-04-10 — inicialización.*
