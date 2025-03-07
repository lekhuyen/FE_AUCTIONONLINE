import PropTypes from "prop-types";
import { RiAuctionFill } from "react-icons/ri";
import { GiTakeMyMoney } from "react-icons/gi";
import { MdOutlineFavorite, MdFavorite } from "react-icons/md"; // ✅ Sửa lỗi import
import { Caption, PrimaryButton, ProfileCard, Title } from "../common/Design";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { calculateTimeLeft } from "../../utils/helper";
import { addFavoriteItem, removeFavoriteItem, checkFavoriteItem } from "../../api"; // ✅ Import API đúng cách

export const ProductCard = ({ item }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const userId = localStorage.getItem("userId"); // ✅ Định nghĩa userId trước khi gọi API

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (userId) {
        const isFav = await checkFavoriteItem(userId, item.item_id);
        setIsFavorite(isFav);
      }
    };
    fetchFavoriteStatus();
  }, [userId, item.item_id]);

  // ✅ Xử lý yêu thích sản phẩm
  const handleFavorite = async () => {
    if (!userId) {
      alert("Vui lòng đăng nhập để lưu sản phẩm vào danh sách yêu thích!");
      return;
    }

    if (isFavorite) {
      const response = await removeFavoriteItem(userId, item.item_id);
      if (response) {
        setIsFavorite(false);
        alert("Đã hủy yêu thích sản phẩm!");
      }
    } else {
      const response = await addFavoriteItem(userId, item.item_id);
      if (response) {
        setIsFavorite(true);
        alert("Sản phẩm đã được thêm vào yêu thích!");
      }
    }
  };

  useEffect(() => {
    if (item?.start_date) {
      const updateTime = () => calculateTimeLeft(item?.start_date, setTimeLeft);
      updateTime();
      const timer = setInterval(updateTime, 1000);
      return () => clearInterval(timer);
    }
  }, [item?.start_date]);

  return (
    <>
      <div className="bg-white shadow-s1 rounded-xl p-3 relative">
        {
          timeLeft && (
            <div className="flex text-center absolute left-[50%] 
            top-[50%] translate-x-[-50%] shadow-lg translate-y-[-70%] 
            w-[150px] h-[30px] z-20 justify-center items-center rounded-2xl bg-white"
            >
              {timeLeft?.days && <div><p>{timeLeft?.days}(d)</p></div>}
              {timeLeft?.hours && <div><p>{timeLeft?.hours}:</p></div>}
              {timeLeft?.minutes && <div><p>{timeLeft?.minutes}:</p></div>}
              {timeLeft?.seconds && <div><p>{timeLeft?.seconds}</p></div>}
            </div>
          )
        }

        <style>
          {`
          .favorite-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            transition: 0.3s;
          }
          .favorite-btn:hover {
            transform: scale(1.1);
          }
          `}
        </style>

        <div className="h-56 relative overflow-hidden">
          <NavLink to={`/details/${item?.item_id}`}>
            <img src={item?.images[0]} alt={item?.images[0]} className="w-full h-full object-cover rounded-xl hover:scale-105 hover:cursor-pointer transition-transform duration-300 ease-in-out" />
          </NavLink>
          <ProfileCard className="shadow-s1 absolute right-3 bottom-3">
            <RiAuctionFill size={22} className="text-green" />
          </ProfileCard>

          <div className="absolute top-0 left-0 p-2 w-full">
            <div className="flex items-center justify-between">
              {item?.soldout ? (
                <Caption className="text-red-500 bg-white px-3 py-1 text-sm rounded-full">Sold Out</Caption>
              ) : (
                <Caption className="text-green bg-green_100 px-3 py-1 text-sm rounded-full">On Stock</Caption>
              )}
              <Caption className="text-green bg-green_100 px-3 py-1 text-sm rounded-full">{item?.totalBids} Bids</Caption>
            </div>
          </div>
        </div>

        <div className="details mt-4">
          <Title className="uppercase">{item.item_name}</Title>
          <hr className="mt-3" />
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center justify-between gap-5">
              <RiAuctionFill size={40} className="text-green" />
              <div>
                <Caption className="text-green">Current Bid</Caption>
                <Title>${item?.starting_price}.00</Title>
              </div>
            </div>
            <div className="w-[1px] h-10 bg-gray-300"></div>
            <div className="flex items-center justify-between gap-5">
              <GiTakeMyMoney size={40} className="text-red-500" />
              <div>
                <Caption className="text-red-500">Buy Now</Caption>
                <Title>${item?.starting_price}.00</Title>
              </div>
            </div>
          </div>
          <hr className="mb-3" />

          <div className="flex items-center justify-between mt-3">
            <PrimaryButton className="rounded-lg text-sm">Place Bid</PrimaryButton>

            {/* ✅ Nút Yêu Thích */}
            <button className="favorite-btn" onClick={handleFavorite}>
              {isFavorite ? <MdFavorite size={22} className="text-red-500" /> : <MdOutlineFavorite size={22} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

ProductCard.propTypes = {
  item: PropTypes.any,
};
