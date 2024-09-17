import { Button, Pressable, View, Text, Platform, SafeAreaView } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useState } from "react";
import { usePostHog } from "posthog-react-native";
import { useTranslation } from "react-i18next";
import { Stack } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import { useRoute } from '@react-navigation/native'


export default function Schedule () {

    // TOOLS  
    const posthog = usePostHog()
    const {t} = useTranslation()
    const route = useRoute()

    const { dateData } = route.params || {}
    console.log(dateData)


    // DATE TIME PICKER 
    const [date, setDate] = useState(new Date());
    date.setHours(0, 0, 0, 0)
    const [dueDate, setDueDate] = useState(null);
    // const [mode, setMode] = useState('date');
    // const [show, setShow] = useState(false);
    const [dateSelected, setDateSelected] = useState(null)
    const [dueDateSelected, setDueDateSelected] = useState(null)
    const [timeSelected, setTimeSelected] = useState(null)

    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [showDueDatePicker, setShowDueDatePicker] = useState(false)
    
    const onChange = (event, selectedDate) => {
        console.log(event._dispatchInstances?.memoizedProps?.testID)
        const id = event._dispatchInstances?.memoizedProps?.testID
        console.log(selectedDate)

        if(id === 'datePicker') {
            setShowDatePicker(!showDatePicker)
            setDateSelected(selectedDate)
            setDate(selectedDate)
        } else if(id === 'timePicker') {
            setShowTimePicker(!showTimePicker)
            setTimeSelected(selectedDate)
            setDate(selectedDate)
        } else if(id === 'dueDatePicker') {
            setShowDueDatePicker(!showDueDatePicker)
            setDueDateSelected(selectedDate)
            setDueDate(selectedDate)
        }
        // setShow(false)
        // setDate(currentDate)
        // console.log(date)
        // console.log(dueDate)
        dateData(selectedDate)
    };

    const handleDueDateCleared = () => {
        setDueDate(null)
        setShowDueDatePicker(!showDueDatePicker)
    }
    const handleTimeCleared = () => {
        const dateRemovedTime = new Date(date)
        dateRemovedTime.setHours(0, 0, 0, 0)
        setDate(dateRemovedTime)
        setShowTimePicker(!showTimePicker)
        console.log(dateRemovedTime)
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
                                onPress={() => console.log('today')}
                                className={`py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full rounded-lg ${dateSelected === 'today' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className=" flex-row items-center justify-center">
                                    <Ionicons name="sunny" size={24} color="black" />
                                    <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.today')}</Text>
                                </View>
                                <Text>Mon 9</Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => console.log('today')}
                                className={` py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full ${dateSelected === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className=" flex-row items-center">
                                    <MaterialCommunityIcons name="arrow-collapse-right" size={20} color="black" />
                                    <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.tomorrow')}</Text>
                                </View>
                                <Text>Tue 10</Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => console.log('today')}
                                className={` py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full ${dateSelected === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className=" flex-row items-center">
                                    <MaterialCommunityIcons name="chevron-double-right" size={24} color="black" />
                                    <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.later_this_week')}</Text>
                                </View>
                                <Text>Fri 13</Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => console.log('today')}
                                className={` py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full ${dateSelected === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className=" flex-row items-center">
                                    <FontAwesome5 name="couch" size={20} color="black" />
                                    <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.this_weekend')}</Text>
                                </View>
                                <Text>Sat 14</Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => console.log('today')}
                                className={` py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full ${dateSelected === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className=" flex-row items-center">
                                    <MaterialCommunityIcons name="calendar-end" size={24} color="black" />
                                    <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.next_week')}</Text>
                                </View>
                                <Text>Mon 16</Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => console.log('today')}
                                className={` py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full ${dateSelected === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className=" flex-row items-center">
                                    <MaterialCommunityIcons name="calendar-question" size={24} color="black" />
                                    <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.someday')}</Text>
                                </View>
                            </Pressable>
                            <Pressable 
                                onPress={() => setShowDatePicker(!showDatePicker)}
                                className={` py-1 px-2.5 ${dateSelected === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                            >
                                <View className="flex-row justify-between items-center w-full">
                                    <View className=" flex-row items-center">
                                        <MaterialCommunityIcons name="calendar-search" size={24} color="black" />                                        
                                        <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.pick_date')}</Text>
                                    </View>
                                    <Text>{dateSelected ? dateSelected.toLocaleDateString() : ''}</Text>
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
                                {showDatePicker && (
                                    <>
                                        {/* <Button 
                                            onPress={() => setShowTimePicker(!showTimePicker)}
                                            title="Pick a time"  
                                        />
                                        <DateTimePicker 
                                            mode='single'
                                            date={newTodo?.do_date}
                                            timePicker={showTimePicker}
                                            onChange={(params) => handleDate(params)}
                                        /> */}
                                        {/* <Button onPress={showDatepicker} title="Show date picker!" />
                                        <Button onPress={showTimepicker} title="Show time picker!" />
                                        <Text>selected: {date.toLocaleString()}</Text>
                                        {show && (

                                        <DateTimePicker
                                            testID="dateTimePicker"
                                            value={date}
                                            mode={mode}
                                            is24Hour={true}
                                            onChange={onChange}
                                        />
                                        )} */}
                                    </>
                                )}
                            </Pressable>
                        </View>
                        <Pressable 
                            onPress={() => setShowTimePicker(!showTimePicker)}
                            className='w-[360] rounded-[18px] mt-3.5 mb-5 py-3 px-5 bg-white shadow-sm border'
                        >
                            <View className="flex-row justify-between">
                                <Text className='text-base font-medium'>Time</Text>
                                <View className="flex-row items-center">
                                    <Text>{timeSelected ? timeSelected.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'}) : 'None'}</Text>
                                    <Entypo name={showTimePicker ? 'chevron-down' : 'chevron-right'} size={24} color="black" />
                                </View>
                            </View>
                            {showTimePicker && 
                                <View className="items-center space-y-4 mt-2 ">
                                    <View className=" mr-3">
                                        <DateTimePicker
                                            testID="timePicker"
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
                                </View>
                            }
                        </Pressable>
                        
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    )
}