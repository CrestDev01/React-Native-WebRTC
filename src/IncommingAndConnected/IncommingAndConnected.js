import React, {useEffect, useRef, useState, useContext} from 'react';
import {
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import {RTCIceCandidate, RTCPeerConnection, RTCSessionDescription, RTCView, mediaDevices} from 'react-native-webrtc';
import CallEnd from '../../asset/CallEnd';
import CallAnswer from '../../asset/CallAnswer';
import MicOn from '../../asset/MicOn';
import MicOff from '../../asset/MicOff';
import VideoOn from '../../asset/VideoOn';
import VideoOff from '../../asset/VideoOff';
import CameraSwitch from '../../asset/CameraSwitch';
import IconContainer from '../../components/IconContainer';
import {SocketContext} from '../../context/SocketContext';
import {useSelector} from 'react-redux';

const configuration = {iceServers: [{ 
  urls: 'stun:stun.l.google.com:19302',
},
{
  urls: 'stun:stun1.l.google.com:19302',
},
{
  urls: 'stun:stun2.l.google.com:19302',
},]};
const {width, height} = Dimensions.get('window');

const IncommingAndConnected = ({navigation, route}) => {
  const {socket, incomingOffer, incomingOfferFrom, clearIncomingOffer} =
    useContext(SocketContext); // Access the socket context

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [remoteUserMuted, setRemoteUserMuted] = useState(false);
  const [remoteUserCamOff, setRemoteUserCamOff] = useState(false);
  const [iceCandidatesQueue, setIceCandidatesQueue] = useState([]);
  const [isCallOngoing, setIsCallOngoing] = useState(false); // Track call state
  const pc = useRef(new RTCPeerConnection(configuration)).current;
  const userData = useSelector(state => state.user.userData);

  useEffect(() => {
    const setupWebRTC = async () => {
      const stream = await mediaDevices.getUserMedia({
       video: {
          facingMode: 'user',
        }, // Request the back camera
        audio: true,
      });

      setLocalStream(stream);
      pc.addStream(stream);
    };

    setupWebRTC();

    setTimeout(() => {  
      acceptCall();
    }, 1000);
    

    pc.onicecandidate = event => {
      if (event.candidate) {
        console.log('IncommingAndConnected => ICE candidate: ', event.candidate);
        socket.current.emit('candidate', event.candidate);
      }
    };

    
    pc.onaddstream = event => {
      console.log('IncommingAndConnected => Added Stream: ', event);
      setRemoteStream(event.stream);
    };

  socket.current.on('candidate', handleCandidate);
  socket.current.on('end-call', handleEndCall);
  socket.current.on('is-mute', handleMuteCall);
  socket.current.on('is-cam-on', handleCamChangeCall);
    
    return () => {
      endCall(); // Ensure everything is reset when component is unmounted
      pc.close(); // Close the peer connection
      socket.current.off('candidate', handleCandidate);
      socket.current.off('end-call', handleEndCall);
      socket.current.off('is-mute', handleMuteCall);
      socket.current.off('is-cam-on', handleCamChangeCall);

    };
  }, [socket.current]);


  const handleOffer = async offer => {
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.current.emit('answer', {answer, userData, incomingOfferFrom});
      processQueuedCandidates();
      setIsCallOngoing(true); 
    } catch (error) {
    }
  };

  const handleCandidate = candidate => {
    console.log('IncommingAndConnected', 'handleCandidate');
    if (pc.remoteDescription) {
      pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(error => {
        console.log('Error adding ICE candidate: ', error);
      });
    } else {
      setIceCandidatesQueue(prevQueue => [...prevQueue, candidate]);
    }
  };

  const processQueuedCandidates = () => {
    iceCandidatesQueue.forEach(candidate => {
      pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(error => {
        console.log('Error adding ICE candidate from queue: ', error);
      });
    });
    setIceCandidatesQueue([]);
  };

  const acceptCall = async () => {
    if (incomingOffer) {
      console.log('IncommingAndConnected', 'acceptCall', incomingOffer);
      await handleOffer(incomingOffer);
      clearIncomingOffer(null);
    }
  };

  const endCall = (flag = true) => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsCallOngoing(false); // Update call state

    if (flag) {
      // Send 'end-call' signal to the other peer if connected
      socket.current.emit('end-call');
    }
  
    if (navigation.canGoBack()) {
      navigation.navigate('UserList');
    }
  };

  const handleEndCall = () => {
    endCall(false);
  };

  const handleMuteCall = (isMuted) => {
    setRemoteUserMuted(isMuted);
   }
   
   const handleCamChangeCall = (isCamOn) => {
    setRemoteUserCamOff(!isCamOn);
   }
  
  const switchCamera = () => {
    localStream.getVideoTracks().forEach(track => track._switchCamera());
  };

  const toggleAudio = () => {
    localStream
      .getAudioTracks()
      .forEach(track => (track.enabled = !track.enabled));
      socket.current.emit('is-mute', !isMuted);
      setIsMuted(!isMuted);
    };
    
    const toggleVideo = () => {
      localStream
      .getVideoTracks()
      .forEach(track => (track.enabled = !track.enabled));
      setIsVideoEnabled(!isVideoEnabled);
      socket.current.emit('is-cam-on', !isVideoEnabled);
  };

  console.log('IncommingAndConnected => remoteStream ', remoteStream);
  console.log('IncommingAndConnected => localStream ', localStream);

  const WebrtcRoomScreen = () => {
    return (
      <View style={styles.container}>
        {remoteStream && (
          <>
            {!remoteUserCamOff && <RTCView
              style={styles.remoteStream}
              streamURL={remoteStream.toURL()}
              objectFit="cover"
            />}
            {(remoteUserMuted && !remoteUserCamOff) && (
              <View style={styles.messageOverlay}>
                <Text style={styles.messageText}>Remote user has muted their mic</Text>
              </View>
            )}
            {(remoteUserCamOff && !remoteUserMuted) && (
              <View style={styles.messageOverlay}>
                <Text style={styles.messageText}>Remote user has turned off their camera</Text>
              </View>
            )}
            {(remoteUserCamOff && remoteUserMuted) && (
              <View style={styles.messageOverlay}>
                <Text style={styles.messageText}>Remote user has turned off their camera and mic.</Text>
              </View>
            )}
          </>
        )}
        {isVideoEnabled && localStream && (
          <View style={styles.myStreamWrapper}>
            <RTCView
              style={styles.myStream}
              objectFit="cover"
              streamURL={localStream.toURL()}
              zOrder={1}
            />
          </View>
        )}
        <View style={styles.controls}>
          {isCallOngoing && (
            <IconContainer
              backgroundColor={'red'}
              onPress={endCall}
              Icon={() => <CallEnd height={26} width={26} fill="#FFF" />}
            />
          )}
          <IconContainer
            style={styles.iconStyle}
            backgroundColor={!isMuted ? 'transparent' : '#fff'}
            onPress={toggleAudio}
            Icon={() => isMuted ? (
              <MicOff height={28} width={28} fill="#1D2939" />
            ) : (
              <MicOn height={24} width={24} fill="#FFF" />
            )}
          />
          <IconContainer
            style={styles.iconStyle}
            backgroundColor={!isVideoEnabled ? '#fff' : 'transparent'}
            onPress={toggleVideo}
            Icon={() => isVideoEnabled ? (
              <VideoOn height={24} width={24} fill="#FFF" />
            ) : (
              <VideoOff height={36} width={36} fill="#1D2939" />
            )}
          />
          <IconContainer
            style={styles.iconStyle}
            backgroundColor={'transparent'}
            onPress={switchCamera}
            Icon={() => <CameraSwitch height={24} width={24} fill="#FFF" />}
          />
        </View>
      </View>
    );
  };

  return WebrtcRoomScreen();
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  remoteStream: {
    width: '100%',
    height: '100%',
  },
  myStreamWrapper: {
    position: 'absolute',
    top: 20,
    right: 20,
    height: width * 0.6 + 8,
    width: width * 0.6 + 8,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myStream: {
    height: width * 0.6,
    width: width * 0.6,
  },
  controls: {
    flexDirection: "row",
    position: "absolute",    
    justifyContent: "space-evenly",
    width: "100%",
    bottom:0,
    backgroundColor:'black',
    padding:12
    },
    iconStyle: {
    borderWidth: 1.5,
    borderColor: "#2B3034",
    },
    messageOverlay: {
      position: 'absolute',      
      height:"100%", width:"100%",
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignSelf:'center',
      alignContent: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      bottom:70,
    },
    messageText: {
      color: 'white',
      fontSize: 16,
      textAlign: 'center',
    },
    });

export default IncommingAndConnected;
