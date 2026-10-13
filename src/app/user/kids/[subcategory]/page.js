import CategoryPage from "@/components/user/category/CategoryPage";

export default async function KidsSubcategoryPage({ params }) {
  const resolvedParams = await params;

  return (
    <CategoryPage
      category="Kids"
      subcategorySlug={resolvedParams.subcategory?.toLowerCase()}
    />
  );
}
