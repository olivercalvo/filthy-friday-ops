# productdesign.md — Filthy Friday OPS

> Documento vivo de requerimientos, modelo de datos y branding. Fuente única de verdad del alcance del producto.

---

## 1. Contexto del cliente

**Filthy Friday** organiza una fiesta todos los viernes en Bocas del Toro, Panamá. La operación se desarrolla en **3 venues** en secuencia, con traslados en bote entre ellos:

| # | Venue | Horario | Ubicación |
|---|-------|---------|-----------|
| 1 | 🏝️ Casa Papaya | 10:00 – 13:00 | Isla Carenero |
| 2 | 🥥 Blue Coconut | 13:30 – 18:00 | — |
| 3 | 🌊 Aqua Lounge | 19:00 – 02:00 | — |

- Asistencia típica: **300–500 personas por fiesta**
- Operación incluye: montaje de infraestructura, logística marítima, check-in, servicio VIP, venta de merchandise, desmontaje

### Problemas que resuelve
- Información fragmentada en Excel, WhatsApp y papel
- Checklists de montaje en tapas plastificadas pegadas a cajas
- Supervisión de montaje por video en WhatsApp sin registro formal
- Sin monitoreo en vivo durante la fiesta
- Cuadre post-fiesta manual (Easymon vs QFlow vs VIP) — toma horas
- Control de inventario entre 2 bodegas sin consolidar
- Gestión de personal/crew sin herramienta
- Sin visibilidad ejecutiva del estado general

### Sistemas externos (integración futura, no MVP)
- **Easymon** — venta de tickets (API)
- **QFlow** — check-in (API)
- **Factura Fácil** — facturación e inventario de bebidas que pasan por caja
- **Microsoft 365 / Teams** — colaboración
- **Connecteam** — evaluado para checklists, reemplazado por este sistema

---

## 2. North Star

> Una sola aplicación mobile-first donde el equipo operativo de Filthy Friday pueda preparar, ejecutar y cerrar cada fiesta con visibilidad total, reemplazando Excel, WhatsApp y papel.

---

## 3. Arquitectura de módulos

La app tiene **Home** + **3 módulos principales** accesibles desde un bottom navigation fijo.

```
┌─────────────────────────────────────────┐
│  HOME (Dashboard)                       │
├─────────────────────────────────────────┤
│  MÓDULO 1 — OPERACIÓN                   │
│    ├─ 1.1 Montaje                        │
│    ├─ 1.2 En Vivo                        │
│    └─ 1.3 Cuadre                         │
├─────────────────────────────────────────┤
│  MÓDULO 2 — ADMINISTRACIÓN              │
│    ├─ 2.1 Crew                           │
│    ├─ 2.2 Inventario (Equipos + Licor)   │
│    └─ 2.3 Reportes                       │
└─────────────────────────────────────────┘
```

### 3.1 HOME (Dashboard)
- Fecha de la fiesta actual
- Indicador del venue activo (cuál de los 3 está en curso)
- Badge **EN VIVO** animado cuando hay fiesta en progreso
- Métricas en tiempo real: tickets vendidos, check-ins, % montaje completado
- Cards de los 3 venues con estado de montaje (progress ring + badge)
- Feed en vivo con últimas alertas/actividad

### 3.2 MÓDULO 1 — OPERACIÓN

#### 1.1 Montaje
- Selector de venue: tabs horizontales (Casa Papaya / Blue Coconut / Aqua Lounge)
- Checklist interactivo por venue — tap para marcar completada
- Progress bar/ring con % de avance
- Botón para subir foto/video del montaje completado (para aprobación del responsable)

**Tareas de Casa Papaya:**
- Retirar/reubicar mobiliario existente
- Instalar señalización y banners
- Delimitar zona de ingreso (postes + sogas)
- Armar zona VIP con delimitación
- Instalar cabina DJ + prueba de sonido
- Coordinar comida/bebidas con venue
- Montar punto check-in (camisetas, bolsos, tokens)
- Posicionar coolers con hielo
- Enviar video de montaje para aprobación

**Tareas de Blue Coconut:**
- Instalar planta eléctrica
- Verificar refrigeración operativa
- Montar iluminación
- Armar zona VIP
- Instalar inflables y banners
- Ubicar coolers staff y VIP
- Enviar video de montaje para aprobación

**Tareas de Aqua Lounge:**
- Montar toldas
- Armar zona VIP
- Delimitar zona de botes
- Instalar banners y banderines
- Posicionar máquinas confetti + sparks
- Ubicar CO2 según instrucciones
- Posicionar personal de seguridad
- Enviar video de montaje para aprobación

