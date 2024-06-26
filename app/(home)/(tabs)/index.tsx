import React from 'react';
import { StyleSheet, Button, View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Database } from '~/utils/supabase-types';
import { useUserProfile } from '~/providers/UserProfileProvider';
import { useTasks } from '~/providers/TasksProvider';

import { usePostHog } from 'posthog-react-native';

import { useTranslation } from "react-i18next";
import '../../../src/i18n/i18n'
import i18next from '../../../src/i18n/i18n';

import Task from '~/components/Task';
import Header from '~/components/homepage/Header';

import Ionicons from '@expo/vector-icons/Ionicons'
import { Entypo } from '@expo/vector-icons';

type Todo = Database['public']['Tables']['todos']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type DifficultyLevel = Database['public']['Tables']['todo_difficulty_levels']['Row']

export default function MainTabScreen() {

  const { userProfile } = useUserProfile()
  const { todos, setTodos } = useTasks()
  
  const posthog = usePostHog()

  const {t} = useTranslation();
  const changeLanguage = () => {
    if(i18next.language === 'en') {
      i18next.changeLanguage('fr')
    } else if (i18next.language === 'fr') {
      i18next.changeLanguage('en')
    }
  }

  const renderTasks = ({item}: {item: Todo}) => {
    const today = new Date()
    const doDate = new Date(item.do_date)
    const dueDate = new Date(item.due_date)

    if(doDate < today|| dueDate < today) return

    return (
      <Task {...item}/>
    )

  }
  const renderCompletedTasks = ({item}: {item: Todo}) => {
    const today = new Date()
    const doDate = new Date(item.do_date)
    const dueDate = new Date(item.due_date)

    if(doDate < today|| dueDate < today) {

      return (
        <Task {...item}/>
      )
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Tasks' }} />
      <StatusBar 
            style={'dark'}
            hidden={false}
        />
      <SafeAreaView style={styles.container}>
          <Header t={t}/>
          <View>
            <View className='flex-row justify-center space-x-4 mb-5'>
              <Pressable
                onPress={() => console.log('All tasks selected')} 
                className="flex justify-center items-center w-[98] h-[30] rounded-md border border-[#548164] bg-[#EEF3ED]"
              >
                <Text className='text-[#548164] text-xs'>{t('homepage.tasks_container.tasks_selector.all_tasks')}</Text>
              </Pressable> 
              <Pressable
                onPress={() => console.log('Morning tasks selected')} 
                className="flex justify-center items-center w-[98] h-[30] rounded-md border border-[#CBD5E1]"
              >
                <Text>{t('homepage.tasks_container.tasks_selector.morning')}</Text>
              </Pressable> 
              <Pressable
                onPress={() => console.log('Work tasks selected')} 
                className="flex justify-center items-center w-[98] h-[30] rounded-md border border-[#CBD5E1]"
              >
                <Text>{t('homepage.tasks_container.tasks_selector.work')}</Text>
              </Pressable> 
            </View>
          </View>
          <View>
            <View className='border-b pb-4 mb-2'>
              <View className='flex-row justify-between'>
                <Text>{t('homepage.tasks_container.overdue')}</Text>
                <Entypo name="chevron-right" size={24} color="black" />
              </View>
              <View></View>
            </View>
            <View>
              <FlatList 
                data={todos}
                renderItem={renderTasks}
              />
            </View>
            <View>
              <View className='flex-row justify-between'>
                <Text>{t('homepage.tasks_container.completed')}</Text>
                <Entypo name="chevron-right" size={24} color="black" />
              </View>
              <View>
              <FlatList 
                data={todos}
                renderItem={renderCompletedTasks}
              />
              </View>
            </View>
          </View>
          <Button 
            onPress={changeLanguage} 
            title={t('changeLanguage')}
            />
          <Text>{userProfile?.username}</Text>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
