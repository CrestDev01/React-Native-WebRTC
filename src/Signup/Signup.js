import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {COLORS} from '../../configs/Colors';
import {ApiEndPoints} from '../../configs/ApiEndPoints';
import API from './../../configs/ApiService';
import {STRINGS} from '../../configs/StringUtils';
import Toast from 'react-native-simple-toast';

const Signup = ({navigation}) => {
  const [fullName, setFullName] = useState('Dhruv Patil');
  const [email, setEmail] = useState('dhruv.v@yopmail.com');
  const [password, setPassword] = useState('123456');
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSignup = () => {
    let valid = true;

    if (!fullName) {
      setFullNameError(STRINGS.FULLNAME_REQUIRED);
      valid = false;
    } else {
      setFullNameError('');
    }

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
      // Perform actual signup logic here (e.g., API call, authentication)
      console.log('Signing up with:', {fullName, email, password});
      API.postRequest(
        ApiEndPoints.SIGNUP, // Replace with your actual login endpoint
        {fullName, email, password},
        {},
        async (data, status) => {
          console.log('Signup successful : ', data);
          // const resData = data.data;
          Toast.show(data.message, Toast.LONG);
          navigation.goBack();
        },
        error => {
          Toast.show(error.response.data.message, Toast.LONG);
        },
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Sign Up</Text>
      </View>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.inputHeader}>Full Name:</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
          />
          {fullNameError ? (
            <Text style={styles.error}>{fullNameError}</Text>
          ) : null}
        </View>
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
        <TouchableOpacity style={styles.btn} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Signup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={()=>{navigation.navigate('Login');}}>
          <Text style={styles.signupButtonText}>Log In</Text>
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
    fontSize: 24,
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
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  inputHeader: {
    color: COLORS.PRIMARY,
  },
});

export default Signup;
