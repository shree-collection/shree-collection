-- ============================================================
-- SHREE COLLECTION
-- ADMIN ACCESS FOR ORDERS
-- ============================================================

-- ------------------------------------------------------------
-- Helper function to check whether logged-in user is admin
-- ------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and user_type = 'admin'
  );
$$;


-- ------------------------------------------------------------
-- Orders: only admins can read
-- ------------------------------------------------------------

drop policy if exists "Admins can view orders"
on public.orders;

create policy "Admins can view orders"
on public.orders
for select
to authenticated
using (
  public.is_admin()
);


-- ------------------------------------------------------------
-- Order Items: only admins can read
-- ------------------------------------------------------------

drop policy if exists "Admins can view order items"
on public.order_items;

create policy "Admins can view order items"
on public.order_items
for select
to authenticated
using (
  public.is_admin()
);


-- ------------------------------------------------------------
-- Admins can update orders
-- This will be needed for status changes later.
-- ------------------------------------------------------------

drop policy if exists "Admins can update orders"
on public.orders;

create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

insert into public.profiles (
  id,
  full_name,
  user_type
)
values (
  'd64fab99-f471-4c03-a3eb-45936f690ef7',
  'Shree Collection Admin',
  'admin'
);

-- d64fab99-f471-4c03-a3eb-45936f690ef7 

insert into public.profiles (
  id,
  full_name,
  user_type
)
values (
  'd64fab99-f471-4c03-a3eb-45936f690ef7',
  'Shree Collection Admin',
  'admin'
)
on conflict (id)
do update set
  user_type = 'admin',
  full_name = 'Shree Collection Admin',
  updated_at = now();

  -- Allow a logged-in user to read their own profile

drop policy if exists "Users can view their own profile"
on public.profiles;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);

-- ============================================================
-- ADMIN PRODUCT ACCESS
-- ============================================================

drop policy if exists "Admins can view all products"
on public.products;

create policy "Admins can view all products"
on public.products
for select
to authenticated
using (
  public.is_admin()
);


drop policy if exists "Admins can update products"
on public.products;

create policy "Admins can update products"
on public.products
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- ============================================================
-- ADMIN PRODUCT INSERT ACCESS
-- ============================================================

drop policy if exists "Admins can insert products"
on public.products;

create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check (
  public.is_admin()
);