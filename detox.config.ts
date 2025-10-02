const config = {
  testRunner: {
    $0: 'jest',
    args: {
      config: 'e2e/jest.config.ts',
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'bin/ios/Recenter.app',
      build: 'expo run:ios --configuration Debug',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'bin/android/debug/app-debug.apk',
      build: 'expo run:android --variant debug',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'pixel_7',
      },
    },
  },
  configurations: {
    'ios.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
} as const;

export default config;
