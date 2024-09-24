import { Button, Pressable, View, Text, Platform, SafeAreaView } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

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
    const [android, setAndroid] = useState<string | null>(null)
    const [doDateSelected, setDoDateSelected] = useState<Date | null>(null)
    const [dueDateSelected, setDueDateSelected] = useState<Date | null>(null)
    const [doDateTimeSelected, setDoDateTimeSelected] = useState<Date | null>(null)
    const [dueDateTimeSelected, setDueDateTimeSelected] = useState<Date | null>(null)
    const [dateSelected, setDateSelected] = useState<string | null>(null)
    
    const [showDoDatePicker, setShowDoDatePicker] = useState(false)
    const [showDoDateTimePicker, setShowDoDateTimePicker] = useState(false)
    const [showDueDatePicker, setShowDueDatePicker] = useState(false)
    const [showDueDateTimePicker, setShowDueDateTimePicker] = useState(false)
    
    const checkNewTodoDates = (newTodo) => {
        console.log(`_________________`)
        console.log(`function called`)
        const isDoDateSet = newTodo.do_date && new Date(newTodo.do_date).getTime() > 0
        const doDateHasTimeSet = isDoDateSet && new Date(newTodo.do_date).getHours() !== 0
        
        const isDueDateSet = newTodo.due_date && new Date(newTodo.due_date).getTime() > 0
        const dueDateHasTimeSet = isDueDateSet && new Date(newTodo.due_date).getHours() !== 0

        if(isDoDateSet) {
            const newDate = new Date(newTodo.do_date)
            console.log('New Do Date:', newDate);

            if(newDate.getTime() !== date.getTime()) {
                setDate(newDate)

                const today = new Date()
                today.setHours(0, 0, 0, 0)
                console.log('Today:', today)

                const startOfWeek = new Date(today)
                startOfWeek.setDate(today.getDate() - today.getDay() + 1)
                startOfWeek.setHours(0, 0, 0, 0)
                console.log('Start of Week:', startOfWeek)
                
                const endOfWeek = new Date(startOfWeek)
                endOfWeek.setDate(endOfWeek.getDate() + 6)
                console.log('End of Week:', endOfWeek)

                const nextMonday = new Date(startOfWeek)
                nextMonday.setDate(startOfWeek.getDate() + 7)
                nextMonday.setHours(0, 0, 0, 0)
                console.log('Next Monday:', nextMonday)

                if(newDate.toDateString() === today.toDateString()) {
                    setDateSelected('today')
                } else if (newDate.toDateString() === new Date(today.setDate(today.getDate() + 1)).toDateString()) {
                    setDateSelected('tomorrow')
                } else if (new Date >= startOfWeek && newDate <= endOfWeek) {
                    const dayOfWeek = newDate.getDay()
                    console.log('Day of Week:', dayOfWeek);

                    if(dayOfWeek === 5) {
                        console.log(`Setting dateSelected to 'laterThisWeek'`);
                        setDateSelected('laterThisWeek')
                    } else if (dayOfWeek === 6) {
                        console.log(`Setting dateSelected to 'thisWeekend'`);
                        setDateSelected('thisWeekend')
                    } else if (dayOfWeek === 1) {
                        const daysFromToday = (newDate - today) / (1000 * 60 * 60 * 24)
                        console.log('Days from Today:', daysFromToday);

                        if(daysFromToday > 0) {
                        }
                    } 
                } else if (newDate.toDateString() === nextMonday.toDateString()) {
                    console.log(`Setting dateSelected to 'nextWeek'`);
                    setDateSelected('nextWeek')
                } else {
                    console.log(`Setting dateSelected to 'customDate'`);
                    setDoDateSelected(newDate)
                    setDateSelected('customDate')
                }

                if(doDateHasTimeSet) {
                    console.log('Setting Do Date Time Selected:', newDate);
                    setDoDateTimeSelected(newDate)
                }
            }
        } 
        if(isDueDateSet) {
            const newDate = new Date(newTodo.due_date)

            if(newDate.toDateString() !== dueDate?.toDateString()){
                console.log('Setting Due Date Selected:', newDate);
                setDueDate(newDate)
                
                setDueDateSelected(newDate)
    
                if(dueDateHasTimeSet) {                
                    console.log('Setting Due Date Time Selected:', newDate);
                    setDueDateTimeSelected(newDate)
                }
            }
        } 
        console.log(`_________________`)
    }

    checkNewTodoDates(newTodo) 
 
    const onChange = (event : DateTimePickerEvent, selectedDate : Date) => {
        let id = event._dispatchInstances?.memoizedProps?.testID
        // console.log(event.type)
        console.log(selectedDate)
        // console.log(id)

        if(event.type === 'dismissed') {
            console.log(`was dismissed`)
        }
        
        if(Platform.OS !== 'ios') {
            id = android
            
            if(event.type === 'neutralButtonPressed' && id === 'doDateTimePicker') {
                handleTimeCleared() // not working
            }
        }
        console.log(id)

        if(id === 'doDatePicker') {
            setShowDoDatePicker(false)
            setDoDateSelected(selectedDate)
            setDate(selectedDate)
            setDateSelected('customDate')
            handleDoDate(selectedDate)
        } else if(id === 'doDateTimePicker') {
            setShowDoDateTimePicker(false)
            setDoDateTimeSelected(selectedDate)
            setDate(selectedDate)
            handleDoDate(selectedDate)
        } else if(id === 'dueDatePicker') {
            setShowDueDatePicker(false)
            setDueDate(selectedDate)
            handleDueDate(selectedDate)
            // if(Platform.OS !== 'ios') {
            //     setShowDueDateTimePicker(false)
            // }
        } else if(id === 'dueDateTimePicker') {
            setShowDueDateTimePicker(false)
            setDueDateSelected(selectedDate)
            setDueDate(selectedDate)
            handleDueDate(selectedDate)
            if(Platform.OS !== 'ios') {
                setShowDueDatePicker(false)
            }
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
    
    const handleTimeCleared = () => {
        setShowDoDateTimePicker(false)

        const dateRemovedTime = new Date(date)
        dateRemovedTime.setHours(0, 0, 0, 0)

        setDate(dateRemovedTime)
        setDoDateTimeSelected(null)
        handleDoDate(dateRemovedTime)
    }

    const handleDueDateCleared = () => {
        setShowDueDatePicker(false)
        setShowDueDateTimePicker(false)

        const dateRemovedTime = new Date(date)
        dateRemovedTime.setHours(0, 0, 0, 0)

        setDueDate(dateRemovedTime)
        setDueDateSelected(null)
        setDueDateTimeSelected(null)
        handleDueDate(null)
    }
    
    const handleDueDateTimeCleared = () => {
        setShowDueDateTimePicker(false)
        setShowDueDatePicker(false)

        const dateRemovedTime = new Date(date)
        dateRemovedTime.setHours(0, 0, 0, 0)
        
        setDueDate(dateRemovedTime)
        setDueDateTimeSelected(null)
        handleDueDate(dateRemovedTime)
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
                                    const currentDate = new Date()
                                    if(doDateTimeSelected) {
                                        currentDate.setHours(doDateTimeSelected.getHours(), doDateTimeSelected.getMinutes())
                                    } else {
                                        currentDate.setHours(0, 0, 0, 0)
                                    }
                                    handleDoDate(currentDate)
                                    setDateSelected('today')
                                    setDate(currentDate)
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
                                    const predefinedDate = renderPrefinedDates(t('newTask.schedule.tomorrow'))?.date
                                    if(doDateTimeSelected) {
                                        predefinedDate?.setHours(doDateTimeSelected.getHours(), doDateTimeSelected.getMinutes())
                                    } else {
                                        predefinedDate?.setHours(0, 0, 0, 0)
                                    }
                                    handleDoDate(predefinedDate)
                                    setDateSelected('tomorrow')
                                    setDate(predefinedDate)
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
                                    const predefinedDate = renderPrefinedDates(t('newTask.schedule.later_this_week'))?.date
                                    if(doDateTimeSelected) {
                                        predefinedDate?.setHours(doDateTimeSelected.getHours(), doDateTimeSelected.getMinutes())
                                    } else {
                                        predefinedDate?.setHours(0, 0, 0, 0)
                                    }
                                    handleDoDate(predefinedDate)
                                    setDateSelected('laterThisWeek')
                                    setDate(predefinedDate)
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
                                    const predefinedDate = renderPrefinedDates(t('newTask.schedule.this_weekend'))?.date
                                    if(doDateTimeSelected) {
                                        predefinedDate?.setHours(doDateTimeSelected.getHours(), doDateTimeSelected.getMinutes())
                                    } else {
                                        predefinedDate?.setHours(0, 0, 0, 0)
                                    }
                                    handleDoDate(predefinedDate)
                                    setDateSelected('thisWeekend')
                                    setDate(predefinedDate)
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
                                    const predefinedDate = renderPrefinedDates(t('newTask.schedule.next_week'))?.date
                                    if(doDateTimeSelected) {
                                        predefinedDate?.setHours(doDateTimeSelected.getHours(), doDateTimeSelected.getMinutes())
                                    } else {
                                        predefinedDate?.setHours(0, 0, 0, 0)
                                    }
                                    handleDoDate(predefinedDate)
                                    setDateSelected('nextWeek')
                                    setDate(predefinedDate)
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
                                onPress={() => {
                                    setShowDoDatePicker(!showDoDatePicker)
                                    setAndroid('doDatePicker')
                                }}
                                className={` py-1 px-2.5 w-full rounded-lg ${dateSelected === 'customDate' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className="flex-row justify-between items-center ">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="calendar-search" size={24} color="black" />                                        
                                        <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.pick_date')}</Text>
                                    </View>
                                    <Text>{doDateSelected && dateSelected === 'customDate' ? doDateSelected.toLocaleDateString(undefined, {day: '2-digit', weekday: 'short', month: 'short'}) : ''}</Text>
                                </View>
                                {showDoDatePicker && 
                                    <>
                                        <View className="mt-3 flex-row justify-center items-center">
                                            <DateTimePicker
                                                testID="doDatePicker"
                                                value={date}
                                                mode='date'
                                                onChange={onChange}
                                            />
                                        </View>
                                    </>
                                }
                            </Pressable>
                        </View>
                        <Pressable 
                            onPress={() => {
                                setShowDoDateTimePicker(!showDoDateTimePicker)
                                setAndroid('doDateTimePicker')
                            }}
                            className='w-[360] rounded-[18px] mt-3.5 mb-5 py-3 px-5 bg-white shadow-sm border'
                        >
                            <View className="flex-row justify-between">
                                <Text className='text-base font-medium'>Time</Text>
                                <View className="flex-row items-center">
                                    <Text>{doDateTimeSelected ? doDateTimeSelected.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'}) : t('newTask.none')}</Text>
                                    <Entypo name={showDoDateTimePicker ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                                </View>
                            </View>
                            {showDoDateTimePicker && 
                                <View className="justify-between flex-row mt-2 ">
                                    <View className=" mr-3">
                                        <DateTimePicker
                                            testID="doDateTimePicker"
                                            value={date}
                                            mode='time'
                                            is24Hour={true}
                                            onChange={onChange}
                                            neutralButton={{label: 'Clear'}}
                                        />
                                    </View>
                                    {Platform.OS === 'ios' && 
                                        <Pressable
                                            onPress={handleTimeCleared}
                                            className=" py-2 px-3 rounded-md"
                                        >
                                            <Entypo name='cross' size={24} color="#E63946" />
                                        </Pressable>
                                    }
                                </View>
                            }
                        </Pressable>
                        <Pressable 
                            onPress={() => {
                                setShowDueDatePicker(!showDueDatePicker)
                            }}
                            className='w-[360] rounded-[18px] mt-3.5 mb-5 py-3 px-5 bg-white shadow-sm border'
                        >
                            <View className="flex-row justify-between">
                                <Text className='text-base font-medium'>Due date</Text>
                                <View className="flex-row items-center">
                                    <Text>{dueDateSelected ? dueDateSelected.toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long', 
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : t('newTask.none')}</Text>
                                    <Entypo name={showDueDatePicker ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                                </View>
                            </View>
                            {Platform.OS === 'ios' && showDueDatePicker && 
                                <View className="mt-2 justify-between">
                                    <View className="items-center flex-row justify-between">
                                        <View className="mr-3">
                                            <DateTimePicker
                                                testID="dueDatePicker"
                                                value={dueDate ? dueDate : date}
                                                mode='date'
                                                is24Hour={true}
                                                onChange={onChange}
                                            />
                                        </View>
                                        <Pressable
                                            onPress={handleDueDateCleared}
                                            className="py-2 px-3 rounded-md"
                                        >
                                            <Entypo name='cross' size={24} color="#E63946" />
                                        </Pressable>
                                    </View>
                                    <View className="items-center flex-row justify-between">
                                        <View className="mr-3">
                                            <DateTimePicker
                                                testID="dueDateTimePicker"
                                                value={dueDate ? dueDate : date}
                                                mode='time'
                                                is24Hour={true}
                                                onChange={onChange}
                                            />
                                        </View>
                                        <Pressable
                                            onPress={handleDueDateTimeCleared}
                                            className="py-2 px-3 rounded-md"
                                        >
                                            <Entypo name='cross' size={24} color="#E63946" />
                                        </Pressable>
                                    </View>
                                </View>
                            }
                            {Platform.OS !== 'ios' && (
                                <View className="mt-2 justify-between">
                                    <View className="items-center flex-row justify-between">
                                        <Pressable 
                                            onPress={() => {
                                                setShowDueDatePicker(!showDueDatePicker)
                                                setAndroid('dueDatePicker')
                                            }}
                                            className='py-1 px-2.5 rounded-lg bg-[#EFEFF0] items-center'
                                        >
                                            <Text className="text-lg">{dueDate ? dueDate.toLocaleDateString(undefined, {day: '2-digit', month: 'short', year: 'numeric'}) : date.toLocaleDateString(undefined, {day: '2-digit', month: 'short', year: 'numeric'}) }</Text>
                                        </Pressable>
                                        {showDueDatePicker && 
                                            <DateTimePicker
                                                testID="dueDatePicker"
                                                value={dueDate ? dueDate : date}
                                                mode='date'
                                                is24Hour={true}
                                                onChange={onChange}
                                            />
                                        }
                                            <Pressable
                                                onPress={handleDueDateCleared}
                                                className="py-2 px-3 rounded-md"
                                                >
                                                <Entypo name='cross' size={24} color="#E63946" />
                                            </Pressable>
                                    </View>
                                    <View className="items-center flex-row justify-between">
                                        <Pressable 
                                            onPress={() => {
                                                setShowDueDateTimePicker(!showDueDateTimePicker)
                                                setAndroid('dueDateTimePicker')
                                            }}
                                            className='py-1 px-2.5 rounded-lg bg-[#EFEFF0] items-center'
                                        >
                                            <Text className="text-lg">{dueDate ? dueDate.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'}) : date.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'}) }</Text>
                                        </Pressable>
                                        {showDueDateTimePicker &&
                                            <DateTimePicker
                                                testID="dueDateTimePicker"
                                                value={dueDate ? dueDate : date}
                                                mode='time'
                                                is24Hour={true}
                                                onChange={onChange}
                                            />
                                        }
                                            <Pressable
                                                onPress={handleDueDateTimeCleared}
                                                className="py-2 px-3 rounded-md"
                                            >
                                                <Entypo name='cross' size={24} color="#E63946" />
                                            </Pressable>
                                    </View>
                                </View>
                            )}
                        </Pressable>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    )
}