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
  const { sort, search } = await searchParams;
  const initialSort = validSorts.has(sort) ? sort : "best-selling";
  const initialSearch = typeof search === "string" ? search : "";

  return (
    <ShopPage
      key={`${initialSort}-${initialSearch}`}
      initialSort={initialSort}
      initialSearch={initialSearch}
    />
  );
}
