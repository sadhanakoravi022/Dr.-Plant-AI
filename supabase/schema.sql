-- ==============================================================================
-- Dr. Plant AI - Complete Supabase Database Schema
-- Optimized for Supabase Auth, PostGIS, Storage Buckets, Realtime, & RLS
-- Supports: Mobile/PWA Farmer App, Partner Shop Web Portal, & Admin Dashboard
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- ==============================================================================
-- 2. CORE USERS & PROFILES (Supabase Auth Integrated)
-- ==============================================================================

-- Web Portal Users: Shop Owners, Platform Admins, Agronomists
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('shop_owner', 'admin', 'agronomist')) default 'shop_owner',
  full_name text,
  phone text,
  email text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mobile App Users: Farmers / End-Users
create table if not exists public.application_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null unique,
  village text,
  district text,
  state text,
  pincode text,
  preferred_language text not null default 'en',
  avatar_url text,
  is_premium boolean not null default false,
  premium_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 3. SHOPS & PARTNER NETWORK (Used by Partner Web Portal & App Discovery)
-- ==============================================================================

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  shop_name text not null,
  owner_name text not null,
  phone text not null,
  whatsapp text,
  email text,
  address text not null,
  village text,
  district text,
  state text,
  pincode text,
  latitude double precision not null,
  longitude double precision not null,
  location geography(Point, 4326) generated always as (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) stored,
  is_verified_partner boolean not null default false,
  subscription_active boolean not null default false,
  subscription_expires_at timestamptz,
  opening_hours text default '8:00 AM - 8:00 PM',
  banner_image_url text,
  rating numeric(3,2) not null default 4.8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shops_location_idx on public.shops using gist (location);
create index if not exists shops_owner_id_idx on public.shops (owner_id);
create index if not exists shops_district_idx on public.shops (district);
create index if not exists shops_active_sub_idx on public.shops (subscription_active);

-- ==============================================================================
-- 4. PRODUCT CATALOG & INVENTORY (Managed by Shop Portal / Queried by App)
-- ==============================================================================

create table if not exists public.shop_products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  brand_name text,
  category text not null check (category in ('chemical', 'organic', 'biofertilizer', 'equipment', 'seeds', 'fertilizer')),
  chemical_salt text,
  dosage_per_15l text,
  target_diseases text[] not null default '{}',
  target_crops text[] not null default '{}',
  pack_size text,
  price numeric(10,2) not null,
  mrp numeric(10,2),
  stock_quantity integer not null default 0,
  phi_days integer,
  image_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shop_products_shop_id_idx on public.shop_products (shop_id);
create index if not exists shop_products_category_idx on public.shop_products (category);
create index if not exists shop_products_is_active_idx on public.shop_products (is_active);
create index if not exists shop_products_target_diseases_idx on public.shop_products using gin (target_diseases);
create index if not exists shop_products_target_crops_idx on public.shop_products using gin (target_crops);

-- Bulk Catalog Uploads (CSV/Excel) in Partner Web Portal
create table if not exists public.product_bulk_uploads (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  file_path text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  row_count integer default 0,
  success_count integer default 0,
  error_log jsonb,
  created_at timestamptz not null default now()
);

create index if not exists product_bulk_uploads_shop_id_idx on public.product_bulk_uploads (shop_id);

-- ==============================================================================
-- 5. ORDERS & COMMERCE (Realtime enabled for Web & Mobile)
-- ==============================================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  product_id uuid not null references public.shop_products(id),
  shop_id uuid not null references public.shops(id),
  farmer_id uuid references public.application_users(id) on delete set null,
  farmer_name text not null,
  village_address text not null,
  phone text not null,
  quantity integer not null default 1,
  unit_price numeric(10,2),
  total_amount numeric(10,2) not null,
  payment_method text not null check (payment_method in ('cod', 'upi', 'online')),
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'dispatched', 'delivered', 'cancelled')),
  delivery_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_shop_id_idx on public.orders (shop_id);
create index if not exists orders_farmer_id_idx on public.orders (farmer_id);
create index if not exists orders_phone_idx on public.orders (phone);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ==============================================================================
-- 6. PREMIUM SUBSCRIPTIONS (UPI Payments & Admin Verification)
-- ==============================================================================

