import { Entypo } from "@expo/vector-icons"
import { View , Text, Pressable} from "react-native"
import { Database } from '~/utils/supabase-types';
import Task from "../Task"
import { useState } from "react";

type Todo = Database['public']['Tables']['todos']['Row']

const CompletedTaskList = ({ t, completedTasks } : {t: (key: string) => string, completedTasks : Todo[] }) => {
    const [completedOpen, setCompletedOpen] = useState(false)

    const handleCompletedPressed = () => {
        setCompletedOpen(prevState => !prevState)
    }
    
    return (
        <View className='pb-4 mb-4'>
            <Pressable 
                onPress={handleCompletedPressed}
                className='flex-row justify-between mb-4'
            >
                <Text className='text-base font-black'>{t('homepage.tasks_container.completed')}</Text>
                <Entypo name={completedOpen ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
            </Pressable>
            {completedOpen && 
                <View>
                    {completedTasks && completedTasks
                    .sort((a, b) => new Date(b.marked_done_at || 0).getTime() - new Date(a.marked_done_at || 0).getTime()) //from most recent to least recent with a fallback if no marked_done_date date (should not be possible)
                    .map((todo : Todo) => {
                        return (
                            <Task key={todo.id} {...todo} />
                        )
                    })}
                </View>
            }
        </View>
    )
}

export default CompletedTaskList