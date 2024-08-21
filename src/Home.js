import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button 
          title="Peer To Peer" 
          onPress={() => navigation.navigate('ConnectedUsers')} 
        />
      </View>
      {/* <View style={styles.buttonContainer}>
        <Button title="Room" onPress={() => navigation.navigate('EnterRoom')} />
      </View> */}
      <View style={styles.buttonContainer}>
        <Button 
          title="Group Call" 
          onPress={() => navigation.navigate('GroupCall')} 
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
  },
  buttonContainer: {
    marginBottom: 20, // Add space between buttons
    width: '80%', // Optional: Adjust width if needed
  },
});

export default Home;
