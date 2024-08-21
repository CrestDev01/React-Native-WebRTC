import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
} from 'react';
import {View, StyleSheet, Dimensions, Text} from 'react-native';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCView,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import CallEnd from './../../asset/CallEnd';
import MicOn from './../../asset/MicOn';
import MicOff from './../../asset/MicOff';
import VideoOn from './../../asset/VideoOn';
import VideoOff from './../../asset/VideoOff';
import CameraSwitch from './../../asset/CameraSwitch';
import IconContainer from './../../components/IconContainer';
import {SocketContext} from './../../context/SocketContext';
import {useSelector} from 'react-redux';
import {styles} from './styles';

const {width} = Dimensions.get('window');
const configuration = {
  iceServers: [
    {urls: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'},
    {urls: 'stun:stun2.l.google.com:19302'},
  ],
};

const OutgoingAndConnected = ({navigation, route}) => {
  const {toUser} = route.params;
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteUserMuted, setRemoteUserMuted] = useState(false);
  const [remoteUserCamOff, setRemoteUserCamOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isCallOngoing, setIsCallOngoing] = useState(false);
  const {socket} = useContext(SocketContext);
  const userData = useSelector(state => state.user.userData);

  const peerConnection = useRef(new RTCPeerConnection(configuration));

  // Set up media devices and peer connection when the component mounts
  useEffect(() => {
    const setupMediaDevices = async () => {
      try {
        // Request access to the user's camera and microphone
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: {facingMode: 'user'},
        });
        setLocalStream(stream);
        peerConnection.current.addStream(stream);
        await sendOffer();
      } catch (error) {}
    };

    // Handle ICE candidate events
    const handleICECandidate = event => {
      if (event.candidate) {
        socket.current.emit('candidate', event.candidate);
      }
    };

    // Set event listeners on the peer connection
    peerConnection.current.onicecandidate = handleICECandidate;
    peerConnection.current.onaddstream = event => {
      setRemoteStream(event.stream);
    };

    setupMediaDevices();

    // Set up socket event listeners
    socket.current.on('answer', handleAnswer);
    socket.current.on('candidate', handleCandidate);
    socket.current.on('end-call', handleEndCall);
    socket.current.on('is-mute', handleMuteCall);
    socket.current.on('is-cam-on', handleCamChangeCall);

    // Cleanup when the component unmounts
    return () => {
      endCall(false);
      peerConnection.current.close();
      socket.current.off('answer', handleAnswer);
      socket.current.off('candidate', handleCandidate);
      socket.current.off('end-call', handleEndCall);
      socket.current.off('is-mute', handleMuteCall);
      socket.current.off('is-cam-on', handleCamChangeCall);
    };
  }, []);

  // Handle receiving an answer to the offer
  const handleAnswer = useCallback(async data => {
    try {
      const {answer} = data;
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );

      setIsCallOngoing(true);
    } catch (error) {}
  }, []);

  // Handle receiving a new ICE candidate
  const handleCandidate = useCallback(async candidate => {
    try {
      await peerConnection.current.addIceCandidate(
        new RTCIceCandidate(candidate),
      );
    } catch (error) {}
  }, []);

  // Send the offer to initiate the connection
  const sendOffer = useCallback(async () => {
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.current.emit('offer', {offer, userData, toUser});
    } catch (error) {}
  }, [socket, userData, toUser]);

  // End the call and clean up resources
  const endCall = useCallback(
    (flag = true) => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      setLocalStream(null);
      setRemoteStream(null);
      setIsCallOngoing(false);

      if (flag) {
        socket.current.emit('end-call');
      }

      if (navigation.canGoBack()) {
        navigation.navigate('UserList');
      }
    },
    [localStream, socket, navigation],
  );

  // Handle the Remote user ending the call
  const handleEndCall = useCallback(() => {
    endCall(false);
  }, [endCall]);

  // Handle Remote user muting/unmuting their mic
  const handleMuteCall = isMuted => {
    setRemoteUserMuted(isMuted);
  };

  // Handle Remote user turning their camera on/off
  const handleCamChangeCall = isCamOn => {
    setRemoteUserCamOff(!isCamOn);
  };

  // Switch the camera (front/rear)
  const switchCamera = useCallback(() => {
    localStream.getVideoTracks().forEach(track => track._switchCamera());
  }, [localStream]);

  // Toggle audio on/off
  const toggleAudio = useCallback(() => {
    localStream
      .getAudioTracks()
      .forEach(track => (track.enabled = !track.enabled));
    setIsMuted(!isMuted);
    socket.current.emit('is-mute', !isMuted);
  }, [localStream, isMuted]);

  // Toggle video on/off
  const toggleVideo = useCallback(() => {
    localStream
      .getVideoTracks()
      .forEach(track => (track.enabled = !track.enabled));
    setIsVideoEnabled(!isVideoEnabled);
    socket.current.emit('is-cam-on', !isVideoEnabled);
  }, [localStream, isVideoEnabled]);

  return (
    <View style={styles.container}>
      {/* Render remote stream if available */}
      {remoteStream && (
        <>
          {!remoteUserCamOff && (
            <RTCView
              style={styles.remoteStream}
              streamURL={remoteStream.toURL()}
              objectFit="cover"
            />
          )}
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

      {/* Render local stream if video is enabled */}
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

      {/* Control buttons for the call */}
      <View style={styles.controls}>
        <IconContainer
          backgroundColor={'red'}
          onPress={endCall}
          Icon={() => <CallEnd height={26} width={26} fill="#FFF" />}
        />
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

export default OutgoingAndConnected;
