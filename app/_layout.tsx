import { useFonts } from 'expo-font';
import { Slot, SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { TamaguiProvider, Theme, View } from 'tamagui';

import config from '../tamagui.config';
import AuthProvider from '~/providers/AuthProvider';
import UserProfileProvider from '~/providers/UserProfileProvider';
import TasksProvider from '~/providers/TasksProvider';
import * as Notifications from 'expo-notifications';


SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
  }),
});

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(home)',
};

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <TamaguiProvider config={config}>
      <AuthProvider>
          <UserProfileProvider>
            <TasksProvider>
              <Theme name='light'>
                <Slot />
              </Theme>
            </TasksProvider>
          </UserProfileProvider>
      </AuthProvider>
    </TamaguiProvider>
  );
}
