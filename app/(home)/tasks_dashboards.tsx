import { View, Alert, Button, Text, TextInput, SafeAreaView, ScrollView, Pressable } from 'react-native'
import { useTasks } from '~/providers/TasksProvider';
import { usePostHog } from 'posthog-react-native';
import { useTranslation } from "react-i18next";
import { useCallback } from 'react'
import { Stack, useNavigation } from 'expo-router';


export default function TasksDashboards() {

    const { todos, setTodos } = useTasks()
    const posthog = usePostHog()
    const {t} = useTranslation()
    const navigation = useNavigation();


    const filterTasksByStatus = useCallback((status : string) => {
        return todos?.filter(todo => {
            if(status === t('done')) {
                return todo.status === t('done')
            }
            if(status === t('someday')) {
                return todo.status === t('someday')
            }
            if(status === t('backlog')) {
                return todo.status === t('backlog')
            }
            if(status === t('in_progress')) {
                return todo.status === t('in_progress')
            }
            if(status === t('in_review')) {
                return todo.status === t('in_review')
            }
            if(status === t('waiting')) {
                return todo.status === t('waiting')
            }
            if(status === t('cancelled')) {
                return todo.status === t('cancelled')
            }
            if(status === '') {
                return todo.status === null
            }
            if(status === 'problem') {
                return (
                    todo.status !== t('done') &&
                    todo.status !== t('someday') &&
                    todo.status !== t('backlog') &&
                    todo.status !== t('in_progress') &&
                    todo.status !== t('in_review') &&
                    todo.status !== t('waiting') &&
                    todo.status !== t('cancelled') &&
                    todo.status !== null
                )
            }
        })
    }, [todos])

    const checkIfProblem = () => {
        if (
            (filterTasksByStatus(t('someday'))?.length + 
            filterTasksByStatus(t('backlog'))?.length + 
            filterTasksByStatus(t('in_progress'))?.length + 
            filterTasksByStatus(t('in_review'))?.length + 
            filterTasksByStatus(t('waiting'))?.length + 
            filterTasksByStatus(t('cancelled'))?.length + 
            filterTasksByStatus(t('done'))?.length
        ) === todos?.length) {
            return console.log(`No problem`)
        }
        console.log(`Total todos = ${todos?.length}, but found ${(filterTasksByStatus(t('someday'))?.length + filterTasksByStatus(t('backlog'))?.length + filterTasksByStatus(t('in_progress'))?.length + filterTasksByStatus(t('in_review'))?.length + filterTasksByStatus(t('waiting'))?.length + filterTasksByStatus(t('cancelled'))?.length + filterTasksByStatus(t('done'))?.length)}`)
        return console.log(`Problem : ${todos?.length - (filterTasksByStatus(t('someday'))?.length + filterTasksByStatus(t('backlog'))?.length + filterTasksByStatus(t('in_progress'))?.length + filterTasksByStatus(t('in_review'))?.length + filterTasksByStatus(t('waiting'))?.length + filterTasksByStatus(t('cancelled'))?.length + filterTasksByStatus(t('done'))?.length)}`)
    }
    checkIfProblem()
    return (
        <>
        {todos && (
            <>
                <Stack.Screen options={{ 
                    title: 'Tasks Dashboard', 
                    headerStyle: {
                        backgroundColor: 'white'
                    },
                    headerTintColor: 'black',
                    headerShadowVisible: false,
                    // headerShown: false
                }} />

                <ScrollView className='bg-white min-h-full'>
                    <Text>Total : {todos.length}</Text>
                    <View className='border flex-row flex-wrap items-center justify-center space-y-3 space-x-3'>
                    {[
                                { label: t('someday'), status: t('someday') },
                                { label: t('backlog'), status: t('backlog') },
                                { label: t('in_progress'), status: t('in_progress') },
                                { label: t('in_review'), status: t('in_review') },
                                { label: t('waiting'), status: t('waiting') },
                                { label: t('cancelled'), status: t('cancelled') },
                                { label: t('done'), status: t('done') },
                                { label: 'No status', status: '' },
                                { label: 'Problem', status: 'problem' }
                            ].map((item, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => navigation.navigate('tasks_dashboards_child', { status: item.status })}
                                    className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'
                                >
                                    <Text>{item.label}</Text>
                                    <Text className='text-lg font-bold'>{filterTasksByStatus(item.status)?.length}</Text>
                                </Pressable>
                            ))}
                        {/* <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Someday</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('someday'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Backlog</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('backlog'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>In progress</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('in_progress'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>In review</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('in_review'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Waiting</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('waiting'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Cancelled</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('cancelled'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Done</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('done'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>No status</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus('')?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Problem</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus('problem')?.length}</Text>
                        </View> */}
                    </View>
                </ScrollView>
            </>
        )}
        </>
    )
}