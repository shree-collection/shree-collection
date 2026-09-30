import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
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

    /*
     * Load RETAIL orders only.
     *
     * Cancelled orders are excluded from customer
     * order count and total order value.
     */
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        order_number,
        order_type,
        status,
        total_amount,
        shipping_name,
        shipping_phone,
        shipping_city,
        created_at
        `
      )
      .eq("order_type", "retail")
      .neq("status", "cancelled")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Customers query error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    const customerMap = new Map<
      string,
      {
        customerKey: string;
        name: string;
        phone: string;
        city: string;
        orders: number;
        totalAmount: number;
        lastOrderDate: string;
      }
    >();

    for (const order of orders || []) {
      const phone =
        order.shipping_phone?.trim() || "";

      /*
       * Prefer mobile number as the customer key.
       * This works well for guest checkout because
       * the same customer can place multiple orders.
       */
      const customerKey =
        phone ||
        order.user_id ||
        order.id;

      const existing =
        customerMap.get(customerKey);

      const orderAmount =
        Number(order.total_amount) || 0;

      if (existing) {
        existing.orders += 1;
        existing.totalAmount += orderAmount;

        /*
         * Keep the latest customer information.
         */
        if (
          new Date(order.created_at).getTime() >
          new Date(
            existing.lastOrderDate
          ).getTime()
        ) {
          existing.lastOrderDate =
            order.created_at;

          if (order.shipping_name) {
            existing.name =
              order.shipping_name;
          }

          if (order.shipping_city) {
            existing.city =
              order.shipping_city;
          }
        }
      } else {
        customerMap.set(customerKey, {
          customerKey,

          name:
            order.shipping_name ||
            "Guest Customer",

          phone:
            order.shipping_phone ||
            "-",

          city:
            order.shipping_city ||
            "-",

          orders: 1,

          totalAmount: orderAmount,

          lastOrderDate:
            order.created_at,
        });
      }
    }

    /*
     * Latest customers first.
     */
    const customers = Array.from(
      customerMap.values()
    ).sort(
      (a, b) =>
        new Date(
          b.lastOrderDate
        ).getTime() -
        new Date(
          a.lastOrderDate
        ).getTime()
    );

    return NextResponse.json({
      customers,
    });
  } catch (error) {
    console.error(
      "Customers API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load customers.",
      },
      { status: 500 }
    );
  }
}