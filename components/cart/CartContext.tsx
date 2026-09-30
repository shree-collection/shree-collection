"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "@/types/product";

export type CartItem = Product & {
  quantity: number;
  minQuantity?: number;
  isWholesale?: boolean;
};

type CartContextType = {
  // Retail cart
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  // Wholesale cart
  wholesaleCart: CartItem[];
  addToWholesaleCart: (
    product: CartItem,
    quantity?: number
  ) => void;
  removeFromWholesaleCart: (
    productId: string
  ) => void;
  updateWholesaleQuantity: (
    productId: string,
    quantity: number
  ) => void;
  clearWholesaleCart: () => void;
  wholesaleCartCount: number;
  wholesaleCartTotal: number;
};

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

const CART_STORAGE_KEY = "shree-cart";
const WHOLESALE_CART_STORAGE_KEY =
  "shree-wholesale-cart";

function isValidNumber(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function cleanCartItems(
  items: unknown
): CartItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter((item): item is CartItem => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const cartItem = item as CartItem;

    return (
      typeof cartItem.id === "string" &&
      typeof cartItem.name === "string" &&
      isValidNumber(cartItem.price) &&
      isValidNumber(cartItem.quantity) &&
      cartItem.quantity > 0 &&
      isValidNumber(cartItem.stockQuantity) &&
      cartItem.stockQuantity > 0
    );
  });
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wholesaleCart, setWholesaleCart] =
    useState<CartItem[]>([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  /*
   * ================================
   * LOAD CARTS FROM LOCAL STORAGE
   * ================================
   */

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(
          CART_STORAGE_KEY
        );

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        setCart(
          cleanCartItems(parsedCart)
        );
      }

      const savedWholesaleCart =
        localStorage.getItem(
          WHOLESALE_CART_STORAGE_KEY
        );

      if (savedWholesaleCart) {
        const parsedWholesaleCart =
          JSON.parse(savedWholesaleCart);

        setWholesaleCart(
          cleanCartItems(parsedWholesaleCart)
        );
      }
    } catch (error) {
      console.error(
        "Unable to load cart:",
        error
      );

      localStorage.removeItem(
        CART_STORAGE_KEY
      );

      localStorage.removeItem(
        WHOLESALE_CART_STORAGE_KEY
      );

      setCart([]);
      setWholesaleCart([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /*
   * ================================
   * SAVE RETAIL CART
   * ================================
   */

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart)
    );
  }, [cart, isLoaded]);

  /*
   * ================================
   * SAVE WHOLESALE CART
   * ================================
   */

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localStorage.setItem(
      WHOLESALE_CART_STORAGE_KEY,
      JSON.stringify(wholesaleCart)
    );
  }, [
    wholesaleCart,
    isLoaded,
  ]);

  /*
   * ================================
   * RETAIL CART
   * ================================
   */

  const addToCart = (
    product: Product,
    quantity = 1
  ) => {
    if (
      !isValidNumber(product.price) ||
      !isValidNumber(
        product.stockQuantity
      ) ||
      product.stockQuantity <= 0
    ) {
      return;
    }

    const safeQuantity =
      Number.isFinite(quantity) &&
      quantity > 0
        ? quantity
        : 1;

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            item.id === product.id
        );

      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity +
            safeQuantity,
          product.stockQuantity
        );

        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: Math.min(
            safeQuantity,
            product.stockQuantity
          ),
          isWholesale: false,
        },
      ];
    });
  };

  const removeFromCart = (
    productId: string
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.id !== productId
      )
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number
  ) => {
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      removeFromCart(productId);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: Math.min(
                Math.floor(quantity),
                item.stockQuantity
              ),
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      (isValidNumber(item.quantity)
        ? item.quantity
        : 0),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      (isValidNumber(item.price)
        ? item.price
        : 0) *
        (isValidNumber(item.quantity)
          ? item.quantity
          : 0),
    0
  );

  /*
   * ================================
   * WHOLESALE CART
   * ================================
   */

  const addToWholesaleCart = (
    product: CartItem,
    quantity = 1
  ) => {
    if (
      !isValidNumber(product.price) ||
      !isValidNumber(
        product.stockQuantity
      ) ||
      product.stockQuantity <= 0
    ) {
      return;
    }

    const minimumQuantity =
      isValidNumber(product.minQuantity) &&
      product.minQuantity > 0
        ? Math.floor(product.minQuantity)
        : 1;

    const safeQuantity =
      Number.isFinite(quantity) &&
      quantity > 0
        ? Math.floor(quantity)
        : minimumQuantity;

    setWholesaleCart(
      (currentCart) => {
        const existingItem =
          currentCart.find(
            (item) =>
              item.id === product.id
          );

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity +
              safeQuantity,
            product.stockQuantity
          );

          return currentCart.map(
            (item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: Math.max(
                      newQuantity,
                      minimumQuantity
                    ),
                    minQuantity:
                      minimumQuantity,
                    isWholesale: true,
                  }
                : item
          );
        }

        const validQuantity = Math.min(
          Math.max(
            safeQuantity,
            minimumQuantity
          ),
          product.stockQuantity
        );

        return [
          ...currentCart,
          {
            ...product,
            quantity: validQuantity,
            minQuantity:
              minimumQuantity,
            isWholesale: true,
          },
        ];
      }
    );
  };

  const removeFromWholesaleCart = (
    productId: string
  ) => {
    setWholesaleCart(
      (currentCart) =>
        currentCart.filter(
          (item) =>
            item.id !== productId
        )
    );
  };

  const updateWholesaleQuantity = (
    productId: string,
    quantity: number
  ) => {
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return;
    }

    setWholesaleCart(
      (currentCart) =>
        currentCart.map((item) => {
          if (
            item.id !== productId
          ) {
            return item;
          }

          const minimumQuantity =
            isValidNumber(
              item.minQuantity
            ) &&
            item.minQuantity! > 0
              ? Math.floor(
                  item.minQuantity!
                )
              : 1;

          const safeQuantity =
            Math.floor(quantity);

          return {
            ...item,
            quantity: Math.min(
              Math.max(
                safeQuantity,
                minimumQuantity
              ),
              item.stockQuantity
            ),
          };
        })
    );
  };

  const clearWholesaleCart = () => {
    setWholesaleCart([]);
  };

  const wholesaleCartCount =
    wholesaleCart.reduce(
      (total, item) =>
        total +
        (isValidNumber(
          item.quantity
        )
          ? item.quantity
          : 0),
      0
    );

  const wholesaleCartTotal =
    wholesaleCart.reduce(
      (total, item) =>
        total +
        (isValidNumber(item.price)
          ? item.price
          : 0) *
          (isValidNumber(
            item.quantity
          )
            ? item.quantity
            : 0),
      0
    );

  return (
    <CartContext.Provider
      value={{
        /*
         * Retail
         */
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,

        /*
         * Wholesale
         */
        wholesaleCart,
        addToWholesaleCart,
        removeFromWholesaleCart,
        updateWholesaleQuantity,
        clearWholesaleCart,
        wholesaleCartCount,
        wholesaleCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}