-- ============================================================
-- UniMart — Supabase Schema
-- Sprint 3: EP-04 · US-07 through US-11
-- Run AFTER Sprint 1 and Sprint 2 schemas
-- ============================================================

-- ── 1. ORDERS ────────────────────────────────────────────────
create table if not exists public.orders (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid,
  vertical        text check (vertical in ('Shop','Meal Kits','Food Delivery','Mixed')),
  status          text default 'Pending' check (status in ('Pending','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled','Refunded')),
  items           jsonb default '[]'::jsonb,
  subtotal        numeric(10,2),
  delivery_fee    numeric(10,2) default 0,
  total           numeric(10,2),
  delivery_address jsonb,
  payment_method  text,
  payment_status  text default 'Pending' check (payment_status in ('Pending','Paid','Failed','Refunded')),
  estimated_delivery timestamptz,
  delivered_at    timestamptz,
  driver_id       uuid,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 2. CUSTOMERS ─────────────────────────────────────────────
create table if not exists public.customers (
  id              uuid primary key default uuid_generate_v4(),
  email           text unique not null,
  full_name       text,
  phone           text,
  address         jsonb,
  dietary_preferences text[],
  allergies       text[],
  household_size  integer default 1,
  notification_preferences jsonb default '{
    "shop_deals": true,
    "meal_kit_reminders": true,
    "food_delivery_updates": true,
    "order_updates": true,
    "marketing": false
  }'::jsonb,
  loyalty_points  integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 3. DELIVERY DRIVERS ──────────────────────────────────────
create table if not exists public.delivery_drivers (
  id              uuid primary key default uuid_generate_v4(),
  full_name       text not null,
  email           text unique not null,
  phone           text,
  vehicle_type    text check (vehicle_type in ('Bicycle','Motorcycle','Car','Van')),
  status          text default 'Offline' check (status in ('Online','Offline','On Delivery')),
  current_location jsonb,
  background_check_status text default 'Pending' check (background_check_status in ('Pending','Passed','Failed')),
  rating          numeric(3,2) default 5.00,
  total_deliveries integer default 0,
  earnings_today  numeric(10,2) default 0,
  earnings_total  numeric(10,2) default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 4. DELIVERY JOBS ─────────────────────────────────────────
create table if not exists public.delivery_jobs (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid references public.orders(id),
  driver_id       uuid references public.delivery_drivers(id),
  status          text default 'Available' check (status in ('Available','Accepted','Picked Up','Delivered','Cancelled')),
  pickup_address  jsonb,
  delivery_address jsonb,
  pickup_lat      numeric(10,7),
  pickup_lng      numeric(10,7),
  delivery_lat    numeric(10,7),
  delivery_lng    numeric(10,7),
  estimated_pay   numeric(10,2),
  actual_pay      numeric(10,2),
  distance_km     numeric(8,2),
  eta_minutes     integer,
  route_geometry  jsonb,
  accepted_at     timestamptz,
  picked_up_at    timestamptz,
  delivered_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 5. NUTRITIONISTS ─────────────────────────────────────────
create table if not exists public.nutritionists (
  id              uuid primary key default uuid_generate_v4(),
  full_name       text not null,
  email           text unique not null,
  credentials     text,
  specialisations text[],
  bio             text,
  badge_verified  boolean default false,
  badge_display   boolean default false,
  approved_at     timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 6. MEAL PLANS (Nutritionist-submitted) ───────────────────
create table if not exists public.meal_plans (
  id              uuid primary key default uuid_generate_v4(),
  nutritionist_id uuid references public.nutritionists(id),
  title           text not null,
  description     text,
  dietary_tags    text[],
  weeks           integer default 1,
  meals           jsonb default '[]'::jsonb,
  nutritional_summary jsonb,
  status          text default 'Draft' check (status in ('Draft','Submitted','Approved','Rejected')),
  approved_at     timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 7. CART ──────────────────────────────────────────────────
create table if not exists public.carts (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid references public.customers(id),
  items           jsonb default '[]'::jsonb,
  -- item format: { id, title, price, vertical, quantity, delivery_estimate }
  total           numeric(10,2) default 0,
  item_count      integer default 0,
  has_mixed_verticals boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 8. PRODUCT CATALOG ───────────────────────────────────────
create table if not exists public.products (
  id              uuid primary key default uuid_generate_v4(),
  seller_id       uuid references public.sellers(id),
  title           text not null,
  description     text,
  vertical        text check (vertical in ('Shop','Meal Kits','Food Delivery')),
  price           numeric(10,2),
  category        text,
  images          text[],
  allergens       text[],
  ingredients     text[],
  in_stock        boolean default true,
  stock_count     integer,
  nutritionist_approved boolean default false,
  nutritionist_id uuid references public.nutritionists(id),
  rating          numeric(3,2) default 0,
  review_count    integer default 0,
  tags            text[],
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 9. REVIEWS ───────────────────────────────────────────────
create table if not exists public.reviews (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid references public.products(id),
  customer_id     uuid references public.customers(id),
  rating          integer check (rating between 1 and 5),
  review_text     text,
  verified_purchase boolean default false,
  helpful_count   integer default 0,
  flagged         boolean default false,
  created_at      timestamptz default now()
);

-- ── 10. WAITLIST ─────────────────────────────────────────────
create table if not exists public.waitlist (
  id              uuid primary key default uuid_generate_v4(),
  email           text unique not null,
  referral_code   text unique default substr(md5(random()::text), 1, 8),
  referred_by     text,
  referral_count  integer default 0,
  vertical_interest text[],
  position        integer,
  created_at      timestamptz default now()
);

-- ── 11. BRAND ASSETS ─────────────────────────────────────────
create table if not exists public.brand_assets (
  id              uuid primary key default uuid_generate_v4(),
  asset_type      text check (asset_type in ('logo','color_palette','typography','tone_of_voice','guidelines')),
  title           text not null,
  content         jsonb,
  approved        boolean default false,
  approved_by     text,
  version         text default '1.0',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 12. AI CONVERSATION HISTORY ──────────────────────────────
create table if not exists public.conversation_history (
  id              uuid primary key default uuid_generate_v4(),
  session_id      text not null,
  customer_id     uuid references public.customers(id),
  messages        jsonb default '[]'::jsonb,
  -- [{ role: "user"|"assistant", content, timestamp, intent, vertical }]
  resolved        boolean default false,
  vertical_routed text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 13. NOTIFICATION LOG ─────────────────────────────────────
create table if not exists public.notification_log (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid references public.customers(id),
  type            text,
  channel         text check (channel in ('push','email','sms')),
  title           text,
  body            text,
  sent            boolean default false,
  opened          boolean default false,
  created_at      timestamptz default now()
);

-- ── RLS ──────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'orders','customers','delivery_drivers','delivery_jobs',
    'nutritionists','meal_plans','carts','products','reviews',
    'waitlist','brand_assets','conversation_history','notification_log'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Public read %I" on public.%I for select using (true)', t, t);
    execute format('create policy "Allow anon insert %I" on public.%I for insert with check (true)', t, t);
    execute format('create policy "Auth manage %I" on public.%I for all using (auth.role() = ''authenticated'')', t, t);
  end loop;
end $$;

-- ── TRIGGERS ─────────────────────────────────────────────────
create trigger orders_updated_at          before update on public.orders           for each row execute function public.set_updated_at();
create trigger customers_updated_at       before update on public.customers         for each row execute function public.set_updated_at();
create trigger delivery_drivers_updated   before update on public.delivery_drivers  for each row execute function public.set_updated_at();
create trigger delivery_jobs_updated      before update on public.delivery_jobs     for each row execute function public.set_updated_at();
create trigger nutritionists_updated      before update on public.nutritionists     for each row execute function public.set_updated_at();
create trigger meal_plans_updated         before update on public.meal_plans        for each row execute function public.set_updated_at();
create trigger carts_updated              before update on public.carts             for each row execute function public.set_updated_at();
create trigger products_updated           before update on public.products          for each row execute function public.set_updated_at();
create trigger brand_assets_updated       before update on public.brand_assets      for each row execute function public.set_updated_at();
create trigger conversation_updated       before update on public.conversation_history for each row execute function public.set_updated_at();

-- ── INDEXES ──────────────────────────────────────────────────
create index if not exists idx_orders_customer     on public.orders(customer_id);
create index if not exists idx_orders_status       on public.orders(status);
create index if not exists idx_orders_driver       on public.orders(driver_id);
create index if not exists idx_delivery_jobs_driver on public.delivery_jobs(driver_id);
create index if not exists idx_delivery_jobs_order  on public.delivery_jobs(order_id);
create index if not exists idx_delivery_jobs_status on public.delivery_jobs(status);
create index if not exists idx_products_vertical    on public.products(vertical);
create index if not exists idx_products_seller      on public.products(seller_id);
create index if not exists idx_carts_customer       on public.carts(customer_id);
create index if not exists idx_waitlist_referral    on public.waitlist(referral_code);
create index if not exists idx_conversation_session on public.conversation_history(session_id);
create index if not exists idx_reviews_product      on public.reviews(product_id);