create table if not exists public.premium_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.application_users(id) on delete set null,
  device_id text not null,
  phone text not null,
  plan text not null check (plan in ('single', 'lifetime', 'monthly', 'yearly')),
  amount_paid numeric(10,2) not null,
  utr_reference text not null,
  status text not null default 'pending_verification' check (status in ('pending_verification', 'verified', 'rejected')),
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  rejection_reason text,
  activated_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists premium_subscriptions_device_id_idx on public.premium_subscriptions (device_id);
create index if not exists premium_subscriptions_user_id_idx on public.premium_subscriptions (user_id);
create index if not exists premium_subscriptions_utr_idx on public.premium_subscriptions (utr_reference);
create index if not exists premium_subscriptions_status_idx on public.premium_subscriptions (status);
create unique index if not exists premium_subscriptions_utr_unique_idx on public.premium_subscriptions (utr_reference) where status <> 'rejected';

-- ==============================================================================
-- 7. AI DIAGNOSIS HISTORY & TELEMETRY
-- ==============================================================================

create table if not exists public.diagnosis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.application_users(id) on delete set null,
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

create index if not exists diagnosis_history_device_id_idx on public.diagnosis_history (device_id);
create index if not exists diagnosis_history_user_id_idx on public.diagnosis_history (user_id);
create index if not exists diagnosis_history_crop_idx on public.diagnosis_history (crop);
create index if not exists diagnosis_history_created_at_idx on public.diagnosis_history (created_at desc);

-- ==============================================================================
-- 8. CROP PLANNER & FARMER PROGRESS SYNC
-- ==============================================================================

create table if not exists public.farmer_crop_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.application_users(id) on delete cascade,
  device_id text not null,
  crop_id text not null,
  crop_name text not null,
  start_date date not null default current_date,
  current_day integer not null default 1,
  completed_tasks jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists farmer_crop_plans_user_id_idx on public.farmer_crop_plans (user_id);
create index if not exists farmer_crop_plans_device_id_idx on public.farmer_crop_plans (device_id);

-- ==============================================================================
-- 9. ADVISORIES & COMMUNITY FEEDBACK (Managed by Web Portal / Viewed by App)
-- ==============================================================================

create table if not exists public.advisories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  content text not null,
  crop text,
  severity text check (severity in ('info', 'warning', 'critical')) default 'info',
  district text,
  state text,
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists advisories_district_idx on public.advisories (district);
create index if not exists advisories_is_active_idx on public.advisories (is_active);

create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.application_users(id) on delete set null,
  device_id text,
  phone text,
  rating integer check (rating between 1 and 5),
  category text check (category in ('accuracy', 'app_issue', 'shop_issue', 'treatment', 'other')) default 'app_issue',
  message text not null,
  status text check (status in ('new', 'in_progress', 'resolved')) default 'new',
  created_at timestamptz not null default now()
);

create index if not exists user_feedback_status_idx on public.user_feedback (status);

-- ==============================================================================
-- 10. DATABASE TRIGGERS & AUTOMATION
-- ==============================================================================

-- Helper: Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace trigger application_users_set_updated_at
before update on public.application_users
for each row execute function public.set_updated_at();

create or replace trigger shops_set_updated_at
before update on public.shops
for each row execute function public.set_updated_at();

create or replace trigger shop_products_set_updated_at
before update on public.shop_products
for each row execute function public.set_updated_at();

create or replace trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace trigger premium_subscriptions_set_updated_at
before update on public.premium_subscriptions
for each row execute function public.set_updated_at();

create or replace trigger farmer_crop_plans_set_updated_at
before update on public.farmer_crop_plans
for each row execute function public.set_updated_at();

create or replace trigger advisories_set_updated_at
before update on public.advisories
for each row execute function public.set_updated_at();

