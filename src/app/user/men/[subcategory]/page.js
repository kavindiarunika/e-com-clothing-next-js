import CategoryPage from "@/components/user/category/CategoryPage";

export default async function MenSubcategoryPage({ params }) {
  const resolvedParams = await params;

  return (
    <CategoryPage
      category="Men"
      subcategorySlug={resolvedParams.subcategory?.toLowerCase()}
    />
  );
}
