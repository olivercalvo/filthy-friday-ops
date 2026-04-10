# findings.md — Filthy Friday OPS

> Registro de descubrimientos, constraints, errores, tests y decisiones técnicas. Se actualiza en cada hallazgo.

---

## Descubrimientos

*(ninguno todavía)*

---

## Constraints

### C-001 — Sin autenticación en MVP
- **Fecha:** 2026-04-10
- **Contexto:** El cliente pidió un prototipo funcional. No hay necesidad de login/roles en esta fase.
- **Implicación:** Simular un usuario logueado (hardcoded "Diana" o similar). Los campos `completed_by` son texto libre. No implementar RLS restrictivo — políticas permisivas en Supabase para que la anon key pueda leer/escribir.
- **Cuándo revisar:** Antes de mover a producción con datos reales.

### C-002 — APIs externas disponibles pero no integradas
- **Fecha:** 2026-04-10
- **Contexto:** Easymon (tickets) y QFlow (check-in) tienen APIs disponibles. Factura Fácil maneja facturación de bebidas que pasan por caja.
- **Implicación:** Todos los campos de tickets/check-ins/VIP/merch son de ingreso manual en el MVP. La arquitectura debe dejar espacio para reemplazar la fuente de datos sin refactorizar componentes.
- **Cuándo integrar:** Fase 2 del proyecto (post-MVP).

### C-003 — Dos bodegas físicas con acceso distinto
- **Fecha:** 2026-04-10
- **Contexto:** Bodega 1 en oficina (acceso inmediato), Bodega 2 accesible solo por bote.
- **Implicación:** El campo `bodega` en `inventory_items` es crítico. La UI debe destacar visualmente items en Bodega 2 porque reabastecer toma horas.

---

## Errores

*(ninguno todavía)*

---

## Tests

*(ninguno todavía)*

---

## Decisiones técnicas

### D-001 — Supabase como backend + Realtime
- **Fecha:** 2026-04-10
- **Decisión:** Usar Supabase en lugar de un backend custom.
- **Razones:** Realtime nativo para el feed en vivo y métricas, PostgreSQL serio, sin servidor que mantener, integración directa con Next.js, plan free suficiente para el MVP.
- **Alternativas descartadas:** Firebase (NoSQL no encaja con el modelo relacional), backend custom en Node (overhead innecesario).

### D-002 — Vercel para hosting
- **Fecha:** 2026-04-10
- **Decisión:** Deploy a Vercel desde `main`.
- **Razones:** Integración nativa con Next.js, previews por PR, edge runtime, gratis para el MVP.

### D-003 — Mobile-first con desktop responsive
- **Fecha:** 2026-04-10
- **Decisión:** Diseñar para 430px primero, usar max-width 430px centrado en desktop.
- **Razones:** El equipo operativo usa teléfonos en campo. El desktop es secundario (solo para supervisión).

### D-004 — Sin fuentes custom en MVP
- **Fecha:** 2026-04-10
- **Decisión:** Usar `system-ui` aunque el brand guidelines marque Cheddargothic y Anodyne.
- **Razones:** Las fuentes del brand son de pago. Evaluar alternativas gratis (Bebas Neue, Space Grotesk) en Fase 4. El branding del color + layout ya carga suficiente personalidad para el MVP.

---

*Última actualización: 2026-04-10 — inicialización.*
