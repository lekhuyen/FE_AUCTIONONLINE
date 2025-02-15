import { useState } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP, 3: Đổi mật khẩu
  const navigate = useNavigate()

  const handleSendOTP = async () => {
    try {
      const response = await axios.post(`users/forgot-password?email=${email}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Gửi OTP thành công:", response);

      alert("OTP đã được gửi đến email của bạn!");
      setStep(2);
    } catch (error) {
      console.error("Lỗi khi gửi OTP:", error);
      alert("Không thể gửi OTP, vui lòng kiểm tra lại email!");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post(`users/verify-otp?email=${email}&otp=${otp}`);

      alert("OTP hợp lệ, vui lòng nhập mật khẩu mới!");
      setStep(3);
    } catch (error) {
      console.error("Lỗi khi xác thực OTP:", error);
      alert("OTP không hợp lệ!");
    }
  };

  const handleResetPassword = async () => {
    try {
      await axios.post(`users/reset-password?email=${email}&otp=${otp}&newPassword=${newPassword}`);
      alert("Mật khẩu đã được đặt lại thành công!");
      // setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      navigate("/login");
    } catch (error) {
      console.error("Lỗi khi đặt lại mật khẩu:", error);
      alert("Không thể đặt lại mật khẩu, vui lòng thử lại!");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-28">
      <h2 className="text-2xl font-bold text-center mb-4">Quên Mật Khẩu</h2>

      {step === 1 && (
        <div>
          <label className="block text-sm font-medium">Nhập email của bạn:</label>
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded mt-1 outline-none"
            placeholder="Nhập email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="w-full bg-blue-500 text-white p-2 rounded mt-3"
            onClick={handleSendOTP}
          >
            Gửi OTP
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <label className="block text-sm font-medium">Nhập mã OTP:</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="Nhập OTP..."
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            className="w-full bg-blue-500 bg-green-500 text-white p-2 rounded mt-3"
            onClick={handleVerifyOTP}
          >
            Xác thực OTP
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="block text-sm font-medium">Nhập mật khẩu mới:</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="Nhập mật khẩu mới..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            className="w-full bg-red-500 text-white p-2 rounded mt-3"
            onClick={handleResetPassword}
          >
            Đặt lại mật khẩu
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
