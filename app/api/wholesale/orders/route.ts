import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type CheckoutBody = {
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  items: CheckoutItem[];
};

function hash(value: string) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

/*
 * Basic UUID validation.
 *
 * Product IDs coming from the browser must be valid UUIDs
 * before they are passed to the database RPC.
 */
function isValidUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

/* =========================================================
   GET - Wholesale Order History
========================================================= */

export async function GET() {
  try {
    /* --------------------------------
       1. Get wholesale session
    -------------------------------- */

    const cookieStore = await cookies();

    const sessionToken =
      cookieStore.get("wholesale_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          error:
            "Your wholesale session has expired. Please login again.",
        },
        { status: 401 }
      );
    }

    /* --------------------------------
       2. Supabase admin client
    -------------------------------- */

    const supabase = createAdminClient();

    /* --------------------------------
       3. Verify wholesale session
    -------------------------------- */

    const tokenHash = hash(sessionToken);

    const {
      data: sessionData,
      error: sessionError,
    } = await supabase.rpc(
      "get_wholesale_session",
      {
        p_token_hash: tokenHash,
      }
    );

    if (sessionError) {
      console.error(
        "Wholesale session verification error:",
        sessionError
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify your wholesale session.",
        },
        { status: 500 }
      );
    }

    const shop = sessionData?.[0];

    if (!shop) {
      return NextResponse.json(
        {
          error:
            "Your wholesale session has expired. Please login again.",
        },
        { status: 401 }
      );
    }

    /* --------------------------------
       4. Get wholesale orders
    -------------------------------- */

    const {
      data: orders,
      error: ordersError,
    } = await supabase
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
      .eq("order_type", "wholesale")
      .eq("shipping_phone", shop.phone)
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
            "Unable to load your wholesale orders.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: orders ?? [],
    });
  } catch (error) {
    console.error(
      "Wholesale orders GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load wholesale orders.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST - Create Wholesale Order
========================================================= */

export async function POST(request: Request) {
  try {
    /* --------------------------------
       1. Get wholesale session
    -------------------------------- */

    const cookieStore = await cookies();

    const sessionToken =
      cookieStore.get("wholesale_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          error:
            "Your wholesale session has expired. Please login again.",
        },
        { status: 401 }
      );
    }

    /* --------------------------------
       2. Read request body
    -------------------------------- */

    let body: CheckoutBody;

    try {
      body = (await request.json()) as CheckoutBody;
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request data.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------
       3. Clean checkout information
    -------------------------------- */

    const shopName = String(
      body.shopName || ""
    ).trim();

    const ownerName = String(
      body.ownerName || ""
    ).trim();

    const phone = String(
      body.phone || ""
    ).trim();

    const address = String(
      body.address || ""
    ).trim();

    const city = String(
      body.city || ""
    ).trim();

    const state = String(
      body.state || ""
    ).trim();

    const pincode = String(
      body.pincode || ""
    ).trim();

    const gstNumber = String(
      body.gstNumber || ""
    ).trim().toUpperCase();

    const items = Array.isArray(body.items)
      ? body.items
      : [];

    /* --------------------------------
       4. Validate checkout information
    -------------------------------- */

    if (!shopName) {
      return NextResponse.json(
        {
          error: "Shop name is required.",
        },
        { status: 400 }
      );
    }

    if (shopName.length > 150) {
      return NextResponse.json(
        {
          error: "Shop name is too long.",
        },
        { status: 400 }
      );
    }

    if (!ownerName) {
      return NextResponse.json(
        {
          error: "Owner name is required.",
        },
        { status: 400 }
      );
    }

    if (ownerName.length > 150) {
      return NextResponse.json(
        {
          error: "Owner name is too long.",
        },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid 10-digit mobile number.",
        },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          error:
            "Delivery address is required.",
        },
        { status: 400 }
      );
    }

    if (address.length > 500) {
      return NextResponse.json(
        {
          error:
            "Delivery address is too long.",
        },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        {
          error: "City is required.",
        },
        { status: 400 }
      );
    }

    if (city.length > 100) {
      return NextResponse.json(
        {
          error: "City name is too long.",
        },
        { status: 400 }
      );
    }

    if (!state) {
      return NextResponse.json(
        {
          error: "State is required.",
        },
        { status: 400 }
      );
    }

    if (state.length > 100) {
      return NextResponse.json(
        {
          error: "State name is too long.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid 6-digit pincode.",
        },
        { status: 400 }
      );
    }

    /*
     * GST is optional.
     *
     * If supplied, validate the basic 15-character
     * GSTIN format.
     */
    if (
      gstNumber &&
      !/^[0-9A-Z]{15}$/.test(gstNumber)
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid GST number.",
        },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        {
          error:
            "Your wholesale cart is empty.",
        },
        { status: 400 }
      );
    }

    if (items.length > 100) {
      return NextResponse.json(
        {
          error:
            "Too many products in the wholesale cart.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------
       5. Clean and validate cart items
    -------------------------------- */

    const cleanItems: CheckoutItem[] = [];

    for (const item of items) {
      const productId = String(
        item?.productId || ""
      ).trim();

      const quantity = Number(
        item?.quantity
      );

      if (!productId || !isValidUUID(productId)) {
        return NextResponse.json(
          {
            error:
              "Invalid product in cart.",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid product quantity.",
          },
          { status: 400 }
        );
      }

      /*
       * Prevent unrealistic quantities from being
       * submitted directly through the API.
       *
       * The actual stock validation is still performed
       * by the database RPC.
       */
      if (quantity > 100000) {
        return NextResponse.json(
          {
            error:
              "Product quantity is too high.",
          },
          { status: 400 }
        );
      }

      cleanItems.push({
        productId,
        quantity,
      });
    }

    /* --------------------------------
       6. Combine duplicate products
    -------------------------------- */

    /*
     * A browser request could technically contain
     * the same product more than once.
     *
     * Combine those quantities before sending them
     * to the atomic order RPC.
     */
    const itemMap = new Map<
      string,
      number
    >();

    for (const item of cleanItems) {
      const existing =
        itemMap.get(item.productId) || 0;

      const combinedQuantity =
        existing + item.quantity;

      if (combinedQuantity > 100000) {
        return NextResponse.json(
          {
            error:
              "Product quantity is too high.",
          },
          { status: 400 }
        );
      }

      itemMap.set(
        item.productId,
        combinedQuantity
      );
    }

    const finalItems: CheckoutItem[] =
      Array.from(itemMap.entries()).map(
        ([productId, quantity]) => ({
          productId,
          quantity,
        })
      );

    /* --------------------------------
       7. Supabase admin client
    -------------------------------- */

    const supabase = createAdminClient();

    /* --------------------------------
       8. Verify wholesale session
    -------------------------------- */

    const tokenHash = hash(sessionToken);

    const {
      data: sessionData,
      error: sessionError,
    } = await supabase.rpc(
      "get_wholesale_session",
      {
        p_token_hash: tokenHash,
      }
    );

    if (sessionError) {
      console.error(
        "Wholesale session verification error:",
        sessionError
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify your wholesale session.",
        },
        { status: 500 }
      );
    }

    const shop = sessionData?.[0];

    if (!shop) {
      return NextResponse.json(
        {
          error:
            "Your wholesale session has expired. Please login again.",
        },
        { status: 401 }
      );
    }

    /* --------------------------------
       9. Verify wholesale shop status
    -------------------------------- */

    if (shop.status !== "approved") {
      return NextResponse.json(
        {
          error:
            "Your wholesale account is not approved for ordering.",
        },
        { status: 403 }
      );
    }

    /* --------------------------------
       10. Verify mobile number
    -------------------------------- */

    if (shop.phone !== phone) {
      return NextResponse.json(
        {
          error:
            "The mobile number does not match your wholesale account.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------
       11. Create atomic wholesale order
    -------------------------------- */

    /*
     * IMPORTANT:
     *
     * The server does NOT trust the price coming
     * from the browser.
     *
     * The create_wholesale_order RPC gets the
     * current wholesale price and MOQ from the
     * database and validates stock atomically.
     */
    const {
      data: orderData,
      error: orderError,
    } = await supabase.rpc(
      "create_wholesale_order",
      {
        p_shop_id: shop.shop_id,
        p_shop_name: shop.shop_name,
        p_owner_name: ownerName,
        p_phone: phone,
        p_address: address,
        p_city: city,
        p_state: state,
        p_pincode: pincode,
        p_items: finalItems.map(
          (item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })
        ),
      }
    );

    if (orderError) {
      console.error(
        "Wholesale order creation error:",
        orderError
      );

      /*
       * RPC errors can include:
       * - Product not found
       * - Product inactive
       * - Insufficient stock
       * - Wholesale price missing
       * - MOQ not satisfied
       * - Invalid shop
       *
       * Return the database message so the customer
       * receives the actual validation reason.
       */
      return NextResponse.json(
        {
          error:
            orderError.message ||
            "Unable to create wholesale order.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------
       12. Validate order response
    -------------------------------- */

    const order = orderData?.[0];

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Wholesale order could not be created.",
        },
        { status: 500 }
      );
    }

    /* --------------------------------
       13. Success
    -------------------------------- */

    return NextResponse.json({
      success: true,
      message:
        "Wholesale order created successfully.",
      order: {
        id: order.order_id,
        orderNumber:
          order.order_number,
        totalAmount: Number(
          order.total_amount
        ),
      },
    });
  } catch (error) {
    console.error(
      "Wholesale order API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create wholesale order.",
      },
      { status: 500 }
    );
  }
}