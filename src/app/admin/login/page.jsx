"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid login details");
        return;
      }

      router.push("/admin/dashboard");

    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">

      <div className="admin-login-card">

        {/* Logo */}
        <div className="admin-login-logo">
          <h1>VELORA</h1>
          <span>ADMIN PANEL</span>
        </div>

        {/* Heading */}
        <div className="admin-login-heading">
          <h2>Admin Login</h2>

          <p>
            Sign in to manage your store.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>

          <div className="admin-login-group">

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />

          </div>

          <div className="admin-login-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-login-button"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>

        </form>

        {/* Back */}
        <Link
          href="/"
          className="admin-back-link"
        >
          ← Back to VELORA
        </Link>

      </div>

    </main>
  );
}