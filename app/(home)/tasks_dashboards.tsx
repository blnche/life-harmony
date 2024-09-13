import { View, Alert, Button, Text, TextInput, SafeAreaView, ScrollView } from 'react-native'
import { useTasks } from '~/providers/TasksProvider';
import { usePostHog } from 'posthog-react-native';
import { useTranslation } from "react-i18next";
import { useCallback } from 'react'
import { Stack } from 'expo-router';


export default function ProfileScreen() {

    const { todos, setTodos } = useTasks()
    const posthog = usePostHog()
    const {t} = useTranslation()

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
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Total Someday :</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('someday'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Total Backlog :</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('backlog'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Total In progress :</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('in_progress'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Total In review :</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('in_review'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Total Waiting :</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('waiting'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Total Cancelled :</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('cancelled'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Total Done :</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus(t('done'))?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Total No status :</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus('')?.length}</Text>
                        </View>
                        <View className='h-36 w-36 space-y-3 border rounded-[18px] justify-center items-center shadow-sm'>
                            <Text>Total Problem :</Text>
                            <Text className='text-lg font-bold'>{filterTasksByStatus('problem')?.length}</Text>
                        </View>
                    </View>
                </ScrollView>
            </>
        )}
        </>
    )
}