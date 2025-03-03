import React, { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

export default function QRScanner() {
  const fileInputRef = useRef();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Quét QR từ ảnh đầu tiên
  const scanQRCode = (file) => {
    const html5QrCode = new Html5Qrcode("qr-temp-scanner");
    html5QrCode.scanFile(file, false)
      .then((decodedText) => {
        navigate("/ocr-reader", { state: { qrText: decodedText } });
      })
      .catch(() => {
        setError("Invalid QR. Please try again.");
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-700">Capture the QR code on your identification card</h1>

        <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
          Not Available
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files.length) {
              setError("");
              scanQRCode(e.target.files[0]);
            }
          }}
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          Click to choose an image with QR Code
        </button>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Ẩn phần này chỉ để phục vụ Html5Qrcode */}
        <div id="qr-temp-scanner" className="hidden"></div>
      </div>
    </div>
  );
}
