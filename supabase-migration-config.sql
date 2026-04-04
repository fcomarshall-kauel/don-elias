-- ============================================================
-- Don Elias / PorterOS — Migration: Config Tables
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Residents table
create table residents (
  id uuid primary key default gen_random_uuid(),
  apt text not null,
  name text not null,
  tower text,
  phone text,
  contact_preference text default 'whatsapp'
    check (contact_preference in ('whatsapp', 'citofono', 'llamada', 'ninguno')),
  is_nana boolean default false,
  is_frequent_visitor boolean default false,
  nana_name text,
  nana_phone text,
  notes text,
  created_at timestamptz default now()
);
create index idx_residents_apt on residents(apt);

-- 2. Concierges table
create table concierges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 3. Providers table
create table providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  package_type text not null check (package_type in ('food','normal','other','supermercado')),
  is_active boolean default true,
  sort_order int default 0
);

-- 4. Extend app_settings
alter table app_settings add column if not exists address text;
alter table app_settings add column if not exists towers jsonb default '["Torre Sur","Torre Norte"]';
alter table app_settings add column if not exists floors_config jsonb;
alter table app_settings add column if not exists conserjeria_hours text default '08:00-20:00';
alter table app_settings add column if not exists reminder_hours int default 4;
alter table app_settings add column if not exists emergency_contact text;
alter table app_settings add column if not exists emergency_phone text;
alter table app_settings add column if not exists logo_url text;

-- 5. RLS
alter table residents enable row level security;
alter table concierges enable row level security;
alter table providers enable row level security;
create policy "allow_all" on residents for all using (true) with check (true);
create policy "allow_all" on concierges for all using (true) with check (true);
create policy "allow_all" on providers for all using (true) with check (true);

-- ============================================================
-- MIGRATE EXISTING DATA
-- ============================================================

-- Concierges
insert into concierges (name) values
  ('Claudio'), ('Raquel'), ('Silvia'), ('Elías');

-- Providers: normal packages
insert into providers (name, package_type, sort_order) values
  ('Mercado Libre', 'normal', 1), ('Falabella', 'normal', 2), ('Ripley', 'normal', 3),
  ('Paris', 'normal', 4), ('Amazon', 'normal', 5), ('AliExpress', 'normal', 6),
  ('Shein', 'normal', 7), ('Correos de Chile', 'normal', 8), ('Chilexpress', 'normal', 9),
  ('Starken', 'normal', 10), ('Blue Express', 'normal', 11), ('DHL', 'normal', 12), ('FedEx', 'normal', 13);

-- Providers: supermercado
insert into providers (name, package_type, sort_order) values
  ('Jumbo', 'supermercado', 1), ('Lider', 'supermercado', 2), ('Santa Isabel', 'supermercado', 3),
  ('Unimarc', 'supermercado', 4), ('Tottus', 'supermercado', 5), ('Cornershop', 'supermercado', 6);

-- Providers: food
insert into providers (name, package_type, sort_order) values
  ('Uber Eats', 'food', 1), ('Rappi', 'food', 2), ('PedidosYa', 'food', 3), ('Justo', 'food', 4);

-- Providers: other
insert into providers (name, package_type, sort_order) values
  ('Correos de Chile', 'other', 1), ('Chilexpress', 'other', 2), ('Notaría', 'other', 3);

