import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // --------------------------------------------------------
    // Check logged-in user
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // Check admin access
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // Get categories
    // --------------------------------------------------------

    const {
      data: categories,
      error: categoriesError,
    } = await supabase
      .from("categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        image_url,
        parent_id,
        is_active,
        sort_order
        `
      )
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

    if (categoriesError) {
      console.error(
        "Categories query error:",
        categoriesError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load categories.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------------
    // Return categories
    // --------------------------------------------------------

    return NextResponse.json({
      categories: categories || [],
    });
  } catch (error) {
    console.error(
      "Categories API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load categories.",
      },
      { status: 500 }
    );
  }
}