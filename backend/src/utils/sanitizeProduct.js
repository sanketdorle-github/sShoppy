const COLORS = ["Black", "White", "Purple"];
const SIZES = ["S", "M", "L", "XL"];

export const sanitizeProduct = (product) => {
  if (!product?.id) return null;

  return {
    externalId: product.id.toString(),
    name: product.title, //chagnes here i made but not checked
    description: product.description || "",
    category: product.category,
    brand: product.brand || "Generic",
    price: product.price,

    // ✅ FIX 1: map images correctly
    images: product.images || [],
    thumbnail: product.thumbnail || product.images?.[0] || "",

    // ✅ FIX 2: correct field name
    variants: generateVariants(product),

    source: "external",
    isActive: true,
  };
};

const generateVariants = (product) => {
  const variants = [];

  COLORS.forEach((color) => {
    SIZES.forEach((size) => {
      variants.push({
        color,
        size,
        price: product.price,
        stock: product.stock || 10,
        sku: `${product.id}-${color[0]}-${size}`,
        images: product.images || [], // fallback
      });
    });
  });

  return variants;
};
