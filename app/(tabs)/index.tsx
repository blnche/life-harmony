import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native';
import { YStack, H2, Theme, XStack, Input, Button, Form } from 'tamagui';

import { supabase } from '../../utils/supabase';


import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {

  const [todos, setTodos] = useState<any[]>([])
  const [todo, setTodo] = useState()

  useEffect(() => {
      const getTodos = async () => {
        try {
          const { data: todos, error } = await supabase.from('todos').select();
          
          if (error) {
            console.error('Error fetching todos:', error.message);
            return;
          }
          
          console.log(todos)
          if (todos && todos.length > 0) {
            console.log(todos)
            setTodos(todos);
          }
        } catch (error) {
          console.error('Error fetching todos:', error.message);
        }
      };

      getTodos();
    
  }, [])

  // const todoDone = async () => {
  //   updateDoc(ref, {done: })
  // }
  
  const addTodo = async () => {
    const { error } = await supabase
    .from('todos')
    .insert({title: 'testing test'})
    
    console.log(error)

  }

  // const taskDone = (e : any) => {
  //   console.log(e._dispatchInstances.memoizedProps.children)
  // }


  return (
    <>
      <Stack.Screen options={{ title: 'Tasks' }} />
      <View style={styles.container}>
        {/* <ScreenContent path="app/(tabs)/index.tsx" title="Today's Tasks" /> */}
        {/* <Theme name="light">
          <YStack flex={1} alignItems="center" justifyContent="center">
            <H2>Today's Tasks</H2>
            {todos && todos.map((todo, index) => {
              return (
                <Text key={index} onPress={(e) => taskDone(e)}>{todo.title}</Text>
              )
            })}
            
              <XStack alignItems='center' space='$4' margin='$4'>
                <Input placeholder='New task...' value={todo.title} onChangeText={(text : string) => setTodo({...todo, title:text})}/>
                  <Button onPress={addNewTask}>Add</Button>
              </XStack>
          </YStack>
        </Theme> */}
        <FlatList 
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Text key={item.id}>{item.title}</Text>}
        />
        <Button onPress={addTodo}>Add</Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
