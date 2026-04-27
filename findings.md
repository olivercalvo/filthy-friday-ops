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

### E-001 — Screenshots sin estilos por dev server fantasma + cache `.next/` corrupto
- **Fecha:** 2026-04-27
- **Síntoma:** Los screenshots del script `npm run screenshots` salieron como HTML plano sin Tailwind, sin dark theme, sin colores. La app parecía no estar aplicando CSS.
- **Causa raíz:** Había un proceso `next dev` viejo escuchando en `:3000` con un `.next/` corrupto que servía HTML cuando se le pedía `/_next/static/css/app/layout.css` (el archivo CSS literalmente no existía en su build, así que el dev server respondía con la página index como fallback). Cuando levanté un `npm run dev` nuevo encima, Next.js detectó el puerto ocupado y rebotó a `:3002`, donde la compilación de Tailwind funcionaba bien (CSS de 40 KB). Pero el script `screenshots.ts` apunta por defecto a `localhost:3000`, así que capturó las páginas del dev server roto.
- **Verificación:** `curl http://localhost:3000/_next/static/css/app/layout.css` devolvía HTML; `curl http://localhost:3002/_next/static/css/app/layout.css` devolvía CSS válido. Esto descartó cualquier problema de config (tailwind.config.ts, postcss.config.mjs, globals.css, layout.tsx) — todo estaba bien.
- **Fix:**
  1. Matar todos los procesos node escuchando en :3000-:3002 (`Stop-Process` por puerto).
  2. `rm -rf .next/` para limpiar cache stale.
  3. `npm run dev` (arranca limpio en :3000).
  4. Re-correr `npm run screenshots`.
- **Lección:** Antes de tocar config de Tailwind, verificar que el dev server al que apuntan los screenshots realmente está sirviendo el CSS compilado. Validación rápida: `curl <CSS_URL>` debe devolver `/*! ... css-loader ... globals.css */` y pesar decenas de KB. Si devuelve HTML, hay un dev server fantasma o un build corrupto.
- **Prevención:** Considerar añadir al script `screenshots.ts` un check explícito de `Content-Type: text/css` sobre la primera URL de stylesheet del HTML antes de capturar — falla rápido en lugar de generar 21 PNGs inútiles.

### E-002 — Hydration mismatch en /operacion/en-vivo (badge "1 error")
- **Fecha:** 2026-04-27
- **Síntoma:** Badge rojo "1 error" en la esquina inferior de la pantalla En Vivo. La página seguía siendo usable pero React abandonaba SSR y re-renderizaba todo en cliente.
- **Causa raíz (dos bugs apilados):**
  1. **`Date.now()` en module scope.** `mockAlerts` en `src/lib/mock-data.ts` calculaba timestamps con `new Date(Date.now() - N*60000).toISOString()`. El módulo se evalúa una vez en server (al SSR) y otra vez en client (al hidratar el bundle), separadas por segundos/minutos — los timestamps no coinciden y el feed renderea minutos distintos en cada lado.
  2. **Divergencia de ICU entre Node y V8.** Aún tras anclar timestamps a strings fijos, `Intl.DateTimeFormat` (vía `toLocaleTimeString`) emite caracteres invisibles distintos entre Node (server) y Chromium (client) — típicamente NBSP (U+00A0) vs NNBSP (U+202F) entre la hora y el "p. m.". Visualmente idéntico, bytes distintos, hydration mismatch.
- **Fix:**
  1. Reemplazar todos los `new Date()` / `Date.now()` de `mock-data.ts` con timestamps absolutos anclados a `MOCK_EVENT_DATE = "2026-04-27"` y `MOCK_NOW_ISO = "14:30:00-05:00"`.
  2. Crear `formatPanamaTime(iso)` en `src/lib/utils.ts` que parsea el ISO con math entera (sin `Intl`, sin `toLocale*`) y devuelve `"hh:mm a. m."`. 100% determinístico entre runtimes.
- **Lección:** En SSR + client components, **cualquier `new Date()` o `Date.now()` en module scope** es un riesgo de hydration mismatch, igual que **`Intl.DateTimeFormat`** lo es por divergencia de ICU. Para datos mock, anclar a strings fijos. Para timestamps reales que sí cambian, formatear con utilities propias o usar `useEffect` post-mount con `suppressHydrationWarning`.
- **Prevención:** Cuando agreguemos un `findings`/`commit` hook, considerar grep de `new Date()` o `Date.now()` en archivos bajo `src/lib/` (capa de datos) — esos son lugares clásicos donde el determinismo importa.

### E-003 — PGRST205: tablas no encontradas en el proyecto Supabase
- **Fecha:** 2026-04-27
- **Síntoma:** Tras conectar la app a Supabase con la URL `rgyywpraqgnyzfzncuoc.supabase.co` y la anon publishable key, **todas** las queries devuelven `PGRST205 — Could not find the table 'public.<X>' in the schema cache` (HTTP 404). La app usa el fallback a mock y queda 100% funcional pero no contra DB real.
- **Causa raíz:** Las migraciones (`supabase/migrations/0001_init.sql` + `supabase/seed.sql`) no se ejecutaron en este proyecto. La REST API responde y la auth funciona — solo no hay tablas.
- **Verificación:** `curl -H "apikey: …" https://…supabase.co/rest/v1/venues?select=id&limit=1` → `404 PGRST205`. Mismo error para las 9 tablas de la migración.
- **Fix:** Ejecutar el SQL de `supabase/migrations/0001_init.sql` y luego `supabase/seed.sql` en el SQL Editor del proyecto Supabase (o vía `supabase db push` con CLI linkeada). PostgREST refresca el schema cache automáticamente al detectar DDL.
- **Lección secundaria — `head: true` enmascara errores:** Mi primer `pingSupabase()` usaba `select("id", { head: true, count: "exact" }).limit(1)` para detectar la conexión. Con `head: true`, supabase-js no propagaba el error PGRST205 (devolvía `error: null`), así que el indicador "modo offline" no se mostraba aunque las queries reales fallaban. **Fix:** usar un select normal `.select("id").limit(1)` para el ping. La detección de errores funciona bien sin `head: true`.

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

