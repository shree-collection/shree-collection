-- ============================================================
-- Product Images
-- Stores multiple images for each product
-- ============================================================

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  image_url text not null,

  sort_order integer not null default 0,

  is_primary boolean not null default false,

  created_at timestamptz not null default now()
);


-- ============================================================
-- Index
-- ============================================================

create index if not exists idx_product_images_product_id
on public.product_images(product_id);


-- ============================================================
-- Index for product image ordering
-- ============================================================

create index if not exists idx_product_images_product_sort
on public.product_images(product_id, sort_order);


-- ============================================================
-- Enable RLS
-- ============================================================

alter table public.product_images enable row level security;


-- ============================================================
-- Public can view product images
-- ============================================================

drop policy if exists
"Public can view product images"
on public.product_images;

create policy
"Public can view product images"
on public.product_images
for select
using (true);


-- ============================================================
-- Service role / server can manage images
-- ============================================================

drop policy if exists
"Service role can manage product images"
on public.product_images;

create policy
"Service role can manage product images"
on public.product_images
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');