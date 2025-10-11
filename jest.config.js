const config = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:react-native|react-native-css-interop|@react-native|@expo|expo(nent)?|@expo/vector-icons|expo-router|@shopify/flash-list|@supabase|ky|zustand|immer|react-hook-form|posthog-react-native|i18next|react-i18next|expo-.*)/)',
  ],
};

module.exports = config;
