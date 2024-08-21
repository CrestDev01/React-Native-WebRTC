import React, {createContext, useEffect, useRef, useState} from 'react';
import io from 'socket.io-client';
import {ApiEndPoints} from '../configs/ApiEndPoints';

export const SocketContext = createContext();

export const SocketProvider = ({children}) => {
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [tmpOffer, setTmpOffer] = useState(null);
  const [incomingOfferFrom, setIncomingOfferFrom] = useState(null);

  useEffect(() => {
    socket.current = io.connect(ApiEndPoints.BASE_URL);

    const handleConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    const handleError = error => {
      // console.error('Socket connection error:', error);
      setIsConnected(false);
    };

    socket.current.on('connect', handleConnect);
    socket.current.on('disconnect', handleDisconnect);
    socket.current.on('connect_error', handleError);
    socket.current.on('connect_timeout', handleError);
    socket.current.on('offer', data => {
      const {offer, fromUser, toUser} = data;
      console.log('SocketContext Offer S => ', data);
      console.log('SocketContext Offer S offer=> ', offer);
      console.log('SocketContext Offer S fromUser=> ', fromUser);
      console.log('SocketContext Offer S toUser=> ', toUser);
      setIncomingOffer(offer);
      setTmpOffer(tmpOffer);
      setIncomingOfferFrom(fromUser);
    });
    return () => {
      if (socket.current) {
        socket.current.off('connect', handleConnect);
        socket.current.off('disconnect', handleDisconnect);
        socket.current.off('connect_error', handleError);
        socket.current.off('connect_timeout', handleError);
        socket.current.disconnect();
      }
    };
  }, []);

  const clearOnlyIncomingOffer = () => {
    setIncomingOffer(null);
  };

  const clearIncomingOffer = () => {
    setIncomingOffer(null);
    setIncomingOfferFrom(null); // Clear the incoming offer from user as well if necessary
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        incomingOffer,
        incomingOfferFrom,
        clearIncomingOffer,
      }}>
      {children}
    </SocketContext.Provider>
  );
};
