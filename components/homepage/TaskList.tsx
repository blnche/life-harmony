import { Entypo, FontAwesome6 } from "@expo/vector-icons"
import { View , Text, Pressable} from "react-native"
import { Database } from '~/utils/supabase-types';
import Task from "../Task"
import { useState } from "react";
import { usePostHog } from "posthog-react-native";

type Todo = Database['public']['Tables']['todos']['Row']

const TaskList = ({ t, tasksHigh, tasksMedium, tasksLow } : {t: (key: string) => string, tasksHigh : Todo[], tasksMedium : Todo[], tasksLow : Todo[] }) => {
  
  // TOOLS  
  const posthog = usePostHog()
  const highPriority = t('high')
  const mediumPriority = t('medium')
  const lowPriority = t('low')

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
                      if(todo.priority === highPriority) {
                          return (
                              <Task key={todo.id} {...todo} />
                          )
                      }
                  })}
              </>
            )}
            {tasksMedium && tasksMedium.length > 0 && (
                <>
                    <View className="flex-row mb-4">
                        <FontAwesome6 name="fire-burner" size={24} color="black" />                    
                    </View>
                    {tasksMedium.map((todo : Todo) => {
                        if(todo.priority === mediumPriority) {
                            return (
                                <Task key={todo.id} {...todo} />
                            )
                        }
                    })}
                </>
            )}
            {tasksLow && tasksLow.length > 0 && (
                <>
                    <View className="flex-row mb-4">
                        <FontAwesome6 name="sink" size={24} color="black" />                    
                    </View>
                    {tasksLow.map((todo : Todo) => {
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

export default TaskList