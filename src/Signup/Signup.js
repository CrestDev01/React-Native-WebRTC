import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../configs/Colors';
import { ApiEndPoints } from '../../configs/ApiEndPoints';
import API from '../../configs/ApiService';
import { STRINGS } from '../../configs/StringUtils';
import Toast from 'react-native-simple-toast';
import { styles } from './styles';

// Signup component
const Signup = ({ navigation }) => {
  // State variables for form inputs and error messages
  const [fullName, setFullName] = useState('Dhruv Patil');
  const [email, setEmail] = useState('dhruv.v@yopmail.com');
  const [password, setPassword] = useState('123456');
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Function to handle the signup process
  const handleSignup = () => {
    let valid = true;

    // Validate full name
    if (!fullName) {
      setFullNameError(STRINGS.FULLNAME_REQUIRED);
      valid = false;
    } else {
      setFullNameError('');
    }

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

    // If all validations pass, proceed with the signup process
    if (valid) {
      

      // API call for signup
      API.postRequest(
        ApiEndPoints.SIGNUP, // Replace with your actual signup endpoint
        { fullName, email, password },
        {},
        async (data, status) => {
          
          Toast.show(data.message, Toast.LONG);
          navigation.goBack(); // Navigate back after successful signup
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
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signupButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Signup;
