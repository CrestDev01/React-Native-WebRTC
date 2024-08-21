import React, {useEffect, useRef, useState, useContext} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
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

const GroupCall = ({navigation}) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [incomingOffers, setIncomingOffers] = useState([]);
  const [iceCandidatesQueue, setIceCandidatesQueue] = useState({});
  const [isCallOngoing, setIsCallOngoing] = useState(false);
  const peerConnections = useRef({});
  const socket = useContext(SocketContext);
  const room = 'WebRTCGroup'; // Replace with your room name logic

  useEffect(() => {
    console.log('Emergency');
    mediaDevices
      .getUserMedia({
        video: {facingMode: {exact: 'environment'}},
        audio: true,
      })
      .then(stream => {
        console.log('Local stream obtained');
        setLocalStream(stream);
      });

    socket.on('offer', handleIncomingOffer);
    socket.on('answer', handleAnswer);
    socket.on('candidate', handleCandidate);
    socket.on('end-call', handleEndCall);
    socket.emit('room-join', room);

    return () => {
      endCall();
    };
  }, [socket]);

  const handleIncomingOffer = ({offer, socketId}) => {
    console.log('handleIncomingOffer', socketId);
    setIncomingOffers(prevOffers => [...prevOffers, {offer, socketId}]);
  };

  const handleOffer = async (offer, offerSocketId) => {
    console.log('handleOffer', offerSocketId);
    const pc = new RTCPeerConnection(configuration);
    peerConnections.current[offerSocketId] = pc;

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('candidate', {
          room,
          candidate: event.candidate,
          socketId: offerSocketId,
        });
      }
    };

    pc.ontrack = event => {
      setRemoteStreams(prevStreams => {
        console.log('handleOffer pc.ontrack setRemoteStreams');
        const streamExists = prevStreams.some(
          stream => stream.id === offerSocketId,
        );
        if (!streamExists) {
          return [
            ...prevStreams,
            {id: offerSocketId, stream: event.streams[0]},
          ];
        }
        return prevStreams;
      });
    };

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answer', {room, answer, offerSocketId});
    processQueuedCandidates(offerSocketId);
    setIsCallOngoing(true);
  };

  const handleAnswer = async ({answer, socketId}) => {
    console.log('handleAnswer', socketId);
    const pc = peerConnections.current[socketId];
    if (pc) {
      console.log('handleAnswer 1', socketId);
      await pc.setRemoteDescription(answer);
      processQueuedCandidates(socketId);
      setIsCallOngoing(true);
    }
  };

  const handleCandidate = ({candidate, socketId}) => {
    console.log('handleCandidate', socketId);
    const pc = peerConnections.current[socketId];
    // console.log('handleCandidate 1111', pc.remoteDescription);
    if (pc && pc.remoteDescription) {
      pc.addIceCandidate(candidate).catch(error => {
        console.error('Error adding ICE candidate: ', error);
      });
    } else {
      setIceCandidatesQueue(prevQueue => ({
        ...prevQueue,
        [socketId]: [...(prevQueue[socketId] || []), candidate],
      }));
    }
  };

  const processQueuedCandidates = socketId => {
    console.log('processQueuedCandidates', socketId);
    if (iceCandidatesQueue[socketId]) {
      iceCandidatesQueue[socketId].forEach(candidate => {
        peerConnections.current[socketId]
          .addIceCandidate(candidate)
          .catch(error => {
            console.error('Error adding ICE candidate from queue: ', error);
          });
      });
      setIceCandidatesQueue(prevQueue => {
        const newQueue = {...prevQueue};
        delete newQueue[socketId];
        return newQueue;
      });
    }
  };

  const sendOffer = async () => {
    console.log('sendOffer');
    const pc = new RTCPeerConnection(configuration);
    peerConnections.current[socket.id] = pc;

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('candidate', {
          room,
          candidate: event.candidate,
          socketId: socket.id,
        });
      }
    };

    pc.ontrack = event => {
      setRemoteStreams(prevStreams => {
        console.log('sendOffer pc.ontrack setRemoteStreams');
        const streamExists = prevStreams.some(
          stream => stream.id === socket.id,
        );
        if (!streamExists) {
          return [...prevStreams, {id: socket.id, stream: event.streams[0]}];
        }
        return prevStreams;
      });
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', {room, offer});
  };

  const acceptCall = async () => {
    console.log('acceptCall');
    if (incomingOffers.length > 0) {
      const {offer, socketId} = incomingOffers[0];
      setIncomingOffers(prevOffers => prevOffers.slice(1));
      await handleOffer(offer, socketId);
    }
  };

  const endCall = () => {
    console.log('endCall');
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    setLocalStream(null);
    setRemoteStreams([]);
    setIsCallOngoing(false);

    socket.emit('end-call', room);

    for (const socketId in peerConnections.current) {
      peerConnections.current[socketId].close();
    }
    peerConnections.current = {};

    if (socket.connected) {
      socket.disconnect();
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEndCall = () => {
    console.log('handleEndCall');
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
          backgroundColor: '#050A0E',
          paddingHorizontal: 12,
          paddingVertical: 12,
        }}>
        {localStream ? (
          <RTCView
            objectFit={'cover'}
            style={{flex: 1, backgroundColor: '#050A0E'}}
            streamURL={localStream.toURL()}
          />
        ) : null}
        {remoteStreams.map(({id, stream}, index) => (
          <RTCView
            key={index}
            objectFit={'cover'}
            style={{
              flex: 1,
              backgroundColor: '#050A0E',
              marginTop: 8,
            }}
            streamURL={stream.toURL()}
          />
        ))}
        <View
          style={{
            marginVertical: 12,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}>
          {!isCallOngoing && incomingOffers.length === 0 && (
            <IconContainer
              backgroundColor={'green'}
              onPress={sendOffer}
              Icon={() => <CallAnswer height={26} width={26} fill="#FFF" />}
            />
          )}

          {isCallOngoing && (
            <IconContainer
              backgroundColor={'red'}
              onPress={endCall}
              Icon={() => <CallEnd height={26} width={26} fill="#FFF" />}
            />
          )}

          <IconContainer
            style={{borderWidth: 1.5, borderColor: '#2B3034'}}
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
            style={{borderWidth: 1.5, borderColor: '#2B3034'}}
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
            style={{borderWidth: 1.5, borderColor: '#2B3034'}}
            backgroundColor={'transparent'}
            onPress={switchCamera}
            Icon={() => <CameraSwitch height={24} width={24} fill="#FFF" />}
          />
        </View>
      </View>
    );
  };

  console.log(remoteStreams);
  return incomingOffers.length > 0 ? (
    <IncomingCallScreen />
  ) : (
    <WebrtcRoomScreen />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
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
    zIndex: 10,
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
});

export default GroupCall;
