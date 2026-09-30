-- ============================================================
-- SHREE COLLECTION
-- CATEGORY + SUBCATEGORY MASTER DATA
-- ============================================================

begin;


-- ============================================================
-- 1. MAIN CATEGORIES
-- ============================================================

insert into public.categories
  (name, slug, description, is_active, sort_order)
values
  (
    'Party Items',
    'party-items',
    'Birthday, anniversary and party decoration items',
    true,
    1
  ),
  (
    'Gift Items',
    'gift-items',
    'Gifts for birthdays, anniversaries, kids and special occasions',
    true,
    2
  ),
  (
    'Toys',
    'toys',
    'Fun and entertaining toys for kids',
    true,
    3
  ),
  (
    'Stationery',
    'stationery',
    'School, office, art and craft stationery items',
    true,
    4
  ),
  (
    'Ladies Bags',
    'ladies-bags',
    'Hand bags, sling bags, wallets and pouches',
    true,
    5
  ),
  (
    'Gift Hampers',
    'gift-hampers',
    'Ready-made gift hampers for different occasions',
    true,
    6
  ),
  (
    'Key Chains',
    'key-chains',
    'Anime, cartoon, religious, metal and acrylic key chains',
    true,
    7
  )
on conflict (slug)
do update set
  name = excluded.name,
  description = excluded.description,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();


-- ============================================================
-- 2. PARTY ITEMS
-- ============================================================

insert into public.categories
  (name, slug, parent_id, is_active, sort_order)
select
  v.name,
  v.slug,
  p.id,
  true,
  v.sort_order
from (
  values
    ('Birthday', 'birthday', 1),
    ('Anniversary', 'anniversary', 2),
    ('Kids Party', 'kids-party', 3),
    ('Annaprashan', 'annaprashan', 4),
    ('Baby Shower', 'baby-shower', 5),
    ('Balloons', 'balloons', 6),
    ('Party Decoration', 'party-decoration', 7),
    ('Return Gifts', 'return-gifts', 8)
) as v(name, slug, sort_order)
cross join (
  select id
  from public.categories
  where slug = 'party-items'
) p
on conflict (slug)
do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();


-- ============================================================
-- 3. GIFT ITEMS
-- ============================================================

insert into public.categories
  (name, slug, parent_id, is_active, sort_order)
select
  v.name,
  v.slug,
  p.id,
  true,
  v.sort_order
from (
  values
    ('Birthday Gifts', 'birthday-gifts', 1),
    ('Anniversary Gifts', 'anniversary-gifts', 2),
    ('Couple Gifts', 'couple-gifts', 3),
    ('Kids Gifts', 'kids-gifts', 4),
    ('Religious Gifts', 'religious-gifts', 5),
    ('Photo Frames', 'photo-frames', 6),
    ('Personalized Gifts', 'personalized-gifts', 7)
) as v(name, slug, sort_order)
cross join (
  select id
  from public.categories
  where slug = 'gift-items'
) p
on conflict (slug)
do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();


-- ============================================================
-- 4. TOYS
-- ============================================================

insert into public.categories
  (name, slug, parent_id, is_active, sort_order)
select
  v.name,
  v.slug,
  p.id,
  true,
  v.sort_order
from (
  values
    ('Action Figures', 'action-figures', 1),
    ('Educational Toys', 'educational-toys', 2),
    ('Remote Control Toys', 'remote-control-toys', 3),
    ('Soft Toys', 'soft-toys', 4),
    ('Kids Games', 'kids-games', 5),
    ('Small Toys', 'small-toys', 6),
    ('Keychain Toys', 'keychain-toys', 7)
) as v(name, slug, sort_order)
cross join (
  select id
  from public.categories
  where slug = 'toys'
) p
on conflict (slug)
do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();


-- ============================================================
-- 5. STATIONERY
-- ============================================================

insert into public.categories
  (name, slug, parent_id, is_active, sort_order)
select
  v.name,
  v.slug,
  p.id,
  true,
  v.sort_order
from (
  values
    ('Pens', 'pens', 1),
    ('Pencils', 'pencils', 2),
    ('Erasers', 'erasers', 3),
    ('Notebooks', 'notebooks', 4),
    ('Diaries', 'diaries', 5),
    ('School Items', 'school-items', 6),
    ('Art & Craft', 'art-craft', 7),
    ('Games', 'stationery-games', 8)
) as v(name, slug, sort_order)
cross join (
  select id
  from public.categories
  where slug = 'stationery'
) p
on conflict (slug)
do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();


-- ============================================================
-- 6. LADIES BAGS
-- ============================================================

insert into public.categories
  (name, slug, parent_id, is_active, sort_order)
select
  v.name,
  v.slug,
  p.id,
  true,
  v.sort_order
from (
  values
    ('Hand Bags', 'hand-bags', 1),
    ('Sling Bags', 'sling-bags', 2),
    ('Wallets', 'wallets', 3),
    ('Pouches', 'pouches', 4),
    ('Cosmetic Bags', 'cosmetic-bags', 5)
) as v(name, slug, sort_order)
cross join (
  select id
  from public.categories
  where slug = 'ladies-bags'
) p
on conflict (slug)
do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();


-- ============================================================
-- 7. GIFT HAMPERS
-- ============================================================

insert into public.categories
  (name, slug, parent_id, is_active, sort_order)
select
  v.name,
  v.slug,
  p.id,
  true,
  v.sort_order
from (
  values
    ('Birthday Hampers', 'birthday-hampers', 1),
    ('Kids Hampers', 'kids-hampers', 2),
    ('Couple Hampers', 'couple-hampers', 3),
    ('Festival Hampers', 'festival-hampers', 4),
    ('Corporate Hampers', 'corporate-hampers', 5)
) as v(name, slug, sort_order)
cross join (
  select id
  from public.categories
  where slug = 'gift-hampers'
) p
on conflict (slug)
do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();


-- ============================================================
-- 8. KEY CHAINS
-- ============================================================

insert into public.categories
  (name, slug, parent_id, is_active, sort_order)
select
  v.name,
  v.slug,
  p.id,
  true,
  v.sort_order
from (
  values
    ('Anime Key Chains', 'anime-key-chains', 1),
    ('Cartoon Key Chains', 'cartoon-key-chains', 2),
    ('Religious Key Chains', 'religious-key-chains', 3),
    ('Couple Key Chains', 'couple-key-chains', 4),
    ('Metal Key Chains', 'metal-key-chains', 5),
    ('Acrylic Key Chains', 'acrylic-key-chains', 6),
    ('Car & Bike Key Chains', 'car-bike-key-chains', 7)
) as v(name, slug, sort_order)
cross join (
  select id
  from public.categories
  where slug = 'key-chains'
) p
on conflict (slug)
do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();


commit;


-- ============================================================
-- 9. VERIFY CATEGORY STRUCTURE
-- ============================================================

select
  parent.name as main_category,
  child.name as subcategory,
  child.slug,
  child.sort_order
from public.categories child
join public.categories parent
  on child.parent_id = parent.id
where parent.parent_id is null
order by
  parent.sort_order,
  child.sort_order;