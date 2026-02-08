const faqs = [
  // Greetings
  {
    keywords: ["hello", "hi", "hey"],
    answer: "Hello! Welcome to FashionHub 👗🛍️ How can I assist you today?",
  },
  {
    keywords: ["bye", "goodbye", "see you"],
    answer: "Goodbye! Hope to see you back soon. Happy shopping! 👋",
  },

  // Pricing & Discounts
  {
    keywords: ["price", "cost", "fees", "how much", "expensive"],
    answer:
      "Our prices start at ₹499 for selected items. Check our deals section for ongoing discounts!",
  },
  {
    keywords: ["discount", "offer", "sale", "promo", "coupon"],
    answer:
      "You can use promo codes at checkout to get discounts. Check our 'Offers' section for current promotions!",
  },

  // Orders & Checkout
  {
    keywords: ["order", "buy", "purchase", "checkout"],
    answer:
      "You can place an order by adding items to your cart and proceeding to checkout. Need help with the process?",
  },
  {
    keywords: [
      "payment",
      "pay",
      "payment method",
      "credit card",
      "upi",
      "wallet",
    ],
    answer:
      "We accept credit/debit cards, UPI, and popular wallets. Choose your preferred payment method at checkout.",
  },

  // Shipping & Delivery
  {
    keywords: ["delivery", "ship", "shipping", "tracking"],
    answer:
      "Standard delivery takes 3-7 business days. You will receive a tracking link once your order is shipped.",
  },
  {
    keywords: ["free shipping", "shipping charges", "delivery fees"],
    answer:
      "We offer free shipping on orders above ₹1,499. For smaller orders, shipping charges are applied at checkout.",
  },

  // Returns & Refunds
  {
    keywords: ["return", "refund", "exchange", "replace", "wrong size"],
    answer:
      "You can return or exchange items within 15 days of delivery. Make sure items are unworn and tags are attached.",
  },

  // Sizing & Fit
  {
    keywords: [
      "size",
      "fit",
      "measurement",
      "small",
      "medium",
      "large",
      "xs",
      "xl",
    ],
    answer:
      "Check our Size Guide on the product page for accurate measurements. Unsure about your size? Contact support for assistance.",
  },

  // Product Information
  {
    keywords: [
      "material",
      "fabric",
      "cloth",
      "cotton",
      "silk",
      "denim",
      "polyester",
    ],
    answer:
      "Product descriptions include material details. You can also check the product page for care instructions and fabric info.",
  },
  {
    keywords: ["new arrivals", "latest collection", "trending"],
    answer:
      "Check our 'New Arrivals' section to explore the latest fashion trends and collections.",
  },

  // Contact & Support
  {
    keywords: ["contact", "email", "phone", "help", "support"],
    answer:
      "You can reach us at support@fashionhub.com or call +91-9876543210. We're here to help!",
  },

  // Misc / Shopping Experience
  {
    keywords: ["gift card", "voucher", "gift", "redeem"],
    answer:
      "Gift cards are available! You can purchase and redeem them at checkout.",
  },
  {
    keywords: ["app", "mobile app", "download"],
    answer:
      "Download our FashionHub app from Google Play or App Store for a seamless shopping experience.",
  },
  {
    keywords: ["wishlist", "favorites", "save for later"],
    answer:
      "Add items to your Wishlist to save them for later and easily access them from your account.",
  },
  {
    keywords: ["membership", "club", "loyalty", "points"],
    answer:
      "Join our FashionHub Club to earn points on every purchase and enjoy exclusive member benefits.",
  },
];

module.exports = faqs;
