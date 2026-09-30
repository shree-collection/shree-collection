"use client";

import { useEffect, useMemo, useState } from "react";

type ProductImageGalleryProps = {
  productName: string;
  images: string[];
  discount?: number;
};

export default function ProductImageGallery({
  productName,
  images,
  discount = 0,
}: ProductImageGalleryProps) {
  /* --------------------------------
     Prepare unique images
  -------------------------------- */

  const uniqueImages = useMemo(() => {
    return [
      ...new Set(
        images.filter(
          (image): image is string =>
            Boolean(image)
        )
      ),
    ];
  }, [images]);

  /* --------------------------------
     Selected image
  -------------------------------- */

  const [selectedImage, setSelectedImage] =
    useState(uniqueImages[0] || "");

  const [isZoomOpen, setIsZoomOpen] =
    useState(false);

  /* --------------------------------
     Keep selected image valid
     when product/images change
  -------------------------------- */

  useEffect(() => {
    if (
      uniqueImages.length > 0 &&
      !uniqueImages.includes(selectedImage)
    ) {
      setSelectedImage(uniqueImages[0]);
    }

    if (uniqueImages.length === 0) {
      setSelectedImage("");
    }
  }, [uniqueImages, selectedImage]);

  /* --------------------------------
     Selected image index
  -------------------------------- */

  const selectedIndex =
    uniqueImages.indexOf(selectedImage);

  /* --------------------------------
     Previous image
  -------------------------------- */

  const goToPrevious = () => {
    if (uniqueImages.length <= 1) {
      return;
    }

    const previousIndex =
      selectedIndex <= 0
        ? uniqueImages.length - 1
        : selectedIndex - 1;

    setSelectedImage(
      uniqueImages[previousIndex]
    );
  };

  /* --------------------------------
     Next image
  -------------------------------- */

  const goToNext = () => {
    if (uniqueImages.length <= 1) {
      return;
    }

    const nextIndex =
      selectedIndex >=
      uniqueImages.length - 1
        ? 0
        : selectedIndex + 1;

    setSelectedImage(
      uniqueImages[nextIndex]
    );
  };

  /* --------------------------------
     Keyboard navigation
  -------------------------------- */

  useEffect(() => {
    if (!isZoomOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setIsZoomOpen(false);
        return;
      }

      if (event.key === "ArrowLeft") {
        goToPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        goToNext();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [
    isZoomOpen,
    selectedIndex,
    uniqueImages,
  ]);

  /* --------------------------------
     No images
  -------------------------------- */

  if (uniqueImages.length === 0) {
    return (
      <div className="overflow-hidden rounded-3xl border border-border bg-brand-soft-gold shadow-soft">
        <div className="relative flex h-[300px] items-center justify-center sm:h-[520px]">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-5xl shadow-soft">
              🎁
            </div>

            <p className="mt-4 text-sm font-semibold text-text-muted">
              No product image available
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        {/* Main Image */}
        <button
          type="button"
          onClick={() => setIsZoomOpen(true)}
          className="group relative flex h-[300px] w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-3xl border border-border bg-brand-soft-gold shadow-soft transition hover:shadow-card sm:h-[520px]"
          aria-label={`View ${productName} image`}
        >
          {/* Decorative Background */}
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-brand-gold/15 transition-transform duration-500 group-hover:scale-125"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-brand-coral/5"
            aria-hidden="true"
          />

          {/* Product Image */}
          <img
            src={selectedImage}
            alt={productName}
            className="relative z-[1] h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105 sm:p-8"
          />

          {/* Discount */}
          {discount > 0 && (
            <span className="absolute left-4 top-4 z-10 rounded-full bg-brand-coral px-3.5 py-1.5 text-xs font-black text-white shadow-sm">
              {discount}% OFF
            </span>
          )}

          {/* Image Count */}
          {uniqueImages.length > 1 && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-extrabold text-brand-navy shadow-sm backdrop-blur">
              {selectedIndex + 1} /{" "}
              {uniqueImages.length}
            </span>
          )}

          {/* Zoom Hint */}
          <span className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-text-primary shadow-sm backdrop-blur sm:flex">
            <span aria-hidden="true">🔍</span>
            Click to enlarge
          </span>

          {/* Hover Overlay */}
          <span
            className="pointer-events-none absolute inset-0 z-[2] bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />
        </button>

        {/* Thumbnails */}
        {uniqueImages.length > 1 && (
          <div className="mt-4">
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-2 sm:gap-3">
              {uniqueImages.map(
                (image, index) => {
                  const isSelected =
                    image === selectedImage;

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(image)
                      }
                      aria-label={`View ${productName} image ${
                        index + 1
                      }`}
                      aria-current={
                        isSelected
                          ? "true"
                          : undefined
                      }
                      className={`group/thumb relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition duration-200 sm:h-24 sm:w-24 ${
                        isSelected
                          ? "border-brand-coral shadow-card"
                          : "border-border hover:border-brand-gold hover:shadow-soft"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${productName} image ${
                          index + 1
                        }`}
                        className={`h-full w-full object-contain p-1.5 transition duration-300 group-hover/thumb:scale-105 ${
                          isSelected
                            ? ""
                            : "opacity-75 group-hover/thumb:opacity-100"
                        }`}
                      />

                      {isSelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-brand-coral px-2 py-0.5 text-[8px] font-black text-white shadow-sm">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>

            <p className="mt-1.5 text-center text-[11px] font-semibold text-text-muted">
              Image {selectedIndex + 1} of{" "}
              {uniqueImages.length}
            </p>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} image viewer`}
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-bold text-text-primary shadow-lg transition hover:bg-surface-muted sm:right-6 sm:top-6"
            aria-label="Close image viewer"
          >
            ×
          </button>

          {/* Previous */}
          {uniqueImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-3xl font-light text-text-primary shadow-lg transition hover:bg-surface-muted sm:left-6 sm:h-12 sm:w-12"
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* Large Image */}
          <div
            className="flex max-h-[90vh] max-w-[90vw] items-center justify-center"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={selectedImage}
              alt={productName}
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
          </div>

          {/* Next */}
          {uniqueImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goToNext();
              }}
              className="absolute right-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-3xl font-light text-text-primary shadow-lg transition hover:bg-surface-muted sm:right-6 sm:h-12 sm:w-12"
              aria-label="Next image"
            >
              ›
            </button>
          )}

          {/* Image Counter */}
          {uniqueImages.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              {selectedIndex + 1} /{" "}
              {uniqueImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}