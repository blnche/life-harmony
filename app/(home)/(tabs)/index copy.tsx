import { Link, Stack } from 'expo-router';
import { FlatList, Platform, StyleSheet, Button, View, Text, ScrollView } from 'react-native';
// import {  Sheet } from 'tamagui';
// import { Check as CheckIcon, Trash, Plus } from '@tamagui/lucide-icons'
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { notion } from '~/utils/notion';
import { usePostHog } from 'posthog-react-native';

import { useTranslation } from "react-i18next";
import '../../../src/i18n/i18n'
import i18next from '../../../src/i18n/i18n';

type Todo = Database['public']['Tables']['todos']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type DifficultyLevel = Database['public']['Tables']['todo_difficulty_levels']['Row']


export default function MainTabScreen() {

  const { userProfile } = useUserProfile()
  const { todos, setTodos } = useTasks()
  const [open, setOpen] = useState(false)
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([])
  
  const posthog = usePostHog()

  const {t} = useTranslation();

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
    // fetchNotionTaskDb()
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

          const tasksToUpdate : Todo[] = []
          const rowsId : number[] = []

          
          for(const row of response.results) {

            
            
            // CHECK IF ALREADY IN APP DATABASE
            if(!row.properties.LH_id.number) {
              console.log(`This row doesnt have an LH id : ${row.properties.Name.title[0].plain_text}`)
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

              // GET PRIORITY
              const priority = response.results[0].properties[t('priority')].select.name
              console.log(priority)
              
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
                priority: priority
              }
              console.log(task);
              
              // ADD TASK TO SUPABASE DB
              if(task) {
                
                (async (task : Todo) => {
                  
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
                        is_complete : task.is_complete,
                        priority : task.priority
                        
                      },
                    ])
                    .select('*')
                    .single()
                    
                    if (error) {
                      console.log(`error `)
                      console.log(error)
                    }
                    else {
                      console.log(`is in`)
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
              // UPDATE TASK
              const rowLH_id = row.properties.LH_id.number

              const todo = todos?.find(todo => 
                todo.id === rowLH_id
              )
              // console.log(todo)
              // console.log(row)
              rowsId.push(rowLH_id)
              
              const rowProperties = row.properties
              const rowLastEdited = new Date(row.last_edited_time)
              console.log(`notion row last edited time : ${rowLastEdited}`)
              // let title
              // rowProperties.Name.title.map((item : any) => {
              //   title = item.plain_text
              // })
              
              // console.log(` notion rows with id : ${title}`)
              
              if (todo) {
                const task : Partial<Todo> = {
                  id: todo.id
                }
                console.log(`task found : ${todo.id} / ${todo.task}`)
                // console.log(task)
                
                const todoLastEdited = new Date(todo.last_edited_at)
                console.log(`db last edited time : ${todoLastEdited}`)
                const todoDifficultyLevel = difficultyLevels.find(level => level.id === todo.difficulty_level)
                
                if(rowLastEdited > todoLastEdited) {
                  console.log(`notion : ${rowLastEdited} | app : ${todoLastEdited}`)
              //     console.log(task.task)
              //     console.log(rowProperties)
              //     console.log(task.priority)
                  
                  // const propertiesToUpdate : {[key: string] : any} = {};

                  // CHECK DIFFICULTY LEVEL
                  if (rowProperties.Difficulty && rowProperties.Difficulty.select) {
                    const difficultyName = rowProperties.Difficulty.select.name
                    console.log(`difficulty name ${difficultyName}`)
                    
                    const rowDifficultyLevel = difficultyLevels.find(level => {
                      const levelName = level.name.toUpperCase()

                      if (levelName == difficultyName.toUpperCase()) {
                        return level
                      }
                    })
                    console.log(rowDifficultyLevel)
                    
                    // console.log(`${rowDifficultyLevel?.name.toUpperCase()} | ${todoDifficultyLevel?.name.toUpperCase()}`)
                    if(rowDifficultyLevel?.name.toUpperCase() !== todoDifficultyLevel?.name.toUpperCase()) {
                      if(rowDifficultyLevel) {
                        task.difficulty_level = rowDifficultyLevel.id
                        console.log(`update : ${task.difficulty_level}`)

                      } else {
                        console.log('There was an error when trying to match the difficulty level when updating.')
                      }
                    }
                  }

                  // CHECK STATUS
                  if(rowProperties[t('status')] && rowProperties[t('status')].status) {
                    const status = row.properties[t('status')].status.name
                    console.log(`notion status : ${status}`)
                    console.log(`db status : ${todo.status}`)

                    if(status && status !== todo.status) {
                      task.status = status
                      console.log(`update : ${todo.status}`)

                    }
                  }

                  // CHECK PRIORITY
                  if(rowProperties[t('priority')] && rowProperties[t('priority')].select) {
                    const priority = row.properties[t('priority')].select.name
                    console.log(`priority : ${priority}`)

                    if(priority && priority !== todo.priority) {
                      task.priority = priority
                      console.log(`update : ${todo.priority}`)
                    }
                  }

                  // CHECK DO DATE
                  if(rowProperties[t('do_date')] && rowProperties[t('do_date')].date) {
                    const doDate = new Date(row.properties[t('do_date')].date.start).toISOString()
                    const dbDoDate = new Date(todo.do_date).toISOString()

                    if(doDate && doDate !== dbDoDate) {
                      task.do_date = doDate
                    }
                  }

                  // CHECK DUE DATE
                  if(rowProperties[t('due_date')] && rowProperties[t('due_date')].date) {
                    const dueDate = new Date(row.properties[t('due_date')].date.start).toISOString()
                    const dbDueDate = new Date(todo.due_date).toISOString()

                    // console.log(`due date 2 : notion ${dueDate} | supabase ${dbDueDate}`)

                    if(dueDate && dueDate !== dbDueDate) {
                      task.due_date = dueDate
                    }
                  }

                  console.log(task)
                  
                  if(Object.keys(task).length > 1) {
                    tasksToUpdate.push(task)
                  } else {
                    console.log(`No properties to update, seems like an error or it has already been updated`)
                  }
                  console.log('______________')

                  // if(Object.keys(propertiesToUpdate).length !== 0) {

                  //   const updateDatabase = async () => {
                  //     try {
                  //       const response = await supabase  
                  //       .from('todos')
                  //       .update(propertiesToUpdate)
                  //       .eq('id', task.id)
                  //       .select('*')
                  //       .single()

                  //       // console.log(response.data)
                  //       console.log(`Row ${response.data?.task} was updated.`)
                  //       for(const key in propertiesToUpdate) {
                  //         console.log(`Updated ${key}`)
                  //       }
                  //       setTodos((todos ?? []).map(todo => (todo.id === task.id ? response.data as Todo : todo as Todo)))
                  //     } catch (error) {
                  //       console.log(error)
                  //     }
                  //   }
                  //   updateDatabase()
                    
                  // } else {
                  //   console.log(`Error : no properties were found to update.`)
                  // }
                } else {
                  console.log('app is most recent')
                }
              } else {
                console.log(`matching supabase and notion task by id failed`)
              }
            }
          }

          await batchUpdateTasks(tasksToUpdate) 

          // console.log(rowsId)
          checkingNotionDeletedPages(rowsId)
        };
        syncingNotion()
      }
      else {
        console.log('DB ID undefined or null')
      }

      posthog.capture('Notion tasks fetched')

    } catch (error) {
      console.log(error) 
    }
  }

  const batchUpdateTasks = async (tasksToUpdate: Todo[]) => {
    console.log(tasksToUpdate)
    const updates = tasksToUpdate.map(task => {
      return supabase
        .from('todos')
        .update(task)
        .eq('id', task.id)
        .select('*')
        .single();
    });
  
    const responses = await Promise.all(updates);
    const updatedTasks = responses.map(response => response.data as Todo);
    setTodos(prevTodos => prevTodos.map(todo =>
      updatedTasks.find(updatedTodo => updatedTodo.id === todo.id) || todo
    ));
  };

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
          // console.log('Todo with ID ' + todo.id + ' is deleted from Notion.');
          // find supabase row with matching id and delete
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

    // console.log(TestPriority)
    console.log(`test : ${JSON.stringify(response.results[0].properties[t('priority')].select.options)}`);
    console.log(`test : ${JSON.stringify(response.results[0].properties[t('status')].status.options)}`);
    console.log(`test : ${JSON.stringify(response.results[0].properties[t('do_date')])}`);
    console.log(`test : ${JSON.stringify(response.results[0].properties[t('due_date')])}`);
    // console.log(response.results[0].properties.Priority.select.options);
    // const selectPriorityOptions = response.results[0].properties.Priority.select.options
    // selectPriorityOptions.map(option => {
    //     console.log(option.id)
    //     console.log(option.name)
    //   })
      
    //   console.log(response.results[0].properties.Status.status.options);
    //   const selectOptions = response.results[0].properties.Status.status.options
    //   selectOptions.map(option => {
    //       console.log(option.id)
    //       console.log(option.name)
        
    //     })
        
    //     console.log(response.results[0].properties.Status.status.groups);
    //     const selectGroups = response.results[0].properties.Status.status.groups
    //     selectGroups.map(group => {
    //         console.log(group.id)
    //         console.log(group.name)
    //         if(group.option_ids) {
    //             console.log(group.option_ids)
            
    //           }
    //         })
            
  }
          
  //   const displayDate = ( receivedDate : string ) => {
  //       const currentDate = new Date()
  //       const baseDate = new Date(receivedDate)
  //       // console.log(date)
  //       // console.log('base '+baseDate)
      
  //       const year = baseDate.getFullYear()
  //       const hours = baseDate.getHours()
  //       const minutes = baseDate.getMinutes()
  //   const formattedHours = String(hours).padStart(2, '0');
  //   const formattedMinutes = String(minutes).padStart(2, '0');

  //   const differenceInMilliseconds = baseDate.getTime() - currentDate.getTime()
  //   const differenceInDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24))

  //   if (differenceInDays <= 3 && differenceInDays > 1) {
  //     return `In ${differenceInDays} days`
  //   }
  //   if (differenceInDays === 1) {
  //     return `Tomorrow at ${formattedHours}:${formattedMinutes}`
  //   }
  //   if (differenceInDays === 0) {
  //     return `Today at ${formattedHours}:${formattedMinutes}`
  //   }

  //   if (year === 1970) {
  //     // console.log('year '+year)
  //     const formattedDate = new Date(receivedDate).toLocaleString('en-US', {})
  //     return <Button size={'$1'}>Add date</Button>
  //   }
  //   if (hours === 0 && minutes === 0) {
  //     // console.log('midnight '+hours+':'+minutes)
  //     const formattedDate = new Date(receivedDate).toLocaleString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'})
  //     return formattedDate
  //   }

  //   const formattedDate = new Date(receivedDate).toLocaleString('en-US', {month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'long'})
  //   // console.log(formattedDate)
  //   return formattedDate
  // }

  const changeLanguage = () => {
    if(i18next.language === 'en') {
      i18next.changeLanguage('fr')
    } else if (i18next.language === 'fr') {
      i18next.changeLanguage('en')
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <StatusBar 
            style={'dark'}
            hidden={false}
        />
      <SafeAreaView>
          <Text>{t('greet')}{userProfile?.username}</Text>
          <Button 
            onPress={changeLanguage} 
            title={t('changeLanguage')}
          />
          <Link href="/settings" asChild>
              <HeaderButton />
          </Link>
        {/* <Sheet
          open={open}
          onOpenChange={setOpen}
          dismissOnSnapToBottom
          snapPoints={[90,50]}
        >
          <Sheet.Overlay/>
          <Sheet.Frame>
            <NewTodo />
          </Sheet.Frame>
        </Sheet> */}
        <ScrollView style={{height:'70%'}}>
          <View>
            {userProfile &&
              <Text>Points : {userProfile?.points}</Text>
            }
            {todos && todos.map((todo, index) => {
              return  (
                <Task {...todo} key={todo.id}/>
              ) 
            })}
          </View>
        </ScrollView>
        <Button 
          color={'black'}
          onPress={() => setOpen(true)}
          title="new task"
        />
        <Button 
          color={'black'}
          onPress={fetchNotionTaskDb}
          title="Sync Notion Task Database"
        />
        <Button 
          color={'black'}
          onPress={fetchAllNotionDB}
          title="Get Notion Databases"
        />
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
