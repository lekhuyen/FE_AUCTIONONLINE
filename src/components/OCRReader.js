import { jwtDecode } from "jwt-decode";
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Tesseract from "tesseract.js";
import axios from "../utils/axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
export default function OCRReader() {
  const navigate = useNavigate()
  const location = useLocation();
  const { qrText } = location.state || {};

  const fileInputRef = useRef();
  const [ocrResult, setOcrResult] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  const [cicode, setCicode] = useState('')
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const tokenInfo = jwtDecode(token)
        setUserId(tokenInfo.userid)
      } catch (error) {
        console.error("Error decoding token:", error.message);
      }
    }
  }, [])

  useEffect(() => {
    if (qrText) {

      const res = qrText.split("|");
      setCicode(res[0])
      setFullName(res[2])
      setDob(res[3].substring(0, 2) + "/" + res[3].substring(2, 4) + "/" + res[3].substring(4, 8))
      setAddress(res[5])
    }
  }, [qrText]);

  const handleVerifyCitizen = async (request) => {
    try {
      const response = await axios.post("users/verify-citizen", request, {
        headers: {
          "Content-Type": "application/json"
        },
        authRequired: true
      });

      if (response.result === true) {
        Swal.fire({
          title: `Congratulations! ${response.message}`,
          text: "You can now access all the features of the application.",
          confirmButtonText: "Ok",
          customClass: {
            confirmButton: "swal-confirm-button",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/profile-page");
            // navigate("/profile-page", { state: { iverify: true } });
          }
        });
      }
      return response.data;
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      }
    }
  }

  useEffect(() => {
    if (ocrResult) {
      const dateRegex = /\b(\d{2}\/\d{2}\/\d{4})\b/; // dd/mm/yyyy
      const foundDate = ocrResult.match(dateRegex);
      const ngayCap = foundDate ? foundDate[0] : "Không tìm thấy ngày cấp";

      const mrzRegex = /(IDVNM[^\n]+\n[^\n]+\n[^\n]+)/;
      const foundMRZ = ocrResult.match(mrzRegex);
      const mrz = foundMRZ ? foundMRZ[0].trim() : "Không tìm thấy MRZ";
      if (mrz.includes(cicode)) {
        console.log(" Có chứa dãy số trong MRZ");
        const result = {
          userId: userId,
          ciCode: cicode,
          fullName: fullName,
          birthDate: dob,
          address: address,
          startDate: ngayCap,
        }

        handleVerifyCitizen(result)

      } else {
        toast.warning("Xin hãy chọn ảnh khác để quét lại!");
      }

    }
  }, [ocrResult]);

  // Đọc OCR khi người dùng chọn ảnh mới
  const handleImageSelect = (file) => {
    setImagePreview(URL.createObjectURL(file));
    setOcrResult("");
    setError("");
    setLoading(true);

    Tesseract.recognize(file, "eng+vie", {
      logger: () => { },
    })
      .then(({ data: { text } }) => {
        setOcrResult(text);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể đọc nội dung ảnh.");
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-700">Tải ảnh sau của thẻ CCCD của bạn</h1>

        {/* <div className="bg-green-100 text-green-700 p-3 rounded-lg w-full">
          QR Code: {qrText}
        </div> */}

        <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
          {imagePreview ? (
            <img src={imagePreview} alt="Chọn ảnh" className="object-contain max-h-full" />
          ) : (
            <p>Chưa có ảnh nào</p>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files.length) {
              handleImageSelect(e.target.files[0]);
            }
          }}
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          Chọn ảnh để đọc nội dung
        </button>

        {loading && <p className="text-blue-500 text-center">Đang đọc nội dung ảnh...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {/* {ocrResult && (
          <div className="p-3 bg-gray-100 rounded-lg text-sm break-words">
            <p className="font-semibold">Nội dung ảnh:</p>
            <p className="whitespace-pre-wrap mt-2">{ocrResult}</p>
          </div>
        )} */}
      </div>
    </div>
  );
}
