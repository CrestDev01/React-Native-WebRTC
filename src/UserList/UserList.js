import React, { useEffect, useCallback, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import IconFE from 'react-native-vector-icons/FontAwesome';
import IconEE from 'react-native-vector-icons/Entypo';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './styles';
import API from './../../configs/ApiService';
import { ApiEndPoints } from '../../configs/ApiEndPoints';
import Toast from 'react-native-simple-toast';
import CallAnswer from './../../asset/CallAnswer';
import { useDispatch, useSelector } from 'react-redux';
import { startLoading, stopLoading } from './../../redux/reducers/reducer';
import StorageService from '../../configs/StorageService';
import { KEYS } from '../../configs/StringUtils';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../configs/Colors';
import { SocketContext } from '../../context/SocketContext';

const UserList = ({ navigation }) => {
  const [list, setList] = useState([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const { socket } = useContext(SocketContext);

  // Load user data and fetch the user list when the screen is focused
  useFocusEffect(
    useCallback(() => {
      checkLoginStatus();
      getUserList();

      // Handle hardware back button press
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        
        return true;
      });

      return () => backHandler.remove();
    }, [])
  );

  // Check the login status and load user details from storage
  const checkLoginStatus = async () => {
    const token = await StorageService.getData(KEYS.TOKEN);
    const userData = JSON.parse(await StorageService.getData(KEYS.USER_DATA));
    setName(userData.fullName);
    setEmail(userData.email);
    
  };

  // Fetch the user list from the API
  const getUserList = () => {
    dispatch(startLoading());
    API.getRequest(
      ApiEndPoints.USER_LIST,
      {},
      {},
      (data) => {
        dispatch(stopLoading());
        setList(data.data);
        
      },
      (error) => {
        dispatch(stopLoading());
        Toast.show(error.response.data.message, Toast.LONG);
      }
    );
  };

  // Render each user in the list
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <IconFE name="user-circle" size={48} color={COLORS.SECONDARY} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.fullName}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>

      {/* Button to navigate to the outgoing and connected screen */}
      <TouchableOpacity
        onPress={() => navigation.navigate('OutgoingAndConnected', { toUser: item })}
        style={styles.callIcon}
      >
        <CallAnswer height={28} fill={'#fff'} />
      </TouchableOpacity>
    </View>
  );

  // Logout button functionality
  const handleLogout = async () => {
    
    await StorageService.clearAllData();
    if (socket?.current) {
      socket.current.disconnect();
    }
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Display the list of users */}
      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={item => item._id}
      />

      {/* User info and logout button */}
      <View style={styles.userInfoContainer}>
        <View>
          <Text style={styles.userName}>
            <IconEE name="user" size={14} color="white" /> {name}
          </Text>
          <Text style={styles.userEmail}>
            <IconMC name="email" size={14} color="white" /> {email}
          </Text>
        </View>
        <Icon.Button name="logout" onPress={handleLogout} color={COLORS.PRIMARY} backgroundColor="white">
          Logout
        </Icon.Button>
      </View>
    </View>
  );
};

export default UserList;
