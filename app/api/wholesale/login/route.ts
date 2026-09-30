import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function hash(value: string) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const phone = String(body.phone || "").trim();

    const accessCode = String(body.accessCode || "")
      .trim()
      .toUpperCase();

    console.log("Wholesale login attempt:", {
      phone,
      hasAccessCode: Boolean(accessCode),
    });

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid 10-digit mobile number.",
        },
        { status: 400 }
      );
    }

    if (!/^SC-\d{6}$/.test(accessCode)) {
      return NextResponse.json(
        {
          error:
            "Invalid access code format. Example: SC-123456",
        },
        { status: 400 }
      );
    }

    const sessionToken = crypto
      .randomBytes(32)
      .toString("hex");

    const expiresAt = new Date(
      Date.now() +
        30 * 24 * 60 * 60 * 1000
    );

    console.log("Creating Supabase admin client...");

    const supabase = createAdminClient();

    console.log("Calling wholesale session RPC...");

    const { data, error } =
      await supabase.rpc(
        "create_wholesale_session",
        {
          p_phone: phone,
          p_access_code_hash:
            hash(accessCode),
          p_token_hash:
            hash(sessionToken),
          p_expires_at:
            expiresAt.toISOString(),
        }
      );

    if (error) {
      console.error(
        "Wholesale RPC error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Wholesale database error: " +
            error.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "Wholesale RPC response:",
      data
    );

    const shop = data?.[0];

    if (!shop) {
      return NextResponse.json(
        {
          error:
            "Invalid mobile number or access code.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      message: "Login successful.",
      shop: {
        id: shop.shop_id,
        shopName: shop.shop_name,
        ownerName: shop.owner_name,
      },
    });

    response.cookies.set(
      "wholesale_session",
      sessionToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "WHOLESALE LOGIN CATCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown wholesale login error.",
      },
      { status: 500 }
    );
  }
}