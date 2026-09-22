import HeroBanner from "../components/user/home/HeroBanner";
import CategorySection from "../components/user/home/CategorySection";
import FeaturedProducts from "../components/user/home/FeaturedProducts";
import NewArrivals from "../components/user/home/NewArrivals";
import PromoBanner from "../components/user/home/PromoBanner";
import Navbar from "../components/user/common/Navbar";

export default function Home() {

  return (
    <main className="min-h-screen bg-[#EFE9E1]">
      <Navbar />
      <HeroBanner />
      <CategorySection />
      <FeaturedProducts />
      <NewArrivals />
      <PromoBanner />
      

    </main>
  );
}