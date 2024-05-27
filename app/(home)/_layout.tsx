// import { Stack } from "tamagui";
import { Redirect, Slot, Stack } from "expo-router";
import { useAuth } from "~/providers/AuthProvider";

export default function HomeLayout() {

  const { user } = useAuth()

  if(!user) {
    return <Redirect href={'/(auth)/login'}/>
  }

    return(
      // <Stack />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'card' }} />
      </Stack>
    )
}