import React, {useEffect, useCallback, useState, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  BackHandler,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import IconFE from 'react-native-vector-icons/FontAwesome';
import IconEE from 'react-native-vector-icons/Entypo';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from './styles';
import API from './../../configs/ApiService';
import {ApiEndPoints} from '../../configs/ApiEndPoints';
import Toast from 'react-native-simple-toast';
import CallAnswer from './../../asset/CallAnswer';
import {useDispatch, useSelector} from 'react-redux';
import {startLoading, stopLoading} from './../../redux/reducers/reducer';
import StorageService from '../../configs/StorageService';
import {KEYS} from '../../configs/StringUtils';
import {useFocusEffect} from '@react-navigation/native';
import { COLORS } from '../../configs/Colors';
import { SocketContext } from '../../context/SocketContext';

const UserList = ({navigation}) => {
  const [list, setList] = useState([]);
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const {socket, isConnected, incomingOffer, incomingOfferFrom} =
    useContext(SocketContext);

  useFocusEffect(
    useCallback(() => {
      checkLoginStatus();
      getUserList();
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          console.log('hardwareBackPress');
        },
      );
      return () => backHandler.remove();
    }, []),
  );

  const checkLoginStatus = async () => {
    const token = await StorageService.getData(KEYS.TOKEN);
    console.log('checkLoginStatus  token___', token);
    var userData = await StorageService.getData(KEYS.USER_DATA);
    userData = JSON.parse(userData);
    setName(userData.fullName);
    setEmail(userData.email);
    console.log('checkLoginStatus  userData___', userData);
  };

  const getUserList = () => {
    dispatch(startLoading());
    API.getRequest(
      ApiEndPoints.USER_LIST,
      {},
      {},
      async (data, status) => {
        dispatch(stopLoading());
        console.log('getUserList successful : ', data);
        const resData = data.data;
        setList(resData);
      },
      error => {
        dispatch(stopLoading());
        Toast.show(error.response.data.message, Toast.LONG);
      },
    );
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        // Handle navigation or any action on user press
        console.log('User pressed:', item.fullName);
      }}>
      <IconFE name="user-circle" size={48} color={COLORS.SECONDARY} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.fullName}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>

      {/* New TouchableOpacity for navigation */}
      <TouchableOpacity
        onPress={() => {
          // socket.current.emit('offer', {offer, userData, item});
          navigation.navigate('OutgoingAndConnected', {toUser: item});
        }}
        style={styles.callIcon}>
        <CallAnswer height={28} fill={'#fff'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={item => item._id}
      />
 <View style={{ backgroundColor: COLORS.PRIMARY, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, paddingHorizontal:15 }}>
      <View>
        <Text style={{ fontSize: 14, fontWeight:"900",  color: 'white' }}>
        <IconEE name="user" size={14} color={"white"} /> {name}
        </Text>
        <Text style={{ fontSize: 14, color: 'white' }}>
        <IconMC name="email" size={14} color={"white"} /> {email}
        </Text>
      </View>
   
      <Icon.Button name="logout" onPress={async ()=>{
        console.log('Button pressed');
        await StorageService.clearAllData();
        if (socket.current) {
          socket.current.disconnect();
        }
        // For example, navigate to another screen
        navigation.navigate('Login');
          
     }} color={COLORS.PRIMARY} backgroundColor={"white"}>
   Logout
  </Icon.Button>
   
    </View>
    </View>
  );
};

export default UserList;
