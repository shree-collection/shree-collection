"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Customer = {
  name: string;
  phone: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: string;
  payment_method: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  created_at: string;
  updated_at: string;
};

function formatCurrency(amount: number) {
  return `₹${Number(amount || 0).toLocaleString(
    "en-IN"
  )}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function getStatusClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "confirmed":
      return "bg-blue-100 text-blue-700";

    case "processing":
      return "bg-purple-100 text-purple-700";

    case "shipped":
      return "bg-indigo-100 text-indigo-700";

    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

function getPaymentClass(
  paymentStatus: string
) {
  switch (paymentStatus) {
    case "paid":
      return "text-green-600";

    case "failed":
      return "text-red-600";

    case "refunded":
      return "text-orange-600";

    default:
      return "text-orange-600";
  }
}

export default function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const [phone, setPhone] = useState("");

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCustomer = async () => {
      try {
        const resolvedParams = await params;

        const cleanPhone =
          resolvedParams.phone.replace(
            /\D/g,
            ""
          );

        setPhone(cleanPhone);

        const response = await fetch(
          `/api/admin/customers/${encodeURIComponent(
            cleanPhone
          )}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load customer."
          );
        }

        if (cancelled) {
          return;
        }

        setCustomer(data.customer);
        setOrders(data.orders || []);
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load customer."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomer();

    return () => {
      cancelled = true;
    };
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF9E8] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="text-4xl">👤</div>

          <p className="mt-3 text-sm font-semibold text-gray-500">
            Loading customer...
          </p>
        </div>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="min-h-screen bg-[#FFF9E8] px-4 py-8">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">⚠️</div>

          <h1 className="mt-4 text-xl font-extrabold text-[#172554]">
            Unable to Load Customer
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "Customer not found."}
          </p>

          <Link
            href="/admin/customers"
            className="mt-6 inline-block rounded-xl bg-[#FFC928] px-5 py-3 text-sm font-bold text-[#172554]"
          >
            ← Back to Customers
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF9E8] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div>
          <Link
            href="/admin/customers"
            className="text-sm font-bold text-[#F43F5E]"
          >
            ← Back to Customers
          </Link>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-[#172554]">
                {customer.name}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                📱 {customer.phone}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                📍 {customer.city}
                {customer.state &&
                customer.state !== "-"
                  ? `, ${customer.state}`
                  : ""}
              </p>
            </div>

            <span className="w-fit rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-700">
              {customer.totalOrders > 1
                ? "Repeat Customer"
                : "Customer"}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-2xl font-extrabold text-[#172554]">
              {customer.totalOrders}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Total Spent
            </p>

            <p className="mt-2 text-2xl font-extrabold text-[#F43F5E]">
              {formatCurrency(
                customer.totalSpent
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Last Order
            </p>

            <p className="mt-2 text-sm font-extrabold text-[#172554]">
              {formatDate(
                customer.lastOrderDate
              )}
            </p>
          </div>
        </div>

        {/* Orders */}
        <div className="mt-6 rounded-3xl bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="text-lg font-extrabold text-[#172554]">
              Order History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Retail orders placed by this customer.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No orders found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-5 transition hover:bg-[#FFF9E8]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-[#172554]">
                          {order.order_number}
                        </p>

                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        {formatDate(
                          order.created_at
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {order.payment_method ===
                        "cod"
                          ? "Cash on Delivery"
                          : order.payment_method ||
                            "Payment pending"}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-lg font-extrabold text-[#F43F5E]">
                        {formatCurrency(
                          Number(
                            order.total_amount
                          )
                        )}
                      </p>

                      <p
                        className={`mt-1 text-xs font-bold capitalize ${getPaymentClass(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status}
                      </p>

                      <span className="mt-2 inline-block text-xs font-bold text-[#F43F5E]">
                        View Order →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Latest Delivery Address */}
        {orders[0] && (
          <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-extrabold text-[#172554]">
              Latest Delivery Address
            </h2>

            <div className="mt-4 rounded-2xl bg-[#FFF9E8] p-4">
              <p className="text-sm leading-6 text-[#172554]">
                {orders[0].shipping_address ||
                  "-"}
                <br />

                {orders[0].shipping_city ||
                  ""}

                {orders[0].shipping_city &&
                orders[0].shipping_state
                  ? ", "
                  : ""}

                {orders[0].shipping_state ||
                  ""}

                {orders[0].shipping_pincode
                  ? ` - ${orders[0].shipping_pincode}`
                  : ""}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pb-6">
          <Link
            href="/admin/customers"
            className="inline-block rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 shadow-sm hover:bg-gray-50"
          >
            ← Back to Customers
          </Link>
        </div>
      </div>
    </main>
  );
}