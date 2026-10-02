import HeroBanner from "../components/user/home/HeroBanner";
import CategorySection from "../components/user/home/CategorySection";
import FeaturedProducts from "../components/user/home/FeaturedProducts";
import NewArrivals from "../components/user/home/NewArrivals";
import Newsletter from "../components/user/home/Newsletter";
import PromoBanner from "../components/user/home/PromoBanner";
import Navbar from "../components/user/common/Navbar";
import Footer from "../components/user/common/Footer";
<<<<<<< HEAD
import Newsletter from "../components/user/home/Newsletter";
=======

>>>>>>> e6c10af13d312fa6054369bd5412885338f96e73
export default function Home() {
  return (
    <main className="min-h-screen bg-[#EFE9E1]">
      <Navbar />
      <HeroBanner />
      <PromoBanner />
      <CategorySection />
      <FeaturedProducts />
      <NewArrivals />
      <Newsletter />
      <Footer />
    </main>
  );
}
