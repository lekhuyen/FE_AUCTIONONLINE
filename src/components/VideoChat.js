import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from "axios";

const VideoChat = () => {
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [channelName, setChannelName] = useState("");
  const [joined, setJoined] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  const client = useRef(null);
  const localVideoRef = useRef(null);

  const APP_ID = "c37acd12fafb4d4494fd8516342a7a10";

  useEffect(() => {
    client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    AgoraRTC.setLogLevel(4);
  }, []);

  const joinChannel = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/agora/token", {
        params: { channelName, uid: Math.floor(Math.random() * 1000) },
      });

      const token = response.data;

      await client.current.join(APP_ID, channelName, token, null);

      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks([microphoneTrack, cameraTrack]);

      await client.current.publish([microphoneTrack, cameraTrack]);

      client.current.on("user-published", async (user, mediaType) => {
        await client.current.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteUsers((prevUsers) => ({ ...prevUsers, [user.uid]: user }));
        }
      });

      client.current.on("user-unpublished", (user) => {
        setRemoteUsers((prevUsers) => {
          const newUsers = { ...prevUsers };
          delete newUsers[user.uid];
          return newUsers;
        });
      });

      setJoined(true);
    } catch (error) {
      console.error("Error joining channel:", error);
    }
  };

  const leaveChannel = async () => {
    localTracks.forEach((track) => track.stop());
    await client.current.leave();
    setLocalTracks([]);
    setRemoteUsers({});
    setJoined(false);
  };

  const toggleCamera = () => {
    if (localTracks[1]) {
      localTracks[1].setEnabled(!cameraOn);
      setCameraOn(!cameraOn);
    }
  };

  return (
    <div className="mt-[400px]">
      <h1>Agora Video Chat</h1>
      {!joined ? (
        <div>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Enter channel name"
          />
          <button onClick={joinChannel}>Join Channel</button>
        </div>
      ) : (
        <div>
          <button onClick={leaveChannel}>Leave Channel</button>
          <button onClick={toggleCamera}>
            {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
          </button>
        </div>
      )}
      <div>
        <video ref={localVideoRef} autoPlay muted style={{ width: "200px" }} />
        {Object.values(remoteUsers).map((user) => (
          <video
            key={user.uid}
            ref={(ref) => {
              if (ref) {
                user.videoTrack.play(ref);
              }
            }}
            autoPlay
            style={{ width: "200px" }}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoChat;