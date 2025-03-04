import { useState } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";  // Importing react-toastify
import 'react-toastify/dist/ReactToastify.css';  // Importing the CSS for styling

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Reset password
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    try {
      const response = await axios.post(`users/forgot-password?email=${email}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("OTP sent successfully:", response);

      toast.success("OTP has been sent to your email!"); // Display success toast
      setStep(2);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Unable to send OTP, please check your email!"); // Display error toast
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post(`users/verify-otp?email=${email}&otp=${otp}`);

      toast.success("OTP is valid, please enter a new password!"); // Display success toast
      setStep(3);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Invalid OTP!"); // Display error toast
    }
  };

  const handleResetPassword = async () => {
    try {
      await axios.post(`users/reset-password?email=${email}&otp=${otp}&newPassword=${newPassword}`);
      toast.success("Password has been successfully reset!"); // Display success toast
      setEmail("");
      setOtp("");
      setNewPassword("");
      navigate("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Unable to reset password, please try again!"); // Display error toast
    }
  };

  return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-28">
        <h2 className="text-2xl font-bold text-center mb-4">Forgot Password</h2>

        {step === 1 && (
            <div>
              <label className="block text-sm font-medium">Enter your email:</label>
              <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded mt-1 outline-none"
                  placeholder="Enter email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
              <button
                  className="w-full bg-blue-500 text-white p-2 rounded mt-3"
                  onClick={handleSendOTP}
              >
                Send OTP
              </button>
            </div>
        )}

        {step === 2 && (
            <div>
              <label className="block text-sm font-medium">Enter OTP:</label>
              <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="Enter OTP..."
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
              />
              <button
                  className="w-full bg-blue-500 text-white p-2 rounded mt-3"
                  onClick={handleVerifyOTP}
              >
                Verify OTP
              </button>
            </div>
        )}

        {step === 3 && (
            <div>
              <label className="block text-sm font-medium">Enter new password:</label>
              <input
                  type="password"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="Enter new password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                  className="w-full bg-red-500 text-white p-2 rounded mt-3"
                  onClick={handleResetPassword}
              >
                Reset Password
              </button>
            </div>
        )}

        {/* Toast Container for displaying toasts */}
        <ToastContainer />
      </div>
  );
};

export default ForgotPassword;
