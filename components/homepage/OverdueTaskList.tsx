import { Entypo } from "@expo/vector-icons"
import { View , Text, Pressable} from "react-native"
import { Database } from '~/utils/supabase-types';
import Task from "../Task"
import { useState } from "react";

type Todo = Database['public']['Tables']['todos']['Row']

const OverdueTaskList = ({ t, overdueTasks } : {t: (key: string) => string, overdueTasks : Todo[] }) => {
    const [overdueOpen, setOverdueOpen] = useState(true)

    const handleOverduePressed = () => {
        setOverdueOpen(prevState => !prevState)
    }

    return (
        <View className='border-b pb-4 mb-4'>
            <View className='flex-row justify-between mb-4'>
                <Text className='text-base font-black'>{t('homepage.tasks_container.overdue')}</Text>
                <Pressable onPress={handleOverduePressed}>
                    <Entypo name={overdueOpen ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                </Pressable>
            </View>
            {overdueOpen && 
                <View>
                    {overdueTasks && overdueTasks.map((todo : Todo) => {
                    return (
                        <Task key={todo.id} {...todo} />
                    )
                    })}
                </View>
            }
        </View>
    )
}

export default OverdueTaskList