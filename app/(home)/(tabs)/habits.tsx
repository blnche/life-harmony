import { Text } from "react-native";
import { Stack } from "expo-router";

export default function Habits() {
    return (
        <>
      <Stack.Screen options={{ title: 'Habits' }} />
      {/* <View style={styles.container}> */}
        {/* <ScreenContent path="app/(tabs)/index.tsx" title="Today's Tasks" /> */}
        <Text>Habits</Text>
      {/* </View> */}
    </>
    )
}