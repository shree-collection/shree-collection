DO $$
DECLARE
  divine_id uuid;
BEGIN

  -- Create main category
  INSERT INTO public.categories (
    name,
    slug,
    description,
    parent_id,
    is_active,
    sort_order
  )
  VALUES (
    'Divine Photo Frames',
    'divine-photo-frames',
    'Divine and religious photo frames for home, temple and gifting.',
    NULL,
    true,
    8
  )
  ON CONFLICT (slug)
  DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    parent_id = NULL,
    is_active = true,
    sort_order = 8,
    updated_at = now();

  SELECT id
  INTO divine_id
  FROM public.categories
  WHERE slug = 'divine-photo-frames';

  -- Subcategories
  INSERT INTO public.categories
    (name, slug, description, parent_id, is_active, sort_order)
  VALUES
    ('Ganesh', 'divine-ganesh', 'Lord Ganesh photo frames.', divine_id, true, 1),
    ('Krishna', 'divine-krishna', 'Lord Krishna photo frames.', divine_id, true, 2),
    ('Radha Krishna', 'divine-radha-krishna', 'Radha Krishna photo frames.', divine_id, true, 3),
    ('Shiva', 'divine-shiva', 'Lord Shiva photo frames.', divine_id, true, 4),
    ('Hanuman', 'divine-hanuman', 'Lord Hanuman photo frames.', divine_id, true, 5),
    ('Ram Darbar', 'divine-ram-darbar', 'Ram Darbar photo frames.', divine_id, true, 6),
    ('Lakshmi', 'divine-lakshmi', 'Goddess Lakshmi photo frames.', divine_id, true, 7),
    ('Durga', 'divine-durga', 'Goddess Durga photo frames.', divine_id, true, 8),
    ('Buddha', 'divine-buddha', 'Buddha photo frames.', divine_id, true, 9),
    ('Other Divine Frames', 'divine-other', 'Other divine and religious photo frames.', divine_id, true, 10)
  ON CONFLICT (slug)
  DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    parent_id = EXCLUDED.parent_id,
    is_active = true,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

END $$;