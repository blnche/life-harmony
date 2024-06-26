import { View, Text } from "react-native"
import EventsReminders from "./EventsReminders"
import Ionicons from '@expo/vector-icons/Ionicons'
import { Entypo } from '@expo/vector-icons';


const Header = ({ t }) => (
    <View className="border-b pb-4 mb-4">
        <View className="flex-row justify-between items-center mb-4">
            <View className="w-3/6">
                <View className="flex-row items-end">
                    <Text className="text-xl font-black mr-2">{t('homepage.today')}</Text>
                    <Text className="text-xs">{t('homepage.tomorrow')}</Text>
                </View>
                <View>
                    <Text>Task bar</Text>
                    <View className="flex-row justify-between">
                        {/* <Entypo name="check" size={16} color="black" /> */}
                        <Ionicons name="checkmark-circle-outline" size={16} color="black" />
                        <Text className="text-xs">6 {t('homepage.tasks_progress.tasks_left')}</Text>
                    </View>
                </View>
            </View>
            <View className="items-center w-3/6">
                <Text className="text-xs">HH:MM</Text>
                <Text className="text-base font-bold">01:15</Text>
                <Text className="text-sm">{t('homepage.estimated_time')}</Text>
            </View>
        </View>
        <EventsReminders t={t}/>
    </View>
)

export default Header