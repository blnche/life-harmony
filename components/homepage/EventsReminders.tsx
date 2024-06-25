import { View, Text } from "react-native"

const EventsReminders = ({ t }) => {

    return (
        <View className="flex-row justify-center">
            <View className="w-3/6">
                <View className="flex-row items-center">
                    <Text>Icon</Text>
                    <Text className="text-base font-black">{t('homepage.events_reminders.events')}</Text>
                </View>
                <View className="ml-2">
                    <Text className="text-base">Meeting</Text>
                    <Text className="text-xs">15:00</Text>
                </View>
            </View>
            <View className="w-3/6">
                <View className="flex-row items-center">
                    <Text>Icon</Text>
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