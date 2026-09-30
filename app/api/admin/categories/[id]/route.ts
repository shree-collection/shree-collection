import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const supabase = await createClient();

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

    // Prevent duplicate slug
    const { data: existing, error: checkError } =
      await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug.trim())
        .neq("id", id)
        .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { error: checkError.message },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Another category already uses this slug.",
        },
        { status: 409 }
      );
    }

    // Validate parent
    if (parent_id) {
      if (parent_id === id) {
        return NextResponse.json(
          {
            error:
              "A category cannot be its own parent.",
          },
          { status: 400 }
        );
      }

      const { data: parent } = await supabase
        .from("categories")
        .select("id, parent_id")
        .eq("id", parent_id)
        .maybeSingle();

      if (!parent) {
        return NextResponse.json(
          { error: "Parent category not found." },
          { status: 400 }
        );
      }

      if (parent.parent_id !== null) {
        return NextResponse.json(
          {
            error:
              "Only main categories can be selected as a parent.",
          },
          { status: 400 }
        );
      }
    }

    const { data: category, error } =
      await supabase
        .from("categories")
        .update({
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
            Number(sort_order) || 0,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update category.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const supabase = await createClient();

    // Don't delete if products use this category
    const { count: productCount } =
      await supabase
        .from("products")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("category_id", id);

    if ((productCount || 0) > 0) {
      return NextResponse.json(
        {
          error:
            "This category has products assigned to it. Move or remove those products before deleting the category.",
        },
        { status: 400 }
      );
    }

    // Don't delete if subcategories exist
    const { count: childCount } =
      await supabase
        .from("categories")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("parent_id", id);

    if ((childCount || 0) > 0) {
      return NextResponse.json(
        {
          error:
            "This category has subcategories. Delete or move the subcategories first.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete category.",
      },
      { status: 500 }
    );
  }
}