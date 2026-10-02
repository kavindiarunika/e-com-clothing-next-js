"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

function subscribeToSession(callback) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSessionSnapshot() {
  return localStorage.getItem("velora-user-session") === "true";
}

export default function CartLayout({ children }) {
  const router = useRouter();
  const authorized = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    () => null
  );

  useEffect(() => {
    if (authorized === false) {
      router.replace("/user/login");
    }
  }, [authorized, router]);

  if (authorized !== true) return null;

  return children;
}