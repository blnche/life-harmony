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
import { supabase } from '~/utils/supabase';

type Todo = Database['public']['Tables']['todos']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type DifficultyLevel = Database['public']['Tables']['todo_difficulty_levels']['Row']

interface TimeBlock {
  id: string;
  name: string;
}

export default function MainTabScreen() {

  // PROVIDERS
  const { userProfile } = useUserProfile()
  const { todos, setTodos } = useTasks()
  
  // TOOLS  
  const posthog = usePostHog()
  const {t} = useTranslation()


  
  // RENDERING TASKS - OVERDUE, TODAY, COMPLETED
  const [timeBlock, setTimeBlock] = useState<TimeBlock>({ id: '08b61182-86a9-4141-8ae3-69c0c3bff440', name: 'All' })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const datesAreEqual = (date1 : Date, date2 : Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  
  const filterTasksByStatusAndPriority = useCallback((priority : string, status : string, timeBlockId : string) => {
    return todos?.filter(todo => {
      const do_date = new Date(todo.do_date!);
      const due_date = new Date(todo.due_date!);

      const isDoDateToday = datesAreEqual(do_date, today)
      const isDueDateToday = datesAreEqual(due_date, today)

      if(status === 'overdue') {
        // console.log(`todo status : ${todo.status} ${todo.status !== t('done')}`)
        return todo.status !== t('done') && (do_date < today || due_date < today) && todo.priority === priority && todo.time_block_id === timeBlockId
      }

      if (status === 'completed') {
        return todo.status === t('done') && (isDoDateToday || isDueDateToday)
      }

      if(status === 'default') {
        return todo.status !== t('done') && (isDoDateToday || isDueDateToday) && todo.priority === priority && todo.time_block_id === timeBlockId
      }
    })
  }, [todos, timeBlock])

  const handleTimeBlock = (timeBlockName : string, timeBlockId : string) => {
    setTimeBlock({id : timeBlockId, name : timeBlockName})
  }
  
  // const fetchTimeBlocks = async () => {
  //   try {
  //     const timeBlocks = await supabase
  //       .from('user_time_blocks')
  //       .select('*')
  //       .eq('user_id', userProfile?.id!)

  //     console.log(timeBlocks.data)

  //   } catch (error) {
  //     console.log(error)
  //   }
  // }
  // fetchTimeBlocks()

  const tasks = todos?.filter(todo => {
    const do_date = new Date(todo.do_date!)
    const due_date = new Date(todo.due_date!)
    const isDoDateToday = datesAreEqual(do_date, today)
    const isDueDateToday = datesAreEqual(due_date, today)

    return (isDoDateToday || isDueDateToday) && todo.status !== t('done')
  })

  
  
  const overdueTasks = todos?.filter(todo => {
    const do_date = new Date(todo.do_date!)
    const due_date = new Date(todo.due_date!)

    return (do_date < today || due_date < today) && todo.status !== t('done') //maybe not working
  })
  console.log(overdueTasks?.length)

  const test = []
  const completedTasks = todos?.filter(todo => {
    const do_date = new Date(todo.do_date)
    const due_date = new Date(todo.due_date)
    const markedDone = new Date(todo.marked_done_at)
    const isDoDateToday = datesAreEqual(do_date, today)
    const isDueDateToday = datesAreEqual(due_date, today)
    const isMarkedDoneToday = datesAreEqual(markedDone, today)

    return (isDoDateToday || isDueDateToday || isMarkedDoneToday) && todo.status === t('done') && todo.is_complete
  })
  // console.log(test.length)
  
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
      <SafeAreaView className='p-[15px] h-full flex items-center bg-white'>
          <Header t={t} progress={tasksCompletionProgress()} tasksLeft={tasksLeft()}/>
          <View className='flex-row justify-center space-x-4 mb-5'>
            <Pressable
              onPress={() => handleTimeBlock('All', '08b61182-86a9-4141-8ae3-69c0c3bff440')} 
              className={`flex justify-center items-center w-[98] h-[30] rounded-md border ${timeBlock.name === 'All' ? 'border-[#548164] bg-[#EEF3ED]' : 'border-[#CBD5E1]'} `}
            >
              <Text className={` ${timeBlock.name === 'All' ? 'text-[#548164]' : ''}  text-xs`}>{t('homepage.tasks_container.tasks_selector.all_tasks')}</Text>
            </Pressable> 
            <Pressable
              onPress={() => handleTimeBlock('Morning', 'f53bbfa2-3fc8-4cb0-8d94-8a17330a969b')} 
              className={`flex justify-center items-center w-[98] h-[30] rounded-md border ${timeBlock.name === 'Morning' ? 'border-[#548164] bg-[#EEF3ED]' : 'border-[#CBD5E1]'}`}
            >
              <Text className={` ${timeBlock.name === 'Morning' ? 'text-[#548164]' : ''}  text-xs`}>{t('homepage.tasks_container.tasks_selector.morning')}</Text>
            </Pressable> 
            <Pressable
              onPress={() => handleTimeBlock('Work', 'f0381068-50ee-4f3f-8763-bbf9e0cdd146')} 
              className={`flex justify-center items-center w-[98] h-[30] rounded-md border ${timeBlock.name === 'Work' ? 'border-[#548164] bg-[#EEF3ED]' : 'border-[#CBD5E1]'}`}
            >
              <Text className={` ${timeBlock.name === 'Work' ? 'text-[#548164]' : ''}  text-xs`}>{t('homepage.tasks_container.tasks_selector.work')}</Text>
            </Pressable> 
          </View>
            {todos && 
              <ScrollView className='w-full h-[365]'>
                {overdueTasks?.length > 0 && 
                    <OverdueTaskList 
                      t={t} 
                      timeBlock={timeBlock}
                      overdueTasksHigh={filterTasksByStatusAndPriority(t('high'), 'overdue', timeBlock.id)} 
                      overdueTasksMedium={filterTasksByStatusAndPriority(t('medium'), 'overdue', timeBlock.id)} 
                      overdueTasksLow={filterTasksByStatusAndPriority(t('low'), 'overdue', timeBlock.id)}/>
                }

                {tasks?.length > 0 && 
                  <TaskList 
                    t={t}
                    timeBlock={timeBlock}
                    tasksHigh={filterTasksByStatusAndPriority(t('high'), 'default', timeBlock.id)} 
                    tasksMedium={filterTasksByStatusAndPriority(t('medium'), 'default', timeBlock.id)} 
                    tasksLow={filterTasksByStatusAndPriority(t('low'), 'default', timeBlock.id)} 
                  />
                }

                {completedTasks?.length > 0 &&
                  <CompletedTaskList 
                    t={t} 
                    timeBlock={timeBlock}
                    completedTasks={filterTasksByStatusAndPriority('', 'completed', timeBlock.id)} 
                  />
                }

                </ScrollView>
            }

            {tasks?.length === 0 && overdueTasks?.length === 0 && <Text className="text-black mt-5">{t('homepage.tasks_container.no_task_left')}</Text>}

        <BottomSheetModalProvider>
          <Pressable 
            className='mt-5 flex-row items-center justify-center w-[300] h-[55] rounded-[18px] bg-white shadow-sm border'
            onPress={handlePresentModalPress}
          >
            <Entypo name="plus" size={24} color="black" />
            <Text className='text-xl text-black ml-1.5'>New Task</Text>
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
  
});