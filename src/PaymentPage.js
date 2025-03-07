import React from "react";
import StripeCheckoutButton from "../components/StripeCheckoutButton";

const PaymentPage = () => {
  return (
    <div className="container mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-4">Thanh toán đơn hàng</h2>
      <p className="text-lg mb-4">Số tiền cần thanh toán: <strong>$100</strong></p>
      
      {/* Nút Thanh toán với Stripe */}
      <StripeCheckoutButton amount={100} /> {/* Thanh toán $100 */}
    </div>
  );
};

export default PaymentPage;
  