import React, {useEffect, useRef, useState, useContext} from 'react';
import {View, Text, Dimensions} from 'react-native';
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc';
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
import {styles} from './styles';

// WebRTC configuration with STUN servers
const configuration = {
  iceServers: [
    {urls: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'},
    {urls: 'stun:stun2.l.google.com:19302'},
  ],
};

// Get the device dimensions
export const {width, height} = Dimensions.get('window');

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
    // Setup WebRTC and get the user's media
    const setupWebRTC = async () => {
      const stream = await mediaDevices.getUserMedia({
        video: {facingMode: 'user'}, // Request the front camera
        audio: true,
      });
      setLocalStream(stream);
      pc.addStream(stream);
    };

    setupWebRTC();

    // Automatically accept the incoming call after 1 second
    setTimeout(() => {
      acceptCall();
    }, 1000);

    // Set up event handlers for ICE candidates and streams
    pc.onicecandidate = event => {
      if (event.candidate) {
        socket.current.emit('candidate', event.candidate);
      }
    };

    pc.onaddstream = event => {
      setRemoteStream(event.stream);
    };

    // Listen for socket events
    socket.current.on('candidate', handleCandidate);
    socket.current.on('end-call', handleEndCall);
    socket.current.on('is-mute', handleMuteCall);
    socket.current.on('is-cam-on', handleCamChangeCall);

    return () => {
      // Cleanup on component unmount
      endCall(); // Ensure everything is reset when component is unmounted
      pc.close(); // Close the peer connection
      socket.current.off('candidate', handleCandidate);
      socket.current.off('end-call', handleEndCall);
      socket.current.off('is-mute', handleMuteCall);
      socket.current.off('is-cam-on', handleCamChangeCall);
    };
  }, [socket.current]);

  // Handle incoming WebRTC offer
  const handleOffer = async offer => {
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.current.emit('answer', {answer, userData, incomingOfferFrom});
      processQueuedCandidates();
      setIsCallOngoing(true); // Mark the call as ongoing
    } catch (error) {}
  };

  // Handle incoming ICE candidates
  const handleCandidate = candidate => {
    if (pc.remoteDescription) {
      pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(error => {});
    } else {
      setIceCandidatesQueue(prevQueue => [...prevQueue, candidate]);
    }
  };

  // Process queued ICE candidates once the remote description is set
  const processQueuedCandidates = () => {
    iceCandidatesQueue.forEach(candidate => {
      pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(error => {});
    });
    setIceCandidatesQueue([]);
  };

  // Accept the incoming call
  const acceptCall = async () => {
    if (incomingOffer) {
      await handleOffer(incomingOffer);
      clearIncomingOffer(null); // Clear the incoming offer after handling it
    }
  };

  // End the call and cleanup streams
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

  // Handle the end-call event from the Remote user
  const handleEndCall = () => {
    endCall(false);
  };

  // Handle mute state change from the Remote user
  const handleMuteCall = isMuted => {
    setRemoteUserMuted(isMuted);
  };

  // Handle camera state change from the Remote user
  const handleCamChangeCall = isCamOn => {
    setRemoteUserCamOff(!isCamOn);
  };

  // Switch the camera (front/back)
  const switchCamera = () => {
    localStream.getVideoTracks().forEach(track => track._switchCamera());
  };

  // Toggle audio (mute/unmute)
  const toggleAudio = () => {
    localStream
      .getAudioTracks()
      .forEach(track => (track.enabled = !track.enabled));
    socket.current.emit('is-mute', !isMuted);
    setIsMuted(!isMuted);
  };

  // Toggle video (on/off)
  const toggleVideo = () => {
    localStream
      .getVideoTracks()
      .forEach(track => (track.enabled = !track.enabled));
    setIsVideoEnabled(!isVideoEnabled);
    socket.current.emit('is-cam-on', !isVideoEnabled);
  };

  // Render the WebRTC room screen
  const WebrtcRoomScreen = () => {
    return (
      <View style={styles.container}>
        {remoteStream && (
          <>
            {/* Render the remote stream if the camera is on */}
            {!remoteUserCamOff && (
              <RTCView
                style={styles.remoteStream}
                streamURL={remoteStream.toURL()}
                objectFit="cover"
              />
            )}

            {/* Display message overlays based on Remote user states */}
            {remoteUserMuted && !remoteUserCamOff && (
              <View style={styles.messageOverlay}>
                <Text style={styles.messageText}>
                  Remote user has muted his/her mic
                </Text>
              </View>
            )}
            {remoteUserCamOff && !remoteUserMuted && (
              <View style={styles.messageOverlay}>
                <Text style={styles.messageText}>
                  Remote user has turned off their camera
                </Text>
              </View>
            )}
            {remoteUserCamOff && remoteUserMuted && (
              <View style={styles.messageOverlay}>
                <Text style={styles.messageText}>
                  Remote user has turned off their camera and mic.
                </Text>
              </View>
            )}
          </>
        )}

        {/* Render the local stream if video is enabled */}
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

        {/* Render control buttons */}
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
            Icon={() =>
              isMuted ? (
                <MicOff height={28} width={28} fill="#1D2939" />
              ) : (
                <MicOn height={24} width={24} fill="#FFF" />
              )
            }
          />
          <IconContainer
            style={styles.iconStyle}
            backgroundColor={!isVideoEnabled ? '#fff' : 'transparent'}
            onPress={toggleVideo}
            Icon={() =>
              isVideoEnabled ? (
                <VideoOn height={24} width={24} fill="#FFF" />
              ) : (
                <VideoOff height={36} width={36} fill="#1D2939" />
              )
            }
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

export default IncommingAndConnected;
