import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {COLORS} from '../../configs/Colors';
import API from './../../configs/ApiService';
import {ApiEndPoints} from '../../configs/ApiEndPoints';
import StorageService from '../../configs/StorageService';
import Toast from 'react-native-simple-toast';
import {KEYS, STRINGS} from '../../configs/StringUtils';
import {SocketContext} from '../../context/SocketContext';
import {startLoading, stopLoading} from './../../redux/reducers/reducer';
import {useDispatch} from 'react-redux';
import {setUserData} from './../../redux/reducers/userSlice';

const Login = ({navigation}) => {
  // const [email, setEmail] = useState('dhruv.v@yopmail.com');
  const [email, setEmail] = useState('rushikesh.p@yopmail.com');
  const [password, setPassword] = useState('123456');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const {socket} = useContext(SocketContext); // Access the socket context
  const dispatch = useDispatch();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await StorageService.getData(KEYS.TOKEN);
      const userData = await StorageService.getData(KEYS.USER_DATA);
      if (token) {
        SocketConnect();
        dispatchUserData(JSON.parse(userData));
        navigation.navigate('UserList');
      }
    };
    checkLoginStatus();
  }, []);

  const dispatchUserData = userData => {
    console.log('dispatchUserData => ', userData);
    dispatch(
      setUserData({
        token: userData.token,
        userData: userData,
      }),
    );
    socket.current.emit('user_data', userData);
  };

  const SocketConnect = () => {
    if (socket.current) {
      socket.current.connect();
      console.log('Socket connected:', socket.current.connected);
    }
  };

  const handleLogin = () => {
    let valid = true;
    if (!email) {
      setEmailError(STRINGS.EMAIL_REQUIRED);
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(STRINGS.ENTER_VALID_EMAIL);
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError(STRINGS.PASSWORD_REQUIRED);
      valid = false;
    } else {
      setPasswordError('');
    }

    if (valid) {
      // Perform actual login logic here (e.g., API call, authentication)
      console.log('Logging in with:', {email, password});
      dispatch(startLoading());
      API.postRequest(
        ApiEndPoints.SIGNIN,
        {email, password},
        {},
        async (data, status) => {
          dispatch(stopLoading());
          console.log('Login successful:', data);
          const resData = data.data;
          try {
            await StorageService.setData(KEYS.TOKEN, resData.token);
            await StorageService.setData(KEYS.ID, resData._id);
            await StorageService.setData(
              KEYS.PROFILE_IMAGE,
              resData.profileImage,
            );
            await StorageService.setData(KEYS.FULL_NAME, resData.fullName);
            await StorageService.setData(KEYS.EMAIL, resData.email);
            await StorageService.setData1(KEYS.USER_DATA, resData);
            SocketConnect();
            dispatchUserData(resData);
            navigation.navigate('UserList');
          } catch (error) {
            console.error('Error storing token', error);
          }
        },
        error => {
          dispatch(stopLoading());
          Toast.show(error.response.data.message, Toast.LONG);
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
          {passwordError ? (
            <Text style={styles.error}>{passwordError}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Signup');
          }}
          style={styles.btn}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 10,
  },
  headerText: {
    fontSize: 32,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  form: {
    width: '80%',
  },
  formGroup: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    marginTop: 5,
  },
  btn: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  inputHeader: {
    color: COLORS.PRIMARY,
  },
});

export default Login;
