import { Body, Caption, Container, Title } from "../../router";
import { IoIosStar, IoIosStarHalf, IoIosStarOutline } from "react-icons/io";
import { commonClassNameOfInput } from "../../components/common/Design";
import { AiOutlinePlus } from "react-icons/ai";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import axios from '../../utils/axios'
import { jwtDecode } from "jwt-decode";
import { calculateTimeLeft, useLoginExpired } from "../../utils/helper";
import { toast } from "react-toastify";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import { addNotification, auctionsuccess } from "../../redux/slide/productSlide";


export const ProductsDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [userId, setUserId] = useState(null);
  const [productDetail, setProductDetail] = useState({})
  const [imageFile, setImageFile] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isDuration, setIsDuration] = useState(false)
  const [isLogin, setIsLogin] = useState(localStorage.getItem('isIntrospect') || false)
  const { triggerLoginExpired } = useLoginExpired();
  const [priceBidding, setPriceBidding] = useState('')
  const [currentPrice, setCurrentPrice] = useState(0)
  const [stompClient, setStompClient] = useState(null);
  // const [notification, setNotification] = useState('')

  const { isLoading } = useSelector(state => state.product)

  const getProduct = async () => {
    try {
      const response = await axios.get(`auction/${id}`,
        { authRequired: true },
      )
      // console.log(response);

      if (response.code === 0) {
        const product = {
          item_id: response.result.item_id,
          item_name: response.result.item_name,
          description: response.result.description,
          starting_price: response.result.starting_price,
          start_date: response.result.start_date,
          end_date: response.result.end_date,
          bid_step: response.result.bid_step,
          buyerId: response.result.user.id,
          isSell: response.result.sell,
          isSoldOut: response.result.soldout
        }
        setImageFile(response.result.images)
        setProductDetail(product)
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
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
      const updateTime = () => calculateTimeLeft(productDetail?.start_date, setTimeLeft, setIsDuration)
      updateTime()
      const timer = setInterval(updateTime, 1000);
      return () => clearInterval(timer);
    }
  }, [productDetail?.end_date]);


  // bidding 
  //get bidding of product
  useEffect(() => {
    const getBiddingOfProduct = async () => {
      try {
        const response = await axios.get("bidding/" + id)
        setCurrentPrice(response)
      } catch (error) {
        console.log(error);
      }
    }
    getBiddingOfProduct()
  }, [id])


  // const onSubmitBidding = async (e) => {
  //   e.preventDefault()
  //   if (isLogin) {
  //     const bidding = {
  //       price: +priceBidding,
  //       productId: productDetail.item_id,
  //       userId: userId
  //     }
  //     try {
  //       const response = await axios.post("bidding", bidding, { authRequired: true })
  //       console.log(response);
  //     } catch (error) {
  //       toast.error(error.response.data.message)
  //       console.log(error.response.data.message);
  //     }
  //   } else {
  //     triggerLoginExpired()
  //   }
  // }


  useEffect(() => {
    const token = localStorage.getItem('token');
    const socketFactory = () => {
      return new SockJS('http://localhost:8080/ws', null, {
        withCredentials: true,
      });
    };

    const client = Stomp.over(socketFactory);

    client.connect({ Authorization: `Bearer ${token}` }, () => {
      // console.log("Connected to WebSocket");

      client.subscribe('/topic/newbidding', (message) => {
        const newCategory = JSON.parse(message.body);
        setCurrentPrice(newCategory);
      });
      // client.subscribe('/topic/notification', (message) => {
      //   const newNotification = JSON.parse(message.body);

      //   setNotification(newNotification);
      // });
    }, (error) => {
      console.error("WebSocket connection error:", error);
    });

    setStompClient(client);

    return () => {
      if (client.connected) {
        client.disconnect(() => {
          console.log("Disconnected from WebSocket");
        });
      }
    };


  }, [])

  const onSubmitBidding = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token');
    if (priceBidding <= productDetail.starting_price) {
      toast.error("Price must be greater than current price")
      return
    }
    if (priceBidding <= currentPrice.price) {
      toast.error("Price must be greater than current price")
      return
    }

    if (!token) {
      triggerLoginExpired()
    }
    if (stompClient && stompClient.connected) {
      const bidding = {
        price: +priceBidding,
        productId: productDetail.item_id,
        userId: userId,
        seller: productDetail.buyerId
      }
      stompClient.send("/app/create", { Authorization: `Bearer ${token}` }, JSON.stringify(bidding));
      setPriceBidding('')
    } else {
      console.error("WebSocket is not connected");
    }

  }




  //call api khi countdown = 0
  useEffect(() => {
    const sellingProduct = async () => {
      if (isDuration) {
        await axios.put(`auction/issell/${id}`)
      }
    }
    sellingProduct()
  }, [id, isDuration])

  //chot gia
  const handleAuctionSuccess = async (id) => {
    if (isLogin) {
      try {
        // const response = await axios.post(`bidding/success/${productDetail.item_id}/${userId}`, null, { authRequired: true })
        dispatch(auctionsuccess({ productId: id, sellerId: userId }))
        if (!isLoading) {
          toast.success("Ban da cho qua thanh cong")
        }

        getProduct()
      } catch (error) {
        console.log(error);
      }
    } else {
      triggerLoginExpired()
    }
  }

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
              <div className="flex items-center">
                <Title level={2} className="capitalize">
                  {productDetail.item_name}
                </Title>
                {
                  productDetail.isSoldOut === true && <div><p className="text-red-700 font-bold">soldout*</p></div>
                }
              </div>
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
              <Title className={`flex items-center gap-2 ${productDetail.isSoldOut ? 'text-red-700' : ''}`}>
                Current bid:<Caption className="text-3xl">${currentPrice.price || 0} </Caption>
              </Title>


              {
                (userId !== productDetail.buyerId && productDetail.isSoldOut === false) && (
                  <div className="w-[200px] h-[40px] bg-green border rounded-md flex justify-center items-center">
                    <NavLink to={`/chat?item_id=${productDetail.item_id}&buyerId=${productDetail.buyerId}`} type="button" className="font-medium text-white">
                      Chat now
                    </NavLink>
                  </div>
                )
              }
              {
                userId === productDetail.buyerId && (productDetail.isSoldOut === false) && (productDetail.isSell === true) && (
                  <div onClick={() => handleAuctionSuccess(productDetail?.item_id)} className="w-[200px] cursor-pointer h-[40px] bg-green border rounded-md flex justify-center items-center">
                    <button className="font-medium text-white">
                      This price
                    </button>
                  </div>
                )
              }
              {
                ((userId !== productDetail.buyerId) && (productDetail.isSell === true) && (productDetail.isSoldOut === false)) &&
                <div div className="p-5 px-10 shadow-s3 py-8">
                  <form onSubmit={onSubmitBidding} className="flex gap-3 justify-between">
                    <input className={commonClassNameOfInput} value={priceBidding} onChange={e => setPriceBidding(e.target.value)} type="number" name="price" />
                    <button type="button" className="bg-gray-100 rounded-md px-5 py-3">
                      <AiOutlinePlus />
                    </button>
                    {/* cursor-not-allowed */}
                    <button type="submit" className={`py-3 px-8 rounded-lg ${"bg-gray-400 text-gray-700"}`}>
                      Submit
                    </button>
                  </form>
                </div>
              }
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
      </section >
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
