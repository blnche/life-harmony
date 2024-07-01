import { Link, Stack } from "expo-router";
import { Text, View, Button, TextInput, Pressable } from "react-native";
import { Database } from "~/utils/supabase-types";
import { supabase } from "~/utils/supabase";
import { useUserProfile } from "~/providers/UserProfileProvider";
import { useEffect, useState } from "react";
// import { XStack, YStack, Button, Label, RadioGroup, Input } from "tamagui";
// import { Plus } from '@tamagui/lucide-icons'
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
    const [selectedDifficutly, setSelectedDifficulty] = useState<number>(2)
    const [selectedTimeBlock, setSelectedTimeBlock] = useState<string>('08b61182-86a9-4141-8ae3-69c0c3bff440')
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
                do_date : task.do_date,
                priority: task.priority,
                time_block_id: task.time_block_id
    
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
            // if(databaseId) {
            //     (async () => {
            //         console.log(todo)
            //         const properties : {[key: string] : any} = {
            //             'Name': {
            //                 type: 'title',
            //                 title: [
            //                   {
            //                     text: {
            //                       content: todo.task!
            //                     },
            //                   }
            //                 ],
            //             },
            //             'LH_id': {
            //                 number: todo.id,
            //             },
            //             'is_complete': {
            //                 checkbox : todo.is_complete
            //             },
            //             'Status': {
            //                 status: {
            //                     'name' : 'Not started'
            //                 },
            //             },
            //             'Priority': {
            //                 select:{
            //                     'name' : 'Medium'
            //                 }
            //             }
            //         }
  
            //         if(todo.do_date) {
            //             properties['Do'] = {
            //                 date: {
            //                     'start' : todo.do_date!,
            //                 },
            //             }
            //         }

            //         if(todo.due_date) {
            //             properties['Due'] = {

            //                 date: {
            //                     'start' : todo.due_date!,
            //                 },
            //             }
            //         }

            //         const response = await notion.pages.create({
            //             parent: {
            //                 type: 'database_id',
            //                 database_id: databaseId,
            //             },
            //             properties: properties,
            //         });
            //         console.log(response);
            //     })();
            // }

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

    const handleTimeBlock = (blockId : string) => {
        setSelectedTimeBlock(blockId)
        setNewTodo({...newTodo as Todo, time_block_id : blockId})
    }
    return (
        <>
        <Stack.Screen options={{ title: 'Create a new task'}}/>
        
            
                <Text>Title : </Text>
                <TextInput
                id="new-todo"
                onChangeText={(text) => setNewTodo({...newTodo as Todo, task : text})}
                value={newTodo?.task!}
                placeholder='New task...'
                />
            
                <Text>How difficult for you this task is going to be ?</Text>
                
                    {difficultyLevels && difficultyLevels.map((difficulty, index) => {
                        return (

                            <Button 
                                key={difficulty.id}
                                onPress={() => setSelectedDifficulty(difficulty.id)}
                                title={difficulty.name}
                            />
                        )
                    })}

  
                <Button 
                    onPress={() => setShowDatePicker(!showDatePicker)}
                    title="Pick a date"
                />
                    
                {showDatePicker && (
                    <>
                        <Button 
                            onPress={() => setShowTimePicker(!showTimePicker)}
                            title="Pick a time"  
                        />
                        <DateTimePicker 
                            mode='single'
                            date={newTodo?.do_date}
                            timePicker={showTimePicker}
                            onChange={(params) => handleDate(params)}
                        />
                    </>
                )}
            
            <Link
                href={'../'}
            >
                Cancel
            </Link>
            <View>
                <Pressable
                    onPress={() => handleTimeBlock('08b61182-86a9-4141-8ae3-69c0c3bff440')}
                    className={`flex justify-center items-center w-[98] h-[30] rounded-md border ${selectedTimeBlock === '08b61182-86a9-4141-8ae3-69c0c3bff440' ? 'border-[#548164] bg-[#EEF3ED]' : 'border-[#CBD5E1]'} `}
                >
                    <Text>All</Text>
                </Pressable>
                <Pressable
                    onPress={() => handleTimeBlock('f0381068-50ee-4f3f-8763-bbf9e0cdd146')}
                    className={`flex justify-center items-center w-[98] h-[30] rounded-md border ${selectedTimeBlock === 'f0381068-50ee-4f3f-8763-bbf9e0cdd146' ? 'border-[#548164] bg-[#EEF3ED]' : 'border-[#CBD5E1]'} `}
                >
                    <Text>Work</Text>
                </Pressable>
                <Pressable
                    onPress={() => handleTimeBlock('f53bbfa2-3fc8-4cb0-8d94-8a17330a969b')}
                    className={`flex justify-center items-center w-[98] h-[30] rounded-md border ${selectedTimeBlock === 'f53bbfa2-3fc8-4cb0-8d94-8a17330a969b' ? 'border-[#548164] bg-[#EEF3ED]' : 'border-[#CBD5E1]'} `}
                >
                    <Text>Morning</Text>
                </Pressable>
            </View>
            <Button  
              onPress={() => addTodo(newTodo!)} 
              title="Validate"
            />
        </>
    )
}