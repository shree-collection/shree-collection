-- ============================================================
-- SHREE COLLECTION
-- SEED DATA
-- ============================================================
--
-- Purpose:
-- Insert initial product categories and subcategories.
--
-- This script is safe to run multiple times because
-- category slugs are unique and duplicate records are ignored.
-- ============================================================


-- ============================================================
-- 1. MAIN CATEGORIES
-- ============================================================

insert into public.categories
(
  name,
  slug,
  description,
  sort_order
)
values
(
  'Party Items',
  'party-items',
  'Birthday, anniversary, kids party and celebration items',
  1
),
(
  'Gift Items',
  'gift-items',
  'Special gifts for every occasion',
  2
),
(
  'Toys',
  'toys',
  'Fun and educational toys for kids',
  3
),
(
  'Stationery',
  'stationery',
  'School, office and art stationery',
  4
),
(
  'Ladies Bags',
  'ladies-bags',
  'Trendy bags and accessories',
  5
),
(
  'Gift Hampers',
  'gift-hampers',
  'Ready-made and special gift hampers',
  6
),
(
  'Key Chains',
  'key-chains',
  'Cute and trendy key chains',
  7
)
on conflict (slug) do nothing;


-- ============================================================
-- 2. PARTY ITEM SUBCATEGORIES
-- ============================================================

insert into public.categories
(
  name,
  slug,
  description,
  parent_id,
  sort_order
)
select
  'Birthday',
  'birthday',
  'Birthday decorations, balloons, cake toppers and return gifts',
  id,
  1
from public.categories
where slug = 'party-items'
on conflict (slug) do nothing;


insert into public.categories
(
  name,
  slug,
  description,
  parent_id,
  sort_order
)
select
  'Anniversary',
  'anniversary',
  'Anniversary decorations and celebration items',
  id,
  2
from public.categories
where slug = 'party-items'
on conflict (slug) do nothing;


insert into public.categories
(
  name,
  slug,
  description,
  parent_id,
  sort_order
)
select
  'Kids Party',
  'kids-party',
  'Fun party items for kids celebrations',
  id,
  3
from public.categories
where slug = 'party-items'
on conflict (slug) do nothing;


insert into public.categories
(
  name,
  slug,
  description,
  parent_id,
  sort_order
)
select
  'Annaprashan',
  'annaprashan',
  'Annaprashan ceremony decoration and celebration items',
  id,
  4
from public.categories
where slug = 'party-items'
on conflict (slug) do nothing;


insert into public.categories
(
  name,
  slug,
  description,
  parent_id,
  sort_order
)
select
  'Baby Shower',
  'baby-shower',
  'Baby shower decoration and celebration items',
  id,
  5
from public.categories
where slug = 'party-items'
on conflict (slug) do nothing;


insert into public.categories
(
  name,
  slug,
  description,
  parent_id,
  sort_order
)
select
  'Balloons',
  'balloons',
  'Balloons and balloon decoration items',
  id,
  6
from public.categories
where slug = 'party-items'
on conflict (slug) do nothing;


insert into public.categories
(
  name,
  slug,
  description,
  parent_id,
  sort_order
)
select
  'Party Decoration',
  'party-decoration',
  'Decoration items for parties and celebrations',
  id,
  7
from public.categories
where slug = 'party-items'
on conflict (slug) do nothing;


insert into public.categories
(
  name,
  slug,
  description,
  parent_id,
  sort_order
)
select
  'Return Gifts',
  'return-gifts',
  'Return gifts for birthday and other celebrations',
  id,
  8
from public.categories
where slug = 'party-items'
on conflict (slug) do nothing;


-- ============================================================
-- 3. VERIFY CATEGORY STRUCTURE
-- ============================================================

select
  child.name as subcategory,
  parent.name as category,
  child.slug,
  child.sort_order
from public.categories child
left join public.categories parent
  on child.parent_id = parent.id
order by
  coalesce(parent.sort_order, child.sort_order),
  child.sort_order;