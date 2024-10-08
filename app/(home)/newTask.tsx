import { Link, Stack } from "expo-router";
import { Text, View, Button, TextInput, Pressable, SafeAreaView, ScrollView } from "react-native";
import { Database } from "~/utils/supabase-types";
import { supabase } from "~/utils/supabase";
import { useUserProfile } from "~/providers/UserProfileProvider";
import { NewTaskProvider, useNewTaskContext } from "~/providers/NewTaskProvider";
import { useEffect, useState } from "react";
import { notion } from '~/utils/notion';
import { useNavigation } from '@react-navigation/native';


// import DateTimePicker from 'react-native-ui-datepicker'
import { useTasks } from "~/providers/TasksProvider";
import { useTranslation } from "react-i18next";
import { usePostHog } from "posthog-react-native";
import { Entypo } from "@expo/vector-icons";

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import { Drawer } from 'expo-router/drawer';
// import Schedule from "./Schedule";


type Todo = Database['public']['Tables']['todos']['Row']
type DifficultyLevel = Database['public']['Tables']['todo_difficulty_levels']['Row']


export default function NewTask ({ onClose }) {
    // PROVIDERS
    const { userProfile } = useUserProfile()
    const { todos, setTodos } = useTasks()

    // TOOLS  
    const posthog = usePostHog()
    const {t} = useTranslation()
    const navigation = useNavigation()
    const { newTodo, setNewTodo } = useNewTaskContext()

    console.log('-------------')
    console.log(newTodo)
    // const [newTodo, setNewTodo] = useState<Partial<Todo>>({
    //     difficulty_level: 2,
    //     priority: t('medium'),
    //     time_block_id: '08b61182-86a9-4141-8ae3-69c0c3bff440',
    //     user_id: userProfile?.id,
    //     status: t('backlog')
    // })
    const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([])
    

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
        console.log(`addTodo log ${newTodo}`)
        if(text?.length) {
          const { data: todo, error } = await supabase
            .from('todos')
            .insert(newTodo)
            .select('*')
            .single()
    
          // console.log(todo)
          if (error) {
            console.log(error)
          }
          else {

            setTodos(prevTodos => (prevTodos ? [...prevTodos, todo as Todo] : [todo as Todo]))
            onClose() // Dismiss the bottom modal sheet

            // ADD TASK TO NOTION TASK DB
            if(databaseId) {
                (async () => {
                    console.log(`addTodo if async ${todo}`)

                    const properties : {[key: string] : any} = {
                        [t('name')]: {
                            type: 'title',
                            title: [
                              {
                                text: {
                                  content: todo.task
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
                        [t('status')]: {
                            status: {
                                'name' : todo.status
                            },
                        },
                        [t('priority')]: {
                            select:{
                                'name' : todo.priority
                            }
                        }
                    }
  
                    if(todo.do_date) {
                        properties[t('do_date')] = {
                            date: {
                                'start' : todo.do_date!,
                            },
                        }
                    }

                    if(todo.due_date) {
                        properties[t('due_date')] = {
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
          }
        }
    }

    const handleSubmit = () => {
        console.log(`submit ${newTodo}`)
    }

    // HANDLES PRESSED OPEN/CLOSE PROPERTIES
    const [reminderOpen, setReminderOpen] = useState(false)
    const [priorityOpen, setPriorityOpen] = useState(false)
    const [difficultyOpen, setDifficultyOpen] = useState(false)
    const [timeBlockOpen, setTimeBlockOpen] = useState(false)

    const handleReminderPressed = () => {
        setReminderOpen(prevState => !prevState)
    }
    const handlePriorityPressed = () => {
        setPriorityOpen(prevState => !prevState)
    }
    const handleDifficultyPressed = () => {
        setDifficultyOpen(prevState => !prevState)
    }
    const handleTimeBlockPressed = () => {
        setTimeBlockOpen(prevState => !prevState)
    }

    // HANDLES SELECTED VALUE FOR PROPERTIES
    const [difficutly, setDifficulty] = useState<number>(2)
    const [selectedTimeBlock, setSelectedTimeBlock] = useState<string>('08b61182-86a9-4141-8ae3-69c0c3bff440')
    const [priority, setPriority] = useState("medium")
    const [reminder, setReminder] = useState({
        when: null,
        number: null,
        date: null
    })

    const handleReminder = (when: string, number: string | undefined ) => {
        console.log(when, number)
    }

    const handlePriority = ( level : string ) => {
        setPriority(level)
        setNewTodo({...newTodo as Todo, priority : level})
    }
    
    const handleDifficulty = ( level : number ) => {
        setDifficulty(level)
        setNewTodo({...newTodo as Todo, difficulty_level : level})
    }

    const handleTimeBlock = (blockId : string) => {
        setSelectedTimeBlock(blockId)
        setNewTodo({...newTodo as Todo, time_block_id : blockId})
    }

    return (
        <>
        <Stack.Screen options={{}}/>
        <ScrollView>
            <View className="p-[15px] h-full flex items-center bg-white">
                <View className="w-full flex-row justify-between">
                    <Pressable 
                        className="mb-5 self-end"
                        onPress={() => onClose()}
                    >
                        <Text className='text-base'>{t('newTask.cancel')}</Text>
                    </Pressable>
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
                            onPress={() => navigation.navigate('newTask_schedule')}
                            className='flex-row justify-between'
                        >
                            <View className="flex-row">
                                <Ionicons name="calendar" size={24} color="black" />
                                <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.schedule')}</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Text>{newTodo.do_date ? 'Set' : 'None'}</Text>
                                <Entypo name={'chevron-right'} size={24} color="black" />
                            </View>
                        </Pressable>
                    </View>
                    <View className=" border px-5 py-3.5 rounded-[18px] min-h-16">
                        <Pressable 
                            onPress={handleReminderPressed}
                            className='flex-row justify-between'
                        >
                            <View className="flex-row">
                                <Ionicons name="alarm" size={24} color="black" />
                                <Text className='ml-3.5 text-base font-medium'>{t('newTask.reminder.reminder')}</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Text>{reminder ? 'Set' : 'None'}</Text>
                                <Entypo name={reminderOpen ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                            </View>
                        </Pressable>
                        {reminderOpen && 
                        <View className="space-y-3 mt-3">
                            <Pressable
                                onPress={() => setReminder({
                                    when: null,
                                    number: null,
                                    date: null
                                })}
                            >
                                <Text>{t('newTask.reminder.none')}</Text>  
                            </Pressable>
                            <Pressable
                                onPress={() => handleReminder('onTimeDay', '')}
                            >
                                <Text>{t('newTask.reminder.on_time_day')}</Text>  
                            </Pressable>
                            <View className="flex-row items-center">
                                <View className="flex-row space-x-3">
                                    <Pressable 
                                        onPress={() => handleReminder('hours', '1')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${reminder === 'hours-1' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>1</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => handleReminder('hours', '2')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${reminder === 'hours-2' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>2</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => handleReminder('hours', '3')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${reminder === 'hours-3' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>3</Text>
                                    </Pressable>
                                </View>
                                <Text className="ml-3">{t('newTask.reminder.hours')}</Text>  
                            </View>
                            <View className="flex-row items-center">
                                <View className="flex-row space-x-3">
                                    <Pressable 
                                        onPress={() => handleReminder('minutes', '5')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${reminder === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>5</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => handleReminder('minutes', '10')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${reminder === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>10</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => handleReminder('minutes', '15')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${reminder === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>15</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => handleReminder('minutes', '30')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${reminder === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>30</Text>
                                    </Pressable>
                                </View>
                                <Text className="ml-3">{t('newTask.reminder.minutes')}</Text>  
                            </View>
                            <View className="flex-row items-center">
                                <View className="flex-row space-x-3">
                                    <Pressable 
                                        onPress={() => handleReminder('days', '1')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${reminder === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>1</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => handleReminder('days', '2')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${reminder === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>2</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => handleReminder('days', '3')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${reminder === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>3</Text>
                                    </Pressable>
                                </View>
                                <Text className="ml-3">{t('newTask.reminder.days')}</Text>  
                            </View>
                            <View className="flex-row items-center">
                                <View className="flex-row space-x-3">
                                    <Pressable 
                                        onPress={() => handleReminder('weeks', '1')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${priority === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>1</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => handleReminder('weeks', '2')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${priority === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>2</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => handleReminder('weeks', '3')}
                                        className={`border px-3 py-3.5 rounded-xl items-center w-9 ${priority === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                        <Text className='text-sm'>3</Text>
                                    </Pressable>
                                </View>
                                <Text className="ml-3">{t('newTask.reminder.weeks')}</Text>  
                            </View>
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
                                {newTodo.priority &&
                                    <Text>{newTodo.priority}</Text>
                                }
                                <Entypo name={priorityOpen ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                            </View>
                        </Pressable>
                        {priorityOpen &&
                        
                            <View className="mt-7 flex-row justify-center space-x-5  w-full">
                                <Pressable 
                                    onPress={() => handlePriority(t('low'))}
                                    className={`border py-5 px-3.5 rounded-[18px]  items-center w-24 ${priority === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                >
                                    <Text className='text-sm'>{t('newTask.priorities.low')}</Text>
                                </Pressable>
                                <Pressable 
                                    onPress={() => handlePriority(t('medium'))}
                                    className={`border py-5 px-3.5 rounded-[18px]  items-center w-24 ${priority === 'medium' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                >
                                    <Text className='text-sm'>{t('newTask.priorities.medium')}</Text>
                                </Pressable>
                                <Pressable 
                                    onPress={() => handlePriority(t('high'))}
                                    className={`border py-5 px-3.5 rounded-[18px]  items-center w-24 ${priority === 'high' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                >
                                    <Text className='text-sm'>{t('newTask.priorities.high')}</Text>    
                                </Pressable>
                            </View>
                        }
                        <View className=" items-start mt-6 flex-row">
                            <Ionicons name="information-circle-outline" size={24} color="black"/>
                            <View className="ml-2.5 w-5/6 self-center">
                                <Text className="text-sm">{t('newTask.priorities.info.high')}</Text>
                                <Text className="text-sm">{t('newTask.priorities.info.medium')}</Text>
                                <Text className="text-sm">{t('newTask.priorities.info.low')}</Text>
                            </View>
                        </View>
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
                            <View className="flex-row items-center">
                                {newTodo.difficulty_level &&
                                    <Text>{newTodo.difficulty_level}</Text>
                                }
                                <Entypo name={difficultyOpen ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                            </View>
                        </Pressable>
                        {difficultyOpen && 
                            <View className="mt-7 flex-row flex-wrap justify-center  space-y-5 items-center mx-auto">
                                <Pressable 
                                    onPress={() => handleDifficulty(1)}
                                    className={`border py-5 px-3.5 rounded-[18px] items-center w-2/5 mr-5 ${difficutly === 1 ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                    >
                                    <Text className='text-sm'>{t('newTask.difficulty_levels.easy')}</Text>
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
                        <View className=" flex-row items-start justify-start mt-6">
                            <Ionicons name="information-circle-outline" size={24} color="black"  />
                            <Text className="text-sm ml-2.5">{t("newTask.difficulty_levels.info")}</Text>
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
                <Pressable  
                    onPress={() => addTodo(newTodo!)} 
                    className='mt-6 border px-5 py-3.5 rounded-[18px] min-h-16'
                >
                    <Text className="text-base">{t('newTask.validate')}</Text>
                </Pressable>
            </View>
        </ScrollView>
        </>
    )
}