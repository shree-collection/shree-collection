import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ProductImageInput = {
  imageUrl: string;
  sortOrder?: number;
  isPrimary?: boolean;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // --------------------------------------------------------
    // Check logged-in user
    // --------------------------------------------------------

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------------
    // Check admin
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
        {
          status: 403,
        }
      );
    }

    // --------------------------------------------------------
    // Admin client
    // --------------------------------------------------------

    const adminSupabase = createAdminClient();

    // --------------------------------------------------------
    // Read request
    // --------------------------------------------------------

    const body = await request.json();

    const name = String(body.name || "").trim();

    const slug = String(body.slug || "").trim();

    const sku = String(body.sku || "").trim();

    const description = String(
      body.description || ""
    ).trim();

    const categoryId =
      body.categoryId || null;

    const retailPrice = Number(
      body.retailPrice
    );

    const compareAtPrice =
      body.compareAtPrice === "" ||
      body.compareAtPrice === null ||
      body.compareAtPrice === undefined
        ? null
        : Number(body.compareAtPrice);

    const wholesalePrice =
      body.wholesalePrice === "" ||
      body.wholesalePrice === null ||
      body.wholesalePrice === undefined
        ? null
        : Number(body.wholesalePrice);

    const minimumWholesaleQuantity =
      body.minimumWholesaleQuantity === "" ||
      body.minimumWholesaleQuantity === null ||
      body.minimumWholesaleQuantity === undefined
        ? 6
        : Number(body.minimumWholesaleQuantity);

    const stockQuantity = Number(
      body.stockQuantity
    );

    // --------------------------------------------------------
    // Primary / backward-compatible image
    // --------------------------------------------------------

    const imageUrl =
      String(body.imageUrl || "").trim() || null;

    // --------------------------------------------------------
    // Multiple product images
    // --------------------------------------------------------

    const rawImages = Array.isArray(body.images)
      ? body.images
      : [];

    const images: ProductImageInput[] = rawImages
      .filter(
        (
          image: unknown
        ): image is ProductImageInput => {
          if (
            !image ||
            typeof image !== "object"
          ) {
            return false;
          }

          const item =
            image as ProductImageInput;

          return (
            typeof item.imageUrl === "string" &&
            item.imageUrl.trim().length > 0
          );
        }
      )
      .map((image: ProductImageInput) => ({
        imageUrl: image.imageUrl.trim(),
        sortOrder:
          Number.isInteger(image.sortOrder) &&
          Number(image.sortOrder) >= 0
            ? Number(image.sortOrder)
            : 0,
        isPrimary:
          image.isPrimary === true,
      }))
      .slice(0, 10);

    // --------------------------------------------------------
    // Ensure first image is primary
    // --------------------------------------------------------

    if (images.length > 0) {
      images.forEach((image, index) => {
        image.sortOrder = index;
        image.isPrimary = index === 0;
      });
    }

    const isActive =
      body.isActive !== false;

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!name) {
      return NextResponse.json(
        {
          error: "Product name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          error: "Product slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(retailPrice) ||
      retailPrice <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Retail price must be greater than 0.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      compareAtPrice !== null &&
      (!Number.isFinite(compareAtPrice) ||
        compareAtPrice <= 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Compare-at price must be greater than 0.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // Validate wholesale pricing
    // --------------------------------------------------------

    if (
      wholesalePrice !== null &&
      (!Number.isFinite(wholesalePrice) ||
        wholesalePrice <= 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Wholesale price must be greater than 0.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      wholesalePrice !== null &&
      wholesalePrice >= retailPrice
    ) {
      return NextResponse.json(
        {
          error:
            "Wholesale price must be lower than the retail price.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        minimumWholesaleQuantity
      ) ||
      minimumWholesaleQuantity < 1
    ) {
      return NextResponse.json(
        {
          error:
            "Minimum wholesale quantity must be at least 1.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Stock quantity must be 0 or greater.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // Create product
    // --------------------------------------------------------

    const { data: product, error } =
      await adminSupabase
        .from("products")
        .insert({
          name,
          slug,
          sku: sku || null,
          description: description || null,
          category_id: categoryId,
          retail_price: retailPrice,
          compare_at_price: compareAtPrice,
          stock_quantity: stockQuantity,

          // Keep the existing primary image column.
          image_url: imageUrl,

          is_active: isActive,
        })
        .select(`
          id,
          name,
          slug,
          sku,
          retail_price,
          stock_quantity,
          is_active
        `)
        .single();

    if (error) {
      console.error(
        "Product creation error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------------
    // Save product images
    // --------------------------------------------------------

    if (images.length > 0) {
      const imageRows = images.map(
        (image: ProductImageInput, index) => ({
          product_id: product.id,
          image_url: image.imageUrl,
          sort_order: index,
          is_primary: index === 0,
        })
      );

      const {
        error: imagesError,
      } = await adminSupabase
        .from("product_images")
        .insert(imageRows);

      if (imagesError) {
        console.error(
          "Product images creation error:",
          imagesError
        );

        // Remove product.
        // Wholesale pricing has not been created yet.
        await adminSupabase
          .from("products")
          .delete()
          .eq("id", product.id);

        return NextResponse.json(
          {
            error:
              "Product was not created because product images could not be saved.",
            details:
              imagesError.message,
          },
          {
            status: 500,
          }
        );
      }
    }

    // --------------------------------------------------------
    // Create wholesale pricing
    // --------------------------------------------------------

    if (wholesalePrice !== null) {
      const {
        error: wholesalePriceError,
      } = await adminSupabase
        .from("wholesale_prices")
        .insert({
          product_id: product.id,
          price: wholesalePrice,
          minimum_quantity:
            minimumWholesaleQuantity,
        });

      if (wholesalePriceError) {
        console.error(
          "Wholesale price creation error:",
          wholesalePriceError
        );

        // Delete product.
        // product_images will also be deleted because
        // product_id references products with ON DELETE CASCADE.
        await adminSupabase
          .from("products")
          .delete()
          .eq("id", product.id);

        return NextResponse.json(
          {
            error:
              "Product was not created because wholesale pricing could not be saved.",
            details:
              wholesalePriceError.message,
          },
          {
            status: 500,
          }
        );
      }
    }

    // --------------------------------------------------------
    // Success
    // --------------------------------------------------------

    return NextResponse.json({
      success: true,

      product,

      images: images.map(
        (image: ProductImageInput, index) => ({
          imageUrl: image.imageUrl,
          sortOrder: index,
          isPrimary: index === 0,
        })
      ),

      wholesale:
        wholesalePrice !== null
          ? {
              price: wholesalePrice,
              minimumQuantity:
                minimumWholesaleQuantity,
            }
          : null,
    });
  } catch (error) {
    console.error(
      "Admin product API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}