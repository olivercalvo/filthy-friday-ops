-- Filthy Friday OPS — seed data for dev
-- Idempotent: safe to re-run.

-- Venues
insert into venues (id, name, emoji, "order", start_time, end_time, location)
values
  ('11111111-1111-1111-1111-111111111111', 'Casa Papaya',  '🏝️', 1, '10:00', '13:00', 'Isla Carenero'),
  ('22222222-2222-2222-2222-222222222222', 'Blue Coconut', '🥥', 2, '13:30', '18:00', 'Bocas Town'),
  ('33333333-3333-3333-3333-333333333333', 'Aqua Lounge',  '🌊', 3, '19:00', '02:00', 'Isla Solarte')
on conflict (id) do nothing;

-- Checklist templates
delete from checklist_templates where venue_id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

insert into checklist_templates (venue_id, task, "order") values
  ('11111111-1111-1111-1111-111111111111', 'Retirar/reubicar mobiliario existente', 1),
  ('11111111-1111-1111-1111-111111111111', 'Instalar señalización y banners', 2),
  ('11111111-1111-1111-1111-111111111111', 'Delimitar zona de ingreso (postes + sogas)', 3),
  ('11111111-1111-1111-1111-111111111111', 'Armar zona VIP con delimitación', 4),
  ('11111111-1111-1111-1111-111111111111', 'Instalar cabina DJ + prueba de sonido', 5),
  ('11111111-1111-1111-1111-111111111111', 'Coordinar comida/bebidas con venue', 6),
  ('11111111-1111-1111-1111-111111111111', 'Montar punto check-in (camisetas, bolsos, tokens)', 7),
  ('11111111-1111-1111-1111-111111111111', 'Posicionar coolers con hielo', 8),
  ('11111111-1111-1111-1111-111111111111', 'Enviar video de montaje para aprobación', 9),

  ('22222222-2222-2222-2222-222222222222', 'Instalar planta eléctrica', 1),
  ('22222222-2222-2222-2222-222222222222', 'Verificar refrigeración operativa', 2),
  ('22222222-2222-2222-2222-222222222222', 'Montar iluminación', 3),
  ('22222222-2222-2222-2222-222222222222', 'Armar zona VIP', 4),
  ('22222222-2222-2222-2222-222222222222', 'Instalar inflables y banners', 5),
  ('22222222-2222-2222-2222-222222222222', 'Ubicar coolers staff y VIP', 6),
  ('22222222-2222-2222-2222-222222222222', 'Enviar video de montaje para aprobación', 7),

  ('33333333-3333-3333-3333-333333333333', 'Montar toldas', 1),
  ('33333333-3333-3333-3333-333333333333', 'Armar zona VIP', 2),
  ('33333333-3333-3333-3333-333333333333', 'Delimitar zona de botes', 3),
  ('33333333-3333-3333-3333-333333333333', 'Instalar banners y banderines', 4),
  ('33333333-3333-3333-3333-333333333333', 'Posicionar máquinas confetti + sparks', 5),
  ('33333333-3333-3333-3333-333333333333', 'Ubicar CO2 según instrucciones', 6),
  ('33333333-3333-3333-3333-333333333333', 'Posicionar personal de seguridad', 7),
  ('33333333-3333-3333-3333-333333333333', 'Enviar video de montaje para aprobación', 8);

-- Crew
delete from crew_members;
insert into crew_members (name, role, status, venue) values
  ('Diana',     'Gerente de Operaciones', 'active',  'Flotante'),
  ('Rey',       'Jefe de Crew',           'active',  'Casa Papaya'),
  ('Carlos M.', 'Montaje',                'active',  'Casa Papaya'),
  ('Luis R.',   'Montaje',                'active',  'Blue Coconut'),
  ('Martina',   'Check-in Lead',          'active',  'Casa Papaya'),
  ('Sofía V.',  'VIP Host',               'pending', 'Aqua Lounge'),
  ('Jake T.',   'Seguridad',              'active',  'Blue Coconut'),
  ('Ana P.',    'Barra VIP',              'off',     'Aqua Lounge'),
  ('Marco D.',  'DJ',                     'active',  'Casa Papaya'),
  ('Tomás',     'Bote Crew',              'active',  'Flotante');

-- Inventory
delete from inventory_items;
insert into inventory_items (name, icon, total, assigned, bodega) values
  ('Coolers grandes',     '❄️',  12,  10, 2),
  ('Camisetas promo',     '👕', 350, 280, 1),
  ('Vasos de marca',      '🥤', 800, 600, 1),
  ('Banners',             '🚩',  18,  18, 1),
  ('Inflables',           '🎈',   6,   4, 2),
  ('Máquinas confetti',   '🎊',   3,   2, 2),
  ('Tanques CO2',         '💨',   4,   3, 2),
  ('Postes + sogas',      '🔗',  24,  20, 2),
  ('Planta eléctrica',    '⚡',   2,   1, 2),
  ('Toldas',              '⛺',   4,   3, 2);

