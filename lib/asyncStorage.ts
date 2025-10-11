import type { AsyncStorageStatic } from "@react-native-async-storage/async-storage";
import { NativeModules, TurboModuleRegistry } from "react-native";

type AsyncStorageBasic = Pick<AsyncStorageStatic, "getItem" | "setItem" | "removeItem">;
type AsyncStorageModule = AsyncStorageBasic & {
  flush?: () => Promise<void>;
};

const memoryStore = new Map<string, string>();

const memoryAsyncStorage: AsyncStorageModule = {
  async getItem(key) {
    const value = memoryStore.get(key);
    return value !== undefined ? value : null;
  },
  async setItem(key, value) {
    memoryStore.set(key, value);
  },
  async removeItem(key) {
    memoryStore.delete(key);
  },
  async flush() {
    // no-op for memory storage
  },
};

let cachedModule: AsyncStorageModule | null = null;
let loadTask: Promise<AsyncStorageModule> | null = null;
let warned = false;
let nativeAvailability: boolean | null = null;

function resolveNativeModule() {
  return (
    TurboModuleRegistry?.get?.("PlatformLocalStorage") ??
    TurboModuleRegistry?.get?.("RNC_AsyncSQLiteDBStorage") ??
    TurboModuleRegistry?.get?.("RNCAsyncStorage") ??
    NativeModules?.PlatformLocalStorage ??
    NativeModules?.RNC_AsyncSQLiteDBStorage ??
    NativeModules?.RNCAsyncStorage ??
    null
  );
}

const hasNativeModule = (): boolean => {
  if (nativeAvailability !== null) {
    return nativeAvailability;
  }
  nativeAvailability = resolveNativeModule() != null;
  return nativeAvailability;
};

const loadNativeAsyncStorage = async (): Promise<AsyncStorageModule> => {
  if (!hasNativeModule()) {
    if (!warned) {
      console.warn(
        "[storage] AsyncStorage native module unavailable, using in-memory storage."
      );
      warned = true;
    }
    return memoryAsyncStorage;
  }

  try {
    const mod = (await import("@react-native-async-storage/async-storage")).default;
    
    if (mod && typeof mod.getItem === 'function') {
      return mod as AsyncStorageModule;
    }
    
    throw new Error("AsyncStorage module loaded but invalid interface");
  } catch (error) {
    if (!warned) {
      console.warn(
        "[storage] Failed to load AsyncStorage, using in-memory storage:",
        error instanceof Error ? error.message : String(error)
      );
      warned = true;
    }
    return memoryAsyncStorage;
  }
};

export const getAsyncStorage = async (): Promise<AsyncStorageModule> => {
  // Return cached module if available
  if (cachedModule) {
    return cachedModule;
  }

  // If load is in progress, wait for it
  if (loadTask) {
    return loadTask;
  }

  // Start new load task
  loadTask = loadNativeAsyncStorage()
    .then((module) => {
      cachedModule = module; // ✅ Cache the result
      return module;
    })
    .catch((error) => {
      // Fallback to memory storage on any error
      console.error("[storage] Critical error loading AsyncStorage:", error);
      cachedModule = memoryAsyncStorage;
      return memoryAsyncStorage;
    })
    .finally(() => {
      loadTask = null; // ✅ Clear task after caching
    });

  return loadTask;
};