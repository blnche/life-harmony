import { Stack } from 'expo-router';
import { Button, FlatList, StyleSheet, View } from 'react-native';
import { ScreenContent } from '~/components/ScreenContent';
import { ListItem, Text } from 'tamagui';
import { useAuth } from '~/providers/AuthProvider';
import React, { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';

type Todo = {
  id: number
  task: string
  is_complete: boolean
  inserted_at: Date
  profile_user_id: string
}

export default function MainTabScreen() {

  const { user } = useAuth()
  const [todos, setTodos] = useState<Array<Todo>>([])
  const [newTodo, setNewTodo] = useState<string>('')

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    const { data: todos, error } = await supabase
    .from<Todo>('todos')
    .select('*')
    .order('id', {ascending: false})

    if (error) console.log('error', error)
    else setTodos(todos!)
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Tasks' }} />
      <View style={styles.container}>
        <Text>Tasks</Text>
        <FlatList 
          scrollEnabled={true}
          data={todos}
          keyExtractor={(item) => `${item.id}`}
          renderItem={({ item: todo }) => (
            
            <View
              style={[
                { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
              ]}
            >
              
              <Text>
                {todo.task}
              </Text>
            </View>
          )}
        />
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
