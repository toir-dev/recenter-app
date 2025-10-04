import '../nativewind.css';
import 'react-native-gesture-handler';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { setAnalyticsOptIn } from '@/lib/analytics';
import '@/lib/i18n';
import { runMigrations } from '@/src/db/sqlite';
import { useAuth } from '@/src/state';
import { applySessionFromUrl } from '@/src/state/useAuth';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const authStatus = useAuth((state) => state.status);
  const initializeAuth = useAuth((state) => state.initialize);
  const initialized = useAuth((state) => state.initialized);
  const analyticsOptIn = useAuth((state) => state.consents.analytics);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!initialized) {
      return;
    }
    setAnalyticsOptIn(analyticsOptIn).catch((err) => console.warn('[analytics] opt-in failed', err));
  }, [analyticsOptIn, initialized]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    runMigrations().catch((err) => console.warn('[sqlite] Failed to run migrations', err));
  }, []);

  useEffect(() => {
    const handleInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        await applySessionFromUrl(url);
      }
    };

    handleInitialUrl();

    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url) {
        applySessionFromUrl(event.url).catch((err) => console.warn('[auth] handle url failed', err));
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded || authStatus === 'loading') {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const status = useAuth((state) => state.status);
  const needsOnboarding = useAuth((state) => state.needsOnboarding);
  const initialized = useAuth((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (status === 'authenticated') {
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
      return;
    }

    if (!inAuthGroup) {
      router.replace(needsOnboarding ? '/onboarding' : '/sign-in');
    }
  }, [initialized, needsOnboarding, router, segments, status]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="sos" options={{ title: 'SOS' }} />
            <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}




