import { Body, Caption, Container, Title } from "../../router";
import { IoIosStar, IoIosStarHalf, IoIosStarOutline } from "react-icons/io";
import { commonClassNameOfInput } from "../../components/common/Design";
import { AiOutlinePlus } from "react-icons/ai";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import axios from '../../utils/axios'
import { jwtDecode } from "jwt-decode";
import { calculateTimeLeft } from "../../utils/helper";


export const ProductsDetailsPage = () => {
  const { id } = useParams()
  const [userId, setUserId] = useState(null);
  const [productDetail, setProductDetail] = useState({})
  const [imageFile, setImageFile] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isDuration, setIsDuration] = useState(false)

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await axios.get(`auction/${id}`,
          { authRequired: true },
        )

        if (response.code === 0) {
          const product = {
            item_id: response.result.item_id,
            item_name: response.result.item_name,
            description: response.result.description,
            starting_price: response.result.starting_price,
            start_date: response.result.start_date,
            end_date: response.result.end_date,
            bid_step: response.result.bid_step,
            buyerId: response.result.user.id
          }
          setImageFile(response.result.images)
          setProductDetail(product)
        }
      } catch (error) {
        console.log(error);
      }
    }
    getProduct()
  }, [id])

  const [activeTab, setActiveTab] = useState("description");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

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
    if (productDetail?.end_date) {
      const updateTime = () => calculateTimeLeft(productDetail?.end_date, setTimeLeft, setIsDuration)
      updateTime()
      const timer = setInterval(updateTime, 1000);
      return () => clearInterval(timer);
    }
  }, [productDetail?.end_date]);

  return (
    <>
      <section className="pt-24 px-8">
        <Container>
          <div className="flex justify-between gap-8">
            <div className="w-1/2">
              <div className="h-[70vh]">
                <img src={imageFile[0]} alt="" className="w-full h-full object-cover rounded-xl" />
              </div>
            </div>
            <div className="w-1/2">
              <Title level={2} className="capitalize">
                {productDetail.item_name}
              </Title>
              <div className="flex gap-5">
                <div className="flex text-green ">
                  <IoIosStar size={20} />
                  <IoIosStar size={20} />
                  <IoIosStar size={20} />
                  <IoIosStarHalf size={20} />
                  <IoIosStarOutline size={20} />
                </div>
                <Caption>(2 customer reviews)</Caption>
              </div>
              <br />
              <Body>Korem ipsum dolor amet, consectetur adipiscing elit. Maece nas in pulvinar neque. Nulla finibus lobortis pulvinar. Donec a consectetur nulla.</Body>
              <br />
              <Caption>Item condition: New</Caption>
              <br />
              <Caption>Item Verifed: Yes</Caption>
              <br />
              <Caption>Time left:</Caption>
              <br />
              <div className="flex gap-8 text-center">
                <div className="p-5 px-10 shadow-s1">
                  <Title level={4}>{timeLeft?.days || 0}</Title>
                  <Caption>Days</Caption>
                </div>
                <div className="p-5 px-10 shadow-s1">
                  <Title level={4}>{timeLeft?.hours || 0}</Title>
                  <Caption>Hours</Caption>
                </div>
                <div className="p-5 px-10 shadow-s1">
                  <Title level={4}>{timeLeft?.minutes || 0}</Title>
                  <Caption>Minutes</Caption>
                </div>
                <div className="p-5 px-10 shadow-s1">
                  <Title level={4}>{timeLeft?.seconds || 0}</Title>
                  <Caption>Seconds</Caption>
                </div>
              </div>
              <br />
              <Title className="flex items-center gap-2">
                Auction ends:
                <Caption>December 31, 2024 12:00 am</Caption>
              </Title>
              <Title className="flex items-center gap-2 my-5">
                Timezone: <Caption>UTC 0</Caption>
              </Title>
              <Title className="flex items-center gap-2 my-5">
                Price:<Caption>${productDetail.starting_price}</Caption>
              </Title>
              <Title className="flex items-center gap-2">
                Current bid:<Caption className="text-3xl">$500 </Caption>
              </Title>
              {
                userId !== productDetail.buyerId && (
                  <div className="w-[200px] h-[40px] bg-green border rounded-md flex justify-center items-center">
                    <NavLink to={`/chat?item_id=${productDetail.item_id}&buyerId=${productDetail.buyerId}`} type="button" className="font-medium text-white">
                      Chat now
                    </NavLink>
                  </div>
                )
              }
              <div className="p-5 px-10 shadow-s3 py-8">
                <form className="flex gap-3 justify-between">
                  <input className={commonClassNameOfInput} type="number" name="price" />
                  <button type="button" className="bg-gray-100 rounded-md px-5 py-3">
                    <AiOutlinePlus />
                  </button>
                  <button type="submit" className={`py-3 px-8 rounded-lg ${"bg-gray-400 text-gray-700 cursor-not-allowed"}`}>
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="details mt-8">
            <div className="flex items-center gap-5">
              <button className={`rounded-md px-10 py-4 text-black shadow-s3 ${activeTab === "description" ? "bg-green text-white" : "bg-white"}`} onClick={() => handleTabClick("description")}>
                Description
              </button>
              <button className={`rounded-md px-10 py-4 text-black shadow-s3 ${activeTab === "auctionHistory" ? "bg-green text-white" : "bg-white"}`} onClick={() => handleTabClick("auctionHistory")}>
                Auction History
              </button>
              <button className={`rounded-md px-10 py-4 text-black shadow-s3 ${activeTab === "reviews" ? "bg-green text-white" : "bg-white"}`} onClick={() => handleTabClick("reviews")}>
                Reviews(2)
              </button>
              <button className={`rounded-md px-10 py-4 text-black shadow-s3 ${activeTab === "moreProducts" ? "bg-green text-white" : "bg-white"}`} onClick={() => handleTabClick("moreProducts")}>
                More Products
              </button>
            </div>

            <div className="tab-content mt-8">
              {activeTab === "description" && (
                <div className="description-tab shadow-s3 p-8 rounded-md">
                  <Title level={4}>Description</Title>
                  <br />
                  <Caption className="leading-7">
                    If you’ve been following the crypto space, you’ve likely heard of Non-Fungible Tokens (Biddings), more popularly referred to as ‘Crypto Collectibles.’ The world of Biddings is
                    growing rapidly. It seems there is no slowing down of these assets as they continue to go up in price. This growth comes with the opportunity for people to start new businesses to
                    create and capture value. The market is open for players in every kind of field. Are you a collector.
                  </Caption>
                  <Caption className="leading-7">
                    If you’ve been following the crypto space, you’ve likely heard of Non-Fungible Tokens (Biddings), more popularly referred to as ‘Crypto Collectibles.’ The world of Biddings is
                    growing rapidly. It seems there is no slowing down of these assets as they continue to go up in price. This growth comes with the opportunity for people to start new businesses to
                    create and capture value. The market is open for players in every kind of field. Are you a collector.
                  </Caption>
                  <br />
                  <Title level={4}>Product Overview</Title>
                  <div className="flex justify-between gap-5">
                    <div className="mt-4 capitalize w-1/2">
                      <div className="flex justify-between border-b py-3">
                        <Title>category</Title>
                        <Caption>Category</Caption>
                      </div>
                      <div className="flex justify-between border-b py-3">
                        <Title>height</Title>
                        <Caption> 200 (cm)</Caption>
                      </div>
                      <div className="flex justify-between border-b py-3">
                        <Title>length</Title>
                        <Caption> 300 (cm)</Caption>
                      </div>
                      <div className="flex justify-between border-b py-3">
                        <Title>width</Title>
                        <Caption> 400 (cm)</Caption>
                      </div>
                      <div className="flex justify-between border-b py-3">
                        <Title>weigth</Title>
                        <Caption> 50 (kg)</Caption>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <Title>medium used</Title>
                        <Caption> Gold </Caption>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <Title>Price</Title>
                        <Caption> $50000 </Caption>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <Title>Sold out</Title>
                        Yes
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <Title>verify</Title>
                        No
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <Title>Create At</Title>
                        <Caption>December 31, 2024 12:00 am</Caption>
                      </div>
                      <div className="flex justify-between py-3">
                        <Title>Update At</Title>
                        <Caption>December 31, 2024 12:00 am</Caption>
                      </div>
                    </div>
                    <div className="w-1/2">
                      <div className="h-[60vh] p-2 bg-green rounded-xl">
                        <img src="https://bidout-wp.b-cdn.net/wp-content/uploads/2022/10/Image-14.jpg" alt="" className="w-full h-full object-cover rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "auctionHistory" && <AuctionHistory />}
              {activeTab === "reviews" && (
                <div className="reviews-tab shadow-s3 p-8 rounded-md">
                  <Title level={5} className=" font-normal">
                    Reviews
                  </Title>
                  <hr className="my-5" />
                  <Title level={5} className=" font-normal text-red-500">
                    Cooming Soon!
                  </Title>
                </div>
              )}
              {activeTab === "moreProducts" && (
                <div className="more-products-tab shadow-s3 p-8 rounded-md">
                  <h1>More Products</h1>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};
export const AuctionHistory = () => {
  return (
    <>
      <div className="shadow-s1 p-8 rounded-lg">
        <Title level={5} className=" font-normal">
          Auction History
        </Title>
        <hr className="my-5" />

        <div className="relative overflow-x-auto rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-5">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Bid Amount(USD)
                </th>
                <th scope="col" className="px-6 py-3">
                  User
                </th>
                <th scope="col" className="px-6 py-3">
                  Auto
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">December 31, 2024 12:00 am</td>
                <td className="px-6 py-4">$200</td>
                <td className="px-6 py-4">Sunil Pokhrel</td>
                <td className="px-6 py-4"> </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
