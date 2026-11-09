import HeroBanner from "../../components/user/home/HeroBanner";
import CategorySection from "../../components/user/home/CategorySection";
import FeaturedProducts from "../../components/user/home/FeaturedProducts";
import NewArrivals from "../../components/user/home/NewArrivals";
import SubcategorySection from "../../components/user/home/SubcategorySection";
import Newsletter from "../../components/user/home/Newsletter";


export default function Home() {
  return (
     <main className="min-h-screen bg-[#FFFFFF]">
      <HeroBanner />

      <div className="mx-[4px]">
        <CategorySection />
        <FeaturedProducts />
        <NewArrivals />
        <SubcategorySection />
        <Newsletter />
      </div>

    </main>
  );
}
