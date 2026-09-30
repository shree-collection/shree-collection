"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
};

type UploadedImage = {
  imageUrl: string;
  path: string;
  fileName: string;
};

export default function NewProductPage() {
  const router = useRouter();

  // --------------------------------------------------------
  // Categories
  // --------------------------------------------------------

  const [categories, setCategories] = useState<Category[]>(
    []
  );

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
  const [description, setDescription] = useState("");

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
  // Multiple images
  // --------------------------------------------------------

  const [imageFiles, setImageFiles] =
    useState<File[]>([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);

  const [uploadedImages, setUploadedImages] =
    useState<UploadedImage[]>([]);

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

  const [isLoadingCategories, setIsLoadingCategories] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  // --------------------------------------------------------
  // Derived categories
  // --------------------------------------------------------

  const mainCategories = categories.filter(
    (category) => category.parent_id === null
  );

  const subcategories = categories.filter(
    (category) =>
      category.parent_id === mainCategoryId
  );

  // --------------------------------------------------------
  // Load categories
  // --------------------------------------------------------

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setErrorMessage("");

        const response = await fetch(
          "/api/admin/products/categories",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load categories."
          );
        }

        setCategories(data.categories || []);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load categories."
        );
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // --------------------------------------------------------
  // Generate slug
  // --------------------------------------------------------

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // --------------------------------------------------------
  // Product name change
  // --------------------------------------------------------

  const handleNameChange = (
    value: string
  ) => {
    setName(value);

    if (!slug) {
      setSlug(generateSlug(value));
    }
  };

  // --------------------------------------------------------
  // Main category change
  // --------------------------------------------------------

  const handleMainCategoryChange = (
    value: string
  ) => {
    setMainCategoryId(value);

    // Reset subcategory whenever main category changes.
    setSubcategoryId("");
  };

  // --------------------------------------------------------
  // Image selection
  // --------------------------------------------------------

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setErrorMessage("");

    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const maxSize = 5 * 1024 * 1024;
    const maxFiles = 10;

    if (
      imageFiles.length + files.length >
      maxFiles
    ) {
      setErrorMessage(
        `You can upload a maximum of ${maxFiles} images.`
      );
      return;
    }

    // Validate all selected files first
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(
          `"${file.name}" is not a supported image. Only JPG, PNG and WEBP images are allowed.`
        );
        return;
      }

      if (file.size > maxSize) {
        setErrorMessage(
          `"${file.name}" is larger than 5 MB.`
        );
        return;
      }

      if (file.size === 0) {
        setErrorMessage(
          `"${file.name}" is empty.`
        );
        return;
      }
    }

    const newFiles = [
      ...imageFiles,
      ...files,
    ];

    const newPreviews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setImageFiles(newFiles);

    setImagePreviews([
      ...imagePreviews,
      ...newPreviews,
    ]);

    // New selection means uploaded state is no longer valid.
    setUploadedImages([]);

    // Allow selecting the same file again later.
    event.target.value = "";
  };

  // --------------------------------------------------------
  // Remove image
  // --------------------------------------------------------

  const removeImage = (index: number) => {
    setErrorMessage("");

    const previewUrl =
      imagePreviews[index];

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setImageFiles((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );

    setImagePreviews((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );

    setUploadedImages([]);
  };

  // --------------------------------------------------------
  // Upload images to storage
  // --------------------------------------------------------

  const uploadImages =
    async (): Promise<UploadedImage[]> => {
      if (imageFiles.length === 0) {
        return [];
      }

      setIsUploadingImage(true);
      setErrorMessage("");

      try {
        const formData = new FormData();

        for (const file of imageFiles) {
          formData.append("files", file);
        }

        const response = await fetch(
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

        const images: UploadedImage[] =
          data.images || [];

        if (
          images.length !==
          imageFiles.length
        ) {
          throw new Error(
            "Some images could not be uploaded. Please try again."
          );
        }

        setUploadedImages(images);

        return images;
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Unable to upload images."
        );
      } finally {
        setIsUploadingImage(false);
      }
    };

  // --------------------------------------------------------
  // Submit product
  // --------------------------------------------------------

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
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
        minimumWholesaleQuantity &&
        Number(minimumWholesaleQuantity) < 1
      ) {
        throw new Error(
          "Minimum wholesale quantity must be at least 1."
        );
      }

      // ----------------------------------------------------
      // Upload images
      // ----------------------------------------------------

      let images = uploadedImages;

      if (
        imageFiles.length > 0 &&
        uploadedImages.length !==
          imageFiles.length
      ) {
        images = await uploadImages();
      }

      // ----------------------------------------------------
      // First image becomes primary image
      // ----------------------------------------------------

      const primaryImageUrl =
        images[0]?.imageUrl || null;

      // ----------------------------------------------------
      // Create product
      // ----------------------------------------------------

      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            slug,
            sku,
            description,

            // Product is assigned to the selected subcategory.
            categoryId:
              subcategoryId || null,

            retailPrice,
            compareAtPrice,

            wholesalePrice,
            minimumWholesaleQuantity,

            stockQuantity,

            // Backward-compatible primary image
            imageUrl: primaryImageUrl,

            // Multiple images
            images: images.map(
              (image, index) => ({
                imageUrl:
                  image.imageUrl,
                sortOrder: index,
                isPrimary:
                  index === 0,
              })
            ),

            isActive,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create product."
        );
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create product."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------
  // UI
  // --------------------------------------------------------

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* ==================================================
            Header
        =================================================== */}
        <header className="mb-7">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-xs font-black text-text-muted transition hover:text-brand-navy"
          >
            <span>←</span>
            Back to Products
          </Link>

          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-coral">
                Shree Collection
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                Add Product
              </h1>

              <span className="rounded-full bg-brand-navy px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">
                New Product
              </span>
            </div>

            <p className="mt-2 text-sm text-text-muted">
              Add a new product to your retail and
              wholesale catalogue.
            </p>
          </div>
        </header>

        {/* ==================================================
            Main Form
        =================================================== */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* ==================================================
              Product Information
          =================================================== */}
          <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
            <div className="border-b border-border bg-surface-muted px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-lg text-white">
                  ✦
                </div>

                <div>
                  <h2 className="text-base font-black text-brand-navy">
                    Product Information
                  </h2>

                  <p className="mt-0.5 text-xs text-text-muted">
                    Basic details and catalogue
                    classification.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-black text-brand-navy"
                >
                  Product Name *
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value
                    )
                  }
                  placeholder="Example: Ganesh Statue"
                  required
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-brand-navy outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                />
              </div>

              {/* Slug + SKU */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="slug"
                    className="mb-1.5 block text-xs font-black text-brand-navy"
                  >
                    Product Slug *
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
                    placeholder="ganesh-statue"
                    required
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-brand-navy outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                  />

                  <p className="mt-1.5 text-[10px] text-text-light">
                    Used for the product URL.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="sku"
                    className="mb-1.5 block text-xs font-black text-brand-navy"
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
                    placeholder="SC-STAT-001"
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-brand-navy outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="grid gap-5 md:grid-cols-2">
                {/* Main Category */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label
                      htmlFor="mainCategory"
                      className="block text-xs font-black text-brand-navy"
                    >
                      Main Category *
                    </label>

                    <Link
                      href="/admin/categories/new"
                      target="_blank"
                      className="text-[10px] font-black text-brand-coral transition hover:text-brand-navy"
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
                      isLoadingCategories
                    }
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-brand-navy outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-surface-muted"
                  >
                    <option value="">
                      {isLoadingCategories
                        ? "Loading categories..."
                        : mainCategories.length ===
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

                  {mainCategories.length ===
                    0 &&
                    !isLoadingCategories && (
                      <p className="mt-2 text-[10px] font-bold text-red-600">
                        No main categories found.
                      </p>
                    )}
                </div>

                {/* Subcategory */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label
                      htmlFor="subcategory"
                      className="block text-xs font-black text-brand-navy"
                    >
                      Subcategory *
                    </label>

                    {mainCategoryId && (
                      <Link
                        href={`/admin/categories/new?parent=${mainCategoryId}`}
                        target="_blank"
                        className="text-[10px] font-black text-brand-coral transition hover:text-brand-navy"
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
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-brand-navy outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-surface-muted"
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
                      <p className="mt-2 text-[10px] font-bold text-orange-600">
                        No subcategories found.
                        Add a subcategory before
                        creating this product.
                      </p>
                    )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-xs font-black text-brand-navy"
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
                  placeholder="Describe the product..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-brand-navy outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                />
              </div>
            </div>
          </section>

          {/* ==================================================
              Pricing & Stock
          =================================================== */}
          <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
            <div className="border-b border-border bg-surface-muted px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold text-lg text-brand-navy">
                  ₹
                </div>

                <div>
                  <h2 className="text-base font-black text-brand-navy">
                    Pricing & Stock
                  </h2>

                  <p className="mt-0.5 text-xs text-text-muted">
                    Retail, wholesale and inventory
                    settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Retail */}
                <div>
                  <label
                    htmlFor="retailPrice"
                    className="mb-1.5 block text-xs font-black text-brand-navy"
                  >
                    Retail Price *
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-text-light">
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
                      placeholder="199"
                      required
                      className="w-full rounded-xl border border-border py-3 pl-8 pr-4 text-sm text-brand-navy outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                    />
                  </div>
                </div>

                {/* Wholesale */}
                <div>
                  <label
                    htmlFor="wholesalePrice"
                    className="mb-1.5 block text-xs font-black text-brand-navy"
                  >
                    Wholesale Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-text-light">
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
                      placeholder="140"
                      className="w-full rounded-xl border border-border py-3 pl-8 pr-4 text-sm text-brand-navy outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                    />
                  </div>

                  <p className="mt-1.5 text-[10px] text-text-light">
                    Price offered to wholesale
                    shops.
                  </p>
                </div>

                {/* Compare */}
                <div>
                  <label
                    htmlFor="compareAtPrice"
                    className="mb-1.5 block text-xs font-black text-brand-navy"
                  >
                    Compare Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-text-light">
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
                      placeholder="299"
                      className="w-full rounded-xl border border-border py-3 pl-8 pr-4 text-sm text-brand-navy outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                    />
                  </div>

                  <p className="mt-1.5 text-[10px] text-text-light">
                    Original or crossed-out price.
                  </p>
                </div>

                {/* MOQ */}
                <div>
                  <label
                    htmlFor="minimumWholesaleQuantity"
                    className="mb-1.5 block text-xs font-black text-brand-navy"
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
                    placeholder="6"
                    className="w-full rounded-xl border border-border px-4 py-3 text-sm text-brand-navy outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                  />

                  <p className="mt-1.5 text-[10px] text-text-light">
                    Minimum quantity a wholesale
                    shop must buy.
                  </p>
                </div>

                {/* Stock */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="stockQuantity"
                    className="mb-1.5 block text-xs font-black text-brand-navy"
                  >
                    Stock Quantity *
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
                    className="w-full rounded-xl border border-border px-4 py-3 text-sm text-brand-navy outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                  />
                </div>
              </div>

              {/* Wholesale Information */}
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    🏷️
                  </span>

                  <div>
                    <p className="text-xs font-black text-emerald-800">
                      Wholesale Pricing
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-emerald-700">
                      If you enter a wholesale price,
                      this product will be configured
                      for wholesale sales. The wholesale
                      price should be lower than the
                      retail price.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================================================
              Product Images
          =================================================== */}
          <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
            <div className="border-b border-border bg-surface-muted px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-coral text-lg text-white">
                  ▧
                </div>

                <div>
                  <h2 className="text-base font-black text-brand-navy">
                    Product Images
                  </h2>

                  <p className="mt-0.5 text-xs text-text-muted">
                    Upload up to 10 product images.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <label
                htmlFor="productImages"
                className="mb-2 block text-xs font-black text-brand-navy"
              >
                Upload Images
              </label>

              <label
                htmlFor="productImages"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-muted px-5 py-8 text-center transition hover:border-brand-gold/60 hover:bg-brand-gold/5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                  🖼️
                </span>

                <span className="mt-3 text-sm font-black text-brand-navy">
                  Choose product images
                </span>

                <span className="mt-1 text-[10px] text-text-muted">
                  JPG, PNG or WEBP · Max 5 MB each
                  · Up to 10 images
                </span>

                <span className="mt-3 rounded-lg bg-brand-navy px-3 py-2 text-[10px] font-black text-white">
                  Browse Images
                </span>
              </label>

              <input
                id="productImages"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                className="sr-only"
              />

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-brand-navy">
                        Image Preview
                      </p>

                      <p className="mt-0.5 text-[10px] text-text-light">
                        First image becomes the
                        primary image.
                      </p>
                    </div>

                    <span className="rounded-full bg-surface-muted px-3 py-1.5 text-[10px] font-black text-text-muted">
                      {imagePreviews.length}/10
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {imagePreviews.map(
                      (preview, index) => (
                        <div
                          key={`${preview}-${index}`}
                          className="group relative overflow-hidden rounded-2xl border border-border bg-surface-soft"
                        >
                          <div className="aspect-square">
                            <img
                              src={preview}
                              alt={`Product preview ${
                                index + 1
                              }`}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          </div>

                          {/* Primary badge */}
                          {index === 0 && (
                            <div className="absolute left-2 top-2 rounded-full bg-brand-gold px-2.5 py-1 text-[9px] font-black tracking-wide text-brand-navy shadow-sm">
                              PRIMARY
                            </div>
                          )}

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() =>
                              removeImage(index)
                            }
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-navy/90 text-sm font-bold text-white shadow-sm transition hover:bg-brand-coral"
                            aria-label={`Remove image ${
                              index + 1
                            }`}
                          >
                            ×
                          </button>

                          {/* File name */}
                          <div className="border-t border-border bg-white px-2.5 py-2">
                            <p className="truncate text-[9px] font-medium text-text-muted">
                              {
                                imageFiles[index]
                                  ?.name
                              }
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Uploaded status */}
              {uploadedImages.length > 0 && (
                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm">
                      ✓
                    </span>

                    <p className="text-xs font-bold text-emerald-700">
                      {uploadedImages.length} image
                      {uploadedImages.length > 1
                        ? "s"
                        : ""}{" "}
                      uploaded successfully.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ==================================================
              Status
          =================================================== */}
          <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-brand-navy">
                    Product Status
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-text-muted">
                    Active products are visible in the
                    customer store.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsActive(!isActive)
                  }
                  aria-pressed={isActive}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    isActive
                      ? "bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      isActive
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div
                className={`mt-4 rounded-xl px-4 py-3 text-xs font-bold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-50 text-slate-500"
                }`}
              >
                {isActive
                  ? "✓ Product will be visible in the store."
                  : "Product will be saved as inactive."}
              </div>
            </div>
          </section>

          {/* ==================================================
              Error
          =================================================== */}
          {errorMessage && (
            <div
              role="alert"
              className="rounded-2xl border border-red-100 bg-red-50 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  ⚠️
                </span>

                <div>
                  <p className="text-xs font-black text-red-700">
                    Unable to create product
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600/80">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              Actions
          =================================================== */}
          <div className="sticky bottom-3 z-20 rounded-2xl border border-border bg-white/95 p-3 shadow-lg backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/admin/products"
                className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-white px-6 py-3.5 text-sm font-black text-text-secondary transition hover:bg-surface-muted hover:text-brand-navy sm:w-auto"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isUploadingImage
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-7 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isUploadingImage ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Uploading Images...
                  </>
                ) : isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating Product...
                  </>
                ) : (
                  <>
                    <span>+</span>
                    Create Product
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}