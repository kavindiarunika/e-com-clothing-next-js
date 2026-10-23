import HeroBanner from "../components/user/home/HeroBanner";
import CategorySection from "../components/user/home/CategorySection";
import FeaturedProducts from "../components/user/home/FeaturedProducts";
import NewArrivals from "../components/user/home/NewArrivals";
import Newsletter from "../components/user/home/Newsletter";
import Navbar from "../components/user/common/Navbar";
import Footer from "../components/user/common/Footer";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Navbar />
      <HeroBanner />
      <div className="mx-[4px]">
        <CategorySection />
        <FeaturedProducts />
        <NewArrivals />
        <Newsletter />
        <Footer />
      </div>
    </main>
  );
}
