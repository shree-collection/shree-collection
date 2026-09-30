import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.user_type !== "admin") {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
  };
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const adminCheck = await checkAdmin();

  if (!adminCheck.authorized) {
    return adminCheck.response;
  }

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Shop ID is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: shop, error: shopError } = await supabase
      .from("wholesale_shops")
      .select(`
        id,
        user_id,
        shop_name,
        owner_name,
        phone,
        address,
        city,
        state,
        pincode,
        gst_number,
        status,
        access_code,
        access_code_created_at,
        created_at,
        updated_at
      `)
      .eq("id", id)
      .single();

    if (shopError || !shop) {
      return NextResponse.json(
        { error: "Wholesale shop not found." },
        { status: 404 }
      );
    }

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        subtotal,
        total_amount,
        payment_status,
        created_at
      `)
      .eq("order_type", "wholesale")
      .eq("shipping_phone", shop.phone)
      .order("created_at", {
        ascending: false,
      });

    if (ordersError) {
      console.error(
        "Wholesale shop orders fetch error:",
        ordersError
      );
    }

    return NextResponse.json({
      shop,
      orders: orders || [],
    });
  } catch (error) {
    console.error(
      "Wholesale shop details error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load wholesale shop.",
      },
      { status: 500 }
    );
  }
}