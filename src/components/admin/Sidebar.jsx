import { Caption, CustomNavLink, Title } from "../common/Design";
import { CiGrid41 } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineCategory } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import { IoIosHeartEmpty } from "react-icons/io";
import { User1 } from "../hero/Hero";
import { IoIosLogOut } from "react-icons/io";
import { CgProductHunt } from "react-icons/cg";
import { TbCurrencyDollar } from "react-icons/tb";
import { FiUser, FiMail, FiEdit } from "react-icons/fi";
import { FaPlusCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { RESET } from "../../redux/slide/authSlide";
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { IoBarChartOutline } from "react-icons/io5";


export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // const { token } = useSelector(state => state.auth)
  const [isLogin, setIsLogin] = useState(localStorage.getItem('isIntrospect') || false)
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    if (token) {
      try {
        const tokenInfo = jwtDecode(token);
        setUserInfo(tokenInfo)
      } catch (error) {
        console.log(error.message);
      }
    } else {
      setUserInfo(null)
    }
  }, [token])

  const logoutUser = () => {
    if (token !== null) {
      localStorage.removeItem("token")
      localStorage.removeItem("isIntrospect");
      dispatch(RESET())
      navigate("/login")
    }
  }

  const role = "admin";
  const className = "flex items-center gap-3 mb-2 p-4 rounded-full";

  return (
    <>
      <section className="sidebar flex flex-col justify-between h-[70%]">
        {isLogin &&
          <div className="profile flex items-center text-center justify-center gap-8 flex-col ">
            <img src={User1} alt="" className="w-32 h-32 rounded-full object-cover" />
            <div>
              <Title className="capitalize">{isLogin && userInfo?.username}</Title>
              <Caption>{userInfo?.sub}</Caption>
            </div>
          </div>
        }
        <div>
          {(role === "seller" || role === "admin") && (
            <>

              <CustomNavLink href="/add" isActive={location.pathname === "/add"} className={className}>
                <span>
                  <FaPlusCircle size={22} />
                </span>
                <span>Create Product</span>
              </CustomNavLink>

              {/* do it  */}
            </>
          )}

          {role === "admin" && (
            <>
              <CustomNavLink href="/userlist" isActive={location.pathname === "/userlist"} className={className}>
                <span>
                  <FiUser size={22} />
                </span>
                <span>All User</span>
              </CustomNavLink>

              <CustomNavLink href="/product/admin" isActive={location.pathname === "/product/admin"} className={className}>
                <span>
                  <CgProductHunt size={22} />
                </span>
                <span> All product List</span>
              </CustomNavLink>

              <CustomNavLink href="/category" isActive={location.pathname === "/category"} className={className}>
                <span>
                  <MdOutlineCategory size={22} />
                </span>
                <span>Categories</span>
              </CustomNavLink>
              {/* <CustomNavLink href="/admin/income" isActive={location.pathname === "/admin/income"} className={className}> */}
              {/* <span>
                  <TbCurrencyDollar size={22} />
                </span>
                <span>Income</span> */}
              {/* </CustomNavLink> */}

              <CustomNavLink href="/admin-contact" isActive={location.pathname === "/admin-contact"} className={className}>
                <span>
                  <FiMail size={22} /> {/* Contact Icon */}
                </span>
                <span>Contact</span>
              </CustomNavLink>

              <CustomNavLink href="/admin-blog" isActive={location.pathname === "/admin-blog"} className={className}>
                <span>
                  <FiEdit size={22} /> {/* Blog Icon */}
                </span>
                <span>Blog</span>
              </CustomNavLink>

            </>
          )}

          <CustomNavLink href="/thongke" isActive={location.pathname === "/thongke"} className={className}>
            <span>
              <IoBarChartOutline size={22} />
            </span>
            <span>Statistis</span>
          </CustomNavLink>

          <CustomNavLink href="/profile" isActive={location.pathname === "/profile"} className={className}>
            {/* <span>
              <IoSettingsOutline size={22} />
            </span>
            <span>Personal Profile</span> */}
          </CustomNavLink>
          {
            isLogin &&
            <button onClick={logoutUser} className="flex items-center w-full gap-3 mt-4 bg-red-500 mb-3 hover:text-white p-4 rounded-full text-white">
              <span>
                <IoIosLogOut size={22} />
              </span>
              <span>Log Out</span>
            </button>
          }
        </div>
      </section>
    </>
  );
};
