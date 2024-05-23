import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ScreenContent } from '~/components/ScreenContent';
import { Text } from 'tamagui';

export default function MainTabScreen() {

  return (
    <>
      <Stack.Screen options={{ title: 'Home screen' }} />
      {/* <View style={styles.container}> */}
        {/* <ScreenContent path="app/(tabs)/index.tsx" title="Today's Tasks" /> */}
        <Text>MainTab</Text>
      {/* </View> */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
