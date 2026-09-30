-- ============================================================
-- SHREE COLLECTION
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- ============================================================
-- 1. ENABLE RLS
-- ============================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.wholesale_prices enable row level security;
alter table public.profiles enable row level security;
alter table public.wholesale_shops enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;


-- ============================================================
-- 2. PUBLIC CATEGORY READ ACCESS
-- ============================================================

drop policy if exists "Public can view active categories"
on public.categories;

create policy "Public can view active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);


-- ============================================================
-- 3. PUBLIC PRODUCT READ ACCESS
-- ============================================================

drop policy if exists "Public can view active products"
on public.products;

create policy "Public can view active products"
on public.products
for select
to anon, authenticated
using (is_active = true);


-- ============================================================
-- 4. PUBLIC PRODUCT IMAGE READ ACCESS
-- ============================================================

drop policy if exists "Public can view product images"
on public.product_images;

create policy "Public can view product images"
on public.product_images
for select
to anon, authenticated
using (true);


-- ============================================================
-- 5. WHOLESALE PRICE READ ACCESS
-- ============================================================
--
-- Temporary public read access for development.
--
-- Later we will restrict this so that only approved
-- wholesale shop owners can see wholesale prices.
--
-- ============================================================

drop policy if exists "Public can view wholesale prices"
on public.wholesale_prices;

create policy "Public can view wholesale prices"
on public.wholesale_prices
for select
to anon, authenticated
using (true);