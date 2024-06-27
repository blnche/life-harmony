import { Text, View, StyleSheet, Alert, Button, Pressable } from "react-native";
import { supabase } from "~/utils/supabase";
import { Database } from "~/utils/supabase-types";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
// import { Button, Checkbox } from "tamagui"
// import { Circle, Trash, CheckCircle } from '@tamagui/lucide-icons'
import { useTasks } from "~/providers/TasksProvider";
import { notion } from '~/utils/notion';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';


import Ionicons from '@expo/vector-icons/Ionicons'
import { Entypo } from '@expo/vector-icons';

type Todo = Database['public']['Tables']['todos']['Row'];

export default function Task ( task : Todo) {

    if(task.do_date) {

        // GET NEXT TRIGGER DATE
        const getNextTriggerDate = async () => {
            const trigger = {
                seconds: (new Date(task.do_date!).getTime() - new Date().getTime()) / 1000,
                repeats: false
            };
            // console.log(trigger.seconds);
            if(trigger.seconds > 0) {

                try {
                    const nextTriggerDate = await Notifications.getNextTriggerDateAsync(trigger)
            
                    if(nextTriggerDate) {
                        // IF PREVIOUSLY A NOTIFICATION WAS SET ITS CANCELLED
                        await Notifications.cancelAllScheduledNotificationsAsync()
    
                        // SET DO DATE NOTIFICATION
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: 'Next task :',
                                body: task.task,
                            },
                            trigger: trigger,
                        });
                        console.log(`(${task.task}) Notification scheduled for : ${new Date(nextTriggerDate).toLocaleString()}`)
                    }
                    else {
                        console.log(`(${task.task}) Notification will not be triggered.`)
                    }
                } catch (error) {
                    console.log(`(${task.task}) Couldn't calculate next trigger date : ${error}`)
                }
            } else {
                // console.log(`(${task.task}) Task do date is overdue.`);
            };
    
        }
        getNextTriggerDate();
    }
    else {
        // console.log(`No do date for this task : ${task.task}`);
    }


    const { todos, setTodos } = useTasks();
    const databaseId = process.env.EXPO_PUBLIC_NOTION_DB_ID;

    const toggleTodoStatus = async (id: number, is_complete: boolean) => {
        // console.log(id, is_complete)
        const now = new Date().toISOString();

        try {

            const { data: updatedTodo, error: todoError } = await supabase  
                .from('todos')
                .update({ 
                    is_complete: !is_complete,
                    last_edited_at: now
                })
                .eq('id', id)
                .select('*')
                .single()
                ;
            // console.log(updatedTodo.point_value)
            if(todoError) {
                console.log(todoError)
            }
            else {
                setTodos((todos ?? []).map(todo => (todo.id === id ? updatedTodo as Todo : todo as Todo)));
                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  );
                // UPDATE STATUS IN NOTION DB
                if(databaseId) {

                    (async () => {
                        const response = await notion.databases.query({
                            database_id: databaseId,
                            filter: {
                                property: 'LH_id',
                                number: {
                                    equals: updatedTodo.id
                                }
                            }
                        });
                        
                        // GET PAGE ID TO UPDATE STATUS TO DONE
                        const pageId = response.results[0].id;

                        if(pageId) {
                            const pageToUpdate = await notion.pages.update({
                                page_id: pageId,
                                properties: {
                                    'Status': {
                                        status : {
                                            name: 'Done'
                                        }
                                    }
                                }
                            });
                            // console.log(pageToUpdate);
                        }
                        else {
                            console.log('Page to update not found');
                        }
                    })()
                }

            };

            // const { data: profile, error: profileError } = await supabase
            //   .from('profiles')
            //   .update({ points: updatedTodo.point_value})
            //   .eq('id', userProfile?.id)
            //   .select<Profile>('*')
            //   .single()

            //   if(profileError) {
            //     console.log(profileError)
            //   } 
            //   else {
            //     console.log(profile)
            //   }
        } catch (error) {
        console.log(error);
        };
    };

    const deleteButtonsAlert = () => {
        Alert.alert('This task will be deleted from your Notion workspace as well.', 'You can modify this action in your profile settings.', [
            {
                text:'Cancel',
                onPress: () => console.log('cancel pressed')
            },
            {
                text: 'Yes', 
                onPress: () => deleteTodo(task.id)
            }
        ]);
    } ;
    const deleteTodo = async (id : number) => {
        const { error } = await supabase  
        .from('todos')
        .delete()
        .eq('id', id)
;
        if (error) {
            console.log(error);
        }
        else {
            setTodos((todos ?? []).filter((todo) => todo.id !== Number(id)));
            // delete todo in notion but need alert before
            if(databaseId) {

                (async () => {
                    const response = await notion.databases.query({
                        database_id: databaseId,
                        filter: {
                            property: 'LH_id',
                            number: {
                                equals: id
                            }
                        }
                    });
                    
                    // GET PAGE ID TO UPDATE ARCHIVED TO TRUE
                    const pageId = response.results[0].id;

                    if(pageId) {
                        const pageToUpdate = await notion.pages.update({
                            page_id: pageId,
                            archived: true
                        });
                        // console.log(pageToUpdate);
                    }
                    else {
                        console.log('Page to update not found')
                    };
                })();
            };

        };
    };
    
    const RightActions = (progress, dragX) => {
        return (
            <View style={styles.rightActionContainer}>
                <View style={styles.rightAction}>
                    <Button 
                    color={'red'}
                    onPress={() => deleteButtonsAlert()}
                    title="Delete"
                    />
                </View>
                <View style={styles.rightAction}>
                    <Text style={styles.actionText}>Action 2</Text>
                </View>
            </View>
        );
    };
   
    const SwipeableRow = () => {
        const handleRightAction = () => {
            // console.log('Right action triggered');
        };

        return (
            <Swipeable 
                renderRightActions={RightActions}
                onSwipeableOpen={handleRightAction}
            >
                <View className="max-w-[360] min-h-[55] rounded-[18px] mb-5 px-5 bg-white flex-row justify-between items-center shadow-sm">
                    <View className="flex-row items-center">
                        {task && task.is_complete && (
                            <>
                                <Pressable 
                                disabled
                                >
                                    <Ionicons name="checkmark-circle" size={24} color="black" /> 
                                </Pressable>
                            </>
                        )}
                        {task && !task.is_complete && (
                            <>
                                <Pressable 
                                disabled
                                onPress={() => toggleTodoStatus(task.id, task.is_complete)}
                                >
                                    <Entypo name="circle" size={24} color="black" />
                                </Pressable>
                            </>
                        )}
                        <View className="ml-3">
                            {task.do_date && <Text className="text-xs">{task.do_date}</Text>}
                            <Text className="text-base w-[245]">{task.task}</Text>
                        </View>
                    </View>
                    {!task.is_complete && <Entypo name="controller-play" size={24} color="black" />}
                </View>
            </Swipeable>
        );
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <SwipeableRow />
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    // container: {
    //     width: 350
    // },
    // rightActionContainer: {
    //     flexDirection: 'row',
    //     marginLeft: 10,
    // },
    // rightAction: {
    //     backgroundColor: 'lightblue',
    //     borderRadius: 25,
    //     marginHorizontal: 5,
    //     marginBottom: 10,
    //     paddingHorizontal: 10,
    //     paddingVertical: 5,
    //     shadowColor: '#000000',
    //     shadowOpacity: 0.1,
    //     shadowRadius: 3,
    //     shadowOffset: {
    //       width: 0,
    //       height: 4,
    //     },
    //     justifyContent: 'center',
    //     alignItems: 'center'
    // },
    // actionText: {
    //     color: 'white',
    //     fontWeight: 'bold',
    //     fontSize: 16,
    // },
    // cardContainer: {
    //     backgroundColor: '#FFFFFF',
    //     borderRadius: 25,
    //     padding: 15,
    //     marginBottom: 10,
    //     shadowColor: '#000000',
    //     shadowOpacity: 0.1,
    //     shadowRadius: 3,
    //     shadowOffset: {
    //       width: 0,
    //       height: 4,
    //     },
    //     elevation: 3, // for Android
    //     minHeight: 100,
    //     flexDirection: 'row',
    //     justifyContent:'space-between',
    //     alignItems: 'center'
    // },
    // cardContent: {

    // },
    // title: {
    //     fontSize: 18,
    //     fontWeight: 'bold',
    //     marginBottom: 5,
    //     color: '#333333',
    // },
    // description: {
    //     fontSize: 16,
    //     color: '#666666',
    // },
    // dueDate: {
    //     fontSize: 14,
    //     marginTop: 10,
    //     color: '#999999',
    // },
  });