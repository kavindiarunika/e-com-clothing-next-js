const products = [
  {
    id: 1,
    name: "Classic Cotton Shirt",
    category: "Men",
    subcategory: "Shirts",
    price: 5500,
    discount: 10,

    images: [
      "/images/products/shirt1.webp",
      "/images/products/shirt2.webp",
      "/images/products/shirt3.webp",
      "/images/products/shirt4.webp",
    ],

    colors: [
      {
        name: "White",
        image: "/images/products/shirt1.webp",
      },
      {
        name: "Black",
        image: "/images/products/shirt2.webp",
      },
      {
        name: "Brown",
        image: "/images/products/shirt3.webp",
      },
      {
        name: "Blue",
        image: "/images/products/shirt4.webp",
      },
    ],

    sizes: ["S", "M", "L", "XL"],

    // Stock for each size + color
    variants: [
      { size: "S", color: "White", stock: 5 },
      { size: "S", color: "Black", stock: 0 },
      { size: "S", color: "Brown", stock: 3 },
      { size: "S", color: "Blue", stock: 2 },

      { size: "M", color: "White", stock: 4 },
      { size: "M", color: "Black", stock: 2 },
      { size: "M", color: "Brown", stock: 0 },
      { size: "M", color: "Blue", stock: 3 },

      { size: "L", color: "White", stock: 0 },
      { size: "L", color: "Black", stock: 3 },
      { size: "L", color: "Brown", stock: 2 },
      { size: "L", color: "Blue", stock: 0 },

      { size: "XL", color: "White", stock: 2 },
      { size: "XL", color: "Black", stock: 1 },
      { size: "XL", color: "Brown", stock: 0 },
      { size: "XL", color: "Blue", stock: 0 },
    ],

    description:
      "A timeless premium cotton shirt designed for everyday elegance. Made with soft, breathable fabric and a comfortable modern fit.",

    sizeGuide: {
      S: "Chest 36-38",
      M: "Chest 38-40",
      L: "Chest 40-42",
      XL: "Chest 42-44",
    },
  },

  {
    id: 2,
    name: "Premium Oversized T-Shirt",
    category: "Men",
    subcategory: "T-Shirts",
    price: 3200,
    discount: 0,

    images: [
      "/images/products/tshirt1.webp",
      "/images/products/tshirt2.webp",
      "/images/products/tshirt3.webp",
    ],

    colors: [
      {
        name: "Green",
        image: "/images/products/tshirt1.webp",
      },
      {
        name: "Blue",
        image: "/images/products/tshirt2.webp",
      },
      {
        name: "White",
        image: "/images/products/tshirt3.webp",
      },
    ],

    sizes: ["S", "M", "L", "XL"],

    variants: [
      { size: "S", color: "Green", stock: 5 },
      { size: "S", color: "Blue", stock: 0 },
      { size: "S", color: "White", stock: 3 },

      { size: "M", color: "Green", stock: 4 },
      { size: "M", color: "Blue", stock: 2 },
      { size: "M", color: "White", stock: 0 },

      { size: "L", color: "Green", stock: 0 },
      { size: "L", color: "Blue", stock: 3 },
      { size: "L", color: "White", stock: 2 },

      { size: "XL", color: "Green", stock: 1 },
      { size: "XL", color: "Blue", stock: 0 },
      { size: "XL", color: "White", stock: 2 },
    ],

    description:
      "A relaxed oversized T-shirt made from premium cotton for maximum comfort and effortless style.",

    sizeGuide: {
      S: "Chest 36-38",
      M: "Chest 38-40",
      L: "Chest 40-42",
      XL: "Chest 42-44",
    },
  },

  {
    id: 3,
    name: "Elegant Summer Dress",
    category: "Women",
    subcategory: "Dresses",
    price: 8500,
    discount: 15,

    images: [
      "/images/products/dress1.webp",
      "/images/products/dress2.webp",
      "/images/products/dress3.webp",
    ],

    colors: [
      {
        name: "Beige",
        image: "/images/products/dress1.webp",
      },
      {
        name: "Blue",
        image: "/images/products/dress2.webp",
      },
      {
        name: "Brown",
        image: "/images/products/dress3.webp",
      },
    ],

    sizes: ["S", "M", "L"],

    variants: [
      { size: "S", color: "Beige", stock: 2 },
      { size: "S", color: "Blue", stock: 0 },
      { size: "S", color: "Brown", stock: 1 },

      { size: "M", color: "Beige", stock: 2 },
      { size: "M", color: "Blue", stock: 1 },
      { size: "M", color: "Brown", stock: 0 },

      { size: "L", color: "Beige", stock: 0 },
      { size: "L", color: "Blue", stock: 1 },
      { size: "L", color: "Brown", stock: 1 },
    ],

    description:
      "An elegant summer dress crafted with lightweight fabric and a flattering silhouette for effortless sophistication.",

    sizeGuide: {
      S: "Bust 32-34",
      M: "Bust 34-36",
      L: "Bust 36-38",
    },
  },

  {
    id: 4,
    name: "Classic Women's Top",
    category: "Women",
    subcategory: "Tops",
    price: 4200,
    discount: 5,

    images: [
      "/images/products/top1.webp",
      "/images/products/top2.webp",
    ],

    colors: [
      {
        name: "White",
        image: "/images/products/top1.webp",
      },
      {
        name: "Brown",
        image: "/images/products/top2.webp",
      },
    ],

    sizes: ["S", "M", "L"],

    variants: [
      { size: "S", color: "White", stock: 0 },
      { size: "S", color: "Brown", stock: 0 },

      { size: "M", color: "White", stock: 0 },
      { size: "M", color: "Brown", stock: 0 },

      { size: "L", color: "White", stock: 0 },
      { size: "L", color: "Brown", stock: 0 },
    ],

    description:
      "A versatile women's top with a clean silhouette that works beautifully for casual and semi-formal occasions.",

    sizeGuide: {
      S: "Bust 32-34",
      M: "Bust 34-36",
      L: "Bust 36-38",
    },
  },

  {
    id: 5,
    name: "Slim Fit Jeans",
    category: "Men",
    subcategory: "Jeans",
    price: 6500,
    discount: 10,

    images: [
      "/images/products/jeans1.webp",
      "/images/products/jeans2.webp",
      "/images/products/jeans3.webp",
    ],

    colors: [
      {
        name: "White",
        image: "/images/products/jeans1.webp",
      },
      {
        name: "Black",
        image: "/images/products/jeans2.webp",
      },
    ],

    sizes: ["S", "M", "L", "XL"],

    variants: [
      { size: "S", color: "White", stock: 2 },
      { size: "S", color: "Black", stock: 0 },

      { size: "M", color: "White", stock: 3 },
      { size: "M", color: "Black", stock: 2 },

      { size: "L", color: "White", stock: 0 },
      { size: "L", color: "Black", stock: 2 },

      { size: "XL", color: "White", stock: 1 },
      { size: "XL", color: "Black", stock: 0 },
    ],

    description:
      "Classic slim-fit jeans designed with durable denim and a comfortable stretch for everyday wear.",

    sizeGuide: {
      S: "Waist 28-30",
      M: "Waist 30-32",
      L: "Waist 32-34",
      XL: "Waist 34-36",
    },
  },

  {
    id: 6,
    name: "Kids Casual T-Shirt",
    category: "Kids",
    subcategory: "T-Shirts",
    price: 2500,
    discount: 0,

    images: [
      "/images/products/kids-tshirt1.webp",
      "/images/products/kids-tshirt2.webp",
    ],

    colors: [
      {
        name: "White",
        image: "/images/products/kids-tshirt1.webp",
      },
      {
        name: "Pink",
        image: "/images/products/kids-tshirt2.webp",
      },
    ],

    sizes: ["XS", "S", "M"],

    variants: [
      { size: "XS", color: "White", stock: 4 },
      { size: "XS", color: "Pink", stock: 0 },

      { size: "S", color: "White", stock: 3 },
      { size: "S", color: "Pink", stock: 2 },

      { size: "M", color: "White", stock: 0 },
      { size: "M", color: "Pink", stock: 3 },
    ],

    description:
      "Soft and comfortable cotton T-shirt designed for active kids and everyday adventures.",

    sizeGuide: {
      XS: "Age 3-4",
      S: "Age 5-7",
      M: "Age 8-10",
    },
  },

  {
    id: 7,
    name: "Kids Summer Dress",
    category: "Kids",
    subcategory: "Dresses",
    price: 3800,
    discount: 10,

    images: [
      "/images/products/kids-dress1.webp",
      "/images/products/kids-dress2.webp",
    ],

    colors: [
      {
        name: "Pink",
        image: "/images/products/kids-dress1.webp",
      },
      {
        name: "Beige",
        image: "/images/products/kids-dress2.webp",
      },
    ],

    sizes: ["XS", "S", "M"],

    variants: [
      { size: "XS", color: "Pink", stock: 2 },
      { size: "XS", color: "Beige", stock: 0 },

      { size: "S", color: "Pink", stock: 3 },
      { size: "S", color: "Beige", stock: 1 },

      { size: "M", color: "Pink", stock: 0 },
      { size: "M", color: "Beige", stock: 2 },
    ],

    description:
      "A lightweight and comfortable summer dress designed for playful days and special occasions.",

    sizeGuide: {
      XS: "Age 3-4",
      S: "Age 5-7",
      M: "Age 8-10",
    },
  },

  {
    id: 8,
    name: "Premium Linen Shirt",
    category: "Men",
    subcategory: "Shirts",
    price: 11000,
    discount: 20,

    images: [
      "/images/products/shirt5.webp",
      "/images/products/shirt6.webp",
    ],

    colors: [
      {
        name: "Gray",
        image: "/images/products/shirt5.webp",
      },
      {
        name: "Beige",
        image: "/images/products/shirt6.webp",
      },
    ],

    sizes: ["M", "L", "XL"],

    variants: [
      { size: "M", color: "Gray", stock: 2 },
      { size: "M", color: "Beige", stock: 0 },

      { size: "L", color: "Gray", stock: 0 },
      { size: "L", color: "Beige", stock: 2 },

      { size: "XL", color: "Gray", stock: 1 },
      { size: "XL", color: "Beige", stock: 0 },
    ],

    description:
      "A premium linen shirt with a refined relaxed fit, perfect for warm days and sophisticated casual looks.",

    sizeGuide: {
      M: "Chest 38-40",
      L: "Chest 40-42",
      XL: "Chest 42-44",
    },
  },
];

export default products;