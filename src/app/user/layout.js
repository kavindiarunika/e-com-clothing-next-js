import "./globals.css";
import UserLayoutShell from "../../components/user/common/UserLayoutShell";

export const metadata = {
  title: "Velora | Premium Fashion",
  description: "Premium fashion for every occasion.",
};

export default function RootLayout({ children }) {
  return <UserLayoutShell>{children}</UserLayoutShell>;
}