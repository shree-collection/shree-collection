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
        {
          status: 401,
        }
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
        {
          status: 403,
        }
      );
    }

    // Load retail orders and products in parallel
    const [ordersResult, productsResult] =
      await Promise.all([
        supabase
          .from("orders")
          .select(
            `
              id,
              order_number,
              order_type,
              status,
              total_amount,
              shipping_name,
              created_at
            `
          )
          .eq("order_type", "retail")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("products")
          .select(
            `
              id,
              name,
              sku,
              stock_quantity,
              retail_price,
              is_active
            `
          )
          .order("stock_quantity", {
            ascending: true,
          }),
      ]);

    if (ordersResult.error) {
      throw new Error(
        ordersResult.error.message
      );
    }

    if (productsResult.error) {
      throw new Error(
        productsResult.error.message
      );
    }

    const orders = ordersResult.data || [];
    const products = productsResult.data || [];

    /*
     * Sales
     *
     * Cancelled orders should not be included
     * in sales.
     */
    const validSalesOrders = orders.filter(
      (order) => order.status !== "cancelled"
    );

    const totalSales = validSalesOrders.reduce(
      (sum, order) =>
        sum + (Number(order.total_amount) || 0),
      0
    );

    /*
     * Pending retail orders
     */
    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;

    /*
     * Low-stock products
     *
     * Only active products with 5 or fewer
     * units remaining.
     */
    const lowStockProducts = products.filter(
      (product) =>
        product.is_active &&
        Number(product.stock_quantity) <= 5
    );

    /*
     * Latest 8 retail orders
     */
    const recentOrders = orders.slice(0, 8);

    return NextResponse.json({
      summary: {
        totalSales,
        totalOrders: orders.length,
        pendingOrders,
        totalProducts: products.length,
        activeProducts: products.filter(
          (product) => product.is_active
        ).length,
      },

      lowStockProducts,

      recentOrders,
    });
  } catch (error) {
    console.error(
      "Dashboard API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load dashboard.",
      },
      {
        status: 500,
      }
    );
  }
}