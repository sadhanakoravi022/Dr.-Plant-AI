create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('shop_owner','admin')) default 'shop_owner',
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.application_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null unique,
  village text,
  district text,
  state text,
  pincode text,
  preferred_language text not null default 'en',
  created_at timestamptz not null default now()
);

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  shop_name text not null,
  owner_name text not null,
  phone text not null,
  whatsapp text,
  address text not null,
  village text,
  district text,
  state text,
  pincode text,
  latitude double precision not null,
  longitude double precision not null,
  location geography(Point,4326) generated always as (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) stored,
  is_verified_partner boolean not null default false,
  subscription_active boolean not null default false,
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shops_location_idx on public.shops using gist (location);
create index shops_owner_id_idx on public.shops (owner_id);

create table public.shop_products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  brand_name text,
  category text not null check (category in ('chemical','organic','biofertilizer','equipment')),
  chemical_salt text,
  dosage_per_15l text,
  target_diseases text[] not null default '{}',
  pack_size text,
  price numeric(10,2) not null,
  mrp numeric(10,2),
  stock_quantity integer not null default 0,
  phi_days integer,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shop_products_shop_id_idx on public.shop_products (shop_id);
create index shop_products_target_diseases_idx on public.shop_products using gin (target_diseases);

create table public.product_bulk_uploads (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  file_path text not null,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
  row_count integer,
  error_log jsonb,
  created_at timestamptz not null default now()
);

create index product_bulk_uploads_shop_id_idx on public.product_bulk_uploads (shop_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  product_id uuid not null references public.shop_products(id),
  shop_id uuid not null references public.shops(id),
  farmer_name text not null,
  village_address text not null,
  phone text not null,
  quantity integer not null default 1,
  total_amount numeric(10,2) not null,
  payment_method text not null check (payment_method in ('cod','upi')),
  status text not null default 'confirmed' check (status in ('confirmed','dispatched','delivered','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_shop_id_idx on public.orders (shop_id);
create index orders_phone_idx on public.orders (phone);

create table public.premium_subscriptions (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  phone text not null,
  plan text not null check (plan in ('single','lifetime')),
  amount_paid numeric(10,2) not null,
  utr_reference text not null,
  status text not null default 'pending_verification' check (status in ('pending_verification','verified','rejected')),
  verified_at timestamptz,
  verified_by uuid references public.profiles(id),
  activated_at timestamptz not null default now(),
  expires_at timestamptz
);

create index premium_subscriptions_device_id_idx on public.premium_subscriptions (device_id);
create index premium_subscriptions_utr_idx on public.premium_subscriptions (utr_reference);
create unique index premium_subscriptions_utr_unique_idx on public.premium_subscriptions (utr_reference) where status <> 'rejected';

create table public.diagnosis_history (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  crop text,
  disease text,
  pathogen_type text,
  confidence numeric(5,2),
  severity text,
  latency_ms integer,
  captured_image_url text,
  treatment_id text,
  language_used text,
  created_at timestamptz not null default now()
);

create index diagnosis_history_device_id_idx on public.diagnosis_history (device_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger shops_set_updated_at
before update on public.shops
for each row execute function public.set_updated_at();

create trigger shop_products_set_updated_at
before update on public.shop_products
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.application_users enable row level security;
alter table public.shops enable row level security;
alter table public.shop_products enable row level security;
alter table public.product_bulk_uploads enable row level security;
alter table public.orders enable row level security;
alter table public.premium_subscriptions enable row level security;
alter table public.diagnosis_history enable row level security;

create policy profiles_select_own on public.profiles
for select using (auth.uid() = id);

create policy profiles_insert_own on public.profiles
for insert with check (auth.uid() = id);

create policy profiles_update_own on public.profiles
for update using (auth.uid() = id);

create policy application_users_select_own on public.application_users
for select using (auth.uid() = id);

create policy application_users_insert_own on public.application_users
for insert with check (auth.uid() = id);

create policy application_users_update_own on public.application_users
for update using (auth.uid() = id);

create policy shops_public_read_active on public.shops
for select using (subscription_active = true);

create policy shops_owner_read_own on public.shops
for select using (auth.uid() = owner_id);

create policy shops_owner_insert on public.shops
for insert with check (auth.uid() = owner_id);

create policy shops_owner_update on public.shops
for update using (auth.uid() = owner_id);

create policy shops_owner_delete on public.shops
for delete using (auth.uid() = owner_id);

create policy shop_products_public_read_active on public.shop_products
for select using (
  is_active = true
  and stock_quantity > 0
  and exists (
    select 1 from public.shops s
    where s.id = shop_products.shop_id
    and s.subscription_active = true
  )
);

create policy shop_products_owner_all on public.shop_products
for all using (
  exists (
    select 1 from public.shops s
    where s.id = shop_products.shop_id
    and s.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.shops s
    where s.id = shop_products.shop_id
    and s.owner_id = auth.uid()
  )
);

create policy product_bulk_uploads_owner_all on public.product_bulk_uploads
for all using (
  exists (
    select 1 from public.shops s
    where s.id = product_bulk_uploads.shop_id
    and s.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.shops s
    where s.id = product_bulk_uploads.shop_id
    and s.owner_id = auth.uid()
  )
);

create policy orders_anon_insert on public.orders
for insert with check (true);

create policy orders_owner_select on public.orders
for select using (
  exists (
    select 1 from public.shops s
    where s.id = orders.shop_id
    and s.owner_id = auth.uid()
  )
);

create policy orders_owner_update on public.orders
for update using (
  exists (
    select 1 from public.shops s
    where s.id = orders.shop_id
    and s.owner_id = auth.uid()
  )
);

drop policy if exists premium_subscriptions_public_read on public.premium_subscriptions;
drop policy if exists premium_subscriptions_admin_read on public.premium_subscriptions;

create policy premium_subscriptions_admin_read on public.premium_subscriptions
for select using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

create policy premium_subscriptions_anon_insert on public.premium_subscriptions
for insert with check (status = 'pending_verification');

create policy premium_subscriptions_admin_update on public.premium_subscriptions
for update using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

create policy diagnosis_history_anon_insert on public.diagnosis_history
for insert with check (true);

create policy diagnosis_history_public_read on public.diagnosis_history
for select using (true);

create or replace function public.get_nearby_products(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision default 15,
  p_disease text default null,
  p_crop text default null
)
returns table (
  shop_id uuid,
  shop_name text,
  owner_name text,
  phone text,
  whatsapp text,
  address text,
  village text,
  district text,
  state text,
  pincode text,
  latitude double precision,
  longitude double precision,
  is_verified_partner boolean,
  distance_km double precision,
  product_id uuid,
  product_name text,
  brand_name text,
  category text,
  chemical_salt text,
  dosage_per_15l text,
  target_diseases text[],
  pack_size text,
  price numeric,
  mrp numeric,
  stock_quantity integer,
  phi_days integer,
  image_url text
)
language sql
stable
as $$
  select
    s.id,
    s.shop_name,
    s.owner_name,
    s.phone,
    s.whatsapp,
    s.address,
    s.village,
    s.district,
    s.state,
    s.pincode,
    s.latitude,
    s.longitude,
    s.is_verified_partner,
    ST_Distance(s.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000.0,
    p.id,
    p.name,
    p.brand_name,
    p.category,
    p.chemical_salt,
    p.dosage_per_15l,
    p.target_diseases,
    p.pack_size,
    p.price,
    p.mrp,
    p.stock_quantity,
    p.phi_days,
    p.image_url
  from public.shops s
  join public.shop_products p on p.shop_id = s.id
  where s.subscription_active = true
    and p.is_active = true
    and p.stock_quantity > 0
    and ST_DWithin(
      s.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
    and (
      p_disease is null
      or exists (
        select 1 from unnest(p.target_diseases) d
        where d ilike '%' || p_disease || '%'
      )
    )
    and (
      p_crop is null
      or p.name ilike '%' || p_crop || '%'
      or p.brand_name ilike '%' || p_crop || '%'
    )
  order by 14 asc;
$$;

grant execute on function public.get_nearby_products to anon, authenticated;
