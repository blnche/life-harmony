import { Button, Pressable, View, Text } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useState } from "react";
import { usePostHog } from "posthog-react-native";
import { useTranslation } from "react-i18next";

export default function Schedule () {

    // TOOLS  
    const posthog = usePostHog()
    const {t} = useTranslation()

    // DATE TIME PICKER 
    const [date, setDate] = useState(new Date(1598051730000));
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [dateSelected, setDateSelected] = useState('today')

    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePicker, setShowTimePicker] = useState(false)
    
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShow(false);
        setDate(currentDate);
        console.log(currentDate)
    };
    
    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };
    
    const showDatepicker = () => {
        showMode('date');
    };
    
      const showTimepicker = () => {
        showMode('time');
    };

    return (
        <View className="mt-3.5">
                            
                            <View className="items-start flex ">
                                <Pressable 
                                    onPress={() => console.log('today')}
                                    className={` py-1 px-2.5 mb-1.5 flex-row justify-between items-center w-full rounded-lg ${dateSelected === 'today' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
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
                                        <MaterialCommunityIcons name="arrow-collapse-right" size={24} color="black" />
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
                                        <FontAwesome5 name="couch" size={24} color="black" />
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
                                    className={` py-1 px-2.5 mb-3.5 ${dateSelected === 'low' ? 'border-[#548164] bg-[#EEF3ED]' : ''}`}
                                >
                                    <View className="flex-row justify-between items-center w-full">
                                        <View className=" flex-row items-center">
                                            <MaterialCommunityIcons name="calendar-search" size={24} color="black" />                                        
                                            <Text className='ml-3.5 text-base font-medium'>{t('newTask.schedule.pick_date')}</Text>
                                        </View>
                                        <Text>Selected date rendered</Text>
                                    </View>
                                    {show && (
                                        <>
                                            <DateTimePicker
                                                testID="dateTimePicker"
                                                value={date}
                                                mode='date'
                                                is24Hour={true}
                                                onChange={onChange}
                                            />
                                            <DateTimePicker
                                                testID="dateTimePicker"
                                                value={date}
                                                mode='time'
                                                is24Hour={true}
                                                onChange={onChange}
                                            />
                                        </>
                                    )}
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
                        </View>
    )
}