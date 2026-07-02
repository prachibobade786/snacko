const smartCartService = require("./smartCartService");

const checkBudget = async (req, res) => {
  try {
    const { user_id, budget } = req.body;

    if (!user_id || budget === undefined || budget === null) {
      return res.status(400).json({
        success: false,
        message: "user_id and budget are required"
      });
    }

    if (Number(budget) < 0) {
      return res.status(400).json({
        success: false,
        message: "budget cannot be negative"
      });
    }

    const result = await smartCartService.checkBudget(user_id, budget);

    return res.status(200).json({
      success: true,
      message: "Smart cart budget checked successfully",
      data: result
    });
  } catch (error) {
    console.log("Smart Cart Budget Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error while checking smart cart budget"
    });
  }
};

const getAlternativesForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await smartCartService.getAlternativesForProduct(productId);

    return res.status(200).json({
      success: true,
      message: "Alternative products fetched successfully",
      data: result
    });
  } catch (error) {
    console.log("Product Alternative Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error while fetching alternatives"
    });
  }
};

module.exports = {
  checkBudget,
  getAlternativesForProduct
};
