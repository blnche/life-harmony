import { View, Text } from "react-native"
import Ionicons from '@expo/vector-icons/Ionicons'
import { Entypo } from '@expo/vector-icons';

const EventsReminders = ({ t } : {t: (key: string) => string}) => {

    return (
        <View className="flex-row justify-center ml-1.5">
            <View className="w-3/6">
                <View className="flex-row items-center">
                    <Entypo name="calendar" size={16} color="black" />
                    <Text className="text-base font-black ml-2.5">{t('homepage.events_reminders.events')}</Text>
                </View>
                <View className="ml-[26px]">
                    <Text className="text-base">Meeting</Text>
                    <Text className="text-xs">15:00</Text>
                </View>
            </View>
            <View className="w-3/6">
                <View className="flex-row items-center">
                    <Entypo name="pin" size={16} color="black" />
                    <Text className="text-base font-black ml-2.5">{t('homepage.events_reminders.reminders')}</Text>
                </View>
                <View className="ml-[26px]">
                    <Text className="text-base">Amy's Birthday</Text>
                </View>
            </View>
        </View>
    )
}

export default EventsReminders