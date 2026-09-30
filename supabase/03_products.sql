-- ============================================================
-- SHREE COLLECTION
-- PRODUCT SEED DATA
-- ============================================================

-- ============================================================
-- 1. CHECK BIRTHDAY CATEGORY
-- ============================================================

do $$
begin

  if not exists (
    select 1
    from public.categories
    where slug = 'birthday'
  ) then

    raise exception
      'Birthday category does not exist. Please run seed.sql first.';

  end if;

end $$;


-- ============================================================
-- 2. INSERT PRODUCTS
-- ============================================================

insert into public.products
(
  category_id,
  name,
  slug,
  description,
  sku,
  retail_price,
  compare_at_price,
  stock_quantity,
  image_url
)
select
  c.id,
  v.name,
  v.slug,
  v.description,
  v.sku,
  v.retail_price,
  v.compare_at_price,
  v.stock_quantity,
  v.image_url
from public.categories c

cross join (
  values

  (
    'Happy Birthday Decoration Set',
    'happy-birthday-decoration-set',
    'Complete decoration set for birthday parties. Perfect for home, kids parties and special celebrations.',
    'SC-BDAY-001',
    199.00,
    299.00,
    50,
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80'
  ),

  (
    'Birthday Balloon Decoration Kit',
    'birthday-balloon-decoration-kit',
    'Colorful balloon decoration kit for birthday parties and celebrations.',
    'SC-BDAY-002',
    299.00,
    399.00,
    40,
    'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80'
  ),

  (
    'Birthday Return Gift Set',
    'birthday-return-gift-set',
    'Fun return gift set for kids birthday parties and celebrations.',
    'SC-BDAY-003',
    349.00,
    449.00,
    30,
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80'
  ),

  (
    'Birthday Cake Topper',
    'birthday-cake-topper',
    'Beautiful cake topper to make your birthday cake extra special.',
    'SC-BDAY-004',
    99.00,
    149.00,
    100,
    'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80'
  )

) as v(
  name,
  slug,
  description,
  sku,
  retail_price,
  compare_at_price,
  stock_quantity,
  image_url
)

where c.slug = 'birthday'

on conflict (slug) do nothing;


-- ============================================================
-- 3. VERIFY PRODUCTS
-- ============================================================

select
  p.id,
  p.name,
  p.slug,
  p.sku,
  p.retail_price,
  p.compare_at_price,
  p.stock_quantity,
  c.name as category
from public.products p
left join public.categories c
  on p.category_id = c.id
order by p.created_at;