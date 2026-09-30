import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    /*
     * Get the logged-in Supabase user
     */
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Verify admin user
     */
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

    if (profileError) {
      console.error(
        "Admin profile error:",
        profileError
      );

      return NextResponse.json(
        {
          error: "Unable to verify admin access.",
        },
        {
          status: 500,
        }
      );
    }

    if (profile?.user_type !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Use admin client to fetch wholesale orders
     */
    const adminClient =
      createAdminClient();

    const {
      data: orders,
      error: ordersError,
    } = await adminClient
      .from("orders")
      .select(`
        id,
        order_number,
        order_type,
        status,
        subtotal,
        total_amount,
        payment_status,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_pincode,
        created_at,
        updated_at
      `)
      .eq("order_type", "wholesale")
      .order("created_at", {
        ascending: false,
      });

    if (ordersError) {
      console.error(
        "Wholesale orders query error:",
        ordersError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load wholesale orders.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      orders: orders || [],
    });
  } catch (error) {
    console.error(
      "Wholesale orders API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load wholesale orders.",
      },
      {
        status: 500,
      }
    );
  }
}