-- Auto create profile or application_user record upon auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'farmer');

  if user_role in ('shop_owner', 'admin', 'agronomist') then
    insert into public.profiles (id, role, full_name, phone, email)
    values (
      new.id,
      user_role,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      coalesce(new.raw_user_meta_data->>'phone', split_part(new.email, '@', 1)),
      new.email
    )
    on conflict (id) do update set
      role = excluded.role,
      full_name = coalesce(excluded.full_name, profiles.full_name),
      phone = coalesce(excluded.phone, profiles.phone),
      email = coalesce(excluded.email, profiles.email);
  else
    insert into public.application_users (
      id,
      full_name,
      phone,
      village,
      district,
      state,
      pincode,
      preferred_language
    ) values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', 'Farmer'),
      coalesce(new.raw_user_meta_data->>'phone', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data->>'village', ''),
      coalesce(new.raw_user_meta_data->>'district', ''),
      coalesce(new.raw_user_meta_data->>'state', ''),
      coalesce(new.raw_user_meta_data->>'pincode', ''),
      coalesce(new.raw_user_meta_data->>'preferred_language', 'en')
    )
    on conflict (id) do update set
      full_name = coalesce(excluded.full_name, application_users.full_name),
      phone = coalesce(excluded.phone, application_users.phone),
      village = coalesce(excluded.village, application_users.village),
      district = coalesce(excluded.district, application_users.district),
      state = coalesce(excluded.state, application_users.state),
      pincode = coalesce(excluded.pincode, application_users.pincode),
      preferred_language = coalesce(excluded.preferred_language, application_users.preferred_language);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto reduce stock when order is placed
create or replace function public.handle_order_inventory()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT' and new.status in ('confirmed', 'dispatched', 'delivered')) then
    update public.shop_products
    set stock_quantity = greatest(0, stock_quantity - new.quantity)
    where id = new.product_id;
  end if;
  return new;
end;
$$;

create or replace trigger on_order_created_reduce_stock
after insert on public.orders
for each row execute function public.handle_order_inventory();

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.application_users enable row level security;
alter table public.shops enable row level security;
alter table public.shop_products enable row level security;
alter table public.product_bulk_uploads enable row level security;
alter table public.orders enable row level security;
alter table public.premium_subscriptions enable row level security;
alter table public.diagnosis_history enable row level security;
alter table public.farmer_crop_plans enable row level security;
alter table public.advisories enable row level security;
alter table public.user_feedback enable row level security;

-- ---------------- PROFILES ----------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ---------------- APPLICATION USERS ----------------
drop policy if exists application_users_select_own on public.application_users;
create policy application_users_select_own on public.application_users
for select using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists application_users_insert_own on public.application_users;
create policy application_users_insert_own on public.application_users
for insert with check (auth.uid() = id);

