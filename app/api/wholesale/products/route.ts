import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";

function hash(value: string) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

export async function GET() {
  try {
    /* --------------------------------
       Get wholesale session
    -------------------------------- */

    const cookieStore = await cookies();

    const sessionToken =
      cookieStore.get("wholesale_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          error:
            "Wholesale session not found. Please login again.",
        },
        { status: 401 }
      );
    }

    /* --------------------------------
       Supabase admin client
    -------------------------------- */

    const supabase = createAdminClient();

    /* --------------------------------
       Verify wholesale session
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
        "Wholesale session error:",
        sessionError
      );

      return NextResponse.json(
        {
          error:
            "Wholesale session error: " +
            sessionError.message,
        },
        { status: 500 }
      );
    }

    const shop = sessionData?.[0];

    if (!shop) {
      return NextResponse.json(
        {
          error:
            "Wholesale session is invalid or expired.",
        },
        { status: 401 }
      );
    }

    /* --------------------------------
       Get active products
    -------------------------------- */

    const {
      data: products,
      error: productsError,
    } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        sku,
        description,
        retail_price,
        stock_quantity,
        image_url,
        is_active,
        category_id,
        created_at
      `)
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

    if (productsError) {
      console.error(
        "Products query error:",
        productsError
      );

      return NextResponse.json(
        {
          error:
            "Products query error: " +
            productsError.message,
          code: productsError.code,
          details: productsError.details,
          hint: productsError.hint,
        },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        products: [],
      });
    }

    /* --------------------------------
       Get product categories
    -------------------------------- */

    const categoryIds = products
      .map(
        (product) => product.category_id
      )
      .filter(
        (categoryId): categoryId is string =>
          Boolean(categoryId)
      );

    let categories: Array<{
      id: string;
      name: string;
      slug: string;
      parent_id: string | null;
    }> = [];

    if (categoryIds.length > 0) {
      const {
        data: categoryData,
        error: categoryError,
      } = await supabase
        .from("categories")
        .select(`
          id,
          name,
          slug,
          parent_id
        `)
        .in("id", categoryIds)
        .eq("is_active", true);

      if (categoryError) {
        console.error(
          "Categories query error:",
          categoryError
        );

        return NextResponse.json(
          {
            error:
              "Categories query error: " +
              categoryError.message,
            code: categoryError.code,
            details: categoryError.details,
            hint: categoryError.hint,
          },
          { status: 500 }
        );
      }

      categories = categoryData || [];
    }

    /* --------------------------------
       Get parent categories
    -------------------------------- */

    const parentCategoryIds = [
      ...new Set(
        categories
          .map(
            (category) =>
              category.parent_id
          )
          .filter(
            (
              parentId
            ): parentId is string =>
              Boolean(parentId)
          )
      ),
    ];

    let parentCategories: Array<{
      id: string;
      name: string;
      slug: string;
    }> = [];

    if (
      parentCategoryIds.length > 0
    ) {
      const {
        data: parentCategoryData,
        error: parentCategoryError,
      } = await supabase
        .from("categories")
        .select(`
          id,
          name,
          slug
        `)
        .in(
          "id",
          parentCategoryIds
        )
        .eq(
          "is_active",
          true
        );

      if (parentCategoryError) {
        console.error(
          "Parent categories query error:",
          parentCategoryError
        );

        return NextResponse.json(
          {
            error:
              "Parent categories query error: " +
              parentCategoryError.message,
            code: parentCategoryError.code,
            details:
              parentCategoryError.details,
            hint:
              parentCategoryError.hint,
          },
          { status: 500 }
        );
      }

      parentCategories =
        parentCategoryData || [];
    }

    /* --------------------------------
       Create category lookup maps
    -------------------------------- */

    const categoryMap =
      new Map(
        categories.map(
          (category) => [
            category.id,
            category,
          ]
        )
      );

    const parentCategoryMap =
      new Map(
        parentCategories.map(
          (category) => [
            category.id,
            category,
          ]
        )
      );

    /* --------------------------------
       Get wholesale prices
    -------------------------------- */

    const productIds =
      products.map(
        (product) => product.id
      );

    const {
      data: wholesalePrices,
      error:
        wholesalePricesError,
    } = await supabase
      .from("wholesale_prices")
      .select(`
        product_id,
        price,
        minimum_quantity
      `)
      .in(
        "product_id",
        productIds
      );

    if (wholesalePricesError) {
      console.error(
        "Wholesale prices query error:",
        wholesalePricesError
      );

      return NextResponse.json(
        {
          error:
            "Wholesale prices query error: " +
            wholesalePricesError.message,
          code:
            wholesalePricesError.code,
          details:
            wholesalePricesError.details,
          hint:
            wholesalePricesError.hint,
        },
        { status: 500 }
      );
    }

    /* --------------------------------
       Get product images
    -------------------------------- */

    const {
      data: productImages,
      error: productImagesError,
    } = await supabase
      .from("product_images")
      .select(`
        id,
        product_id,
        image_url,
        sort_order,
        is_primary
      `)
      .in(
        "product_id",
        productIds
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      );

    if (productImagesError) {
      console.error(
        "Product images query error:",
        productImagesError
      );

      return NextResponse.json(
        {
          error:
            "Product images query error: " +
            productImagesError.message,
          code:
            productImagesError.code,
          details:
            productImagesError.details,
          hint:
            productImagesError.hint,
        },
        { status: 500 }
      );
    }

    /* --------------------------------
       Create image lookup map
    -------------------------------- */

    const imageMap =
      new Map<
        string,
        Array<{
          id: string;
          image_url: string;
          sort_order: number;
          is_primary: boolean;
        }>
      >();

    for (
      const image of
        productImages || []
    ) {
      const current =
        imageMap.get(
          image.product_id
        ) || [];

      current.push({
        id: image.id,
        image_url:
          image.image_url,
        sort_order:
          image.sort_order,
        is_primary:
          image.is_primary,
      });

      imageMap.set(
        image.product_id,
        current
      );
    }

    /* --------------------------------
       Build wholesale product list
    -------------------------------- */

    const availableProducts =
      products
        .map((product) => {
          const wholesalePrice =
            wholesalePrices?.find(
              (item) =>
                item.product_id ===
                product.id
            );

          /*
           * Only show products that have
           * wholesale pricing configured.
           */
          if (!wholesalePrice) {
            return null;
          }

          const category =
            product.category_id
              ? categoryMap.get(
                  product.category_id
                ) || null
              : null;

          const parentCategory =
            category?.parent_id
              ? parentCategoryMap.get(
                  category.parent_id
                ) || null
              : null;

          /* --------------------------------
             Product images
          -------------------------------- */

          const databaseImages =
            imageMap.get(
              product.id
            ) || [];

          let images =
            databaseImages.map(
              (image) =>
                image.image_url
            );

          /*
           * Backward compatibility:
           * old products may only have image_url.
           */
          if (
            images.length === 0 &&
            product.image_url
          ) {
            images = [
              product.image_url,
            ];
          }

          /*
           * Remove duplicate URLs.
           */
          images = [
            ...new Set(images),
          ];

          /*
           * Primary image:
           * Prefer product.image_url because
           * it is kept synchronized with the
           * primary product image.
           */
          const primaryImage =
            product.image_url ||
            images[0] ||
            null;

          /*
           * Make sure primary image is
           * included only once.
           */
          const finalImages =
            primaryImage
              ? [
                  primaryImage,
                  ...images.filter(
                    (image) =>
                      image !==
                      primaryImage
                  ),
                ]
              : images;

          return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            description:
              product.description,

            retailPrice: Number(
              product.retail_price
            ),

            wholesalePrice:
              Number(
                wholesalePrice.price
              ),

            minQuantity:
              Number(
                wholesalePrice.minimum_quantity ||
                  1
              ),

            stockQuantity:
              Number(
                product.stock_quantity ||
                  0
              ),

            category: category
              ? {
                  id: category.id,
                  name: category.name,
                  slug: category.slug,
                }
              : null,

            parentCategory,

            image:
              primaryImage,

            images:
              finalImages,
          };
        })
        .filter(Boolean);

    return NextResponse.json({
      products:
        availableProducts,
    });
  } catch (error) {
    console.error(
      "Wholesale products API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown wholesale products error.",
      },
      { status: 500 }
    );
  }
}