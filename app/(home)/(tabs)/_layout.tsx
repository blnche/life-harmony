import { Link, Tabs } from 'expo-router';

import { HeaderButton } from '../../../components/HeaderButton';
import { TabBarIcon } from '../../../components/TabBarIcon';
import { useAuth } from '~/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { supabase } from '~/utils/supabase';

export default function TabLayout() {
  
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)

      if(error) console.error(error.message)
        else{
      setUserProfile(profiles[0])}
  }

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
          headerLeft:  () => (
            <Text>{userProfile?.username}</Text>
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
