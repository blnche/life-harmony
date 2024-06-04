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

import { notion } from '~/utils/notion';

type Todo = Database['public']['Tables']['todos']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type DifficultyLevel = Database['public']['Tables']['todo_difficulty_levels']['Row']


export default function MainTabScreen() {
  const { userProfile } = useUserProfile()
  const { todos, setTodos } = useTasks()
  const [open, setOpen] = useState(false)
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([])


  useEffect(() => {

    const fetchDifficultyLevels = async () => {
        const { data: todo_difficulty_levels, error } = await supabase
        .from('todo_difficulty_levels')
        .select('*')
        .returns<DifficultyLevel[]>()
        // console.log(todo_difficulty_levels)
        if (error) {
            console.log(error)
        }
        else {
            setDifficultyLevels(todo_difficulty_levels)
        }
    } 
    fetchDifficultyLevels()
    
  },[])

  const fetchNotionTaskDb = () => {

    try {
      
      console.log(notion)
      const databaseId = process.env.EXPO_PUBLIC_NOTION_DB_ID
      console.log('id : '+databaseId)
    
      if(databaseId) {
        // GET ALL TASK IN NOTION DB
        const fetchDB = async () => {
          const response = await notion.databases.query({
            database_id: databaseId
          });
          // console.log(response)
          const rows = response.results
          // console.log(rows)
          rows.map((row) => {
            if(!row.properties.LH_id.number) {
              // console.log('_____________________________________')
              // console.log('Does not have LH_ID')
              // console.log('pageID :'+row.id)
              const pageId = row.id
              const properties = row.properties
  
              // GET TITLE
              let title
              properties.Name.title.map((item : any) => {
                title = item.plain_text
              })
            
              // GET DIFFICULTY LEVEL
              const difficultyLevel = difficultyLevels.find((level) => {
                if(!properties.Difficulty.select) {
                  return 2
                }
                if(level.name.toUpperCase() === properties.Difficulty.select.name.toUpperCase()) {
                  return level
                }
              }) ?.id
  
              // CHECK DO DATE
              let doDate
              if(!properties.Do.date) {
                doDate = null
              } else {
                if(properties.Do.date.start.length <= 10) {
                  doDate = new Date(properties.Do.date.start)
                } else {
                  doDate = properties.Do.date.start
                }
              }
  
              // CHECK DUE DATE
              let dueDate
              if(!properties.Due.date) {
                dueDate = null
              } else {
                if(properties.Due.date.start.length <= 10) {
                  dueDate = new Date(properties.Due.date.start)
                } else {
                  dueDate = properties.Due.date.start
                }
              }
  
              const task = {
                difficulty_level: difficultyLevel,
                do_date: doDate,
                due_date: dueDate,
                is_complete: properties.is_complete.checkbox,
                profile_user_id: userProfile?.id,
                task: title,
              }
              // console.log(task);
  
              // ADD TASK TO SUPABASE DB
              if(task) {
  
                (async (task : any) => {
                  // console.log('______________ADD_TODO______________________')
                  // console.log(task)
                  const text = task.task?.trim()
              
                  if(text?.length) {
                    const { data: todo, error } = await supabase
                      .from('todos')
                      .insert([
                        { 
                          task : text, 
                          profile_user_id : task.profile_user_id,
                          difficulty_level : task.difficulty_level,
                          do_date : task.do_date,
                          due_date : task.due_date,
                          is_complete : task.is_complete
              
                        },
                      ])
                      .select('*')
                      .single()
              
                    // console.log(todo)
                    if (error) {
                      console.log(error)
                    }
                    else {
          
                      setTodos(prevTodos => (prevTodos ? [...prevTodos, todo as Todo] : [todo as Todo]));
  
                      // UPDATE NOTION ROW (PAGE) LH_id TO TODO ID
                      (async (pageId : string) => {
                        const response = await notion.pages.update({
                          page_id: pageId,
                          properties: {
                            'LH_id': {
                              number: todo.id,
                            },
                          },
                        });
                        // console.log(response);
                      })(pageId);
                    }
                  }
                })(task);
  
              }
              // console.log('_____________________________________')
            }
            else {
              // console.log('_____________________________________')
              // console.log('Already has a LH_ID')
              // console.log(row.properties.LH_id.number)
              // console.log(row.archived)
              // console.log('_____________________________________');
              
              // maybe check if which was edited last and then proceed to updates rows on each side 
            }
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
        <Button 
          color={'black'}
          onPress={fetchNotionTaskDb}
        >
          Sync Notion Task Database
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
