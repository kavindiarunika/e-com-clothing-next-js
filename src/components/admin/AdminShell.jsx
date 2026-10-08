"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminShell({
  children,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage =
    pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    async function checkAdmin() {
      try {
        const response = await fetch("/api/admin/me", {
          credentials: "same-origin",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          router.replace("/admin/login");
          return;
        }

        setAdmin(data.admin);
      } catch {
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return children;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <button
        type="button"
        className="admin-overlay"
        aria-label="Close sidebar"
        onClick={() => setSidebarOpen(false)}
        style={{ display: sidebarOpen ? "block" : "none" }}
      />

      <AdminSidebar
        isMobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-main">

        <AdminNavbar
          admin={admin}
          onToggleSidebar={() => setSidebarOpen((current) => !current)}
        />

        {children}

      </div>

    </div>
  );
}