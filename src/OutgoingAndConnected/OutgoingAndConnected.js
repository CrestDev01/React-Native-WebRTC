import React, { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { mediaDevices, RTCPeerConnection, RTCView, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import CallEnd from './../../asset/CallEnd';
import MicOn from './../../asset/MicOn';
import MicOff from './../../asset/MicOff';
import VideoOn from './../../asset/VideoOn';
import VideoOff from './../../asset/VideoOff';
import CameraSwitch from './../../asset/CameraSwitch';
import IconContainer from './../../components/IconContainer';
import { SocketContext } from './../../context/SocketContext';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');
const configuration = { 
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

const OutgoingAndConnected = ({ navigation, route }) => {
  const { toUser } = route.params;
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteUserMuted, setRemoteUserMuted] = useState(false);
  const [remoteUserCamOff, setRemoteUserCamOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isCallOngoing, setIsCallOngoing] = useState(false); // Track call state
  const { socket } = useContext(SocketContext);
  const userData = useSelector(state => state.user.userData);

  const peerConnection = useRef(new RTCPeerConnection(configuration));

  useEffect(() => {
    const setupMediaDevices = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({ 
          audio: true, 
          video: { facingMode: 'user' } 
        });
        setLocalStream(stream);
        peerConnection.current.addStream(stream);
        await sendOffer();
      } catch (error) {
        console.log("Error getting media devices:", error);
      }
    };

    const handleICECandidate = (event) => {
      console.log("Handling ICECandidate");
      if (event.candidate) {
        socket.current.emit('candidate', event.candidate);
      }
    };

    peerConnection.current.onicecandidate = handleICECandidate;

    peerConnection.current.onaddstream = (event) => {
      console.log("Added stream");
      setRemoteStream(event.stream);
    };

    setupMediaDevices();

    socket.current.on('answer', handleAnswer);
    socket.current.on('candidate', handleCandidate);
    socket.current.on('end-call', handleEndCall);
    socket.current.on('is-mute', handleMuteCall);
    socket.current.on('is-cam-on', handleCamChangeCall);

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

  const handleAnswer = useCallback(async (data) => {
    try {
      const { answer } = data;
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer)).then(()=>{
        console.log("Outgoing call success : RTCSessionDescription");
      });
      setIsCallOngoing(true);
    } catch (error) {
      console.log('Error handling answer: ', error);
    }
  }, []);

  const handleCandidate = useCallback(async (candidate) => {
    try {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate)).then(()=>{
        console.log("Outgoing call success : RTCIceCandidate");
      });
    } catch (error) {
      console.log('Error adding ICE candidate: ', error);
    }
  }, []);

  const sendOffer = useCallback(async () => {
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.current.emit('offer', { offer, userData, toUser });
    } catch (error) {
      console.log('Error creating offer: ', error);
    }
  }, [socket, userData, toUser]);

  const endCall = useCallback((flag = true) => {
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
  }, [localStream, socket, navigation]);

  const handleEndCall = useCallback(() => {
    endCall(false);
  }, [endCall]);

  const handleMuteCall = (isMuted) => {
   setRemoteUserMuted(isMuted);
  }
  
  const handleCamChangeCall = (isCamOn) => {
   setRemoteUserCamOff(!isCamOn);
  }

  const switchCamera = useCallback(() => {
    localStream.getVideoTracks().forEach(track => track._switchCamera());
  }, [localStream]);

  const toggleAudio = useCallback(() => {
    localStream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
    setIsMuted(!isMuted);
    socket.current.emit('is-mute', !isMuted);
  }, [localStream, isMuted]);

  const toggleVideo = useCallback(() => {
    localStream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
    setIsVideoEnabled(!isVideoEnabled);
    socket.current.emit('is-cam-on', !isVideoEnabled);
  }, [localStream, isVideoEnabled]);

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
        { (
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
      marginTop:32,
      fontSize: 16,
      textAlign: 'center',
    },
    });
    
    export default OutgoingAndConnected;