-- Liquor
delete from liquor_catalog;
insert into liquor_catalog (name, category, unit, stock, min_stock, icon) values
  ('Ron Abuelo 12 años', 'ron',     'botella', 24, 10, '🥃'),
  ('Smirnoff Vodka',     'vodka',   'botella', 18,  8, '🥃'),
  ('José Cuervo',        'tequila', 'botella', 12,  6, '🥃'),
  ('Jack Daniel''s',     'whisky',  'botella',  8,  4, '🥃'),
  ('Corona',             'cerveza', 'caja',    30, 15, '🍺'),
  ('Balboa',             'cerveza', 'caja',    25, 12, '🍺'),
  ('Atlas',              'cerveza', 'caja',    20, 10, '🍺'),
  ('Jugo de naranja',    'mixer',   'galon',   10,  5, '🍹'),
  ('Red Bull',           'mixer',   'caja',    15,  8, '🍹'),
  ('Coca-Cola',          'mixer',   'caja',    20, 10, '🍹');

-- Events (3 semanas tipo: completed → active → draft)
-- IDs estables para que el seed sea idempotente y los tests puedan referenciarlos.
delete from alerts;
delete from checklist_items;
delete from events;

insert into events (id, date, status, tickets_sold, checked_in, vip_total, vip_cash, vip_card, vip_bottles, merch_units, merch_total, active_venue_id) values
  -- Evento pasado (cerrado con números finales)
  ('e1180426-eeee-eeee-eeee-eeeeeeeeeeee', '2026-04-18', 'completed', 478, 451, 6120, 2400, 3720, 24, 87, 1740, '33333333-3333-3333-3333-333333333333'),
  -- Evento activo (default selection)
  ('e2250426-eeee-eeee-eeee-eeeeeeeeeeee', '2026-04-25', 'active',    412, 287, 4850, 2100, 2750, 18, 64, 1280, '22222222-2222-2222-2222-222222222222'),
  -- Evento futuro (draft, números en cero)
  ('e3020526-eeee-eeee-eeee-eeeeeeeeeeee', '2026-05-02', 'draft',       0,   0,    0,    0,    0,  0,  0,    0, '11111111-1111-1111-1111-111111111111');

-- Checklist items por evento
-- Apr 18 (completed) — todo en true
insert into checklist_items (event_id, template_id, venue_id, completed, completed_at, completed_by)
select 'e1180426-eeee-eeee-eeee-eeeeeeeeeeee', t.id, t.venue_id, true,
       timestamp '2026-04-18 09:30:00' + (random() * interval '6 hours'),
       (array['Diana','Rey','Carlos M.','Luis R.','Martina'])[1 + floor(random()*5)::int]
from checklist_templates t;

-- Apr 25 (active) — mix realista
insert into checklist_items (event_id, template_id, venue_id, completed, completed_at, completed_by)
select 'e2250426-eeee-eeee-eeee-eeeeeeeeeeee', t.id, t.venue_id,
       case when random() < 0.55 then true else false end,
       case when random() < 0.55 then timestamp '2026-04-25 10:00:00' + (random() * interval '4 hours') else null end,
       case when random() < 0.55 then (array['Diana','Rey','Carlos M.','Luis R.','Martina'])[1 + floor(random()*5)::int] else null end
from checklist_templates t;

-- May 2 (draft) — todo pendiente
insert into checklist_items (event_id, template_id, venue_id, completed)
select 'e3020526-eeee-eeee-eeee-eeeeeeeeeeee', t.id, t.venue_id, false
from checklist_templates t;

-- Alertas del evento activo (lo único que se ve en En Vivo por default)
insert into alerts (event_id, message, type, venue_id) values
  ('e2250426-eeee-eeee-eeee-eeeeeeeeeeee', 'Check-in superó 250 asistentes en Blue Coconut',           'ok',   '22222222-2222-2222-2222-222222222222'),
  ('e2250426-eeee-eeee-eeee-eeeeeeeeeeee', 'Stock de Corona bajo en Aqua Lounge — enviar refuerzo',    'warn', '33333333-3333-3333-3333-333333333333'),
  ('e2250426-eeee-eeee-eeee-eeeeeeeeeeee', 'Montaje Casa Papaya completado',                            'ok',   '11111111-1111-1111-1111-111111111111');

-- Alertas del evento cerrado (para que la vista "Cuadre" del completed
-- tenga algo que mostrar si el usuario lo selecciona)
insert into alerts (event_id, message, type, venue_id) values
  ('e1180426-eeee-eeee-eeee-eeeeeeeeeeee', 'Evento cerrado — todos los venues finalizaron en horario', 'ok',   null),
  ('e1180426-eeee-eeee-eeee-eeeeeeeeeeee', 'Cuadre VIP final: $6,120 (24 botellas)',                    'info', null);
