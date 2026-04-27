// Hand-written types until `supabase gen types typescript` can be run against a live project.
// Update via: npx supabase gen types typescript --project-id <ref> > src/types/database.ts

export type VenueRow = {
  id: string;
  name: string;
  emoji: string;
  order: number;
  start_time: string;
  end_time: string;
  location: string | null;
};

export type EventRow = {
  id: string;
  date: string;
  status: "draft" | "active" | "completed";
  tickets_sold: number;
  checked_in: number;
  vip_total: number;
  vip_cash: number;
  vip_card: number;
  vip_bottles: number;
  merch_units: number;
  merch_total: number;
  active_venue_id: string | null;
};

export type ChecklistTemplateRow = {
  id: string;
  venue_id: string;
  task: string;
  order: number;
};

export type ChecklistItemRow = {
  id: string;
  event_id: string;
  template_id: string;
  venue_id: string;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
};

export type CrewMemberRow = {
  id: string;
  name: string;
  role: string;
  status: "active" | "pending" | "off";
  venue: string;
  phone: string | null;
};

export type InventoryItemRow = {
  id: string;
  name: string;
  icon: string;
  total: number;
  assigned: number;
  bodega: 1 | 2;
};

export type LiquorCatalogRow = {
  id: string;
  name: string;
  category: "ron" | "vodka" | "tequila" | "whisky" | "cerveza" | "mixer" | "otro";
  unit: "botella" | "lata" | "galon" | "caja";
  stock: number;
  min_stock: number;
  icon: string;
};

export type LiquorMovementRow = {
  id: string;
  event_id: string;
  liquor_id: string;
  stock_start: number;
  stock_end: number | null;
  consumed: number | null;
  notes: string | null;
};

export type AlertRow = {
  id: string;
  event_id: string;
  time: string;
  message: string;
  type: "ok" | "warn" | "info";
  venue_id: string | null;
};

// supabase-js v2.103+ exige `Relationships: []` por tabla y `Views`/`Functions`
// con shapes compatibles con `GenericView`/`GenericFunction`. Sin esto, los
// `insert()` y `update()` se inferían como `never` y rompían el typecheck.
type T<R> = { Row: R; Insert: Partial<R>; Update: Partial<R>; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      venues: T<VenueRow>;
      events: T<EventRow>;
      checklist_templates: T<ChecklistTemplateRow>;
      checklist_items: T<ChecklistItemRow>;
      crew_members: T<CrewMemberRow>;
      inventory_items: T<InventoryItemRow>;
      liquor_catalog: T<LiquorCatalogRow>;
      liquor_movements: T<LiquorMovementRow>;
      alerts: T<AlertRow>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
  };
};
