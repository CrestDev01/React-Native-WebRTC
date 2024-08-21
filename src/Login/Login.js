import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../configs/Colors';
import API from './../../configs/ApiService';
import { ApiEndPoints } from '../../configs/ApiEndPoints';
import StorageService from '../../configs/StorageService';
import Toast from 'react-native-simple-toast';
import { KEYS, STRINGS } from '../../configs/StringUtils';
import { SocketContext } from '../../context/SocketContext';
import { startLoading, stopLoading } from './../../redux/reducers/reducer';
import { useDispatch } from 'react-redux';
import { setUserData } from './../../redux/reducers/userSlice';
import { styles } from './styles';

// Login component
const Login = ({ navigation }) => {
  // State variables for form inputs and error messages
  const [email, setEmail] = useState('rushikesh.p@yopmail.com'); // Replace with default value if needed
  const [password, setPassword] = useState('123456');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Access the socket context
  const { socket } = useContext(SocketContext); 
  const dispatch = useDispatch();

  // Effect hook to check login status on component mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await StorageService.getData(KEYS.TOKEN);
      const userData = await StorageService.getData(KEYS.USER_DATA);
      if (token) {
        SocketConnect(); // Establish socket connection
        dispatchUserData(JSON.parse(userData)); // Dispatch user data to Redux store
        navigation.navigate('UserList'); // Navigate to UserList if logged in
      }
    };
    checkLoginStatus();
  }, []);

  // Function to dispatch user data to Redux store and emit to socket
  const dispatchUserData = (userData) => {
    
    dispatch(
      setUserData({
        token: userData.token,
        userData: userData,
      }),
    );
    socket.current.emit('user_data', userData);
  };

  // Function to establish socket connection
  const SocketConnect = () => {
    if (socket.current) {
      socket.current.connect();
      
    }
  };

  // Function to handle the login process
  const handleLogin = () => {
    let valid = true;

    // Validate email
    if (!email) {
      setEmailError(STRINGS.EMAIL_REQUIRED);
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(STRINGS.ENTER_VALID_EMAIL);
      valid = false;
    } else {
      setEmailError('');
    }

    // Validate password
    if (!password) {
      setPasswordError(STRINGS.PASSWORD_REQUIRED);
      valid = false;
    } else {
      setPasswordError('');
    }

    // If all validations pass, proceed with the login process
    if (valid) {
      

      dispatch(startLoading()); // Start loading indicator

      // API call for login
      API.postRequest(
        ApiEndPoints.SIGNIN, // Replace with your actual signin endpoint
        { email, password },
        {},
        async (data, status) => {
          dispatch(stopLoading()); // Stop loading indicator
          
          const resData = data.data;
          try {
            // Store user data locally
            await StorageService.setData(KEYS.TOKEN, resData.token);
            await StorageService.setData(KEYS.ID, resData._id);
            await StorageService.setData(KEYS.PROFILE_IMAGE, resData.profileImage);
            await StorageService.setData(KEYS.FULL_NAME, resData.fullName);
            await StorageService.setData(KEYS.EMAIL, resData.email);
            await StorageService.setData1(KEYS.USER_DATA, resData);

            SocketConnect(); // Reconnect socket
            dispatchUserData(resData); // Dispatch user data
            navigation.navigate('UserList'); // Navigate to UserList on success
          } catch (error) {
            
          }
        },
        (error) => {
          dispatch(stopLoading()); // Stop loading indicator
          Toast.show(error.response.data.message, Toast.LONG); // Show error message
        },
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Log In</Text>
      </View>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.inputHeader}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
          />
          {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.inputHeader}>Password:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
          />
          {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
        </View>
        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={styles.btn}
        >
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
