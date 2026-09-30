import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const mobile =
      searchParams.get("mobile")?.replace(/\D/g, "") || "";

    /* ======================================================
       Validate mobile number
    ====================================================== */

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

    /* ======================================================
       Find all retail orders for this mobile number
       Most recent orders first.
    ====================================================== */

    const { data: orders, error } = await supabase
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
        total_amount,
        shipping_name,
        shipping_phone,
        shipping_city,
        shipping_state,
        created_at
      `)
      .eq("shipping_phone", mobile)
      .eq("order_type", "retail")
      .order("created_at", {
        ascending: false,
      });

    /* ======================================================
       Database error
    ====================================================== */

    if (error) {
      console.error(
        "Order lookup API error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to find your orders. Please try again.",
        },
        { status: 500 }
      );
    }

    /* ======================================================
       No orders found
    ====================================================== */

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        {
          orders: [],
          message:
            "No orders were found for this mobile number.",
        },
        { status: 200 }
      );
    }

    /* ======================================================
       Return orders
    ====================================================== */

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    console.error(
      "Unexpected order lookup error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to find your orders. Please try again.",
      },
      { status: 500 }
    );
  }
}