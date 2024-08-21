import React, { useEffect, useRef, useState, useContext } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { RTCPeerConnection, RTCView, mediaDevices } from 'react-native-webrtc';
import { SocketContext } from '../context/SocketContext';

const VideoCallScreen = () => {
  const socket = useContext(SocketContext);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const peerConnections = useRef({});

  useEffect(() => {
    console.log("Emergency")
    const initialize = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setLocalStream(stream);

        socket.emit('join-room', 'ROOM_ID'); // Replace 'ROOM_ID' with your room identifier

        socket.on('user-joined', userId => {
          console.log(`User joined: ${userId}`);
          createPeerConnection(userId, stream);
        });

        socket.on('user-left', userId => {
          console.log(`User left: ${userId}`);
          closePeerConnection(userId);
        });

        socket.on('offer', ({ userId, description }) => {
          console.log(`Received offer from ${userId}`);
          handleOffer(userId, description, stream);
        });

        socket.on('answer', ({ userId, description }) => {
          console.log(`Received answer from ${userId}`);
          handleAnswer(userId, description);
        });

        socket.on('ice-candidate', ({ userId, candidate }) => {
          console.log(`Received ICE candidate from ${userId}`);
          handleNewICECandidate(userId, candidate);
        });
      } catch (error) {
        console.error('Error during initialization', error);
      }
    };

    initialize();

    return () => {
      socket.disconnect();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleTrack = event => {
    console.log('Track event received', event);
    const stream = event.streams[0];
    setRemoteStreams(prevStreams => {
      const streamExists = prevStreams.some(
        remoteStream => remoteStream.userId === stream.id
      );
      if (!streamExists) {
        return [...prevStreams, { userId: stream.id, stream }];
      }
      return prevStreams;
    });
  };

  const createPeerConnection = (userId, stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peer.onicecandidate = event => {
      if (event.candidate) {
        console.log('Sending ICE candidate', event.candidate);
        socket.emit('ice-candidate', { userId, candidate: event.candidate });
      }
    };

    peer.ontrack = handleTrack; // Use ontrack event to handle received tracks

    stream.getTracks().forEach(track => {
      console.log(`Adding track: ${track.kind}`);
      peer.addTrack(track, stream); // Add each track to the peer connection
    });

    peerConnections.current[userId] = peer;
  };

  const closePeerConnection = userId => {
    if (peerConnections.current[userId]) {
      peerConnections.current[userId].close();
      delete peerConnections.current[userId];
    }
    setRemoteStreams(prevStreams =>
      prevStreams.filter(stream => stream.userId !== userId),
    );
  };

  const handleOffer = async (userId, description, stream) => {
    const peer = createPeerConnection(userId, stream);
    await peer.setRemoteDescription(description);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit('answer', { userId, description: peer.localDescription });
  };

  const handleAnswer = (userId, description) => {
    peerConnections.current[userId].setRemoteDescription(description);
  };

  const handleNewICECandidate = (userId, candidate) => {
    peerConnections.current[userId].addIceCandidate(
      new RTCIceCandidate(candidate),
    );
  };

  console.log(remoteStreams);

  return (
    <View style={styles.container}>
      <View style={styles.videosContainer}>
        <View style={styles.localVideoContainer}>
          {localStream && (
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.localVideo}
            />
          )}
        </View>
        {remoteStreams.map(({ userId, stream }) => (
          <View key={userId} style={styles.remoteVideoContainer}>
            <RTCView streamURL={stream.toURL()} style={styles.remoteVideo} />
          </View>
        ))}
      </View>
      <Button title="Leave Call" onPress={() => socket.disconnect()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  localVideoContainer: {
    width: '40%',
    aspectRatio: 1,
    margin: 10,
  },
  remoteVideoContainer: {
    width: '40%',
    aspectRatio: 1,
    margin: 10,
  },
  localVideo: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
  },
});

export default VideoCallScreen;
