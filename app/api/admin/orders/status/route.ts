import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof ALLOWED_STATUSES)[number];

export async function POST(request: Request) {
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
          error: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const orderId = body.orderId;
    const newStatus = body.status as OrderStatus;

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        {
          error: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    // Get current order
    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .select("id, status")
        .eq("id", orderId)
        .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    // Nothing to change
    if (order.status === newStatus) {
      return NextResponse.json({
        success: true,
        message: "Order status is already set.",
      });
    }

    /*
     * If an order is being cancelled,
     * restore the purchased stock.
     *
     * We only restore stock when moving INTO
     * cancelled status, so stock isn't restored
     * multiple times.
     */
    if (
      newStatus === "cancelled" &&
      order.status !== "cancelled"
    ) {
      const {
        data: items,
        error: itemsError,
      } = await supabase
        .from("order_items")
        .select(
          "product_id, quantity"
        )
        .eq("order_id", orderId);

      if (itemsError) {
        console.error(
          "Order items error:",
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

      for (const item of items || []) {
        if (!item.product_id) {
          continue;
        }

        const {
          data: product,
          error: productError,
        } = await supabase
          .from("products")
          .select(
            "id, stock_quantity"
          )
          .eq("id", item.product_id)
          .single();

        if (productError || !product) {
          console.error(
            "Product not found while restoring stock:",
            item.product_id
          );

          continue;
        }

        const newStock =
          product.stock_quantity +
          item.quantity;

        const {
          error: updateStockError,
        } = await supabase
          .from("products")
          .update({
            stock_quantity: newStock,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", item.product_id);

        if (updateStockError) {
          console.error(
            "Stock restoration error:",
            updateStockError
          );

          return NextResponse.json(
            {
              error:
                "Unable to restore product stock.",
            },
            { status: 500 }
          );
        }
      }
    }

    // Update order status
    const { data: updatedOrder, error } =
      await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

    if (error) {
      console.error(
        "Order status update error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Order status API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update order status.",
      },
      { status: 500 }
    );
  }
}