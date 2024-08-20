import { Link, Stack } from "expo-router";
import { Text, View, Button, TextInput, Pressable, SafeAreaView, ScrollView } from "react-native";
import { Database } from "~/utils/supabase-types";
import { supabase } from "~/utils/supabase";
import { useUserProfile } from "~/providers/UserProfileProvider";
import { useEffect, useState } from "react";
import { notion } from '~/utils/notion';

// import DateTimePicker from 'react-native-ui-datepicker'
import { useTasks } from "~/providers/TasksProvider";
import { useTranslation } from "react-i18next";
import { usePostHog } from "posthog-react-native";
import { Entypo } from "@expo/vector-icons";

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import { Drawer } from 'expo-router/drawer';
import Schedule from "./Schedule";


type Todo = Database['public']['Tables']['todos']['Row']
type DifficultyLevel = Database['public']['Tables']['todo_difficulty_levels']['Row']


export default function NewTodo () {
    // PROVIDERS
    const { userProfile } = useUserProfile()
    const { todos, setTodos } = useTasks()

    // TOOLS  
    const posthog = usePostHog()
    const {t} = useTranslation()

    const [newTodo, setNewTodo] = useState<Partial<Todo>>({
        difficulty_level: 2,
        priority: 'medium',
        time_block_id: '08b61182-86a9-4141-8ae3-69c0c3bff440'
    })
    const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([])
    const [difficutly, setDifficulty] = useState<number>(2)
    const [selectedTimeBlock, setSelectedTimeBlock] = useState<string>('08b61182-86a9-4141-8ae3-69c0c3bff440')
    
    const [priority, setPriority] = useState("medium")

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

    const [scheduleOpen, setScheduleOpen] = useState(false)
    const [reminderOpen, setReminderOpen] = useState(false)
    const [priorityOpen, setPriorityOpen] = useState(false)
    const [prioritiesInfoOpen, setPrioritiesInfoOpen] = useState(false)
    const [difficultyOpen, setDifficultyOpen] = useState(false)
    const [timeBlockOpen, setTimeBlockOpen] = useState(false)

    const handleSchedulePressed = () => {
        setScheduleOpen(prevState => !prevState)
    }
    const handleReminderPressed = () => {
        setReminderOpen(prevState => !prevState)
    }
    const handlePriorityPressed = () => {
        setPriorityOpen(prevState => !prevState)
    }
    const handlePrioritiesInfoPressed = () => {
        setPrioritiesInfoOpen(prevState => !prevState)
    }
    const handleDifficultyPressed = () => {
        setDifficultyOpen(prevState => !prevState)
    }
    const handleTimeBlockPressed = () => {
        setTimeBlockOpen(prevState => !prevState)
    }

    const handlePriority = (level : string) => {
        setPriority(level)
        setNewTodo({...newTodo as Todo, priority : level})

    }
    const handleDifficulty = (level : number) => {
        setDifficulty(level)
        setNewTodo({...newTodo as Todo, difficulty_level : level})
    }

    const handleSubmit = () => {
        console.log(newTodo)
    }

    

    return (
        <>
        <Stack.Screen options={{ title: 'Create a new task'}}/>
        <ScrollView>
            <View className="p-[15px] h-full flex items-center bg-white">
                <View className="w-full flex-row justify-between">
                    <Text className='text-base'>{t('newTask.new_task')}</Text>
                    <Pressable 
                        className="mb-5 self-end"
                        onPress={handleSubmit}
                    >
                        <Text className='text-base'>{t('newTask.done')}</Text>
                    </Pressable>
                </View>
                <View className="w-full space-y-6">
                    <View className="">
                        <TextInput
                        id="new-todo"
                        onChangeText={(text) => setNewTodo({...newTodo as Todo, task : text})}
                        value={newTodo?.task!}
                        placeholder={t('newTask.title_placeholder')}
                        className="text-base border px-5 py-3.5 rounded-[18px]"
                        />
                    </View>
                    <View className=" border px-5 py-3.5 rounded-[18px] min-h-16">
                        
                        <Pressable 
                            onPress={handleSchedulePressed}
                            className='flex-row justify-between'
                        >
                            <View className="flex-row">
                                <Ionicons name="calendar" size={24} color="black" />
                                <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.schedule')}</Text>
                            </View>
                            <Entypo name={scheduleOpen ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                        </Pressable>
                        {scheduleOpen && 
                            <Schedule />
                        }
                    </View>
                    <View className=" border px-5 py-3.5 rounded-[18px] min-h-16">
                        <Pressable 
                            onPress={handleReminderPressed}
                            className='flex-row justify-between'
                        >
                            <View className="flex-row">
                                <Ionicons name="alarm" size={24} color="black" />
                                <Text className='ml-3.5 text-base font-medium'>{t('newTask.reminder')}</Text>
                            </View>
                            <Entypo name={reminderOpen ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                        </Pressable>
                        {reminderOpen && 
                        <View>
                            <Text>I'm open</Text>
                        </View>
                    }
                    </View>
                    <View className=" border px-5 py-3.5 rounded-[18px] min-h-16">
                        <Pressable 
                            onPress={handlePriorityPressed}
                            className="flex-row justify-between"
                        >
                            <View className="flex-row ">
                                <Ionicons name="flag" size={24} color="black" />
                                <Text className='ml-3.5 text-base font-medium'>{t('newTask.priorities.priority')}</Text>
                            </View>
                            <View className="flex-row items-center">
                                {priority &&
                                    <Text>{priority}</Text>
                                }
                            <Entypo name={priorityOpen ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                                
                            </View>
                        </Pressable>
                        {priorityOpen &&
                        
                            <View className="mt-7 flex-row justify-center space-x-5  w-full">
                                <Pressable 
                                    onPress={() => handlePriority('low')}
                                    className={`border py-5 px-3.5 rounded-[18px]  items-center w-24 ${priority === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                >
                                    <Text className='text-sm'>{t('newTask.priorities.low')}</Text>
                                </Pressable>
                                <Pressable 
                                    onPress={() => handlePriority('medium')}
                                    className={`border py-5 px-3.5 rounded-[18px]  items-center w-24 ${priority === 'medium' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                >
                                    <Text className='text-sm'>{t('newTask.priorities.medium')}</Text>
                                </Pressable>
                                <Pressable 
                                    onPress={() => handlePriority('high')}
                                    className={`border py-5 px-3.5 rounded-[18px]  items-center w-24 ${priority === 'high' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                >
                                    <Text className='text-sm'>{t('newTask.priorities.high')}</Text>    
                                </Pressable>
                            </View>
                        }
                        <Pressable 
                            onPress={handlePrioritiesInfoPressed}
                            className=" items-start mt-6"
                        >
                            <Ionicons name="information-circle-outline" size={24} color="black"/>
                            {prioritiesInfoOpen && 
                                <View className=" mt-2.5 w-4/5 self-center">
                                    <Text className="text-sm">{t('newTask.priorities.info.high')}</Text>
                                    <Text className="text-sm">{t('newTask.priorities.info.medium')}</Text>
                                    <Text className="text-sm">{t('newTask.priorities.info.low')}</Text>
                                </View>
                            }
                            
                        </Pressable>
                    </View>
                    <View className=" border px-5 py-3.5 rounded-[18px] min-h-16">
                        <Pressable 
                            onPress={handleDifficultyPressed}
                            className="flex-row justify-between"
                        >
                            <View className="flex-row ">
                                <Ionicons name="warning" size={24} color="black" />
                                <Text className='ml-3.5 text-base font-medium'>{t('newTask.difficulty_levels.difficulty')}</Text>
                            </View>
                            <Entypo name={difficultyOpen ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                        </Pressable>
                        {difficultyOpen && 
                            <View className="mt-7 flex-row flex-wrap justify-center  space-y-5 items-center mx-auto">
                                <Pressable 
                                    onPress={() => handleDifficulty(1)}
                                    className={`border py-5 px-3.5 rounded-[18px] items-center w-2/5 mr-5 ${difficutly === 1 ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                    <Text className='text-sm	'>{t('newTask.difficulty_levels.easy')}</Text>
                                </Pressable>
                                <Pressable 
                                    onPress={() => handleDifficulty(2)}
                                    className={`border py-5 px-3.5 rounded-[18px] items-center w-2/5 ${difficutly === 2 ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                    <Text className='text-sm	'>{t('newTask.difficulty_levels.medium')}</Text>
                                </Pressable>
                                <Pressable 
                                    onPress={() => handleDifficulty(3)}
                                    className={`border py-5 px-3.5 rounded-[18px] items-center w-2/5 mr-5 ${difficutly === 3 ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                    <Text className='text-sm'>{t('newTask.difficulty_levels.hard')}</Text>    
                                </Pressable>
                                <Pressable 
                                    onPress={() => handleDifficulty(4)}
                                    className={`border py-5 px-3.5 rounded-[18px] items-center w-2/5 ${difficutly === 4 ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                    <Text className='text-sm'>{t('newTask.difficulty_levels.very_hard')}</Text>    
                                </Pressable>
                            </View>
                        }
                        <View className=" flex-row items-center justify-start mt-6">
                            <Ionicons name="information-circle-outline" size={24} color="black"  />
                            <Text className="ml-2.5">{t("newTask.difficulty_levels.info")}</Text>
                        </View>
                    </View>
                    <View className=" border px-5 py-3.5 rounded-[18px] min-h-16">
                        <Pressable 
                            onPress={handleTimeBlockPressed}
                            className="flex-row justify-between"
                        >
                            <View className="flex-row">
                                <Ionicons name="time" size={24} color="black" />
                                <Text className='ml-3.5 text-base font-medium'>{t('newTask.timeblocks.timeblock')}</Text>
                            </View>
                            <Entypo name={timeBlockOpen ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                        </Pressable>
                        {timeBlockOpen && 
                            <View className="mt-7 flex-row flex-wrap justify-center  space-y-5 items-center mx-auto">
                                <Pressable
                                    onPress={() => handleTimeBlock('08b61182-86a9-4141-8ae3-69c0c3bff440')}
                                    className={`py-5 px-3.5 w-2/5 mr-5 rounded-[18px] flex justify-center items-center  border ${selectedTimeBlock === '08b61182-86a9-4141-8ae3-69c0c3bff440' ? 'border-[#548164] bg-[#EEF3ED]' : ''} `}
                                >
                                    <Text>{t('newTask.timeblocks.all')}</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleTimeBlock('f0381068-50ee-4f3f-8763-bbf9e0cdd146')}
                                    className={`py-5 px-3.5 w-2/5  rounded-[18px] flex justify-center items-center  border ${selectedTimeBlock === 'f0381068-50ee-4f3f-8763-bbf9e0cdd146' ? 'border-[#548164] bg-[#EEF3ED]' : ''} `}
                                >
                                    <Text>{t('newTask.timeblocks.work')}</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleTimeBlock('f53bbfa2-3fc8-4cb0-8d94-8a17330a969b')}
                                    className={`py-5 px-3.5 w-2/5 mr-5 rounded-[18px] flex justify-center items-center  border ${selectedTimeBlock === 'f53bbfa2-3fc8-4cb0-8d94-8a17330a969b' ? 'border-[#548164] bg-[#EEF3ED]' : ''} `}
                                >
                                    <Text>{t('newTask.timeblocks.morning')}</Text>
                                </Pressable>
                            </View>
                        }
                    </View>
                </View>
            

                    {/* <Button 
                        onPress={() => setShowDatePicker(!showDatePicker)}
                        title="Pick a date"
                    />
                         */}
                    {/* {showDatePicker && (
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
                    )} */}
                
                <Link
                    href={'../'}
                >
                    Cancel
                </Link>
                
                <Button  
                onPress={() => addTodo(newTodo!)} 
                title="Validate"
                />
            </View>
        </ScrollView>
        </>
    )
}