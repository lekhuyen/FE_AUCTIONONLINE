import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import styles from '../chat/chat.module.scss'

// design
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { IoSearchOutline } from "react-icons/io5";
import { Container, CustomNavLink, CustomNavLinkList, ProfileCard } from "../../router";
import { User1 } from "../hero/Hero";
import { menulists } from "../../utils/data";
import { MdOutlineMessage, MdKeyboardArrowUp, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { getAllCategory } from "../../redux/slide/productSlide";
import { useDispatch, useSelector } from "react-redux";
import { IoMdNotificationsOutline } from "react-icons/io";
import axios from '../../utils/axios'
import { jwtDecode } from "jwt-decode";
import { useLoginExpired } from "../../utils/helper";
import { BsDot } from "react-icons/bs";


import clsx from "clsx";
import moment from "moment";



export const Header = () => {
  const dispatch = useDispatch()
  const { categories, notification } = useSelector(state => state.product)
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [isShowCategory, setIsShowCategory] = useState(false)
  const [userId, setUserId] = useState(null);
  const [isLogin, setIsLogin] = useState(localStorage.getItem('isIntrospect') || false)
  const { triggerLoginExpired } = useLoginExpired();
  const [notifications, setNotifications] = useState([])
  const [showNotification, setShowNotification] = useState(false)
  // console.log(notification);

  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenuOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 0);
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeMenuOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", closeMenuOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Check if it's the home page
  const isHomePage = location.pathname === "/";

  const role = "buyer";
  useEffect(() => {
    dispatch(getAllCategory({
      page: 0,
      size: 0
    }))
  }, [dispatch])

  //get notification

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
    if (isLogin) {
      getNotification()
    }
  }, [userId])
  const getNotification = async () => {
    if (isLogin) {
      try {
        const response = await axios.get("bidding/notification/" + userId, { authRequired: true })
        if (response.code === 0) {
          setNotifications(response.result)
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      triggerLoginExpired()
    }
  }

  useEffect(() => {
    setNotifications(prev => [notification, ...prev])
  }, [notification])

  const hanldeReadedNotification = async (id) => {
    if (isLogin) {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.put(
          `/bidding/notification/status/${id}/${userId}`,
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.code === 0) {
          setShowNotification(false)
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      triggerLoginExpired()
    }
  }
  // console.log(notifications);

  return (
    <>
      <header className={isHomePage ? `header py-1 bg-primary ${isScrolled ? "scrolled" : ""}` : `header bg-white shadow-s1 ${isScrolled ? "scrolled" : ""}`}>
        <Container>
          <nav className="p-4 flex justify-between items-center relative">
            <div className="flex items-center gap-14">
              <div>
                {isHomePage && !isScrolled ? (
                  <img src="../images/common/header-logo.png" alt="LogoImg" className="h-11" />
                ) : (
                  <img src="../images/common/header-logo2.png" alt="LogoImg" className="h-11" />
                )}
              </div>
              <div className="hidden lg:flex items-center justify-between gap-8 relative">
                {menulists.map((list) => (
                  <li key={list.id} className="capitalize list-none" onMouseOver={() => {
                    if (list.children) setIsShowCategory(true)
                  }}
                    onMouseOut={() => {
                      if (list.children) setIsShowCategory(false)
                    }}
                  >
                    <CustomNavLinkList href={list.path} isActive={location.pathname === list.path}
                      className={`${isScrolled || !isHomePage ? "text-black" : "text-white"} flex items-center`}>
                      {list.link}
                      {list.children && (
                        <span className="">
                          {
                            isShowCategory ?
                              <MdKeyboardArrowUp className="text-white" size={25} />
                              :
                              <MdOutlineKeyboardArrowDown className="text-white" size={25} />
                          }
                        </span>
                      )}
                    </CustomNavLinkList>
                    {
                      list.children && isShowCategory && (
                        <div className=" top-[25px] absolute bg-white shadow-lg rounded-sm">
                          <ul className="">
                            {
                              categories?.data?.length > 0 && categories?.data?.map(category => (
                                <Link to={`/product-list/${category?.category_id}`}>
                                  <li key={category?.category_id} className="border-b-[1px] p-1 cursor-pointer">
                                    {category?.category_name}
                                  </li>
                                </Link>
                              ))
                            }
                          </ul>
                        </div>
                      )
                    }
                  </li>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-8 icons">
              <div className="hidden lg:flex lg:items-center lg:gap-8">
                <IoSearchOutline size={23} className={`${isScrolled || !isHomePage ? "text-black" : "text-white"}`} />
                {role === "buyer" && (
                  <CustomNavLink href="/seller/login" className={`${isScrolled || !isHomePage ? "text-black" : "text-white"}`}>
                    Become a Seller
                  </CustomNavLink>
                )}
                <CustomNavLink href="/chat" className={`${isScrolled || !isHomePage ? "text-black" : "text-white"}`}>
                  <MdOutlineMessage />
                </CustomNavLink>
                <div onClick={() => setShowNotification(!showNotification)} className="relative cursor-pointer">
                  <IoMdNotificationsOutline size={20} />
                  {
                    notifications.filter(notification => notification.sellerIsRead === false && notification.sellerId === userId).length > 0 && (
                      <div className="absolute top-[-10px] right-[-10px] w-5 h-5 border rounded-full bg-red-600 
                    flex items-center justify-center text-white text-[13px]">
                        {notifications.filter(notification => notification.sellerIsRead === false && notification.sellerId === userId).length}
                      </div>
                    )
                  }
                  {
                    notifications.filter(notification => notification.buyerIsRead === false && notification.buyerId === userId).length > 0 && (
                      <div className="absolute top-[-10px] right-[-10px] w-5 h-5 border rounded-full bg-red-600 
                    flex items-center justify-center text-white text-[13px]">
                        {notifications.filter(notification => notification.buyerIsRead === false && notification.buyerId === userId).length}
                      </div>
                    )
                  }
                  {/* notification */}
                  {
                    showNotification && (
                      <div className="absolute w-[360px] top-[30px] overflow-hidden bg-white shadow-lg rounded-sm p-2">
                        <div className="w-full"><h3 className="text-[24px]">Thong bao</h3></div>
                        <div className={clsx(styles.custom_scroll, 'overflow-y-auto max-h-[400px]')}>
                          {notifications?.length > 0 && notifications?.map((notifi, index) => (
                            <NavLink to={`/details/${notifi?.productId}`}
                              onClick={() => hanldeReadedNotification(notifi.id)} key={index} className="flex gap-2 items-center bottom-1 padding-2">
                              {
                                // check if the user is the seller
                                notifi.sellerId === userId && (
                                  <>
                                    <div className="w-[50px]  flex-shrink-0"><img className="w-full" alt="" src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png" /></div>
                                    <div>
                                      {
                                        notifi.auction === true ? (
                                          <>
                                            <p className="whitespace-normal overflow-hidden text-ellipsis text-[14px]">
                                              <span className="font-bold">San pham <span className="font-bold">{notifi.productName}</span> cua ban </span>
                                              da duoc dau gia thanh cong cua ban voi muc gia {notifi.price}
                                            </p>
                                          </>
                                        )
                                          :
                                          (
                                            <>
                                              <p className="whitespace-normal overflow-hidden text-ellipsis text-[14px]">
                                                <span className="font-bold">{notifi.buyerName} </span>
                                                da dau gia san pham <span className="font-bold">{notifi.productName} </span>
                                                cua ban voi muc gia {notifi.price}
                                              </p>
                                            </>
                                          )
                                      }
                                      <p className="text-blue-500 text-[12px]">{moment(notifi.timestamp).fromNow()}</p>
                                    </div>
                                    {
                                      notifi.sellerIsRead === false && (
                                        <div className="pr-3.5"><BsDot size={27} className="text-blue-500" /></div>
                                      )
                                    }
                                  </>
                                )
                              }

                              {
                                // check if the user is the buyer
                                notifi.buyerId === userId && (
                                  <>
                                    <div className="w-[50px] flex-shrink-0"><img className="w-full" alt="" src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png" /></div>
                                    <div>
                                      {
                                        notifi.auction === true ? (
                                          <>
                                            <p className="whitespace-normal overflow-hidden text-ellipsis text-[15px]">
                                              <span className="font-bold">Chúc mừng bạn </span>
                                              da dau gia thanh cong san pham <span className="font-bold">{notifi.productName}</span> voi muc gia {notifi.price}
                                            </p>
                                          </>
                                        )
                                          :
                                          (
                                            <>
                                              <p className="whitespace-normal overflow-hidden text-ellipsis text-[15px]">
                                                <span className="font-bold">Ban </span>
                                                da dau gia thanh cong san pham <span className="font-bold">{notifi.productName}</span> voi muc gia {notifi.price}
                                              </p>
                                            </>
                                          )
                                      }
                                      <p className="text-blue-500 text-[12px]">{moment(notifi.timestamp).fromNow()}</p>
                                    </div>
                                    {
                                      notifi.buyerIsRead === false && (
                                        <div className="pr-3.5"><BsDot size={27} className="text-blue-500" /></div>
                                      )
                                    }
                                  </>
                                )
                              }
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    )
                  }
                </div>
                <CustomNavLink href="/login" className={`${isScrolled || !isHomePage ? "text-black" : "text-white"}`}>
                  Sign in
                </CustomNavLink>
                <CustomNavLink href="/register" className={`${!isHomePage || isScrolled ? "bg-green" : "bg-white"} px-8 py-2 rounded-full text-primary shadow-md`}>
                  Join
                </CustomNavLink>
                <CustomNavLink href="/dashboard">
                  <ProfileCard>
                    <img src={User1} alt="" className="w-full h-full object-cover" />
                  </ProfileCard>
                </CustomNavLink>
              </div>
              <div className={`icon flex items-center justify-center gap-6 ${isScrolled || !isHomePage ? "text-primary" : "text-white"}`}>
                <button onClick={toggleMenu} className="lg:hidden w-10 h-10 flex justify-center items-center bg-black text-white focus:outline-none">
                  {isOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
                </button>
              </div>
            </div>

            {/* Responsive Menu if below 768px */}
            {/* <div ref={menuRef} className={`lg:flex lg:items-center lg:w-auto w-full p-5 absolute right-0 top-full menu-container ${isOpen ? "open" : "closed"}`}>
              {menulists.map((list) => (
                <li href={list.path} key={list.id} className="uppercase list-none">
                  <CustomNavLink className="text-white">{list.link}</CustomNavLink>
                </li>
              ))}
            </div> */}
          </nav>
        </Container>
      </header>
    </>
  );
};
