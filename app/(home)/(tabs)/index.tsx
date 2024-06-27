import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Button, View, Text, FlatList, Pressable, ScrollView } from 'react-native';
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

import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

import OverdueTaskList from '~/components/homepage/OverdueTaskList';
import CompletedTaskList from '~/components/homepage/CompletedTaskList';
import TaskList from '~/components/homepage/TaskList';
import NewTodo from '~/components/NewTask';

type Todo = Database['public']['Tables']['todos']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type DifficultyLevel = Database['public']['Tables']['todo_difficulty_levels']['Row']

export default function MainTabScreen() {

  // PROVIDERS
  const { userProfile } = useUserProfile()
  const { todos, setTodos } = useTasks()
  
  // TOOLS  
  const posthog = usePostHog()
  const {t} = useTranslation()
 
  // RENDERING TASKS - OVERDUE, TODAY, COMPLETED
  const [tasksType, setTasksType] = useState<String>('all')
  const today = new Date()

  const handleTasksType = (type : String) => {
    console.log(type)
    setTasksType(type)
  }

  const tasks = todos?.filter(todo => {
    const do_date = new Date(todo.do_date)
    const due_date = new Date(todo.due_date)

    return ((do_date == today || due_date == today) && !todo.is_complete)
  })

  const overdueTasks = todos?.filter(todo => {
    const do_date = new Date(todo.do_date)
    const due_date = new Date(todo.due_date)

    return ((do_date < today || due_date < today) && !todo.is_complete)
  })

  const completedTasks = todos?.filter(todo => {
    const do_date = new Date(todo.do_date)
    const due_date = new Date(todo.due_date)

    return ((do_date == today || due_date == today) && todo.is_complete)
  })

  // NEW TASK BOTTOM SHEET
   
   const bottomSheetModalRef = useRef<BottomSheetModal>(null);

   const snapPoints = useMemo(() => ['50%', '93%'], []);
 
   const handlePresentModalPress = useCallback(() => {
     bottomSheetModalRef.current?.present();
   }, []);
   
   const handleSheetChanges = useCallback((index: number) => {
     console.log('handleSheetChanges', index);
   }, []);

   // PROGRESS BAR
   const tasksCompletionProgress = () => {
    if (tasks && completedTasks && overdueTasks) {
      const totalTasks = tasks.length + completedTasks.length + overdueTasks.length

      if (totalTasks === 0) {
        return 1
      }
      return (completedTasks.length / totalTasks)
    }
   }

   const tasksLeft = () => {
    if (tasks && overdueTasks) {
      return tasks?.length + overdueTasks?.length
    }
   }

  return (
    <>
      <Stack.Screen options={{ title: 'Tasks' }} />
      <StatusBar 
            style={'dark'}
            hidden={false}
        />
      <SafeAreaView className='p-[15px] h-full flex items-center'>
          <Header t={t} progress={tasksCompletionProgress()} tasksLeft={tasksLeft()}/>
          <View className='flex-row justify-center space-x-4 mb-5'>
            <Pressable
              onPress={() => handleTasksType('all')} 
              className={`flex justify-center items-center w-[98] h-[30] rounded-md border ${tasksType === 'all' ? 'border-[#548164] bg-[#EEF3ED]' : 'border-[#CBD5E1]'} `}
            >
              <Text className={` ${tasksType === 'all' ? 'text-[#548164]' : ''}  text-xs`}>{t('homepage.tasks_container.tasks_selector.all_tasks')}</Text>
            </Pressable> 
            <Pressable
              onPress={() => handleTasksType('morning')} 
              className={`flex justify-center items-center w-[98] h-[30] rounded-md border ${tasksType === 'morning' ? 'border-[#548164] bg-[#EEF3ED]' : 'border-[#CBD5E1]'}`}
            >
              <Text className={` ${tasksType === 'morning' ? 'text-[#548164]' : ''}  text-xs`}>{t('homepage.tasks_container.tasks_selector.morning')}</Text>
            </Pressable> 
            <Pressable
              onPress={() => handleTasksType('work')} 
              className={`flex justify-center items-center w-[98] h-[30] rounded-md border ${tasksType === 'work' ? 'border-[#548164] bg-[#EEF3ED]' : 'border-[#CBD5E1]'}`}
            >
              <Text className={` ${tasksType === 'work' ? 'text-[#548164]' : ''}  text-xs`}>{t('homepage.tasks_container.tasks_selector.work')}</Text>
            </Pressable> 
          </View>
          <ScrollView className='w-full h-[365]'>
            {overdueTasks && overdueTasks.length > 0 && <OverdueTaskList t={t} overdueTasks={overdueTasks}/>}
            {tasks && <TaskList t={t} tasks={tasks} />}
            {completedTasks && completedTasks.length > 0 && <CompletedTaskList t={t} completedTasks={completedTasks} />}
          </ScrollView>
          <BottomSheetModalProvider>
          <Pressable 
            className='mt-5 flex-row items-center justify-center w-[300] h-[55] rounded-[18px] bg-white shadow-sm'
            onPress={handlePresentModalPress}
          >
            <Entypo name="plus" size={24} color="#7A7A7A" />
            <Text className='text-xl text-[#7A7A7A] ml-1.5'>New Task</Text>
          </Pressable>
              <BottomSheetModal
                ref={bottomSheetModalRef}
                index={1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
              >
                <BottomSheetView style={styles.contentContainer}>
                  <NewTodo/>
                </BottomSheetView>
              </BottomSheetModal>
          </BottomSheetModalProvider>
      </SafeAreaView>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});