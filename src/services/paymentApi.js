import api from "./api";

/**
 * Creates a payment order on the backend.
 * @param {string} planId - The ID of the selected subscription plan.
 * @returns {Promise<object>} - The order details from the backend.
 */
export const createOrder = async (planId) => {
  try {
    const response = await api.post("/api/payment/order", { planId });
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || "Failed to create payment order.");
  }
};

/**
 * Verifies a payment on the backend.
 * @param {object} paymentData - The payment verification data.
 * @param {string} paymentData.orderId - The order ID from Razorpay.
 * @param {string} paymentData.paymentId - The payment ID from Razorpay.
 * @param {string} paymentData.signature - The signature from Razorpay.
 * @param {string} paymentData.planId - The ID of the subscription plan.
 * @returns {Promise<object>} - The verification response from the backend.
 */
export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post("/api/payment/verify", paymentData);
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Payment verification failed.");
  }
};
