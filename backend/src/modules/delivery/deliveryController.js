const deliveryService = require("./deliveryService");

const checkDeliveryZone = async (req, res) => {
  try {
    const { address_id } = req.body;

    if (!address_id) {
      return res.status(400).json({
        success: false,
        message: "address_id is required"
      });
    }

    const result = await deliveryService.checkDeliveryZone(address_id);

    return res.status(200).json({
      success: true,
      message: "Delivery zone checked successfully",
      data: result
    });
  } catch (error) {
    console.log("Delivery Zone Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error while checking delivery zone"
    });
  }
};

const assignDeliveryToOrder = async (req, res) => {
  try {
    const { order_id, address_id } = req.body;

    if (!order_id || !address_id) {
      return res.status(400).json({
        success: false,
        message: "order_id and address_id are required"
      });
    }

    const result = await deliveryService.assignDeliveryToOrder(order_id, address_id);

    return res.status(200).json({
      success: true,
      message: "Delivery assigned successfully",
      data: result
    });
  } catch (error) {
    console.log("Assign Delivery Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error while assigning delivery"
    });
  }
};

const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await deliveryService.getOrderTracking(orderId);

    return res.status(200).json({
      success: true,
      message: "Order tracking fetched successfully",
      data: result
    });
  } catch (error) {
    console.log("Order Tracking Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error while fetching order tracking"
    });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required"
      });
    }

    const result = await deliveryService.updateDeliveryStatus(orderId, status);

    return res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
      data: result
    });
  } catch (error) {
    console.log("Update Delivery Status Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error while updating delivery status"
    });
  }
};

module.exports = {
  checkDeliveryZone,
  assignDeliveryToOrder,
  getOrderTracking,
  updateDeliveryStatus
};
