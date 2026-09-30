import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

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
        retail_price,
        compare_at_price,
        stock_quantity,
        image_url,
        is_active,
        category_id,
        created_at,
        description,
        categories (
          id,
          name,
          slug,
          parent_id
        )
      `)
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

    if (productsError) {
      console.error(
        "Error loading public products:",
        productsError
      );

      return NextResponse.json(
        {
          error: "Unable to load products",
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
       Get product images
    -------------------------------- */

    const productIds = products.map(
      (product) => product.id
    );

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
      .in("product_id", productIds)
      .order("sort_order", {
        ascending: true,
      });

    if (productImagesError) {
      console.error(
        "Error loading product images:",
        productImagesError
      );

      return NextResponse.json(
        {
          error: "Unable to load product images",
        },
        { status: 500 }
      );
    }

    /* --------------------------------
       Create image lookup map
    -------------------------------- */

    const imageMap = new Map<
      string,
      Array<{
        id: string;
        image_url: string;
        sort_order: number;
        is_primary: boolean;
      }>
    >();

    for (const image of productImages || []) {
      const current =
        imageMap.get(image.product_id) || [];

      current.push({
        id: image.id,
        image_url: image.image_url,
        sort_order: image.sort_order,
        is_primary: image.is_primary,
      });

      imageMap.set(
        image.product_id,
        current
      );
    }

    /* --------------------------------
       Build final product response
    -------------------------------- */

    const finalProducts = products.map(
      (product) => {
        const databaseImages =
          imageMap.get(product.id) || [];

        let images =
          databaseImages.map(
            (image) => image.image_url
          );

        /*
         * Backward compatibility:
         * old products may only have image_url.
         */
        if (
          images.length === 0 &&
          product.image_url
        ) {
          images = [product.image_url];
        }

        /*
         * Remove duplicate image URLs.
         */
        images = [...new Set(images)];

        /*
         * Primary image:
         * Prefer products.image_url because
         * it is the existing primary image.
         */
        const primaryImage =
          product.image_url ||
          images[0] ||
          null;

        /*
         * Always put the primary image first.
         */
        const finalImages =
          primaryImage
            ? [
                primaryImage,
                ...images.filter(
                  (image) =>
                    image !== primaryImage
                ),
              ]
            : images;

        return {
          ...product,

          /*
           * Existing field.
           */
          image_url: primaryImage,

          /*
           * New field containing
           * all product images.
           */
          images: finalImages,
        };
      }
    );

    return NextResponse.json({
      products: finalProducts,
    });
  } catch (error) {
    console.error(
      "Unexpected products API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load products",
      },
      { status: 500 }
    );
  }
}