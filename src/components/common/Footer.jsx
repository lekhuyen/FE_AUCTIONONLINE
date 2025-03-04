import { Container, Title } from "./Design";
import { FiPhoneOutgoing } from "react-icons/fi";
import { MdOutlineAttachEmail } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";

import { useLocation } from "react-router-dom";

export const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  return (
    <>
      <footer className=" relative bg-primary py-16">
        {isHomePage && <div className="bg-white w-full py-20 -mt-10 rounded-b-[40px] z-10 absolute top-0"></div>}

        <Container className={`${isHomePage ? "mt-32" : "mt-0"} flex flex-col md:flex-row justify-between gap-12`}>
          <div className="w-full md:w-1/3">
            <img src="../images/common/Biddora2.png" alt="" width="160px" />
            <br />
            <p className="text-gray-300">Your Marketplace, Where Every Bid Unlocks Endless Possibilities!</p>
            {/* <div className="bg-gray-300 h-[1px] my-8"></div>
            <Title className=" font-normal text-gray-100">Get The Latest Updates</Title>
            <div className="flex items-center justify-between mt-5">
              <input type="text" placeholder="Enter your email" className="w-full h-full p-3.5 py-[15px] text-sm border-none outline-none rounded-l-md" />
              <PrimaryButton className="rounded-none py-3.5 px-8 text-sm hover:bg-indigo-800 rounded-r-md">Submit</PrimaryButton>
            </div>
            <p className="text-gray-300 text-sm mt-3">Email is safe. We don't spam.</p> */}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-2/3">
            <div>
              <Title level={5} className="text-white font-normal">
                Categories
              </Title>
              <ul className="flex flex-col gap-5 mt-8 text-gray-200">
                <p>Electronics</p>
                <p>Books</p>
                <p>Sports & Outdoor</p>
                <p>Instruments</p>
                <p>Jewelries</p>
                <p>Toys and Games</p>
                <p>Clothes</p>
              </ul>
            </div>
            <div>
              <Title level={5} className="text-white font-normal">
                Discover
              </Title>
              <ul className="flex flex-col gap-5 mt-8 text-gray-200">
                <p>About Biddora</p>
                <p>Help</p>
                <p>Press</p>
                <p>Our Blog</p>
              </ul>
            </div>
            <div>
              <Title level={5} className="text-white font-normal">
                We are Here
              </Title>
              <ul className="flex flex-col gap-5 mt-8 text-gray-200">
                <p>Your Account</p>
                <p>Information</p>
                <p>Contact Us</p>
              </ul>
            </div>
            <div>
              <Title level={5} className="text-white font-normal">
                Follow Us
              </Title>
              <ul className="flex flex-col gap-5 mt-8 text-gray-200">
                <div className="flex items-center gap-2">
                  <FiPhoneOutgoing size={19} />
                  <span>(646) 968-0608</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdOutlineAttachEmail size={22} />
                  <span>biddora@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoLocationOutline size={22} />
                  <span>1201 Broadway Suite</span>
                </div>
              </ul>
              {/* <div className="flex items-center mt-5 justify-between">
                <ProfileCard className="bg-white">
                  <AiOutlineYoutube size={22} />
                </ProfileCard>
                <ProfileCard className="bg-white">
                  <FaInstagram size={22} />
                </ProfileCard>
                <ProfileCard className="bg-white">
                  <CiTwitter size={22} />
                </ProfileCard>
                <ProfileCard className="bg-white">
                  <CiLinkedin size={22} />
                </ProfileCard>
              </div> */}
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
};
