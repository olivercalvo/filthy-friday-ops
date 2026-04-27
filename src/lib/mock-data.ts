// Mock data used when Supabase credentials are not configured.
// Same shape as Supabase rows — swap seamlessly once DB is live.

import type {
  VenueRow,
  EventRow,
  ChecklistItemRow,
  CrewMemberRow,
  InventoryItemRow,
  LiquorCatalogRow,
  AlertRow,
} from "@/types/database";

export const mockVenues: VenueRow[] = [
  { id: "v1", name: "Casa Papaya", emoji: "🏝️", order: 1, start_time: "10:00", end_time: "13:00", location: "Isla Carenero" },
  { id: "v2", name: "Blue Coconut", emoji: "🥥", order: 2, start_time: "13:30", end_time: "18:00", location: "Bocas Town" },
  { id: "v3", name: "Aqua Lounge", emoji: "🌊", order: 3, start_time: "19:00", end_time: "02:00", location: "Isla Solarte" },
];

// Fecha del evento mock — fija para que el render sea determinístico
// (cualquier `new Date()` en module scope evalúa distinto en server vs client
// y dispara hydration mismatch en el feed En Vivo).
const MOCK_EVENT_DATE = "2026-04-27";

export const mockEvent: EventRow = {
  id: "e1",
  date: MOCK_EVENT_DATE,
  status: "active",
  tickets_sold: 412,
  checked_in: 287,
  vip_total: 4850,
  vip_cash: 2100,
  vip_card: 2750,
  vip_bottles: 18,
  merch_units: 64,
  merch_total: 1280,
  active_venue_id: "v2",
};

export const checklistTasks: Record<string, string[]> = {
  v1: [
    "Retirar/reubicar mobiliario existente",
    "Instalar señalización y banners",
    "Delimitar zona de ingreso (postes + sogas)",
    "Armar zona VIP con delimitación",
    "Instalar cabina DJ + prueba de sonido",
    "Coordinar comida/bebidas con venue",
    "Montar punto check-in (camisetas, bolsos, tokens)",
    "Posicionar coolers con hielo",
    "Enviar video de montaje para aprobación",
  ],
  v2: [
    "Instalar planta eléctrica",
    "Verificar refrigeración operativa",
    "Montar iluminación",
    "Armar zona VIP",
    "Instalar inflables y banners",
    "Ubicar coolers staff y VIP",
    "Enviar video de montaje para aprobación",
  ],
  v3: [
    "Montar toldas",
    "Armar zona VIP",
    "Delimitar zona de botes",
    "Instalar banners y banderines",
    "Posicionar máquinas confetti + sparks",
    "Ubicar CO2 según instrucciones",
    "Posicionar personal de seguridad",
    "Enviar video de montaje para aprobación",
  ],
};

// Hora ancla del evento (Blue Coconut activo, ~14:30 hora Panamá).
// Todos los timestamps mock se derivan de aquí para ser deterministas.
const MOCK_NOW_ISO = `${MOCK_EVENT_DATE}T14:30:00-05:00`;
const MOCK_PAST_ISO = `${MOCK_EVENT_DATE}T11:00:00-05:00`;

// Deterministic mock state: pretend Casa Papaya is done, Blue Coconut mid-progress, Aqua Lounge untouched.
export const mockChecklistItems: (ChecklistItemRow & { task: string })[] = [
  ...checklistTasks.v1.map((task, i) => ({
    id: `ci-v1-${i}`, event_id: "e1", template_id: `t-v1-${i}`, venue_id: "v1",
    completed: true, completed_at: MOCK_PAST_ISO, completed_by: "Rey", task,
  })),
  ...checklistTasks.v2.map((task, i) => ({
    id: `ci-v2-${i}`, event_id: "e1", template_id: `t-v2-${i}`, venue_id: "v2",
    completed: i < 4, completed_at: i < 4 ? MOCK_NOW_ISO : null, completed_by: i < 4 ? "Luis R." : null, task,
  })),
  ...checklistTasks.v3.map((task, i) => ({
    id: `ci-v3-${i}`, event_id: "e1", template_id: `t-v3-${i}`, venue_id: "v3",
    completed: false, completed_at: null, completed_by: null, task,
  })),
];