### D-003 — Mobile-first con desktop responsive (revisado 2026-04-27)
- **Fecha:** 2026-04-10 (decisión inicial) · **Revisado:** 2026-04-27
- **Decisión actual:** Mobile-first sigue vigente (430px de referencia), pero ahora con 3 breakpoints completos: mobile <768 (1 col + bottom nav), tablet 768–1024 (2 col + bottom nav), desktop ≥1024 (sidebar 220px + grid 2-3 col, max-w-1280 centrado).
- **Razones del cambio:** El supervisor en oficina necesita ver más información a la vez. Mantener todo a 430px en desktop desperdicia espacio. Bottom nav no tiene sentido en pantalla grande con cursor.
- **Implementación:** `SideNav` (lg:flex), `BottomNav` con `lg:hidden`, `MobileShell` con `lg:pl-[220px] lg:max-w-1280`, grids `md:grid-cols-2 lg:grid-cols-3`.

### D-004 — Sin fuentes custom en MVP
- **Fecha:** 2026-04-10
- **Decisión:** Usar `system-ui` aunque el brand guidelines marque Cheddargothic y Anodyne.
- **Razones:** Las fuentes del brand son de pago. Evaluar alternativas gratis (Bebas Neue, Space Grotesk) en Fase 4. El branding del color + layout ya carga suficiente personalidad para el MVP.

---

### D-005 — Home como landing de módulos, no dashboard
- **Fecha:** 2026-04-27
- **Decisión:** El Home pasa de ser un dashboard cargado (métricas + venues + feed) a una landing limpia con cards de navegación. Las métricas detalladas, venues con progress y feed en vivo se mueven a Operación → En Vivo.
- **Razones:** El Home tenía demasiada información mezclada de distintos módulos. La separación clarifica que Operación es donde se monitorea la fiesta y el Home es solo el punto de entrada.
- **Implicación:** En Vivo ahora es la pantalla "operativa" del supervisor durante la fiesta. El Home queda como entrada con un resumen breve si hay fiesta activa.

---

### D-006 — Selección de evento via localStorage + CustomEvent
- **Fecha:** 2026-04-27
- **Decisión:** El evento seleccionado vive en `localStorage` (`ff_selected_event_id`) y los cambios se propagan dentro del tab vía un `CustomEvent` en `window` (`ff:event-changed`). No se usó URL param ni cookie.
- **Razones:**
  - Persiste entre navegaciones cliente sin refresh ni server roundtrip.
  - Los módulos de Operación (montaje, en-vivo, cuadre) son client components; leer `localStorage` es trivial.
  - La alternativa con cookie + Server Action se descartó porque el Home necesita reaccionar inmediatamente al cambio sin un `router.refresh()`.
- **Implicación:** No hay sync entre tabs (sería `storage` event); aceptable porque el caso de uso es un dispositivo por usuario durante el evento.

---

## Errores

### E-004 — Race condition entre fetch de events y fetch de checklist por id
- **Fecha:** 2026-04-27
- **Síntoma:** Al cargar el Home aparecía un 400 en `/rest/v1/checklist_items?event_id=eq.e1` con `code 22P02 invalid input syntax for type uuid: "e1"`.
- **Causa:** El estado inicial de `selectedId` era `mockEvent.id = "e1"` y el `useEffect` del checklist disparaba con ese valor antes de que el `useEffect` que carga la lista de events lo sobreescribiera con el id real.
- **Fix:** `selectedId` arranca en `null` y el `useEffect` del checklist hace early return mientras siga `null`. El primer setSelectedId real lo activa.
- **Lección:** Cuando un efecto B depende de estado seteado por un efecto A en el mismo mount, el initial value de ese estado tiene que ser un sentinel "not ready" (null/undefined) y B tiene que gatear, o A y B deben fusionarse.

---

### F-001 — Calendar mismatch en seed de eventos
- **Fecha:** 2026-04-27
- **Síntoma:** El usuario pidió "Viernes 18 de abril 2026", "Viernes 25 de abril 2026" y "Viernes 2 de mayo 2026" como seed.
- **Hallazgo:** En el calendario real de 2026 esas fechas son sábados, no viernes. Los viernes equivalentes son Apr 17, Apr 24 y May 1.
- **Decisión interina:** El seed usa las fechas literales que dio el usuario. El UI muestra "Sábado" porque `Date.toLocaleDateString('es-PA',...)` no miente sobre el día. Pendiente de confirmación del usuario para ajustar a las fechas reales de viernes si quiere mantener el patrón.

---

*Última actualización: 2026-04-27 — D-006 + E-004 + F-001 (event selector y calendar mismatch).*