#### 1.2 En Vivo
- Métricas en tiempo real: tickets vendidos, check-ins, % no-show, ventas VIP
- Status cards por venue: activo / pendiente / finalizado
- Feed de alertas cronológico (warnings amarillos, confirmaciones verdes, info neutral)
- Input manual de alertas: texto + selector de tipo (ok/warn/info) + venue opcional

#### 1.3 Cuadre (Post-Evento)
- **Reconciliación de tickets:** vendidos → check-in → no-show (barra visual)
- **Cuadre VIP:** total ventas, cantidad de botellas, desglose efectivo vs tarjeta
- **Merchandise:** unidades vendidas, total en $
- Todos los campos editables (ingreso manual; las APIs vienen en fase 2)

### 3.3 MÓDULO 2 — ADMINISTRACIÓN

#### 2.1 Crew
- Lista de personal con: nombre, rol, venue asignado, estado (active/pending/off)
- Filtros por estado
- Agrupado por venue
- Métricas header: total activos, pendientes, libres
- CRUD básico
- Avatar con inicial del nombre

#### 2.2 Inventario
Dos sub-tabs internos:

**Equipos (items operativos):**
- 2 indicadores de bodega (Bodega 1: Oficina / Bodega 2: Acceso por bote)
- Lista de items: nombre, total, asignado, disponibles, bodega
- Barra de progreso de asignación
- Alerta visual cuando un item está 100% asignado
- CRUD

**Licor (inventario de bebidas):**
- Catálogo: nombre, categoría (Ron/Vodka/Tequila/Whisky/Cerveza/Mixer/Otro), unidad (botella/lata/galón/caja), stock actual, stock mínimo
- Registro de movimientos por fiesta: stock inicial → consumo → stock final → diferencia
- Alerta visual cuando el stock < mínimo
- Filtros por categoría
- Vista de consumo por fiesta
- CRUD
- **Nota:** Factura Fácil maneja la facturación de bebidas que pasan por caja; este módulo controla el stock físico en bodegas de merchandise + licor que no pasa por caja.

#### 2.3 Reportes
Por ahora solo UI (la generación es fase futura):
- Reporte de Fiesta (resumen consolidado post-evento)
- Reconciliación Tickets (Easymon vs QFlow vs real)
- Cuadre Financiero (VIP + Merchandise + Tokens)
- Asistencia de Crew (horas, turnos, asignaciones)
- Movimiento de Inventario (consumo y devoluciones por venue)
- Histórico de Fiestas (tendencias, comparativas, KPIs)

---

## 4. Modelo de datos (Supabase)

### `venues`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| name | text | Casa Papaya, Blue Coconut, Aqua Lounge |
| emoji | text | 🏝️ 🥥 🌊 |
| order | int | 1, 2, 3 |
| start_time | time | |
| end_time | time | |
| location | text | |

### `events`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| date | date | |
| status | text | draft / active / completed |
| tickets_sold | int | default 0 |
| checked_in | int | default 0 |
| vip_total | decimal | default 0 |
| vip_cash | decimal | default 0 |
| vip_card | decimal | default 0 |
| vip_bottles | int | default 0 |
| merch_units | int | default 0 |
| merch_total | decimal | default 0 |
| active_venue_id | uuid FK | |

### `checklist_templates`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| venue_id | uuid FK | |
| task | text | |
| order | int | |

### `checklist_items`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| event_id | uuid FK | |
| template_id | uuid FK | |
| venue_id | uuid FK | |
| completed | boolean | default false |
| completed_at | timestamptz | |
| completed_by | text | texto libre (sin auth) |

### `crew_members`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| name | text | |
| role | text | Montaje, Seguridad, VIP Host, DJ, Bote Crew, etc. |
| status | text | active / pending / off |
| venue | text | nombre del venue, o "Flotante" si se mueve entre los 3 |
| phone | text | opcional |

### `inventory_items`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| name | text | |
| icon | text | emoji |
| total | int | |
| assigned | int | |
| bodega | int | 1 o 2 |

### `liquor_catalog`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| name | text | |
| category | text | ron/vodka/tequila/whisky/cerveza/mixer/otro |
| unit | text | botella/lata/galon/caja |
| stock | int | |
| min_stock | int | |
| icon | text | emoji |

### `liquor_movements`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| event_id | uuid FK | |
| liquor_id | uuid FK | |
| stock_start | int | |
| stock_end | int | |
| consumed | int | calculado |
| notes | text | |

### `alerts`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| event_id | uuid FK | |
| time | timestamptz | |
| message | text | |
| type | text | ok / warn / info |
| venue_id | uuid FK | opcional |

---

## 5. Diseño y branding

### Paleta (obligatoria)

