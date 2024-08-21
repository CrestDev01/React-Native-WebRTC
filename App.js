import React, { useContext } from 'react';
import { Button, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector } from 'react-redux';
import store from './redux/store';
import Loader from './components/Loader';
import IncomingCallScreen from './src/IncomingCallScreen/IncomingCallScreen';
import { SocketContext, SocketProvider } from './context/SocketContext';
import P2P from './src/IncommingAndConnected/IncommingAndConnected';
import Login from './src/Login/Login';
import Signup from './src/Signup/Signup';
import UserList from './src/UserList/UserList';
import OutgoingAndConnected from './src/OutgoingAndConnected/OutgoingAndConnected';
import StorageService from './configs/StorageService';
import { COLORS } from './configs/Colors';

const Stack = createNativeStackNavigator();

/**
 * Main content component for the app, manages navigation and conditional rendering.
 */
const AppContent = () => {
  // Retrieve the loading state from the Redux store
  const loading = useSelector(state => state.loader.loading);

  // Retrieve socket-related data from the SocketContext
  const { socket, isConnected, incomingOffer, incomingOfferFrom } =
    useContext(SocketContext);

  // Get navigation object for navigating between screens
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ title: 'Login' }}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{ title: 'Signup' }}
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
          })}
        />
        <Stack.Screen
          name="OutgoingAndConnected"
          component={OutgoingAndConnected}
          options={{ title: 'User List' }}
        />
        <Stack.Screen
          name="P2P"
          component={P2P}
          options={{ title: 'P2P' }}
        />
      </Stack.Navigator>

      {/* Display loader if loading state is true */}
      {loading && <Loader />}

      {/* Display IncomingCallScreen if there is an incoming offer */}
      {incomingOffer && <IncomingCallScreen navigation={navigation} />}
    </View>
  );
};

/**
 * Main App component, wraps the content with necessary providers.
 */
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
