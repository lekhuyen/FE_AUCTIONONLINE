import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode");

    if (responseCode === "00") {
      console.log("✅ Thanh toán thành công!");
      navigate("/profile"); // 🔥 Chuyển hướng sau khi thanh toán
    } else {
      console.log("🚨 Thanh toán thất bại!");
      navigate("/payment-failed");
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold">
        {searchParams.get("vnp_ResponseCode") === "00"
          ? "🎉 Thanh toán thành công!"
          : "❌ Thanh toán thất bại!"}
      </h1>
    </div>
  );
};

export default PaymentResult;