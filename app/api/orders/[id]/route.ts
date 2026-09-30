import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const { searchParams } = new URL(request.url);

    const mobile =
      searchParams.get("mobile")?.replace(/\D/g, "") || "";

    if (!id) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        {
          error:
            "Valid 10-digit mobile number is required.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    /* ---------------------------------------------
       Get retail order
       Mobile number must match the order.
    --------------------------------------------- */

    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          order_type,
          status,
          payment_status,
          payment_method,
          subtotal,
          shipping_amount,
          discount_amount,
          total_amount,
          shipping_name,
          shipping_phone,
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_pincode,
          created_at,
          updated_at
        `)
        .eq("id", id)
        .eq("order_type", "retail")
        .eq("shipping_phone", mobile)
        .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          error:
            "Order not found or mobile number does not match.",
        },
        { status: 404 }
      );
    }

    /* ---------------------------------------------
       Get order items
    --------------------------------------------- */

    const { data: items, error: itemsError } =
      await supabase
        .from("order_items")
        .select(`
          id,
          order_id,
          product_id,
          product_name,
          sku,
          quantity,
          unit_price,
          total_price,
          created_at
        `)
        .eq("order_id", id)
        .order("created_at", {
          ascending: true,
        });

    if (itemsError) {
      console.error(
        "Retail order items fetch error:",
        itemsError
      );

      return NextResponse.json(
        {
          error: "Unable to load order items.",
        },
        { status: 500 }
      );
    }

    /* ---------------------------------------------
       Get original product images
       
       product_id is stored in order_items.
       image_url is the primary product image.
    --------------------------------------------- */

    const productIds = [
      ...new Set(
        (items || [])
          .map((item) => item.product_id)
          .filter(
            (productId): productId is string =>
              Boolean(productId)
          )
      ),
    ];

    let products: Array<{
      id: string;
      image_url: string | null;
    }> = [];

    if (productIds.length > 0) {
      const {
        data: productData,
        error: productsError,
      } = await supabase
        .from("products")
        .select(`
          id,
          image_url
        `)
        .in("id", productIds);

      if (productsError) {
        console.error(
          "Retail order product images fetch error:",
          productsError
        );

        return NextResponse.json(
          {
            error:
              "Unable to load product images.",
          },
          { status: 500 }
        );
      }

      products = productData || [];
    }

    /* ---------------------------------------------
       Create product image lookup
    --------------------------------------------- */

    const productImageMap = new Map<
      string,
      string | null
    >();

    for (const product of products) {
      productImageMap.set(
        product.id,
        product.image_url || null
      );
    }

    /* ---------------------------------------------
       Attach image_url to order items
       
       Keep all existing order item fields.
    --------------------------------------------- */

    const itemsWithImages = (items || []).map(
      (item) => ({
        ...item,
        image_url: item.product_id
          ? productImageMap.get(item.product_id) || null
          : null,
      })
    );

    return NextResponse.json({
      order,
      items: itemsWithImages,
    });
  } catch (error) {
    console.error(
      "Retail order API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while loading the order.",
      },
      { status: 500 }
    );
  }
}