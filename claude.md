# claude.md — Filthy Friday OPS

> **Constitución del proyecto.** Este documento rige cómo Claude Code y cualquier colaborador trabajan en este repositorio. Precede a cualquier instrucción ad-hoc en una conversación.

---

## 1. Identidad del proyecto

- **Nombre:** Filthy Friday OPS
- **Cliente:** Filthy Friday (Bocas del Toro, Panamá)
- **Tipo:** Aplicación web mobile-first para gestión operativa de eventos
- **Repositorio:** `filthy-friday-ops` (GitHub, público)
- **Framework de trabajo:** BLAST (Blueprint → Links → Architect → Stylize → Trigger)

### North Star
> Una sola aplicación mobile-first donde el equipo operativo de Filthy Friday pueda preparar, ejecutar y cerrar cada fiesta con visibilidad total, reemplazando Excel, WhatsApp y papel.

---

## 2. Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS + shadcn/ui |
| Iconografía | Lucide (shadcn default) + emojis |
| Base de datos | Supabase (PostgreSQL + Realtime) |
| Hosting | Vercel (auto-deploy desde `main`) |
| Auth | **NO implementada** — simular usuario logueado (prototipo) |
| CI/CD | Vercel preview en cada push a `develop` |
| Testing | Vitest (unit + functional), Playwright (e2e), Playwright MCP (visual) |

### Sistemas externos (NO integrar todavía, solo documentar)
- **Easymon** — venta de tickets (API disponible)
- **QFlow** — check-in (API disponible)
- **Factura Fácil** — facturación e inventario de bebidas que pasan por caja
- **Microsoft 365 / Teams** — colaboración existente
- **Connecteam** — evaluado para checklists (reemplazado por este sistema)

---

## 3. Reglas de ramas

| Rama | Propósito | Reglas |
|------|-----------|--------|
| `main` | Producción — auto-deploy a Vercel | **NUNCA** push/merge sin aprobación explícita del usuario |
| `develop` | Default — trabajo diario | Todos los commits de Claude van aquí |
| `feature/*` | Features específicas grandes | Se mergean a `develop` |
| `hotfix/*` | Fixes urgentes a producción | Del `main` → fix → merge a `main` y `develop` |

**Regla inviolable:** Claude nunca hace `git push origin main`, `git merge main`, ni `git push --force` sin que el usuario lo pida de forma explícita en el turno actual. La aprobación se da por scope, no para siempre.

---

## 4. Variables de entorno y secretos

- **Nunca** commitear archivos `.env*`. El `.gitignore` debe incluir `.env`, `.env.local`, `.env.*.local`.
- **Local:** `.env.local` con credenciales de desarrollo de Supabase
- **Producción:** credenciales solo en el dashboard de Vercel (Settings → Environment Variables)
- **Variables esperadas:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (solo server-side, nunca `NEXT_PUBLIC_`)

Si Claude detecta que un secreto fue accidentalmente staged, debe detener el flujo y avisar al usuario antes de commitear.

---

## 5. Pre-deploy checklist (13 pasos, obligatorio antes de merge a `main`)

1. [ ] `develop` está al día con los últimos cambios del usuario
2. [ ] `npm run build` pasa sin errores ni warnings críticos
3. [ ] `npm run lint` limpio
4. [ ] `npm run typecheck` (o `tsc --noEmit`) limpio
5. [ ] Tests unitarios pasan (`npm run test`)
6. [ ] Tests funcionales pasan
7. [ ] Tests e2e (Playwright) pasan en las rutas críticas
8. [ ] Playwright MCP verificó visualmente el Home, Operación, Admin
9. [ ] `changelog.md` actualizado con la versión y cambios
10. [ ] `task_plan.md` refleja el estado real
11. [ ] Variables de entorno de producción confirmadas en Vercel
12. [ ] Migraciones de DB aplicadas y verificadas en Supabase prod
13. [ ] Hash del commit actual de `main` registrado para posible rollback

