import { useEffect, useRef, useState } from 'react';

const Streamer = ({ username, roomId, isCreator }) => {
  const localVideoRef = useRef(null);
  const extraVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [peerStatuses, setPeerStatuses] = useState(new Map());
  const [streamerId, setStreamerId] = useState(null);
  const [raisedHands, setRaisedHands] = useState(new Map());
  const ws = useRef(null);
  const peersRef = useRef({});
  const [showModalListProduct, setShowModalListProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [pinnedProduct, setPinnedProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    price: 0,
    imageUrl: '',
    link: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  // Thêm trạng thái cho bình luận
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const stopLive = () => {
    if (!isCreator) {
      console.log(`${username} is not the creator, cannot stop live`);
      return;
    }
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => {
        track.stop();
        console.log(`${username} stopped track ${track.id}`);
      });
      localVideoRef.current.srcObject = null;
    }
    if (extraVideoRef.current?.srcObject) {
      extraVideoRef.current.srcObject.getTracks().forEach(track => {
        track.stop();
        console.log(`${username} stopped cloned track ${track.id}`);
      });
      extraVideoRef.current.srcObject = null;
    }
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'stopLive',
        roomId
      }));
      ws.current.close();
      console.log(`${username} sent stopLive message and closed WebSocket in room ${roomId}`);
    }
    Object.entries(peersRef.current).forEach(([peerId, pc]) => {
      pc.close();
      console.log(`${username} closed RTCPeerConnection with ${peerId} in room ${roomId}`);
    });
    peersRef.current = {};
    setRemoteStreams(new Map());
    setPeerStatuses(new Map());
    setStreamerId(null);
    setProducts([]);
    setPinnedProduct(null);
    setRaisedHands(new Map());
    console.log(`${username} stopped live stream and cleared all states in room ${roomId}`);
  };

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
    if (extraVideoRef.current?.srcObject) {
      extraVideoRef.current.srcObject.getVideoTracks().forEach(track => {
        track.enabled = newCameraState;
        console.log(`${username} set cloned camera track ${track.id} to ${newCameraState ? 'enabled' : 'disabled'}`);
      });
    }
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

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.id) {
      alert('Please fill in all required fields (ID, Name, Price).');
      return;
    }
    const product = {
      type: 'addProduct',
      id: newProduct.id,
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      imageUrl: imagePreview || 'https://via.placeholder.com/150',
      link: newProduct.link || '#'
    };
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log(`Streamer ${username} in room ${roomId} sending addProduct:`, product);
      ws.current.send(JSON.stringify(product));
      setNewProduct({ id: '', name: '', price: 0, imageUrl: '', link: '' });
      setImagePreview('');
      setShowProductForm(false);
    } else {
      console.error(`WebSocket is not open for ${username} in room ${roomId}`);
    }
  };

  const handlePinProduct = (productId) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log(`Streamer ${username} in room ${roomId} sending pinProduct for product ID: ${productId}`);
      ws.current.send(JSON.stringify({
        type: 'pinProduct',
        productId
      }));
    }
  };

  const handleUnpinProduct = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log(`Streamer ${username} in room ${roomId} sending unpinProduct`);
      ws.current.send(JSON.stringify({
        type: 'unpinProduct'
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setNewProduct({ ...newProduct, imageUrl: file });
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
      ws.current = new WebSocket(`ws://localhost:8080/signaling?roomId=${roomId}&username=${username}&isCreator=${isCreator}`);

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
          console.log(`Streamer ${username} in room ${roomId} received message:`, data);

          if (data.type === 'roomInfo') {
            console.log(`Streamer ${username} in room ${roomId} received roomInfo: Streamer is ${data.streamerId}`);
            setStreamerId(data.streamerId);
            return;
          }

          if (data.type === 'stopLive') {
            console.log(`Streamer ${username} received stopLive in room ${roomId}`);
            if (localVideoRef.current?.srcObject) {
              localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
              localVideoRef.current.srcObject = null;
            }
            if (extraVideoRef.current?.srcObject) {
              extraVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
              extraVideoRef.current.srcObject = null;
            }
            Object.entries(peersRef.current).forEach(([peerId, pc]) => pc.close());
            peersRef.current = {};
            ws.current.close();
            setRemoteStreams(new Map());
            setPeerStatuses(new Map());
            setStreamerId(null);
            setProducts([]);
            setPinnedProduct(null);
            setRaisedHands(new Map());
            return;
          }

          const peerId = data.id || data.target;
          if (peerId && typeof peerId !== 'string') {
            console.warn(`Invalid peerId: ${peerId}, message:`, data);
            return;
          }

          if (data.type === 'existingUsers') {
            console.log(`Streamer ${username} in room ${roomId} received existing users: ${data.users}`);
            data.users.forEach(existingPeerId => {
              if (existingPeerId !== username && !peersRef.current[existingPeerId]) {
                initiateConnection(existingPeerId, true);
              }
            });
          } else if (data.type === 'join' && peerId && !peersRef.current[peerId]) {
            console.log(`Streamer ${username} in room ${roomId} initiating connection with new peer: ${peerId}`);
            initiateConnection(peerId, true);
            if (ws.current.readyState === WebSocket.OPEN) {
              console.log(`${username} in room ${roomId} sending getRoomInfo request due to new user join`);
              ws.current.send(JSON.stringify({ type: 'getRoomInfo', roomId }));
            }
          } else if (data.type === 'leave') {
            console.log(`Streamer ${username} in room ${roomId} received leave from peer: ${peerId}`);
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
            setRaisedHands(prev => {
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
            console.log(`Streamer ${username} in room ${roomId} received products:`, data.products);
            setProducts(data.products || []);
          } else if (data.type === 'pinnedProduct') {
            console.log(`Streamer ${username} in room ${roomId} received pinned product:`, data.product);
            setPinnedProduct(data.product);
          } else if (data.type === 'unpinProduct') {
            console.log(`Streamer ${username} in room ${roomId} unpinned product`);
            setPinnedProduct(null);
          } else if (data.type === 'raisedHands') {
            console.log(`Streamer ${username} in room ${roomId} received raised hands:`, data.raisedHands);
            setRaisedHands(new Map(Object.entries(data.raisedHands)));
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

      const initiateConnection = (peerId, shouldSendOffer = true) => {
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
            console.log(`Streamer ${username} adding track to ${peerId} in room ${roomId}: ${track.kind}`);
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
          console.log(`Streamer ${username} in room ${roomId} received stream from ${peerId}:`, event.streams[0].getTracks().map(t => t.kind));
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
            setRaisedHands(prev => {
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
                initiateConnection(peerId, true);
              }
            }, 2000);
          } else if (pc.iceConnectionState === 'connected') {
            console.log(`Connection successfully established with ${peerId} in room ${roomId}`);
            isConnected = true;
          }
        };
        pc.onnegotiationneeded = () => {
          if (pc.signalingState === 'stable' && !isConnected) {
            console.log(`${username} in room ${roomId} onnegotiationneeded triggered for ${peerId}, sending offer`);
            sendOffer(peerId, false);
          } else {
            console.log(`${username} in room ${roomId} onnegotiationneeded skipped for ${peerId}, signalingState: ${pc.signalingState}, isConnected: ${isConnected}`);
          }
        };
        pc.pendingSignals = [];
        pc.pendingCandidates = [];
        peersRef.current[peerId] = pc;
        if (shouldSendOffer && pc.signalingState === 'stable' && !isConnected) {
          sendOffer(peerId, false);
        }
      };

      const sendOffer = (peerId, iceRestart = false) => {
        const pc = peersRef.current[peerId];
        if (!pc) {
          console.error(`No RTCPeerConnection found for peerId: ${peerId} in room ${roomId}`);
          return;
        }
        if (pc.signalingState !== 'stable') {
          console.warn(`Cannot send offer to ${peerId}, signalingState is ${pc.signalingState}`);
          return;
        }
        const offerOptions = {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
          iceRestart: iceRestart
        };
        pc.createOffer(offerOptions)
          .then(offer => pc.setLocalDescription(offer))
          .then(() => {
            if (ws.current.readyState === WebSocket.OPEN) {
              console.log(`${username} sending offer to ${peerId} in room ${roomId}:`, pc.localDescription);
              ws.current.send(JSON.stringify({ sdp: pc.localDescription, id: username, target: peerId }));
            }
          })
          .catch(err => console.error('Offer error:', err));
      };

      const handleSignal = (peerId, data) => {
        let pc = peersRef.current[peerId];
        if (!pc) {
          console.log(`Buffering signal for peerId: ${peerId} in room ${roomId}, creating new RTCPeerConnection`);
          initiateConnection(peerId, true);
          pc = peersRef.current[peerId];
          pc.pendingSignals.push(data);
          return;
        }
        if (data.sdp) {
          if (data.sdp.type === 'answer') {
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
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (isMounted) {
          console.log(`${username} local stream acquired in room ${roomId}:`, stream.getTracks().map(t => t.kind));
          localVideoRef.current.srcObject = stream;
          const clonedStream = stream.clone();
          console.log(`${username} cloned local stream for extra video in room ${roomId}:`, clonedStream.getTracks().map(t => t.kind));
          if (extraVideoRef.current) {
            extraVideoRef.current.srcObject = clonedStream;
          }
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
      if (extraVideoRef.current?.srcObject) {
        extraVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        extraVideoRef.current.srcObject = null;
      }
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        localVideoRef.current.srcObject = null;
      }
    };
  }, [roomId, username, isCreator]);

  const sortedRemoteStreams = [...remoteStreams.entries()].sort(([peerIdA], [peerIdB]) => {
    const raisedA = raisedHands.get(peerIdA) || false;
    const raisedB = raisedHands.get(peerIdB) || false;
    if (raisedA && !raisedB) return -1;
    if (!raisedA && raisedB) return 1;
    return 0;
  });
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white mt-[75px]">
      <div className="flex flex-1 overflow-hidden ">
        {/* Viewer Videos (bên trái) */}
        <div className="w-1/4 flex flex-col p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Participants</h3>
          {sortedRemoteStreams.map(([peerId, stream]) => {
            const status = peerStatuses.get(peerId) || { micEnabled: true, cameraEnabled: true };
            const isRaised = raisedHands.get(peerId) || false;
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
                  {isRaised && (
                    <span className="text-yellow-400 mr-2">✋</span>
                  )}
                  <span className="text-gray-400">
                    Mic: {status.micEnabled ? 'On' : 'Off'} | Camera: {status.cameraEnabled ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Streamer Video (bên phải) với khung chat cao hơn */}
        <div className="w-full h-[96%] flex flex-col p-4">
          <h3 className="text-lg font-semibold mb-2">Main Video</h3>
          <div className="relative h-[95%]">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-md border border-gray-700"
            />
            {!cameraEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white rounded-md">
                Camera Off
              </div>
            )}
            {/* Khung chat cao nửa màn hình, input/send đẹp hơn */}
            <div className="absolute bottom-2 right-4 w-1/4 flex flex-col">
              <div className="max-h-1/3 overflow-hidden">
                {comments.map((comment, index) => (
                  <div
                    key={index}
                    className="text-white text-sm mb-1 p-1 bg-gray-800 bg-opacity-25 rounded-lg animate-slide-up"
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
                  focus:outline-none   placeholder-gray-400"
                />
                <button
                  onClick={sendComment}
                  className="bg-gray-700 text-white text-sm px-4 py-[9px] rounded-r-md hover:border-gray-600 transition-colors duration-200"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          <div className="text-sm mt-2">
            <span className="mr-2">{username} (You)</span>
            <span className="text-gray-400">
              Mic: {micEnabled ? 'On' : 'Off'} | Camera: {cameraEnabled ? 'On' : 'Off'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls (dưới cùng) */}
      <div className="flex justify-center gap-4 p-4 bg-gray-800">
        <button
          onClick={() => setShowProductForm(true)}
          className="text-white bg-[#32c36c] hover:bg-[#2aa85e] focus:ring-4 
          focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all"
        >
          Add New Product
        </button>
        {products.length === 0 ? (
          <p className="flex items-center">No products available</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 w-1/2">
            <button
              onClick={() => setShowModalListProduct(!showModalListProduct)}
              className="text-white bg-[#32c36c] hover:bg-[#2aa85e] focus:ring-4 
              focus:outline-none focus:ring-green-300 font-medium w-[150px] rounded-lg text-sm px-5 py-2.5 text-center transition-all"
              type="button"
            >
              List Product
            </button>
            {showModalListProduct && (
              <div id="default-modal" tabIndex="-1" aria-hidden="true" className="overflow-y-auto overflow-x-hidden fixed top-0 left-0 right-0 z-50 flex justify-center items-center w-full h-screen bg-black/50">
                <div className="relative p-4 w-full m-auto top-[75px] max-w-2xl max-h-full">
                  <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700 flex flex-col items-center">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200 dark:border-gray-600 w-full">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product List</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[500px] w-full p-4">
                      {products.map(product => (
                        <div key={product.id} className="relative w-full rounded-md overflow-hidden mb-2 shadow-sm border border-gray-300">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm">Start Price: ${product.price}</p>
                            <button
                              onClick={() => handlePinProduct(product.id)}
                              disabled={pinnedProduct && pinnedProduct.id === product.id}
                              className={`mt-2 w-[150px] py-2 rounded-md ${pinnedProduct && pinnedProduct.id === product.id ? 'bg-gray-500' : ' bg-[#32c36c] '} text-white hover:opacity-80`}
                            >
                              Pin Product
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-end p-4 border-t border-gray-200 dark:border-gray-600 w-full">
                      <button
                        onClick={() => setShowModalListProduct(false)}
                        className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:text-white hover:bg-[#2aa85e] focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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
        {isCreator && (
          <button
            onClick={stopLive}
            className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
          >
            End Meeting
          </button>
        )}
      </div>

      {showProductForm && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg text-black">
          <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
          <div className="mb-2">
            <label className="block text-sm font-medium">Product ID: </label>
            <input
              type="text"
              value={newProduct.id}
              onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Product Name: </label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Price: </label>
            <input
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Image URL: </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ marginTop: '10px', width: '100px', height: '100px', objectFit: 'cover' }}
              />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Product Link: </label>
            <input
              type="text"
              value={newProduct.link}
              onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleAddProduct}
              className="bg-[#32c36c] hover:bg-[#2aa85e] text-white px-4 py-2 rounded-md"
            >
              Add Product
            </button>
            <button
              onClick={() => {
                setShowProductForm(false);
                setImagePreview('');
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="h-[80px]"></div>

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
          <button
            onClick={handleUnpinProduct}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Unpin
          </button>
        </div>
      )}
    </div>
  );
};

export default Streamer;