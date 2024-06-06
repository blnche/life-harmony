import { Link, Stack } from 'expo-router';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';
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
    fetchNotionTaskDb()
    
  },[])

  const fetchNotionTaskDb = () => {

    try {
      
      const databaseId = process.env.EXPO_PUBLIC_NOTION_DB_ID
      // console.log('id : '+databaseId)
    
      if(databaseId) { 

        // GET ALL TASK IN NOTION DB
        const syncingNotion = async () => {

          const response = await notion.databases.query({
            database_id: databaseId
          });
          // console.log(response)
          const rows = response.results
          // console.log(rows)

          const rowsId : number[] = []
          
          for(const row of rows) {
            
            // CHECK IF ALREADY IN APP DATABASE
            if(!row.properties.LH_id.number) {
              
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
            }
            else {
              const rowLH_id = row.properties.LH_id.number
              rowsId.push(rowLH_id)
              
              const rowProperties = row.properties
              const rowLastEdited = new Date(row.last_edited_time)
              let title
              rowProperties.Name.title.map((item : any) => {
                title = item.plain_text
              }) 
              
              // console.log(` notion rows with id : ${title}`)
              
              const task = todos?.find(task => 
                task.id === rowLH_id
              )
              // console.log(`task found : ${task?.task}`)
              if (task) {
                
                const todoLastEdited = new Date(task?.last_edited_at!)
                const todoDifficultyLevel = difficultyLevels.find(level => level.id === task.difficulty_level)
                
                if(rowLastEdited > todoLastEdited) {
                  console.log(`notion : ${rowLastEdited} | app : ${todoLastEdited}`)

                  if (rowProperties.Difficulty.select) {
                    const difficultyName = rowProperties.Difficulty.select.name
                    
                    const rowDifficultyLevel = difficultyLevels.find(level => {

                      const levelName = level.name.toUpperCase()

                      if (levelName == difficultyName.toUpperCase()) {
                        return level
                      }
                    })
                    // console.log(rowDifficultyLevel)

                    // check each property to see which to update
                    // build object 
                    // pass object in update
                    // console.log(rowProperties)

                    const propertiesToUpdate : {[key: string] : any} = {};

                    // CHECK DIFFICULTY LEVEL
                    // console.log(`${rowDifficultyLevel?.name.toUpperCase()} | ${todoDifficultyLevel?.name.toUpperCase()}`)
                    if(rowDifficultyLevel?.name.toUpperCase() !== todoDifficultyLevel?.name.toUpperCase()) {
                      if(rowDifficultyLevel) {
                        propertiesToUpdate.difficulty_level = rowDifficultyLevel.id
                      } else {
                        console.log('There was an error when trying to match the difficulty level when updating.')
                      }
                    }

                    // CHECK DO DATE
                    if(rowProperties.Do.date) {
                      console.log(`DO DATE :  ${row.properties.Do.date.start} | ${task.do_date}`)

                      if(row.properties.Do.date.start !== task.do_date) {
                        propertiesToUpdate.do_date = row.properties.Do.date.start
                      }
                    }
                  

                    // CHECK DUE DATE
                    // if(rowProperties.Due.date) {
                    //   console.log(`DUE DATE :  ${row.properties.Due.date.start} | ${task.due_date}`)

                    //   if(row.properties.Due.date.start !== task.due_date) {
                    //     propertiesToUpdate.due_date = row.properties.Due.date.start
                    //   }
                    // }
                    console.log(propertiesToUpdate);

                    if(Object.keys(propertiesToUpdate).length !== 0) {

                      (async () => {
                        
                        const { data: updatedTodo, error: todoError } = await supabase  
                        .from('todos')
                        .update(propertiesToUpdate)
                        .eq('id', task.id)
                        .select('*')
                        .single()
                        
                        if(todoError) {
                          console.log(todoError)
                        }
                        else {
                          setTodos((todos ?? []).map(todo => (todo.id === task.id ? updatedTodo as Todo : todo as Todo)));
                        }
                      })()
                    } else {
                      console.log(`Error : no properties were found to update.`)
                    }
                    
                  } else {
                    console.log(`Row is undefined`)
                  }
                } else {
                  // console.log('app is most recent')
                }
              }
              
            }
          }
          // console.log(rowsId)
          checkingNotionDeletedPages(rowsId)
        };
        syncingNotion()
      }
      else {
        console.log('DB ID undefined or null')
      }
    } catch (error) {
      console.log(error) 
    }
  }


  const checkingNotionDeletedPages = (notionTasksIds : number[]) => {
    // compare db id to notiontodosid if no match then todos is deleted 
    if (notionTasksIds) {
      todos!.forEach((todo) => {
        let match = false;
        notionTasksIds.forEach((id) => { 
          if (todo.id === id) {
            match = true; 
          }
        });
        if (!match) {
          console.log('Todo with ID ' + todo.id + ' is deleted from Notion.');
        }
      }); 
    }
  }
  
  const fetchAllNotionDB = async () => {
    
    const response = await notion.search({
      
      filter: {
        value: 'database',
        property: 'object'
      },
      
    });
    console.log(`Notion DB title : ${response.results[0].title[0].plain_text}`);
    console.log(`Notion DB id : ${response.results[0].id}`);
    
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
      <StatusBar 
            style="dark"
            hidden={false}
        />
      <Stack.Screen options={{ title: 'Tasks' }} />
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
        <Button 
          color={'black'}
          onPress={fetchAllNotionDB}
        >
          Get Notion Databases
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