export const mockCrew: CrewMemberRow[] = [
  { id: "c1", name: "Diana", role: "Gerente de Operaciones", status: "active", venue: "Flotante", phone: null },
  { id: "c2", name: "Rey", role: "Jefe de Crew", status: "active", venue: "Casa Papaya", phone: null },
  { id: "c3", name: "Carlos M.", role: "Montaje", status: "active", venue: "Casa Papaya", phone: null },
  { id: "c4", name: "Luis R.", role: "Montaje", status: "active", venue: "Blue Coconut", phone: null },
  { id: "c5", name: "Martina", role: "Check-in Lead", status: "active", venue: "Casa Papaya", phone: null },
  { id: "c6", name: "Sofía V.", role: "VIP Host", status: "pending", venue: "Aqua Lounge", phone: null },
  { id: "c7", name: "Jake T.", role: "Seguridad", status: "active", venue: "Blue Coconut", phone: null },
  { id: "c8", name: "Ana P.", role: "Barra VIP", status: "off", venue: "Aqua Lounge", phone: null },
  { id: "c9", name: "Marco D.", role: "DJ", status: "active", venue: "Casa Papaya", phone: null },
  { id: "c10", name: "Tomás", role: "Bote Crew", status: "active", venue: "Flotante", phone: null },
];

export const mockInventory: InventoryItemRow[] = [
  { id: "i1", name: "Coolers grandes", icon: "❄️", total: 12, assigned: 10, bodega: 2 },
  { id: "i2", name: "Camisetas promo", icon: "👕", total: 350, assigned: 280, bodega: 1 },
  { id: "i3", name: "Vasos de marca", icon: "🥤", total: 800, assigned: 600, bodega: 1 },
  { id: "i4", name: "Banners", icon: "🚩", total: 18, assigned: 18, bodega: 1 },
  { id: "i5", name: "Inflables", icon: "🎈", total: 6, assigned: 4, bodega: 2 },
  { id: "i6", name: "Máquinas confetti", icon: "🎊", total: 3, assigned: 2, bodega: 2 },
  { id: "i7", name: "Tanques CO2", icon: "💨", total: 4, assigned: 3, bodega: 2 },
  { id: "i8", name: "Postes + sogas", icon: "🔗", total: 24, assigned: 20, bodega: 2 },
  { id: "i9", name: "Planta eléctrica", icon: "⚡", total: 2, assigned: 1, bodega: 2 },
  { id: "i10", name: "Toldas", icon: "⛺", total: 4, assigned: 3, bodega: 2 },
];

export const mockLiquor: LiquorCatalogRow[] = [
  { id: "l1", name: "Ron Abuelo 12 años", category: "ron", unit: "botella", stock: 24, min_stock: 10, icon: "🥃" },
  { id: "l2", name: "Smirnoff Vodka", category: "vodka", unit: "botella", stock: 18, min_stock: 8, icon: "🥃" },
  { id: "l3", name: "José Cuervo", category: "tequila", unit: "botella", stock: 12, min_stock: 6, icon: "🥃" },
  { id: "l4", name: "Jack Daniel's", category: "whisky", unit: "botella", stock: 8, min_stock: 4, icon: "🥃" },
  { id: "l5", name: "Corona", category: "cerveza", unit: "caja", stock: 30, min_stock: 15, icon: "🍺" },
  { id: "l6", name: "Balboa", category: "cerveza", unit: "caja", stock: 25, min_stock: 12, icon: "🍺" },
  { id: "l7", name: "Atlas", category: "cerveza", unit: "caja", stock: 20, min_stock: 10, icon: "🍺" },
  { id: "l8", name: "Jugo de naranja", category: "mixer", unit: "galon", stock: 10, min_stock: 5, icon: "🍹" },
  { id: "l9", name: "Red Bull", category: "mixer", unit: "caja", stock: 15, min_stock: 8, icon: "🍹" },
  { id: "l10", name: "Coca-Cola", category: "mixer", unit: "caja", stock: 20, min_stock: 10, icon: "🍹" },
];

// Timestamps fijos (offset Panamá -05:00) para evitar hydration mismatch:
// `new Date(Date.now() - …)` se evalúa al importar el módulo y rinde minutos
// distintos en server vs client. Anclados a MOCK_NOW_ISO (14:30 hora Panamá).
export const mockAlerts: AlertRow[] = [
  { id: "a1", event_id: "e1", time: `${MOCK_EVENT_DATE}T14:28:00-05:00`, message: "Check-in superó 250 asistentes en Blue Coconut", type: "ok", venue_id: "v2" },
  { id: "a2", event_id: "e1", time: `${MOCK_EVENT_DATE}T14:18:00-05:00`, message: "Stock de Corona bajo en Aqua Lounge — enviar refuerzo", type: "warn", venue_id: "v3" },
  { id: "a3", event_id: "e1", time: `${MOCK_EVENT_DATE}T14:02:00-05:00`, message: "Planta eléctrica instalada en Blue Coconut", type: "ok", venue_id: "v2" },
  { id: "a4", event_id: "e1", time: `${MOCK_EVENT_DATE}T13:45:00-05:00`, message: "Montaje Casa Papaya completado", type: "ok", venue_id: "v1" },
  { id: "a5", event_id: "e1", time: `${MOCK_EVENT_DATE}T13:30:00-05:00`, message: "Retraso de bote desde Bocas Town (+15 min)", type: "warn", venue_id: null },
];
