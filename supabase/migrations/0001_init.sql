-- Filthy Friday OPS — initial schema
-- Run against a Supabase project (dev first). Generates tables + permissive RLS for MVP.

create extension if not exists "uuid-ossp";

create table if not exists venues (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  emoji text not null,
  "order" int not null,
  start_time time not null,
  end_time time not null,
  location text
);

create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  status text not null default 'draft' check (status in ('draft','active','completed')),
  tickets_sold int not null default 0,
  checked_in int not null default 0,
  vip_total numeric(12,2) not null default 0,
  vip_cash numeric(12,2) not null default 0,
  vip_card numeric(12,2) not null default 0,
  vip_bottles int not null default 0,
  merch_units int not null default 0,
  merch_total numeric(12,2) not null default 0,
  active_venue_id uuid references venues(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists checklist_templates (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid not null references venues(id) on delete cascade,
  task text not null,
  "order" int not null
);

create table if not exists checklist_items (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  template_id uuid not null references checklist_templates(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  completed_by text
);

create table if not exists crew_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  status text not null default 'active' check (status in ('active','pending','off')),
  venue text not null default 'Flotante',
  phone text
);

create table if not exists inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  icon text not null default '📦',
  total int not null default 0,
  assigned int not null default 0,
  bodega int not null check (bodega in (1,2))
);

create table if not exists liquor_catalog (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null check (category in ('ron','vodka','tequila','whisky','cerveza','mixer','otro')),
  unit text not null check (unit in ('botella','lata','galon','caja')),
  stock int not null default 0,
  min_stock int not null default 0,
  icon text not null default '🥃'
);

create table if not exists liquor_movements (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  liquor_id uuid not null references liquor_catalog(id) on delete cascade,
  stock_start int not null,
  stock_end int,
  consumed int generated always as (stock_start - coalesce(stock_end, stock_start)) stored,
  notes text
);

create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  time timestamptz not null default now(),
  message text not null,
  type text not null default 'info' check (type in ('ok','warn','info')),
  venue_id uuid references venues(id) on delete set null
);

-- Indexes
create index if not exists idx_checklist_items_event on checklist_items(event_id);
create index if not exists idx_checklist_items_venue on checklist_items(venue_id);
create index if not exists idx_alerts_event_time on alerts(event_id, time desc);
create index if not exists idx_liquor_movements_event on liquor_movements(event_id);

-- Permissive RLS for MVP (C-001: no auth yet)
alter table venues enable row level security;
alter table events enable row level security;
alter table checklist_templates enable row level security;
alter table checklist_items enable row level security;
alter table crew_members enable row level security;
alter table inventory_items enable row level security;
alter table liquor_catalog enable row level security;
alter table liquor_movements enable row level security;
alter table alerts enable row level security;

do $$
declare t text;
begin
  for t in select unnest(array[
    'venues','events','checklist_templates','checklist_items',
    'crew_members','inventory_items','liquor_catalog','liquor_movements','alerts'
  ])
  loop
    execute format('drop policy if exists "anon_all_%1$s" on %1$I', t);
    execute format('create policy "anon_all_%1$s" on %1$I for all using (true) with check (true)', t);
  end loop;
end $$;

-- Realtime
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table checklist_items;
alter publication supabase_realtime add table alerts;
