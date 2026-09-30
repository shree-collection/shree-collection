-- ============================================================
-- SHREE COLLECTION
-- CREATE RETAIL GUEST ORDER FUNCTION
-- ============================================================

create or replace function public.create_guest_order(
  p_customer_name text,
  p_mobile text,
  p_address text,
  p_city text,
  p_state text,
  p_pincode text,
  p_items jsonb
)
returns table (
  order_id uuid,
  order_number text,
  subtotal numeric,
  shipping_amount numeric,
  total_amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,2) := 0;
  v_shipping_amount numeric(12,2) := 0;
  v_total_amount numeric(12,2) := 0;

  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;

  v_product_name text;
  v_product_sku text;
  v_product_price numeric(12,2);
  v_stock_quantity integer;
  v_item_total numeric(12,2);
begin

  -- ----------------------------------------------------------
  -- Basic validation
  -- ----------------------------------------------------------

  if trim(coalesce(p_customer_name, '')) = '' then
    raise exception 'Customer name is required';
  end if;

  if trim(coalesce(p_mobile, '')) = '' then
    raise exception 'Mobile number is required';
  end if;

  if trim(coalesce(p_address, '')) = '' then
    raise exception 'Address is required';
  end if;

  if trim(coalesce(p_city, '')) = '' then
    raise exception 'City is required';
  end if;

  if trim(coalesce(p_state, '')) = '' then
    raise exception 'State is required';
  end if;

  if trim(coalesce(p_pincode, '')) = '' then
    raise exception 'Pincode is required';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;


  -- ----------------------------------------------------------
  -- Process products
  -- ----------------------------------------------------------

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop

    v_product_id :=
      (v_item ->> 'product_id')::uuid;

    v_quantity :=
      (v_item ->> 'quantity')::integer;


    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid product quantity';
    end if;


    -- Get product and lock the row
    select
      name,
      sku,
      retail_price,
      stock_quantity
    into
      v_product_name,
      v_product_sku,
      v_product_price,
      v_stock_quantity
    from public.products
    where id = v_product_id
      and is_active = true
    for update;


    if not found then
      raise exception
        'Product not found or inactive: %',
        v_product_id;
    end if;


    -- Check stock
    if v_stock_quantity < v_quantity then
      raise exception
        'Insufficient stock for product: %',
        v_product_name;
    end if;


    -- Calculate item total
    v_item_total :=
      v_product_price * v_quantity;


    -- Add to subtotal
    v_subtotal :=
      v_subtotal + v_item_total;


    -- Reduce stock
    update public.products
    set
      stock_quantity = stock_quantity - v_quantity,
      updated_at = now()
    where id = v_product_id;


  end loop;


  -- ----------------------------------------------------------
  -- Shipping
  -- Free delivery for orders >= ₹499
  -- ----------------------------------------------------------

  if v_subtotal >= 499 then
    v_shipping_amount := 0;
  else
    v_shipping_amount := 49;
  end if;


  v_total_amount :=
    v_subtotal
    + v_shipping_amount;


  -- ----------------------------------------------------------
  -- Generate order number
  -- Example:
  -- SC-20260926-AB12
  -- ----------------------------------------------------------

  v_order_number :=
    'SC-' ||
    to_char(now(), 'YYYYMMDD') ||
    '-' ||
    upper(substr(
      replace(gen_random_uuid()::text, '-', ''),
      1,
      4
    ));


  -- ----------------------------------------------------------
  -- Create order
  -- ----------------------------------------------------------

  insert into public.orders (
    user_id,
    order_number,
    order_type,
    status,
    subtotal,
    shipping_amount,
    discount_amount,
    total_amount,
    payment_status,
    payment_method,
    shipping_name,
    shipping_phone,
    shipping_address,
    shipping_city,
    shipping_state,
    shipping_pincode
  )
  values (
    null,
    v_order_number,
    'retail',
    'pending',
    v_subtotal,
    v_shipping_amount,
    0,
    v_total_amount,
    'pending',
    'cod',
    p_customer_name,
    p_mobile,
    p_address,
    p_city,
    p_state,
    p_pincode
  )
  returning id
  into v_order_id;


  -- ----------------------------------------------------------
  -- Create order items
  -- ----------------------------------------------------------

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop

    v_product_id :=
      (v_item ->> 'product_id')::uuid;

    v_quantity :=
      (v_item ->> 'quantity')::integer;


    select
      name,
      sku,
      retail_price
    into
      v_product_name,
      v_product_sku,
      v_product_price
    from public.products
    where id = v_product_id;


    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      sku,
      quantity,
      unit_price,
      total_price
    )
    values (
      v_order_id,
      v_product_id,
      v_product_name,
      v_product_sku,
      v_quantity,
      v_product_price,
      v_product_price * v_quantity
    );

  end loop;


  -- ----------------------------------------------------------
  -- Return order information
  -- ----------------------------------------------------------

  return query
  select
    v_order_id,
    v_order_number,
    v_subtotal,
    v_shipping_amount,
    v_total_amount;

end;
$$;


-- ============================================================
-- Allow public/guest customers to call the function
-- ============================================================

grant execute
on function public.create_guest_order(
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
)
to anon, authenticated;