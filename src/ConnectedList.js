import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SocketContext } from '../context/SocketContext';

const ConnectedList = ({ navigation }) => {
  const [connectedClients, setConnectedClients] = useState([]);
  const socket = useContext(SocketContext);

  useEffect(() => {
    // Set up socket event listener for 'connected-clients'
    socket.current.on('connected-clients', (clientIds) => {
      // Filter out own socket ID (assuming socket.id is available)
      const filteredClients = clientIds.filter(clientId => clientId !== socket.id);
      setConnectedClients(filteredClients);
    });

    // Emit event to get connected clients
    socket.current.emit('get-connected-clients');

    // Clean up function to disconnect socket
    return () => {
    //   socket.disconnect();
    };
  }, []);

  // Function to handle client item click
  const handleClientClick = (clientId) => {
    console.log(`Clicked client ID: ${clientId}`);
    // Example navigation logic, adjust as per your app's navigation structure
    navigation.navigate('P2P', { targetUserId: clientId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connected Clients:</Text>
      <FlatList
        data={connectedClients}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleClientClick(item)} style={styles.itemContainer}>
            <Text style={styles.itemText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
    borderRadius: 5,
  },
  itemText: {
    fontSize: 16,
  },
});

export default ConnectedList;
