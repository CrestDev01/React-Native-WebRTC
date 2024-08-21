import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {

  static async setData(key, value) {
    console.log('setData => key', key);
    console.log('setData => value', value);
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting data in AsyncStorage', error);
    }
  }

  static async getData(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // value previously stored
        console.log('getData => key', key);
        console.log('getData => value', value);
        return value;
      }
    } catch (error) {
      console.error('Error getting data from AsyncStorage', error);
    }
    return null;
  }

  static async removeData(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data from AsyncStorage', error);
    }
  }

  static async setData1(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error setting data in AsyncStorage', error);
    }
  }

  static async getData1(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting data from AsyncStorage', error);
      return null;
    }
  }

  static async removeData1(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data from AsyncStorage', error);
    }
  }

  static async clearAllData() {
    try {
      await AsyncStorage.clear();
      console.log('All data cleared from AsyncStorage');
    } catch (error) {
      console.error('Error clearing data from AsyncStorage', error);
    }
  }

}

export default StorageService;