-- Residents: Torre Sur (pisos 2-12)
insert into residents (apt, tower, name, phone) values
  ('201', 'Torre Sur', 'Maria E. Oirvan', '56992382509'), ('201', 'Torre Sur', 'Familia Oirvan', '56992382509'),
  ('202', 'Torre Sur', 'Yoy Pineda', '56985036056'), ('202', 'Torre Sur', 'Antonieta', '56985036056'), ('202', 'Torre Sur', 'Juan Pablo', '56985036056'),
  ('203', 'Torre Sur', 'Andrea Bignon', '56992382509'), ('203', 'Torre Sur', 'Raul de Ramon', '56992382509'), ('203', 'Torre Sur', 'Amanda Miquele', '56992382509'),
  ('301', 'Torre Sur', 'Camila Parada', '56992382509'), ('301', 'Torre Sur', 'Matias Bosshard', '56992382509'), ('301', 'Torre Sur', 'Maria Jesus', '56992382509'),
  ('302', 'Torre Sur', 'Sergio Barriga', '56985036056'), ('302', 'Torre Sur', 'Emilia Shneberger', '56985036056'),
  ('303', 'Torre Sur', 'Cristobal Arias', '56992382509'), ('303', 'Torre Sur', 'Gabriela Sanchez', '56992382509'), ('303', 'Torre Sur', 'Santiago', '56992382509'),
  ('401', 'Torre Sur', 'Alfredo Peña', '56992382509'), ('401', 'Torre Sur', 'Martita Villegas', '56992382509'),
  ('402', 'Torre Sur', 'Constanza Morales', '56985036056'),
  ('403', 'Torre Sur', 'Aracely Lacroix', '56992382509'),
  ('501', 'Torre Sur', 'Patricia Rojas', '56992382509'),
  ('502', 'Torre Sur', 'Francisca Forch', '56985036056'), ('502', 'Torre Sur', 'Rodrigo Valenzuela', '56985036056'),
  ('503', 'Torre Sur', 'Ines Fuentes Alba', '56992382509'), ('503', 'Torre Sur', 'Luciano', '56992382509'),
  ('601', 'Torre Sur', 'Adriana Davis', '56992382509'), ('601', 'Torre Sur', 'Fernanda Cañas', '56992382509'),
  ('602', 'Torre Sur', 'Jorge Pereira', '56985036056'),
  ('603', 'Torre Sur', 'Javiera Sarmiento', '56992382509'), ('603', 'Torre Sur', 'Ignacio Sarmientos', '56992382509'),
  ('701', 'Torre Sur', 'Hector Serrat', '56992382509'), ('701', 'Torre Sur', 'Maria Elena Arias', '56992382509'), ('701', 'Torre Sur', 'Rocio', '56992382509'),
  ('702', 'Torre Sur', 'Gypsy Pizarro', '56985036056'), ('702', 'Torre Sur', 'Danilo Diaz', '56985036056'), ('702', 'Torre Sur', 'Valentina', '56985036056'),
  ('703', 'Torre Sur', 'Paula Vargas', '56992382509'), ('703', 'Torre Sur', 'Simon Suarez', '56992382509'),
  ('801', 'Torre Sur', 'Raul Sanchez', '56992382509'), ('801', 'Torre Sur', 'Sara Vivero', '56992382509'),
  ('802', 'Torre Sur', 'Margarita Espejo', '56985036056'), ('802', 'Torre Sur', 'Romina Pietrantoni', '56985036056'),
  ('803', 'Torre Sur', 'Colombo', '56992382509'), ('803', 'Torre Sur', 'Domenica Consignani', '56992382509'),
  ('901', 'Torre Sur', 'Claudio Bravo', '56992382509'), ('901', 'Torre Sur', 'Carmen Gloria Tobar', '56992382509'),
  ('902', 'Torre Sur', 'Patricia Sotomayor', '56985036056'), ('902', 'Torre Sur', 'Jaime Salinas', '56985036056'),
  ('903', 'Torre Sur', 'Virgilio Perelta', '56992382509'), ('903', 'Torre Sur', 'Camila Riderell', '56992382509'),
  ('1001', 'Torre Sur', 'Rosario Perez', '56992382509'), ('1001', 'Torre Sur', 'Juan Eduardo Baeza', '56992382509'),
  ('1002', 'Torre Sur', 'Joaquin Saavedra', '56985036056'), ('1002', 'Torre Sur', 'Antonia Saavedra', '56985036056'),
  ('1003', 'Torre Sur', 'Christian Arreaga', '56992382509'), ('1003', 'Torre Sur', 'Teresa de la Torre', '56992382509'),
  ('1101', 'Torre Sur', 'Carolina Torres', '56992382509'), ('1101', 'Torre Sur', 'Trinidad', '56992382509'), ('1101', 'Torre Sur', 'Eddo Becerra', '56992382509'),
  ('1102', 'Torre Sur', 'Gonzalo Yeluz', '56985036056'),
  ('1103', 'Torre Sur', 'Jaime Pelayo', '56992382509'), ('1103', 'Torre Sur', 'Maria Isabel Rodriguez', '56992382509'),
  ('1201', 'Torre Sur', 'Paulina Pelayo', '56992382509'), ('1201', 'Torre Sur', 'Rodolfo Leiva', '56992382509'), ('1201', 'Torre Sur', 'Roque', '56992382509'),
  ('1202', 'Torre Sur', 'Rebecca Gerszenfer', '56985036056'), ('1202', 'Torre Sur', 'Rony', '56985036056'),
  ('1203', 'Torre Sur', 'Fernando Marlesa', '56992382509');

