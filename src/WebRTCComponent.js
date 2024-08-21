import React, {useEffect, useRef, useState, useContext} from 'react';
import {
  View,
  Button,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {RTCPeerConnection, RTCView, mediaDevices} from 'react-native-webrtc';
import CallEnd from './../asset/CallEnd';
import CallAnswer from './../asset/CallAnswer';
import MicOn from './../asset/MicOn';
import MicOff from './../asset/MicOff';
import VideoOn from './../asset/VideoOn';
import VideoOff from './../asset/VideoOff';
import CameraSwitch from './../asset/CameraSwitch';
import IconContainer from './../components/IconContainer';
import {SocketContext} from '../context/SocketContext';

const configuration = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]};
const {width, height} = Dimensions.get('window');

const WebRTCComponent = ({navigation, route}) => {
  const {room} = route.params;
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [iceCandidatesQueue, setIceCandidatesQueue] = useState([]);
  const [isCallOngoing, setIsCallOngoing] = useState(false); // Track call state
  const pc = useRef(new RTCPeerConnection(configuration)).current;
  const socket = useContext(SocketContext);

  useEffect(() => {
    console.log("Emergency")
    // Cleanup function for component unmount
    return () => {
      endCall(); // Ensure everything is reset when component is unmounted
    };
  }, []);

  useEffect(() => {
    mediaDevices
      .getUserMedia({
        video: {facingMode: {exact: 'environment'}}, // Request the back camera
        audio: true,
      })
      .then(stream => {
        setLocalStream(stream);
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      });

    socket.on('room-offer', handleIncomingOffer);
    socket.on('room-answer', handleAnswer);
    socket.on('room-candidate', handleCandidate);
    socket.on('room-end-call', handleEndCall);

    return () => {
      endCall(); // Ensure everything is reset when component is unmounted
    };
  }, []);

  const handleIncomingOffer = offer => {
    setIncomingOffer(offer);
  };

  const handleOffer = async offer => {
    try {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('room-answer', answer);
      processQueuedCandidates();
      setIsCallOngoing(true); // Call is ongoing now
    } catch (error) {
      console.error('Error handling offer: ', error);
    }
  };

  const handleAnswer = async answer => {
    try {
      await pc.setRemoteDescription(answer);
      processQueuedCandidates();
      setIsCallOngoing(true); // Call is ongoing now
    } catch (error) {
      console.error('Error handling answer: ', error);
    }
  };

  const handleCandidate = candidate => {
    if (pc.remoteDescription) {
      pc.addIceCandidate(candidate).catch(error => {
        console.error('Error adding ICE candidate: ', error);
      });
    } else {
      setIceCandidatesQueue(prevQueue => [...prevQueue, candidate]);
    }
  };

  const processQueuedCandidates = () => {
    iceCandidatesQueue.forEach(candidate => {
      pc.addIceCandidate(candidate).catch(error => {
        console.error('Error adding ICE candidate from queue: ', error);
      });
    });
    setIceCandidatesQueue([]);
  };

  const sendOffer = async () => {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('room-offer', offer);
    } catch (error) {
      console.error('Error creating offer: ', error);
    }
  };

  const acceptCall = async () => {
    if (incomingOffer) {
      await handleOffer(incomingOffer);
      setIncomingOffer(null);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsCallOngoing(false); // Update call state

    // Send 'end-call' signal to the other peer if connected
    socket.emit('room-end-call');

    if (socket.connected) {
      socket.disconnect();
      // socket.connect(); // Reconnect the socket for new call setup
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEndCall = () => {
    // Handle end call signal from the other peer
    endCall();
  };

  const switchCamera = () => {
    localStream.getVideoTracks().forEach(track => track._switchCamera());
  };

  const toggleAudio = () => {
    localStream
      .getAudioTracks()
      .forEach(track => (track.enabled = !track.enabled));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localStream
      .getVideoTracks()
      .forEach(track => (track.enabled = !track.enabled));
    setIsVideoEnabled(!isVideoEnabled);
  };

  pc.onicecandidate = event => {
    if (event.candidate) {
      socket.emit('room-candidate', event.candidate);
    }
  };

  pc.ontrack = event => {
    setRemoteStream(event.streams[0]);
  };

  const joinRoom = () => {
    console.log('Joining room:', room);
    socket.emit('room-join', {room});
  };

  const IncomingCallScreen = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'space-around',
          backgroundColor: '#050A0E',
        }}>
        <View
          style={{
            padding: 35,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 14,
          }}>
          <Text
            style={{
              fontSize: 36,
              marginTop: 12,
              color: '#ffff',
            }}>
            Someone is calling...
          </Text>
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={acceptCall}
            style={{
              backgroundColor: 'green',
              borderRadius: 30,
              height: 60,
              aspectRatio: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <CallAnswer height={28} fill={'#fff'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const WebrtcRoomScreen = () => {
    return (
      <View
        style={{
          flex: 1,
        }}>
        {remoteStream && (
          <RTCView
            style={styles.remoteStream}
            streamURL={remoteStream.toURL()}
            objectFit="cover"
          />
        )}
        {localStream && (
          <View style={styles.myStreamWrapper}>
            <RTCView
              style={styles.myStream}
              objectFit="cover"
              streamURL={localStream.toURL()}
              zOrder={1}
            />
          </View>
        )}
        <View
          style={{
            marginVertical: 12,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}>
          {!isCallOngoing && !incomingOffer && (
            <IconContainer
              backgroundColor={'green'}
              onPress={sendOffer}
              Icon={() => {
                return <CallAnswer height={26} width={26} fill="#FFF" />;
              }}
            />
          )}

          {isCallOngoing && (
            <IconContainer
              backgroundColor={'red'}
              onPress={endCall}
              Icon={() => {
                return <CallEnd height={26} width={26} fill="#FFF" />;
              }}
            />
          )}

          <IconContainer
            style={{
              borderWidth: 1.5,
              borderColor: '#2B3034',
            }}
            backgroundColor={!isMuted ? 'transparent' : '#fff'}
            onPress={toggleAudio}
            Icon={() => {
              return isMuted ? (
                <MicOff height={28} width={28} fill="#1D2939" />
              ) : (
                <MicOn height={24} width={24} fill="#FFF" />
              );
            }}
          />
          <IconContainer
            style={{
              borderWidth: 1.5,
              borderColor: '#2B3034',
            }}
            backgroundColor={!isVideoEnabled ? '#fff' : 'transparent'}
            onPress={toggleVideo}
            Icon={() => {
              return isVideoEnabled ? (
                <VideoOn height={24} width={24} fill="#FFF" />
              ) : (
                <VideoOff height={36} width={36} fill="#1D2939" />
              );
            }}
          />
          <IconContainer
            style={{
              borderWidth: 1.5,
              borderColor: '#2B3034',
            }}
            backgroundColor={'transparent'}
            onPress={switchCamera}
            Icon={() => {
              return <CameraSwitch height={24} width={24} fill="#FFF" />;
            }}
          />
        </View>
      </View>
    );
  };

  return incomingOffer ? IncomingCallScreen() : WebrtcRoomScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  localVideo: {
    width: 100,
    height: 150,
    position: 'absolute',
    top: 20,
    right: 20,
    borderWidth: 1,
    borderColor: 'white',
  },
  controls: {
    flexDirection: 'column',
    position: 'absolute',
    bottom: 30,
    justifyContent: 'space-around',
    width: '100%',
  },
  childControl: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  button: {
    margin: 10,
  },
  textStyle: {
    color: 'white',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '80%',
    padding: 5,
  },
  myStreamWrapper: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    height: width * 0.6 + 8,
    width: width * 0.4 + 8,
    backgroundColor: '#333',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myStream: {
    height: width * 0.6,
    width: width * 0.4,
  },
  remoteStream: {
    width: '100%',
    height: '100%',
  },
});

export default WebRTCComponent;

// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Button,
//   TextInput,
//   StyleSheet,
//   FlatList,
//   Text,
// } from 'react-native';
// import DeviceInfo from 'react-native-device-info';
// import io from 'socket.io-client';
// import {
//   RTCView,
//   mediaDevices,
//   RTCPeerConnection,
//   RTCIceCandidate,
//   RTCSessionDescription,
// } from 'react-native-webrtc';

// const WebRTCComponent = () => {
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [room, setRoom] = useState('');
//   const [url, setUrl] = useState('');
//   const socketRef = useRef(null);
//   const [offerQueue, setOfferQueue] = useState([]);
//   const [candidateQueue, setCandidateQueue] = useState([]);
//   const [roomUsers, setRoomUsers] = useState([]);
//   const peerConnection = useRef(
//     new RTCPeerConnection({
//       iceServers: [
//         {
//           urls: 'stun:stun.l.google.com:19302',
//         },
//         {
//           urls: 'stun:stun1.l.google.com:19302',
//         },
//         {
//           urls: 'stun:stun2.l.google.com:19302',
//         },
//       ],
//     }),
//   );

//   useEffect(() => {
//     const checkEmulator = async () => {
//       const isEmulator = await DeviceInfo.isEmulator();
//       const serverUrl = isEmulator
//         ? 'http://10.0.2.2:3000' // Android emulator
//         : 'http://192.168.1.12:3000'; // Replace with your actual local IP
//       setUrl('https://36cf-122-170-167-31.ngrok-free.app');
//     };

//     checkEmulator();
//   }, []);

//   useEffect(() => {
//     if (!url) return;

//     console.log('Connecting to signaling server at:', url);

//     const socket = io(url, { timeout: 20000, transports: ['websocket'] });
//     socketRef.current = socket;

//     socket.on('connect', () => {
//       console.log('Connected to signaling server');
//     });

//     socket.on('connect_error', error => {
//       console.log('Connection error:', error);
//     });

//     socket.on('connect_timeout', timeout => {
//       console.log('Connection timeout:', timeout);
//     });

//     socket.on('reconnect', attemptNumber => {
//       console.log('Reconnected after attempt:', attemptNumber);
//     });

//     socket.on('reconnect_error', error => {
//       console.log('Reconnection error:', error);
//     });

//     socket.on('user-joined', handleUserJoined);
//     socket.on('room-users', handleRoomUsers);
//     socket.on('offer', handleOffer);
//     socket.on('answer', handleAnswer);
//     socket.on('candidate', handleCandidate);

//     return () => {
//       socket.off('user-joined', handleUserJoined);
//       socket.off('room-users', handleRoomUsers);
//       socket.off('offer', handleOffer);
//       socket.off('answer', handleAnswer);
//       socket.off('candidate', handleCandidate);

//       // Clean up peer connection and streams
//       if (peerConnection.current) {
//         peerConnection.current.close();
//       }

//       if (localStream) {
//         localStream.getTracks().forEach(track => track.stop());
//         setLocalStream(null);
//       }
//       setRemoteStream(null);

//       // Clear the offer and candidate queues
//       setOfferQueue([]);
//       setCandidateQueue([]);

//       // Disconnect socket
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [url]);

//   const handleUserJoined = userId => {
//     console.log('User joined:', userId);
//     setRoomUsers(prevUsers => [...prevUsers, userId]);
//   };

//   const handleRoomUsers = users => {
//     console.log('Users in the room:', users);
//     setRoomUsers(users);
//   };

//   const handleOffer = async data => {
//     console.log('Received offer:', data);
//     if (!peerConnection.current) {
//       console.log('Peer connection not established yet. Queuing offer.');
//       setOfferQueue(prevQueue => [...prevQueue, data]);
//       return;
//     }

//     try {
//       await peerConnection.current.setRemoteDescription(data.offer);
//       const answer = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(answer);
//       socketRef.current.emit('answer', { answer, room: data.room });
//       console.log('Sent answer:', answer);

//       // Process queued candidates after setting remote description
//       processCandidateQueue(peerConnection.current);
//     } catch (error) {
//       console.error('Error handling offer:', error);
//     }
//   };

//   const handleAnswer = async data => {
//     console.log('Received answer:', data);
//     if (peerConnection.current) {
//       try {
//         await peerConnection.current.setRemoteDescription(data.answer);

//         // Process queued candidates after setting remote description
//         processCandidateQueue(peerConnection.current);
//       } catch (error) {
//         console.error('Error handling answer:', error);
//       }
//     } else {
//       console.error('Peer connection is null or undefined.');
//     }
//   };

//   const handleCandidate = async data => {
//     console.log('Received candidate:', data);
//     const { candidate } = data;

//     if (!peerConnection.current) {
//       console.log('Peer connection not yet established. Queuing candidate.');
//       setCandidateQueue(prevQueue => [...prevQueue, data]);
//       return;
//     }

//     try {
//       if (peerConnection.current.signalingState === 'closed') {
//         console.log('Peer connection is closed. Ignoring candidate.');
//         return;
//       }

//       await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//       console.log('Added candidate:', candidate);
//     } catch (e) {
//       console.error('Error adding received ice candidate', e);
//     }
//   };

//   const startCall = async () => {
//     try {

//       const stream = await mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });
//       setLocalStream(stream)
//       console.log('Obtained local stream:', stream);

//       // Add local stream to RTCPeerConnection
//       stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

//       // Set up event handlers
//       peerConnection.current.onicecandidate = event => {
//         if (event.candidate) {
//           console.log('Sending ICE candidate:', event.candidate);
//           socketRef.current.emit('candidate', { candidate: event.candidate, room });
//         }
//       };

//       peerConnection.current.ontrack = event => {
//         console.log('Received remote track:', event.streams[0]);
//         setRemoteStream(event.streams[0]);
//       };

//       peerConnection.current.oniceconnectionstatechange = event => {
//         console.log('ICE connection state change:', peerConnection.current.iceConnectionState);
//         if (peerConnection.current.iceConnectionState === 'failed') {
//           console.log('ICE connection failed. Restarting...');
//           peerConnection.current.restartIce();
//         }
//       };

//       peerConnection.current.onerror = event => {
//         console.error('RTCPeerConnection error:', event);
//       };

//       const offer = await peerConnection.current.createOffer();
//       await peerConnection.current.setLocalDescription(offer);

//       socketRef.current.emit('offer', { offer, room });
//       console.log('Sent offer:', offer);

//       // Process queued offers and candidates after peer connection is established
//       processOfferQueue(peerConnection.current);
//       processCandidateQueue(peerConnection.current); // Process queued candidates
//     } catch (error) {
//       console.error('Error starting the call:', error);
//     }
//   };

//   const processOfferQueue = async pc => {
//     // Process queued offers
//     offerQueue.forEach(async data => {
//       await handleOffer(data);
//     });

//     // Clear offer queue
//     setOfferQueue([]);
//   };

//   const processCandidateQueue = async pc => {
//     // Process queued candidates
//     candidateQueue.forEach(async data => {
//       await handleCandidate(data);
//     });

//     // Clear candidate queue
//     setCandidateQueue([]);
//   };

//   const joinRoom = () => {
//     console.log('Joining room:', room);
//     socketRef.current.emit('join', { room });
//   };
//   console.log('localStream:', localStream);
//   console.log('remoteStream:', remoteStream);
//   return (
//     <View style={styles.container}>
//       <TextInput
//         placeholder="Room ID"
//         value={room}
//         onChangeText={text => setRoom(text)}
//         style={styles.input}
//       />
//       <Button title="Join Room" onPress={joinRoom} />
//       <Button title="Start Call" onPress={startCall} />
//       {localStream && (
//         <RTCView streamURL={localStream.toURL()} style={styles.rtcView} />
//       )}
//       {remoteStream && (
//         <RTCView streamURL={remoteStream.toURL()} style={styles.rtcView} />
//       )}
//       <FlatList
//         data={roomUsers}
//         renderItem={({ item }) => <Text style={styles.userItem}>{item}</Text>}
//         keyExtractor={item => item}
//         style={styles.userList}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   input: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 20,
//     width: '80%',
//     padding: 5,
//   },
//   rtcView: {
//     width: 200,
//     height: 200,
//     backgroundColor: 'black',
//     marginTop: 20,
//   },
//   userList: {
//     marginTop: 20,
//     width: '80%',
//   },
//   userItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
// });

// export default WebRTCComponent;
