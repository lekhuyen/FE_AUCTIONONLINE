import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentResult = () => {
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState({
    productName: "Không xác định",
    amount: 0,
  });

  useEffect(() => {
    // Lấy dữ liệu từ localStorage
    const storedPaymentInfo = JSON.parse(localStorage.getItem("paymentInfo"));
    if (storedPaymentInfo) {
      setPaymentInfo(storedPaymentInfo);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-green-600">Thanh toán thành công!</h1>
      <p className="mt-4 text-lg">Sản phẩm: {paymentInfo.productName}</p>
      <p className="text-lg">Giá tiền: {paymentInfo.amount} VND</p>

      {/* Nút quay về trang chủ */}
      <button
        className="mt-6 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        onClick={() => navigate("/profile-page")}
      >
        Quay về trang chủ
      </button>
    </div>
  );
};

export default PaymentResult;
