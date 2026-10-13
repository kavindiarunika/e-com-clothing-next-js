import ShopPage from "@/components/user/shop/ShopPage";

const validSorts = new Set([
  "best-selling",
  "newest",
  "featured",
  "price-low",
  "price-high",
  "rating",
  "name",
]);

export default async function ShopRoute({ searchParams }) {
  const { sort } = await searchParams;
  const initialSort = validSorts.has(sort) ? sort : "best-selling";

  return <ShopPage initialSort={initialSort} />;
}
