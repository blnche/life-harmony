import React, { useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTasks } from '~/providers/TasksProvider';
import { useTranslation } from "react-i18next";
import { Stack } from 'expo-router';
import { useRoute } from '@react-navigation/native'



export default function TasksListScreen() {
    const { todos } = useTasks();
    const { t } = useTranslation();
    const route = useRoute()
    const { status } = route.params || {}
    console.log(status)

    const filterTasksByStatus = useCallback((status) => {
        return todos?.filter(todo => {
        
            return todo.status === status
            
        });
    }, [todos]);

    const filteredTasks = filterTasksByStatus(status);

    return (
        <>
            <Stack.Screen options={{ 
                title: status, 
                headerStyle: {
                    backgroundColor: 'white'
                },
                headerTintColor: 'black',
                headerShadowVisible: false,
                // headerShown: false
            }} />
            <ScrollView className='border bg-white w-full min-h-full'>
                <View className='border items-center w-full'>
                    {filteredTasks && filteredTasks?.length > 0 ? (
                        filteredTasks.map((task, index) => (
                            <View key={index} className='max-w-[360] min-h-[55] rounded-[18px] mb-5 px-5 bg-white flex-row justify-between items-center shadow-sm border'>
                                <Text>{task.task}</Text>
                                <Text>Status: {task.status}</Text>
                            </View>
                        ))
                    ) : (
                        <Text>No tasks found for this status</Text>
                    )}
                </View>
            </ScrollView>
        </>
    );
}
