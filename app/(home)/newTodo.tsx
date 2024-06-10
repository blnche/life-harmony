import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";
import { Database } from "~/utils/supabase-types";
import { supabase } from "~/utils/supabase";
import { useUserProfile } from "~/providers/UserProfileProvider";
import { useEffect, useState } from "react";
import { XStack, YStack, Button, Label, RadioGroup, Input } from "tamagui";
import { Plus } from '@tamagui/lucide-icons'
import { notion } from '~/utils/notion';

import DateTimePicker from 'react-native-ui-datepicker'
import { useTasks } from "~/providers/TasksProvider";


type Todo = Database['public']['Tables']['todos']['Row']
type DifficultyLevel = Database['public']['Tables']['todo_difficulty_levels']['Row']


export default function NewTodo () {
    const { userProfile } = useUserProfile()
    const { todos, setTodos } = useTasks()

    const [newTodo, setNewTodo] = useState<Todo | null>(null)
    const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([])
    const [selectedDifficutly, setSelectedDifficulty] = useState<number | null>(null)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePicker, setShowTimePicker] = useState(false)

    const databaseId = process.env.EXPO_PUBLIC_NOTION_DB_ID
    console.log('id : '+databaseId)

    useEffect(() => {

        const fetchDifficultyLevels = async () => {
            const { data: todo_difficulty_levels, error } = await supabase
            .from('todo_difficulty_levels')
            .select('*')
            .returns<DifficultyLevel[]>()
            console.log(todo_difficulty_levels)
            if (error) {
                console.log(error)
            }
            else {
                setDifficultyLevels(todo_difficulty_levels)
            }
        } 
        fetchDifficultyLevels()
        
    },[])

    const addTodo = async (task : Todo) => {
        const text = task.task?.trim()
    
        if(text?.length) {
          const { data: todo, error } = await supabase
            .from('todos')
            .insert([
              { 
                task : text, 
                profile_user_id : userProfile!.id,
                difficulty_level : task.difficulty_level,
                do_date : task.do_date
    
              },
            ])
            .select('*')
            .single()
    
          // console.log(todo)
          if (error) {
            console.log(error)
          }
          else {

            setTodos(prevTodos => (prevTodos ? [...prevTodos, todo as Todo] : [todo as Todo]))

            // add newTodo to NOTION TASK DB
            if(databaseId) {
                (async () => {
                    console.log(todo)
                    const properties : {[key: string] : any} = {
                        'Name': {
                            type: 'title',
                            title: [
                              {
                                text: {
                                  content: todo.task!
                                },
                              }
                            ],
                        },
                        'LH_id': {
                            number: todo.id,
                        },
                        'is_complete': {
                            checkbox : todo.is_complete
                        },
                        'Status': {
                            status: {
                                'name' : 'Not started'
                            },
                        },
                    }
  
                    if(todo.do_date) {
                        properties['Do'] = {
                            date: {
                                'start' : todo.do_date!,
                            },
                        }
                    }

                    if(todo.due_date) {
                        properties['Due'] = {

                            date: {
                                'start' : todo.due_date!,
                            },
                        }
                    }

                    const response = await notion.pages.create({
                        parent: {
                            type: 'database_id',
                            database_id: databaseId,
                        },
                        properties: properties,
                    });
                    console.log(response);
                })();
            }

            // const pointsUpdated = todo.point_value * todo.difficulty_level
            // const { data, error } = await supabase
            // .from('todos')
            // .update({ point_value : pointsUpdated})
            // .eq('id', todo.id)
            // .select('*')
            // .single()
            
            // if (error) {
            //   console.log(error)
            // } else {
            //   todo.point_value = pointsUpdated
            // //   setTodos([todo!, ...todos])
            //   setNewTodo(null)
            //   setSelectedDifficulty(null)
            //   if(showDatePicker === true) {

            //     setShowDatePicker(!showDatePicker)
            //   }
    
            // }
          }
        }
    }

    const handleDate = ( receivedDate : any ) => {
        console.log(receivedDate)
        if(receivedDate.date.length < 24) {
            console.log('with time')
            const [datePart, timePart] = receivedDate.date.split(" ")
            console.log(datePart, timePart)
            const localDate = new Date(`${datePart}T${timePart}:00`)
            console.log(localDate.toISOString())
            setNewTodo({...newTodo as Todo, do_date : localDate.toISOString()})
        } else {
            console.log('no time')
            console.log(receivedDate.date)
            setNewTodo({...newTodo as Todo, do_date : receivedDate.date})
        }
    }

    return (
        <>
        <Stack.Screen options={{ title: 'Create a new task'}}/>
        <YStack fullscreen justifyContent="space-between" padding="$4">
          <YStack space='$2' alignItems='flex-start' justifyContent='center'>
            <YStack
                backgroundColor={'$blue11Dark'}
                width={'100%'}
                padding={'$4'}
                borderRadius={'$5'}
            >
                <Label htmlFor='new-todo'>Title : </Label>
                <Input
                id="new-todo"
                onChangeText={(text) => setNewTodo({...newTodo as Todo, task : text})}
                value={newTodo?.task!}
                borderWidth={2}
                borderColor={'$color.blue8Light'}
                backgroundColor={'$color.blue4Light'}
                placeholder='New task...'
                width={'100%'}
                />
            </YStack>
            <YStack
                backgroundColor={'$blue11Dark'}
                width={'100%'}
                padding={'$4'}
                borderRadius={'$5'}
            >
                <Text>How difficult for you this task is going to be ?</Text>
                <XStack justifyContent="center">
                    {difficultyLevels && difficultyLevels.map((difficulty, index) => {
                        return (

                            <Button 
                                key={difficulty.id}
                                theme={selectedDifficutly === difficulty.id ? 'active' : null}
                                onPress={() => setSelectedDifficulty(difficulty.id)}
                                borderWidth={2}
                                borderColor={'$color.blue8Light'}
                                backgroundColor={selectedDifficutly === difficulty.id ? '$color.blue6Light' : '$color.blue4Light'}
                                marginHorizontal={"$1.5"}
                            >
                                {difficulty.name}
                            </Button>
                        )
                    })}
                </XStack>
            </YStack>
            <YStack
                backgroundColor={'$blue11Dark'}
                width={'100%'}
                padding={'$4'}
                borderRadius={'$5'}
            >
                <Button 
                    onPress={() => setShowDatePicker(!showDatePicker)}
                    marginBottom={'$2'}
                >
                    Pick a date
                </Button>
                {showDatePicker && (
                    <>
                        <Button 
                            onPress={() => setShowTimePicker(!showTimePicker)}
                            marginBottom={'$2'}
                        >
                            Pick a time
                        </Button>
                        <DateTimePicker 
                            mode='single'
                            date={newTodo?.do_date}
                            timePicker={showTimePicker}
                            onChange={(params) => handleDate(params)}
                        />
                    </>
                )}
            </YStack>
          </YStack>
          <XStack alignSelf="center" alignItems="center" marginBottom={'$4'}>
            <Link
                href={'../'}
            >
                Cancel
            </Link>
            <Button  
              onPress={() => addTodo(newTodo!)} 
              marginLeft={'$5'}
              borderWidth={2}
              borderColor={'$color.blue8Light'}
            >
                Validate
            </Button>
          </XStack>
        </YStack>
        </>
    )
}