import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getWholesaleSession } from "@/lib/wholesale/session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    /* --------------------------------
       Verify Wholesale Session
    -------------------------------- */

    const session =
      await getWholesaleSession();

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Wholesale login required.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const supabase =
      createAdminClient();

    /* --------------------------------
       Get Wholesale Order
       Only return orders belonging
       to the logged-in shop/mobile.
    -------------------------------- */

    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .select(`
          id,
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
          shipping_pincode,
          created_at,
          updated_at
        `)
        .eq("id", id)
        .eq("order_type", "wholesale")
        .eq("shipping_phone", session.phone)
        .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          error:
            "Wholesale order not found.",
        },
        { status: 404 }
      );
    }

    /* --------------------------------
       Get Order Items
    -------------------------------- */

    const {
      data: items,
      error: itemsError,
    } = await supabase
      .from("order_items")
      .select(`
        id,
        product_id,
        product_name,
        sku,
        quantity,
        unit_price,
        total_price
      `)
      .eq("order_id", id)
      .order("created_at", {
        ascending: true,
      });

    if (itemsError) {
      console.error(
        "Wholesale customer order items error:",
        itemsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load order items.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: items || [],
      },
    });
  } catch (error) {
    console.error(
      "Wholesale customer order GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load wholesale order.",
      },
      { status: 500 }
    );
  }
}