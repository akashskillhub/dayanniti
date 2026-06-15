import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const memoryStore = {};

const SafeStorage = {
  getItem: async (key) => {
    try {
      // Use SecureStore for native platforms
      if (Platform.OS !== 'web') {
        const secureValue = await SecureStore.getItemAsync(key);
        if (secureValue !== null) return secureValue;
      }
      // Fallback to AsyncStorage (for compatibility)
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.warn(`[SafeStorage] Falling back to memory for getItem("${key}"):`, error.message);
      return memoryStore[key] || null;
    }
  },

  setItem: async (key, value) => {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(key, value);
        return;
      }
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn(`[SafeStorage] Falling back to memory for setItem("${key}"):`, error.message);
      memoryStore[key] = value;
    }
  },

  removeItem: async (key) => {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(key);
        return;
      }
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`[SafeStorage] Falling back to memory for removeItem("${key}"):`, error.message);
      delete memoryStore[key];
    }
  },

  clear: async () => {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        return;
      }
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
        return;
      }
      
      await AsyncStorage.clear();
    } catch (error) {
      console.warn('[SafeStorage] Falling back to memory for clear():', error.message);
      for (const key in memoryStore) {
        delete memoryStore[key];
      }
    }
  },
};

export default SafeStorage;
