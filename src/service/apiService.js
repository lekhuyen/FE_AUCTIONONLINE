import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1";

export const checkout = async (id, price, orderId) => {
  return axios.get(`${API_BASE_URL}/payment/vn-pay?productId=${id}&amount=${price}&orderId=${orderId}`);
};