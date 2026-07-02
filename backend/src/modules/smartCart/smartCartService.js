const smartCartModel = require("./smartCartModel");

const checkBudget = async (userId, budget) => {
  const cartItems = await smartCartModel.getCartItemsWithProducts(userId);

  if (cartItems.length === 0) {
    return {
      cartTotal: 0,
      budget: Number(budget),
      exceededBy: 0,
      remainingBudget: Number(budget),
      message: "Your cart is empty",
      cheaperSuggestions: [],
      outOfStockSuggestions: []
    };
  }

  let cartTotal = 0;
  const cheaperSuggestions = [];
  const outOfStockSuggestions = [];

  for (const item of cartItems) {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    cartTotal += price * quantity;

    const isOutOfStock = Number(item.stock_quantity) <= 0 || item.is_available === 0;

    if (isOutOfStock) {
      const alternatives = await smartCartModel.findAvailableAlternatives(
        item.category_id,
        item.product_id
      );

      outOfStockSuggestions.push({
        product_id: item.product_id,
        product_name: item.product_name,
        category_name: item.category_name,
        message: `${item.product_name} is currently out of stock`,
        alternatives
      });
    }

    const cheaperProduct = await smartCartModel.findCheaperAlternative(
      item.category_id,
      item.product_id,
      price
    );

    if (cheaperProduct) {
      const savingPerItem = price - Number(cheaperProduct.price);

      cheaperSuggestions.push({
        current_product_id: item.product_id,
        currentProduct: item.product_name,
        currentPrice: price,
        suggested_product_id: cheaperProduct.product_id,
        suggestedProduct: cheaperProduct.product_name,
        suggestedPrice: Number(cheaperProduct.price),
        category: item.category_name,
        quantity,
        savingPerItem,
        totalSaving: savingPerItem * quantity
      });
    }
  }

  cartTotal = Number(cartTotal.toFixed(2));
  const numericBudget = Number(budget);
  const exceededBy = cartTotal > numericBudget ? Number((cartTotal - numericBudget).toFixed(2)) : 0;
  const remainingBudget = numericBudget >= cartTotal ? Number((numericBudget - cartTotal).toFixed(2)) : 0;

  return {
    cartTotal,
    budget: numericBudget,
    exceededBy,
    remainingBudget,
    message: exceededBy > 0
      ? `Your cart exceeds your budget by ₹${exceededBy}`
      : "Your cart is within budget",
    cheaperSuggestions,
    outOfStockSuggestions
  };
};

const getAlternativesForProduct = async (productId) => {
  const product = await smartCartModel.getProductById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  const alternatives = await smartCartModel.findAvailableAlternatives(
    product.category_id,
    product.product_id
  );

  return {
    currentProduct: product,
    alternatives
  };
};

module.exports = {
  checkBudget,
  getAlternativesForProduct
};
