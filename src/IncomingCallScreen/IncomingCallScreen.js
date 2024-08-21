import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import CallAnswer from './../../asset/CallAnswer';
import {SocketContext} from '../../context/SocketContext';

const IncomingCallScreen = ({navigation}) => {
  const {socket, isConnected, incomingOffer, incomingOfferFrom} =
    useContext(SocketContext); // Access the socket context

  const acceptOffer = () => {
    navigation.navigate('P2P');
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
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
            textAlign: 'center',
          }}>
          {incomingOfferFrom && incomingOfferFrom.fullName
            ? `${incomingOfferFrom.fullName} is calling...`
            : 'Unknown caller is calling...'}
        </Text>
      </View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={acceptOffer}
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

export default IncomingCallScreen;
