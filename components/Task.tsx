import { Text, View, StyleSheet } from "react-native"
import { supabase } from "~/utils/supabase"
import { Database } from "~/utils/supabase-types"
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'
import { Button, Checkbox } from "tamagui"
import { Circle, Trash, CheckCircle } from '@tamagui/lucide-icons'
import { useTasks } from "~/providers/TasksProvider"
import { notion } from '~/utils/notion';

type Todo = Database['public']['Tables']['todos']['Row']

export default function Task ( task : Todo) {

    const { todos, setTodos } = useTasks()
    const databaseId = process.env.EXPO_PUBLIC_NOTION_DB_ID

    const toggleTodoStatus = async (id: number, is_complete: boolean) => {
        // console.log(id, is_complete)
        try {

        const { data: updatedTodo, error: todoError } = await supabase  
            .from('todos')
            .update({ is_complete: !is_complete})
            .eq('id', id)
            .select('*')
            .single()
    
        // console.log(updatedTodo.point_value)
        if(todoError) {
            console.log(todoError)
        }
        else {
            setTodos((todos ?? []).map(todo => (todo.id === id ? updatedTodo as Todo : todo as Todo)));

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
                    })
                    
                    // GET PAGE ID TO UPDATE STATUS TO DONE
                    const pageId = response.results[0].id

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
                        })
                        console.log(pageToUpdate)
                    }
                    else {
                        console.log('Page to update not found')
                    }
                })()
            }

        }

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
        console.log(error)
        }
    }

    const deleteTodo = async (id: number) => {
        const { error } = await supabase  
        .from('todos')
        .delete()
        .eq('id', id)

        if (error) {
            console.log(error)
        }
        else {
            setTodos((todos ?? []).filter((todo) => todo.id !== Number(id)))
            // delete todo in notion but need alert before
        }
    }
    
    const RightActions = (progress, dragX) => {
        return (
            <View style={styles.rightActionContainer}>
                <View style={styles.rightAction}>
                    <Button 
                    icon={<Trash size={'$2'} />}
                    color={'red'}
                    chromeless
                    onPress={() => deleteTodo(task.id)}
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
                        onPress={() => toggleTodoStatus(task.id, task.is_complete)}
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
        backgroundColor: 'lightblue',
        borderRadius: 25,
        marginHorizontal: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        shadowOffset: {
          width: 0,
          height: 4,
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
        borderRadius: 25,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        shadowOffset: {
          width: 0,
          height: 4,
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