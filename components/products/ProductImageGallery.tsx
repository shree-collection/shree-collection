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
  /* ======================================================
     PREPARE UNIQUE IMAGES
  ====================================================== */

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

  /* ======================================================
     SELECTED IMAGE
  ====================================================== */

  const [selectedImage, setSelectedImage] =
    useState(uniqueImages[0] || "");

  const [isZoomOpen, setIsZoomOpen] =
    useState(false);

  /* ======================================================
     KEEP SELECTED IMAGE VALID
  ====================================================== */

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

  /* ======================================================
     SELECTED IMAGE INDEX
  ====================================================== */

  const selectedIndex =
    uniqueImages.indexOf(selectedImage);

  /* ======================================================
     PREVIOUS IMAGE
  ====================================================== */

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

  /* ======================================================
     NEXT IMAGE
  ====================================================== */

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

  /* ======================================================
     KEYBOARD NAVIGATION
  ====================================================== */

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

  /* ======================================================
     NO IMAGES
  ====================================================== */

  if (uniqueImages.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex h-[320px] items-center justify-center sm:h-[500px]">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">
              🎁
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-500">
              No product image available
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* =================================================
          GALLERY
      ================================================= */}

      <div className="w-full">

        {/* =================================================
            MAIN IMAGE
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            setIsZoomOpen(true)
          }
          className="
            group
            relative
            flex
            h-[320px]
            w-full
            cursor-zoom-in
            items-center
            justify-center
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            transition
            hover:border-slate-300
            hover:shadow-md
            sm:h-[500px]
          "
          aria-label={`View ${productName} image`}
        >
          {/* Subtle background */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-br
              from-slate-50
              via-white
              to-slate-50
            "
            aria-hidden="true"
          />

          {/* Product image */}

          <img
            src={selectedImage}
            alt={productName}
            className="
              relative
              z-[1]
              h-full
              w-full
              object-contain
              p-6
              transition-transform
              duration-500
              group-hover:scale-[1.035]
              sm:p-10
            "
          />

          {/* Discount */}

          {discount > 0 && (
            <span
              className="
                absolute
                left-4
                top-4
                z-10
                rounded-lg
                bg-[#f43f5e]
                px-3
                py-1.5
                text-[10px]
                font-black
                text-white
                shadow-sm
                sm:text-xs
              "
            >
              {discount}% OFF
            </span>
          )}

          {/* Image counter */}

          {uniqueImages.length > 1 && (
            <span
              className="
                absolute
                right-4
                top-4
                z-10
                rounded-lg
                bg-white/95
                px-3
                py-1.5
                text-[10px]
                font-extrabold
                text-[#172554]
                shadow-sm
                backdrop-blur
              "
            >
              {selectedIndex + 1} /{" "}
              {uniqueImages.length}
            </span>
          )}

          {/* Zoom hint */}

          <span
            className="
              absolute
              bottom-4
              left-1/2
              z-10
              hidden
              -translate-x-1/2
              items-center
              gap-1.5
              rounded-full
              bg-white/95
              px-4
              py-2
              text-xs
              font-bold
              text-slate-700
              shadow-sm
              backdrop-blur
              sm:flex
            "
          >
            <span aria-hidden="true">
              🔍
            </span>
            Click to enlarge
          </span>

          {/* Hover overlay */}

          <span
            className="
              pointer-events-none
              absolute
              inset-0
              z-[2]
              bg-black/5
              opacity-0
              transition-opacity
              duration-300
              group-hover:opacity-100
            "
            aria-hidden="true"
          />
        </button>

        {/* =================================================
            THUMBNAILS
        ================================================= */}

        {uniqueImages.length > 1 && (
          <div className="mt-3">

            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:gap-2.5">

              {uniqueImages.map(
                (image, index) => {
                  const isSelected =
                    image ===
                    selectedImage;

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          image
                        )
                      }
                      aria-label={`View ${productName} image ${
                        index + 1
                      }`}
                      aria-current={
                        isSelected
                          ? "true"
                          : undefined
                      }
                      className={`
                        group/thumb
                        relative
                        h-[68px]
                        w-[68px]
                        shrink-0
                        overflow-hidden
                        rounded-xl
                        border-2
                        bg-white
                        transition
                        duration-200
                        sm:h-20
                        sm:w-20
                        ${
                          isSelected
                            ? "border-[#f43f5e] shadow-sm"
                            : "border-slate-200 hover:border-slate-400"
                        }
                      `}
                    >
                      <img
                        src={image}
                        alt={`${productName} image ${
                          index + 1
                        }`}
                        className={`
                          h-full
                          w-full
                          object-contain
                          p-1.5
                          transition
                          duration-300
                          group-hover/thumb:scale-105
                          ${
                            isSelected
                              ? ""
                              : "opacity-70 group-hover/thumb:opacity-100"
                          }
                        `}
                      />

                      {isSelected && (
                        <span
                          className="
                            absolute
                            bottom-1
                            left-1/2
                            -translate-x-1/2
                            rounded-full
                            bg-[#f43f5e]
                            px-2
                            py-0.5
                            text-[7px]
                            font-black
                            text-white
                            shadow-sm
                          "
                        >
                          Selected
                        </span>
                      )}
                    </button>
                  );
                }
              )}

            </div>

            <p className="mt-2 text-center text-[10px] font-medium text-slate-400">
              Image {selectedIndex + 1} of{" "}
              {uniqueImages.length}
            </p>

          </div>
        )}
      </div>

      {/* =================================================
          IMAGE LIGHTBOX
      ================================================= */}

      {isZoomOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/90
            p-4
            backdrop-blur-sm
          "
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} image viewer`}
          onClick={() =>
            setIsZoomOpen(false)
          }
        >
          {/* Close */}

          <button
            type="button"
            onClick={() =>
              setIsZoomOpen(false)
            }
            className="
              absolute
              right-4
              top-4
              z-30
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white
              text-2xl
              font-bold
              text-slate-800
              shadow-lg
              transition
              hover:bg-slate-100
              sm:right-6
              sm:top-6
            "
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
              className="
                absolute
                left-3
                z-30
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-white
                text-3xl
                font-light
                text-slate-800
                shadow-lg
                transition
                hover:bg-slate-100
                sm:left-6
                sm:h-12
                sm:w-12
              "
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* Large Image */}

          <div
            className="
              flex
              max-h-[90vh]
              max-w-[90vw]
              items-center
              justify-center
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={selectedImage}
              alt={productName}
              className="
                max-h-[85vh]
                max-w-[85vw]
                object-contain
              "
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
              className="
                absolute
                right-3
                z-30
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-white
                text-3xl
                font-light
                text-slate-800
                shadow-lg
                transition
                hover:bg-slate-100
                sm:right-6
                sm:h-12
                sm:w-12
              "
              aria-label="Next image"
            >
              ›
            </button>
          )}

          {/* Image Counter */}

          {uniqueImages.length > 1 && (
            <div
              className="
                absolute
                bottom-5
                left-1/2
                -translate-x-1/2
                rounded-full
                bg-black/70
                px-4
                py-2
                text-sm
                font-bold
                text-white
                backdrop-blur
              "
            >
              {selectedIndex + 1} /{" "}
              {uniqueImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}