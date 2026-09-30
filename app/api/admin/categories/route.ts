import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    const {
      name,
      slug,
      description,
      image_url,
      parent_id,
      is_active,
      sort_order,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    if (!slug?.trim()) {
      return NextResponse.json(
        { error: "Slug is required." },
        { status: 400 }
      );
    }

    // Check duplicate slug
    const { data: existingCategory, error: checkError } =
      await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug.trim())
        .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { error: checkError.message },
        { status: 500 }
      );
    }

    if (existingCategory) {
      return NextResponse.json(
        {
          error:
            "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    // If parent is provided, make sure it exists
    if (parent_id) {
      const { data: parentCategory, error: parentError } =
        await supabase
          .from("categories")
          .select("id, parent_id")
          .eq("id", parent_id)
          .maybeSingle();

      if (parentError) {
        return NextResponse.json(
          { error: parentError.message },
          { status: 500 }
        );
      }

      if (!parentCategory) {
        return NextResponse.json(
          { error: "Parent category not found." },
          { status: 400 }
        );
      }

      // Prevent more than two levels:
      // Category → Subcategory
      if (parentCategory.parent_id !== null) {
        return NextResponse.json(
          {
            error:
              "A subcategory cannot have another subcategory.",
          },
          { status: 400 }
        );
      }
    }

    const { data: category, error: insertError } =
      await supabase
        .from("categories")
        .insert({
          name: name.trim(),
          slug: slug.trim(),
          description:
            description?.trim() || null,
          image_url:
            image_url?.trim() || null,
          parent_id: parent_id || null,
          is_active:
            typeof is_active === "boolean"
              ? is_active
              : true,
          sort_order:
            Number.isFinite(Number(sort_order))
              ? Number(sort_order)
              : 0,
        })
        .select()
        .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create category error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create category.",
      },
      { status: 500 }
    );
  }
}