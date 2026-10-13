import CategoryPage from "@/components/user/category/CategoryPage";

export default async function WomenSubcategoryPage({ params }) {
  const resolvedParams = await params;

  return (
    <CategoryPage
      category="Women"
      subcategorySlug={resolvedParams.subcategory?.toLowerCase()}
    />
  );
}
