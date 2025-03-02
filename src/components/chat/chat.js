import classNames from 'classnames/bind';
import styles from './chat.module.scss'
import { BsFillSendFill } from "react-icons/bs";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios'
import { useEffect, useRef, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import moment from 'moment';
import { AiFillPicture } from "react-icons/ai";
import { IoMdCloseCircle } from "react-icons/io";
import ControlledCarousel from '../carousel/Carousel';
import clsx from 'clsx';


const cx = classNames.bind(styles)

const Chat = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const { isCreate, sellerName, room } = location.state || {}
  const endOfMessagesRef = useRef(null)
  // const textareaRef = useRef(null);
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('item_id');
  const sellerId = searchParams.get('buyerId');

  const [userId, setUserId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isChat, setIsChat] = useState(false)
  const [roomChatInfo, setRoomChatInfo] = useState(null)

  const [imageFile, setImageFile] = useState([]);
  const [notiMessage, setNotiMessage] = useState([])
  const [notiMessageChat, setNotiMessageChat] = useState(null)
  const [indexChat, setIndexChat] = useState(null)

  const [messages, setMessages] = useState([{
    content: "",
    id: "",
    images: [],
    roomId: "",
    senderId: "",
    timestamp: "",
  }]);

  const [listChatOfSeller, setListChatOfSeller] = useState([])
  const [content, setContent] = useState('');
  const [roomId, setRoomId] = useState('');
  const [stompClient, setStompClient] = useState(null);

  const [notificationQuantities, setNotificationQuantities] = useState({});
  // const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userIdInput, setUserIdInput] = useState(null)

  useEffect(() => {
    // Tính toán và cập nhật notificationQuantities một lần cho tất cả các phòng chat
    const newNotificationQuantities = {};

    listChatOfSeller?.forEach((item) => {
      const displayQuantity =
        notiMessageChat?.chatroomId === item.roomId
          ? (notiMessageChat?.buyerId === userId
            ? notiMessageChat?.quantityBuyer
            : notiMessageChat?.sellerId === userId
              ? notiMessageChat?.quantitySeller
              : '')
          : item?.notification?.chatroomId === item.roomId
            ? item?.notification?.buyerId === userId
              ? item?.notification?.quantityBuyer
              : item?.notification?.sellerId === userId
                ? item?.notification?.quantitySeller
                : ''
            : '';

      if (displayQuantity) {
        newNotificationQuantities[item.roomId] = displayQuantity;
      }
    });

    setNotificationQuantities(newNotificationQuantities);
  }, [listChatOfSeller, notiMessageChat, userId]); // Chạy lại khi danh sách chat hoặc thông báo thay đổi


  // create room
  // const createRoom = async () => {
  //   try {
  //     if (sellerId !== userId) {
  //       const response = await axios.post(`chatroom/room/${productId}`, {
  //         buyerId: userId
  //       },
  //         { authRequired: true },
  //       )
  //       if (response) setListChatOfSeller(prev => [response, ...prev])

  //       // setRoom(prevRoom => {
  //       //   if (prevRoom.roomId !== response.id || prevRoom !== response.date) {
  //       //     return { roomId: response.id, date: response.date }
  //       //   }
  //       //   return prevRoom
  //       // })
  //     }

  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  // useEffect(() => {
  //   if (productId && userId) {
  //     createRoom();
  //   }
  // }, [productId, userId])

  //buyerInfo
  useEffect(() => {
    const getSellerInfo = async () => {
      try {
        if (sellerId) {
          const response = await axios.get(`users/${sellerId}`,
            { authRequired: true },
          )
          if (response != null && !isCreate && !sellerName) {
            setRoomChatInfo(response.name)

          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (sellerId) {
      getSellerInfo();
    }
  }, [])

  // getAllRoomBySeller
  useEffect(() => {
    const getAllRoomBySeller = async () => {
      try {
        if (userId) {
          const response = await axios.get(`chatroom/room/${userId}`,
            { authRequired: true },
          )
          response.forEach(data => {
            setNotiMessageChat(data.notification);
          });

          setListChatOfSeller(response);
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (userId) {
      getAllRoomBySeller();
    }
  }, [userId])


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
    const handleClickUserChatt = async (sellerName) => {

      setRoomChatInfo(sellerName);
      setRoomId(room)
      setIsChat(true);
    }
    if (isCreate && sellerName) {
      handleClickUserChatt(sellerName);
    }
  }, [isCreate, room, sellerName])

  const handleClickUserChat = async (item, userChat, index) => {

    setRoomId(item.roomId)
    // const newPath = `/chat?item_id=${item.item_id}&buyerId=${item.userId}`;
    // navigate(newPath)
    setRoomChatInfo(userChat);
    setIsChat(true);

    setIsTyping(false)

    setIndexChat(index)

    setNotificationQuantities({});

    if (userId) {
      await axios.delete(`chatroom/notification-chat/${item.roomId}/${userId}`,
        { authRequired: true },
      )
    }
  }

  useEffect(() => {
    const getMessageOfRoom = async () => {
      try {
        if (roomId) {
          const response = await axios.get(`chatroom/room/message/${roomId}`,
            { authRequired: true },
          )

          setMessages(response)
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (roomId) {
      getMessageOfRoom();
    }
  }, [roomId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socketFactory = () => {
      return new SockJS('http://localhost:8080/ws', null, {
        withCredentials: true,
        timeout: 5000,
      });
    };
    const client = Stomp.over(socketFactory);
    client.debug = () => { };

    client.connect({ Authorization: `Bearer ${token}` }, () => {
      console.log('Connected to WebSocket');
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        try {
          // const newMessage = JSON.parse(JSON.parse(message.body));
          const decoder = new TextDecoder('utf-8');
          const jsonString = decoder.decode(message.binaryBody);  // Giải mã Uint8Array thành chuỗi
          const parsedMessage = JSON.parse(jsonString);  // Phân tích cú pháp chuỗi JSON

          if (parsedMessage) {
            setMessages(prevMessages => [...prevMessages, parsedMessage]);
          } else {
            console.error('Message parsing failed:', parsedMessage);
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      });

      //====================notification chat====================
      client.subscribe('/topic/notificationchat', (message) => {
        const newnotification = JSON.parse(message.body);
        setNotiMessageChat(newnotification)
      });

      // =======================user dang nhap trong o input=============
      client.subscribe(`/topic/room/${roomId}/typing`, (message) => {
        const typingInfo = JSON.parse(message.body);
        setUserIdInput(typingInfo.userId);
        setIsTyping(typingInfo.typing);
      });


    }, (error) => {
      console.error('Error connecting to WebSocket:', error);
    })
    setStompClient(client);

    return () => {
      if (client.connected) {
        client.disconnect(() => {
          console.log("Disconnected from WebSocket");
        });
      }
    };
  }, [roomId])

  // ------------------------------------------------------------------------------------------------
  const handleSubmitChat = async () => {
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('content', content);
    formData.append('roomId', roomId);
    formData.append('sender', userId);
    imageFile.forEach((url) => {
      formData.append('images', url);
    })

    const response = await axios.post(`chatroom/send-message`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      }
    })


    if (response) {
      const data = {
        content: response.content,
        roomId: response.roomId,
        sender: response.senderId,
        imagess: response.images.map((image) => image.toString()),
        timestamp: response.timestamp
      }
      // console.log(data);

      if (stompClient) {
        stompClient.send('/app/sendMessage', { Authorization: `Bearer ${token}` }, JSON.stringify(data));
        setContent("")
        setImageFile([])
        setSelectedImages([]);
      }
    }

  }

  // =================================================================================================================


  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectImages = e => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      setSelectedImages(prev => [...prev, ...newImages])
      setImageFile(Array.from(files));
    }

    // const files = e.target.files; // Lấy danh sách các file
    // setImageFile(Array.from(files));
  }

  // useEffect(() => {
  //   if (messages && Array.isArray(messages) && messages.length > 0) {
  //     const newMessage = messages[messages.length - 1];
  //     const exists = listChatOfSeller.some(item => item.message.id === newMessage.id);
  //     if (!exists) {
  //       setListChatOfSeller(prev => [...prev, { message: newMessage }]);
  //     }
  //   }
  // }, [messages]);

  const getMessageNoti = async () => {
    try {
      if (userId) {
        const response = await axios.get(`chatroom/room/message/room/${userId}`, {
          authRequired: true,
        });
        const newMessages = response;
        const groupedMessages = newMessages.reduce((acc, msg) => {
          if (!acc[msg.roomId]) {
            acc[msg.roomId] = [];
          }
          acc[msg.roomId].push(msg);
          return acc;
        }, {});
        setNotiMessage(Object.values(groupedMessages));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userId) {
      getMessageNoti()
    }
  }, [userId, messages])


  useEffect(() => {
    if (messages.length > 0) {
      const newMessage = messages[messages.length - 1];
      setNotiMessage(prev => {
        const updatedMessages = prev.map(msgList => {
          if (msgList.roomId === newMessage.roomId) {
            return [...msgList, newMessage];
          }
          return msgList;
        });
        return updatedMessages.length > 0 ? updatedMessages : [[newMessage]];
      });
    }
  }, [messages]);


  //nhap tin nhan, kt user co dang nhap text hay k
  const handleTyping = (e) => {
    setContent(e.target.value);

    // Kiểm tra xem người dùng có đang gõ chữ không
    // setTyping(true);
    stompClient.send(
      `/app/chat/${roomId}/typing`,
      {},
      JSON.stringify({ userId, typing: true })
    );

    // Đặt lại thời gian để gửi trạng thái "ngừng gõ" sau 1 khoảng thời gian
    if (window.typingTimeout) {
      clearTimeout(window.typingTimeout);
    }
    window.typingTimeout = setTimeout(() => {
      // setTyping(false);
      stompClient.send(
        `/app/chat/${roomId}/typing`,
        {},
        JSON.stringify({ userId, typing: false })
      );
    }, 2000);
  };

  const slides = [
    "https://chat.chotot.com/emptyRoom.png",
    "https://chat.chotot.com/emptyRoom2.png",
    "https://t4.ftcdn.net/jpg/01/52/26/99/360_F_152269999_krzVqnxRBfXeUQxNg2w3RlJHOUaHKoyu.jpg"
  ]
  // console.log(listChatOfSeller);
  const renderedRoomIds = new Set();
  return (
    <section className='flex justify-center'>

      <div className="bg-white shadow-s3 w-1/2 h-screen rounded-xl flex ">
        <div className="mt-[83px] w-full flex">
          <div className="border w-[50%] h-full">
            <div className="h-[40px] mt-3 p-2 border-2 mx-3 rounded-md">
              <input className="h-full w-full border-none outline-none" placeholder="Enter chat name" />
            </div>
            <div className={clsx(styles.custom_scroll, "mt-3 h-[90%] overflow-y-auto overflow-hidden")}>
              {
                listChatOfSeller?.length > 0 && listChatOfSeller?.map((item, index) => {
                  {/* map chạy từng item. */ }
                  {/* Mỗi item nếu return về JSX thì sẽ được render. */ }
                  {/* Nếu return null thì React bỏ qua item đó (coi như item này không tồn tại trong DOM). */ }
                  if (renderedRoomIds.has(item.roomId)) {
                    return null;
                  }
                  renderedRoomIds.add(item.roomId);
                  const isCurrentUserInRoom = item.roomId === roomId;  // Kiểm tra người dùng có đang trong phòng này không
                  const hasSentMessageRecently = messages.some(msg => msg.senderId === userId && msg.roomId === item.roomId);  // Kiểm tra người dùng có gửi tin nhắn chưa

                  return (
                    <div key={index} onClick={() => handleClickUserChat(item, userId !== item?.userId ? item?.sellerName : item?.buyerName, index)}
                      className={cx(`flex justify-between h-[85px] items-center border-b-[1px] cursor-pointer ${indexChat === index ? 'bg-[#33ecbe]' : ''}`)}>
                      <div className="flex items-center">
                        <div className="w-[46px] relative mr-1">
                          {
                            (item.roomId === item?.notification?.chatroomId ||
                              notiMessageChat?.chatroomId === item.roomId) &&
                            !isCurrentUserInRoom &&
                            !hasSentMessageRecently &&
                            (
                              // Check for seller's quantity
                              (notificationQuantities[item.roomId] > 0 && (
                                <div className="absolute right-0 top-[-5px] border w-5 h-5 flex items-center justify-center rounded-full bg-red-600">
                                  <span className="text-white text-[12px]">
                                    {(notificationQuantities[item.roomId] < 5 ? notificationQuantities[item.roomId] : '5+') || ''}
                                  </span>
                                </div>
                              )) ||
                              // Check for buyer's quantity
                              (notificationQuantities[item.roomId] > 0 && (
                                <div className="absolute right-0 top-[-5px] border w-5 h-5 flex items-center justify-center rounded-full bg-red-600">
                                  <span className="text-white text-[12px]">
                                    {(notificationQuantities[item.roomId] < 5 ? notificationQuantities[item.roomId] : '5+') || ''}
                                  </span>
                                </div>
                              ))
                            )
                          }
                          <img alt="" src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png" />
                        </div>
                        <div>
                          <p className="text-sm">{userId !== item?.userId ? item?.sellerName : item?.buyerName}</p>
                          <span className="text-[12px] text-[#9B9B9B]">item:{item?.item_name}</span>
                          <div className="h-[15px] flex items-center">
                            {/* text-[#9B9B9B] */}
                            <span className="text-[11px]  font-weight: bold text-black">
                              {item.listMessages[0]?.content || ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-[60px] h-[60px] pr-2 ">
                        <img className="h-full w-full object-cover rounded-md" alt="" src={item?.images} />
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
          {
            isChat && <>
              <div className="grid grid-rows-[60px,1fr,15px,55px] w-full">
                <div className="border flex items-center">
                  <div className="flex items-center">
                    <div className="w-[46px]">
                      <img alt="" src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png" />
                    </div>
                    <div>
                      <p className="text-sm">{roomChatInfo}</p>
                    </div>
                  </div>
                </div>
                {/* content chat */}
                <div className={cx("custom_scroll")}>
                  {
                    messages?.length > 0 && messages?.map((item, index) => {
                      return (
                        <>
                          {
                            item?.content.length > 0 && (
                              <div key={index} className={cx(`flex mb-3 ${item?.senderId === userId ? 'flex justify-end' : ''}`)}>
                                <div className={cx(`min-w-[100px] max-w-[300px] rounded-md ml-3 p-2 mr-2 ${item?.senderId === userId ? 'bg-[#1f7f67]' : 'bg-[#f4f4f4]'}`)}>
                                  <p className={cx(`break-words text-[14px]  ${item?.senderId === userId ? 'text-white' : 'text-black'}`)}>{item?.content}</p>
                                  <div className="flex justify-end">
                                    <span className="text-[12px] text-[#9B9B9B]">{moment(item.timestamp).format('h:mm a')}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          }

                          {
                            item?.images && item.images.length > 0 && (
                              <div className={cx(`flex mb-3 ${item?.senderId === userId ? 'flex justify-end' : ''}`)}>
                                <div className={cx(`min-w-[100px] max-w-[300px] rounded-md ml-3 p-2 mr-2 ${item?.senderId === userId ? 'bg-[#1f7f67]' : 'bg-[#f4f4f4]'}`)}>
                                  <div>
                                    {
                                      item?.images?.length > 0 && item?.images?.map((img, index) => {
                                        return (
                                          <div key={index} className="mb-1">
                                            <img className='h-[200px]' src={img} alt="" />
                                          </div>
                                        )
                                      }
                                      )
                                    }
                                  </div>
                                  <div className="flex justify-end">
                                    <span className="text-[12px] text-[#9B9B9B]">{moment(item.timestamp).format('h:mm a')}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                        </>
                      )
                    })
                  }
                  <div ref={endOfMessagesRef} />
                </div>


                <div>
                  {isTyping && userIdInput !== userId &&
                    (
                      <div className={styles.wave_text_container}>
                        <span className={styles.wave_text}>N</span>
                        <span className={styles.wave_text}>g</span>
                        <span className={styles.wave_text}>ư</span>
                        <span className={styles.wave_text}>ờ</span>
                        <span className={styles.wave_text}>i</span>
                        <span className={styles.wave_text}>d</span>
                        <span className={styles.wave_text}>ù</span>
                        <span className={styles.wave_text}>n</span>
                        <span className={styles.wave_text}>g</span>
                        <span className={styles.wave_text}>đ</span>
                        <span className={styles.wave_text}>a</span>
                        <span className={styles.wave_text}>n</span>
                        <span className={styles.wave_text}>g</span>
                        <span className={styles.wave_text}>n</span>
                        <span className={styles.wave_text}>h</span>
                        <span className={styles.wave_text}>ậ</span>
                        <span className={styles.wave_text}>p</span>
                        <span className={styles.wave_text}>.</span>
                        <span className={styles.wave_text}>.</span>
                        <span className={styles.wave_text}>.</span>
                      </div>
                    )}
                </div>

                <div className={styles.chatBox_write}>
                  <div className={styles.chat_box_input}>
                    <div className="mr-2">
                      <input type="file" id='picture' hidden multiple onChange={handleSelectImages} />
                      <label for="picture" className="cursor-pointer">
                        <AiFillPicture size={30} className="text-[#1f7f67]" />
                      </label>
                    </div>

                    <div className="flex-1 bg-[#f0f0f0] rounded-lg overflow-hidden">
                      <textarea
                        className='w-full'
                        value={content}
                        onChange={handleTyping}
                        placeholder="Write.." />
                      {
                        selectedImages.length > 0 && (
                          <div className="w-full bg-[#f0f0f0] h-10 flex items-center">
                            {
                              selectedImages.length > 0 && selectedImages?.map((image, index) => (
                                <div key={index}>
                                  <IoMdCloseCircle
                                    className='cursor-pointer'
                                    onClick={() => {
                                      setSelectedImages(prev => prev.filter((_, i) => i !== index))
                                      setImageFile(prev => prev.filter((_, i) => i !== index));
                                    }}
                                  />
                                  <img className="w-[30px] ml-2" alt='' src={image} />
                                </div>
                              ))
                            }
                          </div>
                        )
                      }
                    </div>
                    <div
                      onClick={handleSubmitChat}
                      className={styles.btn_submit}>
                      <button type='submit'>
                        <BsFillSendFill />
                      </button>
                    </div>
                  </div>
                  {/* </form> */}
                </div>
              </div>
            </>
          }
          {
            !isChat && (
              <div className="w-full h-full flex items-center justify-center">
                <ControlledCarousel slides={slides} />
              </div>
            )
          }
        </div>
      </div>

    </section>
  );
};

export default Chat;