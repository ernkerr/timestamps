import {
    Inter_400Regular,
    Inter_700Bold
} from '@expo-google-fonts/inter';
import {
    Lato_400Regular,
    Lato_700Bold
} from '@expo-google-fonts/lato';
import {
    Montserrat_400Regular,
    Montserrat_700Bold
} from '@expo-google-fonts/montserrat';
import {
    Oswald_400Regular,
    Oswald_700Bold
} from '@expo-google-fonts/oswald';
import {
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold
} from '@expo-google-fonts/playfair-display';
import {
    Roboto_400Regular,
    Roboto_700Bold
} from '@expo-google-fonts/roboto';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [loaded, error] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Bold': Roboto_700Bold,
    'Oswald-Regular': Oswald_400Regular,
    'Oswald-Bold': Oswald_700Bold,
    'Lato-Regular': Lato_400Regular,
    'Lato-Bold': Lato_700Bold,
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-Bold': Montserrat_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
