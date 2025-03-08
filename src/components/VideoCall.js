import React, { useState, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { v4 as uuidv4 } from 'uuid';

const VideoCall = () => {
  const [token, setToken] = useState(null);
  const [joined, setJoined] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);

  const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  AgoraRTC.setLogLevel(4);

  const channelName = "myRoom";  // Tên phòng (có thể lấy từ URL, input người dùng, ...)
  const uid = 12345;
  useEffect(() => {
    // Lấy token từ backend
    const tokens = localStorage.getItem('token')
    fetch(`http://localhost:8080/api/video-call/join?channelName=${channelName}&uid=${uid}`, {
      method: 'GET', // or 'POST' if needed
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens}` // Adding token to the Authorization header
      }
    })
      .then(response => response.json())
      .then(data => {
        setToken(data.token);
      });


    return () => {
      if (client) {
        client.leave();
      }
    };
  }, [channelName, uid]);

  useEffect(() => {
    if (token) {
      client.join(token, channelName, null, uid).then(() => {
        const local = AgoraRTC.createStream({
          audio: true,
          video: true,
        });
        local.init(() => {
          setLocalStream(local);
          client.publish(local);
          setJoined(true);
        });
      });

      client.on('stream-added', (evt) => {
        const remoteStream = evt.stream;
        client.subscribe(remoteStream);
      });

      client.on('stream-subscribed', (evt) => {
        const remoteStream = evt.stream;
        setRemoteStreams((prevStreams) => [...prevStreams, remoteStream]);
        remoteStream.play(`remote-video-${remoteStream.getId()}`);
      });
    }
  }, [token]);

  if (!joined) {
    return <div>Joining...</div>;
  }

  return (
    <div className="mt-[400px]">
      <div>
        {localStream && <video id="local-video" autoPlay playsInline />}
        {remoteStreams.map((stream, index) => (
          <video key={index} id={`remote-video-${stream.getId()}`} autoPlay playsInline />
        ))}
      </div>
    </div>
  );
};

export default VideoCall;
