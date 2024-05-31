import { Link, Stack } from 'expo-router';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { ScreenContent } from '~/components/ScreenContent';
import { View, Checkbox, H1, Input, Label, ListItem, Text, XStack, YStack, Button, RadioGroup, ScrollView, Sheet } from 'tamagui';
import { Check as CheckIcon, Trash, Plus } from '@tamagui/lucide-icons'
import { useAuth } from '~/providers/AuthProvider';
import React, { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';
import { Database } from '~/utils/supabase-types';
import DateTimePicker from 'react-native-ui-datepicker'
import {format} from 'date-fns'
import { useUserProfile } from '~/providers/UserProfileProvider';
import Task from '~/components/Task';
import NewTodo from '../newTodo';
import { HeaderButton } from "~/components/HeaderButton";
import { StatusBar } from 'expo-status-bar';
import { useTasks } from '~/providers/TasksProvider';

import { Client } from '@notionhq/client'

type Todo = Database['public']['Tables']['todos']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export default function MainTabScreen() {

  try {
    const notion = new Client({ auth: process.env.EXPO_PUBLIC_NOTION_SECRET_KEY })
    console.log(notion)
    const databaseId = process.env.EXPO_PUBLIC_NOTION_DB_ID
    console.log('id : '+databaseId)
  
    if(databaseId) {

      const fetchDB = async () => {
          const response = await notion.databases.query({
            database_id: databaseId
          });
          const rows = response.results
          rows.map((row) => {
            console.log(row.properties.Name.title)
            const title = row.properties.Name.title
            title.map((item) => {
              console.log(item.plain_text)
            })
          })
      };
    
      fetchDB()
    }
    else {
      console.log('DB ID undefined or null')
    }
  } catch (error) {
    console.log(error)
  }


  const { userProfile } = useUserProfile()
  const { todos } = useTasks()

  const [open, setOpen] = useState(false)



  const toggleTodoStatus = async (id: number, is_complete: boolean) => {
    // console.log(id, is_complete)
    try {

      const { data: updatedTodo, error: todoError } = await supabase  
        .from('todos')
        .update({ is_complete: !is_complete})
        .eq('id', id)
        .select('*')
        .single()
  
      // console.log(updatedTodo.point_value)
      if(todoError) {
        console.log(todoError)
      }
      else {
        setTodos(todos.map((todo) => (todo.id === id ? updatedTodo! : todo)))
      }

      // const { data: profile, error: profileError } = await supabase
      //   .from('profiles')
      //   .update({ points: updatedTodo.point_value})
      //   .eq('id', userProfile?.id)
      //   .select<Profile>('*')
      //   .single()

      //   if(profileError) {
      //     console.log(profileError)
      //   } 
      //   else {
      //     console.log(profile)
      //   }
    } catch (error) {
      console.log(error)
    }
  }

  const deleteTodo = async (id: number) => {
    const { error } = await supabase  
      .from('todos')
      .delete()
      .eq('id', id)

      if (error) {
        console.log(error)
      }
      else {
        setTodos(todos.filter((todo) => todo.id !== Number(id)))
      }
  }


  const displayDate = ( receivedDate : string ) => {
    const currentDate = new Date()
    const baseDate = new Date(receivedDate)
    // console.log(date)
    // console.log('base '+baseDate)

    const year = baseDate.getFullYear()
    const hours = baseDate.getHours()
    const minutes = baseDate.getMinutes()
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    const differenceInMilliseconds = baseDate.getTime() - currentDate.getTime()
    const differenceInDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24))

    if (differenceInDays <= 3 && differenceInDays > 1) {
      return `In ${differenceInDays} days`
    }
    if (differenceInDays === 1) {
      return `Tomorrow at ${formattedHours}:${formattedMinutes}`
    }
    if (differenceInDays === 0) {
      return `Today at ${formattedHours}:${formattedMinutes}`
    }

    if (year === 1970) {
      // console.log('year '+year)
      const formattedDate = new Date(receivedDate).toLocaleString('en-US', {})
      return <Button size={'$1'}>Add date</Button>
    }
    if (hours === 0 && minutes === 0) {
      // console.log('midnight '+hours+':'+minutes)
      const formattedDate = new Date(receivedDate).toLocaleString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'})
      return formattedDate
    }

    const formattedDate = new Date(receivedDate).toLocaleString('en-US', {month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'long'})
    // console.log(formattedDate)
    return formattedDate
  }

  return (
    <>

      <Stack.Screen options={{ title: 'Tasks' }} />
      <StatusBar 
            style="dark"
            hidden={false}
        />
      <SafeAreaView>
        <XStack justifyContent='space-between'>
          <Text>{userProfile?.username}</Text>
          <Link href="/settings" asChild>
              <HeaderButton />
          </Link>
        </XStack>
        <Sheet
          open={open}
          onOpenChange={setOpen}
          dismissOnSnapToBottom
          snapPoints={[90,50]}
        >
          <Sheet.Overlay/>
          <Sheet.Frame
            style={{backgroundColor:'blue'}}
          >
            <NewTodo />
          </Sheet.Frame>
        </Sheet>
        <ScrollView style={{height:'80%'}}>
          <View 
            alignItems='center'
          >
            {userProfile &&
              <H1>Points : {userProfile?.points}</H1>
            }
            {todos && todos.map((todo, index) => {
              return  (
                <Task {...todo} key={todo.id}/>
              ) 
            })}
          </View>
        </ScrollView>
        <Button 
          icon={<Plus size={'$2'} />}
          color={'black'}
          chromeless
          onPress={() => setOpen(true)}
        >
          New task
        </Button>
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
