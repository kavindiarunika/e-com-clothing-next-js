"use client";

import {
  Bell,
  Search,
  Menu,
} from "lucide-react";

export default function AdminNavbar({
  admin,
}) {
  return (
    <header className="admin-navbar">

      <div className="navbar-title">
          <strong>Clothing Store Admin</strong>
      </div>

      <div className="navbar-search">

        <Search size={18} />

        <input
          placeholder="Search..."
        />

      </div>

      <div className="navbar-right">

        <button className="notification-btn">
          <Bell size={19} />
          <span />
        </button>

        <div className="admin-profile">

          <div className="profile-avatar">
            {admin?.email
              ?.charAt(0)
              .toUpperCase() || "A"}
          </div>

          <div>
            <strong>
              {admin?.email || "Admin"}
            </strong>

            <span>
              {admin?.role || "admin"}
            </span>
          </div>

        </div>

      </div>

    </header>
  );
}