import { View, Text } from "react-native"
import Ionicons from '@expo/vector-icons/Ionicons'
import { Entypo } from '@expo/vector-icons';

const EventsReminders = ({ t }) => {

    return (
        <View className="flex-row justify-center">
            <View className="w-3/6">
                <View className="flex-row items-center">
                    {/* <Ionicons name="calendar-clear" size={16} color="black"/> */}
                    <Entypo name="calendar" size={16} color="black" />
                    <Text className="text-base font-black">{t('homepage.events_reminders.events')}</Text>
                </View>
                <View className="ml-2">
                    <Text className="text-base">Meeting</Text>
                    <Text className="text-xs">15:00</Text>
                </View>
            </View>
            <View className="w-3/6">
                <View className="flex-row items-center">
                    {/* <Ionicons name="pin-sharp" size={16} color="black"/> */}
                    <Entypo name="pin" size={16} color="black" />
                    <Text className="text-base font-black">{t('homepage.events_reminders.reminders')}</Text>
                </View>
                <View className="ml-2">
                    <Text className="text-base">Amy's Birthday</Text>
                </View>
            </View>
        </View>
    )
}

export default EventsReminders