import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getImageSource } from "@/lib/productImageSource";

const db = getPool();

export async function GET(_request, { params }) {
  try {
    const { product_id: productId } = await params;

    if (!/^\d+$/.test(productId)) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    const [products] = await db.query(
      `
      SELECT
        p.item_id,
        p.title,
        p.description,
        p.main_image,
        p.price,
        p.discount,
        p.category_id,
        c.name AS category_name,
        p.sku,
        p.brand,
        p.tags,
        p.status,
        p.is_featured
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      WHERE p.item_id = ? AND p.status = 'active'
      LIMIT 1
      `,
      [productId]
    );

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    const product = products[0];
    const [productImages] = await db.query(
      `
      SELECT image
      FROM product_images
      WHERE item_id = ?
      ORDER BY is_main DESC, sort_order ASC, image_id ASC
      `,
      [productId]
    );
    const [variantRows] = await db.query(
      `
      SELECT
        s.name AS size,
        c.name AS color,
        v.stock_quantity AS stock,
        v.price,
        v.discount,
        v.image
      FROM product_variants v
      LEFT JOIN sizes s ON s.size_id = v.size_id
      LEFT JOIN colors c ON c.color_id = v.color_id
      WHERE v.item_id = ? AND v.status = 'active'
      ORDER BY s.name, c.name
      `,
      [productId]
    );

    const variants = variantRows.map((variant) => ({
      size: variant.size || "",
      color: variant.color || "",
      stock: Number(variant.stock) || 0,
      price: Number(variant.price) || 0,
      discount: Number(variant.discount) || 0,
      image: getImageSource(variant.image),
    }));
    const images = [
      getImageSource(product.main_image),
      ...productImages.map((image) => getImageSource(image.image)),
      ...variants.map((variant) => variant.image),
    ].filter((image, index, allImages) => image && allImages.indexOf(image) === index);

    const colors = [
      ...new Map(
        variants
          .filter((variant) => variant.color)
          .map((variant) => [
            variant.color,
            {
              name: variant.color,
              image:
                variant.image ||
                variants.find((item) => item.color === variant.color)?.image ||
                images[0],
            },
          ])
      ).values(),
    ];
    const sizes = [...new Set(variants.map((variant) => variant.size).filter(Boolean))];

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        id: product.item_id,
        name: product.title,
        category: product.category_name || "",
        image: images[0] || null,
        images,
        colors,
        sizes,
        variants,
        rating: 0,
        reviews: 0,
        sizeGuide: {},
      },
    });
  } catch (error) {
    console.error("GET USER PRODUCT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load product." },
      { status: 500 }
    );
  }
}
