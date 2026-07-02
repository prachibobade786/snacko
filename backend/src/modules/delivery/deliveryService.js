const deliveryModel = require("./deliveryModel");

const toRadians = (degree) => {
  return degree * (Math.PI / 180);
};

// Haversine formula: calculates straight-line distance between two latitude/longitude points.
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const firstLat = toRadians(lat1);
  const secondLat = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(firstLat) * Math.cos(secondLat) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const calculateDeliveryRules = (distanceKm) => {
  if (distanceKm <= 3) {
    return { deliveryAvailable: true, estimatedTime: 15, deliveryCharge: 10 };
  }

  if (distanceKm <= 6) {
    return { deliveryAvailable: true, estimatedTime: 25, deliveryCharge: 20 };
  }

  if (distanceKm <= 10) {
    return { deliveryAvailable: true, estimatedTime: 35, deliveryCharge: 30 };
  }

  return { deliveryAvailable: false, estimatedTime: null, deliveryCharge: null };
};

const findNearestWarehouse = async (addressId) => {
  const address = await deliveryModel.getAddressById(addressId);

  if (!address) {
    throw new Error("Address not found");
  }

  if (!address.latitude || !address.longitude) {
    throw new Error("Address latitude and longitude are required for delivery check");
  }

  const warehouses = await deliveryModel.getActiveWarehouses();

  if (warehouses.length === 0) {
    throw new Error("No active warehouse found");
  }

  let nearestWarehouse = null;
  let minimumDistance = Number.MAX_VALUE;

  for (const warehouse of warehouses) {
    const distance = calculateDistance(
      Number(address.latitude),
      Number(address.longitude),
      Number(warehouse.latitude),
      Number(warehouse.longitude)
    );

    if (distance < minimumDistance) {
      minimumDistance = distance;
      nearestWarehouse = warehouse;
    }
  }

  const distance = Number(minimumDistance.toFixed(2));
  const deliveryRules = calculateDeliveryRules(distance);

  return {
    address,
    nearestWarehouse,
    distance,
    ...deliveryRules
  };
};

const checkDeliveryZone = async (addressId) => {
  const deliveryData = await findNearestWarehouse(addressId);

  if (!deliveryData.deliveryAvailable) {
    return {
      deliveryAvailable: false,
      message: "Delivery is not available at this location because distance is above 10 km",
      nearestWarehouse: deliveryData.nearestWarehouse,
      distance: deliveryData.distance
    };
  }

  return {
    deliveryAvailable: true,
    message: "Delivery is available at this location",
    nearestWarehouse: deliveryData.nearestWarehouse,
    distance: deliveryData.distance,
    estimatedTime: deliveryData.estimatedTime,
    deliveryCharge: deliveryData.deliveryCharge
  };
};

const assignDeliveryToOrder = async (orderId, addressId) => {
  const deliveryData = await findNearestWarehouse(addressId);

  if (!deliveryData.deliveryAvailable) {
    return {
      deliveryAvailable: false,
      message: "Delivery is not available for this address",
      distance: deliveryData.distance
    };
  }

  const result = await deliveryModel.updateOrderDeliveryDetails(
    orderId,
    deliveryData.nearestWarehouse.warehouse_id,
    deliveryData.distance,
    deliveryData.estimatedTime,
    deliveryData.deliveryCharge,
    "PLACED"
  );

  if (result.affectedRows === 0) {
    throw new Error("Order not found");
  }

  await deliveryModel.addTrackingHistory(
    orderId,
    "PLACED",
    "Order placed and delivery details assigned successfully"
  );

  return {
    deliveryAvailable: true,
    message: "Delivery details assigned to order successfully",
    orderId,
    nearestWarehouse: deliveryData.nearestWarehouse,
    distance: deliveryData.distance,
    estimatedTime: deliveryData.estimatedTime,
    deliveryCharge: deliveryData.deliveryCharge,
    deliveryStatus: "PLACED"
  };
};

const getOrderTracking = async (orderId) => {
  const order = await deliveryModel.getOrderTracking(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const trackingHistory = await deliveryModel.getTrackingHistory(orderId);

  return {
    order,
    trackingHistory
  };
};

const updateDeliveryStatus = async (orderId, status) => {
  const allowedStatuses = [
    "PLACED",
    "CONFIRMED",
    "PACKED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED"
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid delivery status");
  }

  const statusDescriptions = {
    PLACED: "Order placed successfully",
    CONFIRMED: "Order confirmed by admin",
    PACKED: "Order packed by warehouse",
    OUT_FOR_DELIVERY: "Order is out for delivery",
    DELIVERED: "Order delivered successfully",
    CANCELLED: "Order cancelled"
  };

  const result = await deliveryModel.updateDeliveryStatus(orderId, status);

  if (result.affectedRows === 0) {
    throw new Error("Order not found");
  }

  await deliveryModel.addTrackingHistory(orderId, status, statusDescriptions[status]);

  return {
    orderId,
    status,
    description: statusDescriptions[status]
  };
};

module.exports = {
  checkDeliveryZone,
  assignDeliveryToOrder,
  getOrderTracking,
  updateDeliveryStatus
};
