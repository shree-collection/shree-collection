-- ============================================================
-- SHREE COLLECTION
-- DATABASE SCHEMA
-- ============================================================
--
-- Purpose:
-- E-commerce database for:
-- 1. Retail customers
-- 2. Wholesale shop owners
-- 3. Products and categories
-- 4. Orders
-- 5. Wholesale pricing
--
-- Database: Supabase PostgreSQL
-- ============================================================


-- ============================================================
-- 1. CATEGORIES
-- ============================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  slug text not null unique,

  description text,

  image_url text,

  -- NULL = main category
  -- Value = parent category ID for subcategory
  parent_id uuid references public.categories(id) on delete cascade,

  is_active boolean not null default true,

  sort_order integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================
-- 2. PRODUCTS
-- ============================================================

create table public.products (
  id uuid primary key default gen_random_uuid(),

  category_id uuid references public.categories(id),

  name text not null,

  slug text not null unique,

  description text,

  sku text unique,

  retail_price numeric(12,2) not null,

  compare_at_price numeric(12,2),

  stock_quantity integer not null default 0,

  image_url text,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================
-- 3. PRODUCT IMAGES
-- ============================================================

create table public.product_images (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  image_url text not null,

  sort_order integer not null default 0,

  created_at timestamptz not null default now()
);


-- ============================================================
-- 4. WHOLESALE PRICES
-- ============================================================

create table public.wholesale_prices (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  minimum_quantity integer not null,

  price numeric(12,2) not null,

  created_at timestamptz not null default now(),

  unique(product_id, minimum_quantity)
);


-- ============================================================
-- 5. USER PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  full_name text,

  phone text,

  user_type text not null default 'retail'
    check (
      user_type in ('retail', 'wholesale', 'admin')
    ),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================
-- 6. WHOLESALE SHOPS
-- ============================================================

create table public.wholesale_shops (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  shop_name text not null,

  owner_name text,

  phone text,

  address text,

  city text,

  state text,

  pincode text,

  gst_number text,

  status text not null default 'pending'
    check (
      status in ('pending', 'approved', 'blocked')
    ),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================
-- 7. CUSTOMER ADDRESSES
-- ============================================================

create table public.addresses (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  name text not null,

  phone text not null,

  address_line1 text not null,

  address_line2 text,

  city text not null,

  state text not null,

  pincode text not null,

  is_default boolean not null default false,

  created_at timestamptz not null default now()
);


-- ============================================================
-- 8. ORDERS
-- ============================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),

  user_id uuid references public.profiles(id),

  order_number text not null unique,

  order_type text not null default 'retail'
    check (
      order_type in ('retail', 'wholesale')
    ),

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
      )
    ),

  subtotal numeric(12,2) not null default 0,

  shipping_amount numeric(12,2) not null default 0,

  discount_amount numeric(12,2) not null default 0,

  total_amount numeric(12,2) not null default 0,

  payment_status text not null default 'pending'
    check (
      payment_status in (
        'pending',
        'paid',
        'failed',
        'refunded'
      )
    ),

  payment_method text,

  shipping_name text,

  shipping_phone text,

  shipping_address text,

  shipping_city text,

  shipping_state text,

  shipping_pincode text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================
-- 9. ORDER ITEMS
-- ============================================================

create table public.order_items (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null
    references public.orders(id)
    on delete cascade,

  product_id uuid references public.products(id),

  product_name text not null,

  sku text,

  quantity integer not null,

  unit_price numeric(12,2) not null,

  total_price numeric(12,2) not null,

  created_at timestamptz not null default now()
);