| Token | HEX | Uso |
|-------|-----|-----|
| `--ff-near-black` | `#090A0B` | Background principal |
| `--ff-dark-gray` | `#161718` | Cards, elementos secundarios |
| `--ff-hot-pink` | `#FA2BA9` | Acento principal, CTAs, branding |
| `--ff-neon-yellow` | `#FFF200` | Warnings, estados pendientes |
| `--ff-neon-green` | `#9DFF60` | Éxito, estados activos |
| `--ff-gold` | `#F7DA64` | Montos financieros, títulos de sección |
| `--ff-white` | `#FFFFFF` | Texto principal |
| `--ff-dim-white` | `rgba(255,255,255,0.5)` | Texto secundario |

### Reglas de diseño
- **Mobile-first**: max-width 430px centrado, responsive hasta desktop
- **Dark theme** obligatorio (bg = near-black)
- **Border radius**: 12–14px cards, 20px badges/pills
- **Tipografía**: system-ui, -apple-system (sin fuentes custom)
- **Iconografía**: emojis + Lucide (ya viene con shadcn)
- **Bottom navigation**: 3 tabs fijos (Inicio ⚡, Operación 🎯, Admin ⚙️)
- **Sub-tabs**: pills horizontales con scroll
- **Progress rings**: SVG circular
- **Badges de estado**: pills con colores según status
- **Feed de alertas**: timeline vertical con dots de color por tipo

---

## 6. Alcance fuera del MVP

- Autenticación real
- Integración con Easymon, QFlow, Factura Fácil
- Generación real de reportes (PDF/Excel)
- Notificaciones push
- App nativa
- Multi-idioma

---

## 7. Backlog Fase 2 (post-MVP)

> Requerimientos confirmados para la siguiente iteración. **No implementar todavía** — documentado para planificación.

### 7.1 Modo offline con sincronización

**Contexto:** la fiesta se desarrolla en islas de Bocas del Toro donde la conectividad celular y WiFi es inestable. El equipo no puede depender de tener red continua durante el evento.

**Comportamiento esperado:**
- Al cargar la app con internet, se cachea toda la data del evento activo en **IndexedDB** (venues, checklist_items, crew, inventory, liquor_catalog, alerts, evento mismo).
- Si se pierde conexión, la app sigue funcionando con la data local cacheada — el usuario no debería notar diferencia funcional.
- Las acciones que se hagan offline se guardan en una **cola local de mutaciones** (checklist toggles, INSERT de alertas, updates de inventario, updates de cuadre).
- Al recuperar conexión (escuchar `navigator.onLine` + evento `online`), arranca **sincronización automática** que vacía la cola contra Supabase.
- **Resolución de conflictos:** gana el último timestamp (last-write-wins). Cada mutación encolada lleva `updated_at` local; el sync lo respeta y descarta versiones antiguas.

**UI / indicadores:**
- Badge de estado en el layout (al lado del OfflinePill actual o reemplazándolo):
  - `Offline — N cambios pendientes` (cuando no hay red y hay cola)
  - `Sincronizando…` (durante el flush de la cola)
  - `Sincronizado ✓` (última sync OK, fade-out tras 3s)
- Botón discreto de "Forzar sincronización" en una pantalla de Settings (fallback manual).

**Tests requeridos:**
- Simular `navigator.onLine = false` → verificar que mutaciones entran a la cola en IndexedDB.
- Simular reconexión → verificar que la cola se vacía y aparece en Supabase.
- Verificar que un toggle hecho offline + un toggle hecho online sobre el mismo item resuelve por timestamp.
- Confirmar que la primera carga sin red usa exclusivamente la data en IndexedDB.

**Prerrequisito:** §7.2 (sesión persistente) — sin ella, perder red al expirar el token deja la app inutilizable.

---

### 7.2 Sesión persistente

**Comportamiento esperado:**
- La sesión del usuario **NO expira automáticamente**.
- El logout solo ocurre cuando el usuario lo hace manualmente desde la app.
- Configurar Supabase Auth con refresh token de larga duración (custom JWT expiry o flujo de refresh perpetuo cliente-side).
- Flujo típico: el usuario se loguea una sola vez con WiFi de oficina/hotel y el dispositivo queda activo durante toda la operación, incluso si la app se cierra y se reabre, incluso sin red al reabrir.

**Razón:**
- En las islas de Bocas no hay red estable; un token expirado offline equivaldría a perder acceso a la app entera.
- Es **prerrequisito de §7.1** (modo offline) — el usuario tiene que poder seguir trabajando aunque el dispositivo lleve horas sin conexión.

**Tests requeridos:**
- Login → cerrar app → reabrir 24h después con red → sesión activa.
- Login → cerrar app → reabrir sin red → sesión activa, app funcional con cache.
- Logout manual → confirmar que la sesión sí termina y la siguiente apertura pide credenciales.

---

*Última actualización: 2026-04-27 — backlog Fase 2 (offline + sesión persistente).*