---

## 6. Post-deploy: verificación

- Abrir la URL de producción y verificar: Home carga, navegación entre módulos, un CRUD básico, métricas en vivo.
- Revisar logs de Vercel por errores de runtime.
- Confirmar que no hay 500s en las primeras 5 minutos.
- Si algo falla: ejecutar SOP-003 (Rollback).

---

## 7. Rollback

- **Siempre** registrar el hash anterior de `main` antes de cualquier merge. Se anota en `changelog.md` como "previous: <hash>".
- Rollback = `git revert <hash>` + push a `main` (con aprobación del usuario) o redeploy del commit anterior desde el dashboard de Vercel.
- Ver SOP-003 para el flujo completo.

---

## 8. Auto-commit y sincronización de docs

- Después de **cada cambio significativo** (nueva ruta, nueva migración, nuevo componente con lógica), Claude hace commit a `develop` con mensaje claro siguiendo SOP-001.
- Después de cada cambio, Claude **actualiza los `.md` relevantes** (`task_plan.md` siempre; `findings.md` si hubo un descubrimiento/error/decisión; `changelog.md` en cada bump de versión; `sop.md` si se descubre un nuevo flujo repetible; `productdesign.md` si cambia el alcance).
- Los `.md` son parte del repo y se commitean junto con el código que documentan.

---

## 9. Testing

Todos los tests viven en `/tests/`:

```
/tests
  /unit         — funciones puras, utils, reducers
  /functional   — componentes con lógica, hooks, integraciones de DB
  /e2e          — flujos completos con Playwright
```

- Cada nueva función no trivial requiere al menos un test unitario.
- Cada nuevo flujo de usuario requiere al menos un e2e.
- **Playwright MCP** se usa en cada turno antes y después del cambio para verificar el estado visual de la app. Capturar screenshot inicial → aplicar cambio → capturar screenshot final → comparar.

---

## 10. Self-Annealing (protocolo de errores)

Cuando Claude encuentra un error (runtime, test failure, comportamiento inesperado):

1. **Analizar** la causa raíz — no parchar síntomas.
2. **Documentar** el hallazgo en `findings.md` con fecha, contexto, causa, fix.
3. **Parchear** el código.
4. **Testear** el fix (unit + functional + e2e si aplica).
5. **Actualizar SOP** si el error revela un proceso repetible que debería estar codificado.
6. **Commit** a `develop` con mensaje `fix: <descripción>` + referencia al finding.

---

## 11. Tabla de archivos de referencia

| Archivo | Propósito | Quién lo actualiza |
|---------|-----------|-------------------|
| `claude.md` | Constitución del proyecto (este archivo) | Claude, solo con aprobación explícita del usuario |
| `productdesign.md` | Requerimientos, modelo de datos, branding | Claude, cuando cambia el alcance |
| `sop.md` | Procedimientos operativos estándar | Claude, cuando descubre un flujo repetible |
| `task_plan.md` | Plan de trabajo vivo, fases BLAST | Claude, en cada turno |
| `changelog.md` | Historial de versiones | Claude, en cada bump |
| `findings.md` | Errores, descubrimientos, decisiones técnicas | Claude, en cada hallazgo |
| `Filthy_Friday_Brand_Guidelines.md` | Guía de marca del cliente | Solo lectura — no modificar |

---

## 12. Principios de código

- **TypeScript strict.** Nada de `any` sin justificación en un comentario.
- **Server components por default.** Client components solo cuando sea necesario (interactividad, hooks).
- **Mobile-first.** Diseñar siempre para 430px primero, luego desktop.
- **Dark theme obligatorio.** El fondo siempre es `#090A0B`.
- **No comentar lo obvio.** Comentarios solo para el "por qué" no-obvio.
- **No abstraer prematuramente.** Tres líneas similares está bien, no crear una función hasta el cuarto uso o cuando hay una razón clara.

---

*Última actualización: 2026-04-10 — inicialización del proyecto.*
