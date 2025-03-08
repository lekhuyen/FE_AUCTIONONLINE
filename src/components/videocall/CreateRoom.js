import React, { useEffect, useState } from 'react';
import Streamer from './Streamer';
import Viewer from './Viewer';
import { jwtDecode } from 'jwt-decode';
import axios from '../../utils/axios'
// import Auth from './video/Auth';

function CreateRoom() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [role, setRole] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [userName, setUserName] = useState('');
  const [testuserName, setTestUserName] = useState('');
  const [userId, setUserId] = useState('')


  const [rooms, setRooms] = useState([])

  useEffect(() => {
    const getAllRoom = async () => {
      const response = await axios.get('https://be-pjhk4.onrender.com/api/room-video-call', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.code === 0) {
        setRooms(response?.result)
      }

    }
    getAllRoom()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const tokenInfo = jwtDecode(token)

        setUserName(tokenInfo.username);
        setUserId(tokenInfo.userid);
      } catch (error) {
        console.error("Error decoding token:", error.message);
      }
    }
  }, [])

  const handleReset = () => {
    setUser(null);
    setRoomId('');
    setRole(null);
    setIsCreator(false);
  };

  const handleCreateRoom = async () => {

    // const newRoom = {
    //   userId, userName
    // }

    // const response = await axios.post('https://be-pjhk4.onrender.com/api/room-video-call', newRoom, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },

    // });
    // if (response?.code === 0) {
    //   setIsCreator(true);
    //   setRole(response?.result?.role);
    //   setRoomId(response?.result?.id);
    // }

    if (!roomId.trim()) {
      alert('Please enter a Room ID');
      return;
    }
    setIsCreator(true);
    setRole('streamer');
  };

  const handleJoinRoom = (selectedRole) => {
    if (!roomId.trim()) {
      alert('Please enter a Room ID');
      return;
    }
    setIsCreator(false);
    setRole(selectedRole);
  };

  // if (!user) {
  //   return <Auth onLogin={username => setUser(username)} />;
  // }

  const handleUserJoinRoom = (room) => {
    setIsCreator(true);
    setRole(room.role);
    setRoomId(room.id);
  }

  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          {
            rooms && rooms?.length > 0 && rooms?.map(item => (
              <div key={item.id} className="max-w-sm rounded overflow-hidden shadow-lg">
                <div className="px-6 py-4">
                  <div className="font-bold text-xl mb-2">Room:{item.id}</div>
                  <p className="text-gray-700 text-base">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
                  </p>
                </div>
                <div className="px-6 pt-4 pb-2">
                  <button onClick={() => handleUserJoinRoom(item)} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">Join</button>
                </div>
              </div>
            ))
          }
          {/* <h2>Welcome, {userName}</h2> */}
          {/* test ----------------------------*/}
          <input
            value={testuserName}
            onChange={e => setTestUserName(e.target.value)}
            placeholder="Enter name"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* test ----------------------------*/}


          <div className="flex justify-center gap-4">
            <button
              onClick={handleCreateRoom}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Room (as Streamer)
            </button>
            <button
              onClick={() => handleJoinRoom('streamer')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Join as Streamer
            </button>


            {/* test--------------------------------- */}
            <button
              onClick={() => handleJoinRoom('viewer')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Join as Viewer
            </button>
            {/* test--------------------------------- */}

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen mt-[75px] bg-gray-900">

      <button
        onClick={handleReset}
        className="absolute top-4 right-4 bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700 z-10"
      >
        Logout
      </button>
      {role === 'streamer' ? (
        <Streamer
          username={testuserName}
          // username={userName} 
          roomId={roomId} isCreator={isCreator} />
      ) : (
        <Viewer
          username={testuserName}
          // username={userName} 
          roomId={roomId}
          isCreator={isCreator} />
      )}
    </div>
  );
}

export default CreateRoom;