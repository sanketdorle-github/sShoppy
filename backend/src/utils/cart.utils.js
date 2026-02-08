export const calculateTotals = (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      totalItems: 0,
      subtotal: 0,
      totalQuantity: 0,
    };
  }

  let subtotal = 0;
  let totalQuantity = 0;

  cart.items.forEach((item) => {
    subtotal += item.price * item.quantity;
    totalQuantity += item.quantity;
  });

  return {
    totalItems: cart.items.length,
    totalQuantity,
    subtotal,
  };
};
