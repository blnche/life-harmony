import { Entypo, Ionicons } from "@expo/vector-icons"
import { FontAwesome6 } from '@expo/vector-icons';
import { View , Text, Pressable} from "react-native"
import { Database } from '~/utils/supabase-types';
import Task from "../Task"
import { useState } from "react";
import { usePostHog } from "posthog-react-native";
import { useTranslation } from "react-i18next";

type Todo = Database['public']['Tables']['todos']['Row']

const OverdueTaskList = ({ t, overdueTasksHigh, overdueTasksMedium, overdueTasksLow  } : {t: (key: string) => string, overdueTasksHigh : Todo[], overdueTasksMedium : Todo[], overdueTasksLow : Todo[] }) => {
    // TOOLS  
    const posthog = usePostHog()
    const highPriority = t('high')
    const mediumPriority = t('medium')
    const lowPriority = t('low')
    // console.log(overdueTasksHigh)
    // console.log(overdueTasksMedium)
    // console.log(overdueTasksLow)

    const [overdueOpen, setOverdueOpen] = useState(true)

    const handleOverduePressed = () => {
        setOverdueOpen(prevState => !prevState)
    }

    return (
        <View className='border-b pb-4 mb-4'>
            <Pressable 
                onPress={handleOverduePressed}
                className='flex-row justify-between mb-4'
            >
                <Text className='text-base font-black'>{t('homepage.tasks_container.overdue')}</Text>
                <Entypo name={overdueOpen ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
            </Pressable>
            <View>
                {overdueOpen && overdueTasksHigh && overdueTasksHigh.length > 0 && (
                    <>
                        <View className="flex-row mb-4">
                            <FontAwesome6 name="fire-burner" size={24} color="black" />
                            <FontAwesome6 name="fire-burner" size={24} color="black" />                    
                        </View>
                        {overdueTasksHigh.map((todo : Todo) => {
                            if(todo.priority === highPriority) {
                                return (
                                    <Task key={todo.id} {...todo} />
                                )
                            }
                        })}
                    </>
                )}
                {overdueOpen && overdueTasksMedium && overdueTasksMedium.length > 0 && (
                    <>
                        <View className="flex-row mb-4">
                            <FontAwesome6 name="fire-burner" size={24} color="black" />                    
                        </View>
                        {overdueTasksMedium.map((todo : Todo) => {
                            if(todo.priority === mediumPriority) {
                                return (
                                    <Task key={todo.id} {...todo} />
                                )
                            }
                        })}
                    </>
                )}
                {overdueOpen && overdueTasksLow && overdueTasksLow.length > 0 && (
                    <>
                        <View className="flex-row mb-4">
                            <FontAwesome6 name="sink" size={24} color="black" />                    
                        </View>
                        {overdueTasksLow.map((todo : Todo) => {
                            console.log(todo)
                            if(todo.priority === lowPriority) {
                                return (
                                    <Task key={todo.id} {...todo} />
                                )
                            }
                        })}
                    </>
                )}
            </View>
        </View>
    )
}

export default OverdueTaskList