import { Button, Pressable, View, Text, Platform, SafeAreaView } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-react-native";
import { useTranslation } from "react-i18next";
import { Stack } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import { useRoute } from '@react-navigation/native'

import { useNewTaskContext } from "~/providers/NewTaskProvider";



export default function Schedule () {

    // TOOLS  
    const posthog = usePostHog()
    const {t} = useTranslation()
    const route = useRoute()
    const { newTodo, handleDoDate, handleDueDate } = useNewTaskContext()

    // DATE TIME PICKER 
    const [date, setDate] = useState(new Date())
    // date.setHours(0, 0, 0, 0)
    const [dueDate, setDueDate] = useState<Date | null>()
    // const [mode, setMode] = useState('date');
    // const [show, setShow] = useState(false);
    const [doDateSelected, setDoDateSelected] = useState<Date | null>(null)
    const [dueDateSelected, setDueDateSelected] = useState<Date | null>(null)
    const [doDateTimeSelected, setDoDateTimeSelected] = useState<Date | null>(null)
    const [dueDateTimeSelected, setDueDateTimeSelected] = useState<Date | null>(null)
    const [dateSelected, setDateSelected] = useState<string | null>(null)
    
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showDoDateTimePicker, setShowDoDateTimePicker] = useState(false)
    const [showDueDatePicker, setShowDueDatePicker] = useState(false)
    const [showDueDateTimePicker, setShowDueDateTimePicker] = useState(false)
    
    const checkNewTodoDates = (newTodo) => {
        const isDoDateSet = newTodo.do_date && new Date(newTodo.do_date).getTime() > 0
        const doDateHasTimeSet = isDoDateSet && new Date(newTodo.do_date).getHours() !== 0
        
        const isDueDateSet = newTodo.due_date && new Date(newTodo.due_date).getTime() > 0
        const dueDateHasTimeSet = isDueDateSet && new Date(newTodo.due_date).getHours() !== 0

        if(isDoDateSet) {
            const newDate = new Date(newTodo.do_date)

            if(newDate.getTime() !== date.getTime()){
                setDate(newDate)

                const today = new Date()
                today.setHours(0, 0, 0, 0)

                if(newDate.toDateString() === today.toDateString()) {
                    setDateSelected('today')
                } else {
                    const tomorrow = new Date(today)
                    tomorrow.setDate(today.getDate() + 1)

                    if(newDate.toDateString() === tomorrow.toDateString()) {
                        setDateSelected('tomorrow')
                    } else {
                        const dayOfWeek = newDate.getDay()

                        if(dayOfWeek === 5) {
                            setDateSelected('laterThisWeek')
                        } else if (dayOfWeek === 6) {
                            setDateSelected('thisWeekend')
                        } else if (dayOfWeek === 1) {
                            const daysFromToday = (newDate - today) / (1000 * 60 * 60 * 24)
                            if(daysFromToday > 0) {
                                setDateSelected('nextWeek')
                            }
                        } else {
                            setDoDateSelected(newDate)
                            setDateSelected('custom')
                        }
                    }
                }

                if(doDateHasTimeSet) {
                    setDoDateTimeSelected(newDate)
                }
            }
        } 
        if(isDueDateSet) {
            const newDate = new Date(newTodo.due_date)

            if(!dueDate) {

                setDueDateSelected(newDate)
                setDueDate(newDate)

                if(dueDateHasTimeSet) {
                    setDueDateTimeSelected(newDate)
                }
            } 
        } 
    }

    checkNewTodoDates(newTodo) 
 
    const onChange = (event, selectedDate) => {
        console.log(event._dispatchInstances?.memoizedProps?.testID)
        const id = event._dispatchInstances?.memoizedProps?.testID
        console.log(selectedDate)

        if(id === 'datePicker') {
            setShowDatePicker(!showDatePicker)
            setDoDateSelected(selectedDate)
            setDate(selectedDate)
            setDateSelected('customDate')
            handleDoDate(selectedDate)
        } else if(id === 'doDateTimePicker') {
            setShowDoDateTimePicker(!showDoDateTimePicker)
            setDoDateTimeSelected(selectedDate)
            setDate(selectedDate)
            handleDoDate(selectedDate)
        } else if(id === 'dueDateTimePicker') {
            setShowDueDateTimePicker(!showDueDateTimePicker)
            setDueDateTimeSelected(selectedDate)
            setDueDate(selectedDate)
            handleDueDate(selectedDate)
        } else if(id === 'dueDatePicker') {
            setShowDueDatePicker(!showDueDatePicker)
            setDueDateSelected(selectedDate)
            setDueDate(selectedDate)
            handleDueDate(selectedDate)
        }
        console.log(selectedDate.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false, 
        }))
        // setShow(false)
        // setDate(currentDate)
        // console.log(date)
        // console.log(dueDate)
    }

    const handleDueDateCleared = () => {
        setDueDate(null)
        setShowDueDatePicker(!showDueDatePicker)
        handleDueDate(null)
    }

    const handleTimeCleared = () => {
        const dateRemovedTime = new Date(date)
        dateRemovedTime.setHours(0, 0, 0, 0)
        setDate(dateRemovedTime)
        setShowTimePicker(!showTimePicker)
        setdoDateTimeSelected(null)
        handleDoDate(dateRemovedTime)
        // console.log(dateRemovedTime)
    }

    const renderPrefinedDates = (when : string) => {
        const options = {
            weekday: 'short',
            day: '2-digit'
        }
        // if(when === t('newTask.schedule.today')) {
        //     return new Date().toLocaleDateString(undefined, {day: '2-digit'})
        // } else 
        if(when === t('newTask.schedule.tomorrow')) {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            tomorrow.setHours(0, 0, 0, 0)

            return {date : tomorrow, string : tomorrow.toLocaleDateString(undefined, options)}
        } 
        else if (when === t('newTask.schedule.later_this_week')) {
            const laterThisWeek = new Date()
            const daysUntilFriday = (5 - laterThisWeek.getDay() + 7) % 7

            laterThisWeek.setDate(laterThisWeek.getDate() + daysUntilFriday)
            laterThisWeek.setHours(0, 0, 0, 0)

            return {date : laterThisWeek, string : laterThisWeek.toLocaleDateString(undefined, options)}
        } 
        else if (when === t('newTask.schedule.this_weekend')) {
            const thisWeekend = new Date()
            const daysUntiSaturday = (6 - thisWeekend.getDay() + 7) % 7

            thisWeekend.setDate(thisWeekend.getDate() + daysUntiSaturday)
            thisWeekend.setHours(0, 0, 0, 0)

            return {date : thisWeekend, string :thisWeekend.toLocaleDateString(undefined, options)}
        } 
        else if (when === t('newTask.schedule.next_week')) {
            const nextWeek = new Date()
            let daysUntilNextMonday = (1 - nextWeek.getDay() + 7) % 7

            if (daysUntilNextMonday === 0) {
                daysUntilNextMonday = 7
            }

            nextWeek.setDate(nextWeek.getDate() + daysUntilNextMonday)
            nextWeek.setHours(0, 0, 0, 0)

            return {date : nextWeek, string : nextWeek.toLocaleDateString(undefined, options)}
        }

        // return { date: new Date(), string: new Date().toLocaleDateString(undefined, options) };

    }
    
    // const showMode = (currentMode) => {
    //     setShow(true);
    //     setMode(currentMode);
    // };
    
    // const showDatepicker = () => {
    //     showMode('date');
    // };
    
    //   const showTimepicker = () => {
    //     showMode('time');
    // };

    return (
        <>
            <Stack.Screen options={{
                title: t('newTask.schedule.schedule'),
                headerStyle: {
                    backgroundColor: 'white'
                },
                headerTintColor: 'black',
                headerShadowVisible: false,
            }}/>
            <SafeAreaView>

                <View className="bg-white h-full items-center">
                    <ScrollView>
                        
                        <View className="max-w-[360] rounded-[18px] mt-3.5 mb-5 p-3 bg-white shadow-sm border">
                            <Pressable 
                                onPress={() => {
                                    handleDoDate(new Date())
                                    setDateSelected('today')
                                    setDate(new Date())
                                    date.setHours(0, 0, 0, 0)
                                }}
                                className={`py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full rounded-lg ${dateSelected === 'today' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className=" flex-row items-center justify-center">
                                    <Ionicons name="sunny" size={24} color="black" />
                                    <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.today')}</Text>
                                </View>
                                {/* <Text>{renderPrefinedDates(t('newTask.schedule.today'))}</Text> */}
                            </Pressable>
                            <Pressable 
                                onPress={() => {
                                    handleDoDate(renderPrefinedDates(t('newTask.schedule.tomorrow'))?.date)
                                    setDateSelected('tomorrow')
                                    setDate(renderPrefinedDates(t('newTask.schedule.tomorrow'))?.date)
                                    date.setHours(0, 0, 0, 0)
                                }}
                                className={` py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full rounded-lg ${dateSelected === 'tomorrow' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className=" flex-row items-center">
                                    <MaterialCommunityIcons name="arrow-collapse-right" size={20} color="black" />
                                    <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.tomorrow')}</Text>
                                </View>
                                <Text>{renderPrefinedDates(t('newTask.schedule.tomorrow'))?.string}</Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => {
                                    handleDoDate(renderPrefinedDates(t('newTask.schedule.later_this_week'))?.date)
                                    setDateSelected('laterThisWeek')
                                    setDate(renderPrefinedDates(t('newTask.schedule.later_this_week'))?.date)
                                    date.setHours(0, 0, 0, 0)
                                }}
                                className={` py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full rounded-lg ${dateSelected === 'laterThisWeek' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className=" flex-row items-center">
                                    <MaterialCommunityIcons name="chevron-double-right" size={24} color="black" />
                                    <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.later_this_week')}</Text>
                                </View>
                                <Text>{renderPrefinedDates(t('newTask.schedule.later_this_week'))?.string}</Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => {
                                    handleDoDate(renderPrefinedDates(t('newTask.schedule.this_weekend'))?.date)
                                    setDateSelected('thisWeekend')
                                    setDate(renderPrefinedDates(t('newTask.schedule.this_weekend'))?.date)
                                    date.setHours(0, 0, 0, 0)
                                }}
                                className={` py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full rounded-lg ${dateSelected === 'thisWeekend' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className=" flex-row items-center">
                                    <FontAwesome5 name="couch" size={20} color="black" />
                                    <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.this_weekend')}</Text>
                                </View>
                                <Text>{renderPrefinedDates(t('newTask.schedule.this_weekend'))?.string}</Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => {
                                    handleDoDate(renderPrefinedDates(t('newTask.schedule.next_week'))?.date)
                                    setDateSelected('nextWeek')
                                    setDate(renderPrefinedDates(t('newTask.schedule.next_week'))?.date)
                                    date.setHours(0, 0, 0, 0)
                                }}
                                className={` py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full rounded-lg ${dateSelected === 'nextWeek' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className=" flex-row items-center">
                                    <MaterialCommunityIcons name="calendar-end" size={24} color="black" />
                                    <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.next_week')}</Text>
                                </View>
                                <Text>{renderPrefinedDates(t('newTask.schedule.next_week'))?.string}</Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => {
                                    handleDoDate(null)
                                    setDateSelected('someday')
                                    setDate(new Date())
                                    date.setHours(0, 0, 0, 0)
                                }}
                                className={` py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full rounded-lg ${dateSelected === 'someday' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className=" flex-row items-center">
                                    <MaterialCommunityIcons name="calendar-question" size={24} color="black" />
                                    <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.someday')}</Text>
                                </View>
                            </Pressable>
                            <Pressable 
                                onPress={() => setShowDatePicker(!showDatePicker)}
                                className={` py-1 px-2.5 w-full rounded-lg ${dateSelected === 'custom' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className="flex-row justify-between items-center ">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="calendar-search" size={24} color="black" />                                        
                                        <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.pick_date')}</Text>
                                    </View>
                                    <Text>{doDateSelected ? doDateSelected.toLocaleDateString(undefined, {day: '2-digit', weekday: 'short', month: 'short'}) : ''}</Text>
                                </View>
                                {showDatePicker && 
                                    <>
                                        <View className="mt-3 flex-row justify-center items-center">
                                            <DateTimePicker
                                                testID="datePicker"
                                                value={date}
                                                mode='date'
                                                is24Hour={true}
                                                onChange={onChange}
                                            />
                                        </View>
                                    </>
                                }
                            </Pressable>
                        </View>
                        <Pressable 
                            onPress={() => setShowDoDateTimePicker(!showDoDateTimePicker)}
                            className='w-[360] rounded-[18px] mt-3.5 mb-5 py-3 px-5 bg-white shadow-sm border'
                        >
                            <View className="flex-row justify-between">
                                <Text className='text-base font-medium'>Time</Text>
                                <View className="flex-row items-center">
                                    <Text>{doDateTimeSelected ? doDateTimeSelected.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'}) : 'None'}</Text>
                                    <Entypo name={showDoDateTimePicker ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                                </View>
                            </View>
                            {showDoDateTimePicker && 
                                <View className="items-center space-y-4 mt-2 ">
                                    <View className=" mr-3">
                                        <DateTimePicker
                                            testID="doDateTimePicker"
                                            value={date}
                                            mode='time'
                                            is24Hour={true}
                                            onChange={onChange}
                                        />
                                    </View>
                                    {Platform.OS === 'ios' && 
                                        <Pressable
                                            onPress={handleTimeCleared}
                                            className=" py-2 px-3 rounded-md"
                                        >
                                            <Entypo name='cross' size={24} color="red" />
                                        </Pressable>
                                    }
                                </View>
                            }
                        </Pressable>
                        <Pressable 
                            onPress={() => setShowDueDatePicker(!showDueDatePicker)}
                            className='w-[360] rounded-[18px] mt-3.5 mb-5 py-3 px-5 bg-white shadow-sm border'
                        >
                            <View className="flex-row justify-between">
                                <Text className='text-base font-medium'>Due date</Text>
                                <View className="flex-row items-center">
                                    <Text>{dueDate ? dueDateSelected.toLocaleDateString() : 'None'}</Text>
                                    <Entypo name={showDueDatePicker ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                                </View>
                            </View>
                            {showDueDatePicker && 
                                <View className="items-center space-y-4 mt-2">
                                    <View className="mr-3">
                                        <DateTimePicker
                                            testID="dueDatePicker"
                                            value={dueDate ? dueDate : date}
                                            mode='date'
                                            is24Hour={true}
                                            onChange={onChange}
                                        />
                                    </View>
                                    {Platform.OS === 'ios' &&
                                        <Pressable
                                            onPress={handleDueDateCleared}
                                            className="py-2 px-3 rounded-md"
                                        >
                                            <Entypo name='cross' size={24} color="red" />
                                        </Pressable>
                                    }
                                    <View className=" mr-3">
                                        <DateTimePicker
                                            testID="dueDateTimePicker"
                                            value={dueDate}
                                            mode='time'
                                            is24Hour={true}
                                            onChange={onChange}
                                        />
                                    </View>
                                    {Platform.OS === 'ios' && 
                                        <Pressable
                                            onPress={handleTimeCleared}
                                            className=" py-2 px-3 rounded-md"
                                        >
                                            <Entypo name='cross' size={24} color="red" />
                                        </Pressable>
                                    }
                                </View>
                            }
                        </Pressable>
                        
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    )
}