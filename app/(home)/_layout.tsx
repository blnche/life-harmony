// import { Stack } from "tamagui";
import { Redirect, Slot, Stack, Link } from "expo-router";
import { HeaderButton } from "~/components/HeaderButton";
import { useAuth } from "~/providers/AuthProvider";
import { Text } from "react-native";
import { useUserProfile } from "~/providers/UserProfileProvider";

export default function HomeLayout() {

  const { user } = useAuth()
  const { userProfile } = useUserProfile()

  if(!user) {
    return <Redirect href={'/(auth)/login'}/>
  }
console.log(userProfile)
  return(
    <Stack>
      <Stack.Screen name="(tabs)" options={{ 
        headerShown: false, 
        title:'Today', 
        headerRight: () => (
          <Link href="/settings" asChild>
            <HeaderButton />
          </Link>
        ),
        headerLeft:  () => (
          <Text>{userProfile?.username}</Text>
        )
      }} />
      <Stack.Screen name="settings" options={{ presentation: 'card' }} />
    </Stack>
  )
}