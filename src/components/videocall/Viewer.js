import { useEffect, useRef, useState } from 'react';

const Viewer = ({ username, roomId, isCreator }) => {
  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [peerStatuses, setPeerStatuses] = useState(new Map());
  const [streamerId, setStreamerId] = useState(null);
  const [raisedHand, setRaisedHand] = useState(false);
  const ws = useRef(null);
  const peersRef = useRef({});
  const [products, setProducts] = useState([]);
  const [pinnedProduct, setPinnedProduct] = useState(null);
  // Thêm trạng thái cho bình luận
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const toggleMic = () => {
    if (!localVideoRef.current?.srcObject) {
      console.error('Cannot toggle mic: local stream is not initialized');
      return;
    }
    const audioTracks = localVideoRef.current.srcObject.getAudioTracks();
    if (audioTracks.length === 0) {
      console.error('No audio tracks available to toggle');
      return;
    }
    const newMicState = !micEnabled;
    audioTracks.forEach(track => {
      track.enabled = newMicState;
      console.log(`${username} set mic track ${track.id} to ${newMicState ? 'enabled' : 'disabled'}`);
    });
    setMicEnabled(newMicState);
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'status',
        id: username,
        micEnabled: newMicState,
        cameraEnabled
      }));
    }
  };

  const toggleCamera = () => {
    if (!localVideoRef.current?.srcObject) {
      console.error('Cannot toggle camera: local stream is not initialized');
      return;
    }
    const newCameraState = !cameraEnabled;
    localVideoRef.current.srcObject.getVideoTracks().forEach(track => {
      track.enabled = newCameraState;
      console.log(`${username} set camera track ${track.id} to ${newCameraState ? 'enabled' : 'disabled'}`);
    });
    setCameraEnabled(newCameraState);
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'status',
        id: username,
        micEnabled,
        cameraEnabled: newCameraState
      }));
    }
  };

  const toggleRaiseHand = () => {
    const newRaisedHandState = !raisedHand;
    setRaisedHand(newRaisedHandState);
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'raiseHand',
        id: username,
        raised: newRaisedHandState
      }));
      console.log(`${username} sent raiseHand: ${newRaisedHandState}`);
    }
  };

  // Hàm gửi bình luận
  const sendComment = () => {
    if (!newComment.trim()) return;
    if (ws.current?.readyState === WebSocket.OPEN) {
      const commentData = {
        type: 'comment',
        content: newComment,
        timestamp: Date.now(),
      };
      ws.current.send(JSON.stringify(commentData));
      setNewComment('');
      console.log(`${username} sent comment: ${newComment}`);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let retryInterval;
    let wsConnectionRetries = 0;
    const maxWsRetries = 5;

    const connectWebSocket = () => {
      ws.current = new WebSocket(`wss://be-pjhk4.onrender.com/signaling?roomId=${roomId}&username=${username}&isCreator=${isCreator}`);

      const setupWebSocket = () => {
        const initiateConnection = (peerId) => {
          if (peersRef.current[peerId]) {
            console.log(`RTCPeerConnection already exists for peerId: ${peerId} in room ${roomId}`);
            return;
          }
          const pc = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'turn:numb.viagenie.ca', username: 'your-email@example.com', credential: 'your-password' }
            ]
          });
          if (localVideoRef.current?.srcObject) {
            const tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => {
              console.log(`Viewer ${username} adding track to ${peerId} in room ${roomId}: ${track.kind}`);
              pc.addTrack(track, localVideoRef.current.srcObject);
            });
          } else {
            console.warn(`No local stream available to add tracks for ${peerId} in room ${roomId}`);
          }
          pc.onicecandidate = (event) => {
            if (event.candidate && ws.current.readyState === WebSocket.OPEN) {
              console.log(`${username} sending ICE candidate to ${peerId} in room ${roomId}:`, event.candidate);
              ws.current.send(JSON.stringify({ candidate: event.candidate, id: username, target: peerId }));
            }
          };
          pc.ontrack = (event) => {
            console.log(`Viewer ${username} in room ${roomId} received stream from ${peerId}:`, event.streams[0].getTracks().map(t => t.kind));
            setRemoteStreams(prev => {
              const newMap = new Map(prev);
              newMap.set(peerId, event.streams[0]);
              return newMap;
            });
          };
          let isConnected = false;
          pc.oniceconnectionstatechange = () => {
            console.log(`${username} ICE connection state with ${peerId} in room ${roomId}: ${pc.iceConnectionState}`);
            if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
              setRemoteStreams(prev => {
                const newMap = new Map(prev);
                newMap.delete(peerId);
                return newMap;
              });
              setPeerStatuses(prev => {
                const newMap = new Map(prev);
                newMap.delete(peerId);
                return newMap;
              });
              delete peersRef.current[peerId];
              console.log(`Peer ${peerId} disconnected in room ${roomId}`);
              isConnected = false;
              setTimeout(() => {
                if (!peersRef.current[peerId]) {
                  console.log(`Re-initiating connection with ${peerId} in room ${roomId} after disconnection`);
                  initiateConnection(peerId);
                }
              }, 2000);
            } else if (pc.iceConnectionState === 'connected') {
              console.log(`Connection successfully established with ${peerId} in room ${roomId}`);
              isConnected = true;
            }
          };
          pc.onnegotiationneeded = () => {
            console.log(`${username} in room ${roomId} onnegotiationneeded triggered for ${peerId}, skipping offer as Viewer`);
          };
          pc.pendingSignals = [];
          pc.pendingCandidates = [];
          peersRef.current[peerId] = pc;
        };

        const handleSignal = (peerId, data) => {
          let pc = peersRef.current[peerId];
          if (!pc) {
            console.log(`Buffering signal for peerId: ${peerId} in room ${roomId}, creating new RTCPeerConnection`);
            initiateConnection(peerId);
            pc = peersRef.current[peerId];
            pc.pendingSignals.push(data);
            return;
          }
          if (data.sdp) {
            if (data.sdp.type === 'offer') {
              console.log(`${username} received offer from ${peerId} in room ${roomId}:`, data.sdp);
              if (pc.signalingState !== 'stable') {
                console.warn(`Cannot set remote offer, signalingState is ${pc.signalingState}`);
                return;
              }
              pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
                .then(() => {
                  console.log(`${username} set remote description from ${peerId} in room ${roomId}`);
                  return pc.createAnswer();
                })
                .then(answer => pc.setLocalDescription(answer))
                .then(() => {
                  if (ws.current.readyState === WebSocket.OPEN) {
                    console.log(`${username} sending answer to ${peerId} in room ${roomId}:`, pc.localDescription);
                    ws.current.send(JSON.stringify({ sdp: pc.localDescription, id: username, target: peerId }));
                  }
                  if (pc.pendingCandidates && pc.pendingCandidates.length > 0) {
                    console.log(`Applying ${pc.pendingCandidates.length} pending candidates for ${peerId} in room ${roomId}`);
                    pc.pendingCandidates.forEach(candidate => {
                      pc.addIceCandidate(new RTCIceCandidate(candidate))
                        .catch(err => console.error(`Add buffered ICE candidate error for ${peerId} in room ${roomId}:`, err));
                    });
                    pc.pendingCandidates = [];
                  }
                })
                .catch(err => console.error('Answer error:', err));
            } else if (data.sdp.type === 'answer') {
              console.log(`${username} received answer from ${peerId} in room ${roomId}:`, data.sdp);
              if (pc.signalingState !== 'have-local-offer') {
                console.warn(`Cannot set remote answer, signalingState is ${pc.signalingState}`);
                return;
              }
              pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
                .then(() => {
                  console.log(`${username} set remote description (answer) from ${peerId} in room ${roomId}`);
                  if (pc.pendingCandidates && pc.pendingCandidates.length > 0) {
                    console.log(`Applying ${pc.pendingCandidates.length} pending candidates for ${peerId} in room ${roomId}`);
                    pc.pendingCandidates.forEach(candidate => {
                      pc.addIceCandidate(new RTCIceCandidate(candidate))
                        .catch(err => console.error(`Add buffered ICE candidate error for ${peerId} in room ${roomId}:`, err));
                    });
                    pc.pendingCandidates = [];
                  }
                })
                .catch(err => console.error('Set remote description error:', err));
            }
          } else if (data.candidate) {
            console.log(`${username} received ICE candidate from ${peerId} in room ${roomId}:`, data.candidate);
            if (pc.remoteDescription) {
              pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                .catch(err => console.error(`Add ICE candidate error for ${peerId} in room ${roomId}:`, err));
            } else {
              console.log(`${username} buffering ICE candidate from ${peerId} in room ${roomId}`);
              pc.pendingCandidates = pc.pendingCandidates || [];
              pc.pendingCandidates.push(data.candidate);
            }
          }
        };

        ws.current.onopen = () => {
          if (isMounted) {
            console.log(`${username} WebSocket connected for room ${roomId}`);
            wsConnectionRetries = 0;
            ws.current.send(JSON.stringify({ id: username, type: 'join', roomId }));
            console.log(`${username} in room ${roomId} sending getRoomInfo request`);
            ws.current.send(JSON.stringify({ type: 'getRoomInfo', roomId }));

            retryInterval = setInterval(() => {
              if (isMounted && !streamerId && ws.current.readyState === WebSocket.OPEN) {
                console.log(`${username} in room ${roomId} retrying to get room info...`);
                ws.current.send(JSON.stringify({ type: 'getRoomInfo', roomId }));
              } else if (streamerId) {
                console.log(`${username} in room ${roomId} received streamerId: ${streamerId}, stopping retry`);
                clearInterval(retryInterval);
              }
            }, 500);
          }
        };

        ws.current.onmessage = (message) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(message.data);
            console.log(`Viewer ${username} in room ${roomId} received message:`, data);

            if (data.type === 'roomInfo') {
              console.log(`Viewer ${username} in room ${roomId} received roomInfo: Streamer is ${data.streamerId}`);
              setStreamerId(data.streamerId);
              return;
            }

            if (data.type === 'stopLive') {
              console.log(`Viewer ${username} received stopLive in room ${roomId}`);
              if (localVideoRef.current?.srcObject) {
                localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
                localVideoRef.current.srcObject = null;
              }
              Object.entries(peersRef.current).forEach(([peerId, pc]) => pc.close());
              peersRef.current = {};
              ws.current.close();
              setRemoteStreams(new Map());
              setPeerStatuses(new Map());
              setStreamerId(null);
              setProducts([]);
              setPinnedProduct(null);
              return;
            }

            const peerId = data.id || data.target;
            if (peerId && typeof peerId !== 'string') {
              console.warn(`Invalid peerId: ${peerId}, message:`, data);
              return;
            }

            if (data.type === 'existingUsers') {
              console.log(`Viewer ${username} in room ${roomId} received existing users: ${data.users}`);
              data.users.forEach(existingPeerId => {
                if (existingPeerId !== username && !peersRef.current[existingPeerId]) {
                  initiateConnection(existingPeerId);
                }
              });
              if (ws.current.readyState === WebSocket.OPEN) {
                console.log(`${username} in room ${roomId} sending getRoomInfo request after receiving existing users`);
                ws.current.send(JSON.stringify({ type: 'getRoomInfo', roomId }));
              }
            } else if (data.type === 'join' && peerId && !peersRef.current[peerId]) {
              console.log(`Viewer ${username} in room ${roomId} initiating connection with new peer: ${peerId}`);
              initiateConnection(peerId);
              if (ws.current.readyState === WebSocket.OPEN) {
                console.log(`${username} in room ${roomId} sending getRoomInfo request due to new user join`);
                ws.current.send(JSON.stringify({ type: 'getRoomInfo', roomId }));
              }
            } else if (data.type === 'leave') {
              console.log(`Viewer ${username} in room ${roomId} received leave from peer: ${peerId}`);
              setRemoteStreams(prev => {
                const newMap = new Map(prev);
                newMap.delete(peerId);
                return newMap;
              });
              setPeerStatuses(prev => {
                const newMap = new Map(prev);
                newMap.delete(peerId);
                return newMap;
              });
              if (peersRef.current[peerId]) {
                peersRef.current[peerId].close();
                delete peersRef.current[peerId];
              }
            } else if (data.type === 'status') {
              setPeerStatuses(prev => {
                const newMap = new Map(prev);
                newMap.set(peerId, {
                  micEnabled: data.micEnabled !== undefined ? data.micEnabled : (newMap.get(peerId)?.micEnabled ?? true),
                  cameraEnabled: data.cameraEnabled !== undefined ? data.cameraEnabled : (newMap.get(peerId)?.cameraEnabled ?? true),
                });
                return newMap;
              });
            } else if (data.type === 'products') {
              console.log(`Viewer ${username} in room ${roomId} received products:`, data.products);
              setProducts(data.products || []);
            } else if (data.type === 'pinnedProduct') {
              console.log(`Viewer ${username} in room ${roomId} received pinned product:`, data.product);
              setPinnedProduct(data.product);
            } else if (data.type === 'unpinProduct') {
              console.log(`Viewer ${username} in room ${roomId} unpinned product`);
              setPinnedProduct(null);
            } else if (data.type === 'comments') { // Nhận danh sách bình luận ban đầu
              setComments(data.comments || []);
            } else if (data.type === 'comment') { // Nhận bình luận mới
              setComments(prev => [...prev, {
                username: data.username,
                content: data.content,
                timestamp: data.timestamp,
              }]);
            } else if (peerId) {
              handleSignal(peerId, data);
            }
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        };

        ws.current.onerror = (err) => {
          console.error(`WebSocket error in room ${roomId}:`, err);
          if (wsConnectionRetries < maxWsRetries) {
            console.log(`Retrying WebSocket connection for ${username} in room ${roomId}, attempt ${wsConnectionRetries + 1}`);
            setTimeout(connectWebSocket, 1000);
            wsConnectionRetries++;
          } else {
            console.error(`Max WebSocket retries reached for ${username} in room ${roomId}`);
          }
        };

        ws.current.onclose = () => {
          console.log(`${username} WebSocket closed in room ${roomId}`);
          if (wsConnectionRetries < maxWsRetries) {
            console.log(`Retrying WebSocket connection for ${username} in room ${roomId}, attempt ${wsConnectionRetries + 1}`);
            setTimeout(connectWebSocket, 1000);
            wsConnectionRetries++;
          } else {
            console.error(`Max WebSocket retries reached for ${username} in room ${roomId}`);
          }
        };
      };
      setupWebSocket();
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (isMounted) {
          console.log(`${username} local stream acquired in room ${roomId}:`, stream.getTracks().map(t => t.kind));
          localVideoRef.current.srcObject = stream;
          connectWebSocket();
        }
      })
      .catch(err => {
        console.error(`Error accessing media devices in room ${roomId}:`, err);
        alert(`Error accessing media devices: ${err.message}`);
      });

    return () => {
      isMounted = false;
      clearInterval(retryInterval);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
        console.log(`${username} WebSocket closed in cleanup in room ${roomId}`);
      }
      Object.entries(peersRef.current).forEach(([peerId, pc]) => {
        console.log(`Closing RTCPeerConnection for ${peerId} in room ${roomId}`);
        pc.close();
      });
      peersRef.current = {};
    };
  }, [roomId, username, isCreator]);

  const streamerStream = streamerId && streamerId !== username ? remoteStreams.get(streamerId) : null;
  const viewerStreams = new Map([...remoteStreams.entries()].filter(([peerId]) => peerId !== streamerId && peerId !== username));

  return (
    <div className="flex flex-col  h-[90%] bg-gray-900 text-white">
      <div className="flex flex-1 overflow-hidden">
        {/* Viewer Videos (bên trái) */}
        <div className="w-1/3 flex flex-col p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Participants</h3>
          {[...remoteStreams.entries()].map(([peerId, stream]) => {
            if (peerId === streamerId) return null;
            const status = peerStatuses.get(peerId) || { micEnabled: true, cameraEnabled: true };
            return (
              <div key={peerId} className="mb-4 relative">
                <video
                  ref={ref => {
                    if (ref && ref.srcObject !== stream) {
                      ref.srcObject = stream;
                      console.log(`Assigned stream to video for ${peerId}`);
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full rounded-md border border-gray-700"
                />
                {!status.cameraEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white rounded-md">
                    Camera Off
                  </div>
                )}
                <div className="text-sm mt-1">
                  <span className="mr-2">{peerId}</span>
                  <span className="text-gray-400">
                    Mic: {status.micEnabled ? 'On' : 'Off'} | Camera: {status.cameraEnabled ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            );
          })}
          <div className="mb-4 relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-md border border-gray-700"
            />
            {!cameraEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white rounded-md">
                Camera Off
              </div>
            )}
            <div className="text-sm mt-1">
              <span className="mr-2">{username} (You)</span>
              <span className="text-gray-400">
                Mic: {micEnabled ? 'On' : 'Off'} | Camera: {cameraEnabled ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>

        {/* Streamer Video (bên phải) với khung chat cao hơn */}
        <div className="w-2/3 h-[90%] flex flex-col p-4">
          <h3 className="text-lg font-semibold mb-2">Main Video</h3>
          {streamerStream && streamerId !== username ? (
            <div className="relative h-full">
              <video
                ref={ref => {
                  if (ref && ref.srcObject !== streamerStream) {
                    ref.srcObject = streamerStream;
                    console.log(`Assigned stream to video for ${streamerId}`);
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-md border border-gray-700"
              />
              {!(peerStatuses.get(streamerId)?.cameraEnabled ?? true) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white rounded-md">
                  Camera Off
                </div>
              )}
              {/* Khung chat cao nửa màn hình, input/send đẹp hơn */}
              <div className="absolute bottom-2 right-4 w-1/4 flex flex-col">
                <div className="max-h-1/2 overflow-hidden"> {/* Chiều cao tối đa là nửa màn hình */}
                  {comments.map((comment, index) => (
                    <div
                      key={index}
                      className="text-white text-sm mb-1 p-1 bg-gray-800 bg-opacity-70 rounded-lg animate-slide-up"
                      style={{ animation: `slide-up 5s linear` }}
                    >
                      <span className="font-semibold">{comment.username}:</span> {comment.content}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                    placeholder="Say something..."
                    className="w-full p-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-l-md 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <button
                    onClick={sendComment}
                    className="bg-gray-700 text-white text-sm px-4 py-[9px] rounded-r-md hover:border-gray-600 transition-colors duration-200"
                  >
                    Send
                  </button>
                </div>
              </div>
              <div className="text-sm mt-2">
                <span className="mr-2">{streamerId}</span>
                <span className="text-gray-400">
                  Mic: {(peerStatuses.get(streamerId)?.micEnabled ?? true) ? 'On' : 'Off'} | Camera: {(peerStatuses.get(streamerId)?.cameraEnabled ?? true) ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">Waiting for Streamer...</div>
          )}
        </div>
      </div>

      {/* Controls (dưới cùng) */}
      <div className="flex justify-center gap-4 p-4 bg-gray-800">
        <button
          onClick={toggleMic}
          className={`px-4 py-2 rounded-md ${micEnabled ? 'bg-red-600' : 'bg-green-600'} hover:opacity-80`}
        >
          {micEnabled ? 'Mute Mic' : 'Unmute Mic'}
        </button>
        <button
          onClick={toggleCamera}
          className={`px-4 py-2 rounded-md ${cameraEnabled ? 'bg-red-600' : 'bg-green-600'} hover:opacity-80`}
        >
          {cameraEnabled ? 'Stop Video' : 'Start Video'}
        </button>
        <button
          onClick={toggleRaiseHand}
          className={`px-4 py-2 rounded-md ${raisedHand ? 'bg-yellow-600' : 'bg-blue-600'} hover:opacity-80`}
        >
          {raisedHand ? 'Lower Hand' : 'Raise Hand'}
        </button>
      </div>

      {pinnedProduct && (
        <div className="absolute top-14 right-4 bg-white p-4 rounded-lg shadow-lg text-black">
          <h4 className="font-semibold">Pinned Product</h4>
          <img
            src={pinnedProduct.imageUrl}
            alt={pinnedProduct.name}
            className="w-12 h-12 object-cover rounded-md mt-2"
          />
          <p className="font-semibold">{pinnedProduct.name}</p>
          <p>Price: ${pinnedProduct.price}</p>
          <a
            href={pinnedProduct.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-blue-600 hover:underline"
          >
            View Product
          </a>
        </div>
      )}
    </div>
  );

};

export default Viewer;