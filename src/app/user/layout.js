import "./globals.css";
import Navbar from "../../components/user/common/Navbar";
import Footer from "../../components/user/common/Footer";

export const metadata = {
  title: "Velora | Premium Fashion",
  description: "Premium fashion for every occasion.",
};

export default function RootLayout({ children }) {
  return (
    <>
      <Navbar />

      <main>{children}</main>

      <Footer />
    </>
  );
}