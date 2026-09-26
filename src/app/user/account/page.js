
"use client";

import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  RotateCcw,
  Bell,
  LogOut,
  ChevronRight,
  Truck,
  Clock,
  CheckCircle,
} from "lucide-react";

const orders = [
  {
    order_id: 1001,
    total_amount: 12500,
    order_status: "shipped",
    payment_status: "pending",
  },
  {
    order_id: 1000,
    total_amount: 8900,
    order_status: "delivered",
    payment_status: "successful",
  },
];

const returns = [
  {
    return_id: 1001,
    order_id: 1001,
    request_type: "return",
    status: "approved",
  },
];

const notifications = [
  {
    notification_id: 1,
    title: "Order Shipped",
    message: "Your order #1001 has been shipped.",
    is_read: false,
  },
];

const statusLabel = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusStyle = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AccountPage() {
  const pendingOrders = orders.filter(
    (order) =>
      order.order_status === "pending" ||
      order.order_status === "processing"
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.order_status === "shipped"
  ).length;

  const unreadNotifications = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">
      {/* Header */}
      <header className="border-b border-[#322D29]/10 bg-[#322D29]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link
            href="/user"
            className="text-2xl font-semibold tracking-[0.25em] text-[#EFE9E1]"
          >
            VELORA
          </Link>

          <Link
            href="/user/shop"
            className="rounded-full border border-[#EFE9E1]/40 px-5 py-2 text-sm text-[#EFE9E1] transition hover:bg-[#EFE9E1] hover:text-[#322D29]"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-6 border-b border-[#322D29]/10 pb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#72383D]">
              My Account
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Chathuni Imasha
            </h2>

            <p className="mt-1 text-sm text-[#322D29]/60">
              customer@example.com
            </p>
          </div>

          <nav className="space-y-1">
            <AccountLink
              href="/user/account"
              icon={<User size={18} />}
              label="Profile"
              active
            />

            <AccountLink
              href="/user/account/orders"
              icon={<Package size={18} />}
              label="Orders"
            />

            <AccountLink
              href="/user/account/wishlist"
              icon={<Heart size={18} />}
              label="Wishlist"
            />

            <AccountLink
              href="/user/account/addresses"
              icon={<MapPin size={18} />}
              label="Addresses"
            />

            <AccountLink
              href="/user/account/returns"
              icon={<RotateCcw size={18} />}
              label="Returns & Exchanges"
            />

            <AccountLink
              href="/user/account/notifications"
              icon={<Bell size={18} />}
              label="Notifications"
              badge={unreadNotifications}
            />

            <button
              onClick={() => console.log("Logout")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </aside>

        {/* Main */}
        <section>
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.2em] text-[#72383D]">
              My Account
            </p>

            <h1 className="mt-2 text-4xl font-semibold">
              Welcome back, Chathuni
            </h1>

            <p className="mt-2 text-[#322D29]/60">
              Manage your orders, returns and account information.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Package size={21} />}
              title="Total Orders"
              value={orders.length}
            />

            <StatCard
              icon={<Clock size={21} />}
              title="Pending"
              value={pendingOrders}
            />

            <StatCard
              icon={<Truck size={21} />}
              title="Shipped"
              value={shippedOrders}
            />

            <StatCard
              icon={<RotateCcw size={21} />}
              title="Returns"
              value={returns.length}
            />
          </div>

          {/* Recent Orders */}
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <p className="mt-1 text-sm text-[#322D29]/60">
                  Your latest orders
                </p>
              </div>

              <Link
                href="/user/account/orders"
                className="text-sm font-medium text-[#72383D] hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="flex flex-col gap-4 rounded-2xl border border-[#322D29]/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      Order #{order.order_id}
                    </p>

                    <p className="mt-1 text-sm text-[#322D29]/60">
                      Rs. {order.total_amount.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusStyle[order.order_status]
                      }`}
                    >
                      {statusLabel[order.order_status]}
                    </span>

                    <Link
                      href={`/user/account/orders/${order.order_id}`}
                      className="text-[#72383D]"
                    >
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Return */}
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Returns & Exchanges
                </h2>

                <p className="mt-1 text-sm text-[#322D29]/60">
                  Track your return and exchange requests.
                </p>
              </div>

              <Link
                href="/user/account/returns"
                className="rounded-full bg-[#72383D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#432415]"
              >
                View Returns
              </Link>
            </div>

            {returns.length > 0 && (
              <div className="mt-5 rounded-2xl border border-[#322D29]/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">
                      Return #{returns[0].return_id}
                    </p>

                    <p className="mt-1 text-sm text-[#322D29]/60">
                      Order #{returns[0].order_id}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      returns[0].status === "approved"
                        ? "bg-green-100 text-green-700"
                        : returns[0].status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {returns[0].status.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Profile</h2>
              <p className="mt-1 text-sm text-[#322D29]/60">
                Your personal information
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <ProfileField label="First Name" value="Chathuni" />
              <ProfileField label="Last Name" value="Imasha" />
              <ProfileField
                label="Email"
                value="customer@example.com"
              />
              <ProfileField
                label="Phone"
                value="+94 77 123 4567"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function AccountLink({ href, icon, label, active, badge }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
        active
          ? "bg-[#72383D] text-white"
          : "text-[#322D29] hover:bg-[#EFE9E1]"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>

      {badge > 0 && (
        <span className="rounded-full bg-[#AC9C8D] px-2 py-0.5 text-xs">
          {badge}
        </span>
      )}
    </Link>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFE9E1] text-[#72383D]">
        {icon}
      </div>

      <p className="mt-4 text-sm text-[#322D29]/60">{title}</p>

      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wider text-[#322D29]/50">
        {label}
      </p>

      <div className="rounded-xl bg-[#EFE9E1] px-4 py-3 text-sm">
        {value}
      </div>
    </div>
  );
}

