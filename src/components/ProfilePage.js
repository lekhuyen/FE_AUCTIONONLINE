import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios'
import Swal from 'sweetalert2';
import ManagerPost from './ManagerPost';
const ProfilePage = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null)

  const [balance, setBalance] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8080/api/stripe/balance", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      
    })
      .then(response => { setBalance(response.data)
        console.log(response  );
      })
      .catch(error => console.error("❌ Lỗi khi lấy số dư:", error));
  }, []);

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

  const xemthongtin = () => {
    Swal.fire({
      // <p><strong>Số CCCD:</strong> ${userInfo.citizen.ciCode}</p>
      title: `Thông tin bạn đã xác minh.`,
      html: `
      <div style="text-align: left;">
      <p><strong>Tên:</strong> ${userInfo.citizen.fullName}</p>
    <p><strong>Ngày sinh:</strong> ${userInfo.citizen.birthDate}</p>
    <p><strong>Ngày cấp:</strong> ${userInfo.citizen.startDate}</p>
    </div>
    `,
      confirmButtonText: "Ok",
      // <p><strong>Địa chỉ:</strong> ${userInfo.citizen.address}</p>
      customClass: {
        confirmButton: "swal-confirm-button",
      },
    })
  }

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
            <h2 className="mt-3 text-xl font-bold">{userInfo?.name}</h2>
            <p className="text-gray-500 text-sm">No Rating</p>
          </div>

          {/* Các nút */}
          <div className="mt-4 space-y-3">
            <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600">
              Share Your Profile
            </button>
            <button className="w-full border py-2 rounded-lg font-semibold hover:bg-gray-100">
              Reset Password
            </button>
          </div>

          {/* Thông tin khác */}
          <div className="mt-4 text-sm space-y-2 text-gray-600">
            <p>📩 Reply chat: ...</p>
            <p>📅 Enrolled: <span className="font-medium">1 year 4 months</span></p>
            <p>
              {userInfo?.isVerify ? (
                <>
                  ✅ Verified
                  <button onClick={xemthongtin} className='ml-2 text-green'>View</button>
                </>
              ) : (
                <Link to="/citizen-verify" className="text-red-500">
                  ❌ Click to Verify
                </Link>
              )}
            </p>
            <p>📍 Address: {userInfo?.address}</p>
            <p>📩 Email: {userInfo?.email}</p>
            <p>📞 Phone: {userInfo?.phone}</p>
   

            <p className="mt-3 text-xl font-bold">
              {userInfo?.money?.toLocaleString("vi-VN")} VNĐ
            </p>
            <div className="container mx-auto mt-10 p-6">
              <h2 className="text-2xl font-bold mb-4">Số dư tài khoản</h2>
              {balance ? (
                <p className="text-lg"><strong>${balance.available[0].amount / 100}</strong> USD</p>
              ) : (
                <p>Đang tải...</p>
              )}
            </div>
            {/* <a href="/favorites" isActive={location.pathname === "/favorites"} className={className}>
            <span>
              <IoIosHeartEmpty size={22} />
            </span>
            <span>My Favorites</span>
          </a> */}
          </div>

          {/* Hộp hồ sơ xin việc */}
          {/* <div className="mt-6 p-3 bg-gray-50 border rounded-lg">
            <p className="font-semibold">Hồ sơ xin việc</p>
            <p className="text-sm text-gray-500">Hồ sơ xin việc của bạn trên chuyên trang Việc Làm Tốt</p>
            <button className="mt-2 text-blue-500 font-semibold hover:underline">
              Tạo hồ sơ xin việc
            </button>
          </div> */}
        </div>

        {/* Khu vực tin đăng */}
        <div className="w-full overflow-auto">
          {/* <div className="border-b pb-2 flex space-x-6">
            <button className="font-bold text-orange-500 border-b-2 border-orange-500">Đang hiển thị (0)</button>
            <button className="text-gray-600">Đã bán (0)</button>
          </div>

          <div className="flex flex-col items-center justify-center h-64">
            <img src="https://static.chotot.com/storage/chotot-icons/svg/no-post.svg" alt="No Post" className="w-24 h-24" />
            <p className="text-gray-600 mt-2">Bạn chưa có tin đăng nào</p>
            <Link to={'/manager-post'} className="mt-3 bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600">
              ĐĂNG TIN NGAY
            </Link>
          </div> */}
          <ManagerPost />
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;