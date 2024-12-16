import classNames from 'classnames/bind';
import styles from './chat.module.scss'
import { BsFillSendFill } from "react-icons/bs";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axios'
import { useEffect, useRef, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import moment from 'moment';
import { AiFillPicture } from "react-icons/ai";
import { IoMdCloseCircle } from "react-icons/io";


const cx = classNames.bind(styles)

const Chat = () => {

  const endOfMessagesRef = useRef(null)
  // const textareaRef = useRef(null);
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('item_id');
  const sellerId = searchParams.get('buyerId');

  const [userId, setUserId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isChat, setIsChat] = useState(false)
  const [roomChatInfo, setRoomChatInfo] = useState(null)
  const [listChatOfSeller, setListChatOfSeller] = useState([])
  const [imageFile, setImageFile] = useState([]);
  const [notiMessage, setNotiMessage] = useState([])

  const [messages, setMessages] = useState([{
    content: "",
    id: "",
    images: [],
    roomId: "",
    senderId: "",
    timestamp: "",
  }]);
  const [content, setContent] = useState('');
  const [roomId, setRoomId] = useState('');
  const [stompClient, setStompClient] = useState(null);


  // create room
  const createRoom = async () => {
    try {
      if (sellerId !== userId) {
        const response = await axios.post(`chatroom/room/${productId}`, {
          buyerId: userId
        },
          { authRequired: true },
        )
        if (response) setListChatOfSeller(prev => [response, ...prev])
        // setRoom(prevRoom => {
        //   if (prevRoom.roomId !== response.id || prevRoom !== response.date) {
        //     return { roomId: response.id, date: response.date }
        //   }
        //   return prevRoom
        // })
      }

    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (productId && userId) {
      createRoom();
    }
  }, [productId, userId])

  //buyerInfo
  useEffect(() => {
    const getSellerInfo = async () => {
      try {
        if (sellerId) {
          const response = await axios.get(`users/${sellerId}`,
            { authRequired: true },
          )
          setRoomChatInfo(response.name)
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

  const handleClickUserChat = (item, userChat) => {
    setRoomId(item.roomId)
    const newPath = `/chat?item_id=${item.item_id}&buyerId=${item.userId}`;
    navigate(newPath)
    setRoomChatInfo(userChat);
    setIsChat(true);
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

    client.connect({ Authorization: `Bearer ${token}` }, () => {
      console.log('Connected to WebSocket');
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        try {
          const newMessage = JSON.parse(JSON.parse(message.body));
          if (newMessage) {
            setMessages(prevMessages => [...prevMessages, newMessage]);
          } else {
            console.error('Message parsing failed:', newMessage);
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
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


  // const filesArray = Array.isArray(imageFile) ? imageFile : Array.from(imageFile || []);
  // const base64Images = await Promise.all(
  //   filesArray?.map(file => {
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = () => resolve(reader.result.split(",")[1]);
  //       reader.onerror = reject;
  //       reader.readAsDataURL(file);
  //     });
  //   }).map(promise => promise.catch(err => {
  //     console.error("Failed to read file:", err);
  //     return null;
  //   }))
  // )
  const handleSubmitChat = async (e) => {
    const token = localStorage.getItem('token');
    if (!content.trim()) {
      console.error("Message content is empty");
      return;
    }
    const formData = new FormData();
    formData.append('content', content);
    formData.append('roomId', roomId);
    formData.append('sender', userId);
    if (imageFile.length > 0) {
      const base64Images = await Promise.all(
        imageFile.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      base64Images.forEach(image => formData.append('images', image));
    }

    const payload = Object.fromEntries(formData.entries());
    if (stompClient && stompClient.connected && roomId) {
      console.log("WebSocket connected");
      try {
        stompClient.send(`/app/sendMessage`, { Authorization: `Bearer ${token}` }, JSON.stringify(payload));
        setContent("");
        setSelectedImages([]);
      } catch (error) {
        console.error("Gửi tin nhắn thất bại:", error);
      }
    } else {
      console.error("WebSocket không kết nối");
    }
  }

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


  return (
    <section className='flex justify-center'>

      <div className="bg-white shadow-s3 w-1/2 h-screen rounded-xl flex ">
        <div className="mt-[83px] w-full flex">
          <div className="border w-[50%] h-full">
            <div className="h-[40px] mt-3 p-2 border-2 mx-3 rounded-md">
              <input className="h-full w-full border-none outline-none" placeholder="Enter chat name" />
            </div>
            <div className=" mt-3">
              {
                listChatOfSeller?.length > 0 && listChatOfSeller?.map((item, index) => {
                  return (
                    <div onClick={() => handleClickUserChat(item, userId !== item?.userId ? item?.sellerName : item?.buyerName)} key={index} className="flex justify-between h-[85px] items-center border-b-[1px] cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-[46px] relative mr-1">
                          <div className="absolute right-0 top-[-5px] border w-5 h-5 flex items-center justify-center rounded-full bg-red-600">
                            <span className="text-white">2</span>
                          </div>
                          <img alt="" src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png" />
                        </div>
                        <div>
                          <p className="text-sm">{userId !== item?.userId ? item?.sellerName : item?.buyerName}</p>
                          <span className="text-[12px] text-[#9B9B9B]">{item?.item_name}</span>
                          <div className="h-[15px] flex items-center">
                            {/* text-[#9B9B9B] */}
                            {
                              notiMessage?.length > 0 && notiMessage?.map((msg, index) => {
                                return (
                                  <span className="text-[11px]  font-weight: bold text-black">
                                    {msg[msg.length - 1].roomId === item.roomId ? msg[msg.length - 1].content : ""}
                                  </span>
                                )
                              })
                            }
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
              <div className="grid grid-rows-[60px,1fr,100px] w-full">
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
                <div className={cx("custom-scroll")}>
                  {
                    messages?.length > 0 && messages?.map((item, index) => {
                      return (
                        <div key={index} className={cx(`flex mb-3 ${item?.senderId === userId ? 'flex justify-end' : ''}`)}>
                          <div className={cx(`min-w-[100px] max-w-[300px] rounded-md ml-3 p-2 mr-2 ${item?.senderId === userId ? 'bg-[#1f7f67]' : 'bg-[#f4f4f4]'}`)}>
                            <p className={cx(`break-words text-[14px]  ${item?.senderId === userId ? 'text-white' : 'text-black'}`)}>{item?.content}</p>
                            <div className="flex justify-end">
                              <span className="text-[12px] text-[#9B9B9B]">{moment(item.timestamp).format('h:mm a')}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                  <div ref={endOfMessagesRef} />
                </div>
                <div className={styles.chatBox_write}>
                  {/* <form onSubmit={handleSubmitChat} encType="multipart/form-data"> */}
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
                        onChange={(e) => setContent(e.target.value)}
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
              <div className="w-full h-full flex items-center">
                <h1>chat</h1>
              </div>
            )
          }
        </div>
      </div>

    </section>
  );
};

export default Chat;