import React from "react";
import { useNavigate } from "react-router-dom";

const Paymentfaild = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-100">
      <h1 className="text-2xl font-bold text-red-600">Thanh toán thất bại!</h1>
      <p className="mt-4 text-lg">Có lỗi xảy ra trong quá trình thanh toán.</p>

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

export default Paymentfaild;
