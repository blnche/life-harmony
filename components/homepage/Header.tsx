import { View, Text, Pressable } from "react-native"
import EventsReminders from "./EventsReminders"
import { Database } from '~/utils/supabase-types'
import { useNavigation } from '@react-navigation/native';


import Ionicons from '@expo/vector-icons/Ionicons'
import { Entypo } from '@expo/vector-icons';

import * as Progress from 'react-native-progress'
import { Link } from "expo-router";

type Todo = Database['public']['Tables']['todos']['Row']



const Header = ({ t, progress, tasksLeft } : {t: (key: string) => string, progress : Number, tasksLeft : Todo[] }) => {
    const navigation = useNavigation();

    return (
        <View className="border-b pb-4 mb-3.5">
            <View className="flex-row justify-between items-center mb-6">
                <View className="absolute top-0 right-0 z-50">
                    {/* <Link href="/all_todos" asChild>
                        <Entypo name="archive" size={24} color="black" />
                    </Link> */}
                    <Pressable onPress={() => navigation.navigate('tasks_dashboards')}>
                        <Entypo name="archive" size={24} color="black" />
                    </Pressable>
                </View>
                <View className="w-52">
                    <View className="flex-row items-end">
                        <Text className="text-xl font-black mr-2">{t('homepage.today')}</Text>
                        <Text className="text-xs">{t('homepage.tomorrow')}</Text>
                    </View>
                    <View className="mt-2.5">
                        <Progress.Bar 
                            progress={progress}
                            width={200} 
                            unfilledColor="#E9E9E9"
                            borderWidth={0}
                            color="#7A7A7A"
                        />
                        <View className="flex-row justify-between w-[200] mt-1.5">
                            {/* <Entypo name="check" size={16} color="black" /> */}
                            <Ionicons name="checkmark-circle-outline" size={16} color="black" />
                            <Text className="text-xs">{tasksLeft} {t('homepage.tasks_progress.tasks_left')}</Text>
                        </View>
                    </View>
                </View>
                <View className="items-center w-2/5">
                    <Text className="text-xs">HH:MM</Text>
                    <Text className="text-base font-bold">01:15</Text>
                    <Text className="text-sm">{t('homepage.estimated_time')}</Text>
                </View>
            </View>
            <EventsReminders t={t}/>
        </View>
    )
}


export default Header