"use client";

import { useEffect } from "react";

const STORAGE_KEY = "shree-recently-viewed";
const MAX_PRODUCTS = 6;

type TrackRecentlyViewedProps = {
  productId: string;
};

export default function TrackRecentlyViewed({
  productId,
}: TrackRecentlyViewedProps) {
  useEffect(() => {
    if (!productId) {
      return;
    }

    try {
      const stored =
        localStorage.getItem(STORAGE_KEY);

      let ids: string[] = [];

      if (stored) {
        const parsed: unknown =
          JSON.parse(stored);

        if (Array.isArray(parsed)) {
          ids = parsed.filter(
            (id): id is string =>
              typeof id === "string" &&
              id.length > 0
          );
        }
      }

      // Remove the current product if already present.
      ids = ids.filter(
        (id) => id !== productId
      );

      // Put the current product first.
      ids.unshift(productId);

      // Keep only the latest products.
      ids = ids.slice(0, MAX_PRODUCTS);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(ids)
      );
    } catch (error) {
      console.error(
        "Unable to save recently viewed product:",
        error
      );
    }
  }, [productId]);

  return null;
}