import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const stripePromise = loadStripe("pk_test_51QzXY62NueUWgxdg6B8LQaTl7VMRdQYocaXHVvi20N3WxUE08zM5gg9JPlRcDZCMNIMXw7ZLsj7YwV6QacadD26L00phbNL9px");

const StripeCheckoutButton = ({ productId }) => {
  const handleCheckout = async () => {
    try {
      // Gọi API backend để tạo session thanh toán cho sản phẩm dựa trên productId
      const response = await axios.post(`https://be-pjhk4.onrender.com/api/stripe/create-checkout-session/${productId}`);

      // Chuyển hướng đến trang thanh toán Stripe
      window.location.href = response.data.url;
    } catch (error) {
      console.error("❌ Lỗi tạo session Stripe:", error);
    }
  };

  return (
    <button onClick={handleCheckout} className="bg-blue-600 text-white px-4 py-2 rounded">
      Thanh toán ngay
    </button>
  );
};

export default StripeCheckoutButton;
