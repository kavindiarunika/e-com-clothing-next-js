import "./globals.css";

export const metadata = {
  title: "Velora Admin",
  description: "Velora clothing store administration",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
