"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingWhatsApp from "./FloatingWhatsApp";

export default function UserLayoutShell({ children }) {
  const pathname = usePathname();

  if (pathname === "/user" || pathname === "/user/") {
    return children;
  }

  return (
    <>
      <Navbar />
      <main className="user-page-gutter">{children}</main>
      <FloatingWhatsApp />
      <Footer />
    </>
  );
}
