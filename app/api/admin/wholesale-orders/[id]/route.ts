import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "admin") {
    return null;
  }

  return createAdminClient();
}

/* =========================================================
   GET - Wholesale Order Details
========================================================= */

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const supabase = await verifyAdmin();

    if (!supabase) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;

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
        .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          error: "Wholesale order not found.",
        },
        { status: 404 }
      );
    }

    const { data: items, error: itemsError } =
      await supabase
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
        "Wholesale order items error:",
        itemsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load wholesale order items.",
        },
        { status: 500 }
      );
    }

    const { data: shop } = await supabase
      .from("wholesale_shops")
      .select(`
        id,
        shop_name,
        owner_name,
        phone,
        address,
        city,
        state,
        pincode,
        gst_number,
        status
      `)
      .eq("phone", order.shipping_phone)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        shop: shop || null,
        items: items || [],
      },
      items: items || [],
    });
  } catch (error) {
    console.error(
      "Admin wholesale order GET error:",
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

/* =========================================================
   PATCH - Update Order / Payment Status
========================================================= */

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const supabase = await verifyAdmin();

    if (!supabase) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;

    let body: {
      status?: string;
      paymentStatus?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request data.",
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = {};

    /* --------------------------------
       Validate order status
    -------------------------------- */

    if (body.status !== undefined) {
      if (
        !ORDER_STATUSES.includes(
          body.status as (typeof ORDER_STATUSES)[number]
        )
      ) {
        return NextResponse.json(
          {
            error: "Invalid order status.",
          },
          { status: 400 }
        );
      }

      updateData.status = body.status;
    }

    /* --------------------------------
       Validate payment status
    -------------------------------- */

    if (body.paymentStatus !== undefined) {
      if (
        !PAYMENT_STATUSES.includes(
          body.paymentStatus as (typeof PAYMENT_STATUSES)[number]
        )
      ) {
        return NextResponse.json(
          {
            error: "Invalid payment status.",
          },
          { status: 400 }
        );
      }

      updateData.payment_status =
        body.paymentStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid order or payment status was provided.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------
       Verify wholesale order
    -------------------------------- */

    const { data: existingOrder, error: findError } =
      await supabase
        .from("orders")
        .select("id, order_number, order_type")
        .eq("id", id)
        .eq("order_type", "wholesale")
        .single();

    if (findError || !existingOrder) {
      return NextResponse.json(
        {
          error: "Wholesale order not found.",
        },
        { status: 404 }
      );
    }

    /* --------------------------------
       Update order
    -------------------------------- */

    updateData.updated_at =
      new Date().toISOString();

    const { data: updatedOrder, error: updateError } =
      await supabase
        .from("orders")
        .update(updateData)
        .eq("id", id)
        .select(`
          id,
          order_number,
          status,
          payment_status,
          updated_at
        `)
        .single();

    if (updateError || !updatedOrder) {
      console.error(
        "Wholesale order update error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            updateError?.message ||
            "Unable to update wholesale order.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Wholesale order updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Admin wholesale order PATCH error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update wholesale order.",
      },
      { status: 500 }
    );
  }
}