"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
};

type ProductImage = {
  id?: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  category_id: string | null;
  retail_price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  image_url: string | null;
  is_active: boolean;
  images?: ProductImage[];

  wholesale_price?: number | null;
  minimum_wholesale_quantity?: number | null;
};

type NewImageFile = {
  file: File;
  preview: string;
};

type ImagePayload = {
  imageUrl: string;
  sortOrder: number;
  isPrimary: boolean;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const productId = params.id as string;

  // --------------------------------------------------------
  // Categories
  // --------------------------------------------------------

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [mainCategoryId, setMainCategoryId] =
    useState("");

  const [subcategoryId, setSubcategoryId] =
    useState("");

  // --------------------------------------------------------
  // Product information
  // --------------------------------------------------------

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] =
    useState("");

  // --------------------------------------------------------
  // Pricing
  // --------------------------------------------------------

  const [retailPrice, setRetailPrice] =
    useState("");

  const [compareAtPrice, setCompareAtPrice] =
    useState("");

  const [wholesalePrice, setWholesalePrice] =
    useState("");

  const [
    minimumWholesaleQuantity,
    setMinimumWholesaleQuantity,
  ] = useState("6");

  const [stockQuantity, setStockQuantity] =
    useState("0");

  // --------------------------------------------------------
  // Product images
  // --------------------------------------------------------

  const [existingImages, setExistingImages] =
    useState<ProductImage[]>([]);

  const [newImageFiles, setNewImageFiles] =
    useState<NewImageFile[]>([]);

  const [primaryImageSource, setPrimaryImageSource] =
    useState<"existing" | "new">("existing");

  const [isUploadingImage, setIsUploadingImage] =
    useState(false);

  // --------------------------------------------------------
  // Product status
  // --------------------------------------------------------

  const [isActive, setIsActive] =
    useState(true);

  // --------------------------------------------------------
  // Loading / submitting
  // --------------------------------------------------------

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  // --------------------------------------------------------
  // Derived categories
  // --------------------------------------------------------

  const mainCategories = categories.filter(
    (category) =>
      category.parent_id === null
  );

  const subcategories = categories.filter(
    (category) =>
      category.parent_id === mainCategoryId
  );

  // --------------------------------------------------------
  // Load product + categories
  // --------------------------------------------------------

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [
          productResponse,
          categoriesResponse,
        ] = await Promise.all([
          fetch(
            `/api/admin/products/${productId}`,
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/admin/products/categories",
            {
              cache: "no-store",
            }
          ),
        ]);

        const productData =
          await productResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        if (!productResponse.ok) {
          throw new Error(
            productData.error ||
              "Unable to load product."
          );
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesData.error ||
              "Unable to load categories."
          );
        }

        const product: Product =
          productData.product;

        const loadedCategories: Category[] =
          categoriesData.categories || [];

        // --------------------------------------------------
        // Product information
        // --------------------------------------------------

        setName(product.name || "");
        setSlug(product.slug || "");
        setSku(product.sku || "");

        setDescription(
          product.description || ""
        );

        // --------------------------------------------------
        // Category
        //
        // Product category_id stores the SUBCATEGORY.
        // Find its parent and set both dropdowns.
        // --------------------------------------------------

        const selectedSubcategory =
          loadedCategories.find(
            (category) =>
              category.id ===
              product.category_id
          );

        if (selectedSubcategory) {
          setSubcategoryId(
            selectedSubcategory.id
          );

          setMainCategoryId(
            selectedSubcategory.parent_id ||
              ""
          );
        } else {
          setSubcategoryId("");
          setMainCategoryId("");
        }

        // --------------------------------------------------
        // Pricing
        // --------------------------------------------------

        setRetailPrice(
          String(
            product.retail_price ?? ""
          )
        );

        setCompareAtPrice(
          product.compare_at_price !== null
            ? String(
                product.compare_at_price
              )
            : ""
        );

        setWholesalePrice(
          product.wholesale_price !== null &&
            product.wholesale_price !==
              undefined
            ? String(
                product.wholesale_price
              )
            : ""
        );

        setMinimumWholesaleQuantity(
          product.minimum_wholesale_quantity !==
              null &&
            product.minimum_wholesale_quantity !==
              undefined
            ? String(
                product.minimum_wholesale_quantity
              )
            : "6"
        );

        setStockQuantity(
          String(
            product.stock_quantity ?? 0
          )
        );

        setIsActive(
          product.is_active
        );

        // --------------------------------------------------
        // Load multiple images
        // --------------------------------------------------

        let loadedImages: ProductImage[] =
          [];

        if (
          Array.isArray(product.images) &&
          product.images.length > 0
        ) {
          loadedImages =
            product.images
              .map((image, index) => ({
                ...image,

                sort_order:
                  Number.isInteger(
                    image.sort_order
                  )
                    ? image.sort_order
                    : index,

                is_primary:
                  image.is_primary === true,
              }))
              .sort(
                (a, b) =>
                  a.sort_order -
                  b.sort_order
              );
        }

        // --------------------------------------------------
        // Backward compatibility
        // --------------------------------------------------

        if (
          loadedImages.length === 0 &&
          product.image_url
        ) {
          loadedImages = [
            {
              image_url:
                product.image_url,
              sort_order: 0,
              is_primary: true,
            },
          ];
        }

        // --------------------------------------------------
        // Normalize image order
        // --------------------------------------------------

        if (loadedImages.length > 0) {
          loadedImages =
            loadedImages.map(
              (image, index) => ({
                ...image,

                sort_order: index,

                is_primary:
                  index === 0,
              })
            );

          setPrimaryImageSource(
            "existing"
          );
        }

        setExistingImages(
          loadedImages
        );

        setCategories(
          loadedCategories
        );
      } catch (error) {
        console.error(error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load product."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [productId]);

  // --------------------------------------------------------
  // Generate slug
  // --------------------------------------------------------

  const generateSlug = (
    value: string
  ) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // --------------------------------------------------------
  // Main category change
  // --------------------------------------------------------

  const handleMainCategoryChange = (
    value: string
  ) => {
    setMainCategoryId(value);

    // Reset subcategory
    // when main category changes.
    setSubcategoryId("");
  };

  // --------------------------------------------------------
  // Add new images
  // --------------------------------------------------------

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setErrorMessage("");
    setSuccessMessage("");

    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    const maxFiles = 10;
    const maxSize = 5 * 1024 * 1024;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const currentImageCount =
      existingImages.length +
      newImageFiles.length;

    if (
      currentImageCount + files.length >
      maxFiles
    ) {
      setErrorMessage(
        `You can have a maximum of ${maxFiles} images per product.`
      );

      event.target.value = "";
      return;
    }

    // ------------------------------------------------------
    // Validate all files
    // ------------------------------------------------------

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(
          `"${file.name}" is not supported. Only JPG, PNG and WEBP images are allowed.`
        );

        event.target.value = "";
        return;
      }

      if (file.size > maxSize) {
        setErrorMessage(
          `"${file.name}" is larger than 5 MB.`
        );

        event.target.value = "";
        return;
      }

      if (file.size === 0) {
        setErrorMessage(
          `"${file.name}" is empty.`
        );

        event.target.value = "";
        return;
      }
    }

    const newImages: NewImageFile[] =
      files.map((file) => ({
        file,
        preview:
          URL.createObjectURL(file),
      }));

    /*
     * If there are no existing images,
     * newly uploaded images become primary.
     */
    if (
      existingImages.length === 0
    ) {
      setPrimaryImageSource("new");
    }

    setNewImageFiles(
      (current) => [
        ...current,
        ...newImages,
      ]
    );

    // Allow selecting same file again
    event.target.value = "";
  };

  // --------------------------------------------------------
  // Remove existing image
  // --------------------------------------------------------

  const removeExistingImage = (
    index: number
  ) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      index < 0 ||
      index >= existingImages.length
    ) {
      return;
    }

    const updatedImages =
      existingImages.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );

    /*
     * If existing primary image was removed
     * and new images exist, use new images.
     */
    if (
      primaryImageSource === "existing" &&
      index === 0 &&
      newImageFiles.length > 0
    ) {
      setPrimaryImageSource("new");

      setExistingImages(
        updatedImages.map(
          (image, imageIndex) => ({
            ...image,

            sort_order:
              imageIndex + 1,

            is_primary: false,
          })
        )
      );

      return;
    }

    setExistingImages(
      updatedImages.map(
        (image, imageIndex) => ({
          ...image,

          sort_order: imageIndex,

          is_primary:
            primaryImageSource ===
              "existing" &&
            imageIndex === 0,
        })
      )
    );
  };

  // --------------------------------------------------------
  // Remove newly selected image
  // --------------------------------------------------------

  const removeNewImage = (
    index: number
  ) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      index < 0 ||
      index >= newImageFiles.length
    ) {
      return;
    }

    const image =
      newImageFiles[index];

    if (image?.preview) {
      URL.revokeObjectURL(
        image.preview
      );
    }

    const updatedImages =
      newImageFiles.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );

    /*
     * If primary new image was removed,
     * fall back to existing image.
     */
    if (
      primaryImageSource === "new" &&
      index === 0
    ) {
      if (
        existingImages.length > 0
      ) {
        setPrimaryImageSource(
          "existing"
        );

        setExistingImages(
          (current) =>
            current.map(
              (
                existingImage,
                imageIndex
              ) => ({
                ...existingImage,

                sort_order:
                  imageIndex,

                is_primary:
                  imageIndex === 0,
              })
            )
        );
      }
    }

    setNewImageFiles(
      updatedImages
    );
  };

  // --------------------------------------------------------
  // Set existing image as primary
  // --------------------------------------------------------

  const setPrimaryExistingImage = (
    index: number
  ) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      index < 0 ||
      index >= existingImages.length
    ) {
      return;
    }

    setPrimaryImageSource(
      "existing"
    );

    setExistingImages(
      (current) => {
        const selected =
          current[index];

        const reordered = [
          selected,
          ...current.filter(
            (_, imageIndex) =>
              imageIndex !== index
          ),
        ];

        return reordered.map(
          (image, imageIndex) => ({
            ...image,

            sort_order:
              imageIndex,

            is_primary:
              imageIndex === 0,
          })
        );
      }
    );
  };

  // --------------------------------------------------------
  // Set new image as primary
  // --------------------------------------------------------

  const setPrimaryNewImage = (
    index: number
  ) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      index < 0 ||
      index >= newImageFiles.length
    ) {
      return;
    }

    setPrimaryImageSource(
      "new"
    );

    // Move selected new image to first
    setNewImageFiles(
      (current) => {
        const selected =
          current[index];

        return [
          selected,
          ...current.filter(
            (_, imageIndex) =>
              imageIndex !== index
          ),
        ];
      }
    );

    // Existing images are no longer primary
    setExistingImages(
      (current) =>
        current.map(
          (image, imageIndex) => ({
            ...image,

            sort_order:
              imageIndex + 1,

            is_primary: false,
          })
        )
    );
  };

  // --------------------------------------------------------
  // Upload new images
  // --------------------------------------------------------

  const uploadNewImages =
    async (): Promise<
      {
        imageUrl: string;
        path: string;
      }[]
    > => {
      if (
        newImageFiles.length === 0
      ) {
        return [];
      }

      setIsUploadingImage(true);

      try {
        const formData =
          new FormData();

        for (
          const item of newImageFiles
        ) {
          formData.append(
            "files",
            item.file
          );
        }

        const response =
          await fetch(
            "/api/admin/products/upload-image",
            {
              method: "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to upload images."
          );
        }

        return Array.isArray(
          data.images
        )
          ? data.images
          : [];
      } finally {
        setIsUploadingImage(false);
      }
    };

  // --------------------------------------------------------
  // Build final image list
  // --------------------------------------------------------

  const buildImagePayload =
    async (): Promise<
      ImagePayload[]
    > => {
      let uploadedNewImages: {
        imageUrl: string;
        path: string;
      }[] = [];

      if (
        newImageFiles.length > 0
      ) {
        uploadedNewImages =
          await uploadNewImages();
      }

      if (
        uploadedNewImages.length !==
        newImageFiles.length
      ) {
        throw new Error(
          "Some images could not be uploaded. Please try again."
        );
      }

      // Existing images
      const existingImagePayload =
        existingImages.map(
          (image) => ({
            imageUrl:
              image.image_url,

            sortOrder: 0,

            isPrimary: false,
          })
        );

      // New images
      const newImagePayload =
        uploadedNewImages.map(
          (image) => ({
            imageUrl:
              image.imageUrl,

            sortOrder: 0,

            isPrimary: false,
          })
        );

      /*
       * Primary group goes first.
       *
       * Existing primary:
       * Existing → New
       *
       * New primary:
       * New → Existing
       */
      const finalImages =
        primaryImageSource === "new"
          ? [
              ...newImagePayload,
              ...existingImagePayload,
            ]
          : [
              ...existingImagePayload,
              ...newImagePayload,
            ];

      /*
       * Normalize everything.
       */
      return finalImages.map(
        (image, index) => ({
          imageUrl:
            image.imageUrl,

          sortOrder: index,

          isPrimary:
            index === 0,
        })
      );
    };

  // --------------------------------------------------------
  // Submit changes
  // --------------------------------------------------------

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      // ----------------------------------------------------
      // Validate category
      // ----------------------------------------------------

      if (!mainCategoryId) {
        throw new Error(
          "Please select a main category."
        );
      }

      if (!subcategoryId) {
        throw new Error(
          "Please select a subcategory."
        );
      }

      // ----------------------------------------------------
      // Validate wholesale price
      // ----------------------------------------------------

      if (
        wholesalePrice &&
        retailPrice &&
        Number(wholesalePrice) >=
          Number(retailPrice)
      ) {
        throw new Error(
          "Wholesale price should be lower than the retail price."
        );
      }

      // ----------------------------------------------------
      // Validate MOQ
      // ----------------------------------------------------

      if (
        !minimumWholesaleQuantity ||
        !Number.isInteger(
          Number(
            minimumWholesaleQuantity
          )
        ) ||
        Number(
          minimumWholesaleQuantity
        ) < 1
      ) {
        throw new Error(
          "Minimum wholesale quantity must be at least 1."
        );
      }

      // ----------------------------------------------------
      // Validate image count
      // ----------------------------------------------------

      if (
        existingImages.length +
          newImageFiles.length >
        10
      ) {
        throw new Error(
          "A product can have a maximum of 10 images."
        );
      }

      // ----------------------------------------------------
      // Build image payload
      // ----------------------------------------------------

      const images =
        await buildImagePayload();

      const primaryImageUrl =
        images[0]?.imageUrl || null;

      // ----------------------------------------------------
      // Update product
      // ----------------------------------------------------

      const response =
        await fetch(
          `/api/admin/products/${productId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              slug,
              sku,
              description,

              // IMPORTANT:
              // Store SUBCATEGORY UUID
              // in products.category_id.
              categoryId:
                subcategoryId || null,

              retailPrice,
              compareAtPrice,

              wholesalePrice,
              minimumWholesaleQuantity,

              stockQuantity,

              imageUrl:
                primaryImageUrl,

              images,

              isActive,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update product."
        );
      }

      // ----------------------------------------------------
      // Cleanup local previews
      // ----------------------------------------------------

      newImageFiles.forEach(
        (image) => {
          if (image.preview) {
            URL.revokeObjectURL(
              image.preview
            );
          }
        }
      );

      setNewImageFiles([]);

      // ----------------------------------------------------
      // Refresh images from API
      // ----------------------------------------------------

      if (
        Array.isArray(data.images)
      ) {
        const refreshedImages =
          data.images.map(
            (
              image: ProductImage,
              index: number
            ) => ({
              ...image,

              sort_order: index,

              is_primary:
                index === 0,
            })
          );

        setExistingImages(
          refreshedImages
        );

        setPrimaryImageSource(
          "existing"
        );
      }

      setSuccessMessage(
        "Product updated successfully."
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update product."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------
  // Toggle active
  // --------------------------------------------------------

  const toggleActive =
    async () => {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSubmitting(true);

      try {
        const response =
          await fetch(
            `/api/admin/products/${productId}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                name,
                slug,
                sku,
                description,

                categoryId:
                  subcategoryId || null,

                retailPrice,
                compareAtPrice,

                wholesalePrice,
                minimumWholesaleQuantity,

                stockQuantity,

                imageUrl:
                  existingImages[0]
                    ?.image_url || null,

                images:
                  existingImages.map(
                    (
                      image,
                      index
                    ) => ({
                      imageUrl:
                        image.image_url,

                      sortOrder:
                        index,

                      isPrimary:
                        index === 0,
                    })
                  ),

                isActive:
                  !isActive,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to update product."
          );
        }

        setIsActive(
          !isActive
        );

        setSuccessMessage(
          !isActive
            ? "Product activated successfully."
            : "Product deactivated successfully."
        );

        router.refresh();
      } catch (error) {
        console.error(error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to update product."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // --------------------------------------------------------
  // Delete product
  // --------------------------------------------------------

  const deleteProduct =
    async () => {
      const confirmed =
        window.confirm(
          `Are you sure you want to permanently delete "${name}"?`
        );

      if (!confirmed) {
        return;
      }

      setErrorMessage("");
      setSuccessMessage("");
      setIsDeleting(true);

      try {
        const response =
          await fetch(
            `/api/admin/products/${productId}`,
            {
              method: "DELETE",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to delete product."
          );
        }

        window.location.href =
          "/admin/products";
      } catch (error) {
        console.error(error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to delete product."
        );

        setIsDeleting(false);
      }
    };

  // --------------------------------------------------------
  // Loading
  // --------------------------------------------------------

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FFF9E8] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">
            🛍️
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-500">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------
  // Page
  // --------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#FFF9E8] px-4 py-6">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div>
          <Link
            href="/admin/products"
            className="text-sm font-bold text-[#F43F5E]"
          >
            ← Back to Products
          </Link>

          <h1 className="mt-2 text-2xl font-extrabold text-[#172554]">
            Edit Product
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update product information,
            pricing, stock and images.
          </p>
        </div>

        {/* Main Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-3xl bg-white p-5 shadow-sm"
        >

          {/* ================================================= */}
          {/* Product Information */}
          {/* ================================================= */}

          <h2 className="text-lg font-extrabold text-[#172554]">
            Product Information
          </h2>

          <div className="mt-5 space-y-5">

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-bold text-[#172554]"
              >
                Product Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-yellow-100"
              />
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="mb-1.5 block text-sm font-bold text-[#172554]"
              >
                Product Slug
              </label>

              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(
                    generateSlug(
                      event.target.value
                    )
                  )
                }
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-yellow-100"
              />
            </div>

            {/* SKU */}
            <div>
              <label
                htmlFor="sku"
                className="mb-1.5 block text-sm font-bold text-[#172554]"
              >
                SKU
              </label>

              <input
                id="sku"
                type="text"
                value={sku}
                onChange={(event) =>
                  setSku(
                    event.target.value.toUpperCase()
                  )
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-yellow-100"
              />
            </div>

            {/* ================================================= */}
            {/* Main Category */}
            {/* ================================================= */}

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label
                  htmlFor="mainCategory"
                  className="block text-sm font-bold text-[#172554]"
                >
                  Main Category
                </label>

                <Link
                  href="/admin/categories/new"
                  target="_blank"
                  className="text-xs font-bold text-[#F43F5E] hover:underline"
                >
                  + Add Category
                </Link>
              </div>

              <select
                id="mainCategory"
                value={mainCategoryId}
                onChange={(event) =>
                  handleMainCategoryChange(
                    event.target.value
                  )
                }
                disabled={
                  categories.length === 0
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-yellow-100 disabled:bg-gray-100"
              >
                <option value="">
                  {mainCategories.length ===
                  0
                    ? "No categories found"
                    : "Select main category"}
                </option>

                {mainCategories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ================================================= */}
            {/* Subcategory */}
            {/* ================================================= */}

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label
                  htmlFor="subcategory"
                  className="block text-sm font-bold text-[#172554]"
                >
                  Subcategory
                </label>

                {mainCategoryId && (
                  <Link
                    href={`/admin/categories/new?parent=${mainCategoryId}`}
                    target="_blank"
                    className="text-xs font-bold text-[#F43F5E] hover:underline"
                  >
                    + Add Subcategory
                  </Link>
                )}
              </div>

              <select
                id="subcategory"
                value={subcategoryId}
                onChange={(event) =>
                  setSubcategoryId(
                    event.target.value
                  )
                }
                disabled={
                  !mainCategoryId ||
                  subcategories.length === 0
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-yellow-100 disabled:bg-gray-100"
              >
                <option value="">
                  {!mainCategoryId
                    ? "Select main category first"
                    : subcategories.length ===
                      0
                    ? "No subcategories available"
                    : "Select subcategory"}
                </option>

                {subcategories.map(
                  (subcategory) => (
                    <option
                      key={subcategory.id}
                      value={subcategory.id}
                    >
                      {subcategory.name}
                    </option>
                  )
                )}
              </select>

              {mainCategoryId &&
                subcategories.length ===
                  0 && (
                  <p className="mt-2 text-xs font-semibold text-orange-600">
                    No subcategories found.
                    Add a subcategory first.
                  </p>
                )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-bold text-[#172554]"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows={5}
                placeholder="Enter product description..."
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-yellow-100"
              />
            </div>

          </div>

          {/* ================================================= */}
          {/* Pricing */}
          {/* ================================================= */}

          <h2 className="mt-8 text-lg font-extrabold text-[#172554]">
            Pricing & Stock
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            {/* Retail Price */}
            <div>
              <label
                htmlFor="retailPrice"
                className="mb-1.5 block text-sm font-bold text-[#172554]"
              >
                Retail Price
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  ₹
                </span>

                <input
                  id="retailPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={retailPrice}
                  onChange={(event) =>
                    setRetailPrice(
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 py-3 pl-8 pr-4 text-sm outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-yellow-100"
                />
              </div>
            </div>

            {/* Wholesale Price */}
            <div>
              <label
                htmlFor="wholesalePrice"
                className="mb-1.5 block text-sm font-bold text-[#172554]"
              >
                Wholesale Price
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  ₹
                </span>

                <input
                  id="wholesalePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={wholesalePrice}
                  onChange={(event) =>
                    setWholesalePrice(
                      event.target.value
                    )
                  }
                  placeholder="210"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-8 pr-4 text-sm outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-yellow-100"
                />
              </div>

              <p className="mt-1 text-xs text-gray-400">
                Price offered to wholesale shops.
              </p>
            </div>

            {/* Compare Price */}
            <div>
              <label
                htmlFor="compareAtPrice"
                className="mb-1.5 block text-sm font-bold text-[#172554]"
              >
                Compare Price
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  ₹
                </span>

                <input
                  id="compareAtPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(event) =>
                    setCompareAtPrice(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 py-3 pl-8 pr-4 text-sm outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-yellow-100"
                />
              </div>

              <p className="mt-1 text-xs text-gray-400">
                Optional original/MRP price.
              </p>
            </div>

            {/* MOQ */}
            <div>
              <label
                htmlFor="minimumWholesaleQuantity"
                className="mb-1.5 block text-sm font-bold text-[#172554]"
              >
                Minimum Wholesale Quantity
                (MOQ)
              </label>

              <input
                id="minimumWholesaleQuantity"
                type="number"
                min="1"
                step="1"
                value={
                  minimumWholesaleQuantity
                }
                onChange={(event) =>
                  setMinimumWholesaleQuantity(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-yellow-100"
              />

              <p className="mt-1 text-xs text-gray-400">
                Minimum quantity a wholesale shop
                must buy.
              </p>
            </div>

            {/* Stock */}
            <div className="sm:col-span-2">
              <label
                htmlFor="stockQuantity"
                className="mb-1.5 block text-sm font-bold text-[#172554]"
              >
                Stock Quantity
              </label>

              <input
                id="stockQuantity"
                type="number"
                min="0"
                step="1"
                value={stockQuantity}
                onChange={(event) =>
                  setStockQuantity(
                    event.target.value
                  )
                }
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-yellow-100"
              />
            </div>

          </div>

          {/* Wholesale Information */}
          <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4">
            <p className="text-sm font-extrabold text-green-800">
              Wholesale Pricing
            </p>

            <p className="mt-1 text-xs leading-5 text-green-700">
              The wholesale price should be lower
              than the retail price. MOQ controls
              the minimum quantity a wholesale shop
              can purchase.
            </p>
          </div>

          {/* ================================================= */}
          {/* Product Images */}
          {/* ================================================= */}

          <h2 className="mt-8 text-lg font-extrabold text-[#172554]">
            Product Images
          </h2>

          <div className="mt-5">

            <p className="mb-3 text-xs text-gray-500">
              You can have up to 10 images. The
              primary image is shown first on the
              product listing.
            </p>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-bold text-[#172554]">
                  Current Images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {existingImages.map(
                    (image, index) => (
                      <div
                        key={
                          image.id ||
                          `${image.image_url}-${index}`
                        }
                        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#FFF7E8]"
                      >
                        <div className="aspect-square">
                          <img
                            src={
                              image.image_url
                            }
                            alt={`${name} image ${
                              index + 1
                            }`}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Primary badge */}
                        {primaryImageSource ===
                          "existing" &&
                          index === 0 && (
                            <div className="absolute left-2 top-2 rounded-full bg-[#FFC928] px-2.5 py-1 text-[10px] font-extrabold text-[#172554]">
                              PRIMARY
                            </div>
                          )}

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            removeExistingImage(
                              index
                            )
                          }
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white hover:bg-black"
                          aria-label="Remove image"
                        >
                          ×
                        </button>

                        {/* Primary button */}
                        {!(
                          primaryImageSource ===
                            "existing" &&
                          index === 0
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              setPrimaryExistingImage(
                                index
                              )
                            }
                            className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/90 px-2 py-1.5 text-[10px] font-bold text-[#172554] shadow-sm"
                          >
                            Make Primary
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* New Images */}
            {newImageFiles.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-bold text-[#172554]">
                  New Images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {newImageFiles.map(
                    (image, index) => (
                      <div
                        key={`${image.preview}-${index}`}
                        className="relative overflow-hidden rounded-2xl border border-blue-200 bg-blue-50"
                      >
                        <div className="aspect-square">
                          <img
                            src={
                              image.preview
                            }
                            alt={`New product image ${
                              index + 1
                            }`}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="absolute left-2 top-2 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-extrabold text-white">
                          NEW
                        </div>

                        {/* Primary badge */}
                        {primaryImageSource ===
                          "new" &&
                          index === 0 && (
                            <div className="absolute left-2 top-9 rounded-full bg-[#FFC928] px-2.5 py-1 text-[10px] font-extrabold text-[#172554]">
                              PRIMARY
                            </div>
                          )}

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            removeNewImage(
                              index
                            )
                          }
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white hover:bg-black"
                          aria-label="Remove new image"
                        >
                          ×
                        </button>

                        {/* Primary button */}
                        {!(
                          primaryImageSource ===
                            "new" &&
                          index === 0
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              setPrimaryNewImage(
                                index
                              )
                            }
                            className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/90 px-2 py-1.5 text-[10px] font-bold text-[#172554] shadow-sm"
                          >
                            Make Primary
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Upload */}
            <div className="mt-6">
              <label
                htmlFor="productImages"
                className="mb-1.5 block text-sm font-bold text-[#172554]"
              >
                Add More Images
              </label>

              <input
                id="productImages"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={
                  handleImageChange
                }
                className="block w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-3 text-sm"
              />

              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG or WEBP. Maximum 5 MB
                per image. Maximum 10 images
                per product.
              </p>
            </div>

            {/* Image Count */}
            <div className="mt-4 rounded-xl bg-[#FFF9E8] p-3">
              <p className="text-xs font-semibold text-[#172554]">
                Total images:{" "}
                {existingImages.length +
                  newImageFiles.length}{" "}
                / 10
              </p>
            </div>

          </div>

          {/* ================================================= */}
          {/* Active Product */}
          {/* ================================================= */}

          <div className="mt-8 rounded-2xl bg-[#FFF9E8] p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(
                    event.target.checked
                  )
                }
                className="h-5 w-5 rounded accent-[#FFC928]"
              />

              <div>
                <p className="text-sm font-bold text-[#172554]">
                  Active Product
                </p>

                <p className="text-xs text-gray-500">
                  Active products are visible
                  in the customer store.
                </p>
              </div>
            </label>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
              {successMessage}
            </div>
          )}

          {/* Main Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <Link
              href="/admin/products"
              className="w-full rounded-xl border border-gray-200 py-3.5 text-center text-sm font-bold text-gray-600 sm:w-auto sm:px-6"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isUploadingImage ||
                isDeleting
              }
              className="w-full rounded-xl bg-[#FFC928] py-3.5 text-sm font-extrabold text-[#172554] transition hover:bg-[#f5bb00] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
            >
              {isUploadingImage
                ? "Uploading Images..."
                : isSubmitting
                ? "Saving Changes..."
                : "Save Changes"}
            </button>

          </div>
        </form>

        {/* ================================================= */}
        {/* Product Status */}
        {/* ================================================= */}

        <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#172554]">
            Product Status
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {isActive
              ? "This product is currently visible on the customer store."
              : "This product is currently hidden from the customer store."}
          </p>

          <button
            type="button"
            onClick={
              toggleActive
            }
            disabled={
              isSubmitting ||
              isUploadingImage ||
              isDeleting
            }
            className={`mt-4 rounded-xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {isActive
              ? "Deactivate Product"
              : "Activate Product"}
          </button>
        </div>

        {/* ================================================= */}
        {/* Danger Zone */}
        {/* ================================================= */}

        <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-extrabold text-red-700">
            Danger Zone
          </h2>

          <p className="mt-1 text-sm text-red-600">
            Delete this product permanently.
            Products already used in orders
            cannot be deleted.
          </p>

          <button
            type="button"
            onClick={
              deleteProduct
            }
            disabled={
              isDeleting ||
              isSubmitting ||
              isUploadingImage
            }
            className="mt-4 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting
              ? "Deleting Product..."
              : "Delete Product"}
          </button>
        </div>

      </div>
    </main>
  );
}