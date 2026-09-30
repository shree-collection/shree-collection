import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const shopName = String(body.shopName || "").trim();
    const ownerName = String(body.ownerName || "").trim();
    const phone = String(body.phone || "").trim();
    const gstNumber = String(body.gstNumber || "")
      .trim()
      .toUpperCase();
    const address = String(body.address || "").trim();
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const pincode = String(body.pincode || "").trim();

    if (!shopName) {
      return NextResponse.json(
        { error: "Shop name is required." },
        { status: 400 }
      );
    }

    if (!ownerName) {
      return NextResponse.json(
        { error: "Owner name is required." },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: "Shop address is required." },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        { error: "City is required." },
        { status: 400 }
      );
    }

    if (!state) {
      return NextResponse.json(
        { error: "State is required." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit pincode." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "register_wholesale_shop",
      {
        p_shop_name: shopName,
        p_owner_name: ownerName,
        p_phone: phone,
        p_gst_number: gstNumber,
        p_address: address,
        p_city: city,
        p_state: state,
        p_pincode: pincode,
      }
    );

    if (error) {
      console.error(
        "Wholesale registration RPC error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Wholesale registration submitted successfully.",
        shop: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Wholesale registration error:",
      error
    );

    return NextResponse.json(
      {
        error: "Invalid registration request.",
      },
      { status: 400 }
    );
  }
}