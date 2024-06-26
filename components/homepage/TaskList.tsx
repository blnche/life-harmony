import { Entypo } from "@expo/vector-icons"
import { View , Text, Pressable} from "react-native"
import { Database } from '~/utils/supabase-types';
import Task from "../Task"
import { useState } from "react";

type Todo = Database['public']['Tables']['todos']['Row']

const TaskList = ({ t, tasks } : {t: (key: string) => string, tasks : Todo[] }) => {
    

    return (
        <View className='pb-4 mb-4'>
                <View>
                  {tasks && tasks.length > 0 && tasks.map((todo : Todo) => {
                    return (
                        <Task key={todo.id} {...todo} />
                    )
                  })}
                  {tasks && tasks.length == 0 && <Text>No task planned for today</Text>}
                </View>
            </View>
    )
}

export default TaskList