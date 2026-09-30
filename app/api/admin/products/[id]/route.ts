import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ProductImageInput = {
  imageUrl: string;
  sortOrder?: number;
  isPrimary?: boolean;
};

async function checkAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      adminSupabase: null,
      response: NextResponse.json(
        {
          error:
            "Unauthorized. Please login again.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    profile?.user_type !== "admin"
  ) {
    return {
      supabase,
      adminSupabase: null,
      response: NextResponse.json(
        {
          error: "Admin access required.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    supabase,
    adminSupabase: createAdminClient(),
    response: null,
  };
}

/* =========================================================
   GET PRODUCT
========================================================= */

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const {
      adminSupabase,
      response,
    } = await checkAdmin();

    if (response) {
      return response;
    }

    if (!adminSupabase) {
      return NextResponse.json(
        {
          error:
            "Unable to initialize admin client.",
        },
        {
          status: 500,
        }
      );
    }

    const { id } = await params;

    // ----------------------------------------------------
    // Get product
    // ----------------------------------------------------

    const {
      data: product,
      error: productError,
    } = await adminSupabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        sku,
        description,
        retail_price,
        compare_at_price,
        stock_quantity,
        image_url,
        is_active,
        category_id,
        created_at,
        updated_at
      `)
      .eq("id", id)
      .single();

    if (
      productError ||
      !product
    ) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ----------------------------------------------------
    // Get product images
    // ----------------------------------------------------

    const {
      data: productImages,
      error: productImagesError,
    } = await adminSupabase
      .from("product_images")
      .select(`
        id,
        product_id,
        image_url,
        sort_order,
        is_primary,
        created_at
      `)
      .eq("product_id", id)
      .order("sort_order", {
        ascending: true,
      });

    if (productImagesError) {
      console.error(
        "Get product images error:",
        productImagesError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load product images.",
        },
        {
          status: 500,
        }
      );
    }

    // ----------------------------------------------------
    // Backward compatibility
    //
    // Old products may only have image_url and no
    // product_images rows.
    // ----------------------------------------------------

    let images =
      productImages || [];

    if (
      images.length === 0 &&
      product.image_url
    ) {
      images = [
        {
          id: undefined,
          product_id: product.id,
          image_url:
            product.image_url,
          sort_order: 0,
          is_primary: true,
          created_at: null,
        },
      ];
    }

    // ----------------------------------------------------
    // Get wholesale pricing
    // ----------------------------------------------------

    const {
      data: wholesalePrice,
      error: wholesalePriceError,
    } = await adminSupabase
      .from("wholesale_prices")
      .select(`
        id,
        product_id,
        price,
        minimum_quantity
      `)
      .eq("product_id", id)
      .maybeSingle();

    if (wholesalePriceError) {
      console.error(
        "Get wholesale pricing error:",
        wholesalePriceError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load wholesale pricing.",
        },
        {
          status: 500,
        }
      );
    }

    // ----------------------------------------------------
    // Return combined product
    // ----------------------------------------------------

    return NextResponse.json({
      product: {
        ...product,

        images,

        wholesale_price:
          wholesalePrice?.price ??
          null,

        minimum_wholesale_quantity:
          wholesalePrice?.minimum_quantity ??
          null,
      },

      images,
    });
  } catch (error) {
    console.error(
      "Get product API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load product.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PATCH PRODUCT
========================================================= */

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const {
      adminSupabase,
      response,
    } = await checkAdmin();

    if (response) {
      return response;
    }

    if (!adminSupabase) {
      return NextResponse.json(
        {
          error:
            "Unable to initialize admin client.",
        },
        {
          status: 500,
        }
      );
    }

    const { id } = await params;

    const body = await request.json();

    // ----------------------------------------------------
    // Read product fields
    // ----------------------------------------------------

    const name = String(
      body.name || ""
    ).trim();

    const slug = String(
      body.slug || ""
    ).trim();

    const sku = body.sku
      ? String(body.sku).trim()
      : null;

    const description =
      body.description
        ? String(
            body.description
          ).trim()
        : null;

    const categoryId =
      body.categoryId || null;

    const retailPrice = Number(
      body.retailPrice
    );

    const compareAtPrice =
      body.compareAtPrice === "" ||
      body.compareAtPrice === null ||
      body.compareAtPrice ===
        undefined
        ? null
        : Number(
            body.compareAtPrice
          );

    const stockQuantity = Number(
      body.stockQuantity
    );

    const imageUrl =
      body.imageUrl
        ? String(
            body.imageUrl
          ).trim()
        : null;

    const isActive =
      body.isActive !== false;

    // ----------------------------------------------------
    // Read wholesale fields
    // ----------------------------------------------------

    const wholesalePrice =
      body.wholesalePrice === "" ||
      body.wholesalePrice === null ||
      body.wholesalePrice ===
        undefined
        ? null
        : Number(
            body.wholesalePrice
          );

    const minimumWholesaleQuantity =
      body.minimumWholesaleQuantity ===
        "" ||
      body.minimumWholesaleQuantity ===
        null ||
      body.minimumWholesaleQuantity ===
        undefined
        ? 6
        : Number(
            body.minimumWholesaleQuantity
          );

    // ----------------------------------------------------
    // Read multiple images
    //
    // Only synchronize images when the request actually
    // contains an "images" array.
    // This keeps backward compatibility with other
    // PATCH requests.
    // ----------------------------------------------------

    const hasImagesPayload =
      Array.isArray(body.images);

    let images: ProductImageInput[] =
      [];

    if (hasImagesPayload) {
      images = body.images
        .filter(
          (
            image: unknown
          ): image is ProductImageInput => {
            if (
              !image ||
              typeof image !==
                "object"
            ) {
              return false;
            }

            const item =
              image as ProductImageInput;

            return (
              typeof item.imageUrl ===
                "string" &&
              item.imageUrl.trim()
                .length > 0
            );
          }
        )
        .map((image: ProductImageInput) => ({
          imageUrl:
            image.imageUrl.trim(),
          sortOrder:
            Number.isInteger(
              image.sortOrder
            ) &&
            Number(
              image.sortOrder
            ) >= 0
              ? Number(
                  image.sortOrder
                )
              : 0,
          isPrimary:
            image.isPrimary ===
            true,
        }))
        .slice(0, 10);

      // Normalize order and primary image.
      images = images.map(
        (image, index) => ({
          imageUrl:
            image.imageUrl,
          sortOrder: index,
          isPrimary:
            index === 0,
        })
      );
    }

    // ----------------------------------------------------
    // Validate product
    // ----------------------------------------------------

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Product name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          error:
            "Product slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        retailPrice
      ) ||
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
      (!Number.isFinite(
        compareAtPrice
      ) ||
        compareAtPrice <= 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid compare price.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        stockQuantity
      ) ||
      stockQuantity < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Stock quantity must be a valid number.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------------
    // Validate wholesale pricing
    // ----------------------------------------------------

    if (
      wholesalePrice !== null &&
      (!Number.isFinite(
        wholesalePrice
      ) ||
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
      wholesalePrice >=
        retailPrice
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

    // ----------------------------------------------------
    // Validate images
    // ----------------------------------------------------

    if (
      hasImagesPayload &&
      images.length > 10
    ) {
      return NextResponse.json(
        {
          error:
            "A product can have a maximum of 10 images.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------------
    // Make sure product exists
    // ----------------------------------------------------

    const {
      data: existingProduct,
      error: existingProductError,
    } = await adminSupabase
      .from("products")
      .select(
        "id, image_url"
      )
      .eq("id", id)
      .single();

    if (
      existingProductError ||
      !existingProduct
    ) {
      return NextResponse.json(
        {
          error:
            "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ----------------------------------------------------
    // Determine primary image
    // ----------------------------------------------------

    let finalImageUrl =
      imageUrl;

    if (
      hasImagesPayload
    ) {
      finalImageUrl =
        images[0]?.imageUrl ||
        null;
    }

    // ----------------------------------------------------
    // Update product
    // ----------------------------------------------------

    const {
      data: product,
      error: productError,
    } = await adminSupabase
      .from("products")
      .update({
        name,
        slug,
        sku,
        description,
        category_id:
          categoryId,
        retail_price:
          retailPrice,
        compare_at_price:
          compareAtPrice,
        stock_quantity:
          stockQuantity,
        image_url:
          finalImageUrl,
        is_active:
          isActive,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (productError) {
      console.error(
        "Update product error:",
        productError
      );

      return NextResponse.json(
        {
          error:
            productError.message,
        },
        {
          status: 500,
        }
      );
    }

    // ----------------------------------------------------
    // Synchronize product images
    // ----------------------------------------------------

    if (hasImagesPayload) {
      // Delete current image records.
      const {
        error:
          deleteImagesError,
      } = await adminSupabase
        .from("product_images")
        .delete()
        .eq("product_id", id);

      if (deleteImagesError) {
        console.error(
          "Delete product images error:",
          deleteImagesError
        );

        return NextResponse.json(
          {
            error:
              "Product was updated, but existing product images could not be removed.",
            details:
              deleteImagesError.message,
          },
          {
            status: 500,
          }
        );
      }

      // Insert the new image list.
      if (images.length > 0) {
        const imageRows =
          images.map(
            (
              image,
              index
            ) => ({
              product_id:
                id,
              image_url:
                image.imageUrl,
              sort_order:
                index,
              is_primary:
                index === 0,
            })
          );

        const {
          error:
            insertImagesError,
        } = await adminSupabase
          .from("product_images")
          .insert(
            imageRows
          );

        if (
          insertImagesError
        ) {
          console.error(
            "Insert product images error:",
            insertImagesError
          );

          return NextResponse.json(
            {
              error:
                "Product was updated, but product images could not be saved.",
              details:
                insertImagesError.message,
            },
            {
              status: 500,
            }
          );
        }
      }
    }

    // ----------------------------------------------------
    // Update wholesale pricing
    // ----------------------------------------------------

    if (
      wholesalePrice !== null
    ) {
      // Check whether wholesale pricing
      // already exists.
      const {
        data:
          existingWholesalePrice,
        error:
          existingWholesalePriceError,
      } = await adminSupabase
        .from(
          "wholesale_prices"
        )
        .select(`
          id,
          product_id,
          price,
          minimum_quantity
        `)
        .eq(
          "product_id",
          id
        )
        .maybeSingle();

      if (
        existingWholesalePriceError
      ) {
        console.error(
          "Existing wholesale price lookup error:",
          existingWholesalePriceError
        );

        return NextResponse.json(
          {
            error:
              "Unable to check existing wholesale pricing.",
          },
          {
            status: 500,
          }
        );
      }

      // --------------------------------------------------
      // Update existing wholesale price
      // --------------------------------------------------

      if (
        existingWholesalePrice
      ) {
        const {
          error:
            updateWholesaleError,
        } = await adminSupabase
          .from(
            "wholesale_prices"
          )
          .update({
            price:
              wholesalePrice,
            minimum_quantity:
              minimumWholesaleQuantity,
          })
          .eq(
            "id",
            existingWholesalePrice.id
          );

        if (
          updateWholesaleError
        ) {
          console.error(
            "Update wholesale price error:",
            updateWholesaleError
          );

          return NextResponse.json(
            {
              error:
                "Product was updated, but wholesale pricing could not be updated.",
              details:
                updateWholesaleError.message,
            },
            {
              status: 500,
            }
          );
        }
      }

      // --------------------------------------------------
      // Create wholesale price
      // --------------------------------------------------

      else {
        const {
          error:
            insertWholesaleError,
        } = await adminSupabase
          .from(
            "wholesale_prices"
          )
          .insert({
            product_id:
              id,
            price:
              wholesalePrice,
            minimum_quantity:
              minimumWholesaleQuantity,
          });

        if (
          insertWholesaleError
        ) {
          console.error(
            "Create wholesale price error:",
            insertWholesaleError
          );

          return NextResponse.json(
            {
              error:
                "Product was updated, but wholesale pricing could not be created.",
              details:
                insertWholesaleError.message,
            },
            {
              status: 500,
            }
          );
        }
      }
    }

    // ----------------------------------------------------
    // Success
    // ----------------------------------------------------

    return NextResponse.json({
      success: true,

      product,

      images:
        hasImagesPayload
          ? images.map(
              (
                image,
                index
              ) => ({
                image_url:
                  image.imageUrl,
                sort_order:
                  index,
                is_primary:
                  index === 0,
              })
            )
          : undefined,

      wholesale:
        wholesalePrice !==
        null
          ? {
              price:
                wholesalePrice,
              minimumQuantity:
                minimumWholesaleQuantity,
            }
          : null,
    });
  } catch (error) {
    console.error(
      "Update product API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update product.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE PRODUCT
========================================================= */

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const {
      adminSupabase,
      response,
    } = await checkAdmin();

    if (response) {
      return response;
    }

    if (!adminSupabase) {
      return NextResponse.json(
        {
          error:
            "Unable to initialize admin client.",
        },
        {
          status: 500,
        }
      );
    }

    const { id } = await params;

    // ----------------------------------------------------
    // Check whether product is used in orders
    // ----------------------------------------------------

    const {
      count,
      error:
        orderItemsError,
    } = await adminSupabase
      .from("order_items")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "product_id",
        id
      );

    if (orderItemsError) {
      console.error(
        "Order item check error:",
        orderItemsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to check product orders.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      (count || 0) > 0
    ) {
      return NextResponse.json(
        {
          error:
            "This product is already used in an order. Deactivate it instead of deleting it.",
        },
        {
          status: 409,
        }
      );
    }

    // ----------------------------------------------------
    // Check product exists
    // ----------------------------------------------------

    const {
      data: product,
      error: productError,
    } = await adminSupabase
      .from("products")
      .select(
        "id, image_url"
      )
      .eq("id", id)
      .single();

    if (
      productError ||
      !product
    ) {
      return NextResponse.json(
        {
          error:
            "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ----------------------------------------------------
    // Delete wholesale pricing
    // ----------------------------------------------------

    const {
      error:
        wholesaleDeleteError,
    } = await adminSupabase
      .from(
        "wholesale_prices"
      )
      .delete()
      .eq(
        "product_id",
        id
      );

    if (
      wholesaleDeleteError
    ) {
      console.error(
        "Delete wholesale price error:",
        wholesaleDeleteError
      );

      return NextResponse.json(
        {
          error:
            "Unable to delete wholesale pricing.",
          details:
            wholesaleDeleteError.message,
        },
        {
          status: 500,
        }
      );
    }

    // ----------------------------------------------------
    // Delete product
    //
    // product_images will be deleted automatically because
    // product_images.product_id uses ON DELETE CASCADE.
    // ----------------------------------------------------

    const {
      error: deleteError,
    } = await adminSupabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(
        "Delete product error:",
        deleteError
      );

      return NextResponse.json(
        {
          error:
            deleteError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete product API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete product.",
      },
      {
        status: 500,
      }
    );
  }
}