drop policy if exists application_users_update_own on public.application_users;
create policy application_users_update_own on public.application_users
for update using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ---------------- SHOPS ----------------
drop policy if exists shops_public_read_active on public.shops;
create policy shops_public_read_active on public.shops
for select using (subscription_active = true or auth.uid() = owner_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists shops_owner_insert on public.shops;
create policy shops_owner_insert on public.shops
for insert with check (auth.uid() = owner_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists shops_owner_update on public.shops;
create policy shops_owner_update on public.shops
for update using (auth.uid() = owner_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists shops_owner_delete on public.shops;
create policy shops_owner_delete on public.shops
for delete using (auth.uid() = owner_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ---------------- SHOP PRODUCTS ----------------
drop policy if exists shop_products_public_read_active on public.shop_products;
create policy shop_products_public_read_active on public.shop_products
for select using (
  (is_active = true and stock_quantity > 0 and exists (
    select 1 from public.shops s where s.id = shop_products.shop_id and s.subscription_active = true
  ))
  or exists (
    select 1 from public.shops s where s.id = shop_products.shop_id and s.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists shop_products_owner_all on public.shop_products;
create policy shop_products_owner_all on public.shop_products
for all using (
  exists (
    select 1 from public.shops s where s.id = shop_products.shop_id and s.owner_id = auth.uid()
  ) or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
) with check (
  exists (
    select 1 from public.shops s where s.id = shop_products.shop_id and s.owner_id = auth.uid()
  ) or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

-- ---------------- BULK UPLOADS ----------------
drop policy if exists product_bulk_uploads_owner_all on public.product_bulk_uploads;
create policy product_bulk_uploads_owner_all on public.product_bulk_uploads
for all using (
  exists (
    select 1 from public.shops s where s.id = product_bulk_uploads.shop_id and s.owner_id = auth.uid()
  ) or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
) with check (
  exists (
    select 1 from public.shops s where s.id = product_bulk_uploads.shop_id and s.owner_id = auth.uid()
  ) or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

-- ---------------- ORDERS ----------------
drop policy if exists orders_anon_insert on public.orders;
create policy orders_anon_insert on public.orders
for insert with check (true);

drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
for select using (
  auth.uid() = farmer_id
  or exists (
    select 1 from public.shops s where s.id = orders.shop_id and s.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders
for update using (
  exists (
    select 1 from public.shops s where s.id = orders.shop_id and s.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

-- ---------------- PREMIUM SUBSCRIPTIONS ----------------
drop policy if exists premium_subscriptions_public_read on public.premium_subscriptions;
drop policy if exists premium_subscriptions_admin_read on public.premium_subscriptions;

create policy premium_subscriptions_admin_read on public.premium_subscriptions
for select using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

drop policy if exists premium_subscriptions_anon_insert on public.premium_subscriptions;
create policy premium_subscriptions_anon_insert on public.premium_subscriptions
for insert with check (status = 'pending_verification');

drop policy if exists premium_subscriptions_admin_update on public.premium_subscriptions;
create policy premium_subscriptions_admin_update on public.premium_subscriptions
for update using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

-- ---------------- DIAGNOSIS HISTORY ----------------
drop policy if exists diagnosis_history_anon_insert on public.diagnosis_history;
create policy diagnosis_history_anon_insert on public.diagnosis_history
for insert with check (true);

drop policy if exists diagnosis_history_select on public.diagnosis_history;
create policy diagnosis_history_select on public.diagnosis_history
for select using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  or auth.role() = 'anon'
);

-- ---------------- CROP PLANS ----------------
drop policy if exists farmer_crop_plans_user_all on public.farmer_crop_plans;
create policy farmer_crop_plans_user_all on public.farmer_crop_plans
for all using (
  auth.uid() = user_id or auth.role() = 'anon'
) with check (
  auth.uid() = user_id or auth.role() = 'anon'
);

-- ---------------- ADVISORIES ----------------
drop policy if exists advisories_public_read on public.advisories;
create policy advisories_public_read on public.advisories
for select using (is_active = true or exists (select 1 from public.profiles pr where pr.id = auth.uid()));

drop policy if exists advisories_staff_write on public.advisories;
create policy advisories_staff_write on public.advisories
for all using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role in ('admin', 'agronomist'))
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role in ('admin', 'agronomist'))
);

-- ---------------- USER FEEDBACK ----------------
drop policy if exists user_feedback_insert on public.user_feedback;
create policy user_feedback_insert on public.user_feedback
for insert with check (true);

drop policy if exists user_feedback_admin_select on public.user_feedback;
create policy user_feedback_admin_select on public.user_feedback
for select using (
  auth.uid() = user_id or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

-- ==============================================================================
-- 12. RPC FUNCTIONS FOR MOBILE APP & WEB PORTALS
-- ==============================================================================

-- 1. Nearby Products Discovery (Used by App Marketplace)
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
      or exists (
        select 1 from unnest(p.target_crops) c
        where c ilike '%' || p_crop || '%'
      )
    )
  order by 14 asc;
$$;

grant execute on function public.get_nearby_products to anon, authenticated;

-- 2. Nearby Shops Discovery (Used by Partner Directory)
create or replace function public.get_nearby_shops(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision default 25
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
  rating numeric,
  opening_hours text,
  banner_image_url text
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
    s.rating,
    s.opening_hours,
    s.banner_image_url
  from public.shops s
  where s.subscription_active = true
    and ST_DWithin(
      s.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
  order by 14 asc;
$$;

grant execute on function public.get_nearby_shops to anon, authenticated;

-- 3. Shop Partner Dashboard Stats (Used by Shop Owner Web Portal)
create or replace function public.get_shop_dashboard_stats(p_shop_id uuid)
returns table (
  total_products bigint,
  low_stock_count bigint,
  pending_orders bigint,
  delivered_orders bigint,
  total_revenue numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select
    (select count(*) from public.shop_products where shop_id = p_shop_id and is_active = true),
    (select count(*) from public.shop_products where shop_id = p_shop_id and stock_quantity <= 5 and is_active = true),
    (select count(*) from public.orders where shop_id = p_shop_id and status in ('confirmed', 'dispatched')),
    (select count(*) from public.orders where shop_id = p_shop_id and status = 'delivered'),
    coalesce((select sum(total_amount) from public.orders where shop_id = p_shop_id and status = 'delivered'), 0);
end;
$$;

grant execute on function public.get_shop_dashboard_stats to authenticated;

-- 4. Admin Global Dashboard Stats (Used by Admin Web Portal)
create or replace function public.get_admin_dashboard_stats()
returns table (
  total_farmers bigint,
  total_shops bigint,
  verified_shops bigint,
  pending_subscriptions bigint,
  total_diagnoses bigint,
  total_orders bigint,
  total_marketplace_gmv numeric
)
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Admin access required.';
  end if;

  return query
  select
    (select count(*) from public.application_users),
    (select count(*) from public.shops),
    (select count(*) from public.shops where is_verified_partner = true),
    (select count(*) from public.premium_subscriptions where status = 'pending_verification'),
    (select count(*) from public.diagnosis_history),
    (select count(*) from public.orders),
    coalesce((select sum(total_amount) from public.orders where status <> 'cancelled'), 0);
end;
$$;

grant execute on function public.get_admin_dashboard_stats to authenticated;

-- 5. Admin Approve / Reject Farmer Premium Subscription
create or replace function public.verify_premium_subscription(
  p_subscription_id uuid,
  p_status text,
  p_rejection_reason text default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_sub record;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: Admin privileges required.';
  end if;

  select * into v_sub from public.premium_subscriptions where id = p_subscription_id;
  if not found then
    raise exception 'Subscription claim not found.';
  end if;

  update public.premium_subscriptions
  set
    status = p_status,
    verified_at = now(),
    verified_by = auth.uid(),
    rejection_reason = p_rejection_reason,
    expires_at = case
      when p_status = 'verified' and plan = 'single' then now() + interval '30 days'
      when p_status = 'verified' and plan = 'lifetime' then now() + interval '100 years'
      when p_status = 'verified' and plan = 'monthly' then now() + interval '30 days'
      when p_status = 'verified' and plan = 'yearly' then now() + interval '365 days'
      else null
    end
  where id = p_subscription_id;

  if (p_status = 'verified' and v_sub.user_id is not null) then
    update public.application_users
    set
      is_premium = true,
      premium_expires_at = case
        when v_sub.plan = 'single' then now() + interval '30 days'
        when v_sub.plan = 'lifetime' then now() + interval '100 years'
        when v_sub.plan = 'monthly' then now() + interval '30 days'
        when v_sub.plan = 'yearly' then now() + interval '365 days'
        else null
      end
    where id = v_sub.user_id;
  end if;

  return true;
end;
$$;

grant execute on function public.verify_premium_subscription to authenticated;

-- ==============================================================================
-- 13. SUPABASE REALTIME & STORAGE BUCKETS
-- ==============================================================================

-- 1. Enable Supabase Realtime Replication for Live UI updates
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.orders;
    exception when others then null;
    end;
    begin
      alter publication supabase_realtime add table public.advisories;
    exception when others then null;
    end;
    begin
      alter publication supabase_realtime add table public.premium_subscriptions;
    exception when others then null;
    end;
  end if;
end $$;

-- 2. Supabase Storage Buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('crop-scans', 'crop-scans', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('shop-media', 'shop-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('bulk-uploads', 'bulk-uploads', false, 20971520, array['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 3. Storage Security Policies
drop policy if exists "Public Access for Media" on storage.objects;
create policy "Public Access for Media" on storage.objects
for select using (bucket_id in ('crop-scans', 'product-images', 'shop-media'));

drop policy if exists "Upload Crop Scans" on storage.objects;
create policy "Upload Crop Scans" on storage.objects
for insert with check (bucket_id = 'crop-scans');

drop policy if exists "Shop Owner Upload Assets" on storage.objects;
create policy "Shop Owner Upload Assets" on storage.objects
for insert with check (
  bucket_id in ('product-images', 'shop-media', 'bulk-uploads')
  and (auth.role() = 'authenticated' or exists (select 1 from public.profiles p where p.id = auth.uid()))
);
