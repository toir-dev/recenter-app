import * as SecureStore from 'expo-secure-store';

const getItem = async (key: string) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn(`[secureStore] Failed to read key "${key}":`, error);
    return null;
  }
};

const setItem = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.warn(`[secureStore] Failed to write key "${key}":`, error);
  }
};

const removeItem = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn(`[secureStore] Failed to delete key "${key}":`, error);
  }
};

export const secureStore = {
  getItem,
  setItem,
  removeItem,
};

export default secureStore;
