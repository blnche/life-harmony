import { Link, Tabs } from 'expo-router';

import { HeaderButton } from '../../../components/HeaderButton';
import { TabBarIcon } from '../../../components/TabBarIcon';

export default function TabLayout() {
  return (
    // <Tabs 
    //   screenOptions={{
    //       tabBarActiveTintColor: 'black',
    //   }}
    // />
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <TabBarIcon name="check" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color }) => <TabBarIcon name="repeat" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
