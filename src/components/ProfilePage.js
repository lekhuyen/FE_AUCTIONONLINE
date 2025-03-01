import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../utils/axios'
const ProfilePage = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null)


  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const tokenInfo = jwtDecode(token)
        setTokenInfo(tokenInfo);

      } catch (error) {
        console.error("Error decoding token:", error.message);
      }
    }
  }, [])

  useEffect(() => {
    const getuserById = (userId) => {
      axios.get(`http://localhost:8080/api/users/${userId}`)
        .then((response) => {
          setUserInfo(response);

        })
        .catch((error) => {
          console.error("Error fetching About Us Card data", error);
        });
    };

    if (tokenInfo?.userid) {
      getuserById(tokenInfo?.userid)
    }
  }, [tokenInfo?.userid])

  return (
    <div className="mt-[90px] min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg flex">

        {/* Sidebar - Thông tin cá nhân */}
        <div className="w-1/3 border-r p-4">
          {/* Avatar + Tên */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-500 text-white flex items-center justify-center rounded-full text-3xl font-bold">
              d
            </div>
            <h2 className="mt-3 text-xl font-bold">{userInfo?.username}</h2>
            <p className="text-gray-500 text-sm">Chưa có đánh giá</p>
          </div>

          {/* Các nút */}
          <div className="mt-4 space-y-3">
            <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600">
              Chia sẻ trang của bạn
            </button>
            <button className="w-full border py-2 rounded-lg font-semibold hover:bg-gray-100">
              Chỉnh sửa trang cá nhân
            </button>
          </div>

          {/* Thông tin khác */}
          <div className="mt-4 text-sm space-y-2 text-gray-600">
            <p>📩 Phản hồi chat: Chưa có thông tin</p>
            <p>📅 Đã tham gia: <span className="font-medium">1 năm 4 tháng</span></p>
            <p>
              {userInfo?.isVerify ? (
                "✅ Đã xác thực danh tính"
              ) : (
                <Link to="/citizen-verify" className="text-red-500">
                  ❌ Bấm để xác minh danh tính
                </Link>
              )}
            </p>
            <p>📍 Địa chỉ: Chưa cung cấp</p>
          </div>

          {/* Hộp hồ sơ xin việc */}
          <div className="mt-6 p-3 bg-gray-50 border rounded-lg">
            <p className="font-semibold">Hồ sơ xin việc</p>
            <p className="text-sm text-gray-500">Hồ sơ xin việc của bạn trên chuyên trang Việc Làm Tốt</p>
            <button className="mt-2 text-blue-500 font-semibold hover:underline">
              Tạo hồ sơ xin việc
            </button>
          </div>
        </div>

        {/* Khu vực tin đăng */}
        <div className="w-2/3 p-4">
          <div className="border-b pb-2 flex space-x-6">
            <button className="font-bold text-orange-500 border-b-2 border-orange-500">Đang hiển thị (0)</button>
            <button className="text-gray-600">Đã bán (0)</button>
          </div>

          <div className="flex flex-col items-center justify-center h-64">
            <img src="https://static.chotot.com/storage/chotot-icons/svg/no-post.svg" alt="No Post" className="w-24 h-24" />
            <p className="text-gray-600 mt-2">Bạn chưa có tin đăng nào</p>
            <button className="mt-3 bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600">
              ĐĂNG TIN NGAY
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;