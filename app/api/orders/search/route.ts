import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const orderNumber =
      searchParams
        .get("order_number")
        ?.trim()
        .toUpperCase() || "";

    const mobile =
      searchParams.get("mobile")?.replace(/\D/g, "") || "";

    /* ======================================================
       Validate order number
    ====================================================== */

    if (!orderNumber) {
      return NextResponse.json(
        {
          error: "Order number is required.",
        },
        { status: 400 }
      );
    }

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
       Find retail order by order number
    ====================================================== */

    const {
      data: order,
      error,
    } = await supabase
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
        shipping_city,
        shipping_state,
        created_at
      `)
      .eq("order_number", orderNumber)
      .eq("order_type", "retail")
      .single();

    /* ======================================================
       Order not found
    ====================================================== */

    if (error || !order) {
      return NextResponse.json(
        {
          error:
            "Order not found. Please check your order number and mobile number.",
        },
        { status: 404 }
      );
    }

    /* ======================================================
       Verify mobile number
       
       Compare the last 10 digits so these formats work:
       
       9876543210
       919876543210
       +919876543210
       +91 9876543210
    ====================================================== */

    const storedMobile = String(
      order.shipping_phone || ""
    ).replace(/\D/g, "");

    const normalizedStoredMobile =
      storedMobile.length >= 10
        ? storedMobile.slice(-10)
        : storedMobile;

    if (normalizedStoredMobile !== mobile) {
      return NextResponse.json(
        {
          error:
            "Order not found. Please check your order number and mobile number.",
        },
        { status: 404 }
      );
    }

    /* ======================================================
       Return order
    ====================================================== */

    return NextResponse.json({
      order,
    });
  } catch (error) {
    console.error(
      "Order search API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to find your order.",
      },
      { status: 500 }
    );
  }
}