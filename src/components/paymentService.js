import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1/payment";

export const payVNPay = async (productId, amount, orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vn-pay`, {
      params: { productId, amount, orderId },
    });
    return response.data;
  } catch (error) {
    console.error("Payment error:", error.response?.data || error.message);
    throw error;
  }
};