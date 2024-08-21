import React, {useContext} from 'react';
import {Button, View} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider, useSelector} from 'react-redux';
import store from './redux/store';
import Loader from './components/Loader';
import IncomingCallScreen from './src/IncomingCallScreen/IncomingCallScreen';
import {SocketContext, SocketProvider} from './context/SocketContext';
import P2P from './src/IncommingAndConnected/IncommingAndConnected';
import Home from './src/Home';
import WebRTCComponent from './src/WebRTCComponent';
import GroupCall from './src/GroupCall';
import EnterRoom from './src/EnterRoom';
import ConnectedList from './src/ConnectedList';
import Login from './src/Login/Login';
import Signup from './src/Signup/Signup';
import UserList from './src/UserList/UserList';
import OutgoingAndConnected from './src/OutgoingAndConnected/OutgoingAndConnected';
import StorageService from './configs/StorageService';
import { COLORS } from './configs/Colors';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const loading = useSelector(state => state.loader.loading);
  const {socket, isConnected, incomingOffer, incomingOfferFrom} =
    useContext(SocketContext);
  const navigation = useNavigation(); // Get navigation object

  return (
    <View style={{flex: 1}}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{title: 'Login'}}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{title: 'Signup'}}
        />
        <Stack.Screen
          name="UserList"
          component={UserList}
          options={({ navigation }) => ({
            title: 'Contacts',
            headerTintColor: 'white',
            headerStyle: {
              backgroundColor: COLORS.PRIMARY
            },
            headerShown: true,
            headerBackVisible: false,
            // headerRight: () => (
            //   <Button
            //     onPress={async() => {
            //       // Add your button press logic here
            //       console.log('Button pressed');
            //       await StorageService.clearAllData();
            //       if (socket.current) {
            //         socket.current.disconnect();
            //       }
            //       // For example, navigate to another screen
            //       navigation.navigate('Login'); // Adjust 'AnotherScreen' as per your navigation setup
            //     }}
            //     title="Logout"
            //     color="#000"
            //   />
            // ),
          })}
        />
        <Stack.Screen
          name="OutgoingAndConnected"
          component={OutgoingAndConnected}
          options={{title: 'User List'}}
        />
        <Stack.Screen name="Home" component={Home} options={{title: 'Home'}} />
        <Stack.Screen
          name="ConnectedUsers"
          component={ConnectedList}
          options={{title: 'Connected Users'}}
        />
        <Stack.Screen name="P2P" component={P2P} options={{title: 'P2P'}} />
        <Stack.Screen
          name="Room"
          component={WebRTCComponent}
          options={{title: 'Room'}}
        />
        <Stack.Screen
          name="EnterRoom"
          component={EnterRoom}
          options={{title: 'Enter Room Name'}}
        />
        <Stack.Screen
          name="GroupCall"
          component={GroupCall}
          options={{title: 'GroupCall'}}
        />
      </Stack.Navigator>
      {loading && <Loader />}
      {incomingOffer && <IncomingCallScreen navigation={navigation} />}
    </View>
  );
};

const App = () => (
  <Provider store={store}>
    <SocketProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </SocketProvider>
  </Provider>
);

export default App;
