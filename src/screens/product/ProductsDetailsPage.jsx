import { Body, Caption, Container, Title } from "../../router";
import { commonClassNameOfInput } from "../../components/common/Design";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from '../../utils/axios'
import { jwtDecode } from "jwt-decode";
import { calculateTimeLeft, useLoginExpired } from "../../utils/helper";
import { toast } from "react-toastify";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import { auctionsuccess } from "../../redux/slide/productSlide";
import Swal from "sweetalert2";
import { followAuctioneer, unfollowAuctioneer, checkIfFollowing, getComments, addComment } from "../../api"; // Thêm dòng này



export const ProductsDetailsPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const dispatch = useDispatch()
  const [userId, setUserId] = useState(null);
  const [isOpenInput, setSsOpenInput] = useState(false);
  const [productDetail, setProductDetail] = useState({})
  const [imageFile, setImageFile] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeLeftEndDate, setTimeLeftEndDate] = useState(null);
  const [isDuration, setIsDuration] = useState(false)
  const [isLogin] = useState(localStorage.getItem('isIntrospect') || false)
  const { triggerLoginExpired } = useLoginExpired();
  const [priceBidding, setPriceBidding] = useState('')
  const [currentPrice, setCurrentPrice] = useState(0)
  const [stompClient, setStompClient] = useState(null);
  // const [notification, setNotification] = useState('')
  const [comments, setComments] = useState([]); // ✅ State lưu danh sách bình luận
  const [newComment, setNewComment] = useState(""); // ✅ State lưu bình luận mới
  const [activeTab, setActiveTab] = useState("description"); // ✅ Đặt trong function component

  //truong
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = async () => {
    if (!userId) {
        alert("Vui lòng đăng nhập để follow người bán!");
        return;
    }

    try {
        console.log("📌 Gửi request follow:", userId, productDetail.buyerId);
        const response = await followAuctioneer(userId, productDetail.buyerId);

        if (response) {
            setIsFollowing(true);
            alert("Bạn đã follow người bán!");
        }
    } catch (error) {
        console.error("❌ Lỗi khi follow:", error);
    }
};




  const handleUnfollow = async () => {
    try {
      console.log("📌 Bắt đầu hủy follow:", userId, productDetail.buyerId);
      const response = await unfollowAuctioneer(userId, productDetail.buyerId);

      if (response) {
        setIsFollowing(false);
        alert("Bạn đã hủy theo dõi người bán!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi unfollow:", error);
    }
  };


  // Cập nhật chi tiết sản phẩm và bình luận khi component render
  // useEffect(() => {
  //   const fetchProductDetails = async () => {
  //     try {
  //       const response = await axios.get(`/details/${id}`);
  //       if (response.data) {
  //         setProductDetail(response.data);
  //         // Kiểm tra seller_id có hợp lệ không
  //         if (!response.data.seller_id) {
  //           console.error("❌ seller_id không hợp lệ");
  //         } else {
  //           console.log("📌 seller_id hợp lệ:", response.data.seller_id);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("❌ Lỗi khi tải chi tiết sản phẩm:", error);
  //     }
  //   };

  //   fetchProductDetails();
  // }, [id]);





  // Lấy danh sách bình luận của người bán
  const fetchComments = async (sellerId) => {
    if (sellerId) {
      const commentData = await getComments(sellerId);
      setComments(commentData || []);
    }
  };

  useEffect(() => {
    if (activeTab === "reviews" && productDetail.seller_id) {
      fetchComments(productDetail.seller_id); // ✅ Gọi API bình luận khi mở tab Reviews
    }
  }, [activeTab, productDetail.seller_id]);

  // Thay đổi tab active
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Gửi bình luận mới
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return alert("Vui lòng nhập nội dung bình luận!");

    // Đảm bảo auctioneerId được lấy từ seller_id
    const auctioneerId = productDetail.seller_id;

    console.log("🔑 Gửi bình luận với dữ liệu:", {
      userId,
      auctioneerId, // Kiểm tra xem auctioneerId có hợp lệ không
      content: newComment,
    });

    // Kiểm tra auctioneerId trước khi gửi bình luận
    if (!auctioneerId) {
      console.error("❌ auctioneerId không hợp lệ");
      alert("auctioneerId không hợp lệ");
      return;  // Ngừng việc gửi bình luận nếu auctioneerId không hợp lệ
    }

    const response = await addComment(userId, auctioneerId, newComment); // Gửi API bình luận
    if (response) {
      setComments([...comments, { userName: "Bạn", content: newComment }]);
      setNewComment("");
    }
  };






  useEffect(() => {
    const checkFollowStatus = async () => {
      if (userId && productDetail.buyerId) {
        const isFollowed = await checkIfFollowing(userId, productDetail.buyerId);
        console.log("🚀 Trạng thái follow từ API:", isFollowed);
        setIsFollowing(isFollowed);
      }
    };

    checkFollowStatus();
  }, [userId, productDetail.buyerId]);

  const [isSoldout, setIsSoldout] = useState(false)

  //const { isLoading } = useSelector(state => state.product)


  const getProduct = async () => {
    console.log("goi laij");

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
          isSoldOut: response.result.soldout,
          sellerName: response.result.user.name,
          seller_id: response.result.user.id
        }
        setIsSoldout(response.result.soldout)
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
  }, [productDetail?.start_date]);

  useEffect(() => {
    if (productDetail?.end_date) {
      const updateTime = () => calculateTimeLeft(productDetail?.end_date, setTimeLeftEndDate, setIsDuration)
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
        Swal.fire({
          title: `Bạn muốn chốt giá?`,
          text: "Bấn 'OK' để chốt, 'Cancel' để hủy",
          confirmButtonText: "Ok",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          customClass: {
            confirmButton: "swal-confirm-button",
          },
        }).then(async (result) => {
          if (result.isConfirmed) {
            const actionResult = await dispatch(auctionsuccess({ productId: id, sellerId: userId }));
            console.log(actionResult);
            if (auctionsuccess.fulfilled.match(actionResult)) {
              toast.success("Bạn đã chốt giá thành công!");
              setIsSoldout(true);
            } else {
              toast.error("Chốt giá thất bại, vui lòng thử lại.");
            }
          } else {
            toast.info("Bạn đã hủy chốt giá.");
          }
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      triggerLoginExpired();
    }
  }



  useEffect(() => {
    if ((userId !== productDetail.buyerId) && (productDetail.isSell === true) && (productDetail.isSoldOut === false)) {
      setSsOpenInput(true)
    }
  }, [id, productDetail]);

  // item, userId !== item?.userId ? item?.sellerName : item?.buyerName,
  const handleCreateRoom = async (productId) => {
    try {
      if (productId && userId) {
        const response = await axios.post(`chatroom/room/${productId}`, {
          buyerId: userId
        },
          { authRequired: true },
        )
        console.log(response);
        if (response != null) {
          navigate(`/chat?item_id=${productId}&buyerId=${userId}`, {
            state: { isCreate: true, sellerName: response?.sellerName, room: response?.roomId }
          });
        }
      }
    } catch (error) {
      console.log(error);
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
              <div className="flex items-center justify-between w-full">
                {/* Tên sản phẩm */}
                <div className="flex items-center">
                  <Title level={2} className="capitalize">{productDetail.item_name}</Title>
                  {isSoldout && <div><p className="text-red-700 font-bold">soldout*</p></div>}
                </div>

                <p className="ml-4 text-gray-600">
                  👤 Seller: <span className="font-bold">{productDetail.sellerName}</span>
                </p>
                {/* Nút Theo Dõi Người Bán */}
                <button
                  className={`follow-btn ${isFollowing ? "active" : ""}`}
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                >
                  {isFollowing ? "❌ Unfollow" : "➕ Follow seller"}
                </button>

              </div>


              <div className="flex gap-5">
                {/* <div className="flex text-green ">
                  <IoIosStar size={20} />
                  <IoIosStar size={20} />
                  <IoIosStar size={20} />
                  <IoIosStarHalf size={20} />
                  <IoIosStarOutline size={20} />
                </div>
                <Caption>(2 customer reviews)</Caption> */}
              </div>
              <br />
              <Body>Korem ipsum dolor amet, consectetur adipiscing elit. Maece nas in pulvinar neque. Nulla finibus lobortis pulvinar. Donec a consectetur nulla.</Body>
              <br />
              <Caption>Item condition: New</Caption>
              <br />
              <Caption>Item Verifed: Yes</Caption>
              <br />
              <Caption>{timeLeft !== null ? "Upcoming" : "Opening"}:</Caption>
              <br />
              <div className="flex gap-8 text-center">

                {/* thg sap mo ban */}
                {
                  timeLeft !== null && (
                    <>
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
                    </>
                  )
                }

                {/* thg het han */}
                {
                  timeLeft === null && (
                    <>
                      <div className="p-5 px-10 shadow-s1">
                        <Title level={4}>{timeLeftEndDate?.days || 0}</Title>
                        <Caption>Days</Caption>
                      </div>
                      <div className="p-5 px-10 shadow-s1">
                        <Title level={4}>{timeLeftEndDate?.hours || 0}</Title>
                        <Caption>Hours</Caption>
                      </div>
                      <div className="p-5 px-10 shadow-s1">
                        <Title level={4}>{timeLeftEndDate?.minutes || 0}</Title>
                        <Caption>Minutes</Caption>
                      </div>
                      <div className="p-5 px-10 shadow-s1">
                        <Title level={4}>{timeLeftEndDate?.seconds || 0}</Title>
                        <Caption>Seconds</Caption>
                      </div>
                    </>
                  )
                }

              </div>
              <br />
              <Title className="flex items-center gap-2">
                Auction ends:
                <Caption>December 31, 2024 12:00 am</Caption>
              </Title>
              <Title className="flex items-center gap-2 my-5">
                Timezone: <Caption>UTC+7</Caption>
              </Title>
              <Title className="flex items-center gap-2 my-5">
                Price:<Caption>${productDetail.starting_price}</Caption>
              </Title>
              <Title className={`flex items-center gap-2 ${isSoldout ? 'text-red-700' : ''}`}>
                Current bid:<Caption className="text-3xl">${currentPrice.price || 0} </Caption>
              </Title>


              {
                (userId !== productDetail.buyerId && productDetail.isSoldOut === false) && (
                  <div className="w-[200px] h-[40px] bg-green border rounded-md flex justify-center items-center">
                    <button
                      onClick={() => handleCreateRoom(productDetail.item_id)}
                      // to={`/chat?item_id=${productDetail.item_id}&buyerId=${productDetail.buyerId}`} 
                      type="button" className="font-medium text-white">
                      Chat now
                    </button>
                  </div>
                )
              }
              {
                userId === productDetail.buyerId && !isSoldout && (
                  <div onClick={() => handleAuctionSuccess(productDetail?.item_id)} className="w-[200px] cursor-pointer h-[40px] bg-green border rounded-md flex justify-center items-center">
                    <button className="font-medium text-white">
                      This price
                    </button>
                  </div>
                )
              }
              {
                isOpenInput && productDetail.isSoldOut === false &&
                <div div className="p-5 px-10 shadow-s3 py-8">
                  <form onSubmit={onSubmitBidding} className="flex gap-3 justify-between">
                    <input className={commonClassNameOfInput} value={priceBidding} onChange={e => setPriceBidding(e.target.value)} type="number" name="price" />
                    {/* <button type="button" className="bg-gray-100 rounded-md px-5 py-3">
                      <AiOutlinePlus />
                    </button> */}
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
              <button className={`tab-btn ${activeTab === "description" ? "active" : ""}`} onClick={() => handleTabClick("description")}>
                Description
              </button>
              <button className={`tab-btn ${activeTab === "auctionHistory" ? "active" : ""}`} onClick={() => handleTabClick("auctionHistory")}>
                Auction History
              </button>
              <button className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`} onClick={() => handleTabClick("reviews")}>
                Reviews ({comments.length})
              </button>
              <button className={`tab-btn ${activeTab === "moreProducts" ? "active" : ""}`} onClick={() => handleTabClick("moreProducts")}>
                More Products
              </button>
            </div>

            <div className="tab-content mt-8">
              {activeTab === "description" && (
                <div className="shadow-s3 p-8 rounded-md">
                  <Title level={4}>Description</Title>
                  <p>{productDetail.description || "Không có mô tả."}</p>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="shadow-s3 p-8 rounded-md">
                  <Title level={5}>Reviews</Title>
                  <hr className="my-5" />

                  {/* ✅ Hiển thị danh sách bình luận */}
                  <div className="comment-list">
                    {comments.length === 0 ? (
                      <p className="text-gray-500">Chưa có bình luận nào.</p>
                    ) : (
                      comments.map((comment, index) => (
                        <div key={index} className="comment-item p-3 border-b">
                          <p className="font-bold">{comment.userName}</p>
                          <p>{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* ✅ Form nhập bình luận */}
                  <div className="comment-form mt-5">
                    <textarea
                      className="w-full p-3 border rounded-md"
                      rows="3"
                      placeholder="Viết bình luận..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                    <button className="btn-primary mt-2" onClick={handleCommentSubmit}>
                      Gửi Bình Luận
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "moreProducts" && (
                <div className="shadow-s3 p-8 rounded-md">
                  <h1>More Products</h1>
                </div>
              )}
            </div>

            {/* ✅ CSS Styles */}
            <style>
              {`
          .tab-btn {
            padding: 10px 20px;
            border: none;
            cursor: pointer;
            border-radius: 5px;
            margin-right: 10px;
            background-color: #f0f0f0;
          }
          .tab-btn.active {
            background-color: green;
            color: white;
          }
          .comment-item {
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .btn-primary {
            background-color: green;
            color: white;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            border-radius: 5px;
          }
          .btn-primary:hover {
            background-color: darkgreen;
          }
        `}
            </style>
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
