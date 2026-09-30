import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      authorized: false as const,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    !profile ||
    profile.user_type !== "admin"
  ) {
    return {
      supabase,
      authorized: false as const,
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return {
    supabase,
    authorized: true as const,
  };
}

function generateAccessCode() {
  return `SC-${crypto
    .randomInt(100000, 1000000)
    .toString()}`;
}

function hashAccessCode(code: string) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}

/**
 * GET
 * Fetch wholesale shops for admin.
 */
export async function GET(request: Request) {
  const adminCheck = await checkAdmin();

  if (!adminCheck.authorized) {
    return adminCheck.response;
  }

  const { supabase } = adminCheck;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";

  let query = supabase
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
    .order("created_at", {
      ascending: false,
    });

  if (
    status === "pending" ||
    status === "approved" ||
    status === "blocked"
  ) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      "Wholesale shops fetch error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load wholesale shops.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    shops: data || [],
  });
}

/**
 * PATCH
 * Approve / block / move wholesale shop to pending.
 */
export async function PATCH(request: Request) {
  const adminCheck = await checkAdmin();

  if (!adminCheck.authorized) {
    return adminCheck.response;
  }

  const { supabase } = adminCheck;

  try {
    const body = await request.json();

    const shopId = body.shopId;
    const status = body.status;

    if (!shopId) {
      return NextResponse.json(
        {
          error: "Shop ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      !["pending", "approved", "blocked"].includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid shop status.",
        },
        { status: 400 }
      );
    }

    const { data: shop, error: shopError } =
      await supabase
        .from("wholesale_shops")
        .select(
          "id, shop_name, phone, status"
        )
        .eq("id", shopId)
        .single();

    if (shopError || !shop) {
      return NextResponse.json(
        {
          error: "Wholesale shop not found.",
        },
        { status: 404 }
      );
    }

    /**
     * APPROVE
     *
     * Generate a new access code.
     * Store both the recoverable code and
     * the SHA-256 hash used for login.
     */
    if (status === "approved") {
      const accessCode =
        generateAccessCode();

      const accessCodeHash =
        hashAccessCode(accessCode);

      const { data: updatedShop, error } =
        await supabase
          .from("wholesale_shops")
          .update({
            status: "approved",

            // Recoverable access code for admin
            access_code: accessCode,

            // Hash used for login verification
            access_code_hash: accessCodeHash,

            access_code_created_at:
              new Date().toISOString(),

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", shopId)
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
            status,
            access_code,
            access_code_created_at,
            created_at,
            updated_at
          `)
          .single();

      if (error) {
        console.error(
          "Wholesale shop approval error:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Unable to approve wholesale shop.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message:
          "Wholesale shop approved successfully.",

        shop: updatedShop,

        // Also return it immediately so UI
        // can display the newly generated code.
        accessCode,
      });
    }

    /**
     * BLOCK
     *
     * Remove the access code so the old
     * credentials cannot be used.
     */
    if (status === "blocked") {
      const { data: updatedShop, error } =
        await supabase
          .from("wholesale_shops")
          .update({
            status: "blocked",

            access_code: null,
            access_code_hash: null,
            access_code_created_at: null,

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", shopId)
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
            status,
            access_code,
            access_code_created_at,
            created_at,
            updated_at
          `)
          .single();

      if (error) {
        console.error(
          "Wholesale shop block error:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Unable to block wholesale shop.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message:
          "Wholesale shop blocked successfully.",
        shop: updatedShop,
      });
    }

    /**
     * PENDING
     *
     * Remove existing credentials.
     * A new access code will be generated
     * when the shop is approved again.
     */
    const { data: updatedShop, error } =
      await supabase
        .from("wholesale_shops")
        .update({
          status: "pending",

          access_code: null,
          access_code_hash: null,
          access_code_created_at: null,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", shopId)
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
          status,
          access_code,
          access_code_created_at,
          created_at,
          updated_at
        `)
        .single();

    if (error) {
      console.error(
        "Wholesale shop status update error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to update wholesale shop.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Wholesale shop moved to pending.",
      shop: updatedShop,
    });
  } catch (error) {
    console.error(
      "Wholesale shop PATCH error:",
      error
    );

    return NextResponse.json(
      {
        error: "Invalid request.",
      },
      { status: 400 }
    );
  }
}