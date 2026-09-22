-- Schema Database Supabase Postgres for Monitoring Proyek Konstruksi (Appadentis)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Roles & Access Control
create table if not exists roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role_id uuid references roles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists menus (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  header text,
  parent_id uuid references menus(id) on delete cascade,
  sort_order integer default 0,
  path text not null,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists role_menu_access (
  id uuid primary key default uuid_generate_v4(),
  role_id uuid not null references roles(id) on delete cascade,
  menu_id uuid not null references menus(id) on delete cascade,
  can_view boolean default true,
  can_add boolean default false,
  can_edit boolean default false,
  can_delete boolean default false,
  unique(role_id, menu_id)
);

-- 2. Master Proyek & Preliminary
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  nama_pekerjaan text not null,
  no_kontrak text not null,
  nilai_kontrak numeric(15,2) not null default 0,
  lokasi text,
  tanggal_mulai date,
  tanggal_selesai date,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists preliminaries (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  no_kontrak text not null,
  yang_mengajukan text not null,
  tanggal date not null,
  tujuan text,
  total numeric(15,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Master Data Material & Labor
create table if not exists material_references (
  id uuid primary key default uuid_generate_v4(),
  nama_barang text not null,
  spesifikasi text,
  harga numeric(15,2) not null default 0,
  unit text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists labor_rates (
  id uuid primary key default uuid_generate_v4(),
  nama_pekerjaan text not null,
  spesifikasi text,
  harga numeric(15,2) not null default 0,
  unit text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. AHS & RAP
create table if not exists unit_price_analyses (
  id uuid primary key default uuid_generate_v4(),
  kode_ahs text not null unique,
  nama_ahs text not null,
  satuan text not null,
  profit_percent numeric(5,2) default 10.00,
  harga numeric(15,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists unit_price_analysis_items (
  id uuid primary key default uuid_generate_v4(),
  ahs_id uuid not null references unit_price_analyses(id) on delete cascade,
  tipe text check (tipe in ('barang', 'upah')),
  referensi_id uuid not null,
  koefisien numeric(10,4) not null default 1.0,
  harga numeric(15,2) not null default 0,
  subtotal numeric(15,2) not null default 0
);

create table if not exists rap (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  no_rap text not null,
  tanggal date not null,
  status text default 'Draft' check (status in ('Draft', 'Approved', 'Locked')),
  total_anggaran numeric(15,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists rap_items (
  id uuid primary key default uuid_generate_v4(),
  rap_id uuid not null references rap(id) on delete cascade,
  ahs_id uuid references unit_price_analyses(id),
  uraian_pekerjaan text not null,
  volume numeric(12,2) not null default 0,
  satuan text not null,
  harga_satuan numeric(15,2) not null default 0,
  subtotal numeric(15,2) not null default 0
);

-- 5. Kontrak Subkon & Addendum
create table if not exists subcontractor_contracts (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  nama_subkon text not null,
  no_kontrak text not null,
  nilai_kontrak numeric(15,2) not null default 0,
  dp numeric(15,2) default 0,
  retensi_percent numeric(5,2) default 5.00,
  tanggal date not null,
  bukti_dp_path text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists contract_addendums (
  id uuid primary key default uuid_generate_v4(),
  contract_id uuid not null references subcontractor_contracts(id) on delete cascade,
  no_kontrak_addendum text not null,
  nilai_kontrak numeric(15,2) not null default 0,
  tanggal_mulai date,
  tanggal_selesai date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Purchase Orders & Receipts
create table if not exists purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  rap_id uuid references rap(id),
  no_po text not null,
  tanggal date not null,
  tujuan_po text not null,
  tanggal_pengiriman date,
  jenis_payment text check (jenis_payment in ('Cash', 'Kredit', 'DP')),
  tgl_jatuh_tempo date,
  status_po text default 'Pending' check (status_po in ('Pending', 'Partial', 'Received', 'Cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists purchase_order_items (
  id uuid primary key default uuid_generate_v4(),
  po_id uuid not null references purchase_orders(id) on delete cascade,
  barang_id uuid references material_references(id),
  qty numeric(12,2) not null default 0,
  harga numeric(15,2) not null default 0,
  subtotal numeric(15,2) not null default 0
);

create table if not exists po_receipts (
  id uuid primary key default uuid_generate_v4(),
  po_id uuid not null references purchase_orders(id) on delete cascade,
  tanggal_terima date not null,
  status_pengiriman text default 'Diterima Sebagian' check (status_pengiriman in ('Diterima Sebagian', 'Selesai Lengkap')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists po_receipt_items (
  id uuid primary key default uuid_generate_v4(),
  receipt_id uuid not null references po_receipts(id) on delete cascade,
  po_item_id uuid not null references purchase_order_items(id) on delete cascade,
  qty_diterima numeric(12,2) not null default 0
);

-- 7. Progress Subkon & Pembayaran Subkon
create table if not exists subcontractor_progress (
  id uuid primary key default uuid_generate_v4(),
  contract_id uuid not null references subcontractor_contracts(id) on delete cascade,
  no_penagihan text not null,
  tanggal_penagihan date not null,
  status text default 'Draft' check (status in ('Draft', 'Locked', 'Approved')),
  total_progress numeric(15,2) default 0,
  locked_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists subcontractor_progress_items (
  id uuid primary key default uuid_generate_v4(),
  progress_id uuid not null references subcontractor_progress(id) on delete cascade,
  uraian_pekerjaan text not null,
  volume numeric(12,2) default 0,
  persentase_progress numeric(5,2) default 0,
  subtotal numeric(15,2) default 0
);

create table if not exists subcontractor_payments (
  id uuid primary key default uuid_generate_v4(),
  contract_id uuid not null references subcontractor_contracts(id) on delete cascade,
  progress_id uuid references subcontractor_progress(id),
  no_termin text not null,
  tanggal_pembayaran date not null,
  nilai_progress numeric(15,2) not null default 0,
  potongan_dp numeric(15,2) default 0,
  nilai_retensi numeric(15,2) default 0,
  nilai_dibayar numeric(15,2) not null default 0,
  sisa_tagihan numeric(15,2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists retention_payments (
  id uuid primary key default uuid_generate_v4(),
  contract_id uuid not null references subcontractor_contracts(id) on delete cascade,
  keterangan text,
  tanggal_pembayaran date not null,
  nilai_retensi numeric(15,2) not null default 0,
  nilai_dibayar numeric(15,2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Kas Pemasukan
create table if not exists cash_inflows (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  no_kontrak text not null,
  tanggal_kas_masuk date not null,
  nilai numeric(15,2) not null default 0,
  keterangan text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Activity Logs (Audit Trail)
create table if not exists activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  action text not null,
  entity_name text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Helper function for RLS
create or replace function get_my_role()
returns text as $$
declare
  user_role text;
begin
  select r.name into user_role
  from profiles p
  join roles r on p.role_id = r.id
  where p.id = auth.uid();
  
  return coalesce(user_role, 'User');
end;
$$ language plpgsql security definer;

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table roles enable row level security;
alter table menus enable row level security;
alter table role_menu_access enable row level security;
alter table projects enable row level security;
alter table preliminaries enable row level security;
alter table material_references enable row level security;
alter table labor_rates enable row level security;
alter table unit_price_analyses enable row level security;
alter table unit_price_analysis_items enable row level security;
alter table rap enable row level security;
alter table rap_items enable row level security;
alter table subcontractor_contracts enable row level security;
alter table contract_addendums enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table po_receipts enable row level security;
alter table po_receipt_items enable row level security;
alter table subcontractor_progress enable row level security;
alter table subcontractor_progress_items enable row level security;
alter table subcontractor_payments enable row level security;
alter table retention_payments enable row level security;
alter table cash_inflows enable row level security;
alter table activity_logs enable row level security;

-- Basic standard RLS policies (allow authenticated access as fallback)
create policy "Authenticated read profiles" on profiles for select using (auth.role() = 'authenticated');
create policy "Authenticated read roles" on roles for select using (auth.role() = 'authenticated');
create policy "Authenticated read menus" on menus for select using (auth.role() = 'authenticated');
create policy "Authenticated read role_menu_access" on role_menu_access for select using (auth.role() = 'authenticated');
