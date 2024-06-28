import { Entypo, FontAwesome6 } from "@expo/vector-icons"
import { View , Text, Pressable} from "react-native"
import { Database } from '~/utils/supabase-types';
import Task from "../Task"
import { useState } from "react";
import { usePostHog } from "posthog-react-native";

type Todo = Database['public']['Tables']['todos']['Row']

interface TimeBlock {
    id: string;
    name: string;
}

const TaskList = ({ t, timeBlock, tasksHigh, tasksMedium, tasksLow } : {t: (key: string) => string, timeBlock : TimeBlock, tasksHigh : Todo[], tasksMedium : Todo[], tasksLow : Todo[] }) => {
  
    // TOOLS  
    const posthog = usePostHog()


    if((tasksHigh.length + tasksMedium.length + tasksLow.length) === 0) {
        return (
            <Text>No tasks</Text>
        )
    }
    return (
        <View className='pb-4 mb-4'>
            <View className="flex">
            {tasksHigh && tasksHigh.length > 0 && (
                <>
                    <View className="flex-row mb-4">
                        <FontAwesome6 name="fire-burner" size={24} color="black" />
                        <FontAwesome6 name="fire-burner" size={24} color="black" />                    
                    </View>
                    {tasksHigh.map((todo : Todo) => {
                            return (
                                <Task key={todo.id} {...todo} />
                            )
                        
                    })}
                </>
            )}
            {tasksMedium && tasksMedium.length > 0 && (
                <>
                    <View className="flex-row mb-4">
                        <FontAwesome6 name="fire-burner" size={24} color="black" />                    
                    </View>
                    {tasksMedium.map((todo : Todo) => {
                            return (
                                <Task key={todo.id} {...todo} />
                            )
                        
                    })}
                </>
            )}
            {tasksLow && tasksLow.length > 0 && (
                <>
                    <View className="flex-row mb-4">
                        <FontAwesome6 name="sink" size={24} color="black" />                    
                    </View>
                    {tasksLow.map((todo : Todo) => {
                            return (
                                <Task key={todo.id} {...todo} />
                            )
                        
                    })}
                </>
            )}
            </View>
        </View>
    )
}

export default TaskList