import { notFound } from "next/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // Get product from Supabase
  const { data: productData, error } = await supabase
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
      category_id
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !productData) {
    notFound();
  }

  // Get category
  let categoryName = "Product";

  if (productData.category_id) {
    const { data: category } = await supabase
      .from("categories")
      .select("name")
      .eq("id", productData.category_id)
      .single();

    if (category) {
      categoryName = category.name;
    }
  }

  // Calculate discount
  const discount =
    productData.compare_at_price &&
    productData.compare_at_price > productData.retail_price
      ? Math.round(
          ((productData.compare_at_price - productData.retail_price) /
            productData.compare_at_price) *
            100
        )
      : null;

  // Convert Supabase product to our frontend Product type
  const product: Product = {
    id: productData.id,
    name: productData.name,
    slug: productData.slug,
    sku: productData.sku,
    description: productData.description,
    price: Number(productData.retail_price),
    oldPrice: productData.compare_at_price
      ? Number(productData.compare_at_price)
      : undefined,
    discount: discount ? `${discount}% OFF` : undefined,
    image: productData.image_url || "",
    category: categoryName,
    rating: 0,
    reviews: 0,
    stockQuantity: productData.stock_quantity,
  };

  return (
    <main className="min-h-screen bg-[#FFFDF5]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Product Image */}
        <div className="overflow-hidden rounded-3xl bg-[#FFF7E8]">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-7xl">
              🎁
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="mt-6">
          <p className="text-sm font-bold uppercase tracking-wide text-[#F43F5E]">
            {product.category}
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-[#172554]">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-md bg-[#FFC928] px-2 py-1 text-sm font-bold text-[#172554]">
              ★ {product.rating || "New"}
            </span>

            {product.reviews > 0 && (
              <span className="text-sm text-gray-500">
                ({product.reviews} reviews)
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-extrabold text-[#F43F5E]">
              ₹{product.price}
            </span>

            {product.oldPrice && (
              <span className="text-lg text-gray-400 line-through">
                ₹{product.oldPrice}
              </span>
            )}

            {product.discount && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                {product.discount}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-5">
              <h2 className="text-base font-bold text-[#172554]">
                Product Description
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {product.description}
              </p>
            </div>
          )}

          {/* Product Information */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-[#FFF7E8] p-3 text-center">
              <div className="text-xl">✨</div>
              <p className="mt-1 text-[11px] font-bold text-[#172554]">
                Quality
              </p>
              <p className="text-[10px] text-gray-500">
                Products
              </p>
            </div>

            <div className="rounded-xl bg-[#FFF7E8] p-3 text-center">
              <div className="text-xl">🚚</div>
              <p className="mt-1 text-[11px] font-bold text-[#172554]">
                Fast
              </p>
              <p className="text-[10px] text-gray-500">
                Delivery
              </p>
            </div>

            <div className="rounded-xl bg-[#FFF7E8] p-3 text-center">
              <div className="text-xl">↩️</div>
              <p className="mt-1 text-[11px] font-bold text-[#172554]">
                Easy
              </p>
              <p className="text-[10px] text-gray-500">
                Returns
              </p>
            </div>
          </div>

          {/* Stock */}
          <div className="mt-5">
            {product.stockQuantity > 0 ? (
              <p className="text-sm font-semibold text-green-600">
                ✓ In Stock
              </p>
            ) : (
              <p className="text-sm font-semibold text-red-600">
                Out of Stock
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-bold text-[#172554]">
              Quantity
            </span>

            <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                type="button"
                className="px-4 py-2 text-lg font-bold text-[#172554]"
              >
                −
              </button>

              <span className="px-4 text-sm font-bold">
                1
              </span>

              <button
                type="button"
                className="px-4 py-2 text-lg font-bold text-[#172554]"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mt-5">
            {product.stockQuantity > 0 ? (
              <AddToCartButton product={product} />
            ) : (
              <button
                type="button"
                disabled
                className="w-full rounded-xl bg-gray-200 py-3 font-bold text-gray-500"
              >
                Out of Stock
              </button>
            )}
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="mt-4 text-center text-xs text-gray-400">
              SKU: {product.sku}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}