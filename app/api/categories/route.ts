import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from("categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        image_url,
        parent_id,
        sort_order
        `
      )
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Public categories query error:",
        error
      );

      return NextResponse.json(
        {
          error: "Unable to load categories.",
        },
        {
          status: 500,
        }
      );
    }

    const allCategories = categories || [];

    /*
     * Main categories
     *
     * parent_id = null means this is a top-level
     * shopping category.
     */
    const mainCategories = allCategories
      .filter(
        (category) => category.parent_id === null
      )
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }

        return a.name.localeCompare(b.name);
      });

    /*
     * Subcategories
     *
     * parent_id contains the ID of the main category.
     */
    const subcategories = allCategories
      .filter(
        (category) => category.parent_id !== null
      )
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }

        return a.name.localeCompare(b.name);
      });

    return NextResponse.json(
      {
        categories: allCategories,
        mainCategories,
        subcategories,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Public categories API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load categories.",
      },
      {
        status: 500,
      }
    );
  }
}