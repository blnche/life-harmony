import { Text, View, StyleSheet } from "react-native"
import { Database } from "~/utils/supabase-types"
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'
import { Button, Checkbox } from "tamagui"
import { Circle, Trash, CheckCircle } from '@tamagui/lucide-icons'



type Todo = Database['public']['Tables']['todos']['Row']

export default function Task ( task : Todo) {
    
    console.log(task)
    const RightActions = (progress, dragX) => {
        return (
            <View style={styles.rightActionContainer}>
                <View style={styles.rightAction}>
                    <Button 
                    icon={<Trash size={'$2'} />}
                    color={'red'}
                    chromeless
                    onPress={() => console.log('todo deleted')}
                    />
                </View>
                <View style={styles.rightAction}>
                    <Text style={styles.actionText}>Action 2</Text>
                </View>
            </View>
        )
    }

    const SwipeableRow = () => {
        const handleRightAction = () => {
            console.log('Right action triggered')
        }

        return (
            <Swipeable 
                renderRightActions={RightActions}
                onSwipeableOpen={handleRightAction}
            >
                <View style={styles.cardContainer}>
                    <View style={styles.cardContent}>
                        <Text style={styles.dueDate}>In 2 days</Text>
                        <Text style={styles.title}>{task.task}</Text>
                    </View>
                    {task && task.is_complete && (

                        <Button 
                        icon={<CheckCircle size={'$2'} />}
                        disabled
                        color={'black'}
                        chromeless
                        />
                    )}
                    {task && !task.is_complete && (

                        <Button 
                        icon={<Circle size={'$2'} />}
                        color={'black'}
                        chromeless
                        onPress={() => console.log('todo done')}
                        />
                    )}
                </View>
            </Swipeable>
        )
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <SwipeableRow />
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 350
    },
    rightActionContainer: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    rightAction: {
        backgroundColor: '#DEDEDE',
        borderRadius: 10,
        marginHorizontal: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        elevation: 3, // for Android
        minHeight: 100,
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'center'
    },
    cardContent: {

    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333333',
    },
    description: {
        fontSize: 16,
        color: '#666666',
    },
    dueDate: {
        fontSize: 14,
        marginTop: 10,
        color: '#999999',
    },
  });