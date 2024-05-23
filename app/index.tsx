import { Redirect } from "expo-router";
import { View, Text } from "react-native";

export default function HomeScreen() {
    return (
        <Redirect href={'/(auth)/login'} />
    )
}