"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Customer = {
  customerKey: string;
  name: string;
  phone: string;
  city: string;
  orders: number;
  totalAmount: number;
  lastOrderDate: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/customers", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load customers."
          );
        }

        setCustomers(data.customers || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load customers."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredCustomers = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !searchText ||
        customer.name.toLowerCase().includes(searchText) ||
        customer.phone.toLowerCase().includes(searchText) ||
        customer.city.toLowerCase().includes(searchText);

      let matchesOrderFilter = true;

      if (orderFilter === "one") {
        matchesOrderFilter = customer.orders === 1;
      }

      if (orderFilter === "repeat") {
        matchesOrderFilter = customer.orders > 1;
      }

      return matchesSearch && matchesOrderFilter;
    });
  }, [customers, search, orderFilter]);

  const totalCustomers = customers.length;

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.orders,
    0
  );

  const totalSales = customers.reduce(
    (sum, customer) => sum + customer.totalAmount,
    0
  );

  const repeatCustomers = customers.filter(
    (customer) => customer.orders > 1
  ).length;

  return (
    <main className="min-h-screen bg-[#FFF9E8] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#172554]">
              Customers
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View your store customers and their order history.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-[#172554] shadow-sm hover:bg-gray-50"
          >
            View Orders
          </Link>
        </div>

        {/* Summary */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Customers
            </p>

            <p className="mt-2 text-2xl font-extrabold text-[#172554]">
              {totalCustomers}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-2xl font-extrabold text-[#172554]">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Repeat Customers
            </p>

            <p className="mt-2 text-2xl font-extrabold text-[#172554]">
              {repeatCustomers}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Total Order Value
            </p>

            <p className="mt-2 text-2xl font-extrabold text-[#172554]">
              ₹{totalSales.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Search & Filters */}
        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Search Customer
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, mobile or city..."
                className="w-full rounded-xl border border-gray-200 bg-[#FFFDF5] px-4 py-3 text-sm outline-none transition focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/30"
              />
            </div>

            <div className="min-w-[190px]">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Customer Type
              </label>

              <select
                value={orderFilter}
                onChange={(event) =>
                  setOrderFilter(event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-[#FFFDF5] px-4 py-3 text-sm font-semibold text-[#172554] outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/30"
              >
                <option value="all">All Customers</option>
                <option value="one">First-time Customers</option>
                <option value="repeat">Repeat Customers</option>
              </select>
            </div>
          </div>

          {(search || orderFilter !== "all") && (
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <p className="text-sm font-semibold text-gray-500">
                Showing {filteredCustomers.length} of{" "}
                {customers.length} customers
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setOrderFilter("all");
                }}
                className="text-sm font-bold text-[#F43F5E] hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Customers */}
        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm font-semibold text-gray-500">
              Loading customers...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm font-semibold text-gray-500">
              Unable to load customers.
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-base font-bold text-[#172554]">
                No customers found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="divide-y divide-gray-100 md:hidden">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.customerKey}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-[#172554]">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          📱 {customer.phone}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          📍 {customer.city || "—"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          customer.orders > 1
                            ? "bg-green-50 text-green-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {customer.orders > 1
                          ? "Repeat"
                          : "New"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[#FFF9E8] p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Orders
                        </p>

                        <p className="mt-1 font-extrabold text-[#172554]">
                          {customer.orders}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#FFF9E8] p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Order Value
                        </p>

                        <p className="mt-1 font-extrabold text-[#172554]">
                          ₹
                          {customer.totalAmount.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                      Last Order:{" "}
                      <span className="font-semibold text-gray-700">
                        {formatDate(customer.lastOrderDate)}
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-gray-100 bg-[#FFF9E8]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-extrabold uppercase text-gray-500">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-xs font-extrabold uppercase text-gray-500">
                        Mobile
                      </th>

                      <th className="px-5 py-4 text-xs font-extrabold uppercase text-gray-500">
                        City
                      </th>

                      <th className="px-5 py-4 text-xs font-extrabold uppercase text-gray-500">
                        Orders
                      </th>

                      <th className="px-5 py-4 text-xs font-extrabold uppercase text-gray-500">
                        Order Value
                      </th>

                      <th className="px-5 py-4 text-xs font-extrabold uppercase text-gray-500">
                        Last Order
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr
                        key={customer.customerKey}
                        className="border-b border-gray-100 last:border-0 hover:bg-[#FFFDF5]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC928] text-sm font-extrabold text-[#172554]">
                              {customer.name
                                ? customer.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "C"}
                            </div>

                            <div>
                              <p className="font-bold text-[#172554]">
                                {customer.name}
                              </p>

                              <span
                                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  customer.orders > 1
                                    ? "bg-green-50 text-green-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {customer.orders > 1
                                  ? "Repeat Customer"
                                  : "New Customer"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {customer.phone}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {customer.city || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            {customer.orders}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-bold text-[#172554]">
                          ₹
                          {customer.totalAmount.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {formatDate(customer.lastOrderDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}