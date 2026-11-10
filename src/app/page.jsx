import HeroBanner from "../components/user/home/HeroBanner";
import FeaturedProducts from "../components/user/home/FeaturedProducts";
import BestSellingProducts from "../components/user/home/BestSellingProducts";
import NewArrivals from "../components/user/home/NewArrivals";
import Newsletter from "../components/user/home/Newsletter";
import HomeEditorialSections, {
  FindYourStyle,
} from "../components/user/home/HomeEditorialSections";
import Navbar from "../components/user/common/Navbar";
import Footer from "../components/user/common/Footer";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Navbar />
      <HeroBanner />
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <BestSellingProducts />
        <FeaturedProducts />
        
        
        <FindYourStyle />
        <HomeEditorialSections />
        <Newsletter />
      </div>
      <Footer />
    </main>
  );
}
