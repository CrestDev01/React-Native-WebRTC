import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CallAnswer from './../../asset/CallAnswer';
import CallEnd from './../../asset/CallEnd';
import { SocketContext } from '../../context/SocketContext';
import { styles } from './styles';

const IncomingCallScreen = ({ navigation }) => {
  const { socket, incomingOfferFrom } = useContext(SocketContext); // Access the socket context for incoming call data

  // Function to accept the incoming call
  const acceptOffer = () => {
    navigation.navigate('P2P'); // Navigate to the P2P screen to start the call
  };

  // Function to reject the incoming call
  const rejectOffer = () => {
    socket.current.emit('end-call'); // Emit an event to end the call
    navigation.navigate('UserList'); // Navigate back to the user list screen
  };

  return (
    <View style={styles.container}>
      {/* Display the caller's name or show 'Unknown caller' if not available */}
      <View style={styles.callerInfoContainer}>
        <Text style={styles.callerText}>
          {incomingOfferFrom && incomingOfferFrom.fullName
            ? `${incomingOfferFrom.fullName} is calling...`
            : 'Unknown caller is calling...'}
        </Text>
      </View>

      {/* Accept call button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={acceptOffer} style={styles.acceptButton}>
          <CallAnswer height={28} fill={'#fff'} />
        </TouchableOpacity>
      </View>

      {/* Reject call button */}
      <View style={[styles.buttonContainer, { marginTop: 20 }]}>
        <TouchableOpacity onPress={rejectOffer} style={styles.rejectButton}>
          <CallEnd height={26} width={26} fill="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};



export default IncomingCallScreen;