-- Residents: Torre Norte (pisos 13-23)
insert into residents (apt, tower, name, phone) values
  ('1301', 'Torre Norte', 'Loreto Vera', '56992382509'), ('1301', 'Torre Norte', 'Jorge Aldunate', '56992382509'),
  ('1302', 'Torre Norte', 'Mario Pinto Astudillo', '56985036056'), ('1302', 'Torre Norte', 'Claudia Mendez', '56985036056'),
  ('1303', 'Torre Norte', 'Montserrat Araya', '56992382509'), ('1303', 'Torre Norte', 'Martina Celedon', '56992382509'), ('1303', 'Torre Norte', 'Consuelo', '56992382509'),
  ('1401', 'Torre Norte', 'Andres Torres', '56992382509'),
  ('1402', 'Torre Norte', 'Viviana Jorquera', '56985036056'), ('1402', 'Torre Norte', 'Humberto Leiva', '56985036056'), ('1402', 'Torre Norte', 'Emma', '56985036056'),
  ('1403', 'Torre Norte', 'Maximiliano Jara', '56992382509'), ('1403', 'Torre Norte', 'Catalina Cruz', '56992382509'),
  ('1501', 'Torre Norte', 'Felipe Giacamann', '56992382509'), ('1501', 'Torre Norte', 'Antonieta Dable', '56992382509'),
  ('1502', 'Torre Norte', 'Felipe Giacamann', '56985036056'), ('1502', 'Torre Norte', 'Antonieta Dable', '56985036056'),
  ('1503', 'Torre Norte', 'Constanza Morales', '56992382509'), ('1503', 'Torre Norte', 'Pierpaolo Bolezzi', '56992382509'), ('1503', 'Torre Norte', 'Franco', '56992382509'),
  ('1601', 'Torre Norte', 'Ines Fuentes Alba', '56992382509'), ('1601', 'Torre Norte', 'Luciano', '56992382509'),
  ('1602', 'Torre Norte', 'Jhonna Vandorff', '56985036056'), ('1602', 'Torre Norte', 'Paula Escobar', '56985036056'), ('1602', 'Torre Norte', 'Trinidad', '56985036056'), ('1602', 'Torre Norte', 'Belen', '56985036056'),
  ('1603', 'Torre Norte', 'Pedro Torres', '56992382509'), ('1603', 'Torre Norte', 'Fernanda Robalino', '56992382509'), ('1603', 'Torre Norte', 'Isabel Ramirez', '56992382509'),
  ('1701', 'Torre Norte', 'Ricardo Cacho', '56992382509'), ('1701', 'Torre Norte', 'Ivette Salinas', '56992382509'), ('1701', 'Torre Norte', 'Tomas Morales', '56992382509'),
  ('1702', 'Torre Norte', 'Pedro Cueto', '56985036056'), ('1702', 'Torre Norte', 'Daniela Soto', '56985036056'), ('1702', 'Torre Norte', 'Fernanda Paris', '56985036056'), ('1702', 'Torre Norte', 'Mateo Cueto', '56985036056'),
  ('1703', 'Torre Norte', 'Pablo Galindo', '56992382509'),
  ('1801', 'Torre Norte', 'Angela Rivera', '56992382509'), ('1801', 'Torre Norte', 'Matias', '56992382509'),
  ('1802', 'Torre Norte', 'Elena Castillo', '56985036056'), ('1802', 'Torre Norte', 'Emilia', '56985036056'), ('1802', 'Torre Norte', 'Nicolas', '56985036056'),
  ('1803', 'Torre Norte', 'Jose Miguel Sarmiento', '56992382509'), ('1803', 'Torre Norte', 'Giselle Milla', '56992382509'),
  ('1901', 'Torre Norte', 'Marta Moreno', '56992382509'), ('1901', 'Torre Norte', 'Jessica Gutierrez', '56992382509'), ('1901', 'Torre Norte', 'Emilia', '56992382509'), ('1901', 'Torre Norte', 'Nicolas', '56992382509'),
  ('1902', 'Torre Norte', 'Gonzalo', '56985036056'), ('1902', 'Torre Norte', 'Jose Luis Ordoñes', '56985036056'),
  ('1903', 'Torre Norte', 'Carlos Llufi Reyes', '56992382509'),
  ('2001', 'Torre Norte', 'Nicolas Flores', '56992382509'),
  ('2002', 'Torre Norte', 'Cecilia Zulic', '56985036056'), ('2002', 'Torre Norte', 'Sofia', '56985036056'), ('2002', 'Torre Norte', 'Magdalena', '56985036056'),
  ('2003', 'Torre Norte', 'Adriana Segovia', '56992382509'), ('2003', 'Torre Norte', 'Catherine Campos', '56992382509'), ('2003', 'Torre Norte', 'Paula', '56992382509'), ('2003', 'Torre Norte', 'Jose Tomas', '56992382509'),
  ('2101', 'Torre Norte', 'Patricio Goic', '56992382509'),
  ('2102', 'Torre Norte', 'Marco Parker Foster', '56985036056'), ('2102', 'Torre Norte', 'Cristobal', '56985036056'), ('2102', 'Torre Norte', 'Andrea', '56985036056'),
  ('2103', 'Torre Norte', 'William Montes', '56992382509'),
  ('2201', 'Torre Norte', 'Mira Rosa', '56992382509'),
  ('2202', 'Torre Norte', 'Consuelo Cajas', '56985036056'),
  ('2301', 'Torre Norte', 'Matias Olivo', '56992382509'),
  ('2302', 'Torre Norte', 'Fernando Marlesa', '56985036056');
