import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { TamaguiProvider } from 'tamagui';

import { RaidsProvider } from '@/contexts/raids-context';
import config from '../tamagui.config';

// Custom dark theme for navigation that matches Arc Raiders aesthetic
const ArcDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#00d4ff',
    background: '#0a0a0b',
    card: '#1a1a1c',
    text: '#e4e4e7',
    border: '#2a2a2e',
    notification: '#00d4ff',
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <RaidsProvider>
        <ThemeProvider value={ArcDarkTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </RaidsProvider>
    </TamaguiProvider>
  );
}
