import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteProps
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    // Check logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // Check admin
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

    if (
      profileError ||
      profile?.user_type !== "admin"
    ) {
      return NextResponse.json(
        {
          error: "Admin access required",
        },
        {
          status: 403,
        }
      );
    }

    // Get order
    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .select(`
          id,
          order_number,
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
        .eq("order_type", "retail")
        .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    // Get order items
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
      return NextResponse.json(
        {
          error: itemsError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      order,
      items: items || [],
    });
  } catch (error) {
    console.error(
      "Admin order API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}