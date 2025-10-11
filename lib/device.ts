import { requireOptionalNativeModule } from "expo-modules-core";

type DeviceModule = {
  isDevice?: boolean;
  deviceName?: string | null;
  modelName?: string | null;
};

let moduleCache: DeviceModule | null | undefined = undefined;
let warned = false;

const resolveDeviceModule = (): DeviceModule | null => {
  if (moduleCache !== undefined) {
    return moduleCache;
  }

  try {
    moduleCache = (requireOptionalNativeModule("ExpoDevice") as DeviceModule | null) ?? null;
  } catch (error) {
    moduleCache = null;
    if (!warned) {
      console.warn(
        "[device] ExpoDevice native module unavailable, continuing without device info.",
        error
      );
      warned = true;
    }
  }

  if (!moduleCache && !warned) {
    console.warn("[device] ExpoDevice native module unavailable, continuing without device info.");
    warned = true;
  }

  return moduleCache;
};

export const getDeviceModule = (): DeviceModule | null => resolveDeviceModule();

export const isPhysicalDevice = (): boolean => {
  return resolveDeviceModule()?.isDevice ?? true;
};

export const getDeviceName = (): string | null => {
  return resolveDeviceModule()?.deviceName ?? null;
};

export const getDeviceModelName = (): string | null => {
  return resolveDeviceModule()?.modelName ?? null;
};
