import ProductCard from "./ProductCard";

export default function RelatedProducts({
  products,
  currentProduct,
}) {
  const relatedProducts = (Array.isArray(products) ? products : [])
    .filter(
      (product) =>
        product &&
        currentProduct &&
        String(product.id) !== String(currentProduct.id)
    )
    .slice(0, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 border-t border-[#E7DEDC] pt-14">

      <div className="mb-8 text-center">
        <p className="mb-2 text-xs uppercase tracking-[3px] text-[#C08081]">
          You May Also Like
        </p>

        <h2 className="font-serif text-3xl text-[#292524]">
          Related Products
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

    </section>
  );
}