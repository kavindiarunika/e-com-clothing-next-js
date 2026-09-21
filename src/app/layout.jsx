import "./globals.css";
import { Inter, Poppins, Prata } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  preload: false,
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  preload: false,
});

const prata = Prata({
  subsets: ["latin"],
  variable: "--font-prata",
  weight: "400",
  preload: false,
});

export const metadata = {
  title: "Velora Admin",
  description: "Velora clothing store administration",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${prata.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
