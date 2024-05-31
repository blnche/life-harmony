import { Link, Tabs } from 'expo-router';
import { HeaderButton } from '../../../components/HeaderButton';
import { TabBarIcon } from '../../../components/TabBarIcon';
import { useAuth } from '~/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { supabase } from '~/utils/supabase';
import { Database } from '~/utils/supabase-types';

type Profile = Database['public']['Tables']['profiles']['Row']

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
        headerShown: false
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <TabBarIcon name="check" color={color} />,
          
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color }) => <TabBarIcon name="repeat" color={color} />,
        }}
      />
    </Tabs>
  );
}
