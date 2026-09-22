import CategoryPage from "@/components/user/category/CategoryPage";
import products from "@/data/products";

export default async function WomenSubcategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.subcategory?.toLowerCase();

  const matchedSubcategory =
    products.find(
      (product) =>
        product.category === "Women" &&
        product.subcategory.toLowerCase().replace(/\s+/g, "-") === slug
    )?.subcategory || "All";

  return (
    <CategoryPage
      category="Women"
      subcategory={matchedSubcategory}
    />
  );
}
