import React, {useState} from 'react';
import {View, Button, StyleSheet, TextInput} from 'react-native';

const EnterRoom = ({navigation}) => {
  const [room, setRoom] = useState('');
  console.log('EnterRoom => ', room);

  const joinRoom = () => {
    console.log('Joining room:', room);
    navigation.navigate('Room', {room});
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Room ID"
        value={room}
        onChangeText={text => setRoom(text)}
        style={styles.input}
      />
      <Button title="Join Room" onPress={joinRoom} />
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '80%',
    padding: 5,
  },
});

export default EnterRoom;
