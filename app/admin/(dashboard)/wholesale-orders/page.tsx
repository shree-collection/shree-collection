"use client";

import AdminWholesaleOrdersList from "@/components/admin/AdminWholesaleOrdersList";

export default function WholesaleOrdersPage() {
  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-green-600">
            Wholesale
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-[#172554]">
            Wholesale Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage orders placed by wholesale shops.
          </p>
        </div>

        <AdminWholesaleOrdersList />
      </div>
    </main>
  );
}