import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

// design
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { IoSearchOutline } from "react-icons/io5";
import { Container, CustomNavLink, CustomNavLinkList, ProfileCard } from "../../router";
import { User1 } from "../hero/Hero";
import { menulists } from "../../utils/data";
import { MdOutlineMessage, MdKeyboardArrowUp, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { getAllCategory } from "../../redux/slide/productSlide";
import { useDispatch, useSelector } from "react-redux";

export const Header = () => {
  const dispatch = useDispatch()
  const { categories } = useSelector(state => state.product)
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [isShowCategory, setIsShowCategory] = useState(false)

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
                                <li key={category?.category_id} className="border-b-[1px] p-1 cursor-pointer">
                                  <Link to="#">{category?.category_name}</Link>
                                </li>
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
            <div ref={menuRef} className={`lg:flex lg:items-center lg:w-auto w-full p-5 absolute right-0 top-full menu-container ${isOpen ? "open" : "closed"}`}>
              {menulists.map((list) => (
                <li href={list.path} key={list.id} className="uppercase list-none">
                  <CustomNavLink className="text-white">{list.link}</CustomNavLink>
                </li>
              ))}
            </div>
          </nav>
        </Container>
      </header>
    </>
  );
};
