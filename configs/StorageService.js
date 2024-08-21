import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {

  /**
   * Stores a string value in AsyncStorage with the specified key.
   * @param {string} key - The key to store the value under.
   * @param {string} value - The value to store.
   */
  static async setData(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting data in AsyncStorage', error);
    }
  }

  /**
   * Retrieves a string value from AsyncStorage by key.
   * @param {string} key - The key to retrieve the value for.
   * @returns {string|null} The retrieved value or null if not found.
   */
  static async getData(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null ? value : null;
    } catch (error) {
      console.error('Error getting data from AsyncStorage', error);
      return null;
    }
  }

  /**
   * Removes a value from AsyncStorage by key.
   * @param {string} key - The key to remove the value for.
   */
  static async removeData(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data from AsyncStorage', error);
    }
  }

  /**
   * Stores an object or array in AsyncStorage after serializing it to JSON.
   * @param {string} key - The key to store the value under.
   * @param {object|array} value - The object or array to store.
   */
  static async setData1(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error setting data in AsyncStorage', error);
    }
  }

  /**
   * Retrieves an object or array from AsyncStorage by key and parses it from JSON.
   * @param {string} key - The key to retrieve the value for.
   * @returns {object|array|null} The retrieved object or array, or null if not found.
   */
  static async getData1(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting data from AsyncStorage', error);
      return null;
    }
  }

  /**
   * Removes an object or array from AsyncStorage by key.
   * @param {string} key - The key to remove the value for.
   */
  static async removeData1(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data from AsyncStorage', error);
    }
  }

  /**
   * Clears all data from AsyncStorage.
   */
  static async clearAllData() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing data from AsyncStorage', error);
    }
  }
}

export default StorageService;
