"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Package,
  FolderTree,
  Ruler,
  Palette,
  ShoppingBag,
  Users,
  Boxes,
  TicketPercent,
  Image,
  Star,
  RotateCcw,
  CreditCard,
  Truck,
  Sparkles,
  BarChart3,
  LogOut,
} from "lucide-react";

const menuGroups = [
  {
    title: "MAIN",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "CATALOG",
    items: [
      {
        name: "Products",
        href: "/admin/products",
        icon: Package,
      },
      {
        name: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
      },
      {
        name: "Subcategories",
        href: "/admin/subcategories",
        icon: FolderTree,
      },
      {
        name: "Sizes",
        href: "/admin/sizes",
        icon: Ruler,
      },
      {
        name: "Colors",
        href: "/admin/colors",
        icon: Palette,
      },
      {
        name: "Inventory",
        href: "/admin/inventory",
        icon: Boxes,
      },
      {
        name: "Featured Products",
        href: "/admin/featured-products",
        icon: Sparkles,
      },
    ],
  },

  {
    title: "SALES",
    items: [
      {
        name: "Orders",
        href: "/admin/orders",
        icon: ShoppingBag,
      },
      {
        name: "Customers",
        href: "/admin/customers",
        icon: Users,
      },
      {
        name: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
      },
      {
        name: "Shipments",
        href: "/admin/shipments",
        icon: Truck,
      },
      {
        name: "Returns",
        href: "/admin/returns",
        icon: RotateCcw,
      },
    ],
  },

  {
    title: "MARKETING",
    items: [
      {
        name: "Coupons",
        href: "/admin/coupons",
        icon: TicketPercent,
      },
      {
        name: "Banners",
        href: "/admin/banners",
        icon: Image,
      },
      {
        name: "Reviews",
        href: "/admin/reviews",
        icon: Star,
      },
    ],
  },

  {
    title: "ANALYTICS",
    items: [
      {
        name: "Sales Reports",
        href: "/admin/reports/sales",
        icon: BarChart3,
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.replace("/admin/login");
  }

  return (
    <aside className="admin-sidebar">

      <div className="sidebar-brand">

        <div className="brand-logo">
          CS
        </div>

        <div>
          <strong>Clothing Store</strong>
          <span>ADMIN PANEL</span>
        </div>

      </div>

      <nav className="sidebar-nav">

        {menuGroups.map((group) => (
          <div
            className="menu-group"
            key={group.title}
          >

            <p>{group.title}</p>

            {group.items.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                (
                  item.href !== "/admin" &&
                  pathname.startsWith(item.href)
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "sidebar-link active"
                      : "sidebar-link"
                  }
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

          </div>
        ))}

      </nav>

      <button
        className="sidebar-logout"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>

    </aside>
  );
}