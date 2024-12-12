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
  const [roomChatInfo, setRoomChatInfo] = useState(null)
  const [listChatOfSeller, setListChatOfSeller] = useState([])

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [roomId, setRoomId] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [room, setRoom] = useState({
    roomId: '',
    date: ''
  });

  // create room
  const getProduct = async () => {
    try {
      if (sellerId !== userId) {
        const response = await axios.post(`chatroom/room/${productId}`, {
          buyerId: userId
        },
          { authRequired: true },
        )
        setRoom(prevRoom => {
          if (prevRoom.roomId !== response.id || prevRoom !== response.date) {
            return { roomId: response.id, date: response.date }
          }
          return prevRoom
        })
      }

    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (productId && userId) {
      getProduct();
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
  }, [userId, productId])

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

  const handleClickUserChat = (item) => {
    setRoomId(item.roomId)
    setRoomChatInfo(sellerId === item?.userId ? item?.sellerName : item?.buyerName);
    const newPath = `/chat?item_id=${item.item_id}&buyerId=${item.userId}`;
    navigate(newPath)
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

  const handleSubmitChat = () => {
    const chatRequest = {
      roomId: roomId,
      sender: userId,
      content: content.trim()
    }
    const token = localStorage.getItem('token');
    if (!content.trim()) {
      console.error("Message content is empty");
      return;
    }
    if (stompClient && stompClient.connected && roomId) {
      stompClient.send(`/app/sendMessage`, { Authorization: `Bearer ${token}` }, JSON.stringify(chatRequest))
      setContent("")
    } else {
      console.error("WebSocket is not connected");
    }
  }

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // useEffect(() => {
  //   if (textareaRef.current) {
  //     textareaRef.current.style.height = 'auto';
  //     textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  //   }
  // }, [content]);

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
                listChatOfSeller?.length > 0 && listChatOfSeller?.map((item, index) => (
                  <div onClick={() => handleClickUserChat(item)} key={index} className="flex justify-between h-[85px] items-center border-b-[1px] cursor-pointer">
                    <div className="flex ">
                      <div className="w-[46px]">
                        <img alt="" src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png" />
                      </div>
                      <div>
                        <p className="text-sm">{userId === item?.userId ? item?.sellerName : item?.buyerName}</p>
                        <span className="text-[12px] text-[#9B9B9B]">{item?.item_name}</span>
                      </div>
                    </div>
                    <div className="w-[60px] h-[60px] pr-2 ">
                      <img className="h-full w-full object-cover rounded-md" alt="" src={item?.images[0]} />
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          <div className="grid grid-rows-[60px,1fr,60px] w-full">
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
              <div className={styles.chat_box_input}>
                <textarea
                  // ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write.." />
                <div
                  onClick={handleSubmitChat}
                  className={styles.btn_submit}>
                  <BsFillSendFill />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Chat;