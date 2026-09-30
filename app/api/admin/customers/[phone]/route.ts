import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    phone: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { phone } = await params;

    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^\d{10}$/.test(cleanPhone)) {
      return NextResponse.json(
        {
          error: "Invalid customer mobile number.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized. Please login again.",
        },
        { status: 401 }
      );
    }

    // Check admin access
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
          error: "Admin access required.",
        },
        { status: 403 }
      );
    }

    // Get customer's retail orders
    const { data: orders, error: ordersError } =
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
        .eq("order_type", "retail")
        .eq("shipping_phone", cleanPhone)
        .neq("status", "cancelled")
        .order("created_at", {
          ascending: false,
        });

    if (ordersError) {
      console.error(
        "Customer orders error:",
        ordersError
      );

      return NextResponse.json(
        {
          error: ordersError.message,
        },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        {
          error: "Customer not found.",
        },
        { status: 404 }
      );
    }

    const latestOrder = orders[0];

    const customer = {
      name:
        latestOrder.shipping_name ||
        "Guest Customer",

      phone:
        latestOrder.shipping_phone ||
        cleanPhone,

      city:
        latestOrder.shipping_city ||
        "-",

      state:
        latestOrder.shipping_state ||
        "-",

      totalOrders: orders.length,

      totalSpent: orders.reduce(
        (sum, order) =>
          sum +
          (Number(order.total_amount) || 0),
        0
      ),

      lastOrderDate:
        latestOrder.created_at,
    };

    return NextResponse.json({
      customer,
      orders,
    });
  } catch (error) {
    console.error(
      "Customer details API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load customer details.",
      },
      { status: 500 }
    );
